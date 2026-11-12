import { GoogleGenAI } from '@google/genai';
import {
  EngineeringAssignment,
  AssignmentType,
  AssignmentSection,
  AssignmentLanguage,
  AssignmentDetailLevel,
  AssignmentCoverPage,
} from '../src/types';
import { callGeminiWithResilience } from './explainService';

export interface GenerateAssignmentParams {
  type: AssignmentType;
  subject: string;
  title: string;
  studentName: string;
  studentId?: string;
  professorName: string;
  university: string;
  college?: string;
  major: string;
  studyLevel: string;
  pageCountTarget: number;
  submissionDate: string;
  language: AssignmentLanguage;
  detailLevel: AssignmentDetailLevel;
  customRequirements?: string;
}

import { ASSIGNMENT_TYPES_INFO } from '../src/data/assignmentConstants';
export { ASSIGNMENT_TYPES_INFO };

export async function generateEngineeringAssignment(
  params: GenerateAssignmentParams
): Promise<EngineeringAssignment> {
  const typeInfo = ASSIGNMENT_TYPES_INFO[params.type] || ASSIGNMENT_TYPES_INFO.custom;
  const apiKey = process.env.GEMINI_API_KEY;

  const assignmentId = 'asgn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const cover: AssignmentCoverPage = {
    university: params.university || 'الجامعة الإماراتية الدولية – صنعاء',
    college: params.college || 'كلية الهندسة وتكنولوجيا المعلومات',
    major: params.major || 'هندسة الميكاترونكس',
    subject: params.subject || 'هندسة ميكاترونكس',
    assignmentTitle: params.title || 'تكليف هندسي متقدم',
    assignmentTypeLabel: typeInfo.label,
    studentName: params.studentName || 'مهندس ميكاترونكس',
    studentId: params.studentId || '',
    professorName: params.professorName || 'دكتور المادة المحترم',
    studyLevel: params.studyLevel || 'السنة الأولى',
    submissionDate: params.submissionDate || new Date().toISOString().split('T')[0],
    academicYear: '2025 - 2026',
  };

  // Try AI generation if API key is present
  if (apiKey) {
    try {
      const client = new GoogleGenAI({ apiKey });

      const systemPrompt = `أنت بروفيسور ومهندس استشاري رائد في هندسة الميكاترونكس وهندسة النظم.
مهمتك إنشاء تكليف/تقرير أكاديمي هندسي احترافي متكامل جاهز للطباعة والتسليم للجامعة.
يجب أن يكون المحتوى باللغة المطلوبة (${params.language === 'en' ? 'الإنجليزية English' : 'العربية مع المصطلحات الإنجليزية القياسية'}).
يجب أن يناسب مستوى التفصيل المطلوب (${params.detailLevel}) والمادة (${params.subject}) ونوع التكليف (${typeInfo.label}).
لا تستخدم قالباً ثابتاً عاماً، بل صيغ كل قسم بعمق هندسي فائق، متضمناً:
- شروحات علمية دقيقة.
- معادلات هندسية ورموز رياضية صحيحة مع تحديد المعطيات ووحدات القياس (SI Units).
- إذا كان هناك كود برمجيا (Arduino, Python, C++, PLC Ladder Logic)، فاكتب الكود كاملاً ومنظماً مع التعليقات التفصيلية.
- إذا كانت هناك تجربة مختبر أو دوائر كهربائية، قم بتضمين جداول للنتائج والقياسات وحسابات نسبة الخطأ (Percentage Error).
- استخدم علامات الترقيم والأرقام والقوائم النقطية لتسهيل القراءة وتنسيق الطباعة.

المطلوب إرجاع مخرجات بصيغة JSON حصراً على الشكل التالي:
{
  "assignmentTitle": "العنوان الدقيق المعبر",
  "sections": [
    {
      "id": "sec-1",
      "title": "عنوان القسم",
      "type": "text | code | table | formula | circuit | components",
      "content": "المحتوى التفصيلي بأسلوب منظم غني بالمعلومات الهندسية والمعادلات والنقاط",
      "codeLanguage": "cpp | python | ladder (اختياري)",
      "tableData": { "headers": ["العمود 1", "العمود 2"], "rows": [["قيمة 1", "قيمة 2"]] } (اختياري إذا كان القسم جدولاً),
      "formulaLatex": "صيغة رياضية لاتك إن وجدت"
    }
  ]
}`;

      const userPrompt = `بيانات التكليف المطلوب إنشاؤه:
- نوع التكليف: ${typeInfo.label} (${params.type})
- المادة الدراسية: ${params.subject}
- عنوان التكليف: ${params.title}
- اسم الطالب: ${params.studentName}
- اسم الدكتور: ${params.professorName}
- الجامعة / الكلية: ${params.university} - ${params.college || ''}
- التخصص والمستوى: ${params.major} - ${params.studyLevel}
- عدد الصفحات المستهدف: ${params.pageCountTarget} صفحة
- مستوى التفصيل: ${params.detailLevel}
- اللغة المطلوبة: ${params.language === 'en' ? 'الإنجليزية' : 'العربية'}
${params.customRequirements ? `- متطلبات إضافية من الطالب: ${params.customRequirements}` : ''}

الأقسام النموذجية المقترحة لهذا النوع:
${typeInfo.defaultSections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

قم الآن بإنشاء التكليف كاملاً بأقسامه الهندسية الاحترافية والتفاصيل الرياضية والبرمجية بصيغة JSON الصالحة.`;

      const aiResponse = await callGeminiWithResilience(client, {
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.25,
        },
        preferredModel: 'gemini-3.1-flash-lite',
      });

      const parsed = JSON.parse(aiResponse.text);
      if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        const sections: AssignmentSection[] = parsed.sections.map((sec: any, idx: number) => ({
          id: sec.id || `sec-${idx + 1}`,
          title: sec.title || `القسم ${idx + 1}`,
          type: sec.type || 'text',
          content: sec.content || '',
          codeLanguage: sec.codeLanguage,
          tableData: sec.tableData,
          formulaLatex: sec.formulaLatex,
        }));

        return {
          id: assignmentId,
          createdAt: now,
          updatedAt: now,
          type: params.type,
          typeLabel: typeInfo.label,
          subject: params.subject,
          title: parsed.assignmentTitle || params.title,
          pageCountTarget: params.pageCountTarget,
          language: params.language,
          detailLevel: params.detailLevel,
          cover: {
            ...cover,
            assignmentTitle: parsed.assignmentTitle || params.title,
          },
          sections,
          isAiGenerated: true,
          modelUsed: aiResponse.modelUsed,
        };
      }
    } catch (error: any) {
      console.warn('Gemini assignment generation failed, falling back to rich engineering template:', error?.message);
    }
  }

  // Fallback high-quality template generation based on specific assignment type
  const fallbackSections = buildRichFallbackSections(params, typeInfo);
  return {
    id: assignmentId,
    createdAt: now,
    updatedAt: now,
    type: params.type,
    typeLabel: typeInfo.label,
    subject: params.subject,
    title: params.title,
    pageCountTarget: params.pageCountTarget,
    language: params.language,
    detailLevel: params.detailLevel,
    cover,
    sections: fallbackSections,
    isAiGenerated: false,
  };
}

function buildRichFallbackSections(
  params: GenerateAssignmentParams,
  typeInfo: { label: string; defaultSections: string[] }
): AssignmentSection[] {
  const isEn = params.language === 'en';

  if (params.type === 'lab_report') {
    return [
      {
        id: 'sec-1',
        title: isEn ? '1. Experiment Title & Objectives' : '1. عنوان التجربة والأهداف',
        type: 'text',
        content: isEn
          ? `The main objective of this experiment on "${params.title}" in ${params.subject} is to verify theoretical principles through empirical measurements, calculate component characteristics, and evaluate system response under varying conditions.`
          : `الهدف الرئيسي من هذه التجربة في مادة ${params.subject} بعنوان "${params.title}" هو التحقق عملياً من القوانين النظرية الحاكمة، ورصد سلوك المنظومة تحت ظروف التشغيل المختلفة، ومقارنة القياسات المعملية بالحسابات النظرية الدقيقة.`,
      },
      {
        id: 'sec-2',
        title: isEn ? '2. Apparatus & Components' : '2. الأدوات والمكونات المستخدمة (Apparatus)',
        type: 'components',
        content: isEn
          ? `- Regulated DC Power Supply (0-30V / 5A)\n- Digital Storage Oscilloscope (DSO 100MHz)\n- True-RMS Digital Multimeters (Keysight/Fluke)\n- Breadboard and High-Grade Jumper Wires\n- Precision Resistors, Capacitors, and Inductors\n- Semiconductor Transistors / Operational Amplifiers (Op-Amp LM741 / TL082)`
          : `- وحدة تزويد قدرة مستمرة منظمة (DC Power Supply 0-30V, 5A)\n- راسم إشارة رقمي عالي الدقة (Digital Storage Oscilloscope 100MHz)\n- أجهزة قياس رقمية متعددة (Digital Multimeters True-RMS)\n- لوحة توصيل وتجارب (Breadboard) وأسلاك توصيل نحاسية عالية التوصيل\n- مقاومات كربونية ومكثفات ومحثات دقيقة (1% Tolerance)\n- عناصر إلكترونية نصف ناقلة ومكبرات عمليات (Op-Amps LM741 / TL082)`,
      },
      {
        id: 'sec-3',
        title: isEn ? '3. Theoretical Background & Governing Equations' : '3. النظرية والمعادلات الرياضية (Theory)',
        type: 'formula',
        content: isEn
          ? `The experiment relies on fundamental laws of electrical and mechatronics engineering:\n\n1. Ohm's Law: V = I · R\n2. Kirchhoff's Voltage Law (KVL): Σ V_loop = 0\n3. Kirchhoff's Current Law (KCL): Σ I_in = Σ I_out\n4. Power Dissipation: P = V · I = I² · R`
          : `تستند هذه التجربة إلى القوانين الهندسية الأساسية في مادة ${params.subject}:\n\n1. قانون أوم للدوائر: V = I × R\n2. قانون كيرشوف للجهد (KVL): المجموع الجبري لفروق الجهد عبر أي مسار مغلق يساوي صفراً (Σ V = 0).\n3. قانون كيرشوف للتيار (KCL): مجموع التيارات الداخلة إلى العقدة يساوي مجموع التيارات الخارجة منها (Σ I_in = Σ I_out).\n4. القدرة الكهربائية المبددة: P = V × I = I² × R [Watt].`,
      },
      {
        id: 'sec-4',
        title: isEn ? '4. Circuit Schematic & Setup' : '4. مخطط الدائرة وطريقة التوصيل (Circuit Setup)',
        type: 'circuit',
        content: isEn
          ? `The circuit was assembled as shown in the laboratory manual. The power supply was connected in series with the current sensing resistor, while differential probes were placed across nodes A and B to capture transient response.`
          : `تم توصيل عناصر الدائرة الكهربائية/الميكانيكية وفق المخطط القياسي. تم ضبط مصدر الجهد، وتوصيل جهاز قياس التيار (الأميتر) على التوالي مع الحمل، بينما رُبط جهاز قياس الجهد (الفولتميتر) على التوازي لضمان دقة الرصد وعدم التأثير على مقاومة الدائرة الداخلية.`,
      },
      {
        id: 'sec-5',
        title: isEn ? '5. Experimental Measurements & Data' : '5. جدول القياسات والنتائج المعملية (Data Table)',
        type: 'table',
        tableData: {
          headers: ['رقم المحاولة (Run)', 'الجهد المدخل Vin (V)', 'التيار المقاس I (mA)', 'الجهد المقاس Vout (V)', 'القدرة P (mW)'],
          rows: [
            ['1', '2.0', '4.02', '1.98', '7.96'],
            ['2', '4.0', '8.10', '3.97', '32.15'],
            ['3', '6.0', '12.05', '5.96', '71.82'],
            ['4', '8.0', '16.12', '7.95', '128.15'],
            ['5', '10.0', '20.08', '9.94', '199.59'],
          ],
        },
        content: 'يوضح الجدول أعلاه القراءات المسجلة عملياً في المختبر عند تغير الجهد وتأثيره المباشر على سحب التيار وتشتت القدرة.',
      },
      {
        id: 'sec-6',
        title: isEn ? '6. Error Analysis & Discussion' : '6. حساب نسبة الخطأ والمناقشة العلمية',
        type: 'text',
        content: isEn
          ? `Percentage Error Calculation:\n% Error = (|Theoretical - Experimental| / Theoretical) × 100%\n\nThe maximum deviation was recorded at 1.8%, which falls well within acceptable engineering tolerances (< 5%). Minor discrepancies are attributed to resistor tolerances, contact resistance on the breadboard, and digital multimeter internal impedance.`
          : `حساب نسبة الخطأ المئوية:\nنسبة الخطأ = (|القيمة النظرية - القيمة العملية| ÷ القيمة النظرية) × 100%\n\nبلغت أقصى نسبة خطأ مسجلة 1.8%، وهي نسبة ممتازة تقع ضمن الحدود المسموح بها هندسياً (أقل من 5%). تعود أسباب الانحراف الطفيف إلى نسبة التفاوت التصنيعي للمقاومات (Tolerance ±5%)، ومقاومة التلامس لأسلاك التوصيل، والمقاومة الداخلية لأجهزة القياس المستخدمة.`,
      },
      {
        id: 'sec-7',
        title: isEn ? '7. Conclusion & References' : '7. الخلاصة والمراجع الأكاديمية (Conclusion)',
        type: 'text',
        content: isEn
          ? `Conclusion:\nThe experimental results successfully verified the core engineering principles of ${params.subject}. The relationship between system variables matched theoretical models closely.\n\nReferences:\n1. Boylestad, R. L. "Introductory Circuit Analysis", 13th Edition.\n2. Mechatronics: Electronic Control Systems in Mechanical and Electrical Engineering by W. Bolton.`
          : `الخلاصة:\nأثبتت النتائج المعملية صحة النموذج الرياضي والتطبيقي المدروس في تجربة "${params.title}". حققت المنظومة الاستجابة المطلوبة وتطابقت المنحنيات مع التوقعات النظرية.\n\nالمراجع الأكاديمية:\n1. كتاب الدوائر الكهربائية لروبرت بويليستاد (Introductory Circuit Analysis, 13th Ed).\n2. هندسة الميكاترونكس - أنظمة التحكم الإلكتروني في الهندسة الميكانيكية، وليم بولتون (W. Bolton).`,
      },
    ];
  }

  if (params.type === 'arduino') {
    return [
      {
        id: 'sec-1',
        title: '1. فكرة المشروع والهدف الهندسي',
        type: 'text',
        content: `يهدف هذا المشروع المعتمد على متحكم الآردوينو (Arduino Microcontroller) إلى تصميم وبناء نظام ميكاتروني ذكي لموضوع "${params.title}" ضمن مادة ${params.subject}. يقوم النظام بقراءة بيانات الحساسات البيئية أو الميكانيكية، ومعالجتها في الوقت الحقيقي (Real-Time Processing)، ثم قيادة المشغلات (Actuators) لتحقيق التحكم الآلي المغلق.`,
      },
      {
        id: 'sec-2',
        title: '2. قائمة المكونات والأدوات (Bill of Materials)',
        type: 'components',
        content: `- متحكم آردوينو (Arduino Uno R3 / Mega 2560)\n- مستشعر المسافة فوق الصوتي (HC-SR04 Ultrasonic Sensor)\n- محرك خطوي مع دارة القيادة (Stepper Motor 28BYJ-48 with ULN2003 Driver)\n- شاشة عرض كريستالية (I2C LCD 16x2 Display)\n- أزرار ضاغطة ومقاومات سحب للأعلى (Push buttons with Pull-up Resistors)\n- جرس تنبيه طنان (Buzzer 5V) وصمامات مشعة للضوء (RGB LEDs)\n- لوحة توصيل وأسلاك ذكر/أنثى ومصدر تغذية خارجي 9V`,
      },
      {
        id: 'sec-3',
        title: '3. مخطط التوصيل التوضيحي (Wiring & Pinout)',
        type: 'circuit',
        content: `جدول التوصيل بين لوحة الآردوينو والمكونات:\n- منفذ VCC و GND لجميع الحساسات -> خطوط 5V و GND للوحة.\n- حساس المسافة HC-SR04: منفذ Trigger متصل بالمنفذ الرقمي D9، ومنفذ Echo متصل بالمنفذ الرقمي D10.\n- شاشة LCD I2C: منفذ SDA متصل بالمنفذ التناظري A4، ومنفذ SCL متصل بالمنفذ A5.\n- مشغل المحرك: المداخل IN1..IN4 متصلة بالمنافذ الرقمية D4, D5, D6, D7.`,
      },
      {
        id: 'sec-4',
        title: '4. الكود البرمجي الكامل (Arduino C++ Source Code)',
        type: 'code',
        codeLanguage: 'cpp',
        content: `/*
 * مشروع ميكاترونكس متكامل: ${params.title}
 * الطالب: ${params.studentName}
 * المادة: ${params.subject}
 */

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int BUZZER_PIN = 8;
const int MOTOR_PIN = 6;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(MOTOR_PIN, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("System Starting");
  delay(1000);
  lcd.clear();
}

void loop() {
  // إرسال نبضة الموجات فوق الصوتية
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // حساب زمن الارتداد وحساب المسافة بالسنتيمتر
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * 0.034 / 2.0;

  // طباعة القراءات على الشاشة
  lcd.setCursor(0, 0);
  lcd.print("Dist: ");
  lcd.print(distanceCm, 1);
  lcd.print(" cm   ");

  // منطق التحكم الآلي (Feedback Control)
  if (distanceCm < 15.0 && distanceCm > 0) {
    digitalWrite(BUZZER_PIN, HIGH);
    analogWrite(MOTOR_PIN, 200); // تشغيل المشغل بسرعة محددة
    lcd.setCursor(0, 1);
    lcd.print("State: ACTIVE   ");
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    analogWrite(MOTOR_PIN, 0);
    lcd.setCursor(0, 1);
    lcd.print("State: IDLE     ");
  }

  delay(100);
}`,
      },
      {
        id: 'sec-5',
        title: '5. شرح الكود البرمجي وطريقة الاختبار',
        type: 'text',
        content: `1. تم استخدام مكتبة LiquidCrystal_I2C لتوفير منافذ الآردوينو والاعتماد على بروتوكول I2C (منفذي A4 و A5).\n2. الدالة pulseIn تقيس زمن ارتداد الموجة بالميكروثانية، ثم تضرب في سرعة الصوت (0.034 cm/us) مقسومة على 2 لحساب مسافة الذهاب والإياب.\n3. تم اختبار المنظومة باختبارات تدريجية في المختبر وأظهرت زمناً استجابياً لا يتعدى 120ms مع استقرار تام لمنظومة التغذية الراجعة.`,
      },
      {
        id: 'sec-6',
        title: '6. المشاكل والحلول والتطوير المستقبلي',
        type: 'text',
        content: `- التحدي الأول: تذبذب قراءات الحساس نتيجة الضوضاء الصوتية. الحل: إضافة مرشح برمجي متحرك (Moving Average Filter).\n- التحدي الثاني: هبوط الجهد عند إقلاع المحرك. الحل: فصل تغذية المحرك بمصدر طاقة خارجي مستقل مع توحيد الأرضي (Common Ground).\n- التطوير المستقبلي: ربط النظام بإنترنت الأشياء (IoT) باستخدام شريحة ESP32 لإرسال القياسات إلى لوحة تحكم سحابية.`,
      },
    ];
  }

  if (params.type === 'problem_solving') {
    return [
      {
        id: 'sec-1',
        title: '1. نص المسألة الهندسية والوصف الفيزيائي',
        type: 'text',
        content: `مسألة تطبيقية في مادة ${params.subject} حول "${params.title}":\nاحسب المتغيرات الميكانيكية والكهربائية لمنظومة ميكاترونية متزنة، مع تحديد ردود الأفعال وجهد التشغيل والقدرة المستهلكة بدقة مع مراعاة معامل الأمان (Safety Factor).`,
      },
      {
        id: 'sec-2',
        title: '2. المعطيات والمطلوب (Given & Required)',
        type: 'text',
        content: `المعطيات المعلومة (Given Data):\n- القوة المؤثرة F = 250 N\n- ذراع العزم L = 0.45 m\n- جهد المصدر V = 24 V DC\n- مقاومة الملف الداخلي R = 6 Ω\n- كفاءة المنظومة الميكانيكية η = 85%\n\nالمطلوب إيجاده (Required):\n1. عزم الدوران المؤثر τ (Torque).\n2. شدة التيار المار في الملف I (Current).\n3. القدرة الميكانيكية والكهربائية الخارجة P_out.\n4. معامل الأمان والتأكد من عدم تجاوز درجات الحرارة.`,
      },
      {
        id: 'sec-3',
        title: '3. القوانين والمعادلات الحاكمة (Governing Equations)',
        type: 'formula',
        content: `1. قانون عزم الدوران:\n   τ = F × L × sin(θ) [N·m]\n\n2. قانون التيار الكهربائي:\n   I = V / R [A]\n\n3. القدرة الكهربائية المدخلة:\n   P_in = V × I [W]\n\n4. القدرة الميكانيكية المفيدة:\n   P_out = P_in × η [W]`,
      },
      {
        id: 'sec-4',
        title: '4. خطوات التعويض والحل التفصيلي (Step-by-Step Solution)',
        type: 'text',
        content: `الخطوة الأولى: حساب عزم الدوران:\nτ = 250 N × 0.45 m × sin(90°)\nτ = 112.5 N·m\n\nالخطوة الثانية: حساب التيار المسحوب:\nI = 24 V / 6 Ω = 4.0 A\n\nالخطوة الثالثة: حساب القدرة الكهربائية المدخلة:\nP_in = 24 V × 4.0 A = 96.0 Watt\n\nالخطوة الرابعة: حساب القدرة الميكانيكية الناتجة:\nP_out = 96.0 W × 0.85 = 81.6 Watt\n\nالخطوة الخامسة: حساب القدرة المفقودة كحرارة:\nP_loss = P_in - P_out = 14.4 Watt`,
      },
      {
        id: 'sec-5',
        title: '5. جدول النتائج النهائية ووحدات القياس',
        type: 'table',
        tableData: {
          headers: ['المتغير الهندسي', 'الرمز', 'القيمة المحسوبة', 'وحدة القياس الدولية (SI)', 'الحالة الهندسية'],
          rows: [
            ['عزم الدوران', 'τ', '112.5', 'N·m (نيوتن.متر)', 'ضمن النطاق الآمن'],
            ['شدة التيار', 'I', '4.0', 'A (أمبير)', 'مطابق لمواصفات السلك'],
            ['القدرة المدخلة', 'P_in', '96.0', 'W (واط)', 'ضمن قدرة المزود'],
            ['القدرة الميكانيكية', 'P_out', '81.6', 'W (واط)', 'تحقق المتطلبات الوظيفية'],
            ['القدرة المفقودة', 'P_loss', '14.4', 'W (واط)', 'لا تتطلب تبريداً قسرياً'],
          ],
        },
        content: 'يوضح الجدول أعلاه ملخص القيم الرقمية المستنتجة ووحداتها النظامية.',
      },
      {
        id: 'sec-6',
        title: '6. التفسير الهندسي للنتيجة وملاحظات التصميم',
        type: 'text',
        content: `التفسير الهندسي:\nتظهر النتائج أن المنظومة تعمل في منطقة كفاءة عالية (85%). الفقد الحراري المحدود بـ 14.4 واط يمكن تبديده عبر جسم المحرك دون الحاجة لمشتتات حرارية إضافية، مما يجعل التصميم مدمجاً واقتصادياً وموثوقاً لبيئات العمل الصناعية.`,
      },
    ];
  }

  // General default sections for other types
  return typeInfo.defaultSections.map((title, idx) => ({
    id: `sec-${idx + 1}`,
    title: `${idx + 1}. ${title}`,
    type: 'text',
    content: isEn
      ? `Detailed technical content for "${title}" regarding "${params.title}" in ${params.subject}. This section comprehensively covers the engineering fundamentals, theoretical models, practical implementations, and scientific standards expected for student submissions at ${params.university}.`
      : `المحتوى الهندسي التخصصي لقسم "${title}" في موضوع "${params.title}" لمادة ${params.subject}. يتناول هذا القسم بالتفصيل التحليل الهندسي، الحسابات الدقيقة، المتطلبات الوظيفية، والتوصيات الأكاديمية المعتمدة وفق مناهج ${params.university}.`,
  }));
}

export async function refineAssignmentSectionWithAi(params: {
  sectionTitle: string;
  currentContent: string;
  instructionType:
    | 'rephrase'
    | 'simplify'
    | 'expand'
    | 'shorten'
    | 'fix_errors'
    | 'make_academic'
    | 'translate_ar'
    | 'translate_en';
  subject?: string;
  major?: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not available');
  }

  const client = new GoogleGenAI({ apiKey });

  const instructionMap: Record<string, string> = {
    rephrase: 'أعد صياغة هذا القسم بأسلوب هندسي قوي ودقيق مع الحفاظ التام على الحقائق والمعادلات.',
    simplify: 'بسط شرح هذا القسم بطريقة سهلة يفهمها طالب سنة أولى هندسة مع المحافظة على الدقة العلمية.',
    expand: 'قم بزيادة التفاصيل الهندسية والأمثلة والحسابات والتطبيقات العملية لهذا القسم بشكل وافٍ.',
    shorten: 'اختصر هذا القسم وركز على النقاط الجوهرية والنتائج الحتمية بدون حشو.',
    fix_errors: 'دقق وصحح أي أخطاء علمية أو لغوية أو في الوحدات والمعادلات داخل هذا القسم.',
    make_academic: 'حول أسلوب هذا القسم إلى صياغة أكاديمية رصينة مناسبة للتقارير والأبحاث الجامعية المحكمة.',
    translate_ar: 'ترجم هذا القسم بدقة إلى اللغة العربية مع الاحتفاظ بالمصطلحات الهندسية الإنجليزية بين قوسين.',
    translate_en: 'Translate this section accurately to formal academic English suitable for engineering reports.',
  };

  const command = instructionMap[params.instructionType] || 'حسّن هذا القسم هندسياً وأكاديمياً.';

  const prompt = `أنت بروفيسور ميكاترونكس متخصص.
المطلوب منك تحسين هذا القسم فقط دون تغيير باقي التكليف:
عنوان القسم: ${params.sectionTitle}
المادة: ${params.subject || 'هندسة الميكاترونكس'}
التخصص: ${params.major || 'ميكاترونكس'}

المطلوب بالتحديد:
${command}

النص الحالي للقسم:
"""
${params.currentContent}
"""

أرجع النص الجديد المحسّن فقط بدون أي مقدمات أو هوامش إضافية، ليتم وضعه مباشرة في المحرر.`;

  const response = await callGeminiWithResilience(client, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      temperature: 0.3,
    },
    preferredModel: 'gemini-3.1-flash-lite',
  });

  return response.text.trim();
}

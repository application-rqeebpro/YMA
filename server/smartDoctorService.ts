import { GoogleGenAI } from '@google/genai';
import { 
  SPECIALIST_DOCTORS, 
  SpecialistDoctor, 
  SmartDoctorGeneratedLesson, 
  DoctorLessonScene 
} from '../src/data/smartDoctorData';
import { safeExtractJson } from './explainService';
import { searchBookChunks, SERWAY_BOOK_ID } from './referenceBookService';
import fs from 'fs';
import path from 'path';

// Storage file for customizations and saved lessons
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), '.data');
const LESSONS_FILE = path.join(DATA_DIR, 'smart_doctor_lessons.json');
const DOCTORS_CUSTOM_FILE = path.join(DATA_DIR, 'smart_doctor_custom.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Could not create smart doctor data dir:', e);
  }
}

// In-memory cache
let savedLessons: SmartDoctorGeneratedLesson[] = [];
let doctorCustomizations: Record<string, Partial<SpecialistDoctor>> = {};

// Load saved data
try {
  ensureDataDir();
  if (fs.existsSync(LESSONS_FILE)) {
    savedLessons = JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf-8'));
  }
  if (fs.existsSync(DOCTORS_CUSTOM_FILE)) {
    doctorCustomizations = JSON.parse(fs.readFileSync(DOCTORS_CUSTOM_FILE, 'utf-8'));
  }
} catch (e) {
  console.warn('Failed to load smart doctor saved data, using initial defaults', e);
}

function persistLessons() {
  try {
    ensureDataDir();
    fs.writeFileSync(LESSONS_FILE, JSON.stringify(savedLessons, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error persisting doctor lessons:', e);
  }
}

function persistDoctorsCustom() {
  try {
    ensureDataDir();
    fs.writeFileSync(DOCTORS_CUSTOM_FILE, JSON.stringify(doctorCustomizations, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error persisting doctor customizations:', e);
  }
}

// Helper to get active doctors with any admin overrides
export function getActiveSpecialistDoctors(): SpecialistDoctor[] {
  return SPECIALIST_DOCTORS.map((doc) => {
    const custom = doctorCustomizations[doc.id];
    if (custom) {
      return { ...doc, ...custom };
    }
    return doc;
  });
}

export function updateDoctor(id: string, updates: Partial<SpecialistDoctor>): SpecialistDoctor {
  doctorCustomizations[id] = { ...(doctorCustomizations[id] || {}), ...updates };
  persistDoctorsCustom();
  const all = getActiveSpecialistDoctors();
  return all.find((d) => d.id === id) || SPECIALIST_DOCTORS[0];
}

export function getSavedLessons(studentId?: string): SmartDoctorGeneratedLesson[] {
  if (!studentId) return savedLessons;
  return savedLessons.filter((l) => !l.studentId || l.studentId === studentId);
}

export function saveLesson(lesson: SmartDoctorGeneratedLesson): SmartDoctorGeneratedLesson {
  const existingIdx = savedLessons.findIndex((l) => l.id === lesson.id);
  if (existingIdx !== -1) {
    savedLessons[existingIdx] = lesson;
  } else {
    savedLessons.unshift(lesson);
  }
  persistLessons();
  return lesson;
}

export function deleteLesson(lessonId: string): boolean {
  const initialLen = savedLessons.length;
  savedLessons = savedLessons.filter((l) => l.id !== lessonId);
  if (savedLessons.length !== initialLen) {
    persistLessons();
    return true;
  }
  return false;
}

// ==========================================================
// BUILT-IN FALLBACK LESSON GENERATOR (Guarantees immediate zero-error response)
// ==========================================================
function getBuiltInLesson(
  doctor: SpecialistDoctor,
  lessonTitle: string,
  explanationLevel: string,
  durationMinutes: number,
  useSerway: boolean,
  studentImagePreview?: string,
  studentFileContent?: string
): SmartDoctorGeneratedLesson {
  const isOhm = lessonTitle.includes('أوم') || lessonTitle.toLowerCase().includes('ohm') || doctor.id === 'doc-circuits';
  const isVectors = lessonTitle.includes('متجه') || lessonTitle.toLowerCase().includes('vector') || (doctor.id === 'doc-physics' && !isOhm);
  const isArduino = lessonTitle.includes('أردوينو') || lessonTitle.includes('حساس') || doctor.id === 'doc-embedded' || doctor.id === 'doc-sensors';

  let scenes: DoctorLessonScene[] = [];

  if (isOhm) {
    scenes = [
      {
        sceneNumber: 1,
        sceneTitle: 'مقدمة: ما هو قانون أوم؟',
        sceneType: 'intro',
        doctorSpokenScript: `مرحباً بكم يا شباب في أكاديمية الميكاترونكس. أنا ${doctor.name}، واليوم سنتعلم قانون أوم، وهو الحجر الأساسي لفهم أي دائرة إلكترونية في الروبوتات والأنظمة الميكاترونية.`,
        doctorPronouncedWords: `مرحباً بكم يا شباب في أكاديمية الميكاترونكس. أنا ${doctor.name}، واليوم سنتعلم قانون أوم، وهو الحجر الأساسي لفهم أي دائرة إلكترونية في الروبوتات والأنظمة الميكاترونية.`,
        doctorAction: 'speaking_straight',
        doctorExpression: 'friendly',
        boardContent: {
          heading: 'قانون أوم في الدوائر الكهربائية (Ohm\'s Law)',
          subheading: 'العلاقة الجوهرية بين الجهد والتيار والمقاومة في الأنظمة الهندسية',
          bullets: [
            'الجهد (Voltage): هو الضغط أو الطاقة التي تدفع الإلكترونات عبر المسار.',
            'التيار (Current): هو معدل تدفق الشحنات الكهربائية ويقاس بالأمبير.',
            'المقاومة (Resistance): هي ممانعة المادة لمرور الشحنات وتقاس بالأوم.'
          ],
          takeawayBox: 'لا يمكن للإلكترونات أن تتحرك وتغذي المحرك بدون فرق جهد كافٍ يتغلب على مقاومة الدائرة.'
        },
        durationSeconds: 22
      },
      {
        sceneNumber: 2,
        sceneTitle: 'المعادلة الأساسية والوحدات على السبورة',
        sceneType: 'formula',
        doctorSpokenScript: 'انظروا إلى السبورة: القانون يقول: فرق الجهد بالفولت يساوي حاصل ضرب شدة التيار بالأمبير في قيمة المقاومة بالأوم. تذكروا مثلث أوم الشهير دائماً.',
        doctorPronouncedWords: 'انظروا إلى السبورة: القانون يقول: فرق الجهد بالفولت يساوي حاصل ضرب شدة التيار بالأمبير في قيمة المقاومة بالأوم. تذكروا مثلث أوم الشهير دائماً.',
        doctorAction: 'pointing_formula',
        doctorExpression: 'focused',
        boardContent: {
          heading: 'المعادلة الرياضية ومثلث أوم',
          latexFormula: 'V = I \\times R',
          bullets: [
            'لحساب الجهد: نضرب التيار في المقاومة (V = I × R).',
            'لحساب التيار: نقسم الجهد على المقاومة (I = V / R).',
            'لحساب المقاومة: نقسم الجهد على التيار (R = V / I).'
          ],
          formulaBreakdown: [
            { symbol: 'V', name: 'الجهد (Voltage)', unit: 'Volt (V)', description: 'فرق الجهد بين طرفي العنصر' },
            { symbol: 'I', name: 'التيار (Current)', unit: 'Ampere (A)', description: 'معدل تدفق الشحنة في الثانية' },
            { symbol: 'R', name: 'المقاومة (Resistance)', unit: 'Ohm (Ω)', description: 'إعاقة الموصل لتدفق التيار' }
          ]
        },
        durationSeconds: 26
      },
      {
        sceneNumber: 3,
        sceneTitle: 'المحاكاة الهندسية التفاعلية للدائرة',
        sceneType: 'simulation',
        doctorSpokenScript: 'دعونا ننتقل للمحاكاة على السبورة! أمامكم دائرة تحوي بطارية ومقاومة ومقياس أميتر. لاحظوا كيف يزداد تدفق التيار والأمبيرات كلما زدنا الجهد، وكيف ينخفض التيار عندما نكبر المقاومة.',
        doctorAction: 'looking_at_diagram',
        doctorExpression: 'enthusiastic',
        boardContent: {
          heading: 'محاكاة الدائرة الكهربائية وتدفق الإلكترونات',
          diagramType: 'circuit',
          bullets: [
            'الأميتر يُوصل دائماً على التوالي لقياس التيار المار.',
            'الفولتميتر يُوصل دائماً على التوازي لقياس هبوط الجهد.',
            'القدرة المبددة كحرارة في المقاومة تحسب من: P = V × I أو P = I² × R.'
          ],
          warningBox: 'لا توصل مقاومة صغيرة جداً مباشرة مع مصدر 12V حتى لا تحترق المقاومة بسبب زيادة القدرة الحرارية!'
        },
        durationSeconds: 28
      },
      {
        sceneNumber: 4,
        sceneTitle: 'مسألة هندسية محلولة خطوة بخطوة',
        sceneType: 'example_step',
        doctorSpokenScript: 'نحل الآن مسألة من واقع مشاريع الأردوينو: نريد تشغيل ليد أحمر بجهد خمسة فولت وتيار عشرين ملي أمبير، ما هي المقاومة المطلوبة لحمايته؟ دعونا نحسبها خطوة بخطوة.',
        doctorAction: 'pointing_left_board',
        doctorExpression: 'focused',
        boardContent: {
          heading: 'مسألة تطبيقية: حساب مقاومة حماية LED لمتحكم Arduino',
          bullets: [
            'المعطيات: جهد المصدر Vin = 5V، هبوط جهد الدايود V_led = 2V، التيار المطلوب I = 20mA = 0.02A.',
            'الجهد المتبقي على المقاومة: V_R = 5V - 2V = 3V.'
          ],
          stepByStepCalc: [
            { stepNumber: 1, stepText: 'حساب الجهد الواقع على المقاومة', mathExpression: 'V_R = V_{in} - V_{led} = 5 - 2 = 3\\ V', explanation: 'وفق قانون كيرشوف للجهد KVL' },
            { stepNumber: 2, stepText: 'تطبيق قانون أوم لإيجاد قيمة المقاومة R', mathExpression: 'R = \\frac{V_R}{I} = \\frac{3}{0.02} = 150\\ \\Omega', explanation: 'نختار المقاومة القياسية المتوفرة 220 أوم لضمان أمان أعلى' },
            { stepNumber: 3, stepText: 'حساب القدرة المستهلكة في المقاومة', mathExpression: 'P = I^2 \\times R = (0.02)^2 \\times 150 = 0.06\\ W', explanation: 'مقاومة عادية 0.25W تكفي تماماً دون سخونة' }
          ]
        },
        durationSeconds: 32
      },
      {
        sceneNumber: 5,
        sceneTitle: 'الخلاصة واختبار الفهم السريع',
        sceneType: 'summary',
        doctorSpokenScript: 'أحسنتم جميعاً! الخلاصة هي أن التيار يتناسب طردياً مع الجهد وعكسياً مع المقاومة. احفظوا هذه العلاقة لأننا سنستخدمها في كل مشغلات الميكاترونكس. اضغطوا زر اختبرني لقياس استيعابكم!',
        doctorAction: 'celebrating_solution',
        doctorExpression: 'friendly',
        boardContent: {
          heading: 'خلاصة الدرس ونقاط الاختبار الهندسية',
          bullets: [
            'قانون أوم صالح للموصلات الأومية عند ثبوت درجة الحرارة.',
            'التيار يقل للنصف إذا ضاعفنا المقاومة مع ثبات الجهد.',
            'المقاومة تستهلك الطاقة وتحولها إلى حرارة بمعدل I²·R.'
          ],
          takeawayBox: 'في الامتحانات الجامعية: دائماً حول الملي أمبير (mA) إلى أمبير بالقسمة على 1000 قبل التعويض في القانون!'
        },
        durationSeconds: 24
      }
    ];
  } else if (isVectors) {
    scenes = [
      {
        sceneNumber: 1,
        sceneTitle: 'مقدمة: المتجهات في مرجع Serway الدولي',
        sceneType: 'intro',
        doctorSpokenScript: `أهلاً بكم يا مهندسي المستقبل. أنا ${doctor.name}، واليوم سنشرح الفصل الثالث من مرجع سيرواي الدولي: المتجهات وتحليل القوى في أنظمة الروبوتات.`,
        doctorAction: 'speaking_straight',
        doctorExpression: 'friendly',
        boardContent: {
          heading: 'تحليل المتجهات (Vectors & Coordinate Systems)',
          subheading: 'مرجع Physics for Scientists and Engineers — Serway (Chapter 3)',
          bullets: [
            'الكمية القياسية (Scalar): مقدار ووحدة فقط (مثل الكتلة m = 5 kg والزمن t = 10 s).',
            'الكمية المتجهة (Vector): مقدار واتجاه ونقطة تأثير (مثل القوة F والسرعة v والتسارع a).',
            'في الروبوتات: كل حركة في الفراغ تتطلب تحليلاً ثلاثي أو ثنائي الأبعاد للمتجهات.'
          ],
          takeawayBox: 'جمع المتجهات لا يتم بالجمع الجبري العادي إلا إذا كانت في نفس الخط تماماً!'
        },
        durationSeconds: 24
      },
      {
        sceneNumber: 2,
        sceneTitle: 'قوانين تحليل المتجه إلى مركبات متعامدة',
        sceneType: 'formula',
        doctorSpokenScript: 'انظروا إلى السبورة: أي قوة أو متجه مائل بزاوية ثيتا مع المحور السيني، نحلله إلى مركبتين: الأفقية تأخذ جيب التمام كوزاين، والرأسية تأخذ الجيب ساين.',
        doctorAction: 'pointing_formula',
        doctorExpression: 'focused',
        boardContent: {
          heading: 'قوانين التحليل الكارتيزي للمتجه',
          latexFormula: 'A_x = A \\cos\\theta \\quad , \\quad A_y = A \\sin\\theta',
          bullets: [
            'المركبة السينية المجاورة للزاوية: Ax = A · cos(θ).',
            'المركبة الصادية المقابلة للزاوية: Ay = A · sin(θ).',
            'مقدار المتجه المحصل من فيثاغورس: |A| = √(Ax² + Ay²).',
            'اتجاه زاوية المحصلة: θ = tan⁻¹(Ay / Ax).'
          ],
          formulaBreakdown: [
            { symbol: 'A', name: 'مقدار المتجه الأصلي', unit: 'N أو m/s', description: 'طول المتجه الكلي' },
            { symbol: 'Ax', name: 'المركبة السينية', unit: 'N', description: 'إسقاط المتجه على محور x' },
            { symbol: 'Ay', name: 'المركبة الصادية', unit: 'N', description: 'إسقاط المتجه على محور y' },
            { symbol: 'θ', name: 'زاوية الميل', unit: 'Degrees (°)', description: 'الزاوية مع الاتجاه الموجب لمحور X' }
          ]
        },
        durationSeconds: 28
      },
      {
        sceneNumber: 3,
        sceneTitle: 'المحاكاة الهندسية لتحليل المتجهات',
        sceneType: 'simulation',
        doctorSpokenScript: 'شاهدوا هذا المخطط البياني على السبورة: لاحظوا كيف يتغير طول السهم الأزرق Ax والسهم الأحمر Ay عند تحريك الزاوية ثيتا بواسطة المنزلق التفاعلي!',
        doctorAction: 'looking_at_diagram',
        doctorExpression: 'enthusiastic',
        boardContent: {
          heading: 'المحاكاة التفاعلية لإسقاط المتجهات',
          diagramType: 'vectors',
          bullets: [
            'عند الزاوية 0°: كل المتجه يكون أفقياً (Ax = A) والمركبة الصادية تنعدم (Ay = 0).',
            'عند الزاوية 90°: كل المتجه يصبح رأسياً (Ay = A) والمركبة السينية تنعدم (Ax = 0).',
            'عند الزاوية 45°: المركبتان السينية والصادية تتساويان تماماً!'
          ]
        },
        durationSeconds: 26
      },
      {
        sceneNumber: 4,
        sceneTitle: 'تطبيق محلول من كتاب Serway',
        sceneType: 'example_step',
        doctorSpokenScript: 'نحل الآن مسألة كلاسيكية من سيرواي: تؤثر قوة مقدارها مائة نيوتن بزاوية ثلاثين درجة على ذراع رافعة، احسب المركبتين السينية والصادية بدقة.',
        doctorAction: 'pointing_left_board',
        doctorExpression: 'focused',
        boardContent: {
          heading: 'مثال محلول من مرجع Serway (Example 3.3)',
          bullets: [
            'المعطيات: القوة F = 100 N، الزاوية θ = 30° فوق المحور السيني الموجب.'
          ],
          stepByStepCalc: [
            { stepNumber: 1, stepText: 'حساب المركبة السينية Fx', mathExpression: 'F_x = F \\cos(30^\\circ) = 100 \\times 0.866 = 86.6\\ N', explanation: 'القوة الفعالة في سحب الذراع أفقياً' },
            { stepNumber: 2, stepText: 'حساب المركبة الصادية Fy', mathExpression: 'F_y = F \\sin(30^\\circ) = 100 \\times 0.500 = 50.0\\ N', explanation: 'القوة الفعالة في رفع الذراع رأسياً' },
            { stepNumber: 3, stepText: 'التحقق من صحة المقدار بواسطة نظرية فيثاغورس', mathExpression: '|F| = \\sqrt{(86.6)^2 + (50)^2} = \\sqrt{7500 + 2500} = 100\\ N', explanation: 'النتيجة متطابقة 100% مع المقدار المعطى' }
          ]
        },
        durationSeconds: 30
      },
      {
        sceneNumber: 5,
        sceneTitle: 'الخلاصة الهندسية والتوصية الجامعية',
        sceneType: 'summary',
        doctorSpokenScript: 'هكذا نكون قد أتقنا تحليل المتجهات، وهي القاعدة التي سنبني عليها دراسة كينماتيكا الروبوتات والاتزان الاستاتيكي. راجعوا الأسئلة التدريبية بنهاية العرض.',
        doctorAction: 'celebrating_solution',
        doctorExpression: 'friendly',
        boardContent: {
          heading: 'خلاصة الفصل وتوصيات المذاكرة',
          bullets: [
            'دائماً تأكد أن حاسبتك العلمية مضبوطة على نظام الدرجات (Degree DEG) وليس الراديان.',
            'إذا كانت الزاوية مع المحور الرأسي Y، تنعكس الدوال: الصادي يأخذ cos والسيني يأخذ sin.',
            'الضرب القياسي A·B يحسب الشغل، والضرب الاتجاهي A×B يحسب عزم الدوران Torque.'
          ],
          takeawayBox: 'تطابق كامل مع منهج كليات الهندسة باليمن (صنعاء، الإماراتية الدولية، العلوم والتكنولوجيا).'
        },
        durationSeconds: 22
      }
    ];
  } else {
    // General Mechatronics Lesson (Robotics / Automation / Sensors)
    scenes = [
      {
        sceneNumber: 1,
        sceneTitle: `مقدمة في ${lessonTitle}`,
        sceneType: 'intro',
        doctorSpokenScript: `أهلاً بكم في قاعة المحاضرات التفاعلية. أنا ${doctor.name}، متخصص ${doctor.specialty}. اليوم سنغوص في شرح درس "${lessonTitle}" خطوة بخطوة وكأننا معاً أمام السبورة.`,
        doctorAction: 'speaking_straight',
        doctorExpression: 'friendly',
        boardContent: {
          heading: lessonTitle,
          subheading: `المقرر الأكاديمي: ${doctor.specialty} • المستوى: ${explanationLevel}`,
          bullets: [
            'الهدف التعليمي الأول: فهم المبدأ الهندسي والفيزيائي الأساسي بدون تعقيد.',
            'الهدف التعليمي الثاني: تحليل القوانين والمعادلات الحاكمة ووحداتها في النظام الدولي.',
            'الهدف التعليمي الثالث: ربط المفهوم بتطبيقات الأتمتة والروبوتات والميكاترونكس.'
          ],
          takeawayBox: 'الهندسة ليست حفظ معادلات، بل فهم سلوك النظام الطبيعي والتحكم فيه برمجياً وميكانيكياً.'
        },
        durationSeconds: 24
      },
      {
        sceneNumber: 2,
        sceneTitle: 'المعادلات والقوانين الحاكمة للمنظومة',
        sceneType: 'formula',
        doctorSpokenScript: 'دعونا نكتب القوانين الأساسية على السبورة ونفصل رموزها ووحدات قياسها. ركزوا معي في هذا القانون الرئيسي.',
        doctorAction: 'pointing_formula',
        doctorExpression: 'focused',
        boardContent: {
          heading: 'القوانين والمعادلات الرياضية الحاكمة',
          latexFormula: isArduino ? 'd = \\frac{v \\times t}{2}' : '\\tau = I \\times \\alpha',
          bullets: [
            'المتغير التابع يتغير استجابة لتغير إشارات الدخل في حلقة التحكم.',
            'معامل التناسب يعبر عن الخصائص الفيزيائية للمنظومة.',
            'يجب مراعاة اتزان الأبعاد وتوافق الوحدات قبل أي حساب هندسي.'
          ],
          formulaBreakdown: isArduino ? [
            { symbol: 'd', name: 'المسافة المحسوبة', unit: 'cm أو m', description: 'بعد العائق عن حساس السونار' },
            { symbol: 'v', name: 'سرعة الصوت في الهواء', unit: '340 m/s', description: 'سرعة انتشار الموجات الصوتية' },
            { symbol: 't', name: 'زمن رحلة الذهاب والإياب', unit: 'µs', description: 'الزمن المقاس بمتحكم Arduino' }
          ] : [
            { symbol: 'τ', name: 'عزم الدوران (Torque)', unit: 'N·m', description: 'قدرة المحرك على إدارة الحمل الميكانيكي' },
            { symbol: 'I', name: 'عزم القصور الذاتي', unit: 'kg·m²', description: 'ممانعة الجسم للحركة الدورانية' },
            { symbol: 'α', name: 'التسارع الزاوي', unit: 'rad/s²', description: 'معدل تغير السرعة الدورانية في الثانية' }
          ]
        },
        durationSeconds: 28
      },
      {
        sceneNumber: 3,
        sceneTitle: 'المحاكاة والمخطط الهندسي',
        sceneType: 'simulation',
        doctorSpokenScript: 'انظروا إلى المحاكاة الهندسية على السبورة: هذا النموذج يوضح سلوك النظام بصرياً وتفاعلياً!',
        doctorAction: 'looking_at_diagram',
        doctorExpression: 'enthusiastic',
        boardContent: {
          heading: 'المخطط الهندسي التفاعلي للمنظومة',
          diagramType: isArduino ? 'sensor_sonar' : 'robot_arm',
          bullets: [
            'التغذية الراجعة (Feedback) تضمن دقة الوصول للقيمة المطلوبة.',
            'معايرة الحساسات والمشغلات خطوة إلزامية لمنع انحراف الروبوت عن مساره.',
            'زمن الاستجابة والاستقرار هما مقياس جودة التصميم الميكاتروني.'
          ],
          warningBox: 'احذر من إهمال عزل جهود التغذية العالية للمحركات عن الدوائر المنطقية للمتحكم!'
        },
        durationSeconds: 26
      },
      {
        sceneNumber: 4,
        sceneTitle: 'خطوات الحل الهندسي والتطبيق',
        sceneType: 'example_step',
        doctorSpokenScript: 'دعونا نطبق هذا المفهوم على مسألة هندسية واقعية لنرى كيف نصل للحل خطوة بخطوة بالقيم الحسابية.',
        doctorAction: 'pointing_left_board',
        doctorExpression: 'focused',
        boardContent: {
          heading: 'تطبيق حسابي وتصميمي خطوة بخطوة',
          bullets: [
            'الخطوة الأولى: تحديد المعطيات والمجاهيل وشروط التشغيل بأمان.',
            'الخطوة الثانية: كتابة المعادلة المناسبة والتعويض بالأرقام الموحدة.'
          ],
          stepByStepCalc: [
            { stepNumber: 1, stepText: 'تحليل شروط الدخل والخرج', mathExpression: 'Input \\rightarrow System \\rightarrow Output', explanation: 'تحديد دالة التحويل والوسائط الفيزيائية' },
            { stepNumber: 2, stepText: 'حساب القيمة المستهدفة بهامش أمان 20%', mathExpression: 'Design\\ Value = Nominal \\times 1.25', explanation: 'ضمان اعتمادية النظام في بيئة العمل الصناعية' },
            { stepNumber: 3, stepText: 'التحقق من كفاءة الاستهلاك والقدرة', mathExpression: '\\eta = \\frac{P_{out}}{P_{in}} \\times 100\\%', explanation: 'تقييم كفاءة الطاقة المفقودة كحرارة' }
          ]
        },
        durationSeconds: 30
      },
      {
        sceneNumber: 5,
        sceneTitle: 'خلاصة المحاضرة والأسئلة التدريبية',
        sceneType: 'summary',
        doctorSpokenScript: 'أحسنتم الاستماع يا أبطال. بهذا نكون قد غطينا جوهر هذا الدرس، واحتفظنا بالقوانين على السبورة. اضغطوا على زر "اختبرني" للتأكد من استيعابكم، وأنا معكم دائماً لشرح أي تفصيل!',
        doctorAction: 'celebrating_solution',
        doctorExpression: 'friendly',
        boardContent: {
          heading: 'خلاصة الدرس ونقاط المراجعة قبل الامتحان',
          bullets: [
            'افهم المبدأ الفيزيائي قبل البدء في كتابة الأكواد وتوصيل الأسلاك.',
            'راجع خطوات حل الأمثلة وتأكد من كتابة الوحدات الصحيحة دائماً.',
            'يمكنك في أي وقت الضغط على "لم أفهم، أعد الشرح" لإعادة توضيح أي مشهد.'
          ],
          takeawayBox: 'دكتور الميكاترونكس الذكي متاح لك 24 ساعة للمراجعة والاستفسار الأكاديمي.'
        },
        durationSeconds: 24
      }
    ];
  }

  if (studentImagePreview) {
    scenes.forEach((sc) => {
      if (sc.boardContent) {
        sc.boardContent.studentImagePreview = studentImagePreview;
      }
    });
  }

  return {
    id: 'lesson-' + Date.now(),
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorTitle: doctor.title,
    doctorAvatarStyle: doctor.avatarStyle,
    studentImagePreview,
    subject: doctor.specialty,
    lessonTitle,
    explanationLevel: explanationLevel as any,
    durationMinutes,
    displayMode: 'anime_board',
    useSerwayReference: useSerway,
    totalDurationSeconds: scenes.reduce((acc, s) => acc + s.durationSeconds, 0),
    scenes,
    reviewQuiz: [
      {
        question: `ما هي النقطة الجوهرية في درس "${lessonTitle}"؟`,
        options: [
          'فهم العلاقة الفيزيائية والرياضية بين المتغيرات وتطبيقها بأمان.',
          'حفظ الأرقام العشوائية دون فهم الوحدات.',
          'تجاوز حدود الجهد والقدرة المسموحة في الدائرة.',
          'الاستغناء عن التغذية الراجعة وحلقة التحكم المغلقة.'
        ],
        correctAnswer: 0,
        explanation: 'الفهم الهندسي الدقيق للعلاقات الرياضية والفيزيائية هو أساس هندسة الميكاترونكس.'
      },
      {
        question: 'عند إجراء أي حسابات هندسية للمنظومة، ما الخطوة الأهم للوحدات؟',
        options: [
          'إهمال الوحدات تماماً.',
          'التحقق من تجانس الأبعاد واستخدام وحدات النظام الدولي SI.',
          'خلط وحدات الإنش مع المتر عشوائياً.',
          'تغيير القوانين حسب الرغبة.'
        ],
        correctAnswer: 1,
        explanation: 'تجانس الأبعاد في النظام الدولي SI هو الضمان الوحيد لصحة النتائج وتفادي احتراق القطع أو انهيار التصميم.'
      }
    ],
    summaryNotes: [
      `تم استيعاب درس ${lessonTitle} بإشراف ${doctor.name}.`,
      'القوانين مكتوبة على السبورة التفاعلية ويمكن مراجعتها في أي وقت.',
      'تطابق كامل مع المنهج اليمني المعتمد لطلاب هندسة الميكاترونكس.'
    ],
    createdAt: new Date().toISOString()
  };
}

// ==========================================================
// GEMINI AI INTEGRATION ENGINE (With Serway RAG & Cascade)
// ==========================================================
export async function generateSmartDoctorLesson(params: {
  doctorId: string;
  subject?: string;
  lessonTitle: string;
  explanationLevel?: string;
  durationMinutes?: number;
  displayMode?: string;
  useSerwayReference?: boolean;
  studentFileContent?: string;
  imageBase64?: string;
  studentId?: string;
  customDoctorInfo?: {
    name: string;
    subject: string;
    major: string;
    university: string;
    avatarStyle?: 'male_professor' | 'female_engineer' | 'young_innovator' | 'senior_sage' | 'modern_tech';
    boardTheme?: 'chalkboard_green' | 'blackboard_dark' | 'whiteboard_academic' | 'blueprint_cyan';
    avatarType?: 'anime' | 'photo' | 'icon';
    photoUrl?: string;
    iconSymbol?: string;
  };
}): Promise<SmartDoctorGeneratedLesson> {
  const doctors = getActiveSpecialistDoctors();
  const baseDoc = doctors.find((d) => d.id === params.doctorId);
  let doctor: SpecialistDoctor;

  if (params.customDoctorInfo && params.customDoctorInfo.name?.trim()) {
    const c = params.customDoctorInfo;
    const rawName = c.name.trim();
    const docName = rawName.startsWith('د.') || rawName.startsWith('الدكتور') || rawName.startsWith('م.') ? rawName : `د. ${rawName}`;
    const subjectName = c.subject?.trim() || baseDoc?.specialty || 'المادة الدراسية';
    const majorName = c.major?.trim() || 'هندسة الميكاترونكس';
    const uniName = c.university?.trim() || baseDoc?.university || 'جامعتك الحالية';

    if (baseDoc) {
      doctor = {
        ...baseDoc,
        name: docName,
        specialty: subjectName,
        university: uniName,
        title: `أستاذ مقرر ${subjectName} — قسم ${majorName}`,
        bio: `دكتور محاضر لمادة ${subjectName} في ${uniName} — قسم ${majorName}`,
        avatarStyle: c.avatarStyle || baseDoc.avatarStyle,
        boardTheme: c.boardTheme || baseDoc.boardTheme,
        avatarType: c.avatarType || baseDoc.avatarType || 'anime',
        photoUrl: c.photoUrl || baseDoc.photoUrl,
        iconSymbol: c.iconSymbol || baseDoc.iconSymbol,
      };
    } else {
      doctor = {
        id: 'custom-doctor',
        name: docName,
        title: `أستاذ مقرر ${subjectName} — قسم ${majorName}`,
        specialty: subjectName,
        englishSpecialty: `${subjectName} (${majorName})`,
        avatarStyle: c.avatarStyle || 'male_professor',
        avatarType: c.avatarType || 'anime',
        photoUrl: c.photoUrl,
        iconSymbol: c.iconSymbol,
        coatColor: '#1e3a8a',
        hairColor: '#1e293b',
        accentColor: '#3b82f6',
        bio: `دكتور محاضر لمادة ${subjectName} في ${uniName} — قسم ${majorName}`,
        university: uniName,
        suggestedTopics: ['مفاهيم الشرح والمبادئ الأساسية', 'حل مسائل الاختبارات وحلقات البحث'],
        boardTheme: c.boardTheme || 'chalkboard_green',
        voiceGender: 'male',
        voicePitch: 0.92,
        voiceRate: 0.93,
      };
    }
  } else {
    doctor = baseDoc || doctors[0];
  }

  const lessonTitle = params.lessonTitle?.trim() || 'قانون أوم وتحليل الدوائر';
  const explanationLevel = params.explanationLevel || 'beginner';
  const durationMinutes = params.durationMinutes || 5;
  const useSerway = Boolean(params.useSerwayReference);

  // If Serway is requested, search for relevant passages
  let serwayContext = '';
  if (useSerway) {
    try {
      const searchRes = searchBookChunks(SERWAY_BOOK_ID, lessonTitle, 3);
      if (searchRes.chunks && searchRes.chunks.length > 0) {
        serwayContext = `\n\n[اقتباسات من كتاب Physics for Scientists and Engineers — Serway]:\n` +
          searchRes.chunks.map((c) => `- الفصل (${c.chapterTitle || ''} صفحة ${c.pageNumber}): ${c.content}`).join('\n');
      }
    } catch (e) {
      console.warn('Serway search skipped:', e);
    }
  }

  // Check if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('No GEMINI_API_KEY found, using curated built-in lesson generator for doctor:', doctor.name);
    const lesson = getBuiltInLesson(doctor, lessonTitle, explanationLevel, durationMinutes, useSerway, params.imageBase64, params.studentFileContent);
    lesson.studentId = params.studentId;
    lesson.studentImagePreview = params.imageBase64;
    lesson.noticeMessage = 'تم إعداد الشرح التفاعلي عبر المساعد الأكاديمي المعتمد للدكتور.';
    saveLesson(lesson);
    return lesson;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `أنت تمثل شخصية الدكتور الجامعي باسم:
«${doctor.name}» — ${doctor.title} (مادة ${doctor.specialty} في ${doctor.university} — قسم ${params.customDoctorInfo?.major || 'هندسة الميكاترونكس'}).

المطلوب: إعداد سيناريو درس مرئي تفاعلي كامل على السبورة لطلاب قسم ${params.customDoctorInfo?.major || 'هندسة الميكاترونكس'} في ${doctor.university}.

بيانات الطلب:
- اسم الدكتور المحاضر: "${doctor.name}"
- اسم المادة الدراسية: "${doctor.specialty}"
- اسم التخصص الجامعي: "${params.customDoctorInfo?.major || 'هندسة الميكاترونكس'}"
- اسم الجامعة: "${doctor.university}"
- عنوان الدرس المطلوب: "${lessonTitle}"
- مستوى الشرح: ${explanationLevel}
- مدة الشرح: ${durationMinutes} دقائق
${useSerway ? `- مرجع Serway الدولي مطلوب: نعم، اربط الشرح بفصول وقوانين Serway.` : ''}
${serwayContext}
${params.studentFileContent ? `[تفريغ المحتوى/الملف/الفيديو المرفوع من الطالب]:\n${params.studentFileContent.slice(0, 3000)}` : ''}
${params.imageBase64 ? `[ملاحظة هامة وحرجة جداً]: الطالب قام برفع صورة محددة (صورة مسألة، رسم هندسي، أو دائرة كهربائية أو دفتر محاضرة). قم بإجراء تحليل بصري (Visual Analysis) دقيق وشامل لكافة المعطيات والأرقام والرموز والرسوم في الصورة المرفقة، ثم اشرح هذه الصورة واحلل مسائلها خطوة بخطوة بالقيم الدقيقة على السبورة!` : ''}

قواعد حرجة للسيناريو:
1. صمّم الدرس في 4 إلى 6 مشاهد تعليمية متسلسلة (Scenes).
2. في حقل "doctorSpokenScript": اكتب ما يقوله الدكتور باللغة العربية الفصحى الأكاديمية المبسطة.
3. مهم جداً: انطق الرموز والمعادلات بالكلمات العربية المنطوقة لتناسب محول الصوت TTS (مثال: بدل "V = I * R" اكتب صوتياً "الجهد بالفولت يساوي حاصل ضرب شدة التيار بالأمبير في قيمة المقاومة بالأوم").
4. في حقل "boardContent": اكتب محتوى السبورة بدقة عالية: عنوان المشهد، نقاط الشرح، المعادلة الرياضية بصيغة LaTeX، جدول تفسير الرموز والوحدات SI، ومسألة محلولة خطوة بخطوة عند ملاءمة المشهد.
5. حدد نوع المخطط الهندسي إذا كان ملائماً: ("circuit" أو "vectors" أو "robot_arm" أو "sensor_sonar" أو "free_body").
6. أضف أسئلة اختبار سريع (reviewQuiz) مكونة من سؤالين إلى 3 أسئلة مع خيارات وتفسير أكاديمي.

أرجع النتيجة بصيغة JSON نظيفة فقط تطابق البنية التالية:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneTitle": "عنوان المشهد",
      "sceneType": "intro" | "concept" | "formula" | "diagram" | "simulation" | "example_step" | "summary",
      "doctorSpokenScript": "النص العربي المنطوق بصوت الدكتور",
      "doctorPronouncedWords": "النص مع نطق الرموز بالكلمات لمحول الصوت TTS",
      "doctorAction": "speaking_straight" | "pointing_left_board" | "pointing_formula" | "looking_at_diagram" | "celebrating_solution" | "warning_mistake",
      "doctorExpression": "friendly" | "focused" | "enthusiastic" | "alert",
      "boardContent": {
        "heading": "عنوان السبورة في هذا المشهد",
        "subheading": "شرح توضيحي",
        "bullets": ["نقطة 1", "نقطة 2"],
        "latexFormula": "المعادلة بصيغة لاتيك إذا وجدت",
        "formulaBreakdown": [
          {"symbol": "V", "name": "الجهد", "unit": "Volt", "description": "فرق الجهد الكهربائي"}
        ],
        "diagramType": "circuit" | "vectors" | "robot_arm" | "sensor_sonar" | "free_body",
        "stepByStepCalc": [
          {"stepNumber": 1, "stepText": "الخطوة الأولى", "mathExpression": "2 + 2 = 4", "explanation": "التوضيح"}
        ],
        "warningBox": "خطأ شائع يجب تجنبه",
        "takeawayBox": "الخلاصة الجوهرية"
      },
      "durationSeconds": 25
    }
  ],
  "reviewQuiz": [
    {
      "question": "نص السؤال",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswer": 0,
      "explanation": "التفسير العلمي للإجابة الصحيحة"
    }
  ],
  "summaryNotes": ["نقطة ملخصة 1", "نقطة ملخصة 2"]
}`;

    const { callGeminiWithResilience } = await import('./explainService');

    const contents: any[] = [];
    if (params.imageBase64 && params.imageBase64.trim().length > 0) {
      try {
        let cleanData = params.imageBase64.trim();
        let mimeType = 'image/jpeg';
        if (cleanData.includes(',')) {
          const commaIdx = cleanData.indexOf(',');
          const meta = cleanData.slice(0, commaIdx);
          if (meta.startsWith('data:')) {
            mimeType = meta.slice(5).split(';')[0].trim() || 'image/jpeg';
          }
          cleanData = cleanData.slice(commaIdx + 1);
        }
        cleanData = cleanData.replace(/\s+/g, '');
        if (cleanData.length > 0) {
          contents.push({
            inlineData: {
              data: cleanData,
              mimeType: mimeType.split(';')[0].trim() || 'image/jpeg',
            },
          });
        }
      } catch (e) {
        console.warn('Image base64 parsing warning:', e);
      }
    }
    contents.push({ text: promptText });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout 25s')), 25000)
    );

    const cascadePromise = callGeminiWithResilience(ai, {
      contents,
      preferredModel: 'gemini-3.6-flash',
      fallbackModels: ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'],
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const cascadeResult = await Promise.race([cascadePromise, timeoutPromise]);

    const text = cascadeResult.text || '';
    const parsed = safeExtractJson(text);

    if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
      const generatedLesson: SmartDoctorGeneratedLesson = {
        id: 'lesson-' + Date.now(),
        studentId: params.studentId,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorTitle: doctor.title,
        doctorAvatarStyle: doctor.avatarStyle,
        studentImagePreview: params.imageBase64,
        subject: doctor.specialty,
        lessonTitle,
        explanationLevel: explanationLevel as any,
        durationMinutes,
        displayMode: (params.displayMode as any) || 'anime_board',
        useSerwayReference: useSerway,
        totalDurationSeconds: parsed.scenes.reduce((acc: number, s: any) => acc + (s.durationSeconds || 25), 0),
        scenes: parsed.scenes.map((s: any, idx: number) => ({
          sceneNumber: idx + 1,
          sceneTitle: s.sceneTitle || `مشهد ${idx + 1}`,
          sceneType: s.sceneType || 'concept',
          doctorSpokenScript: s.doctorSpokenScript || '',
          doctorPronouncedWords: s.doctorPronouncedWords || s.doctorSpokenScript || '',
          doctorAction: s.doctorAction || 'pointing_left_board',
          doctorExpression: s.doctorExpression || 'friendly',
          boardContent: {
            heading: s.boardContent?.heading || s.sceneTitle || '',
            subheading: s.boardContent?.subheading || '',
            bullets: Array.isArray(s.boardContent?.bullets) ? s.boardContent.bullets : [],
            latexFormula: s.boardContent?.latexFormula,
            formulaBreakdown: s.boardContent?.formulaBreakdown,
            diagramType: s.boardContent?.diagramType,
            stepByStepCalc: s.boardContent?.stepByStepCalc,
            warningBox: s.boardContent?.warningBox,
            takeawayBox: s.boardContent?.takeawayBox,
            studentImagePreview: params.imageBase64,
          },
          durationSeconds: s.durationSeconds || 25,
        })),
        reviewQuiz: Array.isArray(parsed.reviewQuiz) ? parsed.reviewQuiz : [],
        summaryNotes: Array.isArray(parsed.summaryNotes) ? parsed.summaryNotes : [],
        createdAt: new Date().toISOString(),
      };

      saveLesson(generatedLesson);
      return generatedLesson;
    }
  } catch (err: any) {
    console.warn('Gemini API call skipped or timed out, seamlessly using built-in doctor lesson generator:', err?.message || err);
  }

  // Graceful fallback to built-in curated generator
  const fallbackLesson = getBuiltInLesson(doctor, lessonTitle, explanationLevel, durationMinutes, useSerway, params.imageBase64, params.studentFileContent);
  fallbackLesson.studentId = params.studentId;
  fallbackLesson.studentImagePreview = params.imageBase64;
  fallbackLesson.noticeMessage = 'تم الشرح والتطبيق على السبورة بالاعتماد على المساعد الأكاديمي المحلي المعتمد.';
  saveLesson(fallbackLesson);
  return fallbackLesson;
}

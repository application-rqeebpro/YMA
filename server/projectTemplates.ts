import { EngineeringProjectData, ProjectReferenceItem } from '../src/types';

export const OFFICIAL_MECHATRONICS_REFERENCES: ProjectReferenceItem[] = [
  {
    type: 'book',
    title: 'هندسة التحكم والميكاترونكس وتطبيقات المتحكمات الدقيقة',
    chapterOrSection: 'الباب الرابع: قيادة محركات التيار المستمر وإشارات PWM والجسور الإلكترونية H-Bridge',
    pageNumber: 'ص 114 - 128',
    sourceNote: 'المرجع الأكاديمي المعتمد - قسم هندسة الميكاترونكس',
  },
  {
    type: 'book',
    title: 'دليل مشاريع ميكروكنترولر Arduino والأنظمة المدمجة الذكية',
    chapterOrSection: 'الفصل الثالث: حساسات الموجات فوق الصوتية وتفادي العوائق للمركبات الذكية',
    pageNumber: 'ص 72 - 95',
    sourceNote: 'مختبر الروبوتات والأنظمة الذكية بالأكاديمية',
  },
  {
    type: 'book',
    title: 'أسس الدوائر الكهربائية والإلكترونيات الصناعية',
    chapterOrSection: 'الفصل الخامس: منظمات الجهد ودوائر التغذية وتوزيع التيارات',
    pageNumber: 'ص 88 - 104',
    sourceNote: 'مقرر الدوائر الإلكترونية - المستوى الأول والثاني',
  },
  {
    type: 'book',
    title: 'مقدمة في ديناميكا الطيران وأنظمة الطائرات المسيرة (UAVs)',
    chapterOrSection: 'الفصل الثاني: المحركات عديمة المسفرات (BLDC)، متحكمات السرعة ESC، والاستقرار عبر PID',
    pageNumber: 'ص 45 - 68',
    sourceNote: 'مرجع هندسة الطيران والروبوتات الجوية التعليمي',
  },
];


export interface ProjectPresetButton {
  id: string;
  templateKey: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  promptExample: string;
}

export const PROJECT_PRESET_BUTTONS: ProjectPresetButton[] = [
  {
    id: 'preset-car',
    templateKey: 'arduino-obstacle-avoiding-car',
    title: '🚗 سيارة Arduino',
    category: 'arduino',
    icon: 'Car',
    description: 'سيارة روبوتية تتجنب العوائق بحساس Ultrasonic ودرايفر L298N وسيرفو',
    promptExample: 'أريد صناعة سيارة روبوت باستخدام Arduino تتجنب العوائق وتفحص المسار يميناً ويساراً',
  },
  {
    id: 'preset-arm',
    templateKey: 'robotic-arm-4dof',
    title: '🤖 ذراع روبوت',
    category: 'robotics',
    icon: 'Bot',
    description: 'ذراع آلية 4 محاور تحكم بمحركات سيرفو وعصا تحكم ثنائية Joystick',
    promptExample: 'أريد صناعة ذراع روبوت 4 محاور بالتحكم اليدوي عبر جويستيك وتغذية منفصلة',
  },
  {
    id: 'preset-drone',
    templateKey: 'educational-quadcopter-drone',
    title: '🚁 مشروع Drone تعليمي',
    category: 'drone',
    icon: 'Plane',
    description: 'طائرة درون كوادكوبتر تعليمية مع محركات BLDC ومتحكمات ESC وخوارزمية PID',
    promptExample: 'أريد مشروع طائرة درون تعليمية مع شرح اتزان الطيران ومتحكم PID والحساسات',
  },
  {
    id: 'preset-line',
    templateKey: 'line-follower-robot',
    title: '🛞 روبوت متتبع الخط',
    category: 'robotics',
    icon: 'Navigation',
    description: 'روبوت تتبع مسار عالي الدقة بمصفوفة حساسات IR وخوارزمية تحكم تفاضلية',
    promptExample: 'أريد تصميم روبوت يتتبع الخط الأسود باستخدام مصفوفة حساسات الأشعة تحت الحمراء',
  },
  {
    id: 'preset-home',
    templateKey: 'smart-home-automation',
    title: '🏠 منزل ذكي',
    category: 'iot',
    icon: 'Home',
    description: 'نظام أتمتة منزلية مع إنذار تسريب الغاز، وحساس حركة، وتحكم بالمرحلات',
    promptExample: 'أريد مشروع نظام منزل ذكي متكامل للكشف عن الغاز والحريق والتحكم بالإضاءة آلياً',
  },
  {
    id: 'preset-traffic',
    templateKey: 'smart-traffic-light',
    title: '🚦 إشارة مرور ذكية',
    category: 'automation',
    icon: 'TrafficCone',
    description: 'إشارات مرور متكيفة مع كثافة السير وأولوية لمركبات الإسعاف والطوارئ',
    promptExample: 'أريد مشروع إشارة مرور ذكية تغير زمن الإشارات بناءً على كثافة السيارات وحساسات المسافة',
  },
  {
    id: 'preset-temp',
    templateKey: 'temperature-cooling-system',
    title: '🌡️ نظام قياس الحرارة',
    category: 'control',
    icon: 'Thermometer',
    description: 'نظام تكييف وتبريد تلقائي مع حساس DHT22 وشاشة LCD وتشغيل مروحة DC',
    promptExample: 'أريد نظام تحكم بدرجة الحرارة والرطوبة مع شاشة عرض وتشغيل مروحة تبريد تلقائياً',
  },
  {
    id: 'preset-motor',
    templateKey: 'motor-speed-direction-control',
    title: '⚙️ نظام تحكم بمحرك',
    category: 'mechatronics',
    icon: 'Cog',
    description: 'تحكم متقدم بسرعة وعزم دوران محركات التيار المستمر عبر PWM ومحددات سرعة',
    promptExample: 'أريد مشروع للتحكم بسرعة واتجاه دوران محرك DC باستخدام PWM ومقاومة متغيرة ودرايفر',
  },
  {
    id: 'preset-circuit',
    templateKey: 'electronic-circuits-project',
    title: '🔌 مشروع دوائر إلكترونية',
    category: 'circuits',
    icon: 'Zap',
    description: 'دائرة مذبذب نبضي متعدد الاستقرار بالمؤقت 555 ومولد ترددات وفلترة إشارات',
    promptExample: 'أريد تصميم دائرة إلكترونية تعليمية متكاملة باستخدام المؤقت 555 ومكثفات الشحن والتفريغ',
  },
  {
    id: 'preset-custom',
    templateKey: 'custom',
    title: '➕ مشروع مخصص',
    category: 'custom',
    icon: 'Sparkles',
    description: 'اكتب أي فكرة مشروع ميكاترونكس أو روبوتات وسيقوم الذكاء الاصطناعي ببنائها فوراً',
    promptExample: 'أريد صناعة نظام فارز ألوان صناعي باستخدام حساس ألوان TCS3200 ومحرك سيرفو',
  },
];

export const EXTENDED_PROJECT_TEMPLATES: Record<string, EngineeringProjectData> = {
  'line-follower-robot': {
    id: 'proj-line-follower',
    title: 'روبوت متتبع الخط الأسود الذكي (High-Precision Line Follower)',
    category: 'robotics',
    idea: 'روبوت متنقل ذكي يتتبع مساراً محدداً باللون الأسود فوق أرضية بيضاء باستخدام مصفوفة حساسات الأشعة تحت الحمراء IR ومتحكم Arduino، حيث يقارن الانعكاس الضوئي ويضبط سرعات المحركين الأيمن والأيسر تلقائياً للانعطاف السلس دون الخروج عن المسار.',
    targetAudience: 'طلاب هندسة الميكاترونكس والتحكم الآلي والأنظمة الروبوتية',
    components: [
      {
        id: 'lf1',
        name: 'Arduino UNO R3',
        count: 1,
        usage: 'معالجة قراءات حساسات الأشعة تحت الحمراء وتنفيذ خوارزمية التحكم بالانعطاف',
        details: {
          whatIsIt: 'لوحة تطوير بميكروكنترولر ATmega328P.',
          function: 'قراءة الإشارات الرقمية لحساسات المسار وإرسال نبضات PWM لدرايفر المحركات.',
          howItWorks: 'تنفذ حلقة تفاضلية لمقارنة الحساس الأيمن بالأيسر بمعدل تحديث 1000 مرة في الثانية.',
          whereUsed: 'العربات ذاتية القيادة، الروبوتات الصناعية في المستودعات (AGVs).',
          pinoutOrSpecs: '5V, GND, Digital Pins D2-D11',
        },
      },
      {
        id: 'lf2',
        name: 'مصفوفة حساسات المسار IR Sensors (حساسان يمين ويسار TCRT5000)',
        count: 2,
        usage: 'التمييز البصري بين الخط الأسود والأرضية البيضاء عبر امتصاص وانعكاس الأشعة تحت الحمراء',
        details: {
          whatIsIt: 'دايود باعث للأشعة تحت الحمراء وترانزستور ضوئي مستقبل مع مقارن LM393.',
          function: 'يعطي خرجاً منطقياً HIGH (1) عند اللون الأسود الماص للضوء، و LOW (0) عند السطح الأبيض العاكس.',
          howItWorks: 'السطح الأبيض يعكس الأشعة فيعمل الترانزستور، بينما السطح الأسود يمتص الأشعة.',
          whereUsed: 'روبوتات المستودعات الذكية، خطوط الإنتاج، والفرز الآلي.',
          pinoutOrSpecs: 'VCC (5V), GND, Digital Output (DO)',
        },
      },
      {
        id: 'lf3',
        name: 'وحدة قيادة المحركات L298N Dual H-Bridge',
        count: 1,
        usage: 'التحكم التفاضلي بسرعة محركي الدفع الأيمن والأيسر لتوجيه الروبوت',
        details: {
          whatIsIt: 'درايفر محركات ثنائي الجسر H-Bridge بقدرة تيار 2 أمبير.',
          function: 'استقبال نبضات PWM من الأردوينو لتغيير سرعة دوران كل محرك على حدة.',
          howItWorks: 'تقليل سرعة المحرك الأيمن وزيادة سرعة الأيسر يسبب دوران الروبوت جهة اليمين.',
          whereUsed: 'العربات الصناعية الذكية، الروبوتات المتنقلة.',
          pinoutOrSpecs: 'ENA, IN1, IN2, IN3, IN4, ENB, 12V, GND, 5V',
        },
      },
      {
        id: 'lf4',
        name: 'محركات DC Gear Motors مع عجلات مطاطية',
        count: 2,
        usage: 'توفير الحركة التفاضلية السريعة والمستقرة',
        details: {
          whatIsIt: 'محركات كهربائية مستمرة بصندوق تروس مضاعف للعزم 1:48.',
          function: 'تحريك العجلات الدافعة.',
          howItWorks: 'الدفع التفاضلي (Differential Drive).',
          whereUsed: 'روبوتات المسابقات والمصانع.',
        },
      },
      {
        id: 'lf5',
        name: 'هيكل شاسيه سيارة روبوت مع عجلة حرة Caster Wheel',
        count: 1,
        usage: 'تثبيت الحساسات على ارتفاع 5-10 مم من الأرض لحماية الدقة',
        details: {
          whatIsIt: 'شاسيه خفيف الوزن مع عجلة معدنية دوارة 360 درجة.',
          function: 'الاتزان الميكانيكي والانسيابية.',
          howItWorks: 'نظام حركة ثلاثي النقاط.',
        },
      },
      {
        id: 'lf6',
        name: 'حامل بطاريات ليثيوم 2x 18650 مع مفتاح تشغيل',
        count: 1,
        usage: 'تغذية المحركات والأردوينو بجهد مستقر 7.4V',
        details: {
          whatIsIt: 'بطاريات أيونات الليثيوم عالية التفريغ.',
          function: 'مصدر الطاقة المتنقل.',
          howItWorks: 'تفريغ تيار كيميائي مستمر.',
        },
      },
    ],
    connections: [
      { fromComponent: 'Right IR Sensor', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية الحساس الأيمن' },
      { fromComponent: 'Right IR Sensor', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'الأرضي' },
      { fromComponent: 'Right IR Sensor', fromPin: 'OUT', toComponent: 'Arduino UNO', toPin: 'D2', wireColor: 'blue', signalType: 'Digital', notes: 'إشارة الحساس الأيمن' },
      { fromComponent: 'Left IR Sensor', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية الحساس الأيسر' },
      { fromComponent: 'Left IR Sensor', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'الأرضي' },
      { fromComponent: 'Left IR Sensor', fromPin: 'OUT', toComponent: 'Arduino UNO', toPin: 'D3', wireColor: 'blue', signalType: 'Digital', notes: 'إشارة الحساس الأيسر' },
      { fromComponent: 'L298N Driver', fromPin: 'IN1', toComponent: 'Arduino UNO', toPin: 'D4', wireColor: 'green', signalType: 'Digital', notes: 'اتجاه المحرك الأيسر 1' },
      { fromComponent: 'L298N Driver', fromPin: 'IN2', toComponent: 'Arduino UNO', toPin: 'D5', wireColor: 'green', signalType: 'Digital', notes: 'اتجاه المحرك الأيسر 2' },
      { fromComponent: 'L298N Driver', fromPin: 'IN3', toComponent: 'Arduino UNO', toPin: 'D6', wireColor: 'green', signalType: 'Digital', notes: 'اتجاه المحرك الأيمن 1' },
      { fromComponent: 'L298N Driver', fromPin: 'IN4', toComponent: 'Arduino UNO', toPin: 'D7', wireColor: 'green', signalType: 'Digital', notes: 'اتجاه المحرك الأيمن 2' },
      { fromComponent: 'L298N Driver', fromPin: 'ENA', toComponent: 'Arduino UNO', toPin: 'D9', wireColor: 'yellow', signalType: 'PWM', notes: 'سرعة المحرك الأيسر PWM' },
      { fromComponent: 'L298N Driver', fromPin: 'ENB', toComponent: 'Arduino UNO', toPin: 'D10', wireColor: 'yellow', signalType: 'PWM', notes: 'سرعة المحرك الأيمن PWM' },
      { fromComponent: 'Battery 7.4V', fromPin: 'Positive (+)', toComponent: 'L298N Driver', toPin: '12V', wireColor: 'red', signalType: 'VIN', notes: 'تغذية المحركات' },
      { fromComponent: 'Battery 7.4V', fromPin: 'Negative (-)', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي مشترك' },
    ],
    pinMapping: [
      { componentName: 'Right IR Sensor', pinFunction: 'Right Line Detection', boardPin: 'D2', codeIdentifier: 'RIGHT_IR_PIN' },
      { componentName: 'Left IR Sensor', pinFunction: 'Left Line Detection', boardPin: 'D3', codeIdentifier: 'LEFT_IR_PIN' },
      { componentName: 'L298N Left Motor In1', pinFunction: 'Left Motor Direction 1', boardPin: 'D4', codeIdentifier: 'LEFT_IN1' },
      { componentName: 'L298N Left Motor In2', pinFunction: 'Left Motor Direction 2', boardPin: 'D5', codeIdentifier: 'LEFT_IN2' },
      { componentName: 'L298N Right Motor In3', pinFunction: 'Right Motor Direction 1', boardPin: 'D6', codeIdentifier: 'RIGHT_IN3' },
      { componentName: 'L298N Right Motor In4', pinFunction: 'Right Motor Direction 2', boardPin: 'D7', codeIdentifier: 'RIGHT_IN4' },
      { componentName: 'L298N Left PWM Enable', pinFunction: 'Left Motor Speed PWM', boardPin: 'D9', codeIdentifier: 'ENA_PIN' },
      { componentName: 'L298N Right PWM Enable', pinFunction: 'Right Motor Speed PWM', boardPin: 'D10', codeIdentifier: 'ENB_PIN' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تجميع الشاسيه وتثبيت محركات الـ DC والعجلات',
        description: 'ثبّت محركي الـ DC في شاسيه الروبوت وقم بتوصيل العجلات المطاطية وتثبيت العجلة الحرة الأمامية كاستر لضمان حركة متوازنة.',
        usedComponents: ['شاسيه الروبوت', 'محركات DC', 'عجلة كاستر'],
      },
      {
        stepNumber: 2,
        title: 'تثبيت مصفوفة حساسات الـ IR على مسافة دقيقة من الأرض',
        description: 'ثبّت الحساسين الأماميين في مقدمة الشاسيه بحيث تكون المسافة بين الحساس والأرضية بين 5 إلى 10 مليمترات فقط للحصول على أفضل دقة قراءة.',
        usedComponents: ['حساسات IR TCRT5000', 'براغي التثبيت'],
        importantNotes: 'معايرة المقاومة المتغيرة (Trimpot) على ظهر كل حساس حتى يضيء مؤشر LED فقط عند وضع الحساس فوق اللون الأبيض وينطفئ فوق الأسود.',
      },
      {
        stepNumber: 3,
        title: 'تركيب وحدة قيادة المحركات L298N وتوصيل خطوط القدرة',
        description: 'ثبّت درايفر L298N في منتصف الشاسيه، ووصّل أطراف المحرك الأيمن والأيسر، وتأكد من إزالة جمبر الـ Enable إذا أردت التحكم التناسبي بالسرعة عبر PWM.',
        usedComponents: ['L298N Driver', 'أسلاك التوصيل'],
        connectionsSummary: 'IN1→D4 | IN2→D5 | IN3→D6 | IN4→D7 | ENA→D9 | ENB→D10',
      },
      {
        stepNumber: 4,
        title: 'رفع كود الأردوينو واختبار الانعطاف على مضمار الاختبار',
        description: 'ارفع الكود وضع الروبوت على مضمار مغلق بخط أسود عرضه 2-3 سم، راقب سرعة استجابة المحركات وسلاسة الانعطاف.',
        usedComponents: ['Arduino UNO', 'شريط لاصق أسود'],
      },
    ],
    code: {
      language: 'arduino',
      filename: 'LineFollowerRobot.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: روبوت متتبع الخط الأسود (Smart Line Follower Robot)
 * التوافق الصارم: الأرجل متطابقة 100% مع مخطط التوصيل
 * ==============================================================
 */

#define RIGHT_IR_PIN 2
#define LEFT_IR_PIN  3

#define LEFT_IN1   4
#define LEFT_IN2   5
#define RIGHT_IN3  6
#define RIGHT_IN4  7

#define ENA_PIN    9
#define ENB_PIN    10

// سرعات المحركات (0 - 255)
const int BASE_SPEED = 160;
const int TURN_SPEED = 140;

void setup() {
  pinMode(RIGHT_IR_PIN, INPUT);
  pinMode(LEFT_IR_PIN, INPUT);

  pinMode(LEFT_IN1, OUTPUT);
  pinMode(LEFT_IN2, OUTPUT);
  pinMode(RIGHT_IN3, OUTPUT);
  pinMode(RIGHT_IN4, OUTPUT);

  pinMode(ENA_PIN, OUTPUT);
  pinMode(ENB_PIN, OUTPUT);

  Serial.begin(9600);
  Serial.println(F("[MCT Academy] Line Follower Online!"));
}

void loop() {
  int rightVal = digitalRead(RIGHT_IR_PIN);
  int leftVal  = digitalRead(LEFT_IR_PIN);

  // ملاحظة الحساس: HIGH (1) = خط أسود، LOW (0) = أرضية بيضاء
  if (leftVal == HIGH && rightVal == HIGH) {
    // كلا الحساسين على الخط (أو تقاطع): تقدم للأمام
    moveForward(BASE_SPEED);
  } 
  else if (leftVal == HIGH && rightVal == LOW) {
    // الحساس الأيسر فقط على الخط: انعطف يساراً
    turnLeft(TURN_SPEED);
  } 
  else if (leftVal == LOW && rightVal == HIGH) {
    // الحساس الأيمن فقط على الخط: انعطف يميناً
    turnRight(TURN_SPEED);
  } 
  else {
    // كلاهما خارج الخط: تقدم ببطء شديد لاستعادة المسار
    moveForward(110);
  }

  delay(5); // استجابة فائقة السرعة
}

void moveForward(int spd) {
  analogWrite(ENA_PIN, spd);
  analogWrite(ENB_PIN, spd);
  digitalWrite(LEFT_IN1, HIGH);
  digitalWrite(LEFT_IN2, LOW);
  digitalWrite(RIGHT_IN3, HIGH);
  digitalWrite(RIGHT_IN4, LOW);
}

void turnLeft(int spd) {
  analogWrite(ENA_PIN, spd);
  analogWrite(ENB_PIN, spd);
  // إيقاف أو عكس المحرك الأيسر لتسريع الدوران
  digitalWrite(LEFT_IN1, LOW);
  digitalWrite(LEFT_IN2, HIGH);
  digitalWrite(RIGHT_IN3, HIGH);
  digitalWrite(RIGHT_IN4, LOW);
}

void turnRight(int spd) {
  analogWrite(ENA_PIN, spd);
  analogWrite(ENB_PIN, spd);
  // إيقاف أو عكس المحرك الأيمن
  digitalWrite(LEFT_IN1, HIGH);
  digitalWrite(LEFT_IN2, LOW);
  digitalWrite(RIGHT_IN3, LOW);
  digitalWrite(RIGHT_IN4, HIGH);
}

void stopMotors() {
  analogWrite(ENA_PIN, 0);
  analogWrite(ENB_PIN, 0);
  digitalWrite(LEFT_IN1, LOW);
  digitalWrite(LEFT_IN2, LOW);
  digitalWrite(RIGHT_IN3, LOW);
  digitalWrite(RIGHT_IN4, LOW);
}
`,
      explanation: 'يقوم الكود بفحص حساسَي الأشعة تحت الحمراء كل 5 ميلي ثانية. عند استشعار أحد الحساسين للخط الأسود، يقوم الميكروكنترولر فوراً بتطبيق حركة تفاضلية: عكس اتجاه المحرك الداخلي وتشغيل المحرك الخارجي لإعادة الروبوت إلى منتصف المسار بسرعة وسلاسة.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 9-18', explanation: 'تعريف أطراف الحساسات ومداخل ومخارج درايفر المحركات والـ PWM.' },
        { lineRange: 'الأسطر 38-54', explanation: 'جدول القرار المنطقي (Truth Table) لتوجيه الروبوت للأمام أو الانعطاف.' },
        { lineRange: 'الأسطر 59-86', explanation: 'دوال الحركة التفاضلية للمحركات باستخدام نبضات analogWrite للسرعة.' },
      ],
      librariesNeeded: [],
      uploadSteps: [
        'وصل الأردوينو بالكمبيوتر عبر كابل USB.',
        'اختر Arduino Uno من قائمة الأدوات.',
        'اضغط رفع (Upload) وافصل كابل الـ USB.',
        'شغل مفتاح البطارية وضع الروبوت على المسار.',
      ],
    },
    testingProcedure: {
      steps: [
        'معايرة حساسية المقاومات المتغيرة على حساسات الـ IR.',
        'رسم مسار تجريبي بخط أسود عرضه 25 مم يشمل منحنيات خفيفة.',
        'تشغيل الروبوت ومراقبة سلوك الانعطاف وسرعة التصحيح.',
      ],
      expectedBehavior: 'تتبع مستمر للخط بدون اهتزاز حاد وبقاء الروبوت في المسار حتى عند المنحنيات الحادة.',
    },
    troubleshooting: [
      {
        symptom: 'الروبوت يدور حول نفسه بشكل دائم',
        possibleCause: 'توصيل أقطاب أحد المحركات معكوساً (OUT1/OUT2).',
        solution: 'اعكس سلكي المحرك المعني في درايفر L298N أو اعكس قيم HIGH/LOW في الكود.',
      },
    ],
    futureImprovements: [
      'استخدام مصفوفة 5 أو 8 حساسات مع خوارزمية PID لتتبع الخط بسرعات عالية جداً (Line Follower Race).',
      'إضافة حساس بالموجات فوق الصوتية لإيقاف الروبوت عند وجود عائق على المسار.',
    ],
    finalResultSummary: 'روبوت صناعي تعليمي يمثل البنية الأساسية للرافعات والمركبات ذاتية القيادة في المستودعات الذكية.',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[0],
      OFFICIAL_MECHATRONICS_REFERENCES[1],
    ],
    simulationConfig: {
      type: 'line_follower',
      defaultSensors: { leftSensor: 0, rightSensor: 1, robotPos: 0 },
    },
  },

  'smart-home-automation': {
    id: 'proj-smart-home',
    title: 'نظام أتمتة المنزل الذكي والأمان الصناعي (Smart Home IoT)',
    category: 'iot',
    idea: 'نظام متكامل لحماية وأتمتة المنشآت يعتمد على كشف تسريب الغاز والحرائق عبر حساس MQ-2، وحساس الحركة PIR لتشغيل الإنذار والإضاءة آلياً عبر مرحل كهربائي Relay، مع شاشة LCD لعرض الحالة وباعث صوتي Buzzer للتحذير الفوري.',
    targetAudience: 'طلاب هندسة الميكاترونكس وإنترنت الأشياء والتحكم الآلي',
    components: [
      {
        id: 'sh1',
        name: 'Arduino UNO R3',
        count: 1,
        usage: 'معالجة قراءات الحساسات وإدارة الإنذارات وتشغيل المرحلات',
        details: {
          whatIsIt: 'لوحة ميكروكنترولر ATmega328P.',
          function: 'المراقبة المستمرة لمستوى الغاز والحركة واتخاذ الإجراءات الوقائية.',
          howItWorks: 'تحويل تناظري رقمي ADC لإشارة الغاز، وقراءة منطقية لإشارة الحركة.',
          whereUsed: 'المباني الذكية، المصانع، وأنظمة الإطفاء والإنذار المبكر.',
        },
      },
      {
        id: 'sh2',
        name: 'حساس الغاز والدخان MQ-2 Gas & Smoke Sensor',
        count: 1,
        usage: 'استشعار الغازات القابلة للاشتعال (LPG، البوتان، الميثان والدخان)',
        details: {
          whatIsIt: 'حساس كيميائي يعتمد على ثاني أكسيد القصدير SnO2.',
          function: 'تنخفض مقاومته الكهربائية عند ملامسة الغازات فيرتفع الجهد الخارج.',
          howItWorks: 'سخان داخلي يسخن مادة الاستشعار لتتفاعل مع الغازات في الهواء.',
          whereUsed: 'المنازل الذكية، المطابخ، ومحطات الوقود.',
          pinoutOrSpecs: 'VCC (5V), GND, A0 (Analog Output), D0 (Digital Threshold)',
        },
      },
      {
        id: 'sh3',
        name: 'حساس الحركة بالأشعة تحت الحمراء PIR Motion Sensor (HC-SR501)',
        count: 1,
        usage: 'رصد وجود الأشخاص لدعم منظومة الأمان والتشغيل الآلي للإضاءة',
        details: {
          whatIsIt: 'حساس كهروبيرو-ضوئي مع عدسة فريسنل Fresnel Lens.',
          function: 'يعطي نبضة HIGH 3.3V عند مرور جسم يشع حرارة بالأشعة تحت الحمراء.',
          howItWorks: 'فرق درجات الحرارة بين البيئة وجسم الإنسان.',
          whereUsed: 'أنظمة الإنذار ضد السرقة، إضاءة الممرات الذكية.',
          pinoutOrSpecs: 'VCC (5V), OUT (D2), GND',
        },
      },
      {
        id: 'sh4',
        name: 'وحدة مرحل كهربائي 1-Channel Relay Module (5V Coil / 250VAC 10A)',
        count: 1,
        usage: 'التحكم الآمن في تشغيل وإطفاء إضاءة المنزل أو شفاط التهوية 220V',
        details: {
          whatIsIt: 'مفتاح كهروميكانيكي مع عازل ضوئي Optocoupler لحماية الأردوينو.',
          function: 'فصل وتوصيل أحمال التيار المتردد المرتفعة بأمر إشارة رقمية 5V.',
          howItWorks: 'ملف مغناطيسي يجذب ريشة التوصيل لتغيير وضعية NO / NC.',
          whereUsed: 'اللوحات الكهربائية، أنظمة التحكم بالمضخات والإنارة.',
          pinoutOrSpecs: 'VCC, GND, IN (D8), COM, NO, NC',
        },
      },
      {
        id: 'sh5',
        name: 'جرس إنذار صوتي Active Buzzer',
        count: 1,
        usage: 'إطلاق صفارة تحذيرية مسموعة عند ارتفاع نسبة الغاز أو اختراق أمني',
        details: {
          whatIsIt: 'باعث صوتي يحتوي على مذبذب داخلي بتردد 2.5 kHz.',
          function: 'إصدار نغمة صوتية عالية عند إعطائه جهد 5V.',
          howItWorks: 'اهتزاز قرص كهرضغطوي بيزوي.',
          whereUsed: 'أجهزة الإنذار والتنبيهات الصناعية.',
          pinoutOrSpecs: 'Positive (D9), Negative (GND)',
        },
      },
      {
        id: 'sh6',
        name: 'شاشة عرض بلورية LCD 16x2 مع محول I2C',
        count: 1,
        usage: 'عرض قراءة نسبة الغاز اللحظية وحالة نظام الأمان بوضوح',
        details: {
          whatIsIt: 'شاشة عرض نصية سطرين في 16 حرفاً موصولة بمحول PCF8574.',
          function: 'توفير واجهة تفاعلية مع المستخدم بسلكين فقط (SDA/SCL).',
          howItWorks: 'بروتوكول I2C ثنائي الأسلاك.',
          whereUsed: 'أجهزة التحكم وأجهزة القياس الميدانية.',
          pinoutOrSpecs: 'VCC (5V), GND, SDA (A4), SCL (A5)',
        },
      },
    ],
    connections: [
      { fromComponent: 'MQ-2 Gas Sensor', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية حساس الغاز' },
      { fromComponent: 'MQ-2 Gas Sensor', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي' },
      { fromComponent: 'MQ-2 Gas Sensor', fromPin: 'A0', toComponent: 'Arduino UNO', toPin: 'A0', wireColor: 'blue', signalType: 'Analog', notes: 'قراءة الغاز التناظرية' },
      { fromComponent: 'PIR Motion Sensor', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية حساس الحركة' },
      { fromComponent: 'PIR Motion Sensor', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي' },
      { fromComponent: 'PIR Motion Sensor', fromPin: 'OUT', toComponent: 'Arduino UNO', toPin: 'D2', wireColor: 'green', signalType: 'Digital', notes: 'إشارة الحركة' },
      { fromComponent: 'Relay Module', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية الريليه' },
      { fromComponent: 'Relay Module', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي' },
      { fromComponent: 'Relay Module', fromPin: 'IN', toComponent: 'Arduino UNO', toPin: 'D8', wireColor: 'purple', signalType: 'Digital', notes: 'أمر تشغيل الريليه' },
      { fromComponent: 'Active Buzzer', fromPin: 'Positive (+)', toComponent: 'Arduino UNO', toPin: 'D9', wireColor: 'yellow', signalType: 'PWM', notes: 'صفارة الإنذار' },
      { fromComponent: 'Active Buzzer', fromPin: 'Negative (-)', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي' },
      { fromComponent: 'LCD 1602 I2C', fromPin: 'SDA', toComponent: 'Arduino UNO', toPin: 'A4', wireColor: 'blue', signalType: 'Analog', notes: 'خط بيانات I2C' },
      { fromComponent: 'LCD 1602 I2C', fromPin: 'SCL', toComponent: 'Arduino UNO', toPin: 'A5', wireColor: 'yellow', signalType: 'Analog', notes: 'خط ساعة I2C' },
    ],
    pinMapping: [
      { componentName: 'MQ-2 Gas Sensor', pinFunction: 'Gas Analog Level', boardPin: 'A0', codeIdentifier: 'GAS_SENSOR_PIN' },
      { componentName: 'PIR Motion Sensor', pinFunction: 'PIR Motion Digital In', boardPin: 'D2', codeIdentifier: 'PIR_SENSOR_PIN' },
      { componentName: 'Relay 5V Module', pinFunction: 'Relay Control Out', boardPin: 'D8', codeIdentifier: 'RELAY_PIN' },
      { componentName: 'Active Buzzer', pinFunction: 'Alarm Buzzer Out', boardPin: 'D9', codeIdentifier: 'BUZZER_PIN' },
      { componentName: 'LCD I2C Data', pinFunction: 'I2C Serial Data', boardPin: 'A4', codeIdentifier: 'SDA_PIN' },
      { componentName: 'LCD I2C Clock', pinFunction: 'I2C Serial Clock', boardPin: 'A5', codeIdentifier: 'SCL_PIN' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'توصيل حساس الغاز MQ-2 وإجراء فترة التسخين الأولي (Preheat)',
        description: 'وصّل أطراف الحساس بأطراف 5V و GND و A0. يحتاج حساس MQ-2 إلى دقيقة واحدة من التسخين لتستقر قراءاته الأساسية في الهواء النقي.',
        usedComponents: ['حساس MQ-2', 'أسلاك التوصيل'],
        importantNotes: 'سخونة سطح الحساس طبيعية تماماً نظراً لوجود السخان الداخلي.',
      },
      {
        stepNumber: 2,
        title: 'توصيل حساس الحركة PIR وضبط وقت التأخير والمدى',
        description: 'وصّل خرج الحساس بالطرف D2 في الأردوينو. اضبط مقاومة Time Delay ومقاومة Sensitivity لضبط مدى الرصد المطلوب (3 إلى 7 أمتار).',
        usedComponents: ['حساس PIR HC-SR501'],
      },
      {
        stepNumber: 3,
        title: 'توصيل وحدة المرحل Relay والباعث الصوتي Buzzer',
        description: 'وصّل مدخل الريليه بالطرف D8 والبزر بالطرف D9. الريليه يعمل بعازل بصري لمنع عودة التيارات العكسية للأردوينو.',
        usedComponents: ['Relay Module', 'Active Buzzer'],
        cautionNotice: 'تحذير أمان: عند تجربة توصيل أحمال 220V بالريليه، تأكد من فصل التيار الكهربائي تماماً وعزل أطراف التوصيل لمنع الصدمات الكهربائية.',
      },
      {
        stepNumber: 4,
        title: 'توصيل شاشة LCD I2C وبرمجة الأردوينو',
        description: 'وصّل SDA بـ A4 و SCL بـ A5، وارفع الكود البرمجي لمراقبة شاشة LCD واختبار الإنذار عند تقريب مصدر غاز خفيف.',
        usedComponents: ['LCD 1602 I2C', 'Arduino UNO'],
      },
    ],
    code: {
      language: 'arduino',
      filename: 'SmartHomeSafetySystem.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: نظام أتمتة المنزل الذكي والأمان (Smart Home Safety)
 * التوافق الصارم: الأرجل متطابقة 100% مع مخطط التوصيل
 * ==============================================================
 */

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define GAS_SENSOR_PIN A0
#define PIR_SENSOR_PIN 2
#define RELAY_PIN      8
#define BUZZER_PIN     9

// عنوان I2C لشاشة الـ LCD وحجمها 16 عمود × سطرين
LiquidCrystal_I2C lcd(0x27, 16, 2);

// حد الأمان لنسبة الغاز (0 - 1023)
const int GAS_THRESHOLD = 380;

void setup() {
  pinMode(GAS_SENSOR_PIN, INPUT);
  pinMode(PIR_SENSOR_PIN, INPUT);

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // إبقاء الريليه والبزر متوقفين في البداية
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.begin(9600);
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("MCT Smart Home");
  lcd.setCursor(0, 1);
  lcd.print("System Warming..");
  delay(1500);
  lcd.clear();
}

void loop() {
  int gasValue = analogRead(GAS_SENSOR_PIN);
  int motionDetected = digitalRead(PIR_SENSOR_PIN);

  // تحديث شاشة LCD
  lcd.setCursor(0, 0);
  lcd.print("Gas: ");
  lcd.print(gasValue);
  lcd.print(" PPM   ");

  lcd.setCursor(0, 1);
  if (motionDetected == HIGH) {
    lcd.print("Motion: ACTIVE ");
    digitalWrite(RELAY_PIN, HIGH); // تشغيل إضاءة الممر آلياً
  } else {
    lcd.print("Motion: CLEAR  ");
    digitalWrite(RELAY_PIN, LOW);
  }

  // فحص حالة تسريب الغاز
  if (gasValue > GAS_THRESHOLD) {
    // حالة طوارئ: تسريب غاز
    digitalWrite(BUZZER_PIN, HIGH);
    lcd.setCursor(11, 0);
    lcd.print("!DANGER");
    Serial.println(F("[WARNING] Gas Leak Detected! Alarm Active."));
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    lcd.setCursor(11, 0);
    lcd.print(" SAFE  ");
  }

  delay(200);
}
`,
      explanation: 'يراقب النظام الحساسين باستمرار. عند ارتفاع قراءة حساس الغاز فوق حد الأمان (380)، يُفعّل البزر فوراً وتُعرض رسالة تحذيرية على الشاشة. وفي حال رصد حركة إنسان عبر حساس PIR، يُشغّل المرحل Relay إضاءة المنزل تلقائياً.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 9-15', explanation: 'تعريف أطراف الحساسات والمرحل وشاشة الـ I2C.' },
        { lineRange: 'الأسطر 39-55', explanation: 'قراءة الإشارات وتحديث شاشة العرض وإدارة الإضاءة الآلية.' },
        { lineRange: 'الأسطر 58-69', explanation: 'منظومة الإنذار الصوتي الفوري عند تسريب الغاز.' },
      ],
      librariesNeeded: ['Wire.h', 'LiquidCrystal_I2C.h'],
      uploadSteps: [
        'تثبيت مكتبة LiquidCrystal_I2C من مدير مكتبات Arduino IDE.',
        'توصيل كابل USB واختيار اللوحة والمنفذ.',
        'رفع الكود والتحقق من اشتغال إضاءة الشاشة الخلفية.',
      ],
    },
    testingProcedure: {
      steps: [
        'مراقبة قراءة الغاز على الشاشة في الهواء الطبيعي (حوالي 80-200).',
        'تقريب غاز قداحة بدون لهب وملاحظة قفز القراءة فوق 400 وتفعيل البزر.',
        'التحرك أمام حساس PIR ومراقبة إغلاق المرحل (سماع صوت تكة الريليه).',
      ],
      expectedBehavior: 'استجابة إنذار فورية وموثوقة مع تحديث سلس لقراءات الشاشة.',
    },
    troubleshooting: [
      {
        symptom: 'شاشة الـ LCD تضيء ولكن لا يظهر أي نص',
        possibleCause: 'مقاومة تباين الشاشة الزرقاء (Contrast Trimpot) غير مضبوطة أو عنوان I2C مختلف.',
        solution: 'أدر المقاومة المتغيرة الصغيرة خلف الشاشة بمفك، وتأكد من عنوان I2C (غالباً 0x27 أو 0x3F).',
      },
    ],
    futureImprovements: [
      'تحديث النظام بمتحكم ESP32 أو ESP8266 لإرسال إشعارات فورية لهاتف المستخدم عبر تيليجرام أو تطبيق Blynk.',
      'إضافة محرك سيرفو لإغلاق محبس أسطوانة الغاز الرئيسي آلياً فور كشف التسريب.',
    ],
    finalResultSummary: 'نظام حماية منزلي متطور يجمع بين الأمان الذكي والراحة وترشيد استهلاك الطاقة.',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[1],
      OFFICIAL_MECHATRONICS_REFERENCES[2],
    ],
    simulationConfig: {
      type: 'generic',
      defaultSensors: { gasPpm: 120, motionState: 0, relayState: 0 },
    },
  },

  'smart-traffic-light': {
    id: 'proj-smart-traffic',
    title: 'نظام إشارات المرور الذكية المتكيفة مع الكثافة (Adaptive Traffic System)',
    category: 'automation',
    idea: 'نظام مرور ذكي يعالج مشاكل الازدحام عبر قراءة كثافة السيارات في كل مسار باستخدام حساسات المسافة بالموجات فوق الصوتية، وتمديد زمن الإشارة الخضراء تلقائياً للمسار المزدحم وتقليله للمسار الفارغ مع وضع إخلاء طارئ لمركبات الإسعاف.',
    targetAudience: 'طلاب هندسة الميكاترونكس والتحكم الآلي وأنظمة المدن الذكية',
    components: [
      {
        id: 'st1',
        name: 'Arduino UNO R3',
        count: 1,
        usage: 'تنفيذ خوارزمية التوقيت المتكيف وإدارة دورة الإشارات الضوئية',
        details: {
          whatIsIt: 'المتحكم المركزي للنظام.',
          function: 'حساب الفروق الزمنية بين الإشارات بناءً على عدد السيارات المنتظرة.',
          howItWorks: 'مصفوفة حالات Finite State Machine (FSM).',
          whereUsed: 'إشارات المرور الحديثة وأنظمة تنظيم السير الذكية.',
        },
      },
      {
        id: 'st2',
        name: 'مجموعة ليدات إشارات المرور (6 دايودات ملونة: 2 أحمر، 2 أصفر، 2 أخضر)',
        count: 6,
        usage: 'تمثيل إشارات المرور لمفترق طرق باتجاهين رئيسيين (Road A & Road B)',
        details: {
          whatIsIt: 'صمامات ثنائية باعثة للضوء LED بقطر 5 مم مع مقاومات حماية 220 أوم.',
          function: 'إرشاد السائقين بالتوقف، الاستعداد، والانطلاق.',
          howItWorks: 'انبعاث فوتونات ضوئية عند مرور التيار في الوصلة PN.',
          whereUsed: 'إشارات المرور العالمية.',
        },
      },
      {
        id: 'st3',
        name: 'حساسات مسافة فوق صوتية HC-SR04',
        count: 2,
        usage: 'حساب مسافة طابور السيارات في المسارين A و B لقياس الكثافة',
        details: {
          whatIsIt: 'حساسات مسافة صوتية دقيقة.',
          function: 'قياس المسافة اللحظية؛ كلما قلت المسافة دلّ ذلك على تكدس السيارات قرب الإشارة.',
          howItWorks: 'زمن ارتداد الموجات الصوتية.',
        },
      },
      {
        id: 'st4',
        name: 'زر ضاغط للطوارئ (Emergency Ambulance Override Pushbutton)',
        count: 1,
        usage: 'محاكاة مرور سيارة إسعاف لفتح الإشارة الخضراء فوراً وإيقاف باقي المسارات',
        details: {
          whatIsIt: 'مفتاح تلامس لحظي مع مقاومة Pull-down داخلية.',
          function: 'مقاطعة دورة التوقيت العادية وإعطاء أولوية المرور القصوى.',
          howItWorks: 'إشارة مقاطعة خارجية Hardware Interrupt.',
        },
      },
    ],
    connections: [
      { fromComponent: 'Road A Red LED', fromPin: 'Anode (+)', toComponent: 'Arduino UNO', toPin: 'D2', wireColor: 'red', signalType: 'Digital', notes: 'أحمر مسار A' },
      { fromComponent: 'Road A Yellow LED', fromPin: 'Anode (+)', toComponent: 'Arduino UNO', toPin: 'D3', wireColor: 'yellow', signalType: 'Digital', notes: 'أصفر مسار A' },
      { fromComponent: 'Road A Green LED', fromPin: 'Anode (+)', toComponent: 'Arduino UNO', toPin: 'D4', wireColor: 'green', signalType: 'Digital', notes: 'أخضر مسار A' },
      { fromComponent: 'Road B Red LED', fromPin: 'Anode (+)', toComponent: 'Arduino UNO', toPin: 'D5', wireColor: 'red', signalType: 'Digital', notes: 'أحمر مسار B' },
      { fromComponent: 'Road B Yellow LED', fromPin: 'Anode (+)', toComponent: 'Arduino UNO', toPin: 'D6', wireColor: 'yellow', signalType: 'Digital', notes: 'أصفر مسار B' },
      { fromComponent: 'Road B Green LED', fromPin: 'Anode (+)', toComponent: 'Arduino UNO', toPin: 'D7', wireColor: 'green', signalType: 'Digital', notes: 'أخضر مسار B' },
      { fromComponent: 'Sensor A TRIG', fromPin: 'TRIG', toComponent: 'Arduino UNO', toPin: 'D8', wireColor: 'blue', signalType: 'Digital', notes: 'إرسال حساس مسار A' },
      { fromComponent: 'Sensor A ECHO', fromPin: 'ECHO', toComponent: 'Arduino UNO', toPin: 'D9', wireColor: 'blue', signalType: 'Digital', notes: 'استقبال صدى مسار A' },
      { fromComponent: 'Sensor B TRIG', fromPin: 'TRIG', toComponent: 'Arduino UNO', toPin: 'D10', wireColor: 'purple', signalType: 'Digital', notes: 'إرسال حساس مسار B' },
      { fromComponent: 'Sensor B ECHO', fromPin: 'ECHO', toComponent: 'Arduino UNO', toPin: 'D11', wireColor: 'purple', signalType: 'Digital', notes: 'استقبال صدى مسار B' },
      { fromComponent: 'Emergency Button', fromPin: 'Pin 1', toComponent: 'Arduino UNO', toPin: 'D12', wireColor: 'orange', signalType: 'Digital', notes: 'زر الطوارئ' },
    ],
    pinMapping: [
      { componentName: 'Road A Red LED', pinFunction: 'Road A Red Light', boardPin: 'D2', codeIdentifier: 'RED_A_PIN' },
      { componentName: 'Road A Yellow LED', pinFunction: 'Road A Yellow Light', boardPin: 'D3', codeIdentifier: 'YEL_A_PIN' },
      { componentName: 'Road A Green LED', pinFunction: 'Road A Green Light', boardPin: 'D4', codeIdentifier: 'GRN_A_PIN' },
      { componentName: 'Road B Red LED', pinFunction: 'Road B Red Light', boardPin: 'D5', codeIdentifier: 'RED_B_PIN' },
      { componentName: 'Road B Yellow LED', pinFunction: 'Road B Yellow Light', boardPin: 'D6', codeIdentifier: 'YEL_B_PIN' },
      { componentName: 'Road B Green LED', pinFunction: 'Road B Green Light', boardPin: 'D7', codeIdentifier: 'GRN_B_PIN' },
      { componentName: 'Sensor A Trig', pinFunction: 'Sonar A Trigger', boardPin: 'D8', codeIdentifier: 'TRIG_A_PIN' },
      { componentName: 'Sensor A Echo', pinFunction: 'Sonar A Echo', boardPin: 'D9', codeIdentifier: 'ECHO_A_PIN' },
      { componentName: 'Sensor B Trig', pinFunction: 'Sonar B Trigger', boardPin: 'D10', codeIdentifier: 'TRIG_B_PIN' },
      { componentName: 'Sensor B Echo', pinFunction: 'Sonar B Echo', boardPin: 'D11', codeIdentifier: 'ECHO_B_PIN' },
      { componentName: 'Emergency Button', pinFunction: 'Ambulance Priority In', boardPin: 'D12', codeIdentifier: 'EMERGENCY_PIN' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تثبيت وتوصيل ليدات إشارات المرور للمسارين A و B',
        description: 'وصّل كاثود الليدات بالأرضي المشترك عبر مقاومات 220 أوم، والأنود بالأطراف من D2 إلى D7 حسب الترتيب الهندسي.',
        usedComponents: ['6x LEDs ملونة', '6x مقاومات 220Ω', 'لوحة تجارب'],
      },
      {
        stepNumber: 2,
        title: 'توصيل حساسات الكثافة المرورية فوق الصوتية',
        description: 'ثبّت الحساس A والحساس B في اتجاه المسارين ووصّل TRIG و ECHO بأطراف D8-D11 بالأردوينو.',
        usedComponents: ['2x HC-SR04', 'أسلاك التوصيل'],
      },
      {
        stepNumber: 3,
        title: 'توصيل زر الطوارئ ورفع الكود التكيفي',
        description: 'وصّل زر الطوارئ بالطرف D12 مع تفعيل المقاومة الداخلية INPUT_PULLUP، وارفع الكود البرمجي لمراقبة التوقيت الذكي.',
        usedComponents: ['Pushbutton', 'Arduino UNO'],
      },
    ],
    code: {
      language: 'arduino',
      filename: 'AdaptiveSmartTrafficSystem.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: إشارات المرور الذكية المتكيفة (Adaptive Traffic Light)
 * التوافق الصارم: الأرجل متطابقة 100% مع مخطط التوصيل
 * ==============================================================
 */

#define RED_A_PIN 2
#define YEL_A_PIN 3
#define GRN_A_PIN 4

#define RED_B_PIN 5
#define YEL_B_PIN 6
#define GRN_B_PIN 7

#define TRIG_A_PIN 8
#define ECHO_A_PIN 9
#define TRIG_B_PIN 10
#define ECHO_B_PIN 11

#define EMERGENCY_PIN 12

long readDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return 100;
  return duration * 0.034 / 2;
}

void setup() {
  for (int p = 2; p <= 7; p++) pinMode(p, OUTPUT);
  pinMode(TRIG_A_PIN, OUTPUT);
  pinMode(ECHO_A_PIN, INPUT);
  pinMode(TRIG_B_PIN, OUTPUT);
  pinMode(ECHO_B_PIN, INPUT);
  pinMode(EMERGENCY_PIN, INPUT_PULLUP);

  Serial.begin(9600);
  Serial.println(F("[MCT Academy] Adaptive Traffic System Online!"));
}

void loop() {
  // فحص زر الطوارئ أولاً (أولوية سيارة الإسعاف)
  if (digitalRead(EMERGENCY_PIN) == LOW) {
    handleEmergencyMode();
    return;
  }

  long distA = readDistance(TRIG_A_PIN, ECHO_A_PIN);
  long distB = readDistance(TRIG_B_PIN, ECHO_B_PIN);

  // حساب أزمنة الإشارة الخضراء ديناميكياً
  // مسافة أقل = كثافة سيارات أعلى = وقت أخضر أطول
  int greenTimeA = (distA < 15) ? 6000 : 3000;
  int greenTimeB = (distB < 15) ? 6000 : 3000;

  // المرحلة 1: المسار A أخضر، المسار B أحمر
  digitalWrite(GRN_A_PIN, HIGH);
  digitalWrite(RED_A_PIN, LOW);
  digitalWrite(YEL_A_PIN, LOW);

  digitalWrite(RED_B_PIN, HIGH);
  digitalWrite(YEL_B_PIN, LOW);
  digitalWrite(GRN_B_PIN, LOW);
  delay(greenTimeA);

  // المرحلة 2: مسار A أصفر (استعداد للتوقف)
  digitalWrite(GRN_A_PIN, LOW);
  digitalWrite(YEL_A_PIN, HIGH);
  delay(1200);
  digitalWrite(YEL_A_PIN, LOW);
  digitalWrite(RED_A_PIN, HIGH);

  // المرحلة 3: المسار B أخضر، المسار A أحمر
  digitalWrite(RED_B_PIN, LOW);
  digitalWrite(GRN_B_PIN, HIGH);
  delay(greenTimeB);

  // المرحلة 4: مسار B أصفر
  digitalWrite(GRN_B_PIN, LOW);
  digitalWrite(YEL_B_PIN, HIGH);
  delay(1200);
  digitalWrite(YEL_B_PIN, LOW);
}

void handleEmergencyMode() {
  Serial.println(F("[EMERGENCY] Ambulance Priority Override!"));
  // فتح المسار الرئيسي فوراً وإيقاف باقي التقاطع
  digitalWrite(GRN_A_PIN, HIGH);
  digitalWrite(RED_A_PIN, LOW);
  digitalWrite(YEL_A_PIN, LOW);
  digitalWrite(RED_B_PIN, HIGH);
  digitalWrite(YEL_B_PIN, LOW);
  digitalWrite(GRN_B_PIN, LOW);
  delay(4000); // إتاحة وقت كافٍ لمرور مركبة الطوارئ
}
`,
      explanation: 'يقيس الكود المسافة في المسارين. إذا اكتشف حساس المسار A تكدساً للسيارات لمسافة قريبة (أقل من 15 سم في النموذج المصغر)، يضاعف مدة الإشارة الخضراء لتفريغ الازدحام، كما يستجيب زر الطوارئ فوراً لفتح الطريق لمركبات الإسعاف.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 9-21', explanation: 'تعريف أطراف الليدات والحساسات وزر الطوارئ.' },
        { lineRange: 'الأسطر 48-60', explanation: 'حساب زمن الإشارة الخضراء المتكيف وفق الكثافة المرورية.' },
        { lineRange: 'الأسطر 84-95', explanation: 'دالة الطوارئ وإخلاء الطريق السريع.' },
      ],
      librariesNeeded: [],
      uploadSteps: [
        'افتح Arduino IDE، اختر المنفذ ولوحة Uno.',
        'ارفع البرنامج وتأكد من عمل ألوان الليدات بالتتابع.',
      ],
    },
    testingProcedure: {
      steps: [
        'تشغيل النظام ومراقبة تبادل الإشارات الأخضر والأحمر كل 3 ثوانٍ.',
        'وضع مجسم سيارة أمام الحساس A وملاحظة تمدد الإشارة الخضراء إلى 6 ثوانٍ.',
        'الضغط على زر الطوارئ ورؤية التحول الفوري للأخضر لسيارة الإسعاف.',
      ],
      expectedBehavior: 'تكيف زمني ذكي واستجابة سريعة لظروف الازدحام والطوارئ.',
    },
    troubleshooting: [
      {
        symptom: 'الليد الأخضر والأحمر يعملان في نفس اللحظة لنفس المسار',
        possibleCause: 'خطأ في ترتيب الأسلاك بين D2 و D7.',
        solution: 'راجع جدول Pin Mapping وتأكد من أن كل ليد متصل برقمه الصحيح.',
      },
    ],
    futureImprovements: [
      'استخدام كاميرا ذكاء اصطناعي ESP32-CAM للتعرف على أرقام لوحات السيارات وحساب الكثافة بالرؤية الحاسوبية.',
      'ربط إشارات المرور المجاورة في شبكة موحدة عبر بروتوكول Zigbee لتشكيل الموجة الخضراء (Green Wave).',
    ],
    finalResultSummary: 'نموذج محاكاة هندسي متقدم لأنظمة النقل الذكية (Intelligent Transportation Systems - ITS).',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[1],
      OFFICIAL_MECHATRONICS_REFERENCES[2],
    ],
    simulationConfig: {
      type: 'smart_traffic',
      defaultSensors: { trafficA: 1, trafficB: 0, emergency: 0 },
    },
  },

  'temperature-cooling-system': {
    id: 'proj-temperature-control',
    title: 'نظام قياس والتحكم الذكي بدرجة الحرارة والتبريد (HVAC Controller)',
    category: 'control',
    idea: 'نظام تكييف صناعي ذكي يقيس درجة الحرارة والرطوبة بدقة متناهية عبر حساس DHT22، ويعرضها على شاشة LCD مع تشغيل مروحة تبريد DC تلقائياً عبر ترانزستور أو درايفر PWM تتناسب سرعته طردياً مع ارتفاع الحرارة، مع صفارة إنذار عند تجاوز الحدود الحرارية الحرجة.',
    targetAudience: 'طلاب هندسة الميكاترونكس وأنظمة التحكم والتكييف وتبريد الأجهزة',
    components: [
      {
        id: 'tc1',
        name: 'Arduino UNO R3',
        count: 1,
        usage: 'معالجة قراءات الحرارة وتوليد إشارة PWM تناسبية لسرعة مروحة التبريد',
        details: {
          whatIsIt: 'المتحكم الرئيسي.',
          function: 'تنفيذ خوارزمية التحكم التناسبي (Proportional Control).',
          howItWorks: 'قراءة بروتوكول السلك الواحد 1-Wire من حساس DHT22.',
          whereUsed: 'أنظمة التكييف، غرف السيرفرات، وحاضنات البيئة المعقمة.',
        },
      },
      {
        id: 'tc2',
        name: 'حساس درجة الحرارة والرطوبة الرقمي DHT22 (AM2302)',
        count: 1,
        usage: 'قياس دقيق لدرجة الحرارة من -40 إلى +80 درجة مئوية والرطوبة من 0 إلى 100%',
        details: {
          whatIsIt: 'حساس سعوي للرطوبة وثرمستور حراري مدمج مع رقاقة تحويل رقمي 8 بت.',
          function: 'إرسال بيانات الحرارة والرطوبة عبر سلك بيانات رقمي واحد بدقة 0.1 درجة.',
          howItWorks: 'تغير سعة البوليمر مع الرطوبة وتغير مقاومة الثرمستور مع الحرارة.',
          whereUsed: 'محطات الرصد الجوي، الصوب الزراعية، والمختبرات.',
          pinoutOrSpecs: 'VCC (3.3V-5V), DATA (D2), NC, GND',
        },
      },
      {
        id: 'tc3',
        name: 'مروحة تبريد كهربائية 5V/12V Brushless DC Fan',
        count: 1,
        usage: 'طرد الحرارة وتبريد النظام تلقائياً',
        details: {
          whatIsIt: 'مروحة تبريد بمحرك عديم المسفرات ومحمل كروي.',
          function: 'تدوير الهواء لخفض الحرارة.',
          howItWorks: 'التحكم بالسرعة عبر نبضات PWM.',
          whereUsed: 'تبريد أجهزة الكمبيوتر، اللوحات الإلكترونية، وغرف المحركات.',
        },
      },
      {
        id: 'tc4',
        name: 'ترانزستور قيادة عالي القدرة MOSFET (IRF520 / TIP120)',
        count: 1,
        usage: 'التحكم بسرعة المروحة بتيار يصل إلى 2 أمبير وعزل الأردوينو',
        details: {
          whatIsIt: 'ترانزستور تأثير المجال ذو القناة N.',
          function: 'تضخيم إشارة الـ PWM لتشغيل المروحة بأعلى كفاءة.',
          howItWorks: 'التحكم في تيار المصرف Drain عبر جهد البوابة Gate.',
          pinoutOrSpecs: 'Gate (D9 PWM), Drain (Motor -), Source (GND)',
        },
      },
      {
        id: 'tc5',
        name: 'شاشة عرض بلورية LCD 16x2 مع محول I2C',
        count: 1,
        usage: 'عرض قراءة درجة الحرارة الحالية، الرطوبة، وسرعة دوران المروحة %',
        details: {
          whatIsIt: 'شاشة نصية I2C.',
          function: 'المراقبة المرئية لظروف البيئة والتشغيل.',
          howItWorks: 'خطا SDA و SCL.',
        },
      },
      {
        id: 'tc6',
        name: 'جرس إنذار صوتي Active Buzzer',
        count: 1,
        usage: 'إطلاق صوت تحذيري عند تجاوز درجة الحرارة 45 درجة مئوية (Overheat Warning)',
        details: {
          whatIsIt: 'بزر بيزوي للإنذار.',
          function: 'تنبيه مشغلي المحطة بالحرارة المفرطة.',
          howItWorks: 'تردد 2.5 kHz.',
        },
      },
    ],
    connections: [
      { fromComponent: 'DHT22 Sensor', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية الحساس' },
      { fromComponent: 'DHT22 Sensor', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي' },
      { fromComponent: 'DHT22 Sensor', fromPin: 'DATA', toComponent: 'Arduino UNO', toPin: 'D2', wireColor: 'blue', signalType: 'Digital', notes: 'خط بيانات DHT22' },
      { fromComponent: 'MOSFET Driver', fromPin: 'SIG / Gate', toComponent: 'Arduino UNO', toPin: 'D9', wireColor: 'yellow', signalType: 'PWM', notes: 'نبضات التحكم بسرعة المروحة' },
      { fromComponent: 'MOSFET Driver', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي مشترك' },
      { fromComponent: 'Cooling Fan', fromPin: 'Positive (+)', toComponent: 'مصدر تغذية 5V', toPin: 'VCC', wireColor: 'red', signalType: '5V', notes: 'تغذية المروحة' },
      { fromComponent: 'Cooling Fan', fromPin: 'Negative (-)', toComponent: 'MOSFET Driver', toPin: 'Drain / Motor -', wireColor: 'black', signalType: 'Motor', notes: 'التحكم الأرضي بالمروحة' },
      { fromComponent: 'Active Buzzer', fromPin: 'Positive (+)', toComponent: 'Arduino UNO', toPin: 'D8', wireColor: 'purple', signalType: 'Digital', notes: 'إنذار الحرارة الزائدة' },
      { fromComponent: 'Active Buzzer', fromPin: 'Negative (-)', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي' },
      { fromComponent: 'LCD I2C', fromPin: 'SDA', toComponent: 'Arduino UNO', toPin: 'A4', wireColor: 'blue', signalType: 'Analog', notes: 'بيانات الشاشة' },
      { fromComponent: 'LCD I2C', fromPin: 'SCL', toComponent: 'Arduino UNO', toPin: 'A5', wireColor: 'yellow', signalType: 'Analog', notes: 'ساعة الشاشة' },
    ],
    pinMapping: [
      { componentName: 'DHT22 Temperature Sensor', pinFunction: '1-Wire Digital Data', boardPin: 'D2', codeIdentifier: 'DHTPIN' },
      { componentName: 'Buzzer Overheat Alarm', pinFunction: 'Overheat Alarm Buzzer', boardPin: 'D8', codeIdentifier: 'BUZZER_PIN' },
      { componentName: 'MOSFET Fan Control', pinFunction: 'Fan Speed PWM Out', boardPin: 'D9', codeIdentifier: 'FAN_PWM_PIN' },
      { componentName: 'LCD I2C Data', pinFunction: 'I2C Serial Data', boardPin: 'A4', codeIdentifier: 'SDA_PIN' },
      { componentName: 'LCD I2C Clock', pinFunction: 'I2C Serial Clock', boardPin: 'A5', codeIdentifier: 'SCL_PIN' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'توصيل حساس DHT22 مع مقاومة سحب (Pull-up Resistor)',
        description: 'وصّل أطراف 5V و GND وطرف البيانات بالـ Pin D2 مع مقاومة سحب 10K أوم بين الـ 5V وطرف البيانات لضمان نقاء الإشارة.',
        usedComponents: ['حساس DHT22', 'مقاومة 10KΩ'],
      },
      {
        stepNumber: 2,
        title: 'توصيل ترانزستور الـ MOSFET ومروحة التبريد',
        description: 'وصّل بوابة الـ Gate بطرف الـ PWM D9 في الأردوينو، ومصرف الـ Drain بالقطب السالب للمروحة، ووصّل الموجب بمصدر 5V.',
        usedComponents: ['وحدة MOSFET', 'مروحة تبريد 5V'],
        importantNotes: 'تأكد من تركيب دايود حماية (Flyback Diode 1N4007) بالتوازي مع المروحة لمنع الجهد العكسي الناتج عن الحث الكهرومغناطيسي.',
      },
      {
        stepNumber: 3,
        title: 'توصيل شاشة LCD I2C والبزر ورفع كود التحكم التناسبي',
        description: 'وصّل الشاشة والبزر وارفع الكود لمراقبة تغير سرعة دوران المروحة طردياً عند تدفئة الحساس بيدك.',
        usedComponents: ['LCD I2C', 'Buzzer', 'Arduino UNO'],
      },
    ],
    code: {
      language: 'arduino',
      filename: 'SmartCoolingSystem.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: نظام التحكم الذكي بدرجة الحرارة والتبريد (HVAC Controller)
 * التوافق الصارم: الأرجل متطابقة 100% مع مخطط التوصيل
 * ==============================================================
 */

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define DHTPIN      2
#define DHTTYPE     DHT22

#define BUZZER_PIN  8
#define FAN_PWM_PIN 9

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// درجات الحرارة المرجعية
const float TEMP_MIN = 26.0; // درجة بدء تشغيل المروحة
const float TEMP_MAX = 38.0; // درجة تشغيل المروحة بأقصى سرعة
const float TEMP_ALARM = 45.0; // درجة إطلاق الإنذار الصوتي

void setup() {
  pinMode(FAN_PWM_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(FAN_PWM_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("MCT Academy");
  lcd.setCursor(0, 1);
  lcd.print("HVAC Temp Ready");
  delay(1200);
  lcd.clear();
}

void loop() {
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println(F("[ERROR] Failed to read from DHT22 sensor!"));
    delay(1000);
    return;
  }

  // حساب سرعة المروحة عبر التحكم التناسبي
  int fanSpeed = 0;
  if (temp > TEMP_MIN) {
    fanSpeed = map((long)temp, (long)TEMP_MIN, (long)TEMP_MAX, 90, 255);
    fanSpeed = constrain(fanSpeed, 90, 255);
  } else {
    fanSpeed = 0; // إيقاف المروحة لتوفير الطاقة إذا كان الجو معتدلاً
  }

  analogWrite(FAN_PWM_PIN, fanSpeed);

  // فحص حرارة الإنذار الزائدة
  if (temp >= TEMP_ALARM) {
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  // تحديث شاشة العرض
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temp, 1);
  lcd.print("C H:");
  lcd.print((int)hum);
  lcd.print("% ");

  lcd.setCursor(0, 1);
  int speedPercent = (fanSpeed == 0) ? 0 : map(fanSpeed, 90, 255, 35, 100);
  lcd.print("Fan Speed: ");
  lcd.print(speedPercent);
  lcd.print("%   ");

  delay(1000); // تحديث القراءة كل ثانية
}
`,
      explanation: 'يقيس الكود الحرارة والرطوبة بواسطة DHT22 بدقة عالية. إذا تجاوزت الحرارة 26 مئوية، تبدأ المروحة بالدوران بسرعة منخفضة، وتتزايد سرعتها تلقائياً وبشكل تدريجي مع ارتفاع الحرارة حتى تصل إلى 100%، مما يوفر الطاقة ويطيل عمر المحرك.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 9-18', explanation: 'تعريف أطراف حساس DHT22 والمروحة والبزر ونوع الحساس.' },
        { lineRange: 'الأسطر 48-57', explanation: 'معادلة التحكم التناسبي لتحويل فارق درجات الحرارة إلى نبضات PWM للمروحة.' },
        { lineRange: 'الأسطر 69-79', explanation: 'عرض قيم الحرارة والرطوبة ونسبة عمل المروحة المئوية على الشاشة.' },
      ],
      librariesNeeded: ['Wire.h', 'LiquidCrystal_I2C.h', 'DHT.h'],
      uploadSteps: [
        'تثبيت مكتبة DHT sensor library من Adafruit في Arduino IDE.',
        'توصيل كابل USB ورفع الكود.',
      ],
    },
    testingProcedure: {
      steps: [
        'مراقبة قراءة الحرارة في الغرفة (حوالي 24-25 درجة والمروحة متوقفة).',
        'تدفئة الحساس باليد أو هواء دافئ لملاحظة دوران المروحة وتزايد سرعتها.',
        'ملاحظة إطلاق البزر عند بلوغ درجة حرارة الإنذار.',
      ],
      expectedBehavior: 'تنظيم حراري تلقائي فائق الكفاءة والهدوء.',
    },
    troubleshooting: [
      {
        symptom: 'قراءة درجة الحرارة تظهر nan على الشاشة',
        possibleCause: 'عدم توصيل خط البيانات بشكل صحيح بالطرف D2 أو تلف الحساس.',
        solution: 'تأكد من تركيب مقاومة السحب 10K بين VCC وطرف DATA في حساس DHT22.',
      },
    ],
    futureImprovements: [
      'تطبيق خوارزمية PID لتثبيت درجة الحرارة بدقة ±0.2 درجة مئوية في المختبرات الطبية.',
      'إضافة وحدة تبريد بلتير الكهروحرارية (Peltier Thermoelectric Cooler) للتبريد والتسخين المزدوج.',
    ],
    finalResultSummary: 'نظام تكييف صناعي ذكي يمثل تطبيقاً كلاسيكياً لهندسة التحكم في الأنظمة الحرارية.',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[0],
      OFFICIAL_MECHATRONICS_REFERENCES[2],
    ],
    simulationConfig: {
      type: 'temperature_control',
      defaultSensors: { temperatureC: 25, humidityPct: 50, fanRpmPct: 0 },
    },
  },

  'motor-speed-direction-control': {
    id: 'proj-motor-control',
    title: 'نظام التحكم الصناعي بسرعة واتجاه المحركات (Industrial Motor Drive)',
    category: 'mechatronics',
    idea: 'نظام تحكم صناعي احترافي بمحركات التيار المستمر DC والمحركات الخطوية Stepper، يوفر إمكانية التحكم بعزم الدوران وسرعة الدوران اللحظية عبر نبضات PWM ومقاومة متغيرة تناظرية، وتغيير اتجاه الدوران (مع / عكس عقارب الساعة)، ومفتاح فرملة كهربائية ديناميكية (Dynamic Braking) وعرض السرعة على شاشة رقمية.',
    targetAudience: 'طلاب هندسة الميكاترونكس والقوى والآلات والتحكم الصناعي',
    components: [
      {
        id: 'mc1',
        name: 'Arduino UNO R3',
        count: 1,
        usage: 'توليد نبضات PWM عالية التردد والتحكم بزمن التبديل',
        details: {
          whatIsIt: 'المتحكم الدقيق للسرعة.',
          function: 'قراءة المقاومة المتغيرة وترجمة الجهد إلى دورة تشغيل Duty Cycle من 0 إلى 100%.',
          howItWorks: 'مؤقتات داخلية Timers للتحكم بالتردد.',
          whereUsed: 'محركات خطوط الإنتاج والسيارات الكهربائية والروافع.',
        },
      },
      {
        id: 'mc2',
        name: 'وحدة قيادة المحركات L298N Dual H-Bridge',
        count: 1,
        usage: 'قيادة تيار المحرك حتى 2 أمبير وعكس قطبية الجهد للتحكم بالاتجاه',
        details: {
          whatIsIt: 'جسر H-Bridge ثنائي بقنوات قدرة عالية ومشتت حراري مدمج.',
          function: 'توصيل أو فصل أطراف المحرك مع موجات وسالب البطارية.',
          howItWorks: 'ترانزستورات تبديل ثنائية القطب BJT/MOSFET.',
        },
      },
      {
        id: 'mc3',
        name: 'محرك تيار مستمر صناعي عالي العزم DC Motor مع مشفر سرعة Encoder',
        count: 1,
        usage: 'تنفيذ الدوران الميكانيكي وقياس سرعة الدوران بالدورة في الدقيقة RPM',
        details: {
          whatIsIt: 'محرك تيار مستمر 12V مع قرص مشفر بصري Optical Encoder.',
          function: 'توليد الحركة الميكانيكية وتغذية راجعة مغلقة الحلقة Closed-Loop.',
          howItWorks: 'الحث الكهرومغناطيسي وقانون فاراداي ولورنتز.',
        },
      },
      {
        id: 'mc4',
        name: 'مقاومة متغيرة تناظرية 10K Potentiometer',
        count: 1,
        usage: 'التحكم اليدوي السلس في سرعة المحرك (من الصفر إلى أقصى سرعة)',
        details: {
          whatIsIt: 'مجزئ جهد ثلاثي الأطراف بدوران 270 درجة.',
          function: 'إعطاء جهد تناظري مستمر بين 0V و 5V لمحول ADC في الأردوينو.',
          howItWorks: 'تغير طول مسار المقاومة الكربونية.',
        },
      },
      {
        id: 'mc5',
        name: 'مفتاح تبديل ثنائي الاتجاه (SPDT Switch) للتحكم باتجاه الدوران',
        count: 1,
        usage: 'التبديل بين اتجاه عقارب الساعة (CW) وعكس عقارب الساعة (CCW)',
        details: {
          whatIsIt: 'مفتاح ميكانيكي بوضعين.',
          function: 'إعطاء إشارة HIGH أو LOW لتحديد قطبية الجسر.',
        },
      },
      {
        id: 'mc6',
        name: 'زر ضاغط للفرملة السريعة (Brake Pushbutton)',
        count: 1,
        usage: 'تفعيل الفرملة الكهربائية الفورية عبر قصر طرفي المحرك (Dynamic Short Braking)',
        details: {
          whatIsIt: 'زر ضاغط لتطبيق جهد متساوٍ على طرفي المحرك (IN1=HIGH & IN2=HIGH).',
          function: 'إيقاف المحرك اللحظي لمنع الدوران بالقصور الذاتي.',
        },
      },
    ],
    connections: [
      { fromComponent: 'Potentiometer 10K', fromPin: 'Pin 1', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية المقاومة' },
      { fromComponent: 'Potentiometer 10K', fromPin: 'Pin 3', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي' },
      { fromComponent: 'Potentiometer 10K', fromPin: 'Pin 2 (Wiper)', toComponent: 'Arduino UNO', toPin: 'A0', wireColor: 'blue', signalType: 'Analog', notes: 'قراءة الجهد وضبط السرعة' },
      { fromComponent: 'Direction Switch', fromPin: 'Out', toComponent: 'Arduino UNO', toPin: 'D2', wireColor: 'green', signalType: 'Digital', notes: 'تحديد الاتجاه CW/CCW' },
      { fromComponent: 'Brake Button', fromPin: 'Out', toComponent: 'Arduino UNO', toPin: 'D3', wireColor: 'orange', signalType: 'Digital', notes: 'زر الفرملة اللحظية' },
      { fromComponent: 'L298N Driver', fromPin: 'IN1', toComponent: 'Arduino UNO', toPin: 'D4', wireColor: 'blue', signalType: 'Digital', notes: 'مدخل اتجاه 1' },
      { fromComponent: 'L298N Driver', fromPin: 'IN2', toComponent: 'Arduino UNO', toPin: 'D5', wireColor: 'blue', signalType: 'Digital', notes: 'مدخل اتجاه 2' },
      { fromComponent: 'L298N Driver', fromPin: 'ENA', toComponent: 'Arduino UNO', toPin: 'D9', wireColor: 'yellow', signalType: 'PWM', notes: 'سرعة دوران المحرك PWM' },
      { fromComponent: 'External 12V Power', fromPin: 'Positive (+)', toComponent: 'L298N Driver', toPin: '12V', wireColor: 'red', signalType: 'VIN', notes: 'تغذية المحرك' },
      { fromComponent: 'External 12V Power', fromPin: 'GND (-)', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي مشترك إلزامي' },
    ],
    pinMapping: [
      { componentName: 'Speed Potentiometer', pinFunction: 'Speed Analog Voltage', boardPin: 'A0', codeIdentifier: 'POT_PIN' },
      { componentName: 'Direction Switch', pinFunction: 'Rotation Direction In', boardPin: 'D2', codeIdentifier: 'DIR_SWITCH_PIN' },
      { componentName: 'Emergency Brake Button', pinFunction: 'Dynamic Brake Button', boardPin: 'D3', codeIdentifier: 'BRAKE_PIN' },
      { componentName: 'L298N Direction In1', pinFunction: 'Motor Bridge In1', boardPin: 'D4', codeIdentifier: 'IN1_PIN' },
      { componentName: 'L298N Direction In2', pinFunction: 'Motor Bridge In2', boardPin: 'D5', codeIdentifier: 'IN2_PIN' },
      { componentName: 'L298N Speed PWM Enable', pinFunction: 'Motor Speed PWM', boardPin: 'D9', codeIdentifier: 'ENA_PIN' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'توصيل المقاومة المتغيرة ومفاتيح التحكم بالأردوينو',
        description: 'وصّل المقاومة بالطرف A0، ومفتاح الاتجاه بالطرف D2 مع المقاومة الداخلية، وزر الفرملة بالطرف D3.',
        usedComponents: ['Potentiometer 10K', 'مفتاح اتجاه', 'زر فرملة'],
      },
      {
        stepNumber: 2,
        title: 'توصيل درايفر المحركات L298N والمحرك الصناعي',
        description: 'وصّل مخرجي OUT1 و OUT2 بقطبي المحرك، ووصّل IN1 بـ D4 و IN2 بـ D5 و ENA بطرف الـ PWM D9.',
        usedComponents: ['L298N Driver', 'محرك DC 12V'],
        cautionNotice: 'تنبيه هندسي: تأكد من توصيل الأرضي المشترك (Common GND) بين مزود الطاقة الخارجي 12V وبورد الأردوينو لضمان استقرار إشارات التحكم.',
      },
      {
        stepNumber: 3,
        title: 'رفع كود التحكم واختبار الفرملة والسرعات المتفاوتة',
        description: 'ارفع الكود وتحكم بالمقاومة لزيادة السرعة، واقلب مفتاح الاتجاه لمراقبة عكس دوران المحرك بسلاسة.',
        usedComponents: ['Arduino UNO', 'شاشة المراقب التسلسلي Serial Monitor'],
      },
    ],
    code: {
      language: 'arduino',
      filename: 'IndustrialMotorController.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: التحكم الصناعي بمحرك DC (Industrial Motor Controller)
 * التوافق الصارم: الأرجل متطابقة 100% مع مخطط التوصيل
 * ==============================================================
 */

#define POT_PIN        A0
#define DIR_SWITCH_PIN 2
#define BRAKE_PIN      3

#define IN1_PIN 4
#define IN2_PIN 5
#define ENA_PIN 9

void setup() {
  pinMode(DIR_SWITCH_PIN, INPUT_PULLUP);
  pinMode(BRAKE_PIN, INPUT_PULLUP);

  pinMode(IN1_PIN, OUTPUT);
  pinMode(IN2_PIN, OUTPUT);
  pinMode(ENA_PIN, OUTPUT);

  Serial.begin(9600);
  Serial.println(F("[MCT Academy] Motor Controller Online!"));
}

void loop() {
  // فحص زر الفرملة الكهربائية أولاً
  if (digitalRead(BRAKE_PIN) == LOW) {
    applyElectricBrake();
    return;
  }

  int potVal = analogRead(POT_PIN);
  int motorSpeed = map(potVal, 0, 1023, 0, 255);

  int directionState = digitalRead(DIR_SWITCH_PIN);

  if (directionState == HIGH) {
    // دوران مع عقارب الساعة (CW)
    digitalWrite(IN1_PIN, HIGH);
    digitalWrite(IN2_PIN, LOW);
  } else {
    // دوران عكس عقارب الساعة (CCW)
    digitalWrite(IN1_PIN, LOW);
    digitalWrite(IN2_PIN, HIGH);
  }

  // تطبيق السرعة عبر PWM
  analogWrite(ENA_PIN, motorSpeed);

  // تقرير الحالة التسلسلي كل 200 ميلي ثانية
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 200) {
    lastPrint = millis();
    int percent = map(motorSpeed, 0, 255, 0, 100);
    Serial.print(F("Speed: "));
    Serial.print(percent);
    Serial.print(F("% | Dir: "));
    Serial.println(directionState == HIGH ? "CW (يمين)" : "CCW (يسار)");
  }

  delay(10);
}

void applyElectricBrake() {
  // الفرملة الديناميكية: قصر طرفي المحرك على القطب الموجب
  digitalWrite(IN1_PIN, HIGH);
  digitalWrite(IN2_PIN, HIGH);
  analogWrite(ENA_PIN, 255);
  Serial.println(F("[BRAKE] Dynamic Braking Activated!"));
  delay(100);
}
`,
      explanation: 'يحوّل الكود قراءة المقاومة المتغيرة التناظرية (0-1023) إلى سرعة PWM بنطاق (0-255). يفحص اتجاه الدوران عبر مفتاح SPDT، وإذا ضُغط زر الفرملة، يطبّق الكود فوراً تقنية الفرملة الديناميكية بقصر قطبي المحرك لإيقافه في كسر من الثانية.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 9-16', explanation: 'تعريف أطراف المقاومة والمفاتيح ودرايفر المحركات والـ PWM.' },
        { lineRange: 'الأسطر 38-47', explanation: 'تحديد قطبية الجسر لتغيير اتجاه الدوران يميناً أو يساراً.' },
        { lineRange: 'الأسطر 65-72', explanation: 'تنفيذ الفرملة الحثية السريعة Dynamic Braking.' },
      ],
      librariesNeeded: [],
      uploadSteps: [
        'افتح Arduino IDE، اختر المنفذ ولوحة Uno.',
        'ارفع الكود وافتح Serial Monitor لمتابعة سرعة المحرك ونسبته المئوية.',
      ],
    },
    testingProcedure: {
      steps: [
        'تدوير المقاومة وملاحظة تسارع المحرك بسلاسة من 0 إلى 100%.',
        'عكس مفتاح الاتجاه وملاحظة توقف المحرك ثم انعكاس دورانه.',
        'الضغط على زر الفرملة وملاحظة الإيقاف الصارم الفوري.',
      ],
      expectedBehavior: 'تحكم ناعم بدون صدمات ميكانيكية مع استجابة دقيقة لعزم وسرعة المحرك.',
    },
    troubleshooting: [
      {
        symptom: 'المحرك لا يدور ويسخن درايفر L298N',
        possibleCause: 'عدم إزالة جمبر ENA أو عدم كفاية تيار مزود الطاقة 12V.',
        solution: 'تأكد من نزع جمبر ENA إذا كنت تستخدم PWM من الأردوينو وتأكد من قدرة مزود الطاقة على إعطاء 2A.',
      },
    ],
    futureImprovements: [
      'إضافة حساس تيار ACS712 لمراقبة استهلاك المحرك وإيقافه آلياً عند حدوث حمل زائد (Overcurrent Protection).',
      'إضافة مشفر سرعة دوراني وقفل سرعة مغلق الحلقة PID Speed Governor.',
    ],
    finalResultSummary: 'نظام تحكم في الحركة الميكانيكية يجسد جوهر تطبيقات الميكاترونكس الصناعية.',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[0],
      OFFICIAL_MECHATRONICS_REFERENCES[2],
    ],
    simulationConfig: {
      type: 'generic',
      defaultSensors: { motorSpeedPct: 50, direction: 1, brakeActive: 0 },
    },
  },

  'electronic-circuits-project': {
    id: 'proj-electronic-circuits',
    title: 'دائرة المذبذب النبضي وتوليد الترددات بالمؤقت 555 (Astable 555 Multivibrator)',
    category: 'circuits',
    idea: 'مشروع إلكتروني تطبيقي أصيل لدارسة سلوك المؤقت الشهير NE555 في وضع التذبذب الحر (Astable Mode)، حيث يتم شحن وتفريغ مكثف إلكتروليتي عبر مقاومتين لتوليد قطار نبضات رقمية متناوبة للتحكم في تردد وميض دايودات LED وإصدار نغمات عبر البيزو، مع إدخال الإشارة إلى الأردوينو لقياس التردد بدقة بالـ Hertz وعرضه.',
    targetAudience: 'طلاب الهندسة الإلكترونية والميكاترونكس والدوائر التناظرية والرقمية',
    components: [
      {
        id: 'ec1',
        name: 'رقاقة المؤقت التناظري الدقيق NE555 Timer IC',
        count: 1,
        usage: 'توليد النبضات المربعة والترددات التناوبية بدقة متناهية',
        details: {
          whatIsIt: 'رقاقة إلكترونية شهيرة تتضمن 23 ترانزستور، 2 دايود، ومقسم جهد مكون من 3 مقاومات 5KΩ.',
          function: 'شحن وتفريغ المكثف بين 1/3 VCC و 2/3 VCC لتوليد موجة مربعة ذات تردد ثابت أو متغير.',
          howItWorks: 'مقارنان تناظريان ومقلب SR-Latch وترانزستور تفريغ داخلي.',
          whereUsed: 'ساعات التوقيت، توليد نبضات الميكروكنترولر، دوائر تعديل العرض PWM، وأجهزة الإنذار.',
          pinoutOrSpecs: '8-Pin DIP: 1=GND, 2=TRIG, 3=OUT, 4=RESET, 5=CTRL, 6=THRESH, 7=DISCH, 8=VCC',
        },
      },
      {
        id: 'ec2',
        name: 'مكثف إلكتروليتي كيميائي 10uF ومكثف سيراميكي 0.01uF',
        count: 2,
        usage: 'تخزين الشحنات الكهربائية وتحديد ثابت الزمن لتوليد التردد (RC Time Constant)',
        details: {
          whatIsIt: 'مكثفات كهربائية لتخزين الطاقة في مجال كهربائي.',
          function: 'المكثف 10uF يحدد زمن النبضة t1 و t2، بينما 0.01uF لتصفية الضجيج على طرف التحكم Pin 5.',
          howItWorks: 'معادلة الشحن: V(t) = Vmax * (1 - e^(-t/RC)).',
        },
      },
      {
        id: 'ec3',
        name: 'مقاومات كربونية (R1 = 10KΩ, R2 = 47KΩ) ومقاومة متغيرة 50KΩ',
        count: 3,
        usage: 'تحديد مسارات الشحن والتفريغ وتعديل تردد النبضات يدوياً',
        details: {
          whatIsIt: 'مقاومات ثابتة ومتغيرة لتحديد أزمنة الشحن والتفريغ.',
          function: 'زمن الارتفاع Thigh = 0.693 * (R1 + R2) * C، وزمن الانخفاض Tlow = 0.693 * R2 * C.',
          howItWorks: 'مقاومة تدفق الشحنات الكهربائية.',
        },
      },
      {
        id: 'ec4',
        name: 'دايودات ضوئية LED ملونة وباعث صوتي Piezo Buzzer',
        count: 2,
        usage: 'إظهار النبضات بصرياً وسماع التردد كإشارة صوتية متناوبة',
        details: {
          whatIsIt: 'عناصر إظهار ضوئية وصوتية متصلة بمخرج المؤقت Pin 3.',
          function: 'مراقبة التردد المنخفض كإضاءة وميضية والتردد العالي كنغمة صوتية.',
        },
      },
      {
        id: 'ec5',
        name: 'Arduino UNO R3',
        count: 1,
        usage: 'عداد ترددات رقمي دقيق (Digital Frequency Counter & Oscilloscope)',
        details: {
          whatIsIt: 'لقياس التردد الناتج من رقاقة الـ 555 بالهرتز وعرض زمن الدورة Duty Cycle.',
          function: 'حساب الفارق الزمني بين الحواف الصاعدة عبر المقاطعة الخارجية D2.',
        },
      },
    ],
    connections: [
      { fromComponent: 'NE555 Timer', fromPin: 'Pin 8 (VCC)', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية المؤقت' },
      { fromComponent: 'NE555 Timer', fromPin: 'Pin 1 (GND)', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'الأرضي' },
      { fromComponent: 'NE555 Timer', fromPin: 'Pin 4 (RESET)', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'ربط الريسيت بالـ 5V لمنع التصفير العشوائي' },
      { fromComponent: 'Resistor R1 (10K)', fromPin: 'Pin 1', toComponent: 'NE555 Timer', toPin: 'Pin 8 (VCC)', wireColor: 'orange', signalType: '5V', notes: 'مقاومة الشحن العلوية' },
      { fromComponent: 'Resistor R1 (10K)', fromPin: 'Pin 2', toComponent: 'NE555 Timer', toPin: 'Pin 7 (DISCH)', wireColor: 'orange', signalType: 'Analog', notes: 'وصلة التفريغ' },
      { fromComponent: 'Resistor R2 (47K)', fromPin: 'Pin 1', toComponent: 'NE555 Timer', toPin: 'Pin 7 (DISCH)', wireColor: 'blue', signalType: 'Analog', notes: 'مقاومة التوقيت الوسطى' },
      { fromComponent: 'Resistor R2 (47K)', fromPin: 'Pin 2', toComponent: 'NE555 Timer', toPin: 'Pin 6 (THRESH)', wireColor: 'blue', signalType: 'Analog', notes: 'وصلة العتبة' },
      { fromComponent: 'Jumper Wire', fromPin: 'Pin 6 (THRESH)', toComponent: 'NE555 Timer', toPin: 'Pin 2 (TRIG)', wireColor: 'green', signalType: 'Analog', notes: 'ربط القدح بالعتبة للتذبذب التلقائي' },
      { fromComponent: 'Capacitor C1 (10uF)', fromPin: 'Positive (+)', toComponent: 'NE555 Timer', toPin: 'Pin 2 (TRIG)', wireColor: 'yellow', signalType: 'Analog', notes: 'مكثف التوقيت' },
      { fromComponent: 'Capacitor C1 (10uF)', fromPin: 'Negative (-)', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'سالب المكثف' },
      { fromComponent: 'NE555 Timer', fromPin: 'Pin 3 (OUT)', toComponent: 'Arduino UNO', toPin: 'D2', wireColor: 'purple', signalType: 'Digital', notes: 'نبضات الخرج إلى عداد الأردوينو' },
    ],
    pinMapping: [
      { componentName: '555 Timer Output Pin 3', pinFunction: 'Frequency Pulse Input', boardPin: 'D2', codeIdentifier: 'FREQ_INPUT_PIN' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تثبيت رقاقة الـ NE555 في منتصف لوحة التجارب (Breadboard)',
        description: 'ضع المؤقت بحيث يكون الشق النصفي جهة اليسار. وصّل الطرف 1 بالأرضي GND والطرف 8 بالـ 5V والطرف 4 بالـ 5V لمنع التصفير.',
        usedComponents: ['NE555 Timer IC', 'لوحة تجارب Breadboard'],
      },
      {
        stepNumber: 2,
        title: 'توصيل شبكة المقاومات والمكثفات (RC Timing Network)',
        description: 'وصّل المقاومة R1 بين Pin 8 و Pin 7، والمقاومة R2 بين Pin 7 و Pin 6، وقم بعمل قصر بسلك بين Pin 6 و Pin 2، ووصّل المكثف 10uF بين Pin 2 و GND.',
        usedComponents: ['مقاومة 10KΩ', 'مقاومة 47KΩ', 'مكثف 10uF'],
        importantNotes: 'انتبه لقطبية المكثف الإلكتروليتي: الطرف الطويل للموجب والطرف القصير المحدد بخط أبيض هو السالب المتصل بالأرضي.',
      },
      {
        stepNumber: 3,
        title: 'توصيل مخرج النبضات Pin 3 بالدايود وبمدخل الأردوينو D2',
        description: 'وصّل Pin 3 بمقاومة 330 أوم وليد ضوئي لمشاهدة الوميض، ووصّل سلكاً بطرف D2 في الأردوينو لقياس التردد بدقة.',
        usedComponents: ['LED', 'مقاومة 330Ω', 'Arduino UNO'],
      },
    ],
    code: {
      language: 'arduino',
      filename: 'FrequencyCounter555.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: قياس ترددات دائرة المذبذب 555 (Digital Frequency Counter)
 * التوافق الصارم: الأرجل متطابقة 100% مع مخطط التوصيل
 * ==============================================================
 */

#define FREQ_INPUT_PIN 2

volatile unsigned long pulseCount = 0;
unsigned long lastMeasureTime = 0;

void countPulse() {
  pulseCount++;
}

void setup() {
  pinMode(FREQ_INPUT_PIN, INPUT);
  Serial.begin(9600);

  // استخدام المقاطعة العتادية Hardware Interrupt لدقة متناهية في حساب التردد
  attachInterrupt(digitalPinToInterrupt(FREQ_INPUT_PIN), countPulse, RISING);

  Serial.println(F("[MCT Academy] 555 Frequency Analyzer Ready!"));
  lastMeasureTime = millis();
}

void loop() {
  // حساب التردد كل 1000 ميلي ثانية (1 ثانية)
  if (millis() - lastMeasureTime >= 1000) {
    detachInterrupt(digitalPinToInterrupt(FREQ_INPUT_PIN));

    unsigned long freqHz = pulseCount; // عدد النبضات في الثانية = التردد بالهرتز
    pulseCount = 0;

    Serial.print(F("555 Timer Frequency: "));
    Serial.print(freqHz);
    Serial.print(F(" Hz (نبضة/ثانية) | Period: "));
    if (freqHz > 0) {
      float periodMs = 1000.0 / freqHz;
      Serial.print(periodMs, 2);
      Serial.println(F(" ms"));
    } else {
      Serial.println(F("0 ms"));
    }

    lastMeasureTime = millis();
    attachInterrupt(digitalPinToInterrupt(FREQ_INPUT_PIN), countPulse, RISING);
  }
}
`,
      explanation: 'يقوم الكود بقياس عدد النبضات المربعة الخارجة من الطرف رقم 3 لرقاقة الـ 555 باستخدام مقاطعة عتادية دقيقة (Hardware Interrupt). عند كل حافة صاعدة يزداد العداد، وكل ثانية يحسب التردد بالهرتز وزمن الدورة بالملي ثانية بدقة متناهية.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 9-15', explanation: 'تعريف مدخل التردد وتابع خدمة المقاطعة ISR.' },
        { lineRange: 'الأسطر 22-26', explanation: 'ربط المقاطعة بالحافة الصاعدة RISING على الطرف D2.' },
        { lineRange: 'الأسطر 31-48', explanation: 'حساب التردد وعرض النتائج على الشاشة التسلسلية كل ثانية.' },
      ],
      librariesNeeded: [],
      uploadSteps: [
        'افتح Arduino IDE، اختر المنفذ ولوحة Uno.',
        'ارفع الكود وافتح Serial Monitor عند 9600 Baud.',
        'راقب قراءة التردد بالهرتز عند تغيير المكثف أو المقاومة.',
      ],
    },
    testingProcedure: {
      steps: [
        'مراقبة وميض الليد المتصل بمخرج الـ 555.',
        'فتح Serial Monitor وقراءة التردد المحسوب (مثلاً حوالي 1.5 Hz إلى 15 Hz بحسب قيم R و C).',
        'استبدال المقاومة أو تدوير المقاومة المتغيرة وملاحظة تسارع الوميض وارتفاع التردد.',
      ],
      expectedBehavior: 'تطابق عملي كامل بين التردد النظري المحسوب رياضياً بالقانون f = 1.44 / ((R1 + 2*R2)*C) والقراءة العملية للأردوينو.',
    },
    troubleshooting: [
      {
        symptom: 'الليد مضاء باستمرار دون وميض',
        possibleCause: 'عدم توصيل الطرف 2 بالطرف 6، أو أن قيمة المكثف صغيرة جداً مما جعل التردد أعلى من قدرة العين على التمييز.',
        solution: 'تأكد من السلك الرابط بين Pin 2 و Pin 6 واستخدم مكثفاً أكبر (10uF أو 47uF) لرؤية الوميض البطيء.',
      },
    ],
    futureImprovements: [
      'تعديل الدائرة لتوليد إشارات PWM للتحكم بسطوع الليدات ومحركات السيرفو دون الحاجة لميكروكنترولر.',
      'تصميم مرشحات ترددية تمرير منخفض وتمرير عالي (Active Low-Pass / High-Pass Filters) لتنقية النبضات.',
    ],
    finalResultSummary: 'مشروع دوائر إلكترونية أساسي يربط بين النظرية والتطبيق العملي لثوابت الزمن RC ومذبذبات التردد.',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[2],
      OFFICIAL_MECHATRONICS_REFERENCES[0],
    ],
    simulationConfig: {
      type: 'generic',
      defaultSensors: { frequencyHz: 5, pulseState: 1 },
    },
  },
};

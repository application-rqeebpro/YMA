import { ArduinoPinInfo, ComponentType, PresetExperiment } from '../types/simulator';

// Visual Layout Constants
export const BREADBOARD_COLS = 30;
export const HOLE_SPACING = 20; // 20px pitch
export const BREADBOARD_WIDTH = 680;
export const BREADBOARD_HEIGHT = 280;

// Arduino Uno Board Visual Layout & Pins Definition
export const ARDUINO_PINS: ArduinoPinInfo[] = [
  // Power Header (Bottom Left)
  { id: 'IOREF', label: 'IOREF', type: 'power', description: 'جهد مرجعي لمنفذ الدخل/الخرج (5V في Uno)', voltage: 5, x: 235, y: 310 },
  { id: 'RESET', label: 'RESET', type: 'control', description: 'إعادة ضبط المعالج عند توصيله بالأرضي GND', x: 250, y: 310 },
  { id: '3V3', label: '3.3V', type: 'power', description: 'مخرج تغذية منظم بجهد 3.3 فولت ومستمر للحساسات', voltage: 3.3, x: 265, y: 310 },
  { id: '5V', label: '5V', type: 'power', description: 'مخرج التغذية الرئيسي 5 فولت لتغذية الدوائر واللوحة', voltage: 5, x: 280, y: 310 },
  { id: 'GND_1', label: 'GND', type: 'ground', description: 'الطرف السالب / الأرضي المشترك للدائرة (Ground)', voltage: 0, x: 295, y: 310 },
  { id: 'GND_2', label: 'GND', type: 'ground', description: 'الطرف السالب الثاني / الأرضي المشترك', voltage: 0, x: 310, y: 310 },
  { id: 'VIN', label: 'VIN', type: 'power', description: 'مدخل التغذية الخارجية (7V إلى 12V)', x: 325, y: 310 },

  // Analog In Header (Bottom Right)
  { id: 'A0', label: 'A0', type: 'analog', description: 'منفذ دخل تماثلي يقيس الجهد من 0 إلى 5V (دقة 10-bit: 0-1023)', x: 365, y: 310 },
  { id: 'A1', label: 'A1', type: 'analog', description: 'منفذ دخل تماثلي لحساسات الحرارة أو الضوء أو الجهد', x: 380, y: 310 },
  { id: 'A2', label: 'A2', type: 'analog', description: 'منفذ دخل تماثلي للقراءة التماثلية analogRead()', x: 395, y: 310 },
  { id: 'A3', label: 'A3', type: 'analog', description: 'منفذ دخل تماثلي 0-5V', x: 410, y: 310 },
  { id: 'A4', label: 'A4', type: 'analog', description: 'منفذ دخل تماثلي وأيضاً خط SDA لبروتوكول I2C', x: 425, y: 310 },
  { id: 'A5', label: 'A5', type: 'analog', description: 'منفذ دخل تماثلي وأيضاً خط SCL لبروتوكول I2C', x: 440, y: 310 },

  // Digital Header High (Top Right to Left)
  { id: 'D0_RX', label: '0 RX', type: 'comm', description: 'منفذ رقمي 0 واستقبال تسلسلي RX من الكمبيوتر أو البلوتوث', x: 445, y: 50 },
  { id: 'D1_TX', label: '1 TX', type: 'comm', description: 'منفذ رقمي 1 وإرسال تسلسلي TX', x: 430, y: 50 },
  { id: 'D2', label: '2', type: 'digital', description: 'منفذ رقمي دخل/خرج ويدعم مقاطعة خارجية (Interrupt 0)', x: 415, y: 50 },
  { id: 'D3_PWM', label: '~3', type: 'pwm', isPWM: true, description: 'منفذ رقمي ويدعم تعديل عرض النبضة PWM analogWrite()', x: 400, y: 50 },
  { id: 'D4', label: '4', type: 'digital', description: 'منفذ رقمي دخل/خرج عام', x: 385, y: 50 },
  { id: 'D5_PWM', label: '~5', type: 'pwm', isPWM: true, description: 'منفذ رقمي مع PWM للتحكم بسرعة المحركات أو سطوع LED', x: 370, y: 50 },
  { id: 'D6_PWM', label: '~6', type: 'pwm', isPWM: true, description: 'منفذ رقمي مع PWM', x: 355, y: 50 },
  { id: 'D7', label: '7', type: 'digital', description: 'منفذ رقمي دخل/خرج عام', x: 340, y: 50 },

  // Digital Header Low
  { id: 'D8', label: '8', type: 'digital', description: 'منفذ رقمي دخل/خرج عام', x: 310, y: 50 },
  { id: 'D9_PWM', label: '~9', type: 'pwm', isPWM: true, description: 'منفذ رقمي مع PWM للتحكم في السيرفو أو الإضاءة', x: 295, y: 50 },
  { id: 'D10_PWM', label: '~10', type: 'pwm', isPWM: true, description: 'منفذ رقمي مع PWM وخط SS لبروتوكول SPI', x: 280, y: 50 },
  { id: 'D11_PWM', label: '~11', type: 'pwm', isPWM: true, description: 'منفذ رقمي مع PWM وخط MOSI لـ SPI', x: 265, y: 50 },
  { id: 'D12', label: '12', type: 'digital', description: 'منفذ رقمي وخط MISO لـ SPI', x: 250, y: 50 },
  { id: 'D13', label: '13', type: 'digital', description: 'منفذ رقمي متصل بمؤشر LED مدمج على اللوحة و SCK لـ SPI', x: 235, y: 50 },
  { id: 'GND_3', label: 'GND', type: 'ground', description: 'أرضي الدائرة الرقمية (Digital Ground)', voltage: 0, x: 220, y: 50 },
  { id: 'AREF', label: 'AREF', type: 'control', description: 'الجهد المرجعي التناظري للمقارنة', x: 205, y: 50 },
];

export interface ComponentPaletteItem {
  type: ComponentType;
  name: string;
  category: 'output' | 'input' | 'passive' | 'sensors' | 'actuators';
  icon: string;
  description: string;
  defaultState: any;
}

export const COMPONENT_CATALOG: ComponentPaletteItem[] = [
  {
    type: 'led',
    name: 'دايود ضوئي LED',
    category: 'output',
    icon: '💡',
    description: 'يصدر ضوءاً عند مرور تيار بالاتجاه الأمامي (الموجب للأنود والسالب للكاثود) ويحتاج لمقاومة حماية.',
    defaultState: { color: '#ef4444', isLit: false, brightness: 0 },
  },
  {
    type: 'resistor',
    name: 'مقاومة كربونية (Resistor)',
    category: 'passive',
    icon: '⚡',
    description: 'تحد من تدفق التيار الكهربائي في الدائرة لحماية المكونات الحساسة كـ LED، وتحدد قيمتها بالألوان (أوم).',
    defaultState: { resistance: 220 },
  },
  {
    type: 'push_button',
    name: 'زر ضاغط (Push Button)',
    category: 'input',
    icon: '🔘',
    description: 'مفتاح لحظي يغلق الدائرة عند الضغط عليه، يستخدم كمدخل رقمي مع مقاومة رفع أو سحب.',
    defaultState: { isPressed: false },
  },
  {
    type: 'potentiometer',
    name: 'مقاومة متغيرة (Potentiometer)',
    category: 'input',
    icon: '🎛️',
    description: 'مقاومة قابلة للتعديل يدوياً بثلاثة أطراف، تعطي جهداً تناظرياً من 0V إلى 5V متصلاً بـ A0.',
    defaultState: { potValue: 512 },
  },
  {
    type: 'buzzer',
    name: 'طنان صوتي (Buzzer)',
    category: 'output',
    icon: '🔔',
    description: 'يصدر نغمات وتنبيهات صوتية بترددات مختلفة باستخدام إشارات رقمية أو PWM tone().',
    defaultState: { buzzerFrequency: 0 },
  },
  {
    type: 'servo_motor',
    name: 'محرك سيرفو (Servo Motor)',
    category: 'actuators',
    icon: '🦾',
    description: 'محرك دقيق يدور بزاوية محددة من 0° إلى 180° باستخدام إشارة PWM مكتبة Servo.h.',
    defaultState: { angle: 90 },
  },
  {
    type: 'dc_motor',
    name: 'محرك تيار مستمر (DC Motor)',
    category: 'actuators',
    icon: '⚙️',
    description: 'محرك يحول الطاقة الكهربائية لحركة دورانية مستمرة، يتم التحكم بسرعته عبر PWM وترانزستور.',
    defaultState: { speed: 0 },
  },
  {
    type: 'ldr',
    name: 'حساس ضوء (LDR)',
    category: 'sensors',
    icon: '☀️',
    description: 'مقاومة ضوئية تتناقص مقاومتها بازدياد شدة الإضاءة، توصل مع مقاومة كمجزئ جهد تماثلي.',
    defaultState: { lightLux: 500 },
  },
  {
    type: 'temp_sensor',
    name: 'حساس حرارة (LM35/TMP36)',
    category: 'sensors',
    icon: '🌡️',
    description: 'يعطي جهداً خطياً يتناسب طردياً مع درجة الحرارة المئوية (10mV لكل درجة مئوية).',
    defaultState: { tempC: 25 },
  },
  {
    type: 'ultrasonic',
    name: 'حساس مسافة ألتراسونيك (HC-SR04)',
    category: 'sensors',
    icon: '📡',
    description: 'يقيس المسافة بالأمواج فوق الصوتية بحساب زمن ارتداد نبضة صدى الصدى Echo و Trigger.',
    defaultState: { distanceCm: 24 },
  },
  {
    type: 'ir_sensor',
    name: 'حساس أشعة تحت حمراء (IR Sensor)',
    category: 'sensors',
    icon: '🎯',
    description: 'يكتشف وجود العوائق أو تتبع الخط الأسود برصد انعكاس الأشعة تحت الحمراء.',
    defaultState: { isPressed: false },
  },
  {
    type: 'relay',
    name: 'ريليه ميكانيكي (Relay)',
    category: 'actuators',
    icon: '🧲',
    description: 'مفتاح كهرومغناطيسي للتحكم بأحمال التيار المتردد أو الجهد العالي بواسطة إشارة 5V من أردوينو.',
    defaultState: { relayClosed: false },
  },
  {
    type: 'rgb_led',
    name: 'دايود ضوئي ملوّن (RGB LED)',
    category: 'output',
    icon: '🌈',
    description: 'يجمع ثلاثة دايودات (أحمر، أخضر، أزرق) في جسم واحد لإنتاج أي لون عبر مزج PWM.',
    defaultState: { rgbColor: { r: 255, g: 0, b: 0 } },
  },
  {
    type: 'lcd_16x2',
    name: 'شاشة نصية (LCD 16x2)',
    category: 'output',
    icon: '📟',
    description: 'شاشة بلورية لعرض سطرين، كل سطر يتسع لـ 16 حرفاً أو رقماً، متوافقة مع LiquidCrystal.',
    defaultState: { lcdText: 'Mechatronics!   Distance: 25cm  ' },
  },
  {
    type: 'seven_segment',
    name: 'شاشة أرقام (7-Segment)',
    category: 'output',
    icon: '🔢',
    description: 'تتكون من سبع قطع LED لعرض الأرقام العشرية من 0 إلى 9 بالتحكم المباشر بالمنافذ.',
    defaultState: { segmentDigit: 8 },
  },
];

// Preset Curriculum Experiments (13 Experiments)
export const PRESET_EXPERIMENTS: PresetExperiment[] = [
  {
    id: 'exp_1_led_blink',
    title: '1. تشغيل وميض LED (Blink)',
    category: 'المبتدئ - الأساسيات',
    level: 'مبتدئ',
    summary: 'تعلم توصيل دايود ضوئي LED مع مقاومة حماية 220Ω إلى المنفذ الرقمي Pin 13 للتحكم في تشغيله وإطفائه.',
    componentsNeeded: [
      { type: 'led', count: 1, name: 'LED أحمر' },
      { type: 'resistor', count: 1, name: 'مقاومة 220Ω' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تثبيت LED على لوحة التجارب',
        instruction: 'اسحب الـ LED من شريط المكونات وضعه على Breadboard بحيث يكون الأنود (الطرف الطويل) في عمود منفصل عن الكاثود.',
        detail: 'تذكر أن التيار يمر من الطرف الموجب (الأنود) إلى الطرف السالب (الكاثود).',
      },
      {
        stepNumber: 2,
        title: 'إضافة مقاومة الحماية 220Ω',
        instruction: 'ضع مقاومة 220Ω في نفس عمود أنود الـ LED لحمايته من الاحتراق.',
        detail: 'بدون مقاومة، سيتدفق تيار عالٍ يتجاوز 20mA ويحرق الدايود فوراً.',
      },
      {
        stepNumber: 3,
        title: 'توصيل إشارة التحكم من Arduino Pin 13',
        instruction: 'وصل سلكاً (أصفر أو أزرق) من منفذ Arduino Pin 13 إلى الطرف الثاني للمقاومة.',
        detail: 'المنفذ 13 سيقوم بإخراج 5V في حالة HIGH أو 0V في حالة LOW.',
      },
      {
        stepNumber: 4,
        title: 'توصيل الأرضي المشترك GND',
        instruction: 'وصل سلكاً أسود من طرف كاثود الـ LED إلى منفذ Arduino GND.',
        detail: 'الآن اكتملت الدائرة المغلقة ويمكنك اختبار المحاكاة وتشغيل الكود!',
      },
    ],
    defaultCode: `// 1. تجربة وميض LED
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("System Ready: LED Blink Started");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED State: ON [5V]");
  delay(1000);
  
  digitalWrite(ledPin, LOW);
  Serial.println("LED State: OFF [0V]");
  delay(1000);
}`,
    expectedSerialOutputs: ['System Ready: LED Blink Started', 'LED State: ON [5V]', 'LED State: OFF [0V]'],
    autoTestRules: {
      requiredComponents: ['led', 'resistor'],
      mustHavePins: ['D13', 'GND_1'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_2_button_led',
    title: '2. التحكم بـ LED عبر زر ضاغط (Push Button)',
    category: 'المبتدئ - المداخل الرقمية',
    level: 'مبتدئ',
    summary: 'قراءة حالة المفتاح الرقمي (Digital Input) وتشغيل الـ LED بمجرد الضغط عليه.',
    componentsNeeded: [
      { type: 'push_button', count: 1, name: 'زر ضاغط' },
      { type: 'led', count: 1, name: 'LED أخضر' },
      { type: 'resistor', count: 2, name: 'مقاومتان (220Ω و 10kΩ)' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تثبيت الزر والـ LED',
        instruction: 'ضع الزر والـ LED على لوحة التجارب مع مقاوماتهم.',
        detail: 'المقاومة 10kΩ تعمل كـ Pull-down لمنع الإشارة العائمة.',
      },
      {
        stepNumber: 2,
        title: 'توصيل تغذية الزر',
        instruction: 'وصل طرف الزر بـ 5V والطرف الآخر بمنفذ Pin 2 ومقاومة 10kΩ إلى GND.',
        detail: 'عند الضغط، ينتقل جهد 5V إلى Pin 2 فيقرأ digitalRead() قيمة HIGH.',
      },
      {
        stepNumber: 3,
        title: 'توصيل مخرج الـ LED',
        instruction: 'وصل الـ LED مع مقاومته إلى Pin 8 والكاثود إلى GND.',
        detail: 'Pin 8 سيضيء عندما يستشعر كود الأردوينو ضغط المفتاح.',
      },
    ],
    defaultCode: `const int buttonPin = 2;
const int ledPin = 8;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Button Controller Initialized");
}

void loop() {
  int buttonState = digitalRead(buttonPin);
  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Button: PRESSED -> LED: ON");
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(150);
}`,
    autoTestRules: {
      requiredComponents: ['push_button', 'led', 'resistor'],
      mustHavePins: ['D2', 'D8', 'GND_1'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_3_potentiometer',
    title: '3. التحكم في سطوع LED بالمقاومة المتغيرة (Potentiometer & PWM)',
    category: 'التماثلي والـ PWM',
    level: 'متوسط',
    summary: 'قراءة الجهد التماثلي 0-5V عبر منفذ A0 وتحويله إلى نبضات PWM على المنفذ D9 لتغيير سطوع الدايود تدريجياً.',
    componentsNeeded: [
      { type: 'potentiometer', count: 1, name: 'مقاومة متغيرة 10kΩ' },
      { type: 'led', count: 1, name: 'LED أزرق' },
      { type: 'resistor', count: 1, name: 'مقاومة 220Ω' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'توصيل أطراف المقاومة المتغيرة',
        instruction: 'وصل الطرفين الخارجيين بـ 5V و GND، والطرف الأوسط (المنزلق) بمنفذ A0.',
        detail: 'الطرف الأوسط يقسم الجهد بنسبة موضع المقبض.',
      },
      {
        stepNumber: 2,
        title: 'توصيل الـ LED بمنفذ PWM',
        instruction: 'وصل أنود LED مع مقاومة 220Ω بمنفذ D9 (يدعم PWM)، والكاثود إلى GND.',
        detail: 'دالة analogWrite(9, val) تتحكم بنسبة التشغيل Duty Cycle من 0 إلى 255.',
      },
    ],
    defaultCode: `const int potPin = A0;
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(potPin); // 0 - 1023
  int outputValue = map(sensorValue, 0, 1023, 0, 255);
  analogWrite(ledPin, outputValue);
  
  Serial.print("Analog In: ");
  Serial.print(sensorValue);
  Serial.print(" | PWM Out: ");
  Serial.println(outputValue);
  delay(100);
}`,
    autoTestRules: {
      requiredComponents: ['potentiometer', 'led', 'resistor'],
      mustHavePins: ['A0', 'D9_PWM', '5V', 'GND_1'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_4_ultrasonic',
    title: '4. قياس المسافة بحساس الألتراسونيك (HC-SR04)',
    category: 'الحساسات والميكاترونكس',
    level: 'متوسط',
    summary: 'إرسال نبضة فوق صوتية وقياس زمن العودة لحساب المسافة بالسنتيمتر وعرضها في السيريال مونيتور.',
    componentsNeeded: [
      { type: 'ultrasonic', count: 1, name: 'حساس HC-SR04' },
      { type: 'buzzer', count: 1, name: 'طنان صوتي تنبيهي' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تغذية الحساس',
        instruction: 'وصل VCC بـ 5V و GND بـ GND Arduino.',
        detail: 'الحساس يتطلب 5V مستقر للعمل.',
      },
      {
        stepNumber: 2,
        title: 'توصيل إشارات Trigger و Echo',
        instruction: 'وصل منفذ Trig بـ Pin 7 ومنفذ Echo بـ Pin 6.',
        detail: 'Trig يطلق النبضة و Echo يستقبل إشارة الصدى المنعكسة.',
      },
    ],
    defaultCode: `const int trigPin = 7;
const int echoPin = 6;
const int buzzerPin = 8;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("HC-SR04 Distance Measurement Online");
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  int distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  if (distance < 15) {
    digitalWrite(buzzerPin, HIGH);
    Serial.println("⚠️ Warning: Obstacle Too Close!");
  } else {
    digitalWrite(buzzerPin, LOW);
  }
  delay(500);
}`,
    autoTestRules: {
      requiredComponents: ['ultrasonic'],
      mustHavePins: ['5V', 'GND_1', 'D7', 'D6_PWM'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_5_servo',
    title: '5. التحكم بزاوية محرك السيرفو (Servo Motor)',
    category: 'المشغلات الميكانيكية Actuators',
    level: 'متوسط',
    summary: 'التحكم بزاوية دوران ذراع الروبوت أو السيرفو بدقة من 0 إلى 180 درجة باستخدام مكتبة Servo.',
    componentsNeeded: [
      { type: 'servo_motor', count: 1, name: 'سيرفو SG90' },
      { type: 'potentiometer', count: 1, name: 'مقاومة متغيرة' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'توصيل أسلاك السيرفو الثلاثة',
        instruction: 'السلك الأحمر بـ 5V، والسلك البني/الأسود بـ GND، والسلك البرتقالي بـ Pin 9.',
        detail: 'السلك البرتقالي يستقبل نبضات التحكم في الزاوية بعرض نبضة 1ms إلى 2ms.',
      },
      {
        stepNumber: 2,
        title: 'اختبار الحركة التلقائية',
        instruction: 'شغل المحاكاة لرؤية دوران ذراع السيرفو ذهاباً وإياباً بسلاسة.',
        detail: 'يمكنك أيضاً ربط زاوية السيرفو بقراءة المقاومة المتغيرة.',
      },
    ],
    defaultCode: `#include <Servo.h>
Servo myServo;

void setup() {
  myServo.attach(9);
  Serial.begin(9600);
  Serial.println("Servo Motor Controller Ready");
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 45) {
    myServo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.print(pos);
    Serial.println(" deg");
    delay(500);
  }
  for (int pos = 180; pos >= 0; pos -= 45) {
    myServo.write(pos);
    delay(500);
  }
}`,
    autoTestRules: {
      requiredComponents: ['servo_motor'],
      mustHavePins: ['5V', 'GND_1', 'D9_PWM'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_6_buzzer_melody',
    title: '6. توليد نغمات موسيقية بالطنان الصوتي (Buzzer)',
    category: 'المخرجات الصوتية',
    level: 'مبتدئ',
    summary: 'توليد نغمات وتنبيهات صوتية بترددات متغيرة باستخدام دالة tone() على المنفذ D8.',
    componentsNeeded: [{ type: 'buzzer', count: 1, name: 'طنان صوتي' }],
    steps: [
      {
        stepNumber: 1,
        title: 'توصيل طرفي الطنان',
        instruction: 'وصل الطرف الموجب بـ Pin 8 والطرف السالب بـ GND.',
        detail: 'الطنان البيزو يترجم الترددات الكهربائية إلى اهتزازات صوتية مسموعة.',
      },
    ],
    defaultCode: `const int buzzerPin = 8;

int melody[] = { 262, 294, 330, 349, 392, 440, 494, 523 };

void setup() {
  Serial.begin(9600);
  Serial.println("Playing Electronic Melody...");
  for (int i = 0; i < 8; i++) {
    tone(buzzerPin, melody[i], 300);
    Serial.print("Freq: ");
    Serial.print(melody[i]);
    Serial.println(" Hz");
    delay(350);
  }
  noTone(buzzerPin);
}

void loop() {
  // Idle after melody
}`,
    autoTestRules: {
      requiredComponents: ['buzzer'],
      mustHavePins: ['D8', 'GND_1'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_7_ldr_light',
    title: '7. نظام إنارة ذكي بحساس الضوء (LDR)',
    category: 'الحساسات الذكية',
    level: 'متوسط',
    summary: 'تشغيل الإضاءة تلقائياً في الظلام عندما تقل قيمة الضوء المقاسة بمقاومة LDR.',
    componentsNeeded: [
      { type: 'ldr', count: 1, name: 'حساس LDR' },
      { type: 'resistor', count: 2, name: 'مقاومتان (10kΩ و 220Ω)' },
      { type: 'led', count: 1, name: 'LED أصفر' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تكوين مجزئ الجهد للحساس',
        instruction: 'وصل طرف LDR بـ 5V وطرفه الآخر بـ A0 ومقاومة 10kΩ للأرضي.',
        detail: 'تتغير قيمة الجهد عند A0 تبعاً لشدة الضوء الساقط.',
      },
      {
        stepNumber: 2,
        title: 'توصيل مصباح الشارع LED',
        instruction: 'وصل LED مع مقاومة 220Ω إلى Pin 12 والكاثود إلى GND.',
        detail: 'إذا كانت القراءة التماثلية أقل من 400 (ظلام)، يعمل الـ LED تلقائياً.',
      },
    ],
    defaultCode: `const int ldrPin = A0;
const int ledPin = 12;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  Serial.print("Light Intensity: ");
  Serial.println(lightLevel);

  if (lightLevel < 400) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Status: DARK -> Street Light ON");
  } else {
    digitalWrite(ledPin, LOW);
    Serial.println("Status: BRIGHT -> Street Light OFF");
  }
  delay(1000);
}`,
    autoTestRules: {
      requiredComponents: ['ldr', 'led', 'resistor'],
      mustHavePins: ['A0', 'D12', '5V', 'GND_1'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_8_relay_control',
    title: '8. التحكم بحمل كبير عبر الريليه (Relay Module)',
    category: 'التحكم الصناعي والأتمتة',
    level: 'متقدم',
    summary: 'عزل الإشارة والتحكم بجهد عالي أو محرك كبير باستخدام مفتاح الريليه الكهرومغناطيسي.',
    componentsNeeded: [
      { type: 'relay', count: 1, name: 'ريليه 5V' },
      { type: 'dc_motor', count: 1, name: 'محرك تيار مستمر' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تغذية ملف الريليه',
        instruction: 'وصل VCC بـ 5V، و GND بالأرضي، وإشارة التحكم IN بـ Pin 4.',
        detail: 'الملف الداخلي يجذب نقاط التلامس عند إرسال نبضة كهربائية.',
      },
    ],
    defaultCode: `const int relayPin = 4;

void setup() {
  pinMode(relayPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(relayPin, HIGH);
  Serial.println("Relay Energized: Load Connected [ON]");
  delay(3000);

  digitalWrite(relayPin, LOW);
  Serial.println("Relay Released: Load Disconnected [OFF]");
  delay(3000);
}`,
    autoTestRules: {
      requiredComponents: ['relay'],
      mustHavePins: ['D4', '5V', 'GND_1'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_9_rgb_color',
    title: '9. خلط الألوان دايود RGB LED',
    category: 'المخرجات المتقدمة',
    level: 'متوسط',
    summary: 'توليد ألوان قوس قزح بمزج قيم الأحمر والأخضر والأزرق بمنافذ الـ PWM D9, D10, D11.',
    componentsNeeded: [
      { type: 'rgb_led', count: 1, name: 'دايود RGB مشترك الكاثود' },
      { type: 'resistor', count: 3, name: '3 مقاومات 220Ω' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'توصيل أطراف RGB الثلاثة',
        instruction: 'وصل أطراف R و G و B مع مقاومات بمنافذ 9 و 10 و 11، والطرف المشترك بـ GND.',
        detail: 'كل لون يحتاج لمقاومة مستقلة لضبط تياره.',
      },
    ],
    defaultCode: `const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setColor(int r, int g, int b) {
  analogWrite(redPin, r);
  analogWrite(greenPin, g);
  analogWrite(bluePin, b);
}

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.println("Color: RED");
  setColor(255, 0, 0);
  delay(1000);
  
  Serial.println("Color: GREEN");
  setColor(0, 255, 0);
  delay(1000);

  Serial.println("Color: BLUE");
  setColor(0, 0, 255);
  delay(1000);

  Serial.println("Color: CYAN");
  setColor(0, 255, 255);
  delay(1000);
}`,
    autoTestRules: {
      requiredComponents: ['rgb_led', 'resistor'],
      mustHavePins: ['D9_PWM', 'D10_PWM', 'D11_PWM', 'GND_1'],
      mustNotHaveShortCircuit: true,
    },
  },

  {
    id: 'exp_10_smart_home',
    title: '10. مشروع البيت الذكي ونظام الإنذار (Smart Alarm System)',
    category: 'المشاريع المتكاملة',
    level: 'متقدم',
    summary: 'مشروع ميكاترونكس متكامل يدمج حساس المسافة، طنان الإنذار، مؤشر ضوئي، وشاشة Serial للتحذير من المتسللين.',
    componentsNeeded: [
      { type: 'ultrasonic', count: 1, name: 'حساس كشف الحركة HC-SR04' },
      { type: 'buzzer', count: 1, name: 'صفارة الإنذار' },
      { type: 'led', count: 1, name: 'LED تحذيري' },
      { type: 'resistor', count: 1, name: 'مقاومة 220Ω' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'توصيل مجسات الاستشعار',
        instruction: 'وصل الـ Ultrasonic إلى Pin 7 و Pin 6 مع تغذية 5V.',
        detail: 'يراقب الحساس محيط الغرفة بدقة.',
      },
      {
        stepNumber: 2,
        title: 'توصيل مخرجات الإنذار',
        instruction: 'وصل البزر بـ Pin 8 والـ LED بـ Pin 13.',
        detail: 'يتم إطلاق الإنذار الصوتي والضوئي عند اقتراب أي جسم أقل من 20 سم.',
      },
    ],
    defaultCode: `// نظام الإنذار الأمني للبيت الذكي
const int trigPin = 7;
const int echoPin = 6;
const int alarmBuzzer = 8;
const int warningLed = 13;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(alarmBuzzer, OUTPUT);
  pinMode(warningLed, OUTPUT);
  Serial.begin(9600);
  Serial.println("=== SMART SECURITY SYSTEM ONLINE ===");
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  int dist = duration * 0.034 / 2;

  Serial.print("Zone Distance: ");
  Serial.print(dist);
  Serial.println(" cm");

  if (dist > 0 && dist < 20) {
    // INTRUDER DETECTED!
    digitalWrite(warningLed, HIGH);
    tone(alarmBuzzer, 1000);
    Serial.println("🚨 ALERT: INTRUDER BREACHED PERIMETER! 🚨");
  } else {
    digitalWrite(warningLed, LOW);
    noTone(alarmBuzzer);
    Serial.println("Status: SECURE - All Clear");
  }
  delay(600);
}`,
    autoTestRules: {
      requiredComponents: ['ultrasonic', 'buzzer', 'led'],
      mustHavePins: ['D7', 'D6_PWM', 'D8', 'D13', '5V', 'GND_1'],
      mustNotHaveShortCircuit: true,
    },
  },
];

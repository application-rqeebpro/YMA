import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Code, 
  Terminal, 
  HelpCircle, 
  CheckCircle2, 
  Save, 
  BookOpen, 
  Sliders, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Volume2,
  VolumeX,
  Layers,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Compass,
  Radio,
  Zap,
  Info,
  Sun,
  Activity,
  Move,
  Clock
} from 'lucide-react';

export interface ArduinoLessonItem {
  id: number;
  title: string;
  englishTitle: string;
  category: 'BASICS' | 'INTERMEDIATE' | 'ADVANCED' | 'PROJECTS';
  icon: string;
  overview: string;
  bullets: string[];
  specs: { label: string; val: string }[];
  code: string;
  defaultObstacle?: 'wall' | 'car' | 'box' | 'ball';
}

export const ARDUINO_LESSONS: ArduinoLessonItem[] = [
  {
    id: 1,
    title: 'التعرف على اللوحة (Meet the Board)',
    englishTitle: 'MEET THE BOARD',
    category: 'BASICS',
    icon: '🔌',
    overview: 'اللوحة الإلكترونية Arduino Uno هي قلب الميكاترونكس والأتمتة. تعتمد على المعالج الدقيق ATmega328P وتدعم منفذ USB للتغذية والبرمجة مع منافذ رقمية وتماثلية.',
    bullets: [
      'تعتمد على المعالج الدقيق ATmega328P بعمارة 8-bit وسرعة 16MHz.',
      'تتغذى بجهد 5V عبر USB أو جهد خارجي 7-12V عبر مقبس التغذية.',
      'تحوي 14 منفذًا رقمياً (Pins 0-13) و 6 منافذ تماثلية (A0-A5).'
    ],
    specs: [
      { label: 'المعالج الدقيق', val: 'ATmega328P' },
      { label: 'جهد التشغيل', val: '5V DC' },
      { label: 'المنافذ الرقمية', val: '14 (منها 6 PWM)' },
      { label: 'المنافذ التماثلية', val: '6 (A0 - A5)' }
    ],
    code: `void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}`
  },
  {
    id: 2,
    title: 'إضاءة المصباح (Blink an LED)',
    englishTitle: 'BLINK AN LED',
    category: 'BASICS',
    icon: '💡',
    overview: 'أول دائرة عمليّة في عالم الميكاترونكس: توصيل دايود مشع LED مع مقاومة حماية 220Ω على breadboard وتوليد إشارة نبضية عبر الأردوينو.',
    bullets: [
      'المقاومة (220Ω) تحمي الدايود LED من الاحتراق بسبب شدة التيار.',
      'الدالة digitalWrite(pin, HIGH) تعطي جهد 5V لتشغيل المصباح.',
      'الدالة delay(1000) تؤخر التنفيذ لمدة ثانية كاملة.'
    ],
    specs: [
      { label: 'الطرف الموصل', val: 'Digital Pin 13' },
      { label: 'مقاومة الحماية', val: '220 Ohm' },
      { label: 'جهد LED', val: '2.0V - 2.2V' }
    ],
    code: `const int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_PIN, LOW);\n  delay(1000);\n}`
  },
  {
    id: 3,
    title: 'زر الضغط (Push a Button)',
    englishTitle: 'PUSH A BUTTON',
    category: 'BASICS',
    icon: '🔘',
    overview: 'قراءة إشارة الدخل الرقمي من مفتاح الضغط Button. عند الضغط ينتقل الجهد إلى 5V (HIGH)، وتستخدم مقاومة هبوط Pull-down للثبات.',
    bullets: [
      'الدالة digitalRead(pin) تقرأ حالة المنفذ (HIGH أو LOW).',
      'مقاومة الهبوط Pull-down تثبت المنفذ عند 0V عند عدم الضغط.',
      'تستخدم المفاتيح للتحكم المباشر في بدء تشغيل المحركات أو الآلات.'
    ],
    specs: [
      { label: 'منفذ المفتاح', val: 'Digital Pin 2' },
      { label: 'نوع الدخل', val: 'Digital Input' },
      { label: 'مقاومة الهبوط', val: '10k Ohm' }
    ],
    code: `const int BUTTON_PIN = 2;\nconst int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(BUTTON_PIN, INPUT);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  int buttonState = digitalRead(BUTTON_PIN);\n  if (buttonState == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n  }\n}`
  },
  {
    id: 4,
    title: 'المقاومة المتغيرة (Turn a Knob)',
    englishTitle: 'TURN A KNOB',
    category: 'BASICS',
    icon: '🎛️',
    overview: 'المقاومة المتغيرة Potentiometer تعطي إشارة تماثلية تتراوح بين 0V و 5V. يقرأها المعالج عبر المحول التماثلي الرقمي ADC بقيم بين 0 و 1023.',
    bullets: [
      'الدالة analogRead(A0) تقرأ الجهد وتحوله إلى قيمة بين 0 و 1023.',
      'الدالة map() تحول مدى القيم التماثلية لملائمة شدة الإضاءة PWM (0-255).',
      'تستخدم في التحكم بسرعات المحركات وتحديد زوايا الروبوت.'
    ],
    specs: [
      { label: 'منفذ المقاومة', val: 'Analog Pin A0' },
      { label: 'دقة المحول ADC', val: '10-bit (0 - 1023)' },
      { label: 'منفذ التحكم PWM', val: 'Digital Pin ~11' }
    ],
    code: `const int POT_PIN = A0;\nconst int LED_PIN = 11;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int val = analogRead(POT_PIN);\n  int brightness = map(val, 0, 1023, 0, 255);\n  analogWrite(LED_PIN, brightness);\n  Serial.print("Val: ");\n  Serial.println(val);\n  delay(50);\n}`
  },
  {
    id: 5,
    title: 'مزج الألوان (Mix Colours)',
    englishTitle: 'MIX COLOURS',
    category: 'BASICS',
    icon: '🌈',
    overview: 'الدايود متعدد الألوان RGB LED يحوي 3 دايودات (أحمر، أخضر، أزرق). بمزج نسب الإشارة PWM من 0 إلى 255 يمكنك إنتاج ملايين الألوان الفاتنة.',
    bullets: [
      'توليد إشارات التعديل عرض النبضة PWM على المنافذ ~9, ~10, ~11.',
      'مزج الأحادي الأحمر والأخضر والأزرق للتحكم الدقيق في درجة اللون.',
      'استخدام الكاثود المشترك وتوصيل المقاومات لحماية الشريحة.'
    ],
    specs: [
      { label: 'منافذ RGB', val: 'Pins ~9, ~10, ~11 (PWM)' },
      { label: 'مدى الألوان', val: '0 - 255 لكل لون' },
      { label: 'نوع الدايود', val: 'Common Cathode' }
    ],
    code: `const int RED_PIN = 9;\nconst int GREEN_PIN = 10;\nconst int BLUE_PIN = 11;\n\nvoid setup() {\n  pinMode(RED_PIN, OUTPUT);\n  pinMode(GREEN_PIN, OUTPUT);\n  pinMode(BLUE_PIN, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(RED_PIN, 255);\n  analogWrite(GREEN_PIN, 100);\n  analogWrite(BLUE_PIN, 50);\n  delay(1000);\n}`
  },
  {
    id: 6,
    title: 'حساس الضوء (Sense Light)',
    englishTitle: 'SENSE LIGHT',
    category: 'BASICS',
    icon: '☀️',
    overview: 'حساس LDR تتغير مقاوَمته الكهربائية تبعاً لشدة الضوء الساقط عليه. يقرأ الأردوينو هبوط الجهد عبر مجزئ الجهد للتمييز بين النهار والليل.',
    bullets: [
      'تنخفض مقاومة LDR مع زيادة شدة الضوء وتزداد في الظلام.',
      'توصيل LDR مع مقاومة 10kΩ في دائرة مجزئ جهد Voltage Divider.',
      'تطبيقات الإنارة الذكية وإضاءة شوارع المدن الذكية.'
    ],
    specs: [
      { label: 'حساس الضوء', val: 'LDR Photoresistor' },
      { label: 'المنفذ', val: 'Analog Pin A0' },
      { label: 'مقاومة المقسم', val: '10k Ohm' }
    ],
    code: `const int LDR_PIN = A0;\nconst int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int lightVal = analogRead(LDR_PIN);\n  Serial.print("Light: ");\n  Serial.println(lightVal);\n  if (lightVal < 300) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n  }\n  delay(100);\n}`
  },
  {
    id: 7,
    title: 'قراءة حساس المسافة (Read a Sensor)',
    englishTitle: 'READ A SENSOR',
    category: 'BASICS',
    icon: '📡',
    overview: 'حساس الموجات فوق الصوتية HC-SR04 يرسل نبضة صوتية بتردد 40kHz ويحسب زمن ارتداد الموجة من العائق لحساب المسافة بدقة عالية بالسنتيمتر.',
    bullets: [
      'إرسال نبضة TRIG بعرض 10 ميكروثانية واستقبال صدى الإشارة على ECHO.',
      'حساب المسافة من القانون: Distance (cm) = Microseconds / 58.',
      'إمكانية سحب العوائق (حائط، سيارة، صندوق، كرة) واختبار القراءة لحظياً!'
    ],
    specs: [
      { label: 'الموديل', val: 'HC-SR04 Ultrasonic' },
      { label: 'المنافذ', val: 'Trig = 9, Echo = 10' },
      { label: 'مدى القياس', val: '2 cm - 400 cm' }
    ],
    code: `const int TRIG = 9;\nconst int ECHO = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n\n  long cm = pulseIn(ECHO, HIGH) / 58;\n  Serial.print(cm);\n  Serial.println(" cm");\n  delay(100);\n}`,
    defaultObstacle: 'wall'
  },
  {
    id: 8,
    title: 'توليد النغمات والأصوات (Make a Sound)',
    englishTitle: 'MAKE A SOUND',
    category: 'BASICS',
    icon: '🔔',
    overview: 'الطنان الصوتي Piezo Buzzer يحول الإشارات الكهربائية بترددات مختلفة إلى نغمات موسيقية وصفارات إنذار باستخدام الدالة tone().',
    bullets: [
      'الدالة tone(pin, frequency, duration) تولد نغمة بتردد محدد بالهيرتز.',
      'توليد صفارات إنذار عند كشف الأعطال أو تجاوز الحدود الأقادمية.',
      'توليد الترددات الصوتية من 261Hz (Do) حتى 987Hz (Si).'
    ],
    specs: [
      { label: 'نوع الطنان', val: 'Piezoelectric Buzzer' },
      { label: 'المنفذ', val: 'Digital Pin 8' },
      { label: 'نطاق التردد', val: '100 Hz - 5000 Hz' }
    ],
    code: `const int BUZZER_PIN = 8;\n\nvoid setup() {\n  pinMode(BUZZER_PIN, OUTPUT);\n}\n\nvoid loop() {\n  tone(BUZZER_PIN, 440, 200);\n  delay(500);\n  tone(BUZZER_PIN, 880, 200);\n  delay(500);\n}`
  },
  {
    id: 9,
    title: 'التحكم بالمحرك (Control a Motor)',
    englishTitle: 'CONTROL A MOTOR',
    category: 'BASICS',
    icon: '⚙️',
    overview: 'محركات التيار المستمر DC تحتاج ترانزستور أو مشغل قدرة H-Bridge. يتم التحكم بسرعة دوران المروحة والمحرك عبر إشارات التحكم PWM.',
    bullets: [
      'الترانزستور NPN يعزل شريحة الأردوينو عن التيار العالي للمحرك.',
      'الدايود العكسي Flyback Diode يحمي الترانزستور من الجهد العكسي.',
      'التحكم الدقيق بسلسلة السرعات عبر التعديل analogWrite(MOTOR, speed).'
    ],
    specs: [
      { label: 'المحرك', val: 'DC Motor + Propeller' },
      { label: 'منفذ التحكم', val: 'Digital Pin ~6 (PWM)' },
      { label: 'المكونات', val: 'NPN Transistor + Diode' }
    ],
    code: `const int MOTOR = 6;\n\nvoid setup() {\n  pinMode(MOTOR, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i <= 255; i += 5) {\n    analogWrite(MOTOR, i);\n    delay(40);\n  }\n  delay(1500);\n}`
  },
  {
    id: 10,
    title: 'تحريك محرك السيرفو (Sweep a Servo)',
    englishTitle: 'SWEEP A SERVO',
    category: 'BASICS',
    icon: '🦾',
    overview: 'محركات السيرفو SG90 تمتاز بالدقة العالية في ضبط الزاوية من 0° إلى 180°، وتعتمد على مكتبة Servo.h لإرسال نبضات التحكم.',
    bullets: [
      'المكتبة Servo.h تبسط التحكم وتوفر الدالة arm.write(angle).',
      'تستخدم محركات السيرفو في الأذرع الروبوتية والتوجيه في السيارات الذكية.',
      'مسح الحركة بالتناوب من 0° إلى 180° والعودة بسلاسة.'
    ],
    specs: [
      { label: 'المحرك', val: 'SG90 Micro Servo' },
      { label: 'منفذ الإشارة', val: 'Digital Pin 9' },
      { label: 'زاوية الدوران', val: '0° - 180°' }
    ],
    code: `#include <Servo.h>\nServo arm;\n\nvoid setup() {\n  arm.attach(9);\n}\n\nvoid loop() {\n  for (int a = 0; a <= 180; a += 5) {\n    arm.write(a);\n    delay(15);\n  }\n  for (int a = 180; a >= 0; a -= 5) {\n    arm.write(a);\n    delay(15);\n  }\n}`
  },
  {
    id: 11,
    title: 'بناء مشروع إشارة مرور ذكية (Build a Project)',
    englishTitle: 'BUILD A PROJECT',
    category: 'PROJECTS',
    icon: '🚗',
    overview: 'مشروع ميكاتروني متكامل يدمج حساس المسافة الموجات فوق الصوتية HC-SR04 مع إشارات مرور ضوئية (أحمر، أصفر، أخضر) وسيارة متحركة!',
    bullets: [
      'عند اقتراب السيارة (أقل من 20cm) تضيء الإشارة الحمراء ويتوقف السائق.',
      'عند المسافة المتوسطة (20cm - 50cm) تضيء الإشارة الصفراء للتحذير.',
      'عند المسافة الآمنة (أكبر من 50cm) تضيء الإشارة الخضراء وسير المركبة.'
    ],
    specs: [
      { label: 'حساس المسافة', val: 'HC-SR04 (Trig=9, Echo=10)' },
      { label: 'إشارات المرور', val: 'Red=4, Ylw=3, Grn=2' },
      { label: 'العائق التفاعلي', val: 'سيارة لعب متحركة' }
    ],
    code: `const int TRIG = 9, ECHO = 10;\nconst int RED = 4, YLW = 3, GRN = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  pinMode(RED, OUTPUT);\n  pinMode(YLW, OUTPUT);\n  pinMode(GRN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  long cm = pulseIn(ECHO, HIGH) / 58;\n\n  digitalWrite(GRN, cm > 50);\n  digitalWrite(YLW, cm > 20 && cm <= 50);\n  digitalWrite(RED, cm <= 20);\n\n  Serial.print(cm);\n  if (cm <= 20) Serial.println(" cm - RED - stop!");\n  else if (cm <= 50) Serial.println(" cm - YELLOW - slow down");\n  else Serial.println(" cm - GREEN - all clear");\n  delay(200);\n}`,
    defaultObstacle: 'car'
  }
];

export const ArduinoSimulatorView: React.FC = () => {
  // Selected Lesson
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(6); // Default to Lesson 7 (Read a Sensor)
  const lesson = ARDUINO_LESSONS[currentLessonIndex];

  // Active Tab: 'overview' | 'pinout' | 'example' | 'specs'
  const [activeTab, setActiveTab] = useState<'overview' | 'pinout' | 'example' | 'specs'>('overview');

  // Simulation Status
  const [isCompiling, setIsCompiling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('جاهز للمحاكاة (SIMULATION READY)');

  // Interactive Lesson States
  const [distanceCm, setDistanceCm] = useState<number>(22); // Ultrasonic distance
  const [selectedObstacle, setSelectedObstacle] = useState<'wall' | 'car' | 'box' | 'ball'>('wall');
  const [isDraggingObstacle, setIsDraggingObstacle] = useState(false);

  const [buttonPressed, setButtonPressed] = useState(false);
  const [potentiometerVal, setPotentiometerVal] = useState<number>(512); // 0-1023
  const [rgbColor, setRgbColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 100, b: 50 });
  const [ambientLight, setAmbientLight] = useState<number>(75); // 0-100%
  const [buzzerFrequency, setBuzzerFrequency] = useState<number>(440);
  const [motorSpeed, setMotorSpeed] = useState<number>(180); // 0-255
  const [servoAngle, setServoAngle] = useState<number>(90); // 0-180°
  const [isBlinkingLed, setIsBlinkingLed] = useState(true);

  // Editable Code & Serial Logs
  const [editableCode, setEditableCode] = useState<string>(lesson.code);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    'Serial Monitor Initialized at 9600 baud.',
    'Arduino Uno R3 Connected.'
  ]);

  // Sync code when lesson changes
  useEffect(() => {
    setEditableCode(lesson.code);
    if (lesson.defaultObstacle) {
      setSelectedObstacle(lesson.defaultObstacle);
    }
  }, [currentLessonIndex]);

  // Ultrasonic distance animation & Servo sweep loops when simulation is running
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (lesson.id === 7 || lesson.id === 11) {
          setSerialLogs((prev) => {
            const statusTag = distanceCm <= 20 ? ' - RED - stop!' : distanceCm <= 50 ? ' - YELLOW - slow down' : ' cm - GREEN - all clear';
            const logLine = lesson.id === 11 ? `${distanceCm}${statusTag}` : `${distanceCm} cm`;
            return [logLine, ...prev.slice(0, 15)];
          });
        } else if (lesson.id === 10) {
          setServoAngle((prev) => (prev + 10) % 180);
          setSerialLogs((prev) => [`Servo Angle: ${servoAngle}°`, ...prev.slice(0, 15)]);
        } else if (lesson.id === 2) {
          setIsBlinkingLed((prev) => !prev);
        } else if (lesson.id === 4) {
          setSerialLogs((prev) => [`Potentiometer ADC: ${potentiometerVal}`, ...prev.slice(0, 15)]);
        } else if (lesson.id === 6) {
          const ldrReading = Math.floor(ambientLight * 10.23);
          setSerialLogs((prev) => [`LDR Sensor ADC: ${ldrReading} (${ldrReading < 300 ? 'NIGHT' : 'DAY'})`, ...prev.slice(0, 15)]);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning, distanceCm, lesson.id, servoAngle, potentiometerVal, ambientLight]);

  // Run / Upload Simulation Code Action
  const handleRunSimulation = () => {
    if (isRunning) {
      setIsRunning(false);
      setStatusMessage('تم إيقاف المحاكاة (SIMULATION STOPPED)');
      return;
    }

    setIsCompiling(true);
    setStatusMessage('جاري الفحص والتجميع... (Compiling sketch...)');
    setSerialLogs((prev) => ['Compiling sketch...', 'Uploading to Arduino Uno...', ...prev]);

    setTimeout(() => {
      setIsCompiling(false);
      setIsRunning(true);
      setStatusMessage('المحاكاة تعمل الآن بفاعلية (RUNNING)');
      setSerialLogs((prev) => ['Global Variables use 9% of dynamic memory.', 'Sketch uploaded successfully.', ...prev]);
    }, 1000);
  };

  // Audio tone generator for Buzzer lesson
  const playBuzzerTone = (freq: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio tone unavailable:', e);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto select-none">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & BRANDING */}
      {/* ======================================================== */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-black text-xl shadow-inner">
                ♾️
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>LEARN ARDUINO</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full font-extrabold">
                    أكاديمية الميكاترونكس
                  </span>
                </h1>
                <p className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                  EXPLORE • UNDERSTAND • BUILD
                </p>
              </div>
            </div>
          </div>

          {/* Category Selector & Clock Status */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-slate-300 flex items-center gap-2">
              <span>BASICS</span>
              <span className="bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-md font-black">
                {lesson.id} / {ARDUINO_LESSONS.length}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>OCT 20, 2026 • 15:20:18</span>
            </div>

            <div className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 border ${
              isRunning 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{statusMessage}</span>
            </div>
          </div>

        </div>

        {/* Lesson Information Tabs */}
        <div className="flex items-center gap-2 pt-5 border-t border-slate-800 mt-5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: Info },
            { id: 'pinout', label: 'PINOUT', icon: Zap },
            { id: 'example', label: 'EXAMPLE', icon: Code },
            { id: 'specs', label: 'SPECIFICATIONS', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                  isSel 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN 3D ISOMETRIC PLAYGROUND & CODE EDITOR GRID */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ISOMETRIC 3D CIRCUIT CANVAS (LG 7 COLS) */}
        <div className="lg:col-span-7 bg-amber-50/80 dark:bg-slate-900 rounded-3xl p-5 border-2 border-amber-200/80 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden min-h-[520px] flex flex-col justify-between">
          
          {/* Top Title Tag */}
          <div className="flex items-center justify-between text-xs border-b border-amber-200/80 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{lesson.icon}</span>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {lesson.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {lesson.englishTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-amber-200/60 dark:bg-slate-800 font-bold text-amber-900 dark:text-amber-200">
                Arduino Uno R3
              </span>
            </div>
          </div>

          {/* ISOMETRIC 3D CANVAS BOARD & BREADBOARD GRAPHIC */}
          <div className="relative my-4 flex-1 flex items-center justify-center min-h-[360px]">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-60 rounded-2xl pointer-events-none" />

            {/* ISOMETRIC SCENE CONTAINER */}
            <div className="relative w-full max-w-lg aspect-4/3 flex items-center justify-center transform transition-transform duration-300">
              
              {/* ARDUINO UNO BOARD SVG (Isometric 3D style) */}
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* SVG Isometric Board & Components Representation */}
                <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-2xl overflow-visible">
                  
                  {/* ARDUINO UNO BOARD BODY */}
                  <g id="arduino-uno-board">
                    {/* Shadow */}
                    <path d="M 120 220 L 320 120 L 480 200 L 280 300 Z" fill="rgba(15, 23, 42, 0.25)" />
                    {/* PCB Main Board (Blue) */}
                    <path d="M 120 200 L 320 100 L 470 175 L 270 275 Z" fill="#005b82" stroke="#003d58" strokeWidth="4" />
                    <path d="M 270 275 L 470 175 L 470 190 L 270 290 Z" fill="#003d58" />
                    <path d="M 120 200 L 270 275 L 270 290 L 120 215 Z" fill="#002b3f" />

                    {/* ATmega328P Chip */}
                    <path d="M 220 180 L 320 130 L 360 150 L 260 200 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                    <text x="270" y="170" fill="#94a3b8" fontSize="12" fontFamily="monospace" fontWeight="bold" transform="rotate(-25, 270, 170)">ATMEGA328P</text>

                    {/* USB-B Port (Silver Metallic) */}
                    <path d="M 130 180 L 170 160 L 190 170 L 150 190 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
                    <path d="M 150 190 L 190 170 L 190 185 L 150 205 Z" fill="#94a3b8" />
                    <text x="135" y="160" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="sans-serif">USB-B</text>

                    {/* DC Barrel Jack */}
                    <path d="M 110 210 L 140 195 L 160 205 L 130 220 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />

                    {/* Digital Headers (Pins 0-13) */}
                    <path d="M 330 110 L 450 170 L 445 175 L 325 115 Z" fill="#0f172a" />
                    <text x="370" y="130" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" transform="rotate(26, 370, 130)">DIGITAL PINS 0-13</text>

                    {/* Power / Analog Headers */}
                    <path d="M 190 230 L 280 275 L 275 280 L 185 235 Z" fill="#0f172a" />
                    <text x="210" y="270" fill="#facc15" fontSize="10" fontFamily="monospace" fontWeight="bold" transform="rotate(26, 210, 270)">POWER & ANALOG A0-A5</text>

                    {/* Reset Button */}
                    <circle cx="150" cy="140" r="10" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                  </g>

                  {/* BREADBOARD MODEL (White) */}
                  <g id="breadboard">
                    <path d="M 450 250 L 680 140 L 780 190 L 550 300 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
                    <path d="M 550 300 L 780 190 L 780 205 L 550 315 Z" fill="#cbd5e1" />
                    <path d="M 450 250 L 550 300 L 550 315 L 450 265 Z" fill="#94a3b8" />

                    {/* Breadboard Power Rails Lines */}
                    <path d="M 470 250 L 670 150" stroke="#ef4444" strokeWidth="3" opacity="0.8" />
                    <path d="M 480 255 L 680 155" stroke="#3b82f6" strokeWidth="3" opacity="0.8" />
                  </g>

                  {/* JUMPER WIRES (Red 5V & Black GND) */}
                  <g id="jumper-wires">
                    {/* Red 5V Wire */}
                    <path d="M 230 250 Q 350 320 480 260" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                    {/* Black GND Wire */}
                    <path d="M 240 255 Q 360 330 490 265" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                    {/* Signal Wire (Green / Yellow) */}
                    <path d="M 380 135 Q 480 180 580 220" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
                  </g>

                  {/* DYNAMIC LESSON SPECIFIC HARDWARE COMPONENT */}
                  
                  {/* Lesson 2: BLINK AN LED */}
                  {lesson.id === 2 && (
                    <g id="led-component" transform="translate(560, 200)">
                      <rect x="-10" y="-30" width="20" height="30" rx="10" fill={isBlinkingLed ? "#ef4444" : "#991b1b"} stroke="#dc2626" strokeWidth="2" />
                      {isBlinkingLed && <circle cx="0" cy="-15" r="25" fill="#fca5a5" opacity="0.5" className="animate-ping" />}
                      <text x="-20" y="20" fill="#0f172a" fontSize="12" fontWeight="bold">RED LED</text>
                    </g>
                  )}

                  {/* Lesson 3: PUSH BUTTON */}
                  {lesson.id === 3 && (
                    <g id="button-component" transform="translate(570, 210)">
                      <rect x="-20" y="-20" width="40" height="40" rx="6" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                      <circle cx="0" cy="0" r={buttonPressed ? "10" : "14"} fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
                      <text x="-35" y="35" fill="#0f172a" fontSize="12" fontWeight="bold">PUSH BUTTON</text>
                    </g>
                  )}

                  {/* Lesson 4: POTENTIOMETER KNOB */}
                  {lesson.id === 4 && (
                    <g id="potentiometer-component" transform="translate(570, 210)">
                      <circle cx="0" cy="0" r="25" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
                      <line x1="0" y1="0" x2={Math.cos((potentiometerVal / 1023) * Math.PI * 1.5 - 2) * 20} y2={Math.sin((potentiometerVal / 1023) * Math.PI * 1.5 - 2) * 20} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                      <text x="-40" y="45" fill="#0f172a" fontSize="12" fontWeight="bold">POTENTIOMETER</text>
                    </g>
                  )}

                  {/* Lesson 5: RGB LED */}
                  {lesson.id === 5 && (
                    <g id="rgb-led-component" transform="translate(570, 200)">
                      <circle cx="0" cy="0" r="20" fill={`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`} stroke="#475569" strokeWidth="3" />
                      <circle cx="0" cy="0" r="30" fill={`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`} opacity="0.4" className="animate-pulse" />
                      <text x="-25" y="40" fill="#0f172a" fontSize="12" fontWeight="bold">RGB LED</text>
                    </g>
                  )}

                  {/* Lesson 6: LDR LIGHT SENSOR */}
                  {lesson.id === 6 && (
                    <g id="ldr-component" transform="translate(570, 210)">
                      <ellipse cx="0" cy="0" rx="20" ry="12" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                      <path d="M -12 0 Q 0 -8 12 0" fill="none" stroke="#ef4444" strokeWidth="3" />
                      <text x="-30" y="35" fill="#0f172a" fontSize="12" fontWeight="bold">LDR SENSOR</text>
                    </g>
                  )}

                  {/* Lesson 7 & 11: ULTRASONIC SENSOR HC-SR04 WITH DRAGGABLE OBSTACLE */}
                  {(lesson.id === 7 || lesson.id === 11) && (
                    <g id="ultrasonic-component">
                      {/* HC-SR04 Sensor Board */}
                      <g transform="translate(550, 180)">
                        <rect x="-35" y="-20" width="70" height="40" rx="6" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                        <circle cx="-18" cy="0" r="14" fill="#334155" stroke="#cbd5e1" strokeWidth="3" />
                        <circle cx="18" cy="0" r="14" fill="#334155" stroke="#cbd5e1" strokeWidth="3" />
                        <text x="-28" y="32" fill="#0f172a" fontSize="11" fontWeight="bold">HC-SR04</text>
                      </g>

                      {/* Distance Wave Rings */}
                      <path d={`M 590 180 Q ${590 + distanceCm * 2} 180 ${590 + distanceCm * 2} 220`} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />

                      {/* OBSTACLE GRAPHIC (Wall, Car, Box, Ball) */}
                      <g transform={`translate(${590 + distanceCm * 2.2}, 210)`} className="cursor-grab active:cursor-grabbing transition-transform">
                        {selectedObstacle === 'wall' && (
                          <g id="obstacle-wall">
                            <rect x="-15" y="-50" width="30" height="80" rx="4" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="3" />
                            <line x1="-15" y1="-30" x2="15" y2="-30" stroke="#fca5a5" strokeWidth="2" />
                            <line x1="-15" y1="-10" x2="15" y2="-10" stroke="#fca5a5" strokeWidth="2" />
                            <line x1="-15" y1="10" x2="15" y2="10" stroke="#fca5a5" strokeWidth="2" />
                            <text x="-28" y="-60" fill="#991b1b" fontSize="12" fontWeight="black">BRICK WALL</text>
                          </g>
                        )}

                        {selectedObstacle === 'car' && (
                          <g id="obstacle-car">
                            <rect x="-25" y="-20" width="50" height="30" rx="8" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                            <rect x="-15" y="-35" width="30" height="18" rx="4" fill="#38bdf8" />
                            <circle cx="-15" cy="12" r="8" fill="#0f172a" />
                            <circle cx="15" cy="12" r="8" fill="#0f172a" />
                            <text x="-22" y="-42" fill="#dc2626" fontSize="12" fontWeight="black">TOY CAR</text>
                          </g>
                        )}

                        {selectedObstacle === 'box' && (
                          <g id="obstacle-box">
                            <rect x="-20" y="-30" width="40" height="50" rx="4" fill="#d97706" stroke="#92400e" strokeWidth="3" />
                            <line x1="-20" y1="-30" x2="20" y2="20" stroke="#b45309" strokeWidth="2" />
                            <text x="-15" y="-38" fill="#b45309" fontSize="12" fontWeight="black">BOX</text>
                          </g>
                        )}

                        {selectedObstacle === 'ball' && (
                          <g id="obstacle-ball">
                            <circle cx="0" cy="0" r="22" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
                            <path d="M -15 -10 Q 0 10 15 -10" fill="none" stroke="#facc15" strokeWidth="4" />
                            <text x="-28" y="-30" fill="#1d4ed8" fontSize="12" fontWeight="black">BEACH BALL</text>
                          </g>
                        )}

                        {/* Floating Distance Measurement Tag Badge */}
                        <g transform="translate(0, -75)">
                          <rect x="-30" y="-12" width="60" height="24" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                          <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="12" fontFamily="monospace" fontWeight="bold">
                            {distanceCm} cm
                          </text>
                        </g>
                      </g>
                    </g>
                  )}

                  {/* Lesson 8: BUZZER */}
                  {lesson.id === 8 && (
                    <g id="buzzer-component" transform="translate(570, 210)">
                      <circle cx="0" cy="0" r="25" fill="#0f172a" stroke="#334155" strokeWidth="3" />
                      <circle cx="0" cy="0" r="10" fill="#334155" />
                      <text x="-25" y="42" fill="#0f172a" fontSize="12" fontWeight="bold">BUZZER</text>
                    </g>
                  )}

                  {/* Lesson 9: DC MOTOR & PROPELLER FAN */}
                  {lesson.id === 9 && (
                    <g id="dc-motor-component" transform="translate(570, 210)">
                      <rect x="-25" y="-20" width="50" height="40" rx="8" fill="#64748b" stroke="#334155" strokeWidth="3" />
                      {/* Propeller blade spinning */}
                      <g className={isRunning ? "animate-spin origin-center" : ""}>
                        <ellipse cx="0" cy="0" rx="35" ry="8" fill="#f97316" opacity="0.9" />
                        <ellipse cx="0" cy="0" rx="8" ry="35" fill="#f97316" opacity="0.9" />
                      </g>
                      <text x="-30" y="45" fill="#0f172a" fontSize="12" fontWeight="bold">DC MOTOR</text>
                    </g>
                  )}

                  {/* Lesson 10: SERVO MOTOR */}
                  {lesson.id === 10 && (
                    <g id="servo-component" transform="translate(570, 210)">
                      <rect x="-20" y="-25" width="40" height="50" rx="6" fill="#1d4ed8" stroke="#1e40af" strokeWidth="3" />
                      {/* Sweeping Arm */}
                      <g style={{ transform: `rotate(${servoAngle - 90}deg)`, transformOrigin: '0px -10px' }} className="transition-transform duration-200">
                        <rect x="-5" y="-45" width="10" height="40" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                        <circle cx="0" cy="-40" r="4" fill="#ef4444" />
                      </g>
                      <text x="-35" y="45" fill="#0f172a" fontSize="12" fontWeight="bold">SG90 SERVO ({servoAngle}°)</text>
                    </g>
                  )}

                  {/* Lesson 11: TRAFFIC LIGHTS */}
                  {lesson.id === 11 && (
                    <g id="traffic-light-component" transform="translate(710, 160)">
                      <rect x="-12" y="-35" width="24" height="70" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                      <circle cx="0" cy="-22" r="8" fill={distanceCm <= 20 ? "#ef4444" : "#450a0a"} />
                      <circle cx="0" cy="0" r="8" fill={distanceCm > 20 && distanceCm <= 50 ? "#eab308" : "#713f12"} />
                      <circle cx="0" cy="22" r="8" fill={distanceCm > 50 ? "#22c55e" : "#052e16"} />
                    </g>
                  )}

                </svg>

              </div>
            </div>

          </div>

          {/* INTERACTIVE CONTROLS BAR BELOW CANVAS */}
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-4 border border-amber-200/80 dark:border-slate-700 space-y-3">
            
            {/* Ultrasonic Distance Slider (Lessons 7 & 11) */}
            {(lesson.id === 7 || lesson.id === 11) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-600" />
                    <span>تحريك العائق وحساب المسافة الحية (Distance Slider):</span>
                  </span>
                  <span className="font-mono text-cyan-600 font-bold bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-300">
                    {distanceCm} cm
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="2"
                    max="100"
                    value={distanceCm}
                    onChange={(e) => setDistanceCm(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                {/* Obstacle Type Switcher Buttons */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-[11px] text-slate-500 font-bold">نوع العائق:</span>
                  {[
                    { id: 'wall', label: 'حائط طوب 🧱' },
                    { id: 'car', label: 'سيارة 🚗' },
                    { id: 'box', label: 'صندوق 📦' },
                    { id: 'ball', label: 'كرة شاطئ ⚽' },
                  ].map((obs) => (
                    <button
                      key={obs.id}
                      onClick={() => setSelectedObstacle(obs.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        selectedObstacle === obs.id
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {obs.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Push Button Interactive Control (Lesson 3) */}
            {lesson.id === 3 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  اضغط الزر التفاعلي لتشغيل القراءة المباشرة (digitalRead):
                </span>
                <button
                  onMouseDown={() => setButtonPressed(true)}
                  onMouseUp={() => setButtonPressed(false)}
                  onTouchStart={() => setButtonPressed(true)}
                  onTouchEnd={() => setButtonPressed(false)}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs transition active:scale-95 cursor-pointer ${
                    buttonPressed 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  🔘 {buttonPressed ? 'الزر مضغوط! (HIGH = 5V)' : 'اضغط واحتفظ بالضغط (LOW = 0V)'}
                </button>
              </div>
            )}

            {/* Potentiometer Knob Interactive Control (Lesson 4) */}
            {lesson.id === 4 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>أدر مقبض المقاومة المتغيرة (Potentiometer):</span>
                  <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    ADC Value: {potentiometerVal}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1023"
                  value={potentiometerVal}
                  onChange={(e) => setPotentiometerVal(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            )}

            {/* Buzzer Tone Control (Lesson 8) */}
            {lesson.id === 8 && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  اختبر النغمات الصوتية الحية (Web Audio):
                </span>
                <div className="flex items-center gap-1.5">
                  {[261, 329, 392, 440, 523, 880].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setBuzzerFrequency(f);
                        playBuzzerTone(f);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black cursor-pointer shadow-xs"
                    >
                      {f}Hz 🔔
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: CODE EDITOR & LIVE SERIAL MONITOR ("TRY IT YOURSELF") (LG 5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CODE EDITOR BOX */}
          <div className="bg-slate-950 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3 font-mono">
            
            {/* Editor Header & Actions */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>TRY IT YOURSELF (Arduino C++)</span>
              </div>

              {/* Run / Upload Action Button */}
              <button
                onClick={handleRunSimulation}
                disabled={isCompiling}
                className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                  isRunning 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                {isCompiling ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling...</span>
                  </>
                ) : isRunning ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run & Upload</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Textarea with line numbers background */}
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                rows={12}
                spellCheck={false}
                className="w-full p-4 font-mono bg-transparent text-emerald-400 focus:outline-hidden leading-relaxed resize-none selection:bg-slate-700"
              />
            </div>
          </div>

          {/* SERIAL MONITOR TERMINAL */}
          <div className="bg-slate-950 rounded-3xl p-4 border border-slate-800 shadow-xl space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2 text-slate-400">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-200">SERIAL MONITOR (9600 Baud)</span>
              </div>
              <button
                onClick={() => setSerialLogs(['Serial Monitor Cleared.'])}
                className="text-[10px] text-slate-500 hover:text-slate-300 underline"
              >
                Clear Logs
              </button>
            </div>

            {/* Terminal Output Stream */}
            <div className="h-32 overflow-y-auto space-y-1 text-[11px] text-slate-300 p-2 rounded-xl bg-slate-900/90 font-mono">
              {serialLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-cyan-500 font-bold">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. LESSON CAROUSEL NAVIGATION BAR */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-600" />
            <span>اختر الدرس والقصة التفاعلية (LESSONS):</span>
          </span>
          <span className="text-slate-500">11 درساً تفاعلياً شاملاً</span>
        </div>

        {/* Horizontal Lesson Cards Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 text-xs">
          {ARDUINO_LESSONS.map((item, idx) => {
            const isSel = idx === currentLessonIndex;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentLessonIndex(idx)}
                className={`shrink-0 p-3.5 rounded-2xl border text-right transition cursor-pointer flex items-center gap-3 min-w-[200px] ${
                  isSel 
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg scale-102 font-black' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className={`text-[10px] font-mono block uppercase ${isSel ? 'text-slate-900 font-black' : 'text-cyan-600'}`}>
                    {item.englishTitle}
                  </span>
                  <h4 className="text-xs font-extrabold truncate">
                    {item.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

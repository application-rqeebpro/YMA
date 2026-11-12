export interface VideoTimestamp {
  time: string;
  seconds: number;
  title: string;
  note: string;
}

export interface ExplanationVideo {
  id: string;
  title: string;
  englishTitle: string;
  subjectId: 'physics' | 'circuits' | 'math' | 'programming' | 'mechatronics' | 'drawing';
  subjectName: string;
  youtubeId: string;
  duration: string;
  instructor: string;
  universityOrChannel: string;
  referenceBook?: string;
  chapterNumber?: number;
  description: string;
  keyTimestamps: VideoTimestamp[];
  keyTakeaways: string[];
  formulasCovered: { formula: string; name: string; meaning: string }[];
  isFreePreview: boolean;
  tags: string[];
  thumbnailUrl?: string;
}

export const EXPLANATION_VIDEOS: ExplanationVideo[] = [
  {
    id: 'vid-serway-vectors',
    title: 'المتجهات والكميات الفيزيائية وتحليل القوى (Vectors & Components)',
    englishTitle: 'Vectors & Coordinate Systems — Serway Ch. 3',
    subjectId: 'physics',
    subjectName: 'الفيزياء الهندسية 1',
    youtubeId: 'b7Jzb8x7D_Q',
    duration: '22:40',
    instructor: 'د. حازم فلاح سكيك',
    universityOrChannel: 'فيزياء سيرواي الجامعية (جامعة الأزهر)',
    referenceBook: 'Physics for Scientists and Engineers — Serway (Chapter 3)',
    chapterNumber: 3,
    description: 'شرح أكاديمي دقيق ومبسط لمفهوم المتجهات، جمع وطرح المتجهات بيانيًا وحسابيًا، تحليل المتجه إلى مركبتين متعامدتين Ax و Ay، وضرب المتجهات القياسي والاتجاهي مع أمثلة تطبيقية.',
    keyTimestamps: [
      { time: '00:00', seconds: 0, title: 'المقدمة والفرق بين الكمية القياسية والمتجهة', note: 'الكتلة والزمن مقابل السرعة المتجهة والقوة' },
      { time: '04:15', seconds: 255, title: 'نظام الإحداثيات الكارتيزي والقطبي', note: 'التحويل بين (x, y) و (r, θ)' },
      { time: '09:30', seconds: 570, title: 'تحليل المتجهات إلى المركبات السينية والصادية', note: 'Ax = A cos(θ) و Ay = A sin(θ)' },
      { time: '14:20', seconds: 860, title: 'متجهات الوحدة Unit Vectors (i, j, k)', note: 'كتابة المتجه بالصورة القياسية' },
      { time: '18:50', seconds: 1130, title: 'مثال هندسي محلول: محصلة قوى على مفصل ميكاترونكس', note: 'حساب المقدار R والاتجاه θ' }
    ],
    keyTakeaways: [
      'الكميات المتجهة تحتاج مقدارًا واتجاهًا ونقطة تأثير، بينما القياسية يكفيها المقدار والوحدة.',
      'أي متجه يمكن تحليله إلى مركبتين متعامدتين باستخدام جيب وجيب تمام الزاوية مع محور السينات.',
      'محصلة عدة قوى تحسب بجمع المركبات السينية معًا والمركبات الصادية معًا: Rx = ΣFx و Ry = ΣFy.',
      'مقدار المحصلة: R = √(Rx² + Ry²)، والاتجاه: θ = tan⁻¹(Ry / Rx).'
    ],
    formulasCovered: [
      { formula: 'A_x = A \\cos\\theta', name: 'المركبة السينية للمتجه', meaning: 'إسقاط المتجه على محور x' },
      { formula: 'A_y = A \\sin\\theta', name: 'المركبة الصادية للمتجه', meaning: 'إسقاط المتجه على محور y' },
      { formula: '|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}', name: 'مقدار محصلة المتجهات', meaning: 'قانون فيثاغورس للمحصلة' },
      { formula: '\\vec{A} \\cdot \\vec{B} = |A||B|\\cos\\theta', name: 'الضرب القياسي (Dot Product)', meaning: 'حساب الشغل وتعامد المتجهات' }
    ],
    isFreePreview: true,
    tags: ['متجهات', 'سيرواي', 'Serway', 'فيزياء 1', 'قوى', 'مركبات'],
    thumbnailUrl: 'https://img.youtube.com/vi/b7Jzb8x7D_Q/hqdefault.jpg'
  },
  {
    id: 'vid-serway-dimensions',
    title: 'الوحدات والقياسات وتحليل الأبعاد في الهندسة (Dimensions & Units)',
    englishTitle: 'Physics and Measurement — Serway Ch. 1',
    subjectId: 'physics',
    subjectName: 'الفيزياء الهندسية 1',
    youtubeId: 'J4Lg6p2dEoc',
    duration: '18:15',
    instructor: 'د. حازم فلاح سكيك',
    universityOrChannel: 'الفيزياء العامة للمهندسين',
    referenceBook: 'Physics for Scientists and Engineers — Serway (Chapter 1)',
    chapterNumber: 1,
    description: 'تحليل الأبعاد الأساسية الثلاثة [M], [L], [T]، وكيفية التحقق من صحة القوانين الفيزيائية واشتقاق المعادلات عبر مبدأ تجانس الأبعاد.',
    keyTimestamps: [
      { time: '00:00', seconds: 0, title: 'النظام الدولي للوحدات (SI Units)', note: 'الكيلوجرام، المتر، الثانية، والأمبير' },
      { time: '05:00', seconds: 300, title: 'الأبعاد الأساسية الثلاثة [M], [L], [T]', note: 'كيف نكتب معادلة الأبعاد للسرعة والتسارع والقوة' },
      { time: '10:30', seconds: 630, title: 'قاعدة تجانس الأبعاد (Dimensional Homogeneity)', note: 'الطرف الأيسر يجب أن يطابق أبعاد الطرف الأيمن' },
      { time: '14:45', seconds: 885, title: 'اختبار صحة قانون طاقة الحركة والبندول', note: 'تطبيق عملي مع خطوات التحقق' }
    ],
    keyTakeaways: [
      'الأبعاد تعبر عن الطبيعة الفيزيائية للكمية بغض النظر عن وحدة القياس المستخدمة.',
      'لا يمكن جمع أو طرح إلا كميات لها نفس الأبعاد الفيزيائية تمامًا.',
      'تحليل الأبعاد أداة قوية للمهندس لاكتشاف أخطاء الحسابات قبل البدء في التنفيذ.'
    ],
    formulasCovered: [
      { formula: '[v] = L \\cdot T^{-1}', name: 'أبعاد السرعة', meaning: 'طول مقسومًا على الزمن' },
      { formula: '[a] = L \\cdot T^{-2}', name: 'أبعاد التسارع', meaning: 'متر لكل ثانية مربعة' },
      { formula: '[F] = M \\cdot L \\cdot T^{-2}', name: 'أبعاد القوة (نيوتن)', meaning: 'كتلة في تسارع' }
    ],
    isFreePreview: true,
    tags: ['أبعاد', 'وحدات', 'سيرواي', 'SI', 'Serway', 'قياسات'],
    thumbnailUrl: 'https://img.youtube.com/vi/J4Lg6p2dEoc/hqdefault.jpg'
  },
  {
    id: 'vid-serway-newton',
    title: 'قوانين نيوتن في الحركة والاتزان الميكانيكي (The Laws of Motion)',
    englishTitle: 'The Laws of Motion — Serway Ch. 5',
    subjectId: 'physics',
    subjectName: 'الفيزياء الهندسية 1',
    youtubeId: 'kKKM8Y-u7ds',
    duration: '25:10',
    instructor: 'Crash Course Engineering & Walter Lewin MIT',
    universityOrChannel: 'MIT OpenCourseWare / Crash Course',
    referenceBook: 'Physics for Scientists and Engineers — Serway (Chapter 5)',
    chapterNumber: 5,
    description: 'القانون الأول (القصور الذاتي)، القانون الثاني (F = ma)، القانون الثالث (الفعل ورد الفعل)، ومخطط الجسم الحر (Free Body Diagram) لتحليل آليات الروبوتات والسيارات.',
    keyTimestamps: [
      { time: '00:00', seconds: 0, title: 'القانون الأول لنيوتن والقصور الذاتي', note: 'حالة السكون والحركة المنتظمة' },
      { time: '06:15', seconds: 375, title: 'القانون الثاني: العلاقة بين القوة والتسارع', note: 'ΣF = m·a في المستوى المائل والسطح الأفقي' },
      { time: '12:40', seconds: 760, title: 'مخطط الجسم الحر (Free Body Diagram)', note: 'كيف ترسم قوى الاحتكاك والوزن ورد الفعل العمودي' },
      { time: '19:20', seconds: 1160, title: 'القانون الثالث وتطبيقاته في المحركات والدفع', note: 'لكل فعل رد فعل مساوٍ له في المقدار ومعاكس في الاتجاه' }
    ],
    keyTakeaways: [
      'التسارع يتناسب طرديًا مع محصلة القوى المؤثرة وعكسيًا مع كتلة الجسم.',
      'مخطط الجسم الحر هو الخطوة الإلزامية الأولى لحل أي مسألة ميكانيكية أو اتزان روبوت.',
      'قوة الاحتكاك السكوني تعارض بدء الحركة وتصل لحدها الأقصى fs = μs · N.'
    ],
    formulasCovered: [
      { formula: '\\sum \\vec{F} = m \\cdot \\vec{a}', name: 'قانون نيوتن الثاني', meaning: 'محصلة القوى تساوي حاصل ضرب الكتلة في التسارع' },
      { formula: 'f_k = \\mu_k \\cdot N', name: 'قوة الاحتكاك الحركي', meaning: 'معامل الاحتكاك في رد الفعل العمودي' },
      { formula: 'W = m \\cdot g', name: 'الوزن الجاذبي', meaning: 'كتلة الجسم في تسارع الجاذبية الأرضية (9.8 m/s²)' }
    ],
    isFreePreview: true,
    tags: ['نيوتن', 'قوانين الحركة', 'سيرواي', 'Serway', 'مخطط الجسم الحر', 'ميكانيكا'],
    thumbnailUrl: 'https://img.youtube.com/vi/kKKM8Y-u7ds/hqdefault.jpg'
  },
  {
    id: 'vid-serway-energy',
    title: 'الشغل والطاقة ومبدأ حفظ الطاقة الميكانيكية (Work & Kinetic Energy)',
    englishTitle: 'Energy of a System & Conservation — Serway Ch. 7 & 8',
    subjectId: 'physics',
    subjectName: 'الفيزياء الهندسية 1',
    youtubeId: '2WS1GQWJDUU',
    duration: '20:30',
    instructor: 'The Organic Chemistry Tutor (Physics 1)',
    universityOrChannel: 'General Physics Series',
    referenceBook: 'Physics for Scientists and Engineers — Serway (Chapters 7 & 8)',
    chapterNumber: 7,
    description: 'تعريف الشغل الفيزيائي W = F·d·cos(θ)، طاقة الحركة الانتقالية، طاقة الوضع الثقالية والمرونية (الزنبرك)، ومبدأ حفظ الطاقة الكلية في الأنظمة الهندسية.',
    keyTimestamps: [
      { time: '00:00', seconds: 0, title: 'تعريف الشغل والشروط اللازمة لبذله', note: 'وجود قوة وإزاحة وزاوية غير متعامدة' },
      { time: '05:30', seconds: 330, title: 'مبرهنة الشغل والطاقة الحركية (Work-Energy Theorem)', note: 'W_net = ΔK = ½mv₂² - ½mv₁²' },
      { time: '11:00', seconds: 660, title: 'طاقة الوضع المرونية في الزنبرك (قانون هوك)', note: 'U_s = ½kx²' },
      { time: '16:00', seconds: 960, title: 'قانون حفظ الطاقة الميكانيكية والقدرة (Power)', note: 'القدرة P = W/t وتقاس بالواط Watt' }
    ],
    keyTakeaways: [
      'القوة العمودية على اتجاه الإزاحة لا تبذل أي شغل ميكانيكي (W = 0).',
      'في غياب قوى الاحتكاك ومقاومة الهواء، تكون الطاقة الميكانيكية الكلية محفوظة: E = K + U = ثابت.',
      'القدرة هي المعدل الزمني لبذل الشغل، وهي المعيار الأهم لاختيار محركات الميكاترونكس.'
    ],
    formulasCovered: [
      { formula: 'W = F \\cdot d \\cdot \\cos\\theta', name: 'معادلة الشغل الميكانيكي', meaning: 'القوة في الإزاحة في جيب تمام الزاوية' },
      { formula: 'K = \\frac{1}{2} m v^2', name: 'طاقة الحركة', meaning: 'نصف الكتلة في مربع السرعة' },
      { formula: 'P = \\frac{W}{\\Delta t} = \\vec{F} \\cdot \\vec{v}', name: 'القدرة الميكانيكية', meaning: 'معدل بذل الشغل بالواط' }
    ],
    isFreePreview: true,
    tags: ['طاقة', 'شغل', 'سيرواي', 'Serway', 'قدرة', 'محركات'],
    thumbnailUrl: 'https://img.youtube.com/vi/2WS1GQWJDUU/hqdefault.jpg'
  },
  {
    id: 'vid-circuits-ohm',
    title: 'أساسيات الدوائر: الجهد والتيار والمقاومة وقانون أوم (Ohm\'s Law Explained)',
    englishTitle: 'Electric Circuits 1 — Voltage, Current & Ohm\'s Law',
    subjectId: 'circuits',
    subjectName: 'الدوائر الكهربائية 1',
    youtubeId: '8jB6hDUqN-g',
    duration: '21:05',
    instructor: 'The Engineering Mindset',
    universityOrChannel: 'Electrical & Mechatronics Engineering Series',
    referenceBook: 'Fundamentals of Electric Circuits — Alexander & Sadiku',
    chapterNumber: 2,
    description: 'شرح تصويري ممتع وملموس لتدفق الإلكترونات وفرق الجهد الكهربائي ومقاومة المواد، مع قانون أوم V = IR وتطبيقات مجزئ الجهد واختيار مقاومات الحماية للمتحكمات.',
    keyTimestamps: [
      { time: '00:00', seconds: 0, title: 'ما هو الجهد والتيار والمقاومة؟ تشبيه الماء الشهير', note: 'ضغط الماء، معدل التدفق، ومضيق الأنبوب' },
      { time: '06:00', seconds: 360, title: 'قانون أوم الرياضي والعلاقة الخطية بين V و I', note: 'ميل المنحنى يمثل قيمة المقاومة R' },
      { time: '11:45', seconds: 705, title: 'حساب القدرة الكهربائية المبددة في المقاومة (P = I²R)', note: 'تجنب احتراق المقاومات واختيار الواط المناسب' },
      { time: '16:30', seconds: 990, title: 'توصيل المقاومات لحماية دايود الـ LED مع Arduino', note: 'حساب مقاومة الحماية 220 أوم' }
    ],
    keyTakeaways: [
      'الجهد (الفولت) هو الطاقة لكل وحدة شحنة لدفع الإلكترونات عبر المسار.',
      'التيار (الأمبير) هو كمية الشحنة المارة عبر مقطع الموصل في الثانية الواحدة.',
      'القدرة الضائعة كحرارة في المقاومة تحسب من P = V·I أو P = I²·R، ويجب ألا تتجاوز تقنين المقاومة (0.25W).'
    ],
    formulasCovered: [
      { formula: 'V = I \\cdot R', name: 'قانون أوم الأساسي', meaning: 'الجهد يساوي حاصل ضرب التيار في المقاومة' },
      { formula: 'P = V \\cdot I = I^2 \\cdot R = \\frac{V^2}{R}', name: 'القدرة الكهربائية', meaning: 'معدل استهلاك أو توليد الطاقة بالواط' },
      { formula: 'R = \\rho \\frac{L}{A}', name: 'مقاومة الموصل الطبيعية', meaning: 'تعتمد على نوع المادة وطوله ومساحة مقطعه' }
    ],
    isFreePreview: true,
    tags: ['دوائر', 'أوم', 'فولت', 'أمبير', 'مقاومات', 'كهرباء'],
    thumbnailUrl: 'https://img.youtube.com/vi/8jB6hDUqN-g/hqdefault.jpg'
  },
  {
    id: 'vid-circuits-kcl-kvl',
    title: 'قوانين كيرشوف للتيار والجهد وتحليل العقد والحلقات (KCL & KVL)',
    englishTitle: 'Kirchhoff\'s Current & Voltage Laws',
    subjectId: 'circuits',
    subjectName: 'الدوائر الكهربائية 1',
    youtubeId: 'Z34R1h4_fbc',
    duration: '26:40',
    instructor: 'The Organic Chemistry Tutor (Circuits)',
    universityOrChannel: 'Circuit Analysis Course',
    referenceBook: 'Fundamentals of Electric Circuits — Alexander & Sadiku',
    chapterNumber: 3,
    description: 'قانون كيرشوف الأول (حفظ الشحنة عند العقد KCL)، وقانون كيرشوف الثاني (حفظ الطاقة حول المسار المغلق KVL)، مع حل مسائل متعددة الحلقات والمصادر خطوة بخطوة.',
    keyTimestamps: [
      { time: '00:00', seconds: 0, title: 'مفهوم العقدة (Node) والفرع (Branch) والحلقة (Loop)', note: 'التعريفات الطوبولوجية الأساسية للشبكة' },
      { time: '04:40', seconds: 280, title: 'قانون كيرشوف للتيار KCL: مجموع التيارات الداخلة = الخارجة', note: 'تطبيق مباشر عند نقطة تفرع' },
      { time: '11:10', seconds: 670, title: 'قانون كيرشوف للجهد KVL: مجموع فروق الجهد في حلقة مغلقة = صفر', note: 'قواعد الإشارات عند صعود وهبوط الجهد' },
      { time: '18:00', seconds: 1080, title: 'حل مسألة نموذجية ثنائية الحلقات بنظام المعادلات', note: 'كتابة المعادلات الخطية وحلها' }
    ],
    keyTakeaways: [
      'قانون KCL ناتج عن مبدأ حفظ الشحنة الكهربائية: الشحنة لا تتراكم داخل أي عقدة توصيل.',
      'قانون KVL ناتج عن مبدأ حفظ الطاقة: الشغل المبذول لنقل شحنة في مسار مغلق يساوي صفرًا.',
      'تحديد قطبية المقاومات يعتمد على اتجاه افتراض التيار (التيار يدخل من القطب الموجب ويخرج من السالب).'
    ],
    formulasCovered: [
      { formula: '\\sum I_{in} = \\sum I_{out}', name: 'قانون كيرشوف للتيار KCL', meaning: 'مجموع التيارات الداخلة للعقدة يساوي الخارجة منها' },
      { formula: '\\sum \\Delta V_{loop} = 0', name: 'قانون كيرشوف للجهد KVL', meaning: 'المجموع الجبري لفروق الجهد في أي مسار مغلق يساوي صفر' }
    ],
    isFreePreview: true,
    tags: ['كيرشوف', 'KCL', 'KVL', 'عقد', 'حلقات', 'دوائر'],
    thumbnailUrl: 'https://img.youtube.com/vi/Z34R1h4_fbc/hqdefault.jpg'
  },
  {
    id: 'vid-cpp-embedded',
    title: 'برمجة المتحكمات بلغة C++ للميكاترونكس والأردوينو (Embedded C++)',
    englishTitle: 'C++ & Arduino Programming for Mechatronics Engineers',
    subjectId: 'programming',
    subjectName: 'برمجة الحاسوب C/C++',
    youtubeId: 'z3_zM97R-jI',
    duration: '28:15',
    instructor: 'Programming Electronics Academy',
    universityOrChannel: 'Embedded Systems & Robotics',
    referenceBook: 'Programming Arduino: Getting Started with Sketches',
    chapterNumber: 1,
    description: 'أساسيات بنية الكود setup() و loop()، التعامل مع المتغيرات والمؤشرات (Pointers)، المنافذ الرقمية والتناظرية، ودوال التحكم في إشارات PWM لتعديل سرعة المحركات.',
    keyTimestamps: [
      { time: '00:00', seconds: 0, title: 'دورة عمل المتحكم وهيكل برنامج C++', note: 'تنفيذ void setup() مرة واحدة ثم void loop() باستمرار' },
      { time: '05:30', seconds: 330, title: 'المتغيرات وأنواع البيانات وإدارة الذاكرة (int, float, byte)', note: 'اختيار الحجم المناسب لمتحكم ذي ذاكرة 2KB' },
      { time: '12:00', seconds: 720, title: 'دوال الإدخال والإخراج الرقمي pinMode, digitalWrite, digitalRead', note: 'تشغيل وقراءة الحساسات الثنائية' },
      { time: '19:40', seconds: 1180, title: 'توليد نبضات تعديل عرض النبضة analogWrite (PWM)', note: 'التحكم في سرعة محركات DC وزوايا السيرفو' }
    ],
    keyTakeaways: [
      'في الأنظمة المدمجة، يجب تجنب المتغيرات الكبيرة والذاكرة الديناميكية لمنع انهيار المتحكم.',
      'إشارة PWM تغير نسبة التشغيل (Duty Cycle) من 0 إلى 255 لمحاكاة جهد تماثلي من 0 إلى 5 فولت.',
      'استخدامmillis() بدلاً من delay() يمنع تجميد المعالج ويتيح أداء مهام متعددة في نفس الوقت.'
    ],
    formulasCovered: [
      { formula: 'Duty\\ Cycle\\ (\\%) = \\frac{T_{on}}{T_{period}} \\times 100\\%', name: 'معادلة دورة تشغيل PWM', meaning: 'نسبة وقت التوصيل للزمن الكلي' },
      { formula: 'V_{out} = \\frac{PWM\\ Value}{255} \\times 5V', name: 'الجهد المتوسط التماثلي', meaning: 'حساب الجهد الفعلي لمنافذ PWM' }
    ],
    isFreePreview: true,
    tags: ['C++', 'Arduino', 'برمجة', 'متحكمات', 'PWM', 'روبوتات'],
    thumbnailUrl: 'https://img.youtube.com/vi/z3_zM97R-jI/hqdefault.jpg'
  },
  {
    id: 'vid-mechatronics-sensors',
    title: 'المستشعرات والمشغلات في هندسة الميكاترونكس (Sensors & Actuators)',
    englishTitle: 'Introduction to Mechatronics Sensors & Actuators',
    subjectId: 'mechatronics',
    subjectName: 'مقدمة الميكاترونكس',
    youtubeId: 'q_3Xp8X2zS0',
    duration: '23:50',
    instructor: 'Engineering Explained & University Lectures',
    universityOrChannel: 'Mechatronics Systems Engineering',
    referenceBook: 'Mechatronics: Electronic Control Systems in Mechanical and Electrical Engineering — Bolton',
    chapterNumber: 2,
    description: 'كيف يرى الروبوت العالم ويتحرك فيه: مبدأ عمل حساسات المسافة بالموجات فوق الصوتية، حساسات الحرارة، المشفرات الدوارة (Encoders)، ومقارنة بين محركات DC و Servo و Stepper.',
    keyTimestamps: [
      { time: '00:00', seconds: 0, title: 'المخطط العام لمنظومة الميكاترونكس المغلقة (Closed-Loop)', note: 'حساس ← معالج ← مشغل ← حركة ميكانيكية' },
      { time: '06:10', seconds: 370, title: 'حساس الموجات فوق الصوتية HC-SR04 ومعادلة حساب المسافة', note: 'المسافة = (زمن الرحلة × سرعة الصوت) / 2' },
      { time: '13:00', seconds: 780, title: 'المشفرات البصرية Encoders وقياس سرعة وموقع الدوران', note: 'التغذية الراجعة لموتور الروبوت' },
      { time: '18:30', seconds: 1110, title: 'مقارنة شاملة بين محركات DC و Stepper و Servo', note: 'عزم الدوران، السرعة، والدقة الزاوية' }
    ],
    keyTakeaways: [
      'المستشعر يحول كمية فيزيائية (مسافة، ضوء، حرارة) إلى إشارة كهربائية يفهمها المعالج.',
      'المشغل (Actuator) يحول الطاقة الكهربائية إلى طاقة ميكانيكية كالحركة الدورانية أو الخطية.',
      'محرك السيرفو مجهز بحساس زاوية داخلي لضمان الوصول للزاوية المحددة بدقة متناهية.'
    ],
    formulasCovered: [
      { formula: 'Distance = \\frac{Time \\times 340\\ m/s}{2}', name: 'حساب المسافة بحساس الصدى', meaning: 'سرعة الصوت في الهواء مقسومة على 2 ذهابًا وإيابًا' },
      { formula: '\\tau = F \\times r \\times \\sin\\theta', name: 'عزم الدوران (Torque)', meaning: 'قدرة المحرك على إدارة الحمل الميكانيكي' }
    ],
    isFreePreview: true,
    tags: ['حساسات', 'مشغلات', 'ميكاترونكس', 'سيرفو', 'محركات', 'Sensors'],
    thumbnailUrl: 'https://img.youtube.com/vi/q_3Xp8X2zS0/hqdefault.jpg'
  }
];

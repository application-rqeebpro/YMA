export interface SpecialistDoctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  englishSpecialty: string;
  avatarStyle: 'male_professor' | 'female_engineer' | 'young_innovator' | 'senior_sage' | 'modern_tech';
  coatColor: string;
  hairColor: string;
  accentColor: string;
  bio: string;
  university: string;
  suggestedTopics: string[];
  boardTheme: 'chalkboard_green' | 'blackboard_dark' | 'whiteboard_academic' | 'blueprint_cyan';
  voiceGender: 'male' | 'female';
  voicePitch: number;
  voiceRate: number;
  photoUrl?: string;
  avatarType?: 'anime' | 'photo' | 'icon';
  iconSymbol?: string;
}

export const SPECIALIST_DOCTORS: SpecialistDoctor[] = [
  {
    id: 'doc-math',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الرياضيات الهندسية والتفاضل والتكامل',
    specialty: 'دكتور الرياضيات الهندسية',
    englishSpecialty: 'Engineering Mathematics & Calculus',
    avatarStyle: 'male_professor',
    coatColor: '#1e3a8a',
    hairColor: '#334155',
    accentColor: '#3b82f6',
    bio: 'شرح مخصص لمادة الرياضيات الهندسية والتفاضل والتكامل والجبر الخطي وتطبيقاتها.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['المشتقات وقواعد التفاضل في الميكانيكا', 'التكامل وتطبيقات المساحة والمسافة', 'المعادلات التفاضلية للأنظمة الهندسية', 'المصفوفات وتحويلات محاور الروبوت'],
    boardTheme: 'chalkboard_green',
    voiceGender: 'male',
    voicePitch: 1.0,
    voiceRate: 0.95
  },
  {
    id: 'doc-physics',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الفيزياء الهندسية ومقرر سيرواي الدولي',
    specialty: 'دكتور الفيزياء الهندسية',
    englishSpecialty: 'Engineering Physics & Serway Reference',
    avatarStyle: 'senior_sage',
    coatColor: '#1e293b',
    hairColor: '#64748b',
    accentColor: '#f59e0b',
    bio: 'شرح معتمد لفصول كتاب Physics for Scientists and Engineers — Serway، تحليل المتجهات وقوانين نيوتن.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['تحليل المتجهات والمركبات السينية والصادية (Serway Ch 3)', 'قوانين نيوتن للحركة ومخطط الجسم الحر (Serway Ch 5)', 'الشغل والطاقة ومبدأ حفظ الطاقة (Serway Ch 7)', 'تحليل الأبعاد وتجانس الوحدات (Serway Ch 1)'],
    boardTheme: 'chalkboard_green',
    voiceGender: 'male',
    voicePitch: 0.95,
    voiceRate: 0.92
  },
  {
    id: 'doc-circuits',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الدوائر الكهربائية والإلكترونيات التناظرية',
    specialty: 'دكتور الدوائر الكهربائية والإلكترونيات',
    englishSpecialty: 'Electric Circuits & Electronics',
    avatarStyle: 'modern_tech',
    coatColor: '#0f766e',
    hairColor: '#1e293b',
    accentColor: '#14b8a6',
    bio: 'متخصص في قانون أوم، قوانين كيرشوف، تحليل العقد والحلقات، ومجزئ الجهد وتوصيل الحساسات.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['قانون أوم والقدرة الكهربائية وتدفق التيار', 'توصيل المقاومات: التوالي والتوازي ومجزئ الجهد', 'قوانين كيرشوف للتيار والجهد (KCL & KVL)', 'المكثفات والملفات واستجابة الدوائر العابرة'],
    boardTheme: 'blackboard_dark',
    voiceGender: 'male',
    voicePitch: 1.05,
    voiceRate: 0.96
  },
  {
    id: 'doc-programming',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'محاضر البرمجة الهيكلية ولغات C/C++ و Python',
    specialty: 'دكتور البرمجة ولغات البرمجة',
    englishSpecialty: 'Programming Languages (C/C++ & Python)',
    avatarStyle: 'young_innovator',
    coatColor: '#312e81',
    hairColor: '#0f172a',
    accentColor: '#6366f1',
    bio: 'محترف بناء خوارزميات التحكم، إدارة الذاكرة والمؤشرات (Pointers)، وبرمجة المعالجات الدقيقة.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['أساسيات C++ لبرمجة المتحكمات المدمجة', 'المؤشرات (Pointers) وإدارة الذاكرة في الروبوتات', 'الدوال وإشارات التغذية الراجعة', 'بايثون للتحكم ومعالجة الصور الهندسية'],
    boardTheme: 'blackboard_dark',
    voiceGender: 'male',
    voicePitch: 1.0,
    voiceRate: 1.0
  },
  {
    id: 'doc-mechatronics',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ تكامل الميكاترونكس والأنظمة الذكية',
    specialty: 'دكتور أساسيات الميكاترونكس',
    englishSpecialty: 'Mechatronics Fundamentals & Systems Integration',
    avatarStyle: 'male_professor',
    coatColor: '#1e1b4b',
    hairColor: '#334155',
    accentColor: '#8b5cf6',
    bio: 'المرجع الأكاديمي الشامل لربط الميكانيكا مع الإلكترونيات والبرمجة والتحكم في حلقة مغلقة.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['بنية منظومة الميكاترونكس وحلقة التحكم المغلقة', 'التكامل بين الميكانيك والإلكترونيك والمعالجات', 'حسابات العزم والقدرة لنظام ميكاترونكس متكامل', 'تطبيقات الأتمتة الميكاترونية في الصناعة'],
    boardTheme: 'blueprint_cyan',
    voiceGender: 'male',
    voicePitch: 0.98,
    voiceRate: 0.95
  },
  {
    id: 'doc-cad',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الرسم الهندسي والنمذجة ثلاثية الأبعاد CAD',
    specialty: 'دكتور الرسم الهندسي والتصميم CAD',
    englishSpecialty: 'Engineering Drawing & CAD Design',
    avatarStyle: 'male_professor',
    coatColor: '#334155',
    hairColor: '#475569',
    accentColor: '#0ea5e9',
    bio: 'خبير الإسقاط المتعامد، القطاعات، التفاوتات الهندسية (GD&T)، وتصميم الشاسيه للروبوتات.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['الإسقاط المتعامد والمساقط الثلاثة (Orthographic Projection)', 'القطاعات والتهشير للأجزاء الميكانيكية الميكاترونية', 'الأبعاد والتفاوتات الهندسية والتجميع (Fits & Tolerances)', 'أسس تصميم شاسيه الروبوت ثلاثي الأبعاد'],
    boardTheme: 'whiteboard_academic',
    voiceGender: 'male',
    voicePitch: 1.0,
    voiceRate: 0.95
  },
  {
    id: 'doc-mechanics',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الاستاتيكا والديناميكا وعزم القصور الذاتي',
    specialty: 'دكتور الميكانيكا والديناميكا',
    englishSpecialty: 'Engineering Mechanics: Statics & Dynamics',
    avatarStyle: 'senior_sage',
    coatColor: '#431407',
    hairColor: '#78716c',
    accentColor: '#f97316',
    bio: 'متخصص في اتزان الجسيمات والأجسام الجاسئة، تحليل الجملونات، عزم الازدواج، والحركة الدورانية.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['اتزان الجسيم والأجسام الصلبة ومخطط الجسم الحر', 'عزم القوة (Torque) ونظرية فاريغنون', 'عزم القصور الذاتي للأجسام الدوارة', 'كينماتيكا وديناميكا الآليات الميكانيكية'],
    boardTheme: 'chalkboard_green',
    voiceGender: 'male',
    voicePitch: 0.92,
    voiceRate: 0.93
  },
  {
    id: 'doc-machines',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ المحركات الكهربائية والمحولات والمشغلات',
    specialty: 'دكتور الآلات والمحركات الكهربائية',
    englishSpecialty: 'Electrical Machines & Drives',
    avatarStyle: 'modern_tech',
    coatColor: '#701a75',
    hairColor: '#18181b',
    accentColor: '#d946ef',
    bio: 'خبير محركات التيار المستمر DC، محركات الخطوة Stepper، محركات السيرفو Servo، والمحركات الحثية.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['مقارنة محركات DC و Stepper و Servo في الروبوتات', 'منحنى العزم والسرعة لمحركات التيار المستمر', 'محركات السيرفو والتحكم في الزاوية بإشارات PWM', 'درايفرات القدرة H-Bridge وعزل إشارات التحكم'],
    boardTheme: 'blackboard_dark',
    voiceGender: 'male',
    voicePitch: 1.02,
    voiceRate: 0.95
  },
  {
    id: 'doc-control',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ نظرية التحكم الآلي ونظم التغذية الراجعة',
    specialty: 'دكتور التحكم الآلي Control Systems',
    englishSpecialty: 'Automatic Control & PID Controllers',
    avatarStyle: 'male_professor',
    coatColor: '#064e3b',
    hairColor: '#1c1917',
    accentColor: '#10b981',
    bio: 'خبير دالة التحويل (Transfer Function)، استقرار الأنظمة، وضبط معاملات متحكم PID.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['أساسيات متحكم PID (التناسبي والتكاملي والتفاضلي)', 'دالة التحويل (Transfer Function) ومخطط الكتل', 'معايير استقرار الأنظمة الهندسية (Stability)', 'تطبيق عملي: ضبط سرعة محرك الروبوت بمتحكم PID'],
    boardTheme: 'blueprint_cyan',
    voiceGender: 'male',
    voicePitch: 0.97,
    voiceRate: 0.94
  },
  {
    id: 'doc-plc',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ PLC والسكادا والأتمتة الصناعية',
    specialty: 'دكتور PLC والأتمتة الصناعية',
    englishSpecialty: 'PLC & Industrial Automation',
    avatarStyle: 'modern_tech',
    coatColor: '#1c1917',
    hairColor: '#27272a',
    accentColor: '#eab308',
    bio: 'خبير برمجة مخطط السلم Ladder Logic، المتحكمات الصناعية، المؤقتات والعدادات، وتصميم دوائر التحكم.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['مقدمة PLC ومبدأ دورة المسح Scan Cycle', 'برمجة مخطط السلم (Ladder Logic) من الصفر', 'استخدام المؤقتات Timers والعدادات Counters', 'دوائر التشغيل الذاتي Latching وإيقاف الطوارئ E-Stop'],
    boardTheme: 'blackboard_dark',
    voiceGender: 'male',
    voicePitch: 0.98,
    voiceRate: 0.96
  },
  {
    id: 'doc-robotics',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ كينماتيكا الروبوتات والأذرع الصناعية',
    specialty: 'دكتور الروبوتات والذراع الروبوتية',
    englishSpecialty: 'Robotics, Kinematics & Manipulators',
    avatarStyle: 'young_innovator',
    coatColor: '#1e3a8a',
    hairColor: '#1e293b',
    accentColor: '#38bdf8',
    bio: 'متخصص في كينماتيكا الحركة المباشرة والمعكوسة (Forward & Inverse Kinematics) وتخطيط مسار الروبوت.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['الكينماتيكا المباشرة لذراع روبوت ثنائي المفاصل (2-DOF)', 'الكينماتيكا العكسية (Inverse Kinematics) للوصول للهدف', 'مصفوفات التحويل المتجانس ومعلمات Denavit-Hartenberg', 'حسابات مساحة العمل (Workspace) وحمولة الروبوت'],
    boardTheme: 'blueprint_cyan',
    voiceGender: 'male',
    voicePitch: 1.0,
    voiceRate: 0.96
  },
  {
    id: 'doc-sensors',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الحساسات وأجهزة القياس ومعالجة الإشارات',
    specialty: 'دكتور الحساسات والقياس Instrumentation',
    englishSpecialty: 'Sensors, Transducers & Instrumentation',
    avatarStyle: 'male_professor',
    coatColor: '#134e4a',
    hairColor: '#334155',
    accentColor: '#2dd4bf',
    bio: 'خبير حساسات المسافة، الأشعة تحت الحمراء، الإنكودر البصري، الحساسات الحرارية، وتكييف الإشارة.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['مبدأ عمل حساس الموجات فوق الصوتية HC-SR04 ومعادلة المسافة', 'المشفرات البصرية Encoders وقياس السرعة والموضع', 'حساسات الحرارة والضغط والتحويل التماثلي ADC', 'تكييف الإشارة وترشيح الضوضاء (Noise Filtering)'],
    boardTheme: 'blackboard_dark',
    voiceGender: 'male',
    voicePitch: 0.98,
    voiceRate: 0.95
  },
  {
    id: 'doc-embedded',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الأنظمة المدمجة والمتحكمات الدقيقة وأردوينو',
    specialty: 'دكتور الأنظمة المضمنة وArduino',
    englishSpecialty: 'Embedded Systems & Microcontrollers',
    avatarStyle: 'young_innovator',
    coatColor: '#0c4a6e',
    hairColor: '#0f172a',
    accentColor: '#0284c7',
    bio: 'خبير بنية AVR، المقاطعات الخارجية (Interrupts)، بروتوكولات الاتصال I2C و SPI و UART، وتوليد إشارات PWM.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['بنية المتحكم الدقيق ATmega328P ومنافذ الدخل والخرج', 'المقاطعات البرمجية والعتادية (Hardware Interrupts)', 'بروتوكولات الاتصال التسلسلي (UART, I2C, SPI)', 'توليد نبضات تعديل عرض النبضة PWM بدقة'],
    boardTheme: 'blackboard_dark',
    voiceGender: 'male',
    voicePitch: 1.01,
    voiceRate: 0.97
  },
  {
    id: 'doc-manufacturing',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ هندسة التصنيع وماكينات CNC والطباعة ثلاثية الأبعاد',
    specialty: 'دكتور التصنيع وخطوط الإنتاج',
    englishSpecialty: 'Manufacturing Systems & CNC/3D Printing',
    avatarStyle: 'senior_sage',
    coatColor: '#3f3f46',
    hairColor: '#52525b',
    accentColor: '#a1a1aa',
    bio: 'خبير عمليات التشغيل الميكانيكي، برمجة G-Code لماكينات CNC، وتقنيات التصنيع لبناء نماذج الميكاترونكس.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['أساسيات برمجة G-Code لماكينات التفريز والخراطة CNC', 'معايير اختيار تقنيات الطباعة ثلاثية الأبعاد (FDM vs SLA)', 'حسابات قوى القطع وسرعة التغذية في تشغيل المعادن', 'تصميم الأجزاء للتصنيع والتجميع (DFMA)'],
    boardTheme: 'whiteboard_academic',
    voiceGender: 'male',
    voicePitch: 0.93,
    voiceRate: 0.94
  },
  {
    id: 'doc-maintenance',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ هندسة الصيانة الوقائية والفاعلية الكلية OEE',
    specialty: 'دكتور الصيانة والاعتمادية OEE',
    englishSpecialty: 'Maintenance Engineering & Reliability (OEE)',
    avatarStyle: 'male_professor',
    coatColor: '#365314',
    hairColor: '#3f3f46',
    accentColor: '#84cc16',
    bio: 'متخصص في الصيانة التنبؤية القائمة على الحساسات، تحليل الاهتزازات، وحساب الفاعلية الكلية للمعدات OEE.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['حساب الفاعلية الكلية للمعدات OEE (الإتاحة، الأداء، الجودة)', 'الصيانة التنبؤية وتحليل الاهتزازات في المحركات', 'تحليل أسباب الأعطال الجذرية (Root Cause Analysis)', 'مؤشرات الصيانة MTBF و MTTR للأنظمة الصناعية'],
    boardTheme: 'blackboard_dark',
    voiceGender: 'male',
    voicePitch: 0.96,
    voiceRate: 0.95
  },
  {
    id: 'doc-power',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الطاقة الكهربائية والهيدروليك والنيوماتيك الصناعي',
    specialty: 'دكتور الطاقة والأنظمة الصناعية',
    englishSpecialty: 'Power Engineering & Fluid Power Systems',
    avatarStyle: 'male_professor',
    coatColor: '#7c2d12',
    hairColor: '#1c1917',
    accentColor: '#ea580c',
    bio: 'خبير دوائر القدرة، تحويل الطاقة، الأنظمة الهيدروليكية والنيوماتيكية (Electro-Pneumatics) في المصانع.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['دوائر التحكم الكهرو-نيوماتيكية (Electro-Pneumatics)', 'حسابات المضخات والأسطوانات الهيدروليكية في المكابس', 'معامل القدرة (Power Factor) وكفاءة استهلاك الطاقة', 'مصادر التغذية المنظمة والبطاريات لأنظمة الروبوت'],
    boardTheme: 'chalkboard_green',
    voiceGender: 'male',
    voicePitch: 0.95,
    voiceRate: 0.93
  },
  {
    id: 'doc-drones',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الديناميكا الهوائية وأنظمة الطائرات المسيرة UAV',
    specialty: 'دكتور الطائرات المسيرة من الجانب التعليمي والهندسي',
    englishSpecialty: 'Drones, Quadcopters & UAV Aerodynamics',
    avatarStyle: 'young_innovator',
    coatColor: '#075985',
    hairColor: '#0f172a',
    accentColor: '#38bdf8',
    bio: 'متخصص في كوادكوبتر، قوى الرفع والدفع، وحدة IMU، وحسابات الاتزان الذاتي.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['فيزياء الطيران والدفع في طائرات الدرون رباعية المراوح', 'وحدة قياس القصور الذاتي IMU ومستشعر MPU6050', 'حسابات زمن الطيران وسعة بطاريات LiPo والمحركات', 'نظام الملاحة الذاتي وتفادي العوائق للطائرات المسيرة'],
    boardTheme: 'blueprint_cyan',
    voiceGender: 'male',
    voicePitch: 1.0,
    voiceRate: 0.97
  },
  {
    id: 'doc-materials',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ علم المواد الهندسية ومقاومة الإجهادات',
    specialty: 'دكتور المواد الهندسية',
    englishSpecialty: 'Materials Science & Mechanics of Materials',
    avatarStyle: 'senior_sage',
    coatColor: '#451a03',
    hairColor: '#71717a',
    accentColor: '#d97706',
    bio: 'خبير مخطط الإجهاد والانفعال (Stress-Strain Curve)، معاملات المرونة، وتحديد المواد المناسبة.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['مخطط الإجهاد والانفعال ومعامل ينج (Young\'s Modulus)', 'إجهادات الشد والضغط والقص في الوصلات الميكانيكية', 'اختيار المواد الخفيفة المقاومة لشاسيه الروبوتات', 'معامل الأمان (Factor of Safety) في التصميم الميكاتروني'],
    boardTheme: 'whiteboard_academic',
    voiceGender: 'male',
    voicePitch: 0.94,
    voiceRate: 0.94
  },
  {
    id: 'doc-statistics',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ الإحصاء الهندسي والاحتمالات وتحليل البيانات',
    specialty: 'دكتور الاحتمالات والإحصاء الهندسي',
    englishSpecialty: 'Engineering Probability & Statistics',
    avatarStyle: 'male_professor',
    coatColor: '#1e3a8a',
    hairColor: '#334155',
    accentColor: '#3b82f6',
    bio: 'متخصص في التوزيع الطبيعي، تحليل أخطاء القياسات التجريبية، وضبط الجودة الإحصائي.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['التوزيع الطبيعي (Gaussian Distribution) وأخطاء القياس', 'الانحراف المعياري وتباين قراءات الحساسات الميكاترونية', 'مرشح كالمان (Kalman Filter) الأولي لدمج البيانات', 'اختبار الفرضيات الإحصائية في التجارب المعملية'],
    boardTheme: 'chalkboard_green',
    voiceGender: 'male',
    voicePitch: 0.98,
    voiceRate: 0.95
  },
  {
    id: 'doc-signals',
    name: 'د. (أدخل اسم دكتورك هنا)',
    title: 'أستاذ معالجة الإشارات والأنظمة الخطية وتحويلات فورييه',
    specialty: 'دكتور الإشارات والأنظمة',
    englishSpecialty: 'Signals & Systems Analysis',
    avatarStyle: 'modern_tech',
    coatColor: '#311042',
    hairColor: '#18181b',
    accentColor: '#a855f7',
    bio: 'خبير الإشارات المستمرة والمتقطعة، تحويل فورييه السريع FFT، والترشيح الرقمي.',
    university: 'جامعتك الحالية',
    suggestedTopics: ['أنواع الإشارات: المستمرة والمتقطعة والتناظرية والرقمية', 'نظرية أخذ العينات (Nyquist-Shannon Sampling Theorem)', 'مقدمة في تحويل فورييه (Fourier Transform) للترددات', 'المرشحات الترددية المنخفضة والعالية (LPF & HPF)'],
    boardTheme: 'blackboard_dark',
    voiceGender: 'male',
    voicePitch: 1.0,
    voiceRate: 0.96
  }
];

export interface DoctorLessonScene {
  sceneNumber: number;
  sceneTitle: string;
  sceneType: 'intro' | 'concept' | 'formula' | 'diagram' | 'simulation' | 'example_step' | 'common_mistake' | 'summary' | 'interactive_checkpoint';
  doctorSpokenScript: string;
  doctorPronouncedWords?: string; // phonetically tuned for TTS
  doctorAction: 'speaking_straight' | 'pointing_left_board' | 'pointing_formula' | 'looking_at_diagram' | 'explaining_hand_gestures' | 'celebrating_solution' | 'warning_mistake';
  doctorExpression: 'neutral' | 'friendly' | 'enthusiastic' | 'focused' | 'alert';
  boardContent: {
    heading: string;
    subheading?: string;
    bullets: string[];
    latexFormula?: string;
    formulaBreakdown?: { symbol: string; name: string; unit: string; description: string }[];
    diagramType?: 'circuit' | 'vectors' | 'robot_arm' | 'sensor_sonar' | 'chart' | 'free_body';
    stepByStepCalc?: { stepNumber: number; stepText: string; mathExpression: string; explanation: string }[];
    warningBox?: string;
    takeawayBox?: string;
    studentImagePreview?: string;
  };
  durationSeconds: number;
}

export interface SmartDoctorGeneratedLesson {
  id: string;
  studentId?: string;
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorAvatarStyle: string;
  doctorAvatarType?: 'anime' | 'photo' | 'icon';
  doctorPhotoUrl?: string;
  doctorIconSymbol?: string;
  studentImagePreview?: string;
  subject: string;
  lessonTitle: string;
  explanationLevel: 'beginner' | 'intermediate' | 'advanced' | 'formulas_only' | 'step_by_step_problems' | 'applied_examples' | 'exam_cram';
  durationMinutes: number;
  displayMode: 'anime_board' | 'board_only' | 'simulation_focus' | 'solved_examples' | 'student_file';
  useSerwayReference: boolean;
  totalDurationSeconds: number;
  scenes: DoctorLessonScene[];
  simulationData?: {
    type: 'circuit' | 'vectors' | 'robot_arm' | 'sensor_sonar';
    initialParams: Record<string, number>;
    paramLabels: Record<string, string>;
  };
  reviewQuiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  summaryNotes: string[];
  createdAt: string;
  noticeMessage?: string;
  aiErrorInfo?: {
    code: string;
    message: string;
    originalError?: string;
  };
}

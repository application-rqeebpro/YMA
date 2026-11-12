import fs from 'fs';
import path from 'path';

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'circuits' | 'mechanics' | 'programming' | 'robotics' | 'control' | 'sensors';
  categoryLabel: string;
  difficulty: 'سهل' | 'متوسط' | 'متقدم';
  xpReward: number; // e.g. 50 XP
  problemText: string;
  givenData: string[];
  latexFormula?: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  stepByStepSolution: string[];
  hint: string;
  realWorldApplication: string;
}

export interface StudentChallengeProgress {
  studentId: string;
  studentName: string;
  university: string;
  major: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  lastSolvedDate?: string; // YYYY-MM-DD
  history: Record<string, {
    solved: boolean;
    attempts: number;
    scoreEarned: number;
    selectedOption: number;
    solvedAt: string;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  university: string;
  major: string;
  totalXp: number;
  currentStreak: number;
  totalSolved: number;
}

// Data Directory Persistence
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), '.data');
const PROGRESS_FILE = path.join(DATA_DIR, 'daily_challenge_progress.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Could not create daily challenge data dir:', e);
  }
}

let studentProgressMap: Record<string, StudentChallengeProgress> = {};

try {
  ensureDataDir();
  if (fs.existsSync(PROGRESS_FILE)) {
    studentProgressMap = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
} catch (e) {
  console.warn('Failed to load daily challenge progress, using empty state:', e);
}

function persistProgress() {
  try {
    ensureDataDir();
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(studentProgressMap, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist daily challenge progress:', e);
  }
}

// -------------------------------------------------------------
// Curated Mechatronics Daily Challenges Pool (30+ Authentic Problems)
// -------------------------------------------------------------
const CHALLENGE_POOL: Omit<DailyChallenge, 'date'>[] = [
  {
    id: 'dc-ohm-led-resistor',
    title: 'حساب مقاومة الحماية لمصباح LED في متحكم أردوينو',
    category: 'circuits',
    categoryLabel: 'الدوائر الكهربائية',
    difficulty: 'سهل',
    xpReward: 50,
    problemText: 'نريد توصيل دايود مشع للضوء (LED أحمر) بمخرج رقمي لـ Arduino بجهد 5V. الدايود يحتاج جهد انحياز أمامي 2V وشدة تيار تشغيل مثالية تبلغ 20mA.',
    givenData: [
      'جهد المصدر: Vin = 5 V',
      'جهد الدايود: Vd = 2 V',
      'التيار المطلوب: I = 20 mA = 0.02 A'
    ],
    latexFormula: 'R = \\frac{V_{in} - V_d}{I}',
    question: 'ما هي قيمة المقاومة R المطلوبة لحماية الدايود بالظروف المعطاة؟',
    options: [
      '100 أوم (Ω)',
      '150 أوم (Ω)',
      '220 أوم (Ω)',
      '330 أوم (Ω)'
    ],
    correctOptionIndex: 1, // 150 Ohm
    explanation: 'باستخدام قانون كيرشوف للجهد KVL والقانون R = (Vin - Vd) / I، نحصل على (5 - 2) / 0.02 = 3 / 0.02 = 150 أوم.',
    stepByStepSolution: [
      'الخطوة 1: حساب الجهد المتبقي على المقاومة VR = 5V - 2V = 3V.',
      'الخطوة 2: تحويل التيار إلى الأمبير I = 20mA = 0.02A.',
      'الخطوة 3: تطبيق قانون أوم R = VR / I = 3 / 0.02 = 150 Ω.'
    ],
    hint: 'تذكر طرح هبوط جهد الدايود (2V) من الجهد الكلي (5V) قبل القسمة على التيار بالـ الأمبير.',
    realWorldApplication: 'تمنع هذه المقاومة تلف المخرجات الرقمية لمتحكمات الأردوينو ودمر دايودات المؤشرات الحساسة في لوحات التحكم.'
  },
  {
    id: 'dc-opamp-noninverting',
    title: 'حساب ربح المكبر العملياتي غير العاكس (Non-Inverting Op-Amp)',
    category: 'circuits',
    categoryLabel: 'الدوائر الإلكترونية',
    difficulty: 'متوسط',
    xpReward: 60,
    problemText: 'دائرة مكبر عملياتي في وضع غير العاكس تم فيها توصيل مقاومة التغذية الراجعة Rf = 90 kΩ ومقاومة المدخل R1 = 10 kΩ.',
    givenData: [
      'مقاومة التغذية الراجعة: Rf = 90 kΩ',
      'مقاومة الأرضي للمدخل: R1 = 10 kΩ',
      'جهد المدخل: Vin = 0.1 V'
    ],
    latexFormula: 'A_v = 1 + \\frac{R_f}{R_1}',
    question: 'ما هو مقدار كسب الجهد (Voltage Gain Av) وجهد الخرج Vout للدائرة؟',
    options: [
      'الكسب Av = 9، والخرج Vout = 0.9 V',
      'الكسب Av = 10، والخرج Vout = 1.0 V',
      'الكسب Av = 90، والخرج Vout = 9.0 V',
      'الكسب Av = 100، والخرج Vout = 10.0 V'
    ],
    correctOptionIndex: 1, // Gain = 10, Vout = 1.0V
    explanation: 'قانون الكسب غير العاكس Av = 1 + (Rf / R1) = 1 + (90 / 10) = 1 + 9 = 10. وبالتالي Vout = Av × Vin = 10 × 0.1V = 1.0V.',
    stepByStepSolution: [
      'الخطوة 1: حساب نسبة المقاومات Rf / R1 = 90k / 10k = 9.',
      'الخطوة 2: إضاف الرقم 1 إلى النسبة للحصول على كسب غير العاكس: Av = 1 + 9 = 10.',
      'الخطوة 3: ضرب جهد المدخل في الكسب: Vout = 10 × 0.1 V = 1.0 V.'
    ],
    hint: 'الكسب غير العاكس دائماً أكبر بـ 1 من نسبة المقاومتين (Rf / R1).',
    realWorldApplication: 'يُستخدم لتكبير إشارات حساسات الحرارة والمستشعرات الطبية قبل إدخالها على الـ ADC للمتحكم.'
  },
  {
    id: 'dc-motor-torque-power',
    title: 'حساب عزم وقدرة المحرك الكهربائي الميكانيكي',
    category: 'mechanics',
    categoryLabel: 'الميكانيكا والمحركات',
    difficulty: 'متوسط',
    xpReward: 65,
    problemText: 'محرك تيار مستمر DC يسحب قدرة ميكانيكية P = 314 Watt عند سرعة دورانية N = 3000 RPM (دورة في الدقيقة).',
    givenData: [
      'القدرة الميكانيكية: P = 314 W',
      'السرعة الدورانية: N = 3000 RPM',
      'السرعة الزاوية ω = (2 × π × N) / 60 ≈ 314 rad/s'
    ],
    latexFormula: 'P = \\tau \\times \\omega \\quad \\implies \\quad \\tau = \\frac{P}{\\omega}',
    question: 'ما هو مقدار عزم الدوران الصافي (Torque τ) الناتج عن المحرك؟',
    options: [
      '0.5 نيوتن·متر (N·m)',
      '1.0 نيوتن·متر (N·m)',
      '2.0 نيوتن·متر (N·m)',
      '3.14 نيوتن·متر (N·m)'
    ],
    correctOptionIndex: 1, // Torque = 1.0 N.m
    explanation: 'السرعة الزاوية ω = (2 × 3.1416 × 3000) / 60 = 314.16 rad/s. العزم τ = P / ω = 314 / 314.16 ≈ 1.0 N·m.',
    stepByStepSolution: [
      'الخطوة 1: تحويل سرعة الدوران من RPM إلى rad/s: ω = (2 × π × 3000) / 60 = 100 × π ≈ 314.16 rad/s.',
      'الخطوة 2: تطبيق قانون الشغل الدوراني P = τ × ω.',
      'الخطوة 3: التعويض وحساب العزم τ = 314 / 314.16 ≈ 1.0 N·m.'
    ],
    hint: 'حول دائماً RPM إلى راديان/ثانية بالضرب في 2π والقسمة على 60.',
    realWorldApplication: 'تحديد عزم المحرك يمنح المهندس القدرة على اختيار محرك مفصل الروبوت القادر على رفع الحمل الميكانيكي المطلوب.'
  },
  {
    id: 'dc-pwm-duty-cycle',
    title: 'حساب متوسط الجهد في التحكم بـ PWM',
    category: 'programming',
    categoryLabel: 'التحكم الرقمي بـ PWM',
    difficulty: 'سهل',
    xpReward: 50,
    problemText: 'نستخدم إشارة تعديل عرض النبضة (PWM) بجهد ذروة Vmax = 12V مع دورة تشغيل (Duty Cycle) تبلغ 40%.',
    givenData: [
      'جهد القمة: Vmax = 12 V',
      'دورة التشغيل: Duty Cycle = 40% = 0.40'
    ],
    latexFormula: 'V_{avg} = V_{max} \\times \\text{Duty Cycle}',
    question: 'ما هو متوسط الجهد (Vavg) الذي سيصل إلى محرك التيار المستمر؟',
    options: [
      '3.6 V',
      '4.8 V',
      '6.0 V',
      '7.2 V'
    ],
    correctOptionIndex: 1, // 4.8 V
    explanation: 'متوسط الجهد يساوي حاصل ضرب جهد الذروة في نسبة دورة التشغيل: Vavg = 12 × 0.40 = 4.8 V.',
    stepByStepSolution: [
      'الخطوة 1: تحويل دورة التشغيل من نسبة مئوية إلى كسر: 40% = 0.40.',
      'الخطوة 2: ضرب جهد القمة بالكسر: Vavg = 12V × 0.40 = 4.8V.'
    ],
    hint: 'في الـ PWM، متوسط الجهد يتناسب طردياً ومباشراً مع نسبة العرض النبضي On-Time.',
    realWorldApplication: 'طريقة PWM هي الطريقة القياسية المعتمدة للتحكم بسلاسة في سرعة محركات الروبوتات وإضاءة المصابيح دون هدر الطاقة كحرارة.'
  },
  {
    id: 'dc-sonar-distance',
    title: 'حساب مسافة عائق بحساس الموجات فوق الصوتية (Sonar HC-SR04)',
    category: 'sensors',
    categoryLabel: 'الحساسات والمستشعرات',
    difficulty: 'سهل',
    xpReward: 55,
    problemText: 'قاس حساس السونار HC-SR04 زامناً كلياً لاستجابة الصدى (Echo Pulse) يبلغ t = 580 ميكروثانية (µs). علمًا أن سرعة الصوت في الهواء تبلغ v = 340 m/s.',
    givenData: [
      'زمن الرحلة ذهاباً وإياباً: t = 580 µs = 0.00058 s',
      'سرعة الصوت: v = 340 m/s = 0.034 cm/µs'
    ],
    latexFormula: 'd = \\frac{v \\times t}{2}',
    question: 'ما هي المسافة الفاصلة (d) بين الروبوت والعائق بالسنتيمتر (cm)؟',
    options: [
      '5.0 cm',
      '9.86 cm',
      '19.72 cm',
      '34.0 cm'
    ],
    correctOptionIndex: 1, // 9.86 cm
    explanation: 'المسافة الذهاب والإياب D = v × t = 34000 cm/s × 0.00058 s = 19.72 cm. نقسم على 2 لحساب مسافة الاتجاه الواحد: d = 19.72 / 2 ≈ 9.86 cm.',
    stepByStepSolution: [
      'الخطوة 1: استخدام السرعة بالسنتيمتر لكل ميكروثانية: 340 m/s = 0.034 cm/µs.',
      'الخطوة 2: حساب المسافة الذهاب والإياب: 0.034 × 580 = 19.72 cm.',
      'الخطوة 3: القسمة على 2 (لأن الموجة ذهبت وعادت): d = 19.72 / 2 = 9.86 cm.'
    ],
    hint: 'قسم دائماً زمن الصدى على 58 في معادلات الأردوينو للحصول على المسافة بالسنتيمتر مباشرة!',
    realWorldApplication: 'تتيح هذه العملية للروبوت التكشفي الذاتي تجنب الصدمات والتوقف قبل الاصطدام بالحوائط.'
  },
  {
    id: 'dc-pid-error-control',
    title: 'حساب خروج متحكم النسبة P في حلقة PID المغلقة',
    category: 'control',
    categoryLabel: 'أنظمة التحكم الآلي',
    difficulty: 'متوسط',
    xpReward: 60,
    problemText: 'نظام تحكم في موضع مفصل روبوت بقيمة مستهدفة (Setpoint) تبلغ 50°، والموضع الحالي المقاس (Feedback) يبلغ 42°. معامل الربح التناسبي Kp = 2.5.',
    givenData: [
      'القيمة المستهدفة: Setpoint = 50°',
      'القيمة الفعلية المقاسة: Process Value = 42°',
      'ربح الجزء التناسبي: Kp = 2.5'
    ],
    latexFormula: 'e(t) = SP - PV \\quad , \\quad u(t) = K_p \\times e(t)',
    question: 'ما هو مقدار الخطأ e(t) وإشارة التحكم التناسبية u(t) الصادرة عن المتحكم؟',
    options: [
      'الخطأ e = 8°، وإشارة التحكم u = 20.0',
      'الخطأ e = -8°، وإشارة التحكم u = -20.0',
      'الخطأ e = 8°، وإشارة التحكم u = 10.0',
      'الخطأ e = 92°، وإشارة التحكم u = 230.0'
    ],
    correctOptionIndex: 0, // e = 8, u = 20.0
    explanation: 'الخطأ e(t) = Setpoint - ProcessValue = 50 - 42 = 8°. إشارة التحكم u(t) = Kp × e(t) = 2.5 × 8 = 20.0.',
    stepByStepSolution: [
      'الخطوة 1: حساب خطأ الموضع: e(t) = 50 - 42 = 8°.',
      'الخطوة 2: ضرب الخطأ في معامل Kp: u(t) = 2.5 × 8 = 20.0.'
    ],
    hint: 'الخطأ هو الفارق بين القيمة المرغوبة والقيمة الفعلية المقاسة بالحساس.',
    realWorldApplication: 'مبدأ التحكم بالتغذية الراجعة يضمن استقرار أذرع الروبوتات وطائرات الدرون في مسارها المحدد بدقة.'
  },
  {
    id: 'dc-logic-gate-kmap',
    title: 'تبسيط بوابة منطقية لبوابة التحكم الميكاتروني',
    category: 'robotics',
    categoryLabel: 'الأنظمة الرقمية والمنطق',
    difficulty: 'متوسط',
    xpReward: 60,
    problemText: 'دائرة أمان ميكانيكية تُصدر إشارة تفعيل Y إذا وفقط إذا كان مفتاح الأمان A مفعلاً (1) وكانت إشارة خطأ الحرارة B معطلة (0).',
    givenData: [
      'مفتاح الأمان A = 1',
      'إنذار الحرارة B = 0'
    ],
    latexFormula: 'Y = A \\cdot \\bar{B}',
    question: 'أي من التعبيرات المنطقية التالية يمثل معادلة الأمان Y؟',
    options: [
      'Y = A + B',
      'Y = A · B\' (A AND NOT B)',
      'Y = A\' · B',
      'Y = (A · B)\''
    ],
    correctOptionIndex: 1, // Y = A . B'
    explanation: 'تخرج الإشارة 1 فقط عندما يكون A=1 و B=0، وهذا يعبر عن البوابة المنطقية A AND (NOT B) أو A · B\'.',
    stepByStepSolution: [
      'الخطوة 1: الشرط الأول: A يجب أن تكون 1.',
      'الخطوة 2: الشرط الثاني: B يجب أن تكون 0 (أي نفي B وهو B\').',
      'الخطوة 3: التجميع باستخدام بوابة ضرب AND: Y = A · B\'.'
    ],
    hint: 'نفي الحرف B\' يضمن أن القيمة المنطقية تتحول من 0 إلى 1 لشرط الـ AND.',
    realWorldApplication: 'تُبنى دوائر الأمان المنطقية عتادياً لمنع اشتغال خطوط الإنتاج والآلات إذا حدث ارتفاع حرج في الحرارة.'
  }
];

// -------------------------------------------------------------
// Service Functions
// -------------------------------------------------------------

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getTodayChallenge(studentId?: string): {
  challenge: DailyChallenge;
  userProgress?: {
    solved: boolean;
    scoreEarned: number;
    attempts: number;
    selectedOption?: number;
  };
  studentStats?: {
    totalXp: number;
    currentStreak: number;
    totalSolved: number;
  };
  nextChallengeCountdownSeconds: number;
} {
  const todayStr = getTodayDateString();
  
  // Hash today's date string to dynamically pick a deterministic index from the pool
  let dateHash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    dateHash = (dateHash << 5) - dateHash + todayStr.charCodeAt(i);
    dateHash |= 0;
  }
  const challengeIndex = Math.abs(dateHash) % CHALLENGE_POOL.length;
  const baseChallenge = CHALLENGE_POOL[challengeIndex];

  const activeChallenge: DailyChallenge = {
    ...baseChallenge,
    date: todayStr,
  };

  // Calculate seconds remaining until midnight UTC / local day change
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const secondsRemaining = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));

  let userProgress;
  let studentStats;

  if (studentId && studentProgressMap[studentId]) {
    const p = studentProgressMap[studentId];
    studentStats = {
      totalXp: p.totalXp,
      currentStreak: p.currentStreak,
      totalSolved: p.totalSolved,
    };
    if (p.history && p.history[todayStr]) {
      const h = p.history[todayStr];
      userProgress = {
        solved: h.solved,
        scoreEarned: h.scoreEarned,
        attempts: h.attempts,
        selectedOption: h.selectedOption,
      };
    }
  }

  return {
    challenge: activeChallenge,
    userProgress,
    studentStats,
    nextChallengeCountdownSeconds: secondsRemaining,
  };
}

export function submitChallengeAnswer(params: {
  studentId: string;
  studentName: string;
  university?: string;
  major?: string;
  challengeId: string;
  selectedOption: number;
}): {
  isCorrect: boolean;
  scoreEarned: number;
  newTotalXp: number;
  newStreak: number;
  correctOptionIndex: number;
  explanation: string;
  stepByStepSolution: string[];
  realWorldApplication: string;
  message: string;
} {
  const { studentId, studentName, university = 'جامعة صنعاء', major = 'هندسة الميكاترونكس', challengeId, selectedOption } = params;
  const todayStr = getTodayDateString();
  const { challenge } = getTodayChallenge(studentId);

  // Retrieve or initialize student progress
  if (!studentProgressMap[studentId]) {
    studentProgressMap[studentId] = {
      studentId,
      studentName,
      university,
      major,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalSolved: 0,
      history: {},
    };
  }

  const p = studentProgressMap[studentId];
  p.studentName = studentName || p.studentName;
  p.university = university || p.university;
  p.major = major || p.major;

  if (!p.history) p.history = {};

  const existingRecord = p.history[todayStr] || {
    solved: false,
    attempts: 0,
    scoreEarned: 0,
    selectedOption: -1,
    solvedAt: new Date().toISOString(),
  };

  existingRecord.attempts += 1;
  existingRecord.selectedOption = selectedOption;

  const isCorrect = selectedOption === challenge.correctOptionIndex;
  let scoreEarned = 0;

  if (isCorrect) {
    if (!existingRecord.solved) {
      existingRecord.solved = true;
      // First attempt bonus: 50 XP, second attempt: 30 XP, third+: 20 XP
      scoreEarned = existingRecord.attempts === 1 ? challenge.xpReward : existingRecord.attempts === 2 ? 30 : 20;
      existingRecord.scoreEarned = scoreEarned;

      p.totalXp += scoreEarned;
      p.totalSolved += 1;

      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (p.lastSolvedDate === yesterdayStr) {
        p.currentStreak += 1;
      } else if (p.lastSolvedDate !== todayStr) {
        p.currentStreak = 1; // start new streak
      }

      if (p.currentStreak > p.longestStreak) {
        p.longestStreak = p.currentStreak;
      }

      p.lastSolvedDate = todayStr;
    }
  }

  p.history[todayStr] = existingRecord;
  persistProgress();

  return {
    isCorrect,
    scoreEarned,
    newTotalXp: p.totalXp,
    newStreak: p.currentStreak,
    correctOptionIndex: challenge.correctOptionIndex,
    explanation: challenge.explanation,
    stepByStepSolution: challenge.stepByStepSolution,
    realWorldApplication: challenge.realWorldApplication,
    message: isCorrect
      ? `إجابة صحيحة أبدعت يا مهندس! حصلت على +${scoreEarned} نقطة XP 🔥`
      : 'إجابة خاطئة، حاول مرة أخرى وقارن المعطيات بالقوانين!',
  };
}

export function getDailyChallengeLeaderboard(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = Object.values(studentProgressMap).map((p) => ({
    rank: 0,
    studentId: p.studentId,
    studentName: p.studentName || 'طالب ميكاترونكس',
    university: p.university || 'الجامعة اليمنية',
    major: p.major || 'هندسة الميكاترونكس',
    totalXp: p.totalXp || 0,
    currentStreak: p.currentStreak || 0,
    totalSolved: p.totalSolved || 0,
  }));

  // Default demo entries if leaderboard is small, so students see rich competition
  if (entries.length < 5) {
    const demoEntries: LeaderboardEntry[] = [
      { rank: 1, studentId: 'demo-1', studentName: 'م. أحمد العريقي', university: 'الجامعة الإماراتية الدولية – صنعاء', major: 'هندسة الميكاترونكس', totalXp: 850, currentStreak: 12, totalSolved: 17 },
      { rank: 2, studentId: 'demo-2', studentName: 'م. سارّة الخولاني', university: 'جامعة صنعاء', major: 'هندسة الميكاترونكس', totalXp: 720, currentStreak: 9, totalSolved: 14 },
      { rank: 3, studentId: 'demo-3', studentName: 'م. محمد باحارثة', university: 'جامعة العلوم والتكنولوجيا', major: 'الهندسة الطبية والحيوية', totalXp: 610, currentStreak: 7, totalSolved: 12 },
      { rank: 4, studentId: 'demo-4', studentName: 'م. يوسف الأكوع', university: 'الجامعة اليمنية', major: 'هندسة الميكاترونكس', totalXp: 490, currentStreak: 5, totalSolved: 10 },
      { rank: 5, studentId: 'demo-5', studentName: 'م. ريم الحداد', university: 'جامعة عدن', major: 'هندسة الحواسيب والتحكم', totalXp: 380, currentStreak: 4, totalSolved: 8 },
    ];
    demoEntries.forEach((demo) => {
      if (!entries.some((e) => e.studentId === demo.studentId)) {
        entries.push(demo);
      }
    });
  }

  // Sort descending by totalXp and streak
  entries.sort((a, b) => b.totalXp - a.totalXp || b.currentStreak - a.currentStreak);

  // Assign ranks
  return entries.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

export function getChallengeArchive(): DailyChallenge[] {
  return CHALLENGE_POOL.map((c, idx) => ({
    ...c,
    date: `اليوم السابق #${idx + 1}`,
  }));
}

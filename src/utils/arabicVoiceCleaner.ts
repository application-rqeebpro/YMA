/**
 * Utility to convert raw technical scripts into clean, unbroken, fully vocalized Arabic text
 * suitable for Web Speech Synthesis in a clear male professor voice.
 */

export function cleanArabicSpokenScript(inputScript: string): string {
  if (!inputScript) return '';

  let text = inputScript;

  // 1. Remove Markdown symbols and brackets
  text = text.replace(/[*_#`~[\]()]/g, ' ');

  // 2. Common Mechatronics Formulas and Equations
  text = text.replace(/V\s*=\s*I\s*[*×\\]?\s*R/gi, 'الجهد يساوي حاصل ضرب التيار في المقاومة');
  text = text.replace(/I\s*=\s*V\s*[/÷]\s*R/gi, 'التيار يساوي الجهد مقسوماً على المقاومة');
  text = text.replace(/R\s*=\s*V\s*[/÷]\s*I/gi, 'المقاومة تساوي الجهد مقسوماً على التيار');
  text = text.replace(/P\s*=\s*V\s*[*×]\s*I/gi, 'القدرة تساوي الجهد مضروباً في التيار');
  text = text.replace(/F\s*=\s*m\s*[*×]\s*a/gi, 'القوة تساوي الكتلة مضروبة في التسارع');

  // 3. Technical Acronyms and Terms Replacement
  const termReplacements: [RegExp, string][] = [
    [/\bSerway\b/gi, 'سيرواي'],
    [/\bArduino\b/gi, 'أردوينو'],
    [/\bMicrocontroller\b/gi, 'متحكم دقيق'],
    [/\bMicrocontrollers\b/gi, 'متحكمات دقيقة'],
    [/\bSensor\b/gi, 'حساس'],
    [/\bSensors\b/gi, 'حساسات'],
    [/\bEncoder\b/gi, 'إنكودر'],
    [/\bEncoders\b/gi, 'إنكودرات'],
    [/\bStepper\b/gi, 'استيبر'],
    [/\bServo\b/gi, 'سيرفو'],
    [/\bMotor\b/gi, 'محرك'],
    [/\bMotors\b/gi, 'محركات'],
    [/\bPID\b/gi, 'بي آي دي'],
    [/\bPLC\b/gi, 'بي إل سي'],
    [/\bKCL\b/gi, 'قانون كيرشوف للتيار'],
    [/\bKVL\b/gi, 'قانون كيرشوف للجهد'],
    [/\bPWM\b/gi, 'بي دبليو إم'],
    [/\bADC\b/gi, 'تحويل تماثلي رقمي إيه دي سي'],
    [/\bDAC\b/gi, 'تحويل رقمي تماثلي دي إيه سي'],
    [/\bLED\b/gi, 'ليد'],
    [/\bLEDs\b/gi, 'دايودات مشعة ليد'],
    [/\bC\+\+\b/gi, 'سي بلس بلس'],
    [/\bPython\b/gi, 'بايثون'],
    [/\bI2C\b/gi, 'آي تو سي'],
    [/\bSPI\b/gi, 'إس بي آي'],
    [/\bUART\b/gi, 'يو أرت'],
    [/\bCNC\b/gi, 'سي إن سي'],
    [/\bDC\b/gi, 'تيار مستمر دي سي'],
    [/\bAC\b/gi, 'تيار متردد إيه سي'],
    [/\bOEE\b/gi, 'أو إي إي'],
    [/\bMTBF\b/gi, 'إم تي بي إف'],
    [/\bMTTR\b/gi, 'إم تي تي آر'],
    [/\bIMU\b/gi, 'آي إم يو'],
    [/\bLiPo\b/gi, 'ليثيوم بوليمر'],
    [/\bUAV\b/gi, 'طائرة مسيرة'],
    [/\bCAD\b/gi, 'سي أيه دي'],
    [/\bGD&T\b/gi, 'جي دي آند تي'],
    [/\b2D\b/gi, 'ثنائي الأبعاد'],
    [/\b3D\b/gi, 'ثلاثي الأبعاد'],
    [/\bHC-SR04\b/gi, 'حساس الموجات فوق الصوتية اتش سي'],
    [/\bMPU6050\b/gi, 'حساس التسارع والبوصلة'],
    [/\bATmega328P\b/gi, 'معالج أردوينو الرئيسي'],
  ];

  for (const [regex, replacement] of termReplacements) {
    text = text.replace(regex, replacement);
  }

  // 4. Units & Measurement Replacements (when attached to digits or standalone)
  text = text.replace(/(\d+)\s*k\Omega/gi, '$1 كيلو أوم');
  text = text.replace(/(\d+)\s*M\Omega/gi, '$1 ميجا أوم');
  text = text.replace(/(\d+)\s*\Omega/gi, '$1 أوم');
  text = text.replace(/(\d+)\s*Ohm/gi, '$1 أوم');
  text = text.replace(/(\d+)\s*mV/gi, '$1 ملي فولت');
  text = text.replace(/(\d+)\s*kV/gi, '$1 كيلو فولت');
  text = text.replace(/(\d+)\s*V/gi, '$1 فولت');
  text = text.replace(/(\d+)\s*mA/gi, '$1 ملي أمبير');
  text = text.replace(/(\d+)\s*A/gi, '$1 أمبير');
  text = text.replace(/(\d+)\s*kW/gi, '$1 كيلو واط');
  text = text.replace(/(\d+)\s*W/gi, '$1 واط');
  text = text.replace(/(\d+)\s*Hz/gi, '$1 هيرتز');
  text = text.replace(/(\d+)\s*kHz/gi, '$1 كيلو هيرتز');
  text = text.replace(/(\d+)\s*MHz/gi, '$1 ميجا هيرتز');
  text = text.replace(/(\d+)\s*GHz/gi, '$1 جيجا هيرتز');
  text = text.replace(/(\d+)\s*m\/s\^2/gi, '$1 متر لكل ثانية مربعة');
  text = text.replace(/(\d+)\s*m\/s/gi, '$1 متر لكل ثانية');
  text = text.replace(/(\d+)\s*cm/gi, '$1 سنتيمتر');
  text = text.replace(/(\d+)\s*mm/gi, '$1 مليمتر');
  text = text.replace(/(\d+)\s*m/gi, '$1 متر');
  text = text.replace(/(\d+)\s*kg/gi, '$1 كيلوجرام');
  text = text.replace(/(\d+)\s*g/gi, '$1 جرام');
  text = text.replace(/(\d+)\s*N\.m/gi, '$1 نيوتن متر');
  text = text.replace(/(\d+)\s*Nm/gi, '$1 نيوتن متر');
  text = text.replace(/(\d+)\s*N/gi, '$1 نيوتن');

  // 5. Convert standalone English symbols in math context
  text = text.replace(/\b([a-zA-Z])\b/g, (match, letter) => {
    const l = letter.toUpperCase();
    const map: Record<string, string> = {
      A: 'أمبير',
      B: 'باء',
      C: 'سعة',
      D: 'دال',
      E: 'طاقة',
      F: 'قوة',
      G: 'تسارع الجاذبية',
      H: 'ارتفاع',
      I: 'تيار',
      J: 'جول',
      K: 'ثابت',
      L: 'طول',
      M: 'كتلة',
      N: 'نيوتن',
      O: 'أوم',
      P: 'قدرة',
      Q: 'شحنة',
      R: 'مقاومة',
      S: 'مسافة',
      T: 'زمن',
      U: 'جهد',
      V: 'فولت',
      W: 'واط',
      X: 'المحور س',
      Y: 'المحور ص',
      Z: 'المحور ع',
    };
    return map[l] || l;
  });

  // 6. Clean punctuation and spaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Finds the best male Arabic SpeechSynthesisVoice available in the user's browser.
 * Filters out female voices and prioritizes deep male academic voices.
 */
export function getBestMaleArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Filter all Arabic voices
  const arabicVoices = voices.filter(
    (v) =>
      v.lang.startsWith('ar') ||
      v.lang.toLowerCase().includes('arabic') ||
      v.name.toLowerCase().includes('arabic') ||
      v.name.includes('عربي')
  );

  if (arabicVoices.length === 0) return null;

  // List of keywords indicating female voices to EXCLUDE strictly
  const femaleKeywords = [
    'female',
    'laila',
    'zariyah',
    'salma',
    'fatima',
    'mariam',
    'noura',
    'farah',
    'zeina',
    'amira',
    'rana',
    'yasmin',
    'hoda',
    'huda',
    'muna',
    'mona',
    'sara',
    'sarah',
    'reem',
    'dalia',
    'layla',
    'woman',
    'girl',
    'nour',
    'sana',
    'yara',
    'aya',
    'hala'
  ];

  // List of keywords indicating male voice
  const maleKeywords = [
    'naayf',
    'shakir',
    'hamed',
    'tarik',
    'taim',
    'maged',
    'majed',
    'ali',
    'hamdan',
    'ismael',
    'bassel',
    'fahed',
    'rami',
    'jamal',
    'abdullah',
    'moammar',
    'laith',
    'hedi',
    'male',
    'omar',
    'zayd',
    'amir',
    'salman',
    'basel',
    'faisal',
    'moustafa',
    'ziad',
    'youssef',
    'mhined',
    'mhamed',
    'saeed',
    'hasan',
    'man',
    'natural'
  ];

  // Filter out any known female voices
  const nonFemaleVoices = arabicVoices.filter(
    (v) => !femaleKeywords.some((kw) => v.name.toLowerCase().includes(kw))
  );

  const candidateList = nonFemaleVoices.length > 0 ? nonFemaleVoices : arabicVoices;

  // Look for explicitly male Arabic voice
  const maleVoice = candidateList.find((v) =>
    maleKeywords.some((kw) => v.name.toLowerCase().includes(kw))
  );

  if (maleVoice) {
    return maleVoice;
  }

  // Fallback to first non-female candidate
  return candidateList[0] || arabicVoices[0];
}

/**
 * Creates and configures a SpeechSynthesisUtterance tailored for an authentic, deep Arabic male voice
 */
export function configureMaleArabicUtterance(
  rawText: string,
  speedMultiplier: number = 1.0
): SpeechSynthesisUtterance {
  const cleaned = cleanArabicSpokenScript(rawText);
  const utterance = new SpeechSynthesisUtterance(cleaned);

  utterance.lang = 'ar-SA';
  utterance.rate = Math.max(0.75, Math.min(1.10, 0.88 * speedMultiplier));
  utterance.pitch = 0.80; // Deep, authoritative, natural male professor tone

  const maleVoice = getBestMaleArabicVoice();
  if (maleVoice) {
    utterance.voice = maleVoice;
  }

  return utterance;
}

export const OFFICIAL_ARABIC_MALE_PROFILES = [
  { id: 'ar-male-academic-1', name: 'د. نايف المقطري (صوت أكاديمي فصيح - رزين)', pitch: 0.80, rate: 0.88, description: 'صوت عربي فصيح بعمق أكاديمي يناسب الشرح الجامعي والنظريات' },
  { id: 'ar-male-engineer-2', name: 'م. طارق المهندس (صوت تطبيقي - حماسي)', pitch: 0.85, rate: 0.92, description: 'صوت مهندس ميكاترونكس ناطق بوضوح للشرح والتطبيقات العملية' },
  { id: 'ar-male-news-3', name: 'د. حامد الجامعي (صوت جهوري فصيح - فائق الوضوح)', pitch: 0.75, rate: 0.86, description: 'نبرة صوت رجالية عميقة وفصيحة مع دقة تشكيل مخارج الحروف' },
];


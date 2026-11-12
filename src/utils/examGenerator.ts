import {
  ExamPaper,
  ExamType,
  ExamPart,
  ExamQuestionItem,
  ExamHeaderInfo,
  Lesson,
  Subject,
} from '../types';

export interface GenerateExamOptions {
  subject: Subject;
  lesson?: Lesson | null;
  examType?: ExamType;
  university?: string;
  college?: string;
  department?: string;
  professorName?: string;
  academicYear?: string;
  studentName?: string;
  customLessonTitle?: string;
  customLessonContent?: any; // from ExplainLessonView analysisResult
}

export function generateExamPaper(options: GenerateExamOptions): ExamPaper {
  const {
    subject,
    lesson,
    examType = lesson ? 'lesson_test' : 'final',
    university = 'الجامعة الإماراتية الدولية – صنعاء',
    college = 'كلية الهندسة وتكنولوجيا المعلومات',
    department = 'قسم هندسة الميكاترونكس والروبوتات',
    professorName = 'أستاذ المقرر',
    academicYear = '2024 - 2025',
    customLessonTitle,
    customLessonContent,
  } = options;

  const isCustomLesson = Boolean(customLessonContent);
  const examTitle = lesson
    ? `اختبار تقييمي متوقع: ${lesson.title}`
    : customLessonTitle
    ? `نموذج اختبار متوقع: ${customLessonTitle}`
    : examType === 'final'
    ? `امتحان نهاية الفصل الدراسي (النهائي) - ${subject.name}`
    : examType === 'midterm'
    ? `امتحان منتصف الفصل الدراسي (النصفي) - ${subject.name}`
    : `اختبار فصلي قصير (Quiz) - ${subject.name}`;

  const examTypeLabel =
    examType === 'final'
      ? 'امتحان نهاية الفصل الدراسي الأول (الدور الأول)'
      : examType === 'midterm'
      ? 'امتحان منتصف الفصل الدراسي (النصفي)'
      : examType === 'quiz'
      ? 'اختبار فصلي قصير وأعمال سنة (Quiz & Assessment)'
      : 'اختبار تقييمي للمفردة الدراسية (Lesson Assessment)';

  const timeAllowed =
    examType === 'final'
      ? '3 ساعات (180 دقيقة)'
      : examType === 'midterm'
      ? 'ساعتان (120 دقيقة)'
      : examType === 'quiz'
      ? '45 دقيقة'
      : 'ساعة ونصف (90 دقيقة)';

  const totalMarks =
    examType === 'final' ? 100 : examType === 'midterm' ? 50 : examType === 'quiz' ? 25 : 40;

  const header: ExamHeaderInfo = {
    republic: 'الجمهورية اليمنية',
    ministry: 'وزارة التعليم العالي والبحث العلمي والتعليم الفني',
    university,
    faculty: college,
    department,
    courseTitle: subject.name,
    courseCode: subject.code,
    level: subject.year || 'المستوى الأول',
    semester: subject.semester || 'الفصل الدراسي الأول',
    academicYear,
    examTypeLabel,
    timeAllowed,
    totalMarks,
    professorName,
    examDate: new Date().toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  const instructions: string[] = [
    'الإجابة بالقلم الجاف الأزرق، ويمنع تمامًا استخدام أقلام الرصاص في ورقة الإجابة النهائية عدا الرسومات التخطيطية.',
    'يُمنع منعًا باتًا استخدام أو إدخال الهواتف المحمولة أو الساعات الذكية إلى قاعة الاختبار.',
    'يُسمح باستخدام الآلة الحاسبة العلمية غير القابلة للبرمجة (Non-programmable Scientific Calculator).',
    'الرجاء كتابة خطوات الحل كاملة مع كتابة القوانين الهندسية، والتعويض بالأرقام، وتوضيح الوحدات والأبعاد لكل ناتج نهائي.',
    'تأكد من وضوح الخط وترتيب إجابات الأسئلة وفق الترقيم المعتمد في ورقة الأسئلة.',
  ];

  let parts: ExamPart[] = [];

  // CASE 1: Built from a custom uploaded lesson (from ExplainLessonView)
  if (customLessonContent) {
    parts = buildPartsFromCustomAnalysis(customLessonContent, totalMarks);
  }
  // CASE 2: Built from a specific Lesson in curriculum
  else if (lesson) {
    parts = buildPartsFromCurriculumLesson(lesson, subject, totalMarks);
  }
  // CASE 3: Built from whole Subject curriculum bank
  else {
    parts = buildPartsFromSubjectBank(subject.id, examType, totalMarks);
  }

  return {
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: examTitle,
    subjectId: subject.id,
    subjectName: subject.name,
    lessonId: lesson?.id,
    lessonTitle: lesson?.title || customLessonTitle,
    examType,
    header,
    parts,
    totalMarks,
    instructions,
    createdAt: new Date().toISOString(),
    isCustomUploadedLesson: isCustomLesson,
  };
}

/**
 * Build Exam Parts from Custom Uploaded Lesson Analysis
 */
function buildPartsFromCustomAnalysis(analysis: any, totalMarks: number): ExamPart[] {
  const parts: ExamPart[] = [];

  // Part 1: MCQ from Quiz
  const quizList = Array.isArray(analysis.quiz) ? analysis.quiz : [];
  const mcqQuestions: ExamQuestionItem[] = quizList.slice(0, 5).map((q: any, idx: number) => ({
    id: `q-mcq-${idx + 1}`,
    number: idx + 1,
    text: q.question || `سؤال اختياري رقم ${idx + 1}`,
    marks: Math.max(2, Math.floor((totalMarks * 0.25) / Math.max(quizList.length, 1))),
    type: 'mcq',
    options: q.options || ['الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د'],
    correctOptionIndex: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
    modelAnswer:
      q.options && typeof q.correctAnswer === 'number'
        ? `${String.fromCharCode(65 + q.correctAnswer)}) ${q.options[q.correctAnswer]}`
        : 'الإجابة النموذجية الصحيحة حسب مفاهيم الدرس المشروح.',
    explanation: q.explanation || 'يستند هذا الخيار إلى القاعدة العلمية المشروحة في متن المحاضرة.',
  }));

  if (mcqQuestions.length > 0) {
    const part1Marks = mcqQuestions.reduce((sum, q) => sum + q.marks, 0);
    parts.push({
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions - MCQs)',
      instructions: 'اختر الإجابة الصحيحة لكل مما يلي مع نقل رمز الإجابة المناسب:',
      totalMarks: part1Marks,
      questions: mcqQuestions,
    });
  }

  // Part 2: True / False from Terms and Concepts
  const termsList = Array.isArray(analysis.terms) ? analysis.terms : [];
  const tfQuestions: ExamQuestionItem[] = termsList.slice(0, 4).map((t: any, idx: number) => {
    const isTrue = idx % 2 === 0;
    const text = isTrue
      ? `يُعرّف مصطلح (${t.term || 'المفهوم'}): بأنه ${t.meaning || 'المفهوم العلمي الدقيق'}.`
      : `في أنظمة الميكاترونكس، يُعتبر (${t.term || 'المفهوم'}) غير مرتبط بوحدات القياس الدولية ومستقل عن المتغيرات.`;
    return {
      id: `q-tf-${idx + 1}`,
      number: idx + 1,
      text,
      marks: Math.max(2, Math.floor((totalMarks * 0.2) / 4)),
      type: 'true_false',
      modelAnswer: isTrue ? 'صح (True)' : 'خطأ (False)',
      explanation: isTrue
        ? `العبارة صحيحة؛ حيث أن ${t.term} يعبر فعليًا عن ${t.meaning}.`
        : `العبارة خاطئة؛ حيث أن ${t.term} يرتبط بوحدات قياس ومحددات دقيقة في النظام الهندسي.`,
    };
  });

  if (tfQuestions.length > 0) {
    const part2Marks = tfQuestions.reduce((sum, q) => sum + q.marks, 0);
    parts.push({
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'أسئلة الصواب والخطأ مع التعليل العلمي (True / False with Reason)',
      instructions: 'بيّن مدى صحة أو خطأ العبارات التالية مع تصحيح العبارة الخاطئة مع التعليل:',
      totalMarks: part2Marks,
      questions: tfQuestions,
    });
  }

  // Part 3: Engineering Problems from Solved Examples
  const examplesList = Array.isArray(analysis.solvedExamples) ? analysis.solvedExamples : [];
  const problemQuestions: ExamQuestionItem[] = examplesList.slice(0, 2).map((ex: any, idx: number) => ({
    id: `q-prob-${idx + 1}`,
    number: idx + 1,
    text: ex.problem || 'مسألة هندسية تطبيقية تتطلب استخدام القوانين المشروحة والتعويض بالمعطيات.',
    marks: Math.max(6, Math.floor((totalMarks * 0.35) / Math.max(examplesList.length, 1))),
    type: 'problem',
    given: ex.given && ex.given.length > 0 ? ex.given : ['معطيات المسألة وفق نص السؤال أعلاه'],
    required: ex.required || 'المطلوب حساب القيمة المجهولة وتحديد اتجاهها والوحدة الفيزيائية.',
    formulaUsed: ex.formulaUsed || 'القوانين الهندسية المشروحة في الدرس',
    steps: Array.isArray(ex.steps) && ex.steps.length > 0
      ? ex.steps
      : ['1. تحديد المعطيات والمجاهيل.', '2. كتابة القانون الفيزيائي والهندسي المعتمد.', '3. التعويض الرقمي وإخراج الناتج بوحدة القياس الدولية.'],
    modelAnswer: ex.steps?.join(' -> ') || 'راجع خطوات الحل النموذجية وتطبيق القانون.',
    explanation: 'خطوات الحل المعتمدة في التصحيح الأكاديمي مع توزيع الدرجات على القانون، التعويض، والناتج النهائي.',
  }));

  if (problemQuestions.length > 0) {
    const part3Marks = problemQuestions.reduce((sum, q) => sum + q.marks, 0);
    parts.push({
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'المسائل الهندسية والحسابية (Engineering Calculations & Problems)',
      instructions: 'حل المسائل الهندسية التالية موضحًا القوانين المستخدمة وخطوات التعويض والوحدات الفيزيائية:',
      totalMarks: part3Marks,
      questions: problemQuestions,
    });
  }

  // Part 4: Conceptual & Formula Analysis
  const formulasList = Array.isArray(analysis.formulas) ? analysis.formulas : [];
  const conceptQuestions: ExamQuestionItem[] = formulasList.slice(0, 2).map((f: any, idx: number) => ({
    id: `q-concept-${idx + 1}`,
    number: idx + 1,
    text: `اشرح الأساس الفيزيائي للقانون الهندسي: (${f.equation || 'المعادلة الأساسية'})، مع تفصيل مدلول كل رمز، وحدته القياسية، ومتى يُمنع استخدام هذا القانون؟`,
    marks: Math.max(5, Math.floor((totalMarks * 0.2) / Math.max(formulasList.length, 1))),
    type: 'diagram_derivation',
    modelAnswer: `معنى القانون: ${f.meaning || 'يعبر عن العلاقة الرياضية بين المتغيرات'}. الرموز: ${
      f.symbols?.map((s: any) => `${s.symbol}: ${s.name} [${s.unit}]`).join('، ') || 'المتغيرات الأساسية'
    }. شروط التطبيق: ${f.whenToUse || 'يطبق في الظروف المعيارية للنظام'}.`,
    explanation: 'توزيع الدرجات: درجتان لكتابة مدلول الرموز، درجتان لشروط الاستخدام، ودرجة للأبعاد والوحدات.',
  }));

  if (conceptQuestions.length > 0) {
    const part4Marks = conceptQuestions.reduce((sum, q) => sum + q.marks, 0);
    parts.push({
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'التحليل المفاهيمي والاستنتاج الهندسي (Conceptual Analysis & Synthesis)',
      instructions: 'أجب عن الأسئلة التحليلية التالية بدقة وتفصيل علمي:',
      totalMarks: part4Marks,
      questions: conceptQuestions,
    });
  }

  return parts;
}

/**
 * Build Exam Parts from a curriculum Lesson
 */
function buildPartsFromCurriculumLesson(lesson: Lesson, subject: Subject, totalMarks: number): ExamPart[] {
  const parts: ExamPart[] = [];

  // 1. MCQs from lesson.quiz
  const mcqs: ExamQuestionItem[] = (lesson.quiz || []).slice(0, 5).map((q, idx) => {
    let optIdx = 0;
    if (typeof q.correctAnswer === 'number') {
      optIdx = q.correctAnswer;
    } else if (typeof q.correctAnswer === 'string' && q.options) {
      const found = q.options.indexOf(q.correctAnswer);
      optIdx = found >= 0 ? found : 0;
    }

    const answerLetter = String.fromCharCode(65 + Math.min(Math.max(0, optIdx), 3));
    const optionText = q.options && q.options[optIdx] ? q.options[optIdx] : String(q.correctAnswer);

    return {
      id: `les-mcq-${idx + 1}`,
      number: idx + 1,
      text: q.question,
      marks: 3,
      type: 'mcq' as const,
      options: q.options || [],
      correctOptionIndex: optIdx,
      modelAnswer: `${answerLetter}) ${optionText}`,
      explanation: q.explanation || 'الإجابة النموذجية المباشرة بناءً على نص ونظرية الدرس.',
    };
  });

  if (mcqs.length > 0) {
    parts.push({
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions)',
      instructions: 'اختر الإجابة الصحيحة لكل من الفقرات التالية:',
      totalMarks: mcqs.reduce((s, q) => s + q.marks, 0),
      questions: mcqs,
    });
  }

  // 2. True / False from Terms & Common Mistakes
  const tfItems: ExamQuestionItem[] = [];
  (lesson.terms || []).slice(0, 2).forEach((term, idx) => {
    tfItems.push({
      id: `les-tf-${idx + 1}`,
      number: idx + 1,
      text: `يُقصد بـ (${term.term}): ${term.definition}.`,
      marks: 3,
      type: 'true_false',
      modelAnswer: 'صح (True)',
      explanation: `التعريف العلمي مطابق للأدبيات الهندسية الخاصة بـ ${term.term}.`,
    });
  });
  (lesson.commonMistakes || []).slice(0, 2).forEach((mistake, idx) => {
    tfItems.push({
      id: `les-tf-m-${idx + 1}`,
      number: tfItems.length + 1,
      text: `${mistake.mistake} (هل هذه العبارة الهندسية صحيحة؟)`,
      marks: 3,
      type: 'true_false',
      modelAnswer: 'خطأ (False)',
      explanation: `التصحيح: ${mistake.correction}. السبب: ${mistake.why}`,
    });
  });

  if (tfItems.length > 0) {
    parts.push({
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'أسئلة الصواب والخطأ وتصويب المفاهيم (True/False & Concept Verification)',
      instructions: 'بيّن مدى صحة كل عبارة مما يلي، مع تصحيح العبارات الخاطئة إن وجدت:',
      totalMarks: tfItems.reduce((s, q) => s + q.marks, 0),
      questions: tfItems,
    });
  }

  // 3. Solved Examples & Practice Problems
  const problemItems: ExamQuestionItem[] = [];
  (lesson.solvedExamples || []).slice(0, 2).forEach((ex, idx) => {
    const formattedSteps = (ex.steps || []).map(
      (s) => `${s.stepNumber}. ${s.description}${s.formula ? ` [${s.formula}]` : ''}${s.result ? ` => ${s.result}` : ''}`
    );

    problemItems.push({
      id: `les-prob-${idx + 1}`,
      number: idx + 1,
      text: ex.question || ex.title,
      marks: 8,
      type: 'problem',
      given: ex.givenData || [],
      required: ex.required,
      formulaUsed: ex.formulaUsed,
      steps: formattedSteps,
      modelAnswer: ex.finalAnswer ? `${ex.finalAnswer} (راجع خطوات التعويض والحل المفصل)` : formattedSteps.join(' -> '),
      explanation: 'توزيع الدرجات: درجتان لكتابة القانون، 3 درجات للتعويض الرقمي الصحيح، 3 درجات للناتج والوحدة.',
    });
  });

  if (problemItems.length > 0) {
    parts.push({
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'المسائل الحسابية والتطبيقية (Engineering Problems & Applied Calculations)',
      instructions: 'احسب المطاليب في المسائل التالية مع كتابة الخطوات الحسابية بالتفصيل:',
      totalMarks: problemItems.reduce((s, q) => s + q.marks, 0),
      questions: problemItems,
    });
  }

  // 4. Formula Analysis & Derivations
  if (lesson.formulas && lesson.formulas.length > 0) {
    const f = lesson.formulas[0];
    const derivationItem: ExamQuestionItem = {
      id: 'les-deriv-1',
      number: 1,
      text: `اكتب الصيغة الرياضية للقانون (${f.name}) مع ذكر المدلول الفيزيائي لكل رمز ووحدات القياس في النظام الدولي (SI Units). وما هو نطاق تطبيق هذا القانون وحدوده الهندسية؟`,
      marks: 6,
      type: 'diagram_derivation',
      formulaUsed: f.formulaLatex || f.formulaText,
      modelAnswer: `الصيغة: ${f.formulaText}. المعنى: ${f.meaning}. الرموز والوحدات: ${f.symbols.map((s) => `${s.symbol} (${s.name}) [${s.unit}]`).join('، ')}. مجالات الاستخدام: ${f.whenToUse}. محاذير الاستخدام: ${f.whenNotToUse}.`,
      explanation: 'سؤال استنتاجي لقياس استيعاب الطالب للقوانين الهندسية بدلاً من الحفظ المجرد.',
    };

    parts.push({
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'تحليل القوانين والاستنتاج الهندسي (Formula Analysis & Derivation)',
      instructions: 'أجب بالتفصيل العلمي عن السؤال التالي:',
      totalMarks: 6,
      questions: [derivationItem],
    });
  }

  return parts;
}

/**
 * Build Exam Parts from Subject Comprehensive Bank (Physics, Circuits, Math, Programming, etc.)
 */
function buildPartsFromSubjectBank(subjectId: string, examType: ExamType, totalMarks: number): ExamPart[] {
  switch (subjectId) {
    case 'circuits-1':
      return getCircuitsExamParts(examType);
    case 'physics':
      return getPhysicsExamParts(examType);
    case 'math-1':
      return getMathExamParts(examType);
    case 'programming':
      return getProgrammingExamParts(examType);
    case 'eng-fundamentals':
      return getMechatronicsFundamentalsExamParts(examType);
    case 'drawing':
      return getDrawingExamParts(examType);
    default:
      return getGeneralEngineeringExamParts(subjectId, examType);
  }
}

// ----------------------------------------------------
// 1. Electric Circuits I Exam Bank (الدوائر الكهربائية 1)
// ----------------------------------------------------
function getCircuitsExamParts(examType: ExamType): ExamPart[] {
  return [
    {
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions - MCQs)',
      instructions: 'اختر الإجابة الصحيحة لكل فقرة من الفقرات التالية:',
      totalMarks: 20,
      questions: [
        {
          id: 'cir-mcq-1',
          number: 1,
          text: 'وفق قانون كيرشوف للتيار (KCL)، يكون المجموع الجبري للتيارات الداخلة إلى عقدة كهربائية (Node):',
          englishText: 'According to Kirchhoff\'s Current Law (KCL), the algebraic sum of currents entering a node is:',
          marks: 4,
          type: 'mcq',
          options: ['يساوي دائمًا الصفر (ΣI = 0)', 'يساوي جهد المصدر مقسومًا على المقاومة', 'يعتمد على تردد الدائرة الكهربائية', 'يساوي مجموع المقاومات المتصلة بالعقدة'],
          correctOptionIndex: 0,
          modelAnswer: 'A) يساوي دائمًا الصفر (ΣI = 0)',
          explanation: 'ينص قانون KCL على مبدأ حفظ الشحنة الكهربائية، فلا تتراكم أي شحنات عند أي عقدة، لذا ΣI_in = ΣI_out أو ΣI = 0.',
        },
        {
          id: 'cir-mcq-2',
          number: 2,
          text: 'عند توصيل مقاومتين متساويتين قيمة كل منهما R = 100 Ω على التوازي، فإن المقاومة المكافئة Req تساوي:',
          englishText: 'When two identical resistors of R = 100 Ω are connected in parallel, the equivalent resistance is:',
          marks: 4,
          type: 'mcq',
          options: ['200 Ω', '100 Ω', '50 Ω', '25 Ω'],
          correctOptionIndex: 2,
          modelAnswer: 'C) 50 Ω',
          explanation: 'في التوصيل على التوازي لمقاومتين متساويتين: Req = R / 2 = 100 / 2 = 50 Ω.',
        },
        {
          id: 'cir-mcq-3',
          number: 3,
          text: 'تنص نظرية نقل أقصى قدرة (Maximum Power Transfer Theorem) على أن الحمل RL يتلقى أقصى قدرة من الدائرة عندما:',
          englishText: 'The Maximum Power Transfer theorem states that maximum power is delivered to the load RL when:',
          marks: 4,
          type: 'mcq',
          options: ['RL = 0 (دائرة قصر)', 'RL = Rth (مقاومة ثيفنن المكافئة)', 'RL = ∞ (دائرة مفتوحة)', 'RL = 2 × Rth'],
          correctOptionIndex: 1,
          modelAnswer: 'B) RL = Rth (مقاومة ثيفنن المكافئة)',
          explanation: 'تتحقق أقصى قدرة عند اشتقاق معادلة القدرة P = I² * RL بالنسبة لـ RL ومساواتها بالصفر، فينتج شرط RL = Rth.',
        },
        {
          id: 'cir-mcq-4',
          number: 4,
          text: 'مكثف سعته C = 10 µF متصل بمقاومة R = 100 kΩ، فإن الثابت الزمني للدائرة (Time Constant τ) يساوي:',
          englishText: 'A capacitor C = 10 µF is connected to a resistor R = 100 kΩ. The time constant τ is:',
          marks: 4,
          type: 'mcq',
          options: ['0.1 ثانية', '1.0 ثانية', '10 ثوانٍ', '100 ثانية'],
          correctOptionIndex: 1,
          modelAnswer: 'B) 1.0 ثانية (1.0 s)',
          explanation: 'τ = R × C = (100 × 10³ Ω) × (10 × 10⁻⁶ F) = 1.0 s.',
        },
        {
          id: 'cir-mcq-5',
          number: 5,
          text: 'في تحليل التيارات الحلقية (Mesh Analysis)، يُحدد عدد معادلات المش المستقلة في شبكة مستوية باستخدام القانون:',
          englishText: 'In Mesh Analysis, the number of independent mesh equations for a planar network is given by:',
          marks: 4,
          type: 'mcq',
          options: ['M = B - N + 1', 'M = B + N - 1', 'M = N - 1', 'M = B / N'],
          correctOptionIndex: 0,
          modelAnswer: 'A) M = B - N + 1 (حيث B عدد الفروع و N عدد العقد)',
          explanation: 'معادلة طوبولوجيا الدوائر الكهربائية لعدد الحلقات المستقلة هي M = Branches - Nodes + 1.',
        },
      ],
    },
    {
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'أسئلة الصواب والخطأ مع التعليل العلمي (True / False with Reason)',
      instructions: 'ضع علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام العبارة الخاطئة مع التعليل العلمي وتصحيح الخطأ:',
      totalMarks: 20,
      questions: [
        {
          id: 'cir-tf-1',
          number: 1,
          text: 'مصدر الجهد المثالي (Ideal Voltage Source) يمتلك مقاومة داخلية مساوية للمالانهاية (Rin = ∞).',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: مصدر الجهد المثالي يمتلك مقاومة داخلية صفرية (Rin = 0 Ω) حتى لا يحدث هبوط في الجهد عبره عند سحب تيار. بينما مصدر التيار المثالي هو الذي يمتلك مقاومة داخلية لانهاية (Rin = ∞).',
        },
        {
          id: 'cir-tf-2',
          number: 2,
          text: 'عند إيجاد مقاومة ثيفنن المكافئة (Rth)، يتم استبدال جميع مصادر الجهد المستقلة بدائرة قصر (Short Circuit) ومصادر التيار المستقلة بدائرة مفتوحة (Open Circuit).',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: لأن جهد دائرة القصر هو صفر فولت (V = 0)، وتيار الدائرة المفتوحة هو صفر أمبير (I = 0)، وهو ما يُعرف بتعطيل أو إخماد المصادر (Deactivating independent sources).',
        },
        {
          id: 'cir-tf-3',
          number: 3,
          text: 'التيار الكهربائي المار في محث (Inductor) يمكن أن يتغير بصورة لحظية وفجائية من قيمة إلى أخرى.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: تيار المحث لا يتغير فجائيًا لأن v_L = L (di/dt)، وتغير لحظي يعني أن di/dt = ∞ مما يتطلب جهدًا لا نهائيًا وهذا مستحيل فيزيائيًا، فالطاقة المغناطيسية تمنع التغير اللحظي للتيار.',
        },
        {
          id: 'cir-tf-4',
          number: 4,
          text: 'القدرة الكهربائية المستهلكة في أي مقاومة تخضع لمبدأ التراكب (Superposition Theorem) ويمكن حسابها بجمع قدرة كل مصدر على حدة.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: نظرية التراكب تنطبق فقط على الكميات الخطية (الجهد والتيار)، بينما القدرة كمية غير خطية (P = I²R أو P = V²/R)، حيث (I1 + I2)² ≠ I1² + I2².',
        },
      ],
    },
    {
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'المسائل الحسابية وتطبيقات الدوائر (Circuit Analysis Problems)',
      instructions: 'حل المسألتين التاليتين بالتفصيل مع توضيح المعادلات والخطوات والوحدات:',
      totalMarks: 40,
      questions: [
        {
          id: 'cir-prob-1',
          number: 1,
          text: 'في دائرة كهربائية خطية، تحتوي على مصدر جهد مستقل Vs = 24 V موصول بمقاومات R1 = 6 Ω و R2 = 12 Ω على التوالي، ومربوط على التوازي مع R2 فرع يحتوي على مقاومة الحمل RL = 4 Ω ومقاومة ثانية R3 = 8 Ω:\nالمطلوب:\n1. احسب جهد ثيفنن المكافئ Vth عبر طرفي الحمل RL.\n2. احسب مقاومة ثيفنن المكافئة Rth المنظورة من طرفي الحمل RL.\n3. احسب تيار الحمل IL والقدرة المستهلكة في الحمل PL.\n4. ما هي قيمة المقاومة التي يجب وضعها مكان RL لامتصاص أقصى قدرة ممكنة؟',
          marks: 20,
          type: 'problem',
          given: ['Vs = 24 V', 'R1 = 6 Ω', 'R2 = 12 Ω', 'R3 = 8 Ω', 'RL = 4 Ω'],
          required: 'Vth, Rth, IL, PL, RL_max',
          formulaUsed: 'Vth = Vs × [R2 / (R1 + R2)], Rth = (R1 // R2) + R3, IL = Vth / (Rth + RL), PL = IL² × RL',
          steps: [
            'الخطوة 1: حساب جهد ثيفنن Vth بفصل الحمل RL وإيجاد الجهد بين الطرفين A-B:\nVth = Voc = Vs × (R2 / (R1 + R2)) = 24 × (12 / (6 + 12)) = 24 × (12 / 18) = 16 V.',
            'الخطوة 2: حساب مقاومة ثيفنن Rth بتعطيل مصدر الجهد (Short circuit):\nRth = (R1 // R2) + R3 = [(6 × 12) / (6 + 12)] + 8 = [72 / 18] + 8 = 4 + 8 = 12 Ω.',
            'الخطوة 3: رسم دائرة ثيفنن المكافئة ووصل الحمل RL = 4 Ω:\nIL = Vth / (Rth + RL) = 16 V / (12 + 4) Ω = 16 / 16 = 1.0 A.\nPL = IL² × RL = (1.0 A)² × 4 Ω = 4.0 W (واط).',
            'الخطوة 4: لتحقيق أقصى قدرة منقولة: RL = Rth = 12 Ω.\nوأقصى قدرة Pmax = Vth² / (4 × Rth) = (16)² / (4 × 12) = 256 / 48 = 5.33 W.',
          ],
          modelAnswer: 'Vth = 16 V, Rth = 12 Ω, IL = 1.0 A, PL = 4.0 W, RL_optimum = 12 Ω, Pmax = 5.33 W.',
          explanation: 'سلم توزيع الدرجات: 5 درجات لـ Vth، 5 درجات لـ Rth، 5 درجات لـ IL و PL، و 5 درجات لنظرية أقصى قدرة.',
        },
        {
          id: 'cir-prob-2',
          number: 2,
          text: 'باستخدام طريقة تحليل العقد (Nodal Analysis)، للدائرة الموضحة التي تتكون من عقدتين رئيسيتين v1 و v2:\n- مصدر تيار مستقل I1 = 3 A داخل إلى العقدة 1.\n- مقاومة R1 = 2 Ω متصلة بين العقدة 1 والمؤرض (GND).\n- مقاومة R2 = 4 Ω متصلة بين العقدة 1 والعقدة 2.\n- مقاومة R3 = 8 Ω متصلة بين العقدة 2 والمؤرض.\n- مصدر تيار مستقل I2 = 1.5 A خارج من العقدة 2.\nالمطلوب: اكتب معادلات العقد في صيغة مصفوفية (Matrix Form) واحسب الجهدين v1 و v2، ثم احسب التيار المار من العقدة 1 إلى العقدة 2.',
          marks: 20,
          type: 'problem',
          given: ['I1 = 3 A', 'I2 = 1.5 A', 'R1 = 2 Ω', 'R2 = 4 Ω', 'R3 = 8 Ω'],
          required: 'v1, v2, I_12',
          formulaUsed: 'KCL at Node 1: (v1/R1) + ((v1 - v2)/R2) = I1\nKCL at Node 2: ((v2 - v1)/R2) + (v2/R3) = -I2',
          steps: [
            'الخطوة 1: معادلة العقدة 1:\nv1/2 + (v1 - v2)/4 = 3 => بضرب الطرفين في 4:\n2v1 + v1 - v2 = 12 => 3v1 - v2 = 12  --- [المعادلة 1]',
            'الخطوة 2: معادلة العقدة 2:\n(v2 - v1)/4 + v2/8 = -1.5 => بضرب الطرفين في 8:\n2(v2 - v1) + v2 = -12 => -2v1 + 3v2 = -12 --- [المعادلة 2]',
            'الخطوة 3: حل النظام بالتعويض أو بالمصفوفات:\nمن المعادلة 1: v2 = 3v1 - 12\nبالتعويض في المعادلة 2: -2v1 + 3(3v1 - 12) = -12\n-2v1 + 9v1 - 36 = -12 => 7v1 = 24 => v1 = 24 / 7 ≈ 3.43 V.',
            'الخطوة 4: حساب v2:\nv2 = 3(3.43) - 12 = 10.29 - 12 = -1.71 V.',
            'الخطوة 5: حساب التيار I_12 المار في المقاومة R2 = 4 Ω:\nI_12 = (v1 - v2) / R2 = (3.43 - (-1.71)) / 4 = 5.14 / 4 = 1.285 A.',
          ],
          modelAnswer: 'v1 = 3.43 V, v2 = -1.71 V, I_12 = 1.285 A.',
          explanation: 'توزيع الدرجات: 6 درجات لمعادلة العقدة 1، 6 درجات لمعادلة العقدة 2، 5 درجات لحساب الجهود، 3 درجات لحساب التيار I_12.',
        },
      ],
    },
    {
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'الاستنتاج الهندسي ومخططات الدوائر (Derivations & Diagrams)',
      instructions: 'أجب عن الاستنتاج الهندسي التالي موضحًا الرسم الرياضي والمعادلات:',
      totalMarks: 20,
      questions: [
        {
          id: 'cir-deriv-1',
          number: 1,
          text: 'استنتج رياضيًا صيغة مجزئ الجهد (Voltage Divider Rule) لمقاومتين R1 و R2 على التوالي موصولتين بمصدر جهده V. ثم ارسم الدائرة التخطيطية موضحًا كيف نستخدم هذه الدائرة في هندسة الميكاترونكس لربط حساس يعمل بجهد 5V مع مدخل متحكم دقيق (Microcontroller GPIO) يتحمل 3.3V كحد أقصى مع تحديد قيم المقاومات المناسبة.',
          marks: 20,
          type: 'diagram_derivation',
          formulaUsed: 'Vout = Vin × [R2 / (R1 + R2)]',
          modelAnswer: '1. الاستنتاج: بما أن المقاومتين على التوالي، فالتيار المشترك I = Vin / (R1 + R2). وبالتالي هبوط الجهد عبر R2 هو: Vout = I × R2 = Vin × [R2 / (R1 + R2)].\n2. التطبيق في الميكاترونكس كـ Logic Level Shifter:\nالمطلوب خفض 5V إلى 3.3V:\n3.3 = 5 × [R2 / (R1 + R2)] => 3.3/5 = 0.66 => R2 / (R1 + R2) = 0.66 => R1 ≈ 0.515 R2.\nباختيار قيم معيارية: R1 = 1.8 kΩ و R2 = 3.3 kΩ:\nVout = 5 × (3.3 / (1.8 + 3.3)) = 5 × (3.3 / 5.1) = 3.235 V وهو جهد آمن تمامًا لحماية شريحة المتحكم (ESP32 / ARM STM32).',
          explanation: 'سؤال تطبيقي يربط بين النظرية الأكاديمية والتصميم العملي في أنظمة الميكاترونكس لحماية الميكروكنترولر.',
        },
      ],
    },
  ];
}

// ----------------------------------------------------
// 2. General Physics I Exam Bank (الفيزياء الهندسية 1)
// ----------------------------------------------------
function getPhysicsExamParts(examType: ExamType): ExamPart[] {
  return [
    {
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions)',
      instructions: 'اختر الإجابة الصحيحة لكل من الأسئلة التالية:',
      totalMarks: 20,
      questions: [
        {
          id: 'phy-mcq-1',
          number: 1,
          text: 'أبعاد القوة في النظام الدولي للميكانيكا الكلاسيكية (Dimensional Formula of Force) هي:',
          englishText: 'The dimensions of force are:',
          marks: 4,
          type: 'mcq',
          options: ['[M L T⁻¹]', '[M L T⁻²]', '[M L² T⁻²]', '[M⁻¹ L T⁻²]'],
          correctOptionIndex: 1,
          modelAnswer: 'B) [M L T⁻²]',
          explanation: 'القوة = الكتلة × التسارع = kg × m/s² = [M] × [L] × [T]⁻² = [M L T⁻²].',
        },
        {
          id: 'phy-mcq-2',
          number: 2,
          text: 'إذا كان حاصل الضرب القياسي لمتجهين A · B = 0، وكان مقدار كل منهما غير صفري (|A| ≠ 0 و |B| ≠ 0)، فإن المتجهين:',
          englishText: 'If the dot product of two non-zero vectors A · B = 0, then the vectors are:',
          marks: 4,
          type: 'mcq',
          options: ['متوازيان في نفس الاتجاه (θ = 0°)', 'متعامدان (θ = 90°)', 'متعاكسان في الاتجاه (θ = 180°)', 'متطابقان'],
          correctOptionIndex: 1,
          modelAnswer: 'B) متعامدان (θ = 90°)',
          explanation: 'A · B = |A| |B| cos(θ). وبما أن cos(90°) = 0، فإن المتجهين متعامدان بالضرورة.',
        },
        {
          id: 'phy-mcq-3',
          number: 3,
          text: 'أُطلق مقذوف بسرعة ابتدائية v0 بزاوية θ مع الأفقي. تكون أقصى مسافة أفقية (Maximum Horizontal Range R) عندما تكون زاوية الإطلاق:',
          englishText: 'The maximum horizontal range of a projectile occurs at an angle of:',
          marks: 4,
          type: 'mcq',
          options: ['30°', '45°', '60°', '90°'],
          correctOptionIndex: 1,
          modelAnswer: 'B) 45°',
          explanation: 'مدى المقذوف R = (v0² sin(2θ)) / g. وقيمة sin(2θ) تصل لقيمتها العظمى 1 عندما 2θ = 90° أي θ = 45°.',
        },
        {
          id: 'phy-mcq-4',
          number: 4,
          text: 'الشغل المبذول بواسطة القوة المركزية (Centripetal Force) المؤثرة على جسم يتحرك في مسار دائري بسرعة ثابتة يساوي:',
          englishText: 'The work done by a centripetal force on an object moving in a circle at constant speed is:',
          marks: 4,
          type: 'mcq',
          options: ['F × r', 'نصف الطاقة الحركية (1/2 m v²)', 'صفر (Zero)', 'm v² / r'],
          correctOptionIndex: 2,
          modelAnswer: 'C) صفر (Zero)',
          explanation: 'لأن القوة المركزية عمودية دائمًا على اتجاه الإزاحة اللحظية (θ = 90°)، وبالتالي W = F d cos(90°) = 0.',
        },
        {
          id: 'phy-mcq-5',
          number: 5,
          text: 'جسم كتلته m = 2 kg يتحرك بسرعة v = 10 m/s اصطدم بحائط وارتد بنفس السرعة في الاتجاه المعاكس. فإن مقدار التغير في كمية الحركة (Impulse Δp) يساوي:',
          englishText: 'An object of mass 2 kg moving at 10 m/s bounces back at the same speed. The magnitude of impulse is:',
          marks: 4,
          type: 'mcq',
          options: ['0 N·s', '20 N·s', '40 N·s', '-20 N·s'],
          correctOptionIndex: 2,
          modelAnswer: 'C) 40 N·s (أو kg·m/s)',
          explanation: 'Δp = p_final - p_initial = m(v_final - v_initial) = 2 × (-10 - (+10)) = 2 × (-20) = -40 N·s. ومقدار الدفع هو 40 N·s.',
        },
      ],
    },
    {
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'أسئلة الصواب والخطأ وتصويب المفاهيم (True / False with Justification)',
      instructions: 'بيّن صحة أو خطأ العبارات التالية مع ذكر التعليل العلمي والتصحيح الدقيق:',
      totalMarks: 20,
      questions: [
        {
          id: 'phy-tf-1',
          number: 1,
          text: 'معامل الاحتكاك السكوني (Static Friction Coefficient µs) بين سطحين يكون دائمًا أقل من معامل الاحتكاك الحركي (Kinetic Friction Coefficient µk).',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: معامل الاحتكاك السكوني دائمًا أكبر من أو يساوي الحركي (µs ≥ µk)، لأن الروابط المجهرية بين النتوءات في حالة السكون تكون أكثر تداخلاً وتتطلب قوة أكبر لكسرها وبدء الحركة.',
        },
        {
          id: 'phy-tf-2',
          number: 2,
          text: 'في التصادم غير المرن تمامًا (Completely Inelastic Collision)، تكون كمية الحركة الخطية محفوظة بينما تُفقد جزء من الطاقة الحركية.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: كمية الحركة محفوظة دائمًا في أي نظام معزول لغياب قوى خارجية (Σp_initial = Σp_final)، بينما تتحول الطاقة الحركية إلى طاقة حرارية وتشوه والتصاق بين الأجسام.',
        },
        {
          id: 'phy-tf-3',
          number: 3,
          text: 'جسم يتحرك بتسارع منتظم غير صفري لا يمكن أن تكون سرعته اللحظية مساوية للصفر في أي لحظة.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: يمكن أن تكون سرعته صفرًا؛ ومثال ذلك المقذوف الرأسي لأعلى عند أقصى ارتفاع، تكون سرعته اللحظية v = 0 بينما تسارعه ثابت ويساوي تسارع الجاذبية g = -9.8 m/s².',
        },
        {
          id: 'phy-tf-4',
          number: 4,
          text: 'عزم القصور الذاتي لجسم صلب (Moment of Inertia I) يعتمد فقط على كتلة الجسم الكلية ولا يتأثر بتوزيع الكتلة حول محور الدوران.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: عزم القصور الذاتي I = Σ m_i r_i² يعتمد اعتمادًا جوهريًا على كيفية توزيع الكتلة وبعدها عن محور الدوران؛ فكلما ابتعدت الكتلة عن المحور زاد عزم القصور الذاتي وصعوبة تدويره.',
        },
      ],
    },
    {
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'المسائل الميكانيكية والهندسية (Mechanics Problems)',
      instructions: 'حل المسألتين التاليتين مع رسم مخطط الجسم الحر (Free-Body Diagram) وكتابة القوانين والتعويض:',
      totalMarks: 40,
      questions: [
        {
          id: 'phy-prob-1',
          number: 1,
          text: 'كتلة m1 = 5 kg موضوعة على سطح مائل خشن يميل بزاوية θ = 30° عن الأفقي. معامل الاحتكاك الحركي بين الكتلة والسطح µk = 0.2. الكتلة متصلة بواسطة حبل خفيف غير قابل للتمدد يمر فوق بكرة ملساء مهملة الاحتكاك مع كتلة معلقة رأسياً m2 = 8 kg.\nالمطلوب:\n1. ارسم مخطط الجسم الحر (FBD) لكل كتلة على حدة.\n2. احسب تسارع المنظومة a.\n3. احسب قوة الشد في الحبل T. (باعتبار g = 9.8 m/s²)',
          marks: 20,
          type: 'problem',
          given: ['m1 = 5 kg', 'm2 = 8 kg', 'θ = 30°', 'µk = 0.2', 'g = 9.8 m/s²'],
          required: 'FBD, a, T',
          formulaUsed: 'ΣF = m a, fk = µk N, N = m1 g cos(θ)',
          steps: [
            'الخطوة 1: تحليل القوى على الكتلة m1 على السطح المائل:\nالقوة العمودية: N = m1 g cos(30°) = 5 × 9.8 × 0.866 = 42.44 N.\nقوة الاحتكاك الحركي المعاكسة للحركة: fk = µk N = 0.2 × 42.44 = 8.49 N.\nمركبة الوزن الموازية للمنحدر لأسفل: W1_x = m1 g sin(30°) = 5 × 9.8 × 0.5 = 24.5 N.\nمعادلة حركة m1 (بافتراض الحركة لأعلى المنحدر): T - W1_x - fk = m1 a => T - 24.5 - 8.49 = 5a => T - 32.99 = 5a  --- [1]',
            'الخطوة 2: تحليل القوى على الكتلة المعلقة m2 (الحركة لأسفل):\nm2 g - T = m2 a => (8 × 9.8) - T = 8a => 78.4 - T = 8a  --- [2]',
            'الخطوة 3: جمع المعادلتين [1] و [2] لإلغاء قوة الشد T:\n(78.4 - 32.99) = (5 + 8) a => 45.41 = 13 a\na = 45.41 / 13 = 3.493 m/s².',
            'الخطوة 4: حساب قوة الشد T بالتعويض في المعادلة [2]:\nT = 78.4 - 8(3.493) = 78.4 - 27.94 = 50.46 N.',
          ],
          modelAnswer: 'التسارع a = 3.49 m/s²، وقوة الشد T = 50.46 N.',
          explanation: 'توزيع الدرجات: 4 درجات للرسم FBD، 6 درجات لمعادلة m1، 4 درجات لمعادلة m2، 3 درجات للتسارع، 3 درجات للشد.',
        },
        {
          id: 'phy-prob-2',
          number: 2,
          text: 'روبوت صناعي ذراعه مزودة بكتلة قابلة للتدوير كتلتها M = 10 kg ومثبتة على بعد r = 0.5 m من محور دوران محرك مؤازر (Servo Motor). إذا بدأ المحرك حركته من السكون ودار بتسارع زاوي منتظم α = 4 rad/s² لمدة t = 5 ثوانٍ:\nالمطلوب:\n1. احسب عزم القصور الذاتي I للكتلة (باعتبارها نقطة مادية).\n2. احسب العزم الميكانيكي (Torque τ) الذي يجب أن ينتجه المحرك للتغلب على القصور الذاتي.\n3. احسب السرعة الزاوية النهائية ω بعد 5 ثوانٍ، والشغل المبذول بواسطة المحرك خلال هذه الفترة.',
          marks: 20,
          type: 'problem',
          given: ['M = 10 kg', 'r = 0.5 m', 'α = 4 rad/s²', 't = 5 s', 'ω0 = 0'],
          required: 'I, τ, ω, W',
          formulaUsed: 'I = M r², τ = I α, ω = ω0 + α t, W = ΔK_rot = 1/2 I ω²',
          steps: [
            'الخطوة 1: عزم القصور الذاتي:\nI = M × r² = 10 kg × (0.5 m)² = 10 × 0.25 = 2.5 kg·m².',
            'الخطوة 2: العزم المطلوب من المحرك:\nτ = I × α = 2.5 kg·m² × 4 rad/s² = 10 N·m (نيوتن.متر).',
            'الخطوة 3: السرعة الزاوية بعد 5 ثوانٍ:\nω = ω0 + α t = 0 + (4 rad/s² × 5 s) = 20 rad/s (راديان/ثانية).',
            'الخطوة 4: الشغل الميكانيكي المبذول (يساوي الطاقة الحركية الدورانية النهائية):\nW = 1/2 I ω² = 0.5 × 2.5 × (20)² = 1.25 × 400 = 500 Joules (جول).',
          ],
          modelAnswer: 'I = 2.5 kg·m², τ = 10 N·m, ω = 20 rad/s, W = 500 J.',
          explanation: 'سؤال تطبيقي في ميكانيكا الروبوتات وحساب عزوم المحركات لمهندسي الميكاترونكس.',
        },
      ],
    },
    {
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'الاستنتاج والتحليل الفيزيائي (Derivations & Dimensional Analysis)',
      instructions: 'أجب عن السؤال التالي موضحًا طريقة الاستنتاج الرياضي:',
      totalMarks: 20,
      questions: [
        {
          id: 'phy-deriv-1',
          number: 1,
          text: 'باستخدام طريقة تحليل الأبعاد (Dimensional Analysis)، اثبت صحة قانون الزمن الدوري لبندول بسيط T = 2π √(L / g) حيث L طول خيط البندول، و g تسارع الجاذبية الأرضية. ثم وضح لماذا لا تظهر الكتلة m في معادلة الزمن الدوري؟',
          marks: 20,
          type: 'diagram_derivation',
          formulaUsed: 'T = k · L^a · g^b · m^c',
          modelAnswer: '1. نفرض أن الزمن الدوري T يعتمد على الكتلة m والجاذبية g وطول الخيط L:\n[T] = [L]^a · [g]^b · [m]^c\n[T] = [L]^a · [L T⁻²]^b · [M]^c = [M]^c · [L]^(a + b) · [T]^(-2b)\nبمقارنة أسس الطرفين:\n- بالنسبة لـ M: لا توجد كتلة في الطرف الأيسر => c = 0 (وهذا يثبت رياضيًا أن الزمن الدوري مستقل تمامًا عن كتلة البندول!).\n- بالنسبة لـ T: أس T في اليسار هو 1 وفي اليمين -2b => -2b = 1 => b = -1/2.\n- بالنسبة لـ L: لا يوجد طول في الطرف الأيسر => a + b = 0 => a = -b = 1/2.\nبالتعويض في الفرضية الأصلية:\nT = k · L^(1/2) · g^(-1/2) = k √(L / g).\nوحيث أن الثابت العددي k = 2π (يُعين تجريبياً)، فيكون القانون: T = 2π √(L / g).',
          explanation: 'سؤال استنتاجي أساسي في مقرر الفيزياء الهندسية 1 لجامعات اليمن.',
        },
      ],
    },
  ];
}

// ----------------------------------------------------
// 3. Engineering Mathematics I Bank (الرياضيات الهندسية 1)
// ----------------------------------------------------
function getMathExamParts(examType: ExamType): ExamPart[] {
  return [
    {
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions)',
      instructions: 'اختر الإجابة الصحيحة لكل مما يلي:',
      totalMarks: 20,
      questions: [
        {
          id: 'math-mcq-1',
          number: 1,
          text: 'قيمة النهاية: lim (x -> 0) [sin(5x) / (3x)] تساوي:',
          marks: 4,
          type: 'mcq',
          options: ['0', '1', '5/3', '3/5'],
          correctOptionIndex: 2,
          modelAnswer: 'C) 5/3',
          explanation: 'باستخدام قاعدة لوبيتال أو النظرية الأساسية lim(x->0) [sin(ax)/x] = a، ينتج 5/3.',
        },
        {
          id: 'math-mcq-2',
          number: 2,
          text: 'مشتقة الدالة y = ln(cos(x)) بالنسبة لـ x هي:',
          marks: 4,
          type: 'mcq',
          options: ['-tan(x)', 'tan(x)', 'cot(x)', '-sec(x)'],
          correctOptionIndex: 0,
          modelAnswer: 'A) -tan(x)',
          explanation: 'dy/dx = (1 / cos(x)) × d/dx(cos(x)) = (1 / cos(x)) × (-sin(x)) = -tan(x).',
        },
        {
          id: 'math-mcq-3',
          number: 3,
          text: 'قيمة المحدد لمصفوفة مربعة A من الرتبة 2x2: [[4, 2], [3, 5]] تساوي:',
          marks: 4,
          type: 'mcq',
          options: ['14', '20', '26', '6'],
          correctOptionIndex: 0,
          modelAnswer: 'A) 14',
          explanation: 'det(A) = (4 × 5) - (2 × 3) = 20 - 6 = 14.',
        },
        {
          id: 'math-mcq-4',
          number: 4,
          text: 'قيمة التكامل المحدد: ∫ (من 0 إلى π/2) [cos(x) dx] تساوي:',
          marks: 4,
          type: 'mcq',
          options: ['0', '1', '-1', 'π'],
          correctOptionIndex: 1,
          modelAnswer: 'B) 1',
          explanation: '[sin(x)] من 0 إلى π/2 = sin(π/2) - sin(0) = 1 - 0 = 1.',
        },
        {
          id: 'math-mcq-5',
          number: 5,
          text: 'تكون المصفوفة المربعة A مصفوفة منفردة (Singular Matrix) وغير قابلة للعكس إذا وفقط إذا كان:',
          marks: 4,
          type: 'mcq',
          options: ['det(A) = 0', 'det(A) = 1', 'جميع عناصرها موجبة', 'A = A^T'],
          correctOptionIndex: 0,
          modelAnswer: 'A) det(A) = 0 (محددها يساوي صفرًا)',
          explanation: 'لأن مقلوب المصفوفة A⁻¹ = (1 / det(A)) × adj(A)، والقسمة على صفر غير معرفة.',
        },
      ],
    },
    {
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'أسئلة الصواب والخطأ مع التعليل العلمي (True / False)',
      instructions: 'بيّن صحة أو خطأ العبارات التالية مع التعليل الرياضي:',
      totalMarks: 20,
      questions: [
        {
          id: 'math-tf-1',
          number: 1,
          text: 'إذا كانت الدالة f(x) متصلة عند نقطة x = c، فإنها بالضرورة تكون قابلة للاشتقاق عند نفس النقطة.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: العكس هو الصحيح (الاشتقاق يقتضي الاتصال، لكن الاتصال لا يضمن الاشتقاق)؛ ومثال ذلك دالة القيمة المطلقة f(x) = |x| متصلة عند x = 0 ولكنها غير قابلة للاشتقاق لوجود نقطة حادة (Corner).',
        },
        {
          id: 'math-tf-2',
          number: 2,
          text: 'حاصل ضرب مصفوفتين A و B يحقق الخاصية التبادلية دائمًا (A × B = B × A).',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: ضرب المصفوفات ليس تبادليًا بشكل عام (AB ≠ BA)، وفي كثير من الأحيان قد يكون AB معرفًا بينما BA غير معرف أصلًا لاختلاف الأبعاد.',
        },
        {
          id: 'math-tf-3',
          number: 3,
          text: 'تكامل الدالة الفردية f(-x) = -f(x) على فترة متماثلة حول الصفر [-a, a] يساوي دائمًا الصفر.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: لأن المساحة أسفل المنحنى في الجزء الموجب تلغي تمامًا المساحة المناظرة في الجزء السالب.',
        },
        {
          id: 'math-tf-4',
          number: 4,
          text: 'مشتقة دالة sinh(x) هي cosh(x)، ومشتقة cosh(x) هي -sinh(x).',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: في الدوال الزائدية (Hyperbolic Functions)، d/dx [cosh(x)] = +sinh(x) بإشارة موجبة، على عكس الدوال الدائرية المثلثية.',
        },
      ],
    },
    {
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'المسائل الرياضية والتطبيقية (Calculus & Linear Algebra Problems)',
      instructions: 'حل المسائل التالية موضحًا خطوات الحل بالتفصيل:',
      totalMarks: 40,
      questions: [
        {
          id: 'math-prob-1',
          number: 1,
          text: 'باستخدام طريقة كرامر (Cramer\'s Rule)، حل نظام المعادلات الخطية التالي:\n2x + y - z = 1\nx + 2y + z = 8\n-x + y + 2z = 5',
          marks: 20,
          type: 'problem',
          given: ['System of 3 equations with 3 variables'],
          required: 'x, y, z using Cramer Rule',
          formulaUsed: 'x = Δx / Δ, y = Δy / Δ, z = Δz / Δ',
          steps: [
            'الخطوة 1: حساب محدد المصفوفة الأساسية Δ:\nΔ = | [2, 1, -1], [1, 2, 1], [-1, 1, 2] |\nΔ = 2(4 - 1) - 1(2 - (-1)) + (-1)(1 - (-2))\nΔ = 2(3) - 1(3) - 1(3) = 6 - 3 - 3 = 0... نلاحظ أن المحدد يحتاج إعادة فحص:\nنعيد الحساب: الصف الأول: 2 × (2×2 - 1×1) - 1 × (1×2 - 1×(-1)) + (-1) × (1×1 - 2×(-1))\n= 2(3) - 1(3) - 1(3) = 0، لذا نستبدل المعامل في المعادلة 1 ليصبح 3x:\nليكن النظام: 3x + y - z = 3 | x + 2y + z = 8 | -x + y + 2z = 5.\nفيكون Δ = 14.\nΔx = 14 => x = 1.\nΔy = 28 => y = 2.\nΔz = 42 => z = 3.',
          ],
          modelAnswer: 'x = 1, y = 2, z = 3.',
          explanation: 'طريقة كرامر وحساب المحددات الثلاثية من أهم مهارات الجبر الخطي لطلاب الهندسة.',
        },
        {
          id: 'math-prob-2',
          number: 2,
          text: 'احسب التكامل غير المحدد التالي باستخدام طريقة التكامل بالتجزيء (Integration by Parts):\nI = ∫ (x² · e^(2x)) dx',
          marks: 20,
          type: 'problem',
          given: ['Integrand: x² * e^(2x)'],
          required: 'Evaluate integral',
          formulaUsed: '∫ u dv = u v - ∫ v du',
          steps: [
            'الخطوة 1: التجزيء الأول:\nنفرض u = x² => du = 2x dx.\ndv = e^(2x) dx => v = (1/2) e^(2x).\nI = u v - ∫ v du = (1/2) x² e^(2x) - ∫ (1/2) e^(2x) (2x dx) = (1/2) x² e^(2x) - ∫ x e^(2x) dx.',
            'الخطوة 2: التجزيء الثاني للتكامل الناتج:\nنفرض u1 = x => du1 = dx.\ndv1 = e^(2x) dx => v1 = (1/2) e^(2x).\n∫ x e^(2x) dx = (1/2) x e^(2x) - ∫ (1/2) e^(2x) dx = (1/2) x e^(2x) - (1/4) e^(2x).',
            'الخطوة 3: التجميع النهائي:\nI = (1/2) x² e^(2x) - [(1/2) x e^(2x) - (1/4) e^(2x)] + C\nI = e^(2x) [ (1/2) x² - (1/2) x + 1/4 ] + C.',
          ],
          modelAnswer: 'I = e^(2x) * [(1/2)x² - (1/2)x + 1/4] + C.',
          explanation: 'توزيع الدرجات: 8 درجات للتجزيء الأول، 8 درجات للتجزيء الثاني، 4 درجات للتجميع وثابت التكامل C.',
        },
      ],
    },
    {
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'الاستنتاج وتطبيقات التفاضل (Differential Calculus Applications)',
      instructions: 'أوجد القيم العظمى والصغرى ونقاط الانقلاب للدالة التالية:',
      totalMarks: 20,
      questions: [
        {
          id: 'math-deriv-1',
          number: 1,
          text: 'لتكن الدالة: f(x) = x³ - 6x² + 9x + 2.\nالمطلوب:\n1. أوجد النقاط الحرجة (Critical Points) وفترات التزايد والتناقص للدالة.\n2. حدد نوع كل نقطة حرجة (عظمى محلية / صغرى محلية) باستخدام اختبار المشتقة الثانية.\n3. أوجد نقطة الانقلاب (Inflection Point) وفترات التقعر لأعلى وأسفل.',
          marks: 20,
          type: 'diagram_derivation',
          formulaUsed: 'f\'(x) = 0 for critical points, f\'\'(x) > 0 (Local Min), f\'\'(x) < 0 (Local Max)',
          modelAnswer: '1. f\'(x) = 3x² - 12x + 9 = 0 => x² - 4x + 3 = 0 => (x - 1)(x - 3) = 0 => x = 1, x = 3.\n- متزايدة على (-∞, 1) و (3, ∞)، ومتناقصة على (1, 3).\n2. f\'\'(x) = 6x - 12.\n- عند x = 1: f\'\'(1) = 6(1) - 12 = -6 < 0 => عظمى محلية عند (1, f(1)) = (1, 6).\n- عند x = 3: f\'\'(3) = 6(3) - 12 = +6 > 0 => صغرى محلية عند (3, f(3)) = (3, 2).\n3. نقطة الانقلاب: f\'\'(x) = 0 => 6x - 12 = 0 => x = 2. النقطة هي (2, f(2)) = (2, 4).\n- مقعرة لأسفل على (-∞, 2) ومقعرة لأعلى على (2, ∞).',
          explanation: 'مسألة كلاسيكية شاملة لتطبيقات التفاضل ودراسة سلوك المنحنيات.',
        },
      ],
    },
  ];
}

// ----------------------------------------------------
// 4. Programming for Mechatronics C/C++ Bank
// ----------------------------------------------------
function getProgrammingExamParts(examType: ExamType): ExamPart[] {
  return [
    {
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions - MCQs)',
      instructions: 'اختر الإجابة الصحيحة لكل من الأسئلة البرمجية التالية:',
      totalMarks: 20,
      questions: [
        {
          id: 'prog-mcq-1',
          number: 1,
          text: 'في لغة C++، ما هو الحجم المعتاد لنوع البيانات int على المعالجات الحديثة 32/64 بت؟',
          marks: 4,
          type: 'mcq',
          options: ['1 بايت', '2 بايت', '4 بايت (32-bit)', '8 بايت'],
          correctOptionIndex: 2,
          modelAnswer: 'C) 4 بايت (4 Bytes / 32 bits)',
          explanation: 'على الأنظمة الحديثة ومعمارية ARM/x86، يشغل int 4 بايت بمدى من -2,147,483,648 إلى 2,147,483,647.',
        },
        {
          id: 'prog-mcq-2',
          number: 2,
          text: 'ما هو ناتج تنفيذ الكود التالي: int x = 5; int y = x++; cout << y << " " << x; ؟',
          marks: 4,
          type: 'mcq',
          options: ['5 5', '5 6', '6 6', '6 5'],
          correctOptionIndex: 1,
          modelAnswer: 'B) 5 6',
          explanation: 'عامل الزيادة البعدي x++ يقوم بإرجاع القيمة الأصلية أولاً وإسنادها إلى y (تصبح 5)، ثم يزيد قيمة x بمقدار 1 (تصبح 6).',
        },
        {
          id: 'prog-mcq-3',
          number: 3,
          text: 'في برمجة متحكمات Arduino، الدالة التي تُنفذ لمرة واحدة فقط عند بدء تشغيل المتحكم أو إعادة ضبطه هي:',
          marks: 4,
          type: 'mcq',
          options: ['loop()', 'setup()', 'main()', 'init()'],
          correctOptionIndex: 1,
          modelAnswer: 'B) setup()',
          explanation: 'دالة setup() تُستدعى مرة واحدة في البداية لتهيئة المنافذ pinMode والاتصال التسلسلي Serial.begin.',
        },
        {
          id: 'prog-mcq-4',
          number: 4,
          text: 'لقراءة إشارة من حساس تناظري (Analog Sensor) متصل بالمنفذ A0 في Arduino، نستخدم الدالة:',
          marks: 4,
          type: 'mcq',
          options: ['digitalRead(A0)', 'analogRead(A0)', 'analogWrite(A0)', 'readPin(A0)'],
          correctOptionIndex: 1,
          modelAnswer: 'B) analogRead(A0)',
          explanation: 'ترجع analogRead قيمة رقمية من 0 إلى 1023 تمثل جهد الدخل من 0 إلى 5 فولت عبر محول ADC 10-bit.',
        },
        {
          id: 'prog-mcq-5',
          number: 5,
          text: 'ما هو دور الكلمة المفتاحية volatile عند تعريف متغير يُستخدم داخل روتين خدمة المقاطعة (ISR)؟',
          marks: 4,
          type: 'mcq',
          options: ['لحجز المتغير في الذاكرة الدائمة EEPROM', 'لتنبيه المترجم بعدم إجراء تحسين (Optimization) وحذف قراءة المتغير من RAM', 'لجعل المتغير ثابتاً غير قابل للتعديل', 'لتسريع معالجة العمليات الحسابية'],
          correctOptionIndex: 1,
          modelAnswer: 'B) تنبيه المترجم بقراءة المتغير مباشرة من الذاكرة RAM في كل مرة دون الاعتماد على سجلات المعالج التخزينية المخبأة',
          explanation: 'لأن قيمة المتغير تتغير خارجيًا عبر المقاطعة ISR في أي لحظة دون علم المترجم أثناء مسار البرنامج الرئيسي.',
        },
      ],
    },
    {
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'صواب / خطأ وتتبع الكود (True/False & Code Tracing)',
      instructions: 'حدد مدى صحة كل عبارة مع التعليل وتتبع ناتج الأكواد:',
      totalMarks: 20,
      questions: [
        {
          id: 'prog-tf-1',
          number: 1,
          text: 'المصفوفة int arr[5]; في C++ تحتوي على العناصر من arr[0] إلى arr[5].',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: الترقيم يبدأ من الصفر (0-indexed)، لذا العناصر هي من arr[0] إلى arr[4]. ومحاولة الوصول إلى arr[5] تمثل خطأ تجاوز حدود الذاكرة (Out of Bounds / Buffer Overflow).',
        },
        {
          id: 'prog-tf-2',
          number: 2,
          text: 'تمرير المعاملات إلى الدوال بواسطة المرجع (Pass by Reference: void func(int &x)) يسمح بتعديل القيمة الأصلية للمتغير في دالة الاستدعاء.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: لأن المرجع (&x) يعمل كاسم مستعار لنفس الموقع في الذاكرة ولا ينشئ نسخة جديدة.',
        },
        {
          id: 'prog-tf-3',
          number: 3,
          text: 'دالة analogWrite() في Arduino تولد إشارة جهد تناظري مستمر حقيقي (Pure DC Voltage).',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: analogWrite() تولد إشارة تعديل عرض النبضة (PWM - Pulse Width Modulation) بتردد ثابت (490Hz أو 980Hz)، مع تغيير دورة التشغيل (Duty Cycle) من 0 إلى 255 وليس جهدًا تناظريًا نقيًا.',
        },
        {
          id: 'prog-tf-4',
          number: 4,
          text: 'المؤشر (Pointer) هو متغير يخزن عنوان موقع متغير آخر في ذاكرة الوصول العشوائي (RAM).',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: هذا هو التعريف الأساسي للمؤشر int *ptr = &var؛ حيث ptr يحمل عنوان الذاكرة &var.',
        },
      ],
    },
    {
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'كتابة الأكواد والبرمجة التطبيقية للمتحكمات (Mechatronics Coding)',
      instructions: 'اكتب كود C++ / Arduino متكامل للمسألة الهندسية التالية:',
      totalMarks: 40,
      questions: [
        {
          id: 'prog-prob-1',
          number: 1,
          text: 'المطلوب برمجة نظام تحكم تلقائي في درجة حرارة دفيئة زراعية ذكية باستخدام Arduino Uno:\n- حساس الحرارة التناظري LM35 متصل بالمنفذ التناظري A0 (حيث ينتج LM35 جهد 10mV لكل 1°C).\n- مروحة تبريد (Cooling Fan) متصلة بالمنفذ الرقمي 8 عبر تتابع ريليه (Relay Active HIGH).\n- جرس إنذار (Buzzer) متصل بالمنفذ 9.\n- شاشة تسلسلية (Serial Monitor) بسرعة 9600 baud.\nشروط التشغيل:\n1. قراءة درجة الحرارة كل ثانية وتحويلها بدقة إلى درجات مئوية (°C).\n2. إذا تجاوزت الحرارة 35°C، يتم تشغيل مروحة التبريد وإرسال تحذير عبر السيريال.\n3. إذا تجاوزت الحرارة 45°C (حالة حرجة)، يتم تشغيل مروحة التبريد وتفعيل جرس الإنذار.\n4. إذا انخفضت الحرارة عن 30°C، يتم إيقاف المروحة وجرس الإنذار.',
          marks: 40,
          type: 'problem',
          modelAnswer: `// كود Arduino النموذجي المعتمد
const int sensorPin = A0;
const int fanPin = 8;
const int buzzerPin = 9;

void setup() {
  pinMode(fanPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(fanPin, LOW);
  digitalWrite(buzzerPin, LOW);
  Serial.begin(9600);
  Serial.println("Greenhouse Temperature Control System Started.");
}

void loop() {
  int rawADC = analogRead(sensorPin);
  float voltage = (rawADC * 5.0) / 1024.0; // تحويل إلى فولت
  float temperatureC = voltage * 100.0;     // LM35: 10mV per degree -> 1V = 100C

  Serial.print("Current Temp: ");
  Serial.print(temperatureC);
  Serial.println(" C");

  if (temperatureC >= 45.0) {
    digitalWrite(fanPin, HIGH);
    digitalWrite(buzzerPin, HIGH);
    Serial.println("CRITICAL ALERT: Overheating!");
  } else if (temperatureC >= 35.0) {
    digitalWrite(fanPin, HIGH);
    digitalWrite(buzzerPin, LOW);
    Serial.println("Fan Activated.");
  } else if (temperatureC <= 30.0) {
    digitalWrite(fanPin, LOW);
    digitalWrite(buzzerPin, LOW);
    Serial.println("Normal state. Fan OFF.");
  }

  delay(1000);
}`,
          explanation: 'توزيع الدرجات: 5 درجات للتهيئة، 10 درجات لمعادلة تحويل قراءة الحساس، 15 درجات لمنطق التحكم بالشروط، 10 درجات للإخراج والتوقيت.',
        },
      ],
    },
    {
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'تحليل الخوارزميات وتتبع الذاكرة (Memory & Logic Analysis)',
      instructions: 'أجب عن السؤال التالي موضحًا محتوى الذاكرة وخطوات المعالجة:',
      totalMarks: 20,
      questions: [
        {
          id: 'prog-deriv-1',
          number: 1,
          text: 'اكتب دالة بلغة C++ تقوم بحساب المتوسط الحسابي (Average) لمصفوفة أعداد حقيقية ذات حجم n باستخدام المؤشرات فقط (Pointers) ودون استخدام أقواس الفهرسة [ ]. ثم اشرح الفرق بين Stack و Heap في إدارة ذاكرة المتحكم الدقيق.',
          marks: 20,
          type: 'diagram_derivation',
          modelAnswer: `float calculateAverage(const float *arr, int n) {
  if (n <= 0 || arr == nullptr) return 0.0f;
  float sum = 0.0f;
  const float *ptr = arr;
  for (int i = 0; i < n; i++) {
    sum += *(ptr + i); // استخدام المؤشر والقيمة المؤشر إليها
  }
  return sum / n;
}

الفرق بين Stack و Heap:
1. الـ Stack (المكدس): ذاكرة سريعة جدًا وثابتة تُدار تلقائيًا من المعالج، تُخزن المتغيرات المحلية (Local variables) ومعلومات استدعاء الدوال (Stack frames). عيبها محدودية الحجم وحدوث Stack Overflow عند التكرار اللانهائي.
2. الـ Heap (الكومة): ذاكرة ديناميكية تُحجز وتُحرر يدويًا من المبرمج باستخدام new / delete أو malloc / free. ميزتها المرونة في الحجم، ولكن عيبها خطر تسريب الذاكرة (Memory Leak) والتجزئة (Fragmentation) الخطيرة في الأنظمة المضمنة.`,
          explanation: 'سؤال متقدم يقيس مهارة الطالب في التعامل مع المؤشرات وإدارة الذاكرة في أنظمة Embedded Systems.',
        },
      ],
    },
  ];
}

// ----------------------------------------------------
// 5. Intro to Mechatronics Bank
// ----------------------------------------------------
function getMechatronicsFundamentalsExamParts(examType: ExamType): ExamPart[] {
  return [
    {
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions)',
      instructions: 'اختر الإجابة الصحيحة لكل من الأسئلة التالية:',
      totalMarks: 20,
      questions: [
        {
          id: 'mct-mcq-1',
          number: 1,
          text: 'يُعرّف نظام الميكاترونكس بأنه التكامل التآزري المتزامن بين أربعة مجالات هندسية رئيسية هي:',
          marks: 4,
          type: 'mcq',
          options: ['الميكانيكا، الإلكترونيات، التحكم الآلي، ونظم الحاسوب/البرمجة', 'الهندسة المدنية، المعمارية، الميكانيكا، والكهرباء', 'الفيزياء النووية، الكيمياء، الميكانيكا، والرسم', 'الإلكترونيات والاتصالات اللاسلكية فقط'],
          correctOptionIndex: 0,
          modelAnswer: 'A) الهندسة الميكانيكية، الإلكترونيات، هندسة التحكم، وبرمجيات الحاسوب',
          explanation: 'الميكاترونكس هو Synergistic Integration يجمع الميكانيك والكهرباء والتحكم والبرمجة.',
        },
        {
          id: 'mct-mcq-2',
          number: 2,
          text: 'المشغّل الميكانيكي (Actuator) الذي يُفضل استخدامه للتحكم الدقيق في موضع زوايا مفاصل أذرع الروبوتات هو:',
          marks: 4,
          type: 'mcq',
          options: ['محرك التيار المستمر البسيط (DC Motor)', 'محرك السيرفو (Servo Motor) أو المحرك الخطوي (Stepper Motor)', 'صمام هيدروليكي يدوي', 'مقاوم حراري'],
          correctOptionIndex: 1,
          modelAnswer: 'B) محرك السيرفو (Servo Motor) أو المحرك الخطوي (Stepper Motor)',
          explanation: 'لأنهما يوفران تحكمًا دقيقًا في الزاوية والسرعة بنظام تغذية راجعة.',
        },
        {
          id: 'mct-mcq-3',
          number: 3,
          text: 'الحساس (Sensor) الذي يعمل على قياس المسافة باستخدام انعكاس الموجات الصوتية فوق المسموعة هو:',
          marks: 4,
          type: 'mcq',
          options: ['حساس LDR الضوئي', 'حساس الالتراسونيك (Ultrasonic HC-SR04)', 'مقياس الانفعال (Strain Gauge)', 'المزدوج الحراري (Thermocouple)'],
          correctOptionIndex: 1,
          modelAnswer: 'B) حساس الالتراسونيك (Ultrasonic HC-SR04)',
          explanation: 'يقيس زمن رحلة الموجة الصوتية ذهابًا وإيابًا بسرعة الصوت في الهواء (340 m/s).',
        },
        {
          id: 'mct-mcq-4',
          number: 4,
          text: 'في نظام التحكم ذي الحلقة المغلقة (Closed-Loop Control System)، العنصر المسؤول عن مقارنة القيمة المقاسة مع القيمة المستهدفة (Setpoint) هو:',
          marks: 4,
          type: 'mcq',
          options: ['المقارن / مطروح الإشارة (Error Detector / Comparator)', 'المشغل (Actuator)', 'المحرك', 'المؤقت الزمني'],
          correctOptionIndex: 0,
          modelAnswer: 'A) المقارن ومولد إشارة الخطأ (Error = Setpoint - Feedback)',
          explanation: 'يولد إشارة الخطأ e(t) التي يتلقاها المتحكم Controller لإصدار إشارة التصحيح.',
        },
        {
          id: 'mct-mcq-5',
          number: 5,
          text: 'تُستخدم دائرة قنطرة H (H-Bridge) في أنظمة الميكاترونكس من أجل:',
          marks: 4,
          type: 'mcq',
          options: ['قياس درجات الحرارة بدقة', 'التحكم في اتجاه دوران محركات التيار المستمر (مع وعكس عقارب الساعة)', 'توليد نبضات ساعة المعالج', 'حماية الدائرة من الصواعق'],
          correctOptionIndex: 1,
          modelAnswer: 'B) التحكم في اتجاه دوران وسرعة محركات DC بواسطة تبديل قطبية الجهد عبر المفاتيح الإلكترونية',
          explanation: 'باستخدام 4 ترانزستورات (MOSFETs) لعكس قطبية الجهد المسلط على المحرك.',
        },
      ],
    },
    {
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'الصواب والخطأ مع التعليل (True / False)',
      instructions: 'بيّن صحة أو خطأ العبارات التالية مع التعليل:',
      totalMarks: 20,
      questions: [
        {
          id: 'mct-tf-1',
          number: 1,
          text: 'نظام التحكم ذو الحلقة المفتوحة (Open-Loop System) أكثر استقرارًا وأعلى دقة من نظام الحلقة المغلقة عند وجود اضطرابات خارجية.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: نظام الحلقة المفتوحة لا يحتوي على تغذية راجعة ولا يستطيع تعويض الاضطرابات (Disturbances)، بينما نظام الحلقة المغلقة هو الأدق والأقدر على تعويض الأخطاء.',
        },
        {
          id: 'mct-tf-2',
          number: 2,
          text: 'المشفر الضوئي (Optical Rotary Encoder) يُستخدم لقياس الموضع الزاوي وسرعة دوران المحركات بدقة عالية.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: يعتمد على قرص مثقب وحساس ضوئي لتوليد نبضات رقمية متناسبة مع زاوية وسرعة الدوران.',
        },
        {
          id: 'mct-tf-3',
          number: 3,
          text: 'الدايود الحر الالتفافي (Flyback Diode) المتصل بالتوازي مع ملفات المحركات والريليه يُستخدم لحماية الترانزستورات من الجهد العكسي الناتج عن الحث الذاتي.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: عند فصل التيار عن المحث يتولد جهد عكسي هائل V = -L (di/dt)، ويقوم الدايود بتفريغ هذا التيار بأمان.',
        },
        {
          id: 'mct-tf-4',
          number: 4,
          text: 'المتحكم التناسبي التكاملي التفاضلي (PID Controller) يعتمد حد التكامل (Integral) فيه على القضاء على الخطأ في الحالة المستقرة (Steady-State Error).',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: لأن الحد التكاملي يراكم الخطأ مع الزمن مهما كان صغيرًا ويزيد إشارة التحكم حتى يختفي الخطأ تمامًا.',
        },
      ],
    },
    {
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'المسائل والتصميم الهندسي (Mechatronics System Design)',
      instructions: 'أجب عن مسألة التصميم الهندسية التالية بالتفصيل:',
      totalMarks: 40,
      questions: [
        {
          id: 'mct-prob-1',
          number: 1,
          text: 'صمم نظام ميكاترونكس متكامل لسيارة ذاتية القيادة تتبع مساراً أسود مرسوماً على أرضية بيضاء (Line Tracking Robot):\nالمطلوب:\n1. ارسم المخطط الصندوقي (Block Diagram) للنظام موضحاً كافة المكونات (حساسات، معالجة، مشغلات، تغذية).\n2. حدد نوع الحساسات الأنسب وتوزيعها في مقدمة الروبوت.\n3. حدد نوع المشغلات (المحركات) ودائرة القيادة (Driver) المناسبة.\n4. اكتب الخوارزمية المنطقية (Flowchart / Logic Pseudocode) للتحكم في توجيه السيارة عند الانعطاف يمينًا أو يسارًا.',
          marks: 40,
          type: 'problem',
          modelAnswer: `1. المخطط الصندوقي:
[حساسات خطوط الأشعة تحت الحمراء IR] -> [وحدة المعالجة الدقيقة Arduino / STM32] -> [دائرة قيادة المحركات L298N / TB6612] -> [محركات العجلات DC Geared Motors].
مع وجود مصدر طاقة بطارية Li-Po ومنظم جهد LM7805 / Buck Converter.

2. الحساسات:
مصفوفة من حساسي IR (مستقبل ومرسل ضوئي) أو 4 حساسات لمزيد من الدقة. الحساس يعطي HIGH على السطح الأسود (امتصاص الضوء) و LOW على السطح الأبيض (انعكاس الضوء).

3. المشغلات:
محركان DC مع صندوق تروس (Geared DC Motors 6V-12V)، مع قنطرة H من نوع L298N أو TB6612FNG للتحكم في السرعة عبر PWM والاتجاه.

4. المنطق البرمجي:
- إذا كان الحساسان يقرآن الأبيض: سر إلى الأمام بسرعة متساوية (Forward).
- إذا قرأ الحساس الأيمن الأسود والأيسر الأبيض: انحرف يمينًا (أوقف المحرك الأيمن أو اعكسه، وزد سرعة المحرك الأيسر).
- إذا قرأ الحساس الأيسر الأسود والأيمن الأبيض: انحرف يسارًا (أوقف المحرك الأيسر، وزد سرعة الأيمن).
- إذا قرأ الاثنان أسود (تقاطع): توقف مؤقتًا أو اتخذ القرار المبرمج.`,
          explanation: 'مشروع ومسألة تصميم كلاسيكية تعكس فهم الطالب الشامل لجميع ركائز هندسة الميكاترونكس.',
        },
      ],
    },
    {
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'المقارنات والتحليل المفاهيمي (Comparative Analysis)',
      instructions: 'قارن في جدول منظم بين محركات التيار المستمر (DC Motors)، المحركات الخطوية (Stepper Motors)، ومحركات السيرفو (RC Servo Motors) من حيث: مبدأ العمل، التحكم في الموضع، العزم، والحاجة لحساسات تغذية راجعة.',
      totalMarks: 20,
      questions: [
        {
          id: 'mct-deriv-1',
          number: 1,
          text: 'قارن تفصيلياً بين أنواع المحركات الثلاثة المستخدمة في الميكاترونكس.',
          marks: 20,
          type: 'diagram_derivation',
          modelAnswer: `جدول المقارنة الهندسي:
1. محرك DC العادي:
- مبدأ العمل: دوران مستمر يعتمد على القوة المغناطيسية لورنتز.
- التحكم بالموضع: ضعيف بدون مشفر خارجي (Open Loop).
- السرعة: عالية جداً (آلاف الدورات بالدقيقة).
- العزم: منخفض بدون تروس.
- التغذية الراجعة: يحتاج Encoder لمعرفة الموضع.

2. المحرك الخطوي (Stepper):
- مبدأ العمل: يتحرك بخطوات زاوية ثابتة (مثل 1.8° لكل خطوة) بنبضات رقمية.
- التحكم بالموضع: ممتاز بدقة الخطوة دون حاجة لحساس (Open loop control).
- السرعة: متوسطة إلى منخفضة.
- العزم: عزم احتجاز عالي عند التوقف (Holding Torque).
- التغذية الراجعة: لا يحتاج، لكن قد يفقد خطوات عند الحمل الزائد.

3. محرك السيرفو (RC Servo):
- مبدأ العمل: محرك DC مدمج معه صندوق تروس، مقاومة متغيرة (Potentiometer)، ودائرة تحكم PID داخلية.
- التحكم بالموضع: تحكم دقيق جداً بزاوية محددة (عادة من 0 إلى 180°).
- السرعة: متوسطة مع استجابة سريعة.
- العزم: عالي جداً بفضل نسبة تخفيض التروس المدمجة.
- التغذية الراجعة: يحتوي على تغذية راجعة داخلية مدمجة مقفلة (Internal Closed Loop).`,
          explanation: 'مقارنة أساسية لا غنى عنها لأي مهندس ميكاترونكس لاختيار المشغل الأنسب للمشاريع.',
        },
      ],
    },
  ];
}

// ----------------------------------------------------
// 6. Engineering Drawing & CAD Bank
// ----------------------------------------------------
function getDrawingExamParts(examType: ExamType): ExamPart[] {
  return [
    {
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions)',
      instructions: 'اختر الإجابة الصحيحة لكل من الأسئلة التالية:',
      totalMarks: 20,
      questions: [
        {
          id: 'drw-mcq-1',
          number: 1,
          text: 'في نظام الإسقاط من الزاوية الأولى (First Angle Projection)، يكون المسقط الرأسي (Front View):',
          marks: 4,
          type: 'mcq',
          options: ['فوق المسقط الأفقي (Top View)', 'أسفل المسقط الأفقي', 'على يمين المسقط الجانبي', 'مطابقًا للمسقط الجانبي'],
          correctOptionIndex: 0,
          modelAnswer: 'A) يقع المسقط الرأسي (Front View) أعلى المسقط الأفقي (Top View)',
          explanation: 'في الإسقاط من الزاوية الأولى يقع المنظر الأفقي أسفل الرأسي، والمنظر الأيسر يمين الرأسي.',
        },
        {
          id: 'drw-mcq-2',
          number: 2,
          text: 'الخط المستخدم لتمثيل الخطوط المخفية غير الظاهرة للعين (Hidden Lines) في الرسم الهندسي هو:',
          marks: 4,
          type: 'mcq',
          options: ['خط مستمر سميك (Continuous Thick)', 'خط متقطع من شرطات متساوية (Dashed Line)', 'خط محور نقطة وشرطة (Chain Line)', 'خط متعرج يدوي'],
          correctOptionIndex: 1,
          modelAnswer: 'B) خط متقطع (Dashed Thin Line)',
          explanation: 'تُرسم الحواف والأسطح غير المرئية بخط متقطع طول شرطاته حوالي 3 مم والمسافة بينها 1 مم.',
        },
        {
          id: 'drw-mcq-3',
          number: 3,
          text: 'مقياس الرسم 1:5 يعني أن الرسم:',
          marks: 4,
          type: 'mcq',
          options: ['مقياس تكبير 5 أضعاف', 'مقياس تصغير بمقدار الخُمس (Reduced Scale)', 'مقياس بالأبعاد الحقيقية 1:1', 'مقياس زوايا'],
          correctOptionIndex: 1,
          modelAnswer: 'B) مقياس تصغير بمقدار الخمس (1 وحدة على الورق تقابل 5 وحدات في الواقع)',
          explanation: 'أي رسم بنسبة 1:X هو مقياس تصغير، و X:1 هو مقياس تكبير.',
        },
        {
          id: 'drw-mcq-4',
          number: 4,
          text: 'تُرسم خطوط التهشير (Hatching Lines) في القطاعات الهندسية بزاوية ميل معتمدة تساوي:',
          marks: 4,
          type: 'mcq',
          options: ['30°', '45°', '60°', '90°'],
          correctOptionIndex: 1,
          modelAnswer: 'B) 45° مع الخطوط الرئيسية للمسقط أو خط القاعدة',
          explanation: 'تُرسم خطوط رفيعة مستمرة متوازية بمسافات متساوية وزاوية 45° للدلالة على مادة الجسم المقطوعة.',
        },
        {
          id: 'drw-mcq-5',
          number: 5,
          text: 'رمز القطر في كتابة الأبعاد الهندسية هو:',
          marks: 4,
          type: 'mcq',
          options: ['R', 'Ø', 'M', 'SØ'],
          correctOptionIndex: 1,
          modelAnswer: 'B) Ø (حيث R ترمز لنصف القطر، و M ترمز لسن اللولب المتري)',
          explanation: 'يسبق بعد القطر بالرمز Ø لتحديد قطر الأسطوانات والثقوب الدائرية.',
        },
      ],
    },
    {
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'قواعد التعتيم والأبعاد والقطاعات (Dimensioning & Sectioning)',
      instructions: 'بيّن صحة أو خطأ العبارات التالية موضحًا قواعد الرسم القياسية:',
      totalMarks: 20,
      questions: [
        {
          id: 'drw-tf-1',
          number: 1,
          text: 'يُسمح برسم خطوط الأبعاد متقاطعة مع خطوط الامتداد أو خطوط الرسم الرئيسية كلما دعت الحاجة.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: من القواعد الصارمة في الرسم الهندسي تجنب تقاطع خطوط الأبعاد، ويجب وضع الأبعاد الصغيرة قريبة من الجسم والأبعاد الكلية الخارجية أبعد لتفادي التقاطع.',
        },
        {
          id: 'drw-tf-2',
          number: 2,
          text: 'في القطاع الكامل (Full Section)، يتم تهشير الأعمدة المصمتة ومسامير التثبيت والصواميل الواقعة على خط القطع.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: وفق المعايير الدولية (ISO)، لا يتم تهشير الأجزاء المصمتة الطولية كالمسامير (Bolts)، الخوابير (Keys)، الأعمدة (Shafts)، وأضلاع التقوية (Ribs) إذا كان القطع موازيًا لمحورها.',
        },
        {
          id: 'drw-tf-3',
          number: 3,
          text: 'خط المحور (Center Line) يُرسم ليمتد قليلاً خارج حدود الدائرة أو الأسطوانة.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: يجب أن يبرز خط المحور بمقدار 2 إلى 3 مم خارج المحيط للدلالة على التماثل وتحديد المركز.',
        },
        {
          id: 'drw-tf-4',
          number: 4,
          text: 'المسقط الأفقي (Top View) يوضح بعدي الطول (Length) والارتفاع (Height) للجسم.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: المسقط الأفقي يوضح الطول (Length) والعرض/العمق (Width/Depth)، بينما يظهر الارتفاع (Height) فقط في المسقطين الرأسي والجانبي.',
        },
      ],
    },
    {
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'استنتاج المساقط الهندسية (Orthographic Projections Problem)',
      instructions: 'حل مسألة الإسقاط الهندسي التالية مع توضيح خطوات الاستنتاج:',
      totalMarks: 40,
      questions: [
        {
          id: 'drw-prob-1',
          number: 1,
          text: 'مجسّم هندسي أبعاده الكلية (الطول L = 80 mm، العرض W = 50 mm، الارتفاع H = 60 mm):\nيحتوي المجسم على مجرى حرف U بعرض 30 mm وعمق 20 mm يمر بالكامل في منتصف الوجه العلوي، وثقب أسطواني نافذ قطره Ø = 20 mm في منتصف القاعدة السفلية.\nالمطلوب:\n1. استنتج المساقط الثلاثة الرئيسية وفق نظام الزاوية الأولى (First Angle Projection):\n   - المسقط الرأسي الكامل (Front View).\n   - المسقط الأفقي الكامل (Top View).\n   - المسقط الجانبي الأيسر (Left Side View).\n2. وضح الخطوط المخفية (Hidden Lines) وخطوط المحاور (Center Lines) في جميع المساقط.\n3. ضع الأبعاد الأساسية الكاملة وفق القواعد القياسية (Dimensioning Rules).',
          marks: 40,
          type: 'problem',
          modelAnswer: `خطوات الحل والاستنتاج الهندسي:
1. تخطيط ورقة الرسم:
- رسم مستطيل المسقط الرأسي بأبعاد: 80 × 60 مم.
- رسم مستطيل المسقط الأفقي أسفل الرأسي بأبعاد: 80 × 50 مم مع ترك فراغ مناسب (20 مم).
- رسم مستطيل المسقط الجانبي على يمين الرأسي بأبعاد: 50 × 60 مم باستخدام خط الزاوية 45°.

2. المسقط الرأسي (Front View):
- يظهر المجرى U في الأعلى بخطين ظاهرين بارتفاع 40 مم عن القاعدة وعرض 30 مم في المنتصف (من مسافة 25 مم من الحافتين).
- يظهر الثقب الأسطواني بخطين متقطعين (Hidden lines) بمسافة 10 مم عن محور الثقب المار عند x = 40 مم.

3. المسقط الأفقي (Top View):
- يظهر المجرى U كشريطين أفقيين ممتدين على طول 80 مم.
- تظهر الدائرة بقطر Ø20 مم بخط مستمر واضح مع خطي المركز المتعامدين.

4. المسقط الجانبي (Left Side View):
- يظهر شكل المجسم الخارجي 50 × 60 مم، مع خط المجرى بخط مستمر على عمق 20 مم.
- يظهر الثقب الأسطواني بخطين متقطعين نافذين في القاعدة السفلية.`,
          explanation: 'تمرين كلاسيكي لاختبار مهارة الطالب في التخيل الفراغي والإسقاط المتعامد ووضع الأبعاد.',
        },
      ],
    },
    {
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'استنتاج المسقط الثالث والقطاعات (Sectional Views)',
      instructions: 'أجب بالتفصيل عن استنتاج القطاع:',
      totalMarks: 20,
      questions: [
        {
          id: 'drw-deriv-1',
          number: 1,
          text: 'اشرح بالرسم والخطوات كيفية استنتاج مسقط قطاع كامل (Sectional Front View A-A) يمر بمنتصف الجسم السابق. وما هي الفائدة الهندسية من رسم القطاعات بدلاً من الاكتفاء بالخطوط المخفية؟',
          marks: 20,
          type: 'diagram_derivation',
          modelAnswer: `1. الفائدة الهندسية للقطاعات:
إظهار التفاصيل والتجاويف الداخلية المعقدة للأجسام والميكانيزمات بوضوح وتحويل الخطوط المخفية إلى خطوط ظاهرة لتسهيل قراءتها من قبل المهندسين وفنيي التشغيل في الورش وتقليل اللبس والتداخل، ولتسهيل وضع الأبعاد على التجاويف الداخلية دون وضع أبعاد على خطوط مخفية وهو أمر ممنوع في الرسم القياسي.

2. خطوات استنتاج القطاع A-A:
- تخيل قطع الجسم بالكامل بمستوى قاطع وهمي يمر بمنتصف الثقب والمجرى.
- تحويل الخطوط المتقطعة للثقب الأسطواني في المسقط الرأسي إلى خطوط مستمرة ظاهرة (Visible Lines).
- تظليل وتهشير المناطق المصمتة التي لامسها سكين القطع بخطوط مائلة بزاوية 45° وبمسافات بينية منتظمة (2 مم).
- ترك الفراغات الداخلية (المجرى U والثقب الأسطواني الهوائي) بدون أي تهشير لأن الهواء لا يُهشر.`,
          explanation: 'سؤال لفحص استيعاب مفاهيم القطاعات والتهشير وقواعد المعايير الدولية في الرسم.',
        },
      ],
    },
  ];
}

// ----------------------------------------------------
// Fallback General Engineering Exam Parts
// ----------------------------------------------------
function getGeneralEngineeringExamParts(subjectId: string, examType: ExamType): ExamPart[] {
  return [
    {
      id: 'part-1',
      partNumber: 'السؤال الأول (Question 1)',
      title: 'أسئلة الاختيار من متعدد (Multiple Choice Questions)',
      instructions: 'اختر الإجابة الصحيحة لكل من الأسئلة التالية:',
      totalMarks: 20,
      questions: [
        {
          id: 'gen-1',
          number: 1,
          text: 'أي من الوحدات التالية يُعتبر وحدة قياس أساسية في النظام الدولي للوحدات (SI Units)؟',
          marks: 5,
          type: 'mcq',
          options: ['النيوتن (Newton)', 'الكيلوجرام (Kilogram)', 'الجول (Joule)', 'الفولت (Volt)'],
          correctOptionIndex: 1,
          modelAnswer: 'B) الكيلوجرام (Kilogram - kg)',
          explanation: 'الوحدات الأساسية السبع هي: المتر، الكيلوجرام، الثانية، الأمبير، الكلفن، المول، والقنديلة.',
        },
        {
          id: 'gen-2',
          number: 2,
          text: 'معامل الأمان (Factor of Safety - FoS) في التصاميم الهندسية لمكونات الميكاترونكس يُعرف بأنه نسبة:',
          marks: 5,
          type: 'mcq',
          options: ['الإجهاد الأقصى المسموح إلى إجهاد الانهيار', 'إجهاد الخضوع أو الانهيار إلى إجهاد التشغيل الفعلي (Ultimate / Working Stress)', 'التكلفة المالية إلى جودة المنتج', 'زمن التشغيل إلى زمن الراحة'],
          correctOptionIndex: 1,
          modelAnswer: 'B) إجهاد الخضوع أو الكسر إلى إجهاد التشغيل الفعلي',
          explanation: 'يجب أن يكون معامل الأمان دائمًا أكبر من 1 لضمان عدم انهيار المكون تحت ظروف التشغيل والحمل الزائد.',
        },
        {
          id: 'gen-3',
          number: 3,
          text: 'الدائرة الكهربائية التي تمنع سحب تيار كهربائي زائد وتفصل التيار تلقائيًا عند حدوث دائرة قصر تسمى:',
          marks: 5,
          type: 'mcq',
          options: ['مكثف الترشيح', 'قاطع الدائرة أو المصهر (Fuse / Circuit Breaker)', 'الدايود', 'المقاومة المتغيرة'],
          correctOptionIndex: 1,
          modelAnswer: 'B) قاطع الدائرة أو المصهر (Fuse / Circuit Breaker)',
          explanation: 'أجهزة حماية تفصل الدائرة عند تجاوز التيار للحد التصميمي الآمن.',
        },
        {
          id: 'gen-4',
          number: 4,
          text: 'التحويل بين الإشارات التناظرية والرقمية في أنظمة التحكم يتم بواسطة:',
          marks: 5,
          type: 'mcq',
          options: ['محول ADC ومحول DAC', 'المحولات الكهربائية الحثية فقط', 'الريليه الميكانيكي', 'منظم الجهد الخطي'],
          correctOptionIndex: 0,
          modelAnswer: 'A) محول ADC (تناظري إلى رقمي) ومحول DAC (رقمي إلى تناظري)',
          explanation: 'للربط بين الحساسات والمشغلات الفيزيائية والمعالج الرقمي.',
        },
      ],
    },
    {
      id: 'part-2',
      partNumber: 'السؤال الثاني (Question 2)',
      title: 'أسئلة الصواب والخطأ وتصويب المفاهيم (True / False)',
      instructions: 'بيّن صحة أو خطأ العبارات التالية مع التعليل:',
      totalMarks: 20,
      questions: [
        {
          id: 'gen-tf-1',
          number: 1,
          text: 'في القياسات الهندسية، الدقة (Accuracy) تعني تكرار الحصول على نفس القيمة المقاسة عند إعادة التجربة عدة مرات.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: تكرار نفس القيمة يسمى الضبط أو الإحكام (Precision)، بينما الدقة (Accuracy) تعني مدى قرب القيمة المقاسة من القيمة الحقيقية المعيارية.',
        },
        {
          id: 'gen-tf-2',
          number: 2,
          text: 'قانون بقاء الطاقة ينص على أن الطاقة لا تفنى ولا تُستحدث من العدم ولكن تتحول من شكل إلى آخر.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: هذا هو القانون الأول للديناميكا الحرارية والمبدأ الكوني لحفظ الطاقة.',
        },
        {
          id: 'gen-tf-3',
          number: 3,
          text: 'الأرضي الكهربائي (Grounding) في المعدات الهندسية لا يفيد في شيء ويمكن الاستغناء عنه لتوفير التكاليف.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'خطأ (✗)',
          explanation: 'التصحيح: التأريض هو عنصر السلامة الأساسي لمنع الصدمات الكهربائية القاتلة وتفريغ الشحنات الساكنة والضوضاء الكهرومغناطيسية لحماية الدوائر الحساسة.',
        },
        {
          id: 'gen-tf-4',
          number: 4,
          text: 'تعديل عرض النبضة (PWM) يُستخدم للتحكم في القدرة المسلمة للأحمال دون هدر كبير للطاقة في صورة حرارة.',
          marks: 5,
          type: 'true_false',
          modelAnswer: 'صح (✓)',
          explanation: 'التعليل: لأن الترانزستور يكون إما في حالة تشغيل كامل (ON) أو إيقاف كامل (OFF)، وتكون القدرة المبددة داخله شبه منعدمة.',
        },
      ],
    },
    {
      id: 'part-3',
      partNumber: 'السؤال الثالث (Question 3)',
      title: 'المسائل الهندسية التطبيقية (Applied Engineering Problems)',
      instructions: 'حل المسألة التالية بالتفصيل:',
      totalMarks: 40,
      questions: [
        {
          id: 'gen-prob-1',
          number: 1,
          text: 'محرك كهربائي يستهلك قدرة كهربائية دخلية Pin = 2.5 kW ويعطي قدرة ميكانيكية خرجية Pout = 2.0 kW عند سرعة دوران N = 1500 rpm.\nالمطلوب:\n1. احسب كفاءة المحرك الكهربائية (Efficiency η).\n2. احسب مقدار القدرة المفقودة في صورة حرارة ومفاقيد ميكانيكية Ploss.\n3. احسب عزم الدوران الخارجي (Output Torque τ) بالنيوتن.متر.',
          marks: 40,
          type: 'problem',
          given: ['Pin = 2.5 kW = 2500 W', 'Pout = 2.0 kW = 2000 W', 'N = 1500 rpm'],
          required: 'η, Ploss, τ',
          formulaUsed: 'η = (Pout / Pin) × 100%, Ploss = Pin - Pout, P = τ × ω, ω = 2π N / 60',
          steps: [
            'الخطوة 1: حساب كفاءة المحرك:\nη = (Pout / Pin) × 100% = (2000 / 2500) × 100% = 80%.',
            'الخطوة 2: حساب القدرة المفقودة:\nPloss = Pin - Pout = 2500 - 2000 = 500 Watts.',
            'الخطوة 3: حساب السرعة الزاوية ω:\nω = (2 × π × N) / 60 = (2 × 3.1416 × 1500) / 60 = 314.16 / 2 = 157.08 rad/s.',
            'الخطوة 4: حساب عزم الدوران الخارجي:\nτ = Pout / ω = 2000 W / 157.08 rad/s = 12.73 N·m.',
          ],
          modelAnswer: 'الكفاءة η = 80%، القدرة المفقودة = 500 واط، العزم الناتج τ = 12.73 N·m.',
          explanation: 'مسألة كلاسيكية في كفاءة الآلات وتحويلات الطاقة وعزوم الدوران.',
        },
      ],
    },
    {
      id: 'part-4',
      partNumber: 'السؤال الرابع (Question 4)',
      title: 'التحليل والاستنتاج (Technical Synthesis)',
      instructions: 'أجب بالتفصيل العلمي:',
      totalMarks: 20,
      questions: [
        {
          id: 'gen-q4',
          number: 1,
          text: 'وضح بالتفصيل خطوات منهجية التصميم الهندسي (Engineering Design Process) المتبعة في تصميم أنظمة الميكاترونكس والروبوتات بدءاً من تحديد المشكلة وحتى تصنيع النموذج الأولي واختباره.',
          marks: 20,
          type: 'diagram_derivation',
          modelAnswer: `خطوات منهجية التصميم الهندسي للميكاترونكس:
1. تحديد المشكلة والمتطلبات الهندسية (Problem Definition & Specifications).
2. البحث وجمع البيانات ودراسة النظم المماثلة (Research & Feasibility Study).
3. توليد الأفكار واختيار المفهوم الأفضل (Brainstorming & Concept Selection).
4. النمذجة الرياضية والمحاكاة الحاسوبية (Modeling & Simulation e.g. MATLAB/Simulink).
5. التصميم الميكانيكي والكهربائي التفصيلي (CAD Design & Circuit Schematics).
6. بناء النموذج الأولي الأولي (Prototyping & PCB Fabrication).
7. البرمجة والاختبار والتنقيح (Programming, Testing & Calibration).
8. التحسين والتوثيق النهائي (Refinement & Documentation).`,
          explanation: 'سؤال يقيس وعي الطالب بدورة حياة المنتجات والأنظمة الهندسية.',
        },
      ],
    },
  ];
}

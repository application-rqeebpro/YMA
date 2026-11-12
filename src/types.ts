export type StudyLevel = 
  | 'السنة الأولى'
  | 'السنة الثانية'
  | 'السنة الثالثة'
  | 'السنة الرابعة'
  | 'السنة الخامسة'
  | 'أخرى';

export type UniversityOption =
  | 'الجامعة الإماراتية الدولية – صنعاء'
  | 'جامعة صنعاء'
  | 'جامعة العلوم والتكنولوجيا'
  | 'الجامعة اليمنية'
  | 'جامعة المستقبل'
  | 'جامعة الملكة أروى'
  | 'جامعة أخرى';

export type UserRole = 'student' | 'admin';
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'suspended';

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  university: string;
  studyLevel: StudyLevel;
  major: string;
  role: UserRole;
  preferredVoiceGender?: 'male' | 'female';
  preferredVoiceId?: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  university: string;
  studyLevel: StudyLevel;
  major: string;
  role?: UserRole;
  subscriptionPlan?: 'monthly' | 'yearly';
  subscriptionStatus?: SubscriptionStatus;
  activationCode?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  remainingDays: number;
  remainingHours?: number;
  isActivated: boolean;
  isExpired: boolean;
  preferredVoiceGender?: 'male' | 'female';
  preferredVoiceId?: string;
  completedLessons: string[];
  quizScores: Record<string, number>; // lessonId -> percentage score
}

export type CodeStatus = 'unused' | 'used' | 'suspended' | 'expired';

export interface ActivationCode {
  id?: string;
  code: string;
  type?: 'monthly' | 'yearly';
  planType: 'monthly' | 'yearly' | 'custom';
  status?: CodeStatus;
  durationDays: number;
  priceUSD?: number;
  phone?: string;
  studentName?: string;
  studentId?: string;
  activatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  activatedBy?: 'student' | 'admin' | 'manual';
  maxUses?: number;
  timesUsed?: number;
  usedCount?: number;
  isUsed: boolean;
  isActive?: boolean;
  usedByName?: string;
  usedByStudentName?: string;
  usedByStudents?: Array<{
    studentId: string;
    studentName: string;
    phone?: string;
    usedAt: string;
  }>;
  usedAt?: string;
  notes?: string;
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  studentName: string;
  phone: string;
  university: string;
  plan: 'monthly' | 'yearly';
  priceUSD: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  notes?: string;
}

export interface FormulaSymbol {
  symbol: string;
  name: string;
  unit: string;
  unitSymbol: string;
  dimension: string; // e.g. M, L, T^-2
  description: string;
}

export interface FormulaAnalysis {
  id: string;
  formulaLatex: string;
  formulaText: string;
  name: string;
  subject: string;
  meaning: string;
  whyWeUseIt: string;
  whenToUse: string;
  whenNotToUse: string;
  symbols: FormulaSymbol[];
  dimensionsAnalysis: {
    lhsDimension: string;
    rhsDimension: string;
    verificationExplanation: string;
    isBalanced: boolean;
  };
  simpleExample: {
    problem: string;
    given: Record<string, string>;
    steps: string[];
    result: string;
  };
  engineeringExample: {
    applicationTitle: string;
    description: string;
    practicalTakeaway: string;
  };
}

export interface SolvedExample {
  id: string;
  title: string;
  difficulty: 'سهل' | 'متوسط' | 'تطبيقي متقدم';
  question: string;
  givenData: string[];
  required: string;
  formulaUsed?: string;
  steps: {
    stepNumber: number;
    description: string;
    formula?: string;
    calculation?: string;
    result?: string;
  }[];
  finalAnswer: string;
  engineeringTip?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'calculation' | 'conceptual';
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  readingTimeMinutes: number;
  // 15 Comprehensive Sections required:
  simpleExplanation: string; // 2. شرح مبسط جدًا من الصفر
  coreConcept: string;       // 3. الفكرة الأساسية
  terms: { term: string; definition: string; practicalAnalogy?: string }[]; // 4. المصطلحات
  formulas: FormulaAnalysis[]; // 5, 6, 7, 8, 9. القوانين، تحليلها، الرموز، الوحدات، الأبعاد
  solvedExamples: SolvedExample[]; // 10, 11. أمثلة محلولة وخطوات الحل
  commonMistakes: { mistake: string; correction: string; why: string }[]; // 12. أخطاء شائعة
  practiceQuestions: { question: string; hint: string; answer: string }[]; // 13. أسئلة تدريبية
  quiz: QuizQuestion[]; // 14. اختبار قصير
  summary: string[]; // 15. ملخص الدرس
  // Video lecture integration:
  videoEmbedId?: string;
  videoTitle?: string;
  videoInstructor?: string;
  videoDuration?: string;
  videoTimestamps?: { time: string; title: string }[];
  isFreePreview?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  englishName: string;
  code: string;
  icon: string;
  color: string;
  description: string;
  year: 'السنة الأولى' | 'السنة الثانية';
  semester: 'الفصل الأول' | 'الفصل الثاني';
  universities?: string[]; // applicable universities or empty for all
  lessonsCount?: number;
}

export interface UnitConversion {
  id: string;
  category: 'طول' | 'زمن' | 'كتلة' | 'قوة' | 'طاقة وشغل' | 'قدرة' | 'كهرباء' | 'ضغط' | 'تردد';
  fromUnit: string;
  toUnit: string;
  factor: number;
  symbolFrom: string;
  symbolTo: string;
  dimension: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
  relatedTopic?: string;
}

export interface AdminSettings {
  whatsappNumber: string;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  exchangeRateYR: number; // Yemeni Rial approximate
  academicYear: string;
  announcementText: string;
}

export type ExplainSourceType = 'image' | 'pdf' | 'video' | 'text' | 'file' | 'audio';
export type ExplainLevel = 'simple' | 'medium' | 'advanced' | 'short';

export interface ExplainTerm {
  term: string;
  englishTerm?: string;
  meaning: string;
  practicalAnalogy?: string;
  isAdditionalNote?: boolean;
}

export interface ExplainConceptItem {
  concept: string;
  conceptEn?: string;
  simplifiedExplanation?: string;
  explanation?: string;
  scientificDefinition?: string;
  practicalAnalogy?: string;
  isAdditionalNote?: boolean;
}

export interface ExplainFormula {
  equation: string;
  meaning: string;
  whenToUse?: string;
  symbols: {
    symbol: string;
    name: string;
    unit: string;
    dimension?: string;
  }[];
}

export interface ExplainUnit {
  quantity: string;
  unitName: string;
  unitSymbol: string;
  notes?: string;
}

export interface ExplainDimension {
  quantity: string;
  formula: string;
  dimensionStr: string;
  explanation: string;
}

export interface ProblemSubPart {
  partLabel: string; // e.g. "الفقرة (أ)" or "المطلوب (1)"
  question: string; // نص الفقرة أو الجزء الفرعي
  given?: string[];
  required?: string;
  formulaUsed?: string;
  steps: string[]; // خطوات حل هذه الفقرة بالتفصيل
  calculation?: string; // التعويض الرياضي
  unit?: string; // وحدة القياس
  finalAnswer: string; // الناتج النهائي للفقرة
  whyThisResult?: string; // التفسير الهندسي لنتيجة الفقرة
  finalAnalysis?: string; // التحليل الهندسي والفيزيائي النهائي المتعمق
  isMcq?: boolean; // هل الفقرة سؤال اختيارات من متعدد؟
  mcqOptions?: string[]; // الخيارات المتاحة (أ، ب، ج، د)
  selectedOption?: string; // الإجابة والاختيار الصحيح
  optionReasoning?: string; // ذكر سبب التعليل واختيار هذا الخيار بالتفصيل
}

export interface ExplainSolvedExample {
  problem: string;
  given: string[];
  required: string;
  formulaUsed: string;
  steps: string[];
  calculation?: string;
  unit?: string;
  finalAnswer: string;
  whyThisResult?: string;
  finalAnalysis?: string; // التحليل الهندسي والفيزيائي النهائي المتعمق
  isGenerated: boolean;
  note?: string;
  isMultipleParts?: boolean; // هل المسألة مقسمة إلى فقرات (أ، ب، ج...)؟
  subParts?: ProblemSubPart[]; // قائمة بجميع فقرات المسألة المحلولة بالتفصيل
  isMcqQuestion?: boolean; // هل المسألة عبارة عن سؤال اختيارات؟
  mcqOptions?: string[]; // خيارات السؤال (أ، ب، ج، د)
  selectedOption?: string; // الاختيار الصحيح المختار
  optionReasoning?: string; // التعليل وسبب اختيار هذا الخيار
}

export interface ExplainImportantNote {
  note?: string;
  point?: string;
  explanation?: string;
  type?: 'warning' | 'tip' | 'exam';
  dangerLevel?: 'high' | 'medium' | 'low';
  isAdditionalNote?: boolean;
}

export interface ExplainCommonMistake {
  mistake: string;
  correction: string;
  why: string;
}

export interface ExplainQuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'calculation' | 'conceptual';
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation: string;
}

export interface ExplainSuggestedTool {
  toolId: string; // 'circuits' | 'math' | 'units' | 'formulas' | 'torque' | 'gears' | 'oee' | 'robot'
  title: string;
  subtitle: string;
  icon: string;
  reason: string;
}

export interface ImageBreakdownItem {
  imageIndex: number;
  imageTitle: string;
  summary: string;
  extractedContent: string;
  detailedExplanation: string;
  keyTakeaways?: string[];
  solvedProblemsInImage?: string[];
  previewUrl?: string;
}

export interface ExplainLessonResult {
  id: string;
  studentId?: string;
  lessonTitle: string;
  subjectName: string;
  sourceType: ExplainSourceType;
  fileName?: string;
  filePreviewUrl?: string;
  imagesBreakdown?: ImageBreakdownItem[]; // 📸 الشرح التفصيلي صورة صورة / صفحة صفحة
  totalImagesCount?: number;
  createdAt: string;
  explanationLevel: ExplainLevel;
  simpleIdea: string; // 💡 الدرس ببساطة: ما هو؟ ماذا يعني؟ لماذا ندرسه؟ أين يستخدم؟
  coreTakeaways: string[]; // 🎯 أهم الأفكار
  conceptExplanations?: ExplainConceptItem[]; // 📖 شرح المفاهيم بأسلوب مبسط ثم التعريف العلمي
  terms: ExplainTerm[]; // 📌 المصطلحات المهمة بالعربي والإنجليزي
  formulas: ExplainFormula[]; // 📐 القوانين والمعادلات كاملة مع الرموز ومتى تستخدم
  units: ExplainUnit[]; // 📏 الوحدات الدولية
  dimensions: ExplainDimension[]; // 🔬 الأبعاد الفيزيائية
  solvedExample: ExplainSolvedExample; // 🧮 المسألة الرئيسية أو الأولى
  solvedExamples?: ExplainSolvedExample[]; // 🧮 قائمة بكافة المسائل المحلولة إذا احتوت الصورة على عدة مسائل
  importantNotes?: ExplainImportantNote[]; // ⚠️ الملاحظات والتنبيهات المهمة
  memoryAids?: string[]; // 🧠 كيف أتذكر الدرس؟
  summaryPoints: string[]; // 📝 الخلاصة المركزة (تقرأ في دقيقة أو دقيقتين)
  learningObjectives?: string[]; // 🎓 ماذا يجب أن أعرف بعد الدرس؟
  quiz: ExplainQuizQuestion[]; // 🧪 اختبار سريع وتفاعلي
  commonMistakes: ExplainCommonMistake[];
  suggestedTools: ExplainSuggestedTool[];
  circuitAnalysis?: {
    hasCircuit: boolean;
    circuitType?: string;
    components?: { type: string; value: string; label: string }[];
    analysisSummary?: string;
  };
  clarificationNotice?: string;
  isImageBlurry?: boolean;
  isNotEducational?: boolean;
  notEducationalNotice?: string;
  videoSupportNotice?: string;
  studySheetMarkdown?: string;
  sections?: { id: string; title: string; summary: string }[];
  originalContentSample?: string;
  pdfPageChoice?: { mode: 'full' | 'pages'; selectedPages?: string };
  isAiGenerated?: boolean;
  modelUsed?: string;
  noticeMessage?: string;
  aiErrorInfo?: {
    code: string;
    message: string;
    originalError?: string;
  };
  usedSerwayReference?: boolean;
  serwayCitations?: Array<{
    chapterTitle: string;
    pageNumber?: number;
    snippet: string;
    confidence?: number;
  }>;
  serwayStatusNotice?: string;
  smartDoctorConfig?: SmartDoctorConfig;
  educationalPresentation?: EducationalPresentation;
  sourceAttributions?: {
    fromStudentFile?: string[];
    fromSerwayBook?: string[];
    fromAiSynthesis?: string[];
  };
}

// ==========================================
// 🎓 ENGINEERING ASSIGNMENT CREATOR TYPES
// ==========================================

export type AssignmentType =
  | 'homework' // 📚 واجب دراسي
  | 'research' // 📝 بحث علمي
  | 'eng_report' // 📄 تقرير هندسي
  | 'lab_report' // 🧪 تقرير تجربة مختبر
  | 'problem_solving' // 🔢 حل مسائل
  | 'circuits' // ⚡ دوائر كهربائية
  | 'mechatronics_project' // 🤖 مشروع ميكاترونكس
  | 'eng_project' // 🔧 مشروع هندسي
  | 'programming' // 💻 تكليف برمجة
  | 'arduino' // 🔌 Arduino
  | 'plc' // ⚙️ PLC
  | 'robotics' // 🤖 Robotics
  | 'automation' // 🏭 Automation
  | 'cad_design' // 📐 رسم وتصميم هندسي
  | 'data_analysis' // 📊 تحليل بيانات
  | 'lesson_summary' // 📖 تلخيص درس
  | 'presentation' // 🎤 عرض تقديمي
  | 'practical_exp' // 🧑🔬 تجربة عملية
  | 'custom'; // ✏️ تكليف مخصص

export type AssignmentDetailLevel = 'short' | 'medium' | 'advanced' | 'academic';
export type AssignmentLanguage = 'ar' | 'en';

export interface AssignmentCoverPage {
  university: string;
  college: string;
  major: string;
  subject: string;
  assignmentTitle: string;
  assignmentTypeLabel: string;
  studentName: string;
  studentId?: string;
  professorName: string;
  studyLevel: string;
  submissionDate: string;
  academicYear?: string;
}

export interface AssignmentSection {
  id: string;
  title: string;
  content: string; // Markdown / rich text
  type?: 'text' | 'code' | 'table' | 'formula' | 'circuit' | 'components' | 'image';
  codeLanguage?: string;
  tableData?: { headers: string[]; rows: string[][] };
  formulaLatex?: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface EngineeringAssignment {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: AssignmentType;
  typeLabel: string;
  subject: string;
  title: string;
  pageCountTarget: number;
  language: AssignmentLanguage;
  detailLevel: AssignmentDetailLevel;
  cover: AssignmentCoverPage;
  sections: AssignmentSection[];
  isAiGenerated: boolean;
  modelUsed?: string;
}

export type ExamType = 'final' | 'midterm' | 'quiz' | 'lesson_test';

export interface ExamHeaderInfo {
  republic: string;
  ministry: string;
  university: string;
  faculty: string;
  department: string;
  courseTitle: string;
  courseCode: string;
  level: string;
  semester: string;
  academicYear: string;
  examTypeLabel: string;
  timeAllowed: string;
  totalMarks: number;
  professorName?: string;
  examDate?: string;
}

export interface ExamQuestionItem {
  id: string;
  number: number;
  text: string;
  englishText?: string;
  marks: number;
  type: 'mcq' | 'true_false' | 'problem' | 'short_answer' | 'diagram_derivation';
  options?: string[];
  correctOptionIndex?: number;
  modelAnswer: string;
  explanation?: string;
  formulaUsed?: string;
  given?: string[];
  required?: string;
  steps?: string[];
  diagramDescription?: string;
}

export interface ExamPart {
  id: string;
  partNumber: string; // e.g. "السؤال الأول (Question 1)"
  title: string; // e.g. "أسئلة الاختيار من متعدد (Multiple Choice)"
  instructions: string; // e.g. "اختر الإجابة الصحيحة لكل مما يلي مع نقل الرمز إلى جدول الإجابات:"
  totalMarks: number;
  questions: ExamQuestionItem[];
}

export interface ExamPaper {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  lessonId?: string;
  lessonTitle?: string;
  examType: ExamType;
  header: ExamHeaderInfo;
  parts: ExamPart[];
  totalMarks: number;
  instructions: string[];
  createdAt: string;
  isCustomUploadedLesson?: boolean;
}

// ==========================================
// 🚀 PERSONALIZED LEARNING PATHS TYPES
// ==========================================

export type LearningTrackId = 
  | 'curriculum' 
  | 'circuits' 
  | 'physics-mechanics' 
  | 'robotics-programming' 
  | 'remediation';

export type RecommendationType = 'next_sequential' | 'remediation_review' | 'advanced_challenge' | 'starter';

export interface RecommendedLessonItem {
  lesson: Lesson;
  subject: Subject;
  recommendationType: RecommendationType;
  title: string;
  reason: string;
  priority: 'urgent' | 'high' | 'normal';
  estimatedMinutes: number;
  keyTopics: string[];
  prerequisiteLessonTitle?: string;
  relatedTool?: 'arduino' | 'formulas' | 'units' | 'assignments';
  scoreAchieved?: number; // if remediation or completed
}

export interface LearningMilestone {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  subjectId: string;
  lessonId: string;
  lessonTitle: string;
  status: 'completed' | 'current' | 'locked' | 'review_needed';
  score?: number;
  estimatedMinutes: number;
  category: string;
}

export interface PersonalizedPathData {
  studentLevel: StudyLevel;
  university: string;
  totalLessons: number;
  completedCount: number;
  completionRate: number; // 0 - 100
  averageQuizScore: number; // 0 - 100
  readinessLabel: 'مبتدئ' | 'متوسط' | 'متقدم' | 'جاهز للاختبارات الجامعية';
  readinessColor: string;
  primaryRecommendation: RecommendedLessonItem | null;
  secondaryRecommendations: RecommendedLessonItem[];
  remediationItems: RecommendedLessonItem[];
  strengths: { subjectName: string; skill: string; score: number }[];
  focusAreas: { subjectName: string; topic: string; score: number; advice: string }[];
  milestones: LearningMilestone[];
  aiAdvisorTip: string;
  weeklyTarget: {
    recommendedHours: number;
    recommendedLessons: number;
    statusText: string;
  };
}

export interface ProjectComponentItem {
  id: string;
  name: string;
  count: number;
  usage: string;
  details: {
    whatIsIt: string;        // ما هو؟
    function: string;        // ما وظيفته؟
    howItWorks?: string;      // كيف يعمل؟
    whereUsed?: string;       // أين يستخدم؟
    pinoutOrSpecs?: string;  // مواصفات الأرجل أو الجهد
  };
}

export interface ProjectWiringConnection {
  fromComponent: string;
  fromPin: string;
  toComponent: string;
  toPin: string;
  wireColor: string; // 'red' | 'black' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple'
  signalType: '5V' | 'GND' | '3.3V' | 'VIN' | 'Digital' | 'Analog' | 'PWM' | 'Motor';
  notes?: string;
}

export interface ProjectPinMapping {
  componentName: string;
  pinFunction: string;
  boardPin: string; // e.g. "D9", "A0", "5V", "GND"
  codeIdentifier: string; // e.g. "TRIG_PIN", "MOTOR_IN1"
}

export interface ProjectAssemblyStep {
  stepNumber: number;
  title: string;
  description: string;
  usedComponents: string[];
  connectionsSummary?: string;
  importantNotes?: string;
  cautionNotice?: string;
  illustrationSvg?: string; // High-detail educational SVG diagram
  imageUrl?: string;
}

export interface ProjectReferenceItem {
  type: 'book' | 'pdf' | 'video' | 'course';
  title: string;
  chapterOrSection?: string;
  pageNumber?: string;
  videoTimestamp?: string;
  sourceNote?: string;
}

export interface ProjectGalleryImage {
  id: string;
  imageNumber: number; // 1 to 8
  title: string;
  subtitle: string;
  description: string;
  svgContent: string;
}

export interface EngineeringProjectData {
  id: string;
  title: string;
  category: string;
  idea: string;
  targetAudience: string;
  finalProjectImage?: string;
  componentsIllustrationSvg?: string;
  wiringDiagramSvg?: string;
  galleryImages?: ProjectGalleryImage[];
  components: ProjectComponentItem[];
  connections: ProjectWiringConnection[];
  pinMapping: ProjectPinMapping[];
  steps: ProjectAssemblyStep[];
  code: {
    language: 'arduino' | 'c' | 'python' | 'cpp';
    filename: string;
    sourceCode: string;
    explanation: string;
    lineByLineNotes: Array<{ lineRange: string; explanation: string }>;
    librariesNeeded: string[];
    uploadSteps: string[];
  };
  testingProcedure: {
    steps: string[];
    expectedBehavior: string;
    calibrationTips?: string;
  };
  troubleshooting: Array<{
    symptom: string;
    possibleCause: string;
    solution: string;
  }>;
  futureImprovements: string[];
  finalResultSummary: string;
  references: ProjectReferenceItem[];
  simulationConfig?: {
    type: 'obstacle_avoiding_car' | 'line_follower' | 'drone_flight' | 'robotic_arm' | 'smart_traffic' | 'temperature_control' | 'generic';
    defaultSensors?: Record<string, number>;
  };
}

// ==========================================
// 📚 ACADEMIC REFERENCES & SERWAY SYSTEM
// ==========================================

export type BookProcessingStatus = 'not_uploaded' | 'processing' | 'ready' | 'failed';

export interface ReferenceBook {
  id: string; // e.g. "book-serway-physics"
  title: string;
  originalTitle: string;
  authors: string[];
  edition?: string;
  publicationYear?: number;
  language: string;
  field: string;
  targetMajor: string;
  description: string;
  hasFile: boolean;
  fileReference?: string;
  fileName?: string;
  fileSize?: number;
  totalPages?: number;
  processingStatus: BookProcessingStatus;
  processingProgress?: number;
  processingError?: string;
  indexedAt?: string;
  createdAt: string;
  updatedAt: string;
  chunksCount: number;
  officialExternalUrl?: string;
  topicsCovered: string[];
  accessRole?: 'student' | 'admin' | 'public';
}

export interface ReferenceBookChunk {
  id: string;
  bookId: string;
  chapterTitle: string;
  pageNumber?: number;
  sectionTitle?: string;
  content: string;
  snippet?: string;
  score?: number;
  keywords?: string[];
}

export interface BookSearchResult {
  query: string;
  bookId: string;
  bookTitle: string;
  totalMatches: number;
  chunks: ReferenceBookChunk[];
}

export type DoctorExplanationStyle = 
  | 'simplified_beginner'
  | 'university_detailed'
  | 'formulas_derivation'
  | 'step_by_step_problems'
  | 'diagrams_visual'
  | 'practical_applications'
  | 'exam_review'
  | 'practice_questions';

export interface SmartDoctorConfig {
  enabled: boolean;
  doctorName?: string;
  university?: string;
  studyLevel?: string;
  subject?: string;
  lessonTitle?: string;
  referenceSource?: 'serway' | 'student_file' | 'general' | 'other';
  explanationStyle?: DoctorExplanationStyle;
  durationMinutes?: 5 | 15 | 30;
  isAiDisclaimerAcknowledged?: boolean;
}

export interface EducationalSlide {
  slideNumber: number;
  title: string;
  type: 'concept' | 'formula' | 'diagram' | 'example' | 'summary';
  bullets: string[];
  latexFormula?: string;
  diagramDescription?: string;
  audioNarrationScript?: string;
  durationSeconds?: number;
}

export interface EducationalPresentation {
  id: string;
  lessonTitle: string;
  slides: EducationalSlide[];
  totalDurationSeconds: number;
  isGeneratedAlternative: boolean;
  disclaimer: string;
}

// ==========================================
// 🎥 EDUCATIONAL VIDEO LIBRARY TYPES
// ==========================================

export type VideoPlatform = 'YouTube' | 'Facebook' | 'Instagram' | 'TikTok' | 'Other';
export type VideoStatus = 'active' | 'unavailable' | 'pending_review';

export interface EducationalVideo {
  id: string;
  title: string;
  description: string;
  platform: VideoPlatform;
  originalUrl: string;
  embedUrl?: string;
  thumbnailUrl: string;
  channelName: string;
  subject: string;
  topic: string;
  level: StudyLevel;
  university?: string;
  language: 'العربية' | 'English' | 'مترجم';
  tags: string[];
  duration?: string;
  status: VideoStatus;
  verified: boolean;
  isYemeniContent: boolean;
  isBestExplanation?: boolean;
  addedDate: string;
  ratingScore?: number;
  viewsCount: number;
  savesCount: number;
  doctorName?: string;
  linkedLessonId?: string;
}

export interface VideoStudyList {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  videoIds: string[];
  createdAt: string;
}

export interface VideoExplanationRequest {
  id: string;
  studentId?: string;
  studentName?: string;
  subject: string;
  topic: string;
  level: StudyLevel;
  description: string;
  status: 'pending' | 'fulfilled' | 'rejected';
  createdAt: string;
}

export interface VideoAiSuggestResult {
  title: string;
  description: string;
  channelName: string;
  platform: VideoPlatform;
  subject: string;
  topic: string;
  level: StudyLevel;
  university?: string;
  language: 'العربية' | 'English' | 'مترجم';
  tags: string[];
  isYemeniContent: boolean;
  confidence: number;
}

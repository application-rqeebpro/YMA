import { GoogleGenAI } from '@google/genai';
import { 
  ExplainLessonResult, 
  ExplainLevel, 
  ExplainSourceType, 
  SmartDoctorConfig, 
  EducationalPresentation, 
  EducationalSlide 
} from '../src/types';
import { 
  searchBookChunks, 
  SERWAY_BOOK_ID, 
  getReferenceBookById, 
  getPhysicsTopicInfo 
} from './referenceBookService';

function parsePdfPageRange(rangeStr: string, maxPages: number): Set<number> {
  const pages = new Set<number>();
  if (!rangeStr) return pages;
  const parts = rangeStr.split(/[,،\s]+/);
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        pages.add(num);
      }
    }
  }
  return pages;
}

async function extractTextFromPdfBuffer(
  pdfBuffer: Buffer,
  pageChoice?: { mode: 'full' | 'pages'; selectedPages?: string }
): Promise<string> {
  try {
    let pdfPkg: any = null;
    try {
      const mod: any = await import('pdf-parse');
      pdfPkg = mod?.default || mod;
    } catch (_) {
      try {
        const { createRequire } = await import('module');
        const req = createRequire(process.cwd());
        pdfPkg = req('pdf-parse');
      } catch (_) {}
    }

    if (!pdfPkg) return '';

    if (pdfPkg?.PDFParse) {
      const uint8 = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength);
      const parser = new pdfPkg.PDFParse(uint8);
      const parsed = await parser.getText();

      if (pageChoice?.mode === 'pages' && pageChoice.selectedPages && Array.isArray(parsed?.pages) && parsed.pages.length > 0) {
        const selectedPageSet = parsePdfPageRange(pageChoice.selectedPages, parsed.pages.length);
        const filteredPages = parsed.pages.filter((p: any) => selectedPageSet.has(p.num));
        if (filteredPages.length > 0) {
          return filteredPages.map((p: any) => `--- [الصفحة ${p.num} من ${parsed.total || parsed.pages.length}] ---\n${p.text}`).join('\n\n').trim();
        }
      }

      if (Array.isArray(parsed?.pages) && parsed.pages.length > 0) {
        return parsed.pages.map((p: any) => `--- [الصفحة ${p.num} من ${parsed.total || parsed.pages.length}] ---\n${p.text}`).join('\n\n').trim();
      }

      if (typeof parsed === 'string') return parsed.trim();
      if (parsed && typeof parsed.text === 'string') return parsed.text.trim();
    } else if (typeof pdfPkg === 'function') {
      const parsed = await pdfPkg(pdfBuffer);
      return parsed?.text?.trim() || '';
    } else if (typeof pdfPkg?.default === 'function') {
      const parsed = await pdfPkg.default(pdfBuffer);
      return parsed?.text?.trim() || '';
    }
  } catch (e: any) {
    console.warn('[PDF Extract Warning]:', e?.message || e);
  }
  return '';
}

// Helper to initialize Gemini safely
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Robust JSON parser that handles codeblocks, outermost brace matching, and trailing commas
 */
export function safeExtractJson(text: string): any {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    // continue
  }

  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (_) {
      // continue
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSubstring);
    } catch (_) {
      const sanitized = jsonSubstring.replace(/,\s*([\}\]])/g, '$1');
      try {
        return JSON.parse(sanitized);
      } catch (_) {
        // failed
      }
    }
  }

  return null;
}

export class GeminiCallError extends Error {
  code: string;
  userMessage: string;
  status: number;

  constructor(message: string, code: string, userMessage: string, status: number = 500) {
    super(message);
    this.name = 'GeminiCallError';
    this.code = code;
    this.userMessage = userMessage;
    this.status = status;
  }
}

/**
 * Resilient caller for Gemini models with backoff retry and automatic cascade fallback across available models:
 * 1. High-speed, high-availability lightweight models (gemini-3.1-flash-lite, gemini-flash-lite-latest)
 * 2. Primary Flash models (gemini-3.6-flash, gemini-3.8-flash)
 * 3. Latest flash alias (gemini-flash-latest)
 */
export async function callGeminiWithResilience(
  client: GoogleGenAI,
  request: {
    contents: any;
    config?: any;
    preferredModel?: string;
    fallbackModels?: string[];
  }
): Promise<{ text: string; modelUsed: string }> {
  // Ordered cascade prioritizing high-reasoning STEM models (gemini-3.1-pro-preview) and high-availability models
  const defaultCascade = [
    'gemini-3.1-pro-preview',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];

  const cascadeToUse = request.fallbackModels && request.fallbackModels.length > 0
    ? request.fallbackModels
    : defaultCascade;

  const models = request.preferredModel
    ? [request.preferredModel, ...cascadeToUse]
    : cascadeToUse;

  const uniqueModels = Array.from(new Set(models));
  let lastError: any = null;

  for (let i = 0; i < uniqueModels.length; i++) {
    const currentModel = uniqueModels[i];
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await client.models.generateContent({
          model: currentModel,
          contents: request.contents,
          config: request.config,
        });

        const text = response.text?.trim() || '';
        if (text) {
          return { text, modelUsed: currentModel };
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err?.status || err || '');
        const isQuotaExceeded =
          msg.includes('429') ||
          msg.includes('Quota exceeded') ||
          msg.includes('quota') ||
          msg.includes('RESOURCE_EXHAUSTED');

        const isTemporaryBusy =
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('overloaded');

        console.warn(
          `[Gemini Resilience] Model '${currentModel}' attempt ${attempt}/${maxAttempts} failed:`,
          msg.substring(0, 160)
        );

        // If quota is exhausted or model is experiencing high demand (503), switch immediately to the next model
        if (isQuotaExceeded || isTemporaryBusy) {
          break;
        }

        // For other transient errors, retry once
        if (attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, 300));
          continue;
        }

        // Otherwise move immediately to the next candidate model in the cascade
        break;
      }
    }
  }

  const lastMsg = String(lastError?.message || lastError || '');
  if (lastMsg.includes('429') || lastMsg.includes('Quota exceeded') || lastMsg.includes('RESOURCE_EXHAUSTED')) {
    throw new GeminiCallError(
      `Gemini API quota limit reached: ${lastMsg}`,
      'GEMINI_QUOTA_EXCEEDED',
      'وصل مفتاح الذكاء الاصطناعي إلى الحد الأقصى اليومي المسموح به للطلبات (Quota Exceeded). تم تحضير الشرح بالاعتماد على النظام الأكاديمي المحلي المعتمد.',
      429
    );
  } else if (lastMsg.includes('503') || lastMsg.includes('UNAVAILABLE') || lastMsg.includes('high demand') || lastMsg.includes('overloaded')) {
    throw new GeminiCallError(
      `Gemini AI models are temporarily overloaded: ${lastMsg}`,
      'GEMINI_SERVICE_BUSY',
      'نماذج الذكاء الاصطناعي تعاني من ضغط مؤقت في الخدمة (503 Service Busy). تم تحضير الشرح باستخدام المساعد المحلي المعتمد.',
      503
    );
  } else if (lastMsg.includes('API key') || lastMsg.includes('API_KEY_INVALID') || lastMsg.includes('UNAUTHENTICATED')) {
    throw new GeminiCallError(
      `Invalid or unauthenticated Gemini API key: ${lastMsg}`,
      'GEMINI_INVALID_KEY',
      'مفتاح API الخاص بالذكاء الاصطناعي غير معتمد أو غير صالح.',
      401
    );
  } else if (lastMsg.includes('SAFETY') || lastMsg.includes('blocked')) {
    throw new GeminiCallError(
      `Gemini content policy blocked generation: ${lastMsg}`,
      'GEMINI_SAFETY_BLOCK',
      'تعذر تحليل المحتوى المرفوع بسبب سياسات السلامة والأمان لجيميني. يرجى رفع صورة أو نص أكاديمي واضح.',
      400
    );
  } else {
    throw new GeminiCallError(
      `All Gemini models failed: ${lastMsg}`,
      'GEMINI_GENERATION_FAILED',
      `تعذر استكمال المعالجة بالذكاء الاصطناعي (${lastMsg.substring(0, 100)}). تم تقديم الشرح عبر المساعد المحلي المعتمد.`,
      500
    );
  }
}

export interface ExplainRequestParams {
  mode: ExplainSourceType;
  prompt?: string;
  fileData?: string;
  filesData?: Array<{ base64: string; mimeType?: string; fileName?: string }>;
  mimeType?: string;
  fileName?: string;
  explanationLevel?: ExplainLevel;
  specificPart?: string;
  actionType?: 'full_explain' | 'simplify_more' | 'explain_point' | 'give_example' | 'test_me' | 'did_not_understand' | 'solve_example' | 'generate_cheat_sheet';
  studentUniversity?: string;
  studentMajor?: string;
  studentId?: string;
  pdfPageChoice?: { mode: 'full' | 'pages'; selectedPages?: string };
  useSerwayReference?: boolean;
  doctorConfig?: SmartDoctorConfig;
}

export function buildEducationalPresentation(
  lessonTitle: string,
  simpleIdea: string,
  formulas: any[],
  solvedExample: any,
  commonMistakes: any[],
  summaryPoints: string[]
): EducationalPresentation {
  const safeTitle = lessonTitle || 'شرح الدرس الهندسي';
  const slides: EducationalSlide[] = [
    {
      slideNumber: 1,
      title: `المقدمة والهدف الأساسي: ${safeTitle}`,
      type: 'concept',
      bullets: [
        simpleIdea ? simpleIdea.slice(0, 160) : 'استيعاب المفهوم الفيزيائي والهندسي الأساسي.',
        'ربط الموضوع بتطبيقات هندسة الميكاترونكس والأنظمة الذكية.',
        'معرفة معايير التحليل الرياضي والوحدات الدولية المعتمدة.',
      ],
      audioNarrationScript: `مرحباً بكم في العرض التعليمي التفاعلي لدرس: ${safeTitle}. في هذه الشريحة نستعرض الفكرة الأساسية: ${simpleIdea ? simpleIdea.slice(0, 120) : 'فهم المفهوم الهندسي وتطبيقاته'}.`,
      durationSeconds: 15,
    },
    {
      slideNumber: 2,
      title: 'القوانين والمعادلات الحاكمة',
      type: 'formula',
      bullets: Array.isArray(formulas) && formulas.length > 0
        ? formulas.slice(0, 3).map(f => `${f.equation}: ${f.meaning || 'المعادلة الحاكمة'}`)
        : ['مراجعة الصيغة الرياضية وتجانس الوحدات في النظام الدولي.'],
      latexFormula: formulas?.[0]?.equation,
      audioNarrationScript: formulas?.[0]
        ? `القانون الحاكم الأساسي هو ${formulas[0].equation}، حيث يعبر عن ${formulas[0].meaning || 'العلاقة الفيزيائية'}.`
        : 'نستعرض هنا القوانين والمعادلات الحاكمة للموضوع.',
      durationSeconds: 20,
    },
    {
      slideNumber: 3,
      title: 'مسألة تطبيقية محلولة خطوة بخطوة',
      type: 'example',
      bullets: [
        `المعطيات: ${(solvedExample?.given || []).slice(0, 2).join(' | ') || 'استخراج المعطيات بدقة'}`,
        `المطلوب: ${solvedExample?.required || 'حل المسألة'}`,
        `القانون المستخدم: ${solvedExample?.formulaUsed || formulas?.[0]?.equation || 'القانون الحاكم'}`,
        `الناتج النهائي: ${solvedExample?.finalAnswer || 'حساب القيمة والوحدة الصحيحة'}`,
      ],
      diagramDescription: 'مخطط خطوات التعويض الحسابي والتحليل الفيزيائي للحل',
      audioNarrationScript: `ننتقل الآن لحل المسألة الهندسية: بعد استخراج المعطيات والتأكد من وحدات SI، نعوض مباشرة في القانون لنصل إلى النتيجة: ${solvedExample?.finalAnswer || 'الناتج النهائي'}.`,
      durationSeconds: 25,
    },
    {
      slideNumber: 4,
      title: 'الأخطاء الشائعة والتنبيهات الهندسية',
      type: 'summary',
      bullets: Array.isArray(commonMistakes) && commonMistakes.length > 0
        ? commonMistakes.slice(0, 2).map(m => `⚠️ خطأ شائع: ${m.mistake} — التصحيح: ${m.correction}`)
        : ['تأكد دائمًا من تحويل الوحدات إلى النظام الدولي SI قبل التعويض الرياضي.'],
      audioNarrationScript: 'انتبهوا جيداً لتفادي الأخطاء الشائعة أثناء حل المسائل، وأهمها تحويل الوحدات وتحديد الاتجاهات الصحيحة للقوى والحقول.',
      durationSeconds: 15,
    },
    {
      slideNumber: 5,
      title: 'خلاصة الدرس ونقاط الامتحان السريعة',
      type: 'summary',
      bullets: Array.isArray(summaryPoints) && summaryPoints.length > 0
        ? summaryPoints.slice(0, 3)
        : ['استيعاب المفهوم، حفظ القانون والرموز، والتدرب على المسائل.'],
      audioNarrationScript: `وفي الختام، تتلخص أهم نقاط الدرس في استيعاب المفهوم الأساسي وتطبيق القوانين بدقة. بالتوفيق لجميع مهندسي المستقبل.`,
      durationSeconds: 15,
    },
  ];

  return {
    id: `pres-${Date.now()}`,
    lessonTitle: safeTitle,
    slides,
    totalDurationSeconds: slides.reduce((acc, s) => acc + (s.durationSeconds || 15), 0),
    isGeneratedAlternative: true,
    disclaimer: 'عرض تعليمي تفاعلي بديل لشرح الفيديو بالشرائح والصوت التفاعلي لتيسير الفهم بدون انقطاع.',
  };
}

export async function processExplainLesson(params: ExplainRequestParams): Promise<ExplainLessonResult> {
  const {
    mode,
    prompt = '',
    fileData,
    filesData,
    mimeType,
    fileName,
    explanationLevel = 'simple',
    specificPart = '',
    actionType = 'full_explain',
    studentUniversity = 'الجامعة الإماراتية الدولية – صنعاء',
    studentMajor = 'هندسة الميكاترونكس',
    pdfPageChoice,
    useSerwayReference = false,
    doctorConfig,
  } = params;

  const client = getGeminiClient();

  if (client) {
    try {
      const parts: any[] = [];

      const isPdfRequest = mode === 'pdf' || (mimeType && mimeType.includes('pdf')) || (fileName && fileName.toLowerCase().endsWith('.pdf'));

      // If multiple images/files are provided
      if (filesData && Array.isArray(filesData) && filesData.length > 0) {
        filesData.forEach((fileItem, idx) => {
          let cleanBase64 = fileItem.base64 || '';
          let detectedMime = fileItem.mimeType;

          if (typeof cleanBase64 === 'string' && cleanBase64.includes(',')) {
            const commaIdx = cleanBase64.indexOf(',');
            const meta = cleanBase64.slice(0, commaIdx);
            if (meta.startsWith('data:')) {
              const metaMime = meta.slice(5).split(';')[0].trim();
              if (metaMime) detectedMime = detectedMime || metaMime;
            }
            cleanBase64 = cleanBase64.slice(commaIdx + 1);
          }

          cleanBase64 = cleanBase64.replace(/\s+/g, '');
          let actualMime = (detectedMime || 'image/jpeg').split(';')[0].trim();
          if (actualMime === 'image/jpg') actualMime = 'image/jpeg';

          parts.push({
            inlineData: {
              mimeType: actualMime,
              data: cleanBase64,
            },
          });
          parts.push({
            text: `[صورة ${idx + 1} من أصل ${filesData.length} - ${fileItem.fileName || `الصورة رقم ${idx + 1}`}]`
          });
        });
      } else if (fileData) {
        // Single file / image / pdf / video
        let cleanBase64 = fileData || '';
        let detectedMime = mimeType;

        if (typeof cleanBase64 === 'string' && cleanBase64.includes(',')) {
          const commaIdx = cleanBase64.indexOf(',');
          const meta = cleanBase64.slice(0, commaIdx);
          if (meta.startsWith('data:')) {
            const metaMime = meta.slice(5).split(';')[0].trim();
            if (metaMime) detectedMime = detectedMime || metaMime;
          }
          cleanBase64 = cleanBase64.slice(commaIdx + 1);
        }

        cleanBase64 = cleanBase64.replace(/\s+/g, '');
        let actualMime = (detectedMime || (mode === 'pdf' ? 'application/pdf' : mode === 'video' ? 'video/mp4' : 'image/jpeg')).split(';')[0].trim();
        if (actualMime === 'image/jpg') actualMime = 'image/jpeg';

        // Enforce application/pdf for any PDF request or octet-stream containing pdf
        if (isPdfRequest || actualMime.includes('pdf') || actualMime.includes('octet-stream')) {
          actualMime = 'application/pdf';
        }

        if (actualMime === 'application/pdf') {
          let extractedPdfText = '';
          try {
            const pdfBuffer = Buffer.from(cleanBase64, 'base64');
            extractedPdfText = await extractTextFromPdfBuffer(pdfBuffer, pdfPageChoice);
            if (extractedPdfText) {
              console.log(`[PDF Extraction] Successfully extracted ${extractedPdfText.length} characters from PDF file: ${fileName || 'unnamed.pdf'}`);
            }
          } catch (pdfErr: any) {
            console.warn('[PDF Extraction] text extraction warning:', pdfErr?.message);
          }

          if (extractedPdfText.length > 0) {
            parts.push({
              text: `[محتوى ملف الـ PDF المرفوع - اسم الملف: ${fileName || 'ملف الدرس'}]:\n${extractedPdfText.slice(0, 50000)}`
            });
          }

          // If extracted text is short (scanned/image PDF without selectable text) or file is small (< 2.5MB),
          // include inlineData for multimodal inspection. If text was already extracted cleanly from a large PDF,
          // omitting heavy binary inlineData prevents timeouts while ensuring complete analysis.
          const approxSizeBytes = cleanBase64.length * 0.75;
          const isScannedOrShort = extractedPdfText.length < 200;
          const isSmallPdf = approxSizeBytes < 2.5 * 1024 * 1024;

          if (isScannedOrShort || isSmallPdf) {
            if (approxSizeBytes <= 15 * 1024 * 1024) {
              parts.push({
                inlineData: {
                  mimeType: 'application/pdf',
                  data: cleanBase64,
                },
              });
            }
          }
        } else {
          parts.push({
            inlineData: {
              mimeType: actualMime,
              data: cleanBase64,
            },
          });
        }
      }

      const levelDescriptions: Record<ExplainLevel, string> = {
        simple: 'شرح مبسط جداً من الصفر مع تشبيهات من الواقع والسيارات والروبوتات كأن الطالب يتعلم المفهوم لأول مرة',
        medium: 'شرح بمستوى طالب جامعي سنة أولى ميكاترونكس متوازن بين النظرية والتطبيق',
        advanced: 'شرح هندسي متقدم مع معادلات تفصيلية وتطبيقات صناعية في الأتمتة والميكاترونكس',
        short: 'ملخص مكثف وسريع جداً في نقاط مباشرة ليلة الامتحان',
      };

      const actionInstructions: Record<string, string> = {
        full_explain: 'تحليل المحتوى التعليمي كاملاً وشرحه وفق القالب الهندسي المعتمد بجميع أقسامه الـ 14 بدقة وأمانة علمية',
        simplify_more: 'التركيز على تبسيط الشرح بأقصى درجة ممكنة مع تشبيهات عملية حية من الحياة اليومية والسيارات والآلات لطالب مبتدئ',
        explain_point: `الطالب حدد هذه النقطة بالتحديد لشرحها: "${specificPart}". اشرح هذه النقطة بعمق وبساطة مع المحافظة على ترابط الدرس`,
        give_example: 'أنشئ مثالاً تعليمياً هندسياً إضافياً جديداً ومبتكراً يرتبط بهذا المفهوم خطوة بخطوة وضع isGenerated: true',
        test_me: 'أنشئ اختباراً تدريبياً جديداً ومتقناً مكوناً من 3 إلى 5 أسئلة متنوعة مع الإجابات وتفسيرها الدقيق',
        did_not_understand: 'الطالب ضغط "لم أفهم"؛ أعد الشرح بأسلوب مغاير تماماً وتشبيه يومي عملي جداً يزيل أي غموض',
        solve_example: 'ركز على تقديم مسألة ومثال محلول إضافي خطوة بخطوة بالتفصيل مع المعطيات والقوانين والناتج وتفسير النتيجة',
        generate_cheat_sheet: 'قم بإعداد ورقة مذاكرة شاملة جداً وجاهزة للطباعة والمراجعة السريعة ليلة الامتحان',
      };

      const hasAttachments = mode === 'image' || Boolean(fileData) || (filesData && filesData.length > 0);
      const imageSpecificInstructions = hasAttachments ? `
تعليمات دقيقة ومشددة لتحليل صور ومستندات الدروس والمسائل الهندسية المرفوعة (Vision / Math & Physics OCR & Solver):
1. افحص الصورة أو المستند المرفوع بعناية بالغة:
   - اقرأ كل المسائل الرياضية، المعادلات الفيزيائية، والتمارين الهندسية المكتوبة بوضوح (سواء بالعربية أو الإنجليزية).
   - إذا احتوت الصورة على مسائل رياضية، فيزيائية، أو هندسية:
     أ) حل المسألة بالكامل مع شرح الخطوات بالتفصيل الممل من المعطيات والقانون المباشر والتعويض والنتيجة النهائية والوحدة والتفسير الهندسي.
     ب) إذا كانت المسألة تتضمن فقرات متعددة (مثل: الفقرة أ، الفقرة ب، الفقرة ج... أو المطلوب 1، المطلوب 2، المطلوب 3):
        قم بحل **كل فقرة من الفقرات بدون استثناء** على حدة مع كتابة عنوان الفقرة، شرح خطوات حلها بالتفصيل، والنتيجة والوحدة لكل فقرة بشكل منفصل تحت قائمة "subParts".
     ج) إذا كانت الصورة تتضمن أسئلة اختيارات من متعدد (MCQ) أو خيارات (أ، ب، ج، د / A, B, C, D):
        قم بتحديد الاختيار الصحيح بدقة في "selectedOption"، واذكر السبب والتعليل والتطبيق الرياضي/الفيزيائي كاملاً وراء هذا الاختيار في "optionReasoning".
     د) إذا كانت الصورة تحتوي على أكثر من مسألة أو تمرين مستقل (مثلاً: مسألة 1 ومسألة 2):
        ضع المسألة الأولى في "solvedExample"، وضمن جميع المسائل المحلولة في القائمة "solvedExamples".
   - تعرّف على الدوائر الكهربائية والإلكترونية ومكوناتها (مقاومات R، مكثفات C، ملفات L، مصادر جهد وتيار AC/DC، ترانزستورات، دايودات، مفاتيح) وطريقة توصيلها، واشملها في حقل "circuitAnalysis".
2. فحص وضوح الصورة:
   - إذا كانت الصورة مشوشة، باهتة، مظلمة، مقطوعة، أو تمنع قراءة الأرقام والرموز بأمانة علمية:
     اجعل "isImageBlurry": true واكتب في "clarificationNotice": "الصورة غير واضحة بما يكفي لقراءة بعض المعادلات أو الأرقام بدقة، يرجى إعادة تصويرها بإضاءة كافية وزاوية مستقيمة."
3. فحص المحتوى التعليمي:
   - إذا كانت الصورة لا تحتوي على درس، مسألة، قانون، معادلة، دائرة، أو مخطط هندسي لمواد الميكاترونكس (مثل: صورة شخصية، سيارة بالشارع، صورة عشوائية فارغة):
     اجعل "isNotEducational": true واكتب في "notEducationalNotice": "الصورة المرفوعة لا تحتوي على درس أو مسألة أو مخطط هندسي واضح لمواد الميكاترونكس. يرجى رفع صورة لدفتر، سبورة، كتاب، ملزمة، أو دائرة كهربائية."
` : '';

      // RAG Retrieval for Serway Reference
      let serwayChunksContext = '';
      let retrievedSerwayChunks: any[] = [];
      let serwayStatusNotice = '';
      const serwayBook = getReferenceBookById(SERWAY_BOOK_ID);

      if (useSerwayReference) {
        const queryTopic = [prompt, fileName, specificPart].filter(Boolean).join(' ');
        if (serwayBook?.hasFile && serwayBook.processingStatus === 'ready') {
          const searchRes = searchBookChunks(SERWAY_BOOK_ID, queryTopic, 4);
          retrievedSerwayChunks = searchRes.chunks;
          if (retrievedSerwayChunks.length > 0) {
            serwayChunksContext = `
[المقاطع المسترجعة من مرجع Physics for Scientists and Engineers — Serway عبر محرك RAG]:
${retrievedSerwayChunks.map((c, i) => `--- [مقطع ${i + 1} - ${c.chapterTitle} (صفحة ${c.pageNumber || 'غير محددة'})] ---\n${c.content}`).join('\n\n')}

توجيهات صارمة للاقتباس والتوثيق من مرجع Serway:
1. استند إلى هذه المقاطع المسترجعة من كتاب Serway في صياغة الشرح والقوانين والمصطلحات.
2. اذكر رقم الصفحة والفصل بدقة كما ورد في المقاطع أعلاه في مصفوفة "serwayCitations".
3. ضع تمييزاً واضحاً بين:
   - المعلومات المسترجعة من مرجع Serway (اذكر رقم الصفحة والفصل).
   - المعلومات المستخرجة من ملف الطالب.
   - التوضيحات الهندسية الإضافية المولدة بالذكاء الاصطناعي.
4. لا تخترع أرقام صفحات أو فصول غير موجودة في المقاطع المسترجعة.
`;
          } else {
            serwayStatusNotice = 'تم البحث داخل مرجع Serway المفهرس ولم يتم العثور على مقاطع مباشرة مطابقة لموضوع الدرس. تم إعداد الشرح اعتماداً على محتوى الطالب والمعرفة الفيزيائية العامة دون ادعاء الاقتباس.';
          }
        } else {
          serwayStatusNotice = 'مرجع Physics for Scientists and Engineers — Serway غير مرفوع حالياً في النظام من قبل إدارة الأكاديمية. تم بناء الشرح اعتماداً على محتوى الطالب والمعرفة الهندسية المعتمدة دون ادعاء الاقتباس من صفحات الكتاب.';
        }
      }

      // Smart Doctor configuration prompt
      let smartDoctorPrompt = '';
      if (doctorConfig?.enabled) {
        const styleLabels: Record<string, string> = {
          simplified_beginner: 'شرح مبسط للمبتدئين من الصفر مع تشبيهات ملموسة',
          university_detailed: 'شرح جامعي مفصل وأكاديمي متعمق مع ربط بالنظريات الهندسية',
          formulas_derivation: 'شرح القوانين واشتقاقها ودلالة رموزها ووحداتها وأبعادها الفيزيائية',
          step_by_step_problems: 'حل المسائل خطوة بخطوة بالتعويض الدقيق وتفسير النتيجة',
          diagrams_visual: 'شرح بالرسومات والمخططات التوضيحية وتوزيع القوى والدوائر',
          practical_applications: 'أمثلة وتطبيقات هندسية وميكاترونية في الروبوتات والسيارات والمصانع',
          exam_review: 'مراجعة مركزة للامتحان النهائي والأسئلة المتوقعة والأخطاء الشائعة',
          practice_questions: 'أسئلة تدريبية وتمارين متنوعة مع الحل النموذجي خطوة بخطوة',
        };

        smartDoctorPrompt = `
[إعدادات خدمة الدكتور الذكي]:
- اسم المحاضر / الدكتور: ${doctorConfig.doctorName || 'دكتور المادة'}
- الجامعة: ${doctorConfig.university || studentUniversity}
- المستوى: ${doctorConfig.studyLevel || 'السنة الأولى'}
- المادة: ${doctorConfig.subject || 'الفيزياء الهندسية 1'}
- أسلوب الشرح المختار: ${styleLabels[doctorConfig.explanationStyle || ''] || 'شرح جامعي مفصل'}
- مدة الشرح المستهدفة: ${doctorConfig.durationMinutes || 15} دقيقة
تنبيه مهني وأكاديمي: قدم الشرح بأسلوب المحاضر الجامعي المتمرس (${doctorConfig.doctorName || 'دكتور المادة'}) مع التأكيد على أنه شرح تعليمي ذكي ميسر لمساعدة الطالب.
`;
      }

      const userInstructionPrompt = `
أنت مدرس جامعي ذكي متخصص في هندسة الميكاترونكس، ومهمتك مساعدة طالب سنة أولى في الجامعات اليمنية (${studentUniversity}) في تخصص (${studentMajor}) على فهم الدرس الذي يرفعه بطريقة سهلة ومبسطة ومختصرة، مع المحافظة التامة على المعلومات المهمة الموجودة في المحتوى الأصلي دون حذفها.

${smartDoctorPrompt}
${serwayChunksContext}
${serwayStatusNotice ? `[تنبيه حالة المرجع]: ${serwayStatusNotice}` : ''}

المعطيات:
- نوع المحتوى المرفوع: ${mode}
${fileName ? `- اسم الملف: ${fileName}` : ''}
${pdfPageChoice?.mode === 'pages' && pdfPageChoice.selectedPages ? `- اختيار صفحات PDF محددة: "${pdfPageChoice.selectedPages}"` : ''}
${prompt ? `- استفسار أو نص الطالب: "${prompt}"` : ''}
${specificPart ? `- الطالب حدد هذا الجزء للتركيز عليه: "${specificPart}"` : ''}
- مستوى الشرح المطلوب: ${levelDescriptions[explanationLevel] || levelDescriptions.simple}
- الإجراء المطلوب: ${actionInstructions[actionType] || actionInstructions.full_explain}
${useSerwayReference ? '- خيار استخدام مرجع Serway: مفعل' : ''}

${imageSpecificInstructions}

منهجية معالجة الدرس وحل المسائل الهندسية بالنهج الإلزامي خطوة بخطوة (Mandatory Step-by-Step Engineering Methodology):
يجب عليك إجبارياً وتطبيقياً تفكيك أي مسألة أو مثال أو شرح وفق الخطوات الست الصارمة التالية بدقة متناهية:
1. 📥 المعطيات (Given):
   - استخرج وحصر كل المعطيات الرقمية، الرمزية، والفيزيائية المذكورة في المحتوى أو الصورة أو المسألة بدقة متناهية.
   - اكتب كل معطى بصيغة: الرمز = القيمة + الوحدة الأصلية.
   - إذا كانت الوحدات تحتاج إلى تحويل إلى النظام الدولي (SI Units) مثل (cm -> m, mm -> m, mA -> A, kΩ -> Ω, g -> kg, rpm -> rad/s, min -> s, hr -> s, μF -> F): اذكر خطوة التحويل الحسابي صراحة وبشكل منفصل.
2. 🎯 المطلوب (Required):
   - حدد المطلوب إيجاده أو برهانه بدقة مطلقة لكل فرع أو فقرة (أ، ب، ج... أو المطلوب 1، 2، 3) دون إغفال أي جزئية.
3. 📐 القوانين والمعادلات الحاكمة (Formulas):
   - اذكر القانون والمعادلة الحاكمة بصيغتها الدقيقة المعتمدة (Governing Formula) مع توضيح شروط تطبيقها ودلالات كافة الرموز الفيزيائية وأبعادها.
4. 🔢 خطوات الحل التفصيلية خطوة بخطوة (Step-by-Step Execution):
   - قسّم الحل إلى خطوات متسلسلة ومرقمة [الخطوة 1]، [الخطوة 2]، [الخطوة 3]...
   - اكتب خطوات التعويض المباشر بالأرقام داخل القانون بوضوح تام وبدون قفزات.
   - أظهر كافة العمليات الحسابية والرياضية الوسيطة (الضرب، القسمة، التربيع، الجذور، الزوايا) مع تدقيق العمليات الحسابية للأرقام والنواتج لمنع أي خطأ حسابي.
   - إذا كانت المسألة تتضمن فقرات متعددة (أ، ب، ج...): قم بحل كل فقرة ومطلوب على حدة وبنفس التفصيل والتعويض الدقيق في قائمة "subParts".
5. 🏁 الناتج النهائي والوحدة القياسية (Final Result & Units):
   - اكتب الناتج النهائي بدقة متناهية مع كتابة الوحدة الفيزيائية الصحيحة في النظام الدولي (N, J, W, V, A, Ω, F, H, m/s, m/s², Pa...).
6. 🔬 التحليل النهائي والتفسير الهندسي (Final Analysis & Engineering Insights):
   - وضّح المعنى الهندسي والفيزيائي للنتيجة (Why this result): اشرح بلغة هندسية سهلة ماذا يعني هذا الرقم وما دلالته في الواقع العملي لأجهزة وأنظمة الميكاترونكس (الروبوتات، المحركات، الحساسات، الأتمتة).
   - إجراء فحص منطقي للنتيجة (Sanity Check) للتحقق من توافقها الفيزيائي.
   - إذا كان السؤال اختياراً من متعدد (MCQ): اذكر الخيار الصحيح بدقة مع البرهان والاشتقاق الرياضي والفيزيائي وسبب استبعاد بقية الخيارات.
   - في الدوائر الكهربائية (أوم، كيرشوف KVL/KCL، المقاومات، المكثفات، مصادر الجهد والتيار، مقسم الجهد والتيار): حدد المسارات والاتجاهات والعقد واشرح طريقة الحل خطوة بخطوة بالقيم الدقيقة.

الشرح الهندسي المبسط والعميق:
- ابدأ بـ "الدرس ببساطة": ما هو الموضوع؟ ولماذا ندرسه؟ وأين نراه في الروبوتات والسيارات والماكينات الميكاترونية؟
- لا تحذف أي معلومة أو قانون أساسي من الدرس الأصلي من أجل الاختصار، بل نظمه وبسطه ورتبه منطقياً.
- اذكر القوانين مع شرح دلالة كل رمز ووحدته وأبعاده الفيزيائية.
- إذا احتجت إلى إضافة معلومة لم تكن موجودة في الملف الأصلي لتوضيح فكرة غامضة، ضع علامة: "💡 معلومة إضافية للتوضيح" (أو isAdditionalNote: true).
- إذا كانت الصورة غير واضحة بما يكفي لقراءة جزء معين أو أرقام، لا تخمن! اكتب في clarificationNotice: "الصورة غير واضحة بما يكفي لقراءة هذا الجزء، يرجى رفع صورة أوضح."
   - إذا كان المحتوى فيديو، لخص ما تم استخراجه بصدق؛ وإذا كانت هناك قيود اذكرها في videoSupportNotice.
   - إذا كان ملف PDF طويلاً، قسّمه إلى أقسام منظمة بدلاً من حذف المعلومات.

يجب إخراج الناتج حصراً كـ JSON صالح ومطابق تماماً للبنية التالية:
{
  "lessonTitle": "📚 اسم الدرس المستخرج من المحتوى بدقة",
  "subjectName": "اسم المادة (مثل: فيزياء 1 / دوائر كهربائية 1 / تفاضل وتكامل 1 / ميكانيكا هندسية / كيمياء هندسية / مقدمة ميكاترونكس)",
  "simpleIdea": "💡 الدرس ببساطة: فقرة سهلة ومفهومة تشرح: ما هو الموضوع؟ ماذا يعني؟ لماذا ندرسه؟ وأين يستخدم في الميكاترونكس؟",
  "coreTakeaways": [
    "🎯 أهم الأفكار: النقطة الأساسية الأولى المستخرجة من الدرس",
    "🎯 النقطة الأساسية الثانية دون حذف أي فكرة مهمة",
    "🎯 النقطة الأساسية الثالثة",
    "🎯 النقطة الأساسية الرابعة"
  ],
  "conceptExplanations": [
    {
      "concept": "اسم المفهوم العلمي",
      "simplifiedExplanation": "شرح المفهوم بأسلوب مبسط جداً يفهمه طالب سنة أولى",
      "scientificDefinition": "التعريف العلمي الدقيق المستخرج من المحتوى",
      "practicalAnalogy": "تشبيه واقعي ملموس من السيارات أو الروبوتات أو الحياة اليومية",
      "isAdditionalNote": false
    }
  ],
  "terms": [
    {
      "term": "المصطلح بالعربية",
      "englishTerm": "English Scientific Term",
      "meaning": "معنى المصطلح بطريقة بسيطة",
      "practicalAnalogy": "تشبيه عملي ملموس",
      "isAdditionalNote": false
    }
  ],
  "formulas": [
    {
      "equation": "صيغة القانون (مثال: F = m × a أو V = I × R)",
      "meaning": "شرح معنى القانون والغرض منه",
      "whenToUse": "متى يستخدم هذا القانون بالتحديد في المسائل والتطبيقات؟",
      "symbols": [
        {
          "symbol": "F",
          "name": "القوة",
          "unit": "Newton (N)",
          "dimension": "[F] = M L T^-2"
        },
        {
          "symbol": "m",
          "name": "الكتلة",
          "unit": "Kilogram (kg)",
          "dimension": "M"
        },
        {
          "symbol": "a",
          "name": "التسارع",
          "unit": "m/s²",
          "dimension": "L T^-2"
        }
      ]
    }
  ],
  "units": [
    {
      "quantity": "اسم الكمية (مثال: القوة)",
      "unitName": "نيوتن (Newton)",
      "unitSymbol": "N",
      "notes": "1 N = 1 kg·m/s²"
    }
  ],
  "dimensions": [
    {
      "quantity": "القوة",
      "formula": "F = m × a",
      "dimensionStr": "[F] = M L T⁻²",
      "explanation": "M تعبر عن الكتلة، L عن الطول، T⁻² عن مربع الزمن في المقام"
    }
  ],
  "solvedExample": {
    "problem": "نص المسألة أو التمرين الرئيسي المذكور في الصورة",
    "given": ["المعطى 1: الكتلة m = 5 kg", "المعطى 2: التسارع a = 2 m/s²"],
    "required": "المطلوب: حساب القوة F وإجابة فقرات المسألة",
    "formulaUsed": "F = m × a",
    "steps": [
      "الخطوة 1: التأكد من تجانس الوحدات في النظام الدولي (kg, m/s²)",
      "الخطوة 2: التعويض المباشر في القانون: F = 5 × 2",
      "الخطوة 3: إتمام عملية الضرب الرياضية"
    ],
    "calculation": "F = 5 × 2 = 10",
    "unit": "N (نيوتن)",
    "finalAnswer": "F = 10 N",
    "whyThisResult": "تفسير النتيجة: القوة الناتجة تعني أننا نحتاج إلى 10 نيوتن لدفع كتلة 5 كجم بتسارع 2 م/ث²",
    "finalAnalysis": "🔬 التحليل الهندسي النهائي: النتيجة تتطابق مع مبدأ التناسب الطردي بين القوة والتسارع، وتُستخدم هذه الحسابات في ميكاترونكس لتحديد عزم المحرك وعزم القصور الذاتي للروبوت.",
    "isGenerated": false,
    "note": "⚠️ انتبه دائماً إلى تحويل الوحدات قبل التعويض",
    "isMultipleParts": true,
    "subParts": [
      {
        "partLabel": "الفقرة (أ) / المطلوب الأول",
        "question": "احسب القوة المؤثرة على الجسم",
        "given": ["m = 5 kg", "a = 2 m/s²"],
        "required": "القوة F",
        "formulaUsed": "F = m × a",
        "steps": [
          "الخطوة 1: تحديد القانون المناسب F = m × a",
          "الخطوة 2: التعويض المباشر 5 × 2",
          "الخطوة 3: إتمام عملية الضرب"
        ],
        "calculation": "5 × 2 = 10",
        "unit": "N",
        "finalAnswer": "F = 10 N",
        "whyThisResult": "القوة تتناسب طرديا مع الكتلة والتسارع",
        "finalAnalysis": "التحليل النهائي: القوة المطلوبة تقع ضمن نطاق مشغلات الروبوتات الصناعية الخفيفة."
      },
      {
        "partLabel": "الفقرة (ب) / الاختيار الصحيح",
        "question": "ما هو اتجاه حركة الجسم؟",
        "isMcq": true,
        "mcqOptions": ["أ) في اتجاه القوة المؤثرة", "ب) عكس اتجاه القوة", "ج) عمودي على القوة", "د) ساكن"],
        "selectedOption": "أ) في اتجاه القوة المؤثرة",
        "optionReasoning": "حسب قانون نيوتن الثاني، يتسارع الجسم في نفس الاتجاه الذي تؤثر فيه القوة المحصلة.",
        "steps": ["مراجعة قانون نيوتن الثاني للتحرك"],
        "finalAnswer": "الخيار (أ) هو الصحيح",
        "finalAnalysis": "التحليل الفيزيائي: متجهة التسارع تكون دوماً متطابقة في الاتجاه مع متجهة محصلة القوى."
      }
    ],
    "isMcqQuestion": false,
    "mcqOptions": [],
    "selectedOption": "",
    "optionReasoning": ""
  },
  "solvedExamples": [
    {
      "problem": "مسألة 2: احسب الشغل المبذول لنقل جسم مسافة 4 أمتار بقوة 10 نيوتن",
      "given": ["F = 10 N", "d = 4 m"],
      "required": "حساب الشغل W",
      "formulaUsed": "W = F × d",
      "steps": ["الخطوة 1: استدعاء قانون الشغل W = F × d", "الخطوة 2: التعويض بالأرقام: W = 10 × 4", "الخطوة 3: حساب الناتج النهائي بوحدة الجول"],
      "calculation": "W = 10 × 4 = 40 J",
      "unit": "Joule (J)",
      "finalAnswer": "W = 40 J",
      "whyThisResult": "الشغل يساوي حاصل ضرب القوة في الإزاحة باتجاهها",
      "finalAnalysis": "التحليل النهائي: الشغل الميكانيكي المنجز يمثل الطاقة المصروفة، وهو ما يقابل عزم الدوران والمسافة الزاوية في مفاصل الروبوتات.",
      "isGenerated": false
    }
  ],
  "importantNotes": [
    {
      "note": "⚠️ ملاحظة هامة: انتبه إلى تحويل الوحدات إلى النظام الدولي (SI Units) قبل التعويض في المعادلات",
      "type": "warning",
      "isAdditionalNote": false
    }
  ],
  "memoryAids": [
    "🧠 كيف أتذكر الدرس: مثلث قانون أوم (V في الأعلى، I و R في الأسفل)"
  ],
  "summaryPoints": [
    "📝 الخلاصة: تلخيص مكثف جداً يمكن قراءته في دقيقة أو دقيقتين ويشمل زبدة الدرس الأساسية"
  ],
  "learningObjectives": [
    "✓ تعريف وفهم المفهوم الأساسي في الدرس وتطبيقاته",
    "✓ معرفة جميع القوانين الرياضية والرموز وشروط استخدامها",
    "✓ معرفة الوحدات الدولية والأبعاد الفيزيائية لكل كمية",
    "✓ القدرة على حل مسألة تطبيقية خطوة بخطوة بالتعويض السليم"
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "نص السؤال من صميم محتوى الدرس",
      "type": "mcq",
      "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"],
      "correctAnswer": "خيار أ",
      "explanation": "شرح مختصر ومباشر لسبب صحة هذا الخيار دون غيره"
    },
    {
      "id": "q2",
      "question": "سؤال صح أو خطأ مفاهيمي من الدرس",
      "type": "true_false",
      "options": ["صح", "خطأ"],
      "correctAnswer": "صح",
      "explanation": "تفسير سبب صحة أو خطأ العبارة علمياً"
    },
    {
      "id": "q3",
      "question": "سؤال تطبيقي أو مسألة حسابية سريعة من الدرس",
      "type": "conceptual",
      "options": ["الاحتمال 1", "الاحتمال 2", "الاحتمال 3"],
      "correctAnswer": "الاحتمال 1",
      "explanation": "الشرح الرياضي أو الهندسي للإجابة"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "الخطأ الشائع الذي يقع فيه طلاب السنة الأولى",
      "correction": "التصرف الهندسي الصحيح لتفادي هذا الخطأ",
      "why": "السبب العلمي وراء ضرورة هذا التصحيح"
    }
  ],
  "suggestedTools": [
    {
      "toolId": "circuits",
      "title": "مختبر الدوائر الكهربائية",
      "subtitle": "محاكاة التوصيل وقوانين كيرشوف وأوم",
      "icon": "circuits",
      "reason": "لتجربة القوانين عملياً ومحاكاة التوصيل"
    }
  ],
  "circuitAnalysis": {
    "hasCircuit": false,
    "circuitType": "",
    "components": [],
    "analysisSummary": ""
  },
  "imagesBreakdown": [
    {
      "imageIndex": 1,
      "imageTitle": "📸 الصورة 1 / الصفحة 1: عنوان الصفحة أول الدرس",
      "summary": "تلخيص الفكرة المعروضة في هذه الصورة/الصفحة بالتحديد",
      "extractedContent": "المعادلات والقوانين والنصوص المستخرجة من هذه الصورة بوضوح",
      "detailedExplanation": "الشرح والتبسيط خطوة بخطوة لما تحتويه هذه الصورة بالتحديد",
      "keyTakeaways": ["نقطة هامة من الصورة 1"],
      "solvedProblemsInImage": ["حل تمرين أو مسألة في الصورة 1"]
    }
  ],
  "clarificationNotice": "",
  "isImageBlurry": false,
  "isNotEducational": false,
  "notEducationalNotice": "",
  "videoSupportNotice": "",
  "studySheetMarkdown": "ورقة مذاكرة مركزة تضم ملخص المفاهيم، جدول القوانين والوحدات، والأخطاء الواجب تجنبها ليلة الاختبار."
}
`;

      parts.push({ text: userInstructionPrompt });

      let parsed: any = null;
      let modelUsed = '';
      try {
        const genResult = await callGeminiWithResilience(client, {
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
          preferredModel: 'gemini-3.1-pro-preview',
          fallbackModels: [
            'gemini-3.1-pro-preview',
            'gemini-3.8-flash',
            'gemini-3.1-flash-lite',
            'gemini-flash-latest',
          ],
        });
        modelUsed = genResult.modelUsed;
        parsed = safeExtractJson(genResult.text);
      } catch (geminiCallError: any) {
        console.warn('Gemini generateContent call failed across all resilience models, using smart educational fallback:', geminiCallError?.message);
      }

      if (parsed && typeof parsed === 'object') {
        return {
          id: 'expl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          studentId: params.studentId,
          lessonTitle: parsed.lessonTitle || 'درس هندسي متخصص',
          subjectName: parsed.subjectName || 'هندسة الميكاترونكس 1',
          sourceType: mode,
          fileName: fileName,
          createdAt: new Date().toISOString(),
          explanationLevel,
          simpleIdea: parsed.simpleIdea || 'فكرة الدرس الأساسية تم تلخيصها بأسلوب مبسط.',
          coreTakeaways: Array.isArray(parsed.coreTakeaways) ? parsed.coreTakeaways : ['فهم المفاهيم الأساسية وتطبيقاتها'],
          conceptExplanations: Array.isArray(parsed.conceptExplanations) ? parsed.conceptExplanations : [],
          terms: Array.isArray(parsed.terms) ? parsed.terms : [],
          formulas: Array.isArray(parsed.formulas) ? parsed.formulas : [],
          units: Array.isArray(parsed.units) ? parsed.units : [],
          dimensions: Array.isArray(parsed.dimensions) ? parsed.dimensions : [],
          solvedExample: parsed.solvedExample || {
            problem: 'مسألة تدريبية',
            given: [],
            required: 'الحل',
            formulaUsed: '',
            steps: [],
            finalAnswer: '',
            isGenerated: true,
          },
          importantNotes: Array.isArray(parsed.importantNotes) ? parsed.importantNotes : [],
          memoryAids: Array.isArray(parsed.memoryAids) ? parsed.memoryAids : [],
          summaryPoints: Array.isArray(parsed.summaryPoints) ? parsed.summaryPoints : [],
          learningObjectives: Array.isArray(parsed.learningObjectives) ? parsed.learningObjectives : [],
          quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
          commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes : [],
          suggestedTools: Array.isArray(parsed.suggestedTools) ? parsed.suggestedTools : [],
          circuitAnalysis: parsed.circuitAnalysis,
          imagesBreakdown: Array.isArray(parsed.imagesBreakdown)
            ? parsed.imagesBreakdown.map((item: any, idx: number) => ({
                imageIndex: item.imageIndex || (idx + 1),
                imageTitle: item.imageTitle || `الصورة ${idx + 1}`,
                summary: item.summary || '',
                extractedContent: item.extractedContent || '',
                detailedExplanation: item.detailedExplanation || '',
                keyTakeaways: Array.isArray(item.keyTakeaways) ? item.keyTakeaways : [],
                solvedProblemsInImage: Array.isArray(item.solvedProblemsInImage) ? item.solvedProblemsInImage : [],
                previewUrl: filesData && filesData[idx]
                  ? (filesData[idx].base64.startsWith('data:')
                      ? filesData[idx].base64
                      : `data:${filesData[idx].mimeType || 'image/jpeg'};base64,${filesData[idx].base64}`)
                  : undefined,
              }))
            : undefined,
          totalImagesCount: filesData?.length || (fileData ? 1 : 0),
          clarificationNotice: parsed.clarificationNotice,
          isImageBlurry: Boolean(parsed.isImageBlurry),
          isNotEducational: Boolean(parsed.isNotEducational),
          notEducationalNotice: parsed.notEducationalNotice,
          videoSupportNotice: parsed.videoSupportNotice,
          studySheetMarkdown: parsed.studySheetMarkdown,
          pdfPageChoice: params.pdfPageChoice,
          isAiGenerated: true,
          modelUsed,
          usedSerwayReference: Boolean(useSerwayReference && retrievedSerwayChunks.length > 0),
          serwayCitations: Array.isArray(parsed.serwayCitations) && parsed.serwayCitations.length > 0
            ? parsed.serwayCitations
            : (useSerwayReference && retrievedSerwayChunks.length > 0
                ? retrievedSerwayChunks.map((c: any) => ({
                    chapterTitle: c.chapterTitle,
                    pageNumber: c.pageNumber,
                    snippet: c.snippet || c.content.slice(0, 160),
                    confidence: 0.95
                  }))
                : undefined),
          serwayStatusNotice: serwayStatusNotice || (useSerwayReference && retrievedSerwayChunks.length > 0
            ? `تم استرجاع مقاطع موثقة من مرجع Serway (الفصل: ${retrievedSerwayChunks[0]?.chapterTitle || 'الفيزياء الهندسية'}) وتضمينها بأمانة في الشرح.`
            : undefined),
          smartDoctorConfig: doctorConfig?.enabled ? doctorConfig : undefined,
          educationalPresentation: buildEducationalPresentation(
            parsed.lessonTitle || 'الدرس الهندسي',
            parsed.simpleIdea || '',
            parsed.formulas || [],
            parsed.solvedExample || null,
            parsed.commonMistakes || [],
            parsed.summaryPoints || []
          ),
          sourceAttributions: {
            fromStudentFile: mode !== 'text' || fileName ? [`المحتوى المرفوع: ${fileName || 'بيانات الطالب'}`] : [],
            fromSerwayBook: (useSerwayReference && retrievedSerwayChunks.length > 0)
              ? retrievedSerwayChunks.map((c: any) => `${c.chapterTitle} (صفحة ${c.pageNumber || 'غير محددة'})`)
              : [],
            fromAiSynthesis: ['صياغة وتبسيط الذكاء الاصطناعي الأكاديمي'],
          },
        };
      }
    } catch (err: any) {
      console.warn('Unexpected error in processExplainLesson, using smart educational fallback:', err?.message);
    }
  }

  // Smart fallback generator when API key is not present or API call fails
  const fallback = generateFallbackExplainedLesson(params);
  fallback.isAiGenerated = false;
  fallback.educationalPresentation = buildEducationalPresentation(
    fallback.lessonTitle,
    fallback.simpleIdea,
    fallback.formulas,
    fallback.solvedExample,
    fallback.commonMistakes,
    fallback.summaryPoints
  );

  if (params.useSerwayReference) {
    const serwayBook = getReferenceBookById(SERWAY_BOOK_ID);
    if (serwayBook?.hasFile) {
      const searchRes = searchBookChunks(SERWAY_BOOK_ID, params.prompt || params.fileName || '', 3);
      if (searchRes.chunks.length > 0) {
        fallback.usedSerwayReference = true;
        fallback.serwayCitations = searchRes.chunks.map(c => ({
          chapterTitle: c.chapterTitle,
          pageNumber: c.pageNumber,
          snippet: c.snippet || c.content.slice(0, 160),
          confidence: 0.9,
        }));
      } else {
        fallback.serwayStatusNotice = 'مرجع Serway مفهرس ولكن لم يعثر على مقطع مطابق تماماً للبحث، تم إعداد الشرح اعتماداً على المنهاج المعتمد.';
      }
    } else {
      fallback.serwayStatusNotice = 'مرجع Physics for Scientists and Engineers — Serway غير مرفوع حالياً في المنصة من قبل الإدارة. تم تقديم الشرح وفق مفردات الفيزياء الهندسية المعتمدة دون ادعاء الاقتباس.';
    }
  }

  if (params.doctorConfig?.enabled) {
    fallback.smartDoctorConfig = params.doctorConfig;
  }

  fallback.noticeMessage = 'تم تحضير الشرح بالاعتماد على المنظومة التعليمية الهندسية المعتمدة لضمان استمرار دراستك بسلاسة دون تأخير.';
  return fallback;
}

// Rich Mechatronics Curriculum Fallback Generator
export function generateFallbackExplainedLesson(params: ExplainRequestParams): ExplainLessonResult {
  const textSample = (params.prompt || params.fileName || '').toLowerCase();
  const level = params.explanationLevel || 'simple';

  // Topic detection
  const isCircuits = textSample.includes('أوم') || textSample.includes('ohm') || textSample.includes('جهد') || textSample.includes('تيار') || textSample.includes('دائر') || textSample.includes('circuit') || textSample.includes('مقاوم') || textSample.includes('كيرشوف');
  const isMechanics = textSample.includes('نيوتن') || textSample.includes('newton') || textSample.includes('قوة') || textSample.includes('force') || textSample.includes('تسارع') || textSample.includes('كتلة') || textSample.includes('حركة');
  const isTorque = textSample.includes('عزم') || textSample.includes('torque') || textSample.includes('محرك') || textSample.includes('دوران');
  const isMath = textSample.includes('تفاضل') || textSample.includes('تكامل') || textSample.includes('متجهات') || textSample.includes('vector') || textSample.includes('مصفوف');

  if (isCircuits) {
    return {
      id: 'expl-' + Date.now(),
      lessonTitle: 'قانون أوم وتحليل الدوائر الكهربائية البسيطة',
      subjectName: 'دوائر كهربائية 1 (Electric Circuits I)',
      sourceType: params.mode,
      fileName: params.fileName,
      createdAt: new Date().toISOString(),
      explanationLevel: level,
      simpleIdea: level === 'short'
        ? 'الجهد يسبب تدفق التيار، والمقاومة تعيقه: V = I × R.'
        : 'تخيل أن الكهرباء مثل شبكة مياه منزلية: مضخة الماء هي مصدر الجهد (Voltage) تدفع الماء، وكمية الماء المتدفقة في الأنبوب هي التيار (Current)، بينما أي تضيق أو محبس في الأنبوب هو المقاومة (Resistance). كلما زادت قوة المضخة زاد التدفق، وكلما ضاق الأنبوب قل التدفق.',
      coreTakeaways: [
        'فرق الجهد (V) هو الشغل اللازم لنقل شحنة كهربائية بين نقطتين، ويقاس بالفولت (V).',
        'شدة التيار (I) هي معدل تدفق الشحنات عبر مقطع الموصل بالزمن، وتقاس بالأمبير (A).',
        'المقاومة (R) هي خاصية المادة لإعاقة مرور التيار الكهربائي، وتقاس بالأوم (Ω).',
        'العلاقة طردية بين الجهد والتيار عند ثبوت المقاومة ودرجة الحرارة.',
      ],
      conceptExplanations: [
        {
          concept: 'فرق الجهد الكهربائي (Voltage)',
          simplifiedExplanation: 'الجهد هو القوة الدافعة التي تدفع الإلكترونات للتحرك داخل السلك، تماماً مثل ضغط الماء في الخرطوم.',
          scientificDefinition: 'الشغل المبذول لنقل شحنة كهربائية موجبة مقدارها كولوم واحد بين نقطتين في مجال كهربائي.',
          practicalAnalogy: 'يشبه ضغط خزان الماء المرتفع فوق سطح المنزل الذي يدفع الماء للنزول بقوة.',
          isAdditionalNote: false,
        },
        {
          concept: 'شدة التيار الكهربائي (Electric Current)',
          simplifiedExplanation: 'كمية الإلكترونات والشحنات التي تعبر في الثانية الواحدة، كلما زادت زادت شدة التيار وسخونة السلك.',
          scientificDefinition: 'المعدل الزمني لتدفق الشحنات الكهربائية عبر مقطع عرضي في موصل: I = dq / dt.',
          practicalAnalogy: 'يشبه معدل تدفق لترات الماء المتدفقة في الأنبوب كل ثانية.',
          isAdditionalNote: false,
        },
        {
          concept: 'المقاومة الكهربائية (Electrical Resistance)',
          simplifiedExplanation: 'المقاومة هي صعوبة مرور التيار داخل المادة واصطدام الإلكترونات بذرات السلك.',
          scientificDefinition: 'خاصية مادية تعبر عن إعاقة الموصل لمرور الشحنات الكهربائية: R = ρ · L / A.',
          practicalAnalogy: 'يشبه وضع إسفنجة أو تضيق داخل أنبوب الماء يقلل من سرعة تدفقه.',
          isAdditionalNote: false,
        },
      ],
      terms: [
        {
          term: 'فرق الجهد الكهربائي',
          englishTerm: 'Voltage / Potential Difference (V)',
          meaning: 'طاقة الدفع الكهربائية التي تحرك الإلكترونات عبر الدائرة.',
          practicalAnalogy: 'يشبه ضغط الماء العالي في خزان أعلى المنزل.',
        },
        {
          term: 'شدة التيار الكهربائي',
          englishTerm: 'Electric Current (I)',
          meaning: 'كمية الشحنة الكهربائية التي تعبر نقطة في الدائرة خلال ثانية واحدة.',
          practicalAnalogy: 'يشبه سرعة وحجم تدفق الماء داخل الخرطوم.',
        },
        {
          term: 'المقاومة الكهربائية',
          englishTerm: 'Electrical Resistance (R)',
          meaning: 'ممانعة المادة لسريان الإلكترونات داخلها وتحويل جزء من طاقتها لحرارة.',
          practicalAnalogy: 'يشبه الصخور والعوائق داخل مجرى النهر التي تبطئ جريانه.',
        },
      ],
      formulas: [
        {
          equation: 'V = I × R',
          meaning: 'قانون أوم الأساسي: فرق الجهد بين طرفي مقاومة يساوي حاصل ضرب شدة التيار المار فيها في قيمة المقاومة.',
          symbols: [
            { symbol: 'V', name: 'فرق الجهد (Voltage)', unit: 'Volt (V)', dimension: 'M L² T⁻³ I⁻¹' },
            { symbol: 'I', name: 'شدة التيار (Current)', unit: 'Ampere (A)', dimension: 'I' },
            { symbol: 'R', name: 'المقاومة (Resistance)', unit: 'Ohm (Ω)', dimension: 'M L² T⁻³ I⁻²' },
          ],
        },
        {
          equation: 'P = V × I = I² × R',
          meaning: 'القدرة الكهربائية المستهلكة في المقاومة على شكل حرارة أو طاقة مفيدة.',
          symbols: [
            { symbol: 'P', name: 'القدرة الكهربائية (Power)', unit: 'Watt (W)', dimension: 'M L² T⁻³' },
          ],
        },
      ],
      units: [
        { quantity: 'فرق الجهد', unitName: 'فولت', unitSymbol: 'V' },
        { quantity: 'شدة التيار', unitName: 'أمبير', unitSymbol: 'A' },
        { quantity: 'المقاومة', unitName: 'أوم', unitSymbol: 'Ω' },
        { quantity: 'القدرة', unitName: 'واط', unitSymbol: 'W' },
      ],
      dimensions: [
        {
          quantity: 'المقاومة الكهربائية (R)',
          formula: 'R = V / I = (W / Q) / I',
          dimensionStr: '[R] = M L² T⁻³ I⁻²',
          explanation: 'كتلة × مسافة مربعة ÷ (مكعب الزمن × مربع شدة التيار). يساعدك فحص الأبعاد على التأكد من صحة القوانين في اختبارات الدوائر.',
        },
      ],
      solvedExample: {
        problem: 'دائرة إلكترونية بسيطة لتشغيل دايود ضوئي (LED) في مشروع ميكاترونكس يعمل بجهد 2V وتيار 20mA، والمصدر المتاح بطارية 9V. احسب المقاومة الواجب وضعها على التوالي لحماية الـ LED.',
        given: [
          'جهد المصدر: V_source = 9 V',
          'جهد عمل الدايود: V_led = 2 V',
          'تيار الدائرة: I = 20 mA = 20 × 10⁻³ A = 0.02 A',
        ],
        required: 'قيمة المقاومة المطلوبة R وقدرتها P_resistor لحمايتها من الاحتراق.',
        formulaUsed: 'R = (V_source - V_led) / I',
        steps: [
          'الخطوة 1: حساب فرق الجهد الذي يجب أن يسقط على المقاومة: V_R = 9V - 2V = 7V.',
          'الخطوة 2: تحويل التيار إلى الوحدة الدولية (SI): 20mA = 0.02A.',
          'الخطوة 3: تطبيق قانون أوم لحساب المقاومة: R = 7 / 0.02 = 350 Ω.',
          'الخطوة 4: حساب القدرة المبددة: P = V_R × I = 7 × 0.02 = 0.14 W (نختار مقاومة ربع واط 0.25W بأمان).',
        ],
        finalAnswer: 'R = 350 Ω (أو أقرب قيمة قياسية تجارية 360 Ω أو 390 Ω)، بقدرة 0.25 Watt.',
        calculation: 'R = (9 - 2) / 0.02 = 7 / 0.02 = 350 Ω',
        unit: 'Ω (أوم)',
        whyThisResult: 'النتيجة تضمن أن تيار الدايود لن يتجاوز 20 ميلي أمبير حتى لا يحترق، مع توزيع الجهد بين المقاومة (7V) والدايود (2V).',
        finalAnalysis: '🔬 التحليل الهندسي النهائي: استخدام مقاومة 350 أوم (أو 360 أوم قياسية) يحدد نقطة التشغيل الآمنة للدايود؛ وعند اختيار قدرة المقاومة نعتمد عامل أمان (Safety Factor) باختيار 0.25W لأن القدرة المبددة الفعلية 0.14W.',
        isGenerated: true,
        note: 'خطأ معتاد في امتحانات العملي: نسيان تحويل الملي أمبير (mA) إلى أمبير (A) بالقسمة على 1000 يؤدي إلى مقاومة خاطئة تماماً!',
      },
      importantNotes: [
        {
          note: '⚠️ تحويل الوحدات: تأكد من تحويل التيار من mA إلى A (بالقسمة على 1000) والمقاومة من kΩ إلى Ω قبل التعويض في قانون أوم.',
          type: 'warning',
          isAdditionalNote: false,
        },
        {
          note: '💡 في توصيل التوالي يكون التيار ثابتاً في جميع العناصر، بينما يتوزع الجهد (V_total = V1 + V2).',
          type: 'tip',
          isAdditionalNote: false,
        },
      ],
      memoryAids: [
        '🧠 مثلث قانون أوم: ضع V في القمة و I و R في القاعدة؛ لتجد أي مجهول غطه بإصبعك (V = I × R ، I = V / R ، R = V / I).',
      ],
      learningObjectives: [
        '✓ استيعاب المفاهيم الثلاثة للكهرباء: الجهد (الدفع)، التيار (التدفق)، والمقاومة (الإعاقة).',
        '✓ إتقان استخدام قانون أوم الرياضي في حل المسائل البسيطة والدوائر الكهربائية.',
        '✓ معرفة الوحدات الدولية والأبعاد الفيزيائية لكل كمية كهربائية واستخدام البادئات (milli, kilo).',
        '✓ القدرة على تصميم مقاومة حماية لعناصر الميكاترونكس والحساسات والليدات.',
      ],
      commonMistakes: [
        {
          mistake: 'قسمة الجهد الكلي مباشرة على التيار دون طرح هبوط جهد العناصر الأخرى كالليدات.',
          correction: 'احسب الجهد الفعلي الواقع على المقاومة وحدها أولاً: V_resistor = V_total - V_components.',
          why: 'لأن الجهد في توصيل التوالي يتوزع على العناصر المختلفة، ولا يسقط بالكامل على عنصر واحد.',
        },
        {
          mistake: 'نسيان تحويل الوحدات: تعويض التيار بوحدة mA أو kΩ دون التوحيد.',
          correction: 'حوّل دائماً إلى الوحدات الأساسية الدولية (Amperes, Ohms, Volts) قبل الحساب.',
          why: 'قانون أوم متوازن رياضياً فقط عند استخدام وحدات النظام الدولي الأساسية.',
        },
      ],
      summaryPoints: [
        'V = I × R هو حجر الأساس في هندسة الدوائر والإلكترونيات.',
        'لزيادة التيار في دائرة ميكاترونكس، إما أن ترفع الجهد أو تقلل المقاومة.',
        'القدرة الكهربائية تعبر عن السخونة أو الطاقة المستهلكة ويجب ألا تتجاوز قدرة المقاومة الفيزيائية.',
      ],
      quiz: [
        {
          id: 'q1',
          question: 'إذا تضاعف فرق الجهد المطبق على مقاومة ثابتة القيمة بمقدار مرتين، فماذا يحدث لشدة التيار؟',
          type: 'mcq',
          options: ['يتضاعف مرتين', 'يقل للنصف', 'يبقى ثابتاً', 'يتضاعف أربع مرات'],
          correctAnswer: 'يتضاعف مرتين',
          explanation: 'طبقاً لقانون أوم V = I × R، العلاقة بين الجهد والتيار علاقة خطية طردية عند ثبوت المقاومة.',
        },
        {
          id: 'q2',
          question: 'وحدة قياس المقاومة الكهربائية هي الأوم، وتكافئ فولت لكل أمبير (V/A).',
          type: 'true_false',
          options: ['صح', 'خطأ'],
          correctAnswer: 'صح',
          explanation: 'من العلاقة R = V / I، تكون وحدة الأوم Ω = V / A.',
        },
        {
          id: 'q3',
          question: 'مقاومة قيمتها 100 Ω يمر بها تيار 0.5 A. ما هو هبوط الجهد عبر طرفيها؟',
          type: 'calculation',
          options: ['50 V', '200 V', '20 V', '5 V'],
          correctAnswer: '50 V',
          explanation: 'V = I × R = 0.5 A × 100 Ω = 50 V.',
        },
      ],
      suggestedTools: [
        {
          toolId: 'circuits',
          title: '⚡ افتح مختبر الدوائر الكهربائية',
          subtitle: 'احسب مقاومات التوالي والتوازي وقانون أوم تفاعلياً',
          icon: 'circuits',
          reason: 'يمكنك محاكاة هذه الدائرة وحساب التيارات وهبوط الجهد فورياً.',
        },
        {
          toolId: 'units',
          title: '📏 افتح محول الوحدات',
          subtitle: 'تحويل وحدات الجهد والتيار والمقاومة والقدرة',
          icon: 'units',
          reason: 'للتحويل الدقيق بين mA و A و kΩ و MΩ دون الوقوع في أخطاء.',
        },
      ],
      circuitAnalysis: {
        hasCircuit: true,
        circuitType: 'دائرة تيار مستمر DC بسيطة (توالي)',
        components: [
          { type: 'مصدر جهد', value: '9V DC', label: 'V_source' },
          { type: 'مقاومة حماية', value: '350 Ω', label: 'R1' },
          { type: 'دايود ضوئي', value: '2V / 20mA', label: 'LED1' },
        ],
        analysisSummary: 'المسار مغلق، والتيار يمر من القطب الموجب عبر المقاومة ثم الدايود ويعود للقطب السالب. المقاومة تمتص 7 فولت والدايود يمتص 2 فولت.',
      },
      studySheetMarkdown: `# ورقة مذاكرة ليلة الاختبار: قانون أوم والدوائر الكهربائية ⚡
**المادة:** دوائر كهربائية 1 | **المستوى:** السنة الأولى هندسة ميكاترونكس

---
### 📌 1. المفاهيم الذهبية
- **الجهد (V):** طاقة الدفع (فولت).
- **التيار (I):** معدل تدفق الشحنات (أمبير).
- **المقاومة (R):** ممانعة السريان (أوم).

### 📐 2. جدول القوانين ووحدات القياس
| الكمية | الرمز | القانون | الوحدة الدولية (SI) | الأبعاد الفيزيائية |
| :--- | :--- | :--- | :--- | :--- |
| الجهد | $V$ | $V = I \\times R$ | Volt (V) | $[M L^2 T^{-3} I^{-1}]$ |
| التيار | $I$ | $I = V / R$ | Ampere (A) | $[I]$ |
| المقاومة | $R$ | $R = V / I$ | Ohm ($\\Omega$) | $[M L^2 T^{-3} I^{-2}]$ |
| القدرة | $P$ | $P = V \\times I = I^2 R$ | Watt (W) | $[M L^2 T^{-3}]$ |

### ⚠️ 3. فخاخ الامتحانات الجامعية:
1. إياك والتعويض بـ $mA$ مباشرة! اقسم على $1000$ لتصبح $A$.
2. في التوالي: التيار متساوٍ والجهد يتجزأ ($V_{total} = V_1 + V_2$).
3. في التوازي: الجهد متساوٍ والتيار يتجزأ ($I_{total} = I_1 + I_2$).
`,
    };
  }

  // Default Mechanics & Newton's Law
  return {
    id: 'expl-' + Date.now(),
    lessonTitle: isTorque ? 'العزم الدوراني وتطبيقات محركات الميكاترونكس' : 'قوانين نيوتن للحركة وتطبيقات القوة والتسارع',
    subjectName: 'فيزياء عامة 1 (General Physics I - Mechanics)',
    sourceType: params.mode,
    fileName: params.fileName,
    createdAt: new Date().toISOString(),
    explanationLevel: level,
    simpleIdea: level === 'short'
      ? 'القوة المحصلة تساوي الكتلة مضروبة في التسارع: F = m × a.'
      : 'تخيل أنك تدفع عربة يد في ورشة الميكاترونكس: إذا كانت العربة فارغة (كتلتها خفيفة)، دفعة بسيطة تجعلها تتسارع بسرعة كبيرة. لكن إذا كانت محملة بمحركات ثقيلة (كتلة كبيرة)، فستحتاج إلى قوة عضلية جبارة لإعطائها نفس التسارع. هذا هو جوهر قانون نيوتن الثاني: القوة تزيد التسارع، والكتلة تعاند وتعارض هذا التسارع.',
    coreTakeaways: [
      'القوة (F) كمية متجهة (لها مقدار واتجاه)، وهي المؤثر الخارجي المسبب لتغير حالة حركة الجسم.',
      'القصور الذاتي هو ميل الجسم لمقاومة أي تغير في سرعته أو اتجاهه، ومقياسه هو الكتلة (m).',
      'التسارع (a) يتناسب طردياً مع القوة المحصلة وعكسياً مع الكتلة: a = F_net / m.',
      'في الروبوتات والمركبات الذكية: نحسب F لتحديد حجم المحرك وقدرته لمنع احتراقه تحت الحمل.',
    ],
    conceptExplanations: [
      {
        concept: 'القوة المحصلة (Net Force)',
        simplifiedExplanation: 'القوة هي أي دفعة أو سحبة تغير من سرعة الجسم أو اتجاهه، وإذا تساوت القوى في اتجاهين متعاكسين فإن الجسم لا يتسارع.',
        scientificDefinition: 'المؤثر الفيزيائي الخارجي المسبب لتسارع الأجسام طبقاً للقانون: ∑F = m · a.',
        practicalAnalogy: 'مثل سيارة يدفعها محركها للأمام والاحتكاك يقاومها للخلف، المحصلة هي الفرق بينهما.',
        isAdditionalNote: false,
      },
      {
        concept: 'القصور الذاتي والكتلة (Inertia & Mass)',
        simplifiedExplanation: 'القصور الذاتي هو كسل الجسم وعناده ضد أي تغيير في حالته الحركية، والكتلة هي مقياس هذا العناد.',
        scientificDefinition: 'خاصية مقاومة المادة لأي تغير في سرعتها المتجهة أو حالتها السكونية.',
        practicalAnalogy: 'صعوبة إيقاف قطار بضائع ثقيل فجأة مقارنة بدراجة هوائية تسير بنفس السرعة.',
        isAdditionalNote: false,
      },
      {
        concept: 'التسارع الخطي (Linear Acceleration)',
        simplifiedExplanation: 'معدل زيادة أو نقصان السرعة في كل ثانية تمر، وليس السرعة نفسها.',
        scientificDefinition: 'المشتقة الأولى للسرعة بالنسبة للزمن: a = dv / dt.',
        practicalAnalogy: 'ضغط دواسة بنزين السيارة بقوة مما يجعلك تلتصق بالكرسي أثناء زيادة السرعة.',
        isAdditionalNote: false,
      },
    ],
    terms: [
      {
        term: 'القوة المحصلة',
        englishTerm: 'Net Force (F_net)',
        meaning: 'المجموع الاتجاهي لجميع القوى المؤثرة على الجسم في نفس اللحظة.',
        practicalAnalogy: 'مثل فريقين يشدان حبلاً، المحصلة هي الفرق بين قوة الفريقين في اتجاه الأقوى.',
      },
      {
        term: 'الكتلة والقصور الذاتي',
        englishTerm: 'Mass & Inertia (m)',
        meaning: 'خاصية فيزيائية للمادة تمثل ممانعتها لتغيير سرعتها الانتقالية.',
        practicalAnalogy: 'صعوبة إيقاف قطار مسرع مقارنة بدراجة هوائية بنفس السرعة.',
      },
      {
        term: 'التسارع الخطي',
        englishTerm: 'Linear Acceleration (a)',
        meaning: 'معدل التغير اللحظي في السرعة المتجهة مع الزمن.',
        practicalAnalogy: 'انطلاق سيارة سريعة من السكون إلى 100 كم/ساعة في ثوانٍ معدودة.',
      },
    ],
    formulas: [
      {
        equation: 'F = m × a',
        meaning: 'قانون نيوتن الثاني للحركة الانتقالية: القوة المحصلة تساوي حاصل ضرب الكتلة في التسارع الخطي.',
        symbols: [
          { symbol: 'F', name: 'القوة المحصلة (Net Force)', unit: 'Newton (N)', dimension: 'M L T⁻²' },
          { symbol: 'm', name: 'الكتلة (Mass)', unit: 'Kilogram (kg)', dimension: 'M' },
          { symbol: 'a', name: 'التسارع الخطي (Acceleration)', unit: 'm/s²', dimension: 'L T⁻²' },
        ],
      },
      {
        equation: 'W = m × g',
        meaning: 'قوة الوزن الجاذبية المؤثرة رأسياً للأسفل على أي جسم على سطح الأرض.',
        symbols: [
          { symbol: 'W', name: 'الوزن (Weight)', unit: 'Newton (N)', dimension: 'M L T⁻²' },
          { symbol: 'g', name: 'عجلة الجاذبية الأرضية', unit: 'm/s² (≈ 9.81)', dimension: 'L T⁻²' },
        ],
      },
    ],
    units: [
      { quantity: 'القوة والوزن', unitName: 'نيوتن', unitSymbol: 'N' },
      { quantity: 'الكتلة', unitName: 'كيلوجرام', unitSymbol: 'kg' },
      { quantity: 'التسارع', unitName: 'متر لكل ثانية مربعة', unitSymbol: 'm/s²' },
      { quantity: 'السرعة', unitName: 'متر لكل ثانية', unitSymbol: 'm/s' },
    ],
    dimensions: [
      {
        quantity: 'القوة (F)',
        formula: 'F = m × a = M × (L / T²)',
        dimensionStr: '[F] = M L T⁻²',
        explanation: 'كتلة [M] مضروبة في طول [L] مقسومة على مربع الزمن [T²]. 1 نيوتن يعادل فيزيائياً 1 kg·m/s².',
      },
    ],
    solvedExample: {
      problem: 'عربة فحص روبوتية (AGV) في مصنع أتمتة كتلتها 15 kg، يراد تسريعها من السكون (v₀ = 0) إلى سرعة 3 m/s خلال زمن قدره 1.5 ثانية. بفرض إهمال الاحتكاك، احسب القوة الأفقية التي يجب أن تولدها العجلات لدفع العربة.',
      given: [
        'كتلة العربة: m = 15 kg',
        'السرعة الابتدائية: v₀ = 0 m/s',
        'السرعة النهائية: v = 3 m/s',
        'الزمن المستغرق: t = 1.5 s',
      ],
      required: 'القوة الأفقية الدافعة F بالنيوتن.',
      formulaUsed: 'a = (v - v₀) / t ثم F = m × a',
      steps: [
        'الخطوة 1: حساب التسارع الخطي المطلوب للعربة: a = (3 - 0) / 1.5 = 2 m/s².',
        'الخطوة 2: تطبيق قانون نيوتن الثاني: F = m × a = 15 kg × 2 m/s².',
        'الخطوة 3: حساب الناتج النهائي والتحقق من الوحدة: F = 30 N.',
      ],
      finalAnswer: 'F = 30 Newton (N) في اتجاه حركة العربة.',
      calculation: 'F = 15 kg × 2 m/s² = 30 N',
      unit: 'N (نيوتن)',
      whyThisResult: 'النتيجة تؤكد أننا نحتاج إلى قوة دفع مقدارها 30 نيوتن للتغلب على عطالة العربة وتسريعها من السكون إلى 3 م/ث في ثانية ونصف.',
      isGenerated: true,
      note: 'في التطبيق العملي لمشاريع التخرج: نضيف 20% كعامل أمان لمقاومة احتكاك الأرضية وعزم بدء المحرك.',
    },
    importantNotes: [
      {
        note: '⚠️ انتبه للفرق بين الكتلة m (بالكيلوجرام، ثابتة لا تتغير بتغير الكوكب) والوزن W (بالنيوتن، قوة جاذبية تتغير مع g).',
        type: 'warning',
        isAdditionalNote: false,
      },
      {
        note: '⚠️ تحويل الوحدات: إذا كانت السرعة معطاة بـ km/h، اقسم على 3.6 فوراً لتحويلها إلى m/s قبل التعويض في قوانين التسارع.',
        type: 'warning',
        isAdditionalNote: false,
      },
      {
        note: '💡 إذا كانت السرعة ثابتة، فإن التسارع a = 0، وبالتالي القوة المحصلة F_net = 0 دائماً (قانون نيوتن الأول).',
        type: 'tip',
        isAdditionalNote: false,
      },
    ],
    memoryAids: [
      '🧠 لتذكر قانون نيوتن الثاني: مثلث القوة (F في القمة، m و a في القاعدة؛ F = m · a ، a = F / m ، m = F / a).',
      '🧠 تذكر أن 1 نيوتن يعادل وزن تفاحة صغيرة تزن حوالي 100 جرام (0.1 kg × 9.8 ≈ 1 N).',
    ],
    learningObjectives: [
      '✓ صياغة وفهم قوانين نيوتن الثلاثة والتمييز بين القوة والقصور الذاتي والتسارع.',
      '✓ استخدام صيغة F = m × a لحساب القوة والتسارع والكتلة بدقة متناهية.',
      '✓ تحديد الوحدات الدولية (SI) والأبعاد الفيزيائية للقوة [F] = M L T⁻².',
      '✓ تطبيق مخطط الجسم الحر وحساب القوة المطلوبة لتسريع آليات وأنظمة الميكاترونكس.',
    ],
    commonMistakes: [
      {
        mistake: 'الخلط بين الكتلة (Mass) بالكيلوجرام والوزن (Weight) بالنيوتن.',
        correction: 'الكتلة كمية قياسية ثابتة m، بينما الوزن قوة جذب W = m × g تتغير بتغير المكان.',
        why: 'الكتلة تقيس كمية المادة والقصور الذاتي، أما الوزن فهو قوة تتطلب ضرب الكتلة في تسارع الجاذبية.',
      },
      {
        mistake: 'نسيان تحويل السرعة من km/h إلى m/s قبل حساب التسارع.',
        correction: 'اضرب السرعة في (1000 / 3600) أو اقسم على 3.6 للتحويل إلى m/s.',
        why: 'معادلات الحركة تتطلب وحدة النظام الدولي m/s للحصول على تسارع بوحدة m/s² وقوة بالنيوتن.',
      },
    ],
    summaryPoints: [
      'القوة المحصلة تسبب تسارعاً ولا تسبب سرعة فقط: إذا انعدمت القوة المحصلة، تظل السرعة ثابتة (قانون نيوتن الأول).',
      'F = m × a هو القانون الأساسي في ديناميكا الروبوتات والآليات والمحركات.',
      'الأبعاد المتجانسة: [F] = M L T⁻² أساسية للتحقق من صحة القوانين في اختبارات الفيزياء.',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'إذا أثرت قوة محصلة مقدارها 20 N على جسم كتلته 4 kg، فما هو تسارعه؟',
        type: 'calculation',
        options: ['5 m/s²', '80 m/s²', '0.2 m/s²', '16 m/s²'],
        correctAnswer: '5 m/s²',
        explanation: 'التسارع a = F / m = 20 / 4 = 5 m/s².',
      },
      {
        id: 'q2',
        question: 'جسم يتحرك بسرعة متجهة ثابتة في خط مستقيم تكون القوة المحصلة المؤثرة عليه مساوية للصفر.',
        type: 'true_false',
        options: ['صح', 'خطأ'],
        correctAnswer: 'صح',
        explanation: 'طبقا لقانون نيوتن الأول، إذا كانت السرعة ثابتة فالتسارع a = 0 وبالتالي القوة المحصلة F_net = 0.',
      },
      {
        id: 'q3',
        question: 'أي من الوحدات التالية تكافئ وحدة النيوتن (N) في النظام الدولي؟',
        type: 'mcq',
        options: ['kg · m / s²', 'kg · m² / s²', 'kg / (m · s)', 'J · s'],
        correctAnswer: 'kg · m / s²',
        explanation: 'من F = m × a، وحدة الكتلة kg والتسارع m/s²، فتكون kg·m/s².',
      },
    ],
    suggestedTools: [
      {
        toolId: 'formulas',
        title: '📐 افتح محلل القوانين',
        subtitle: 'تحليل أبعاد قانون نيوتن والعزم وقوانين الحركة',
        icon: 'formulas',
        reason: 'لفهم عميق للأبعاد الفيزيائية والتطبيقات الهندسية.',
      },
      {
        toolId: 'torque',
        title: '🛠️ افتح حاسبة عزم المحرك',
        subtitle: 'حساب العزم والقوة لاختيار محركات الميكاترونكس',
        icon: 'torque',
        reason: 'لتطبيق حسابات القوة والتسارع في اختيار محركات الروبوتات.',
      },
      {
        toolId: 'units',
        title: '📏 افتح محول الوحدات',
        subtitle: 'تحويل وحدات القوة (N, dyn, lbf, kgf)',
        icon: 'units',
        reason: 'لضمان الدقة في تحويل وحدات القوة والكتلة.',
      },
    ],
    studySheetMarkdown: `# ورقة مذاكرة ليلة الاختبار: قوانين نيوتن والميكانيكا 🚀
**المادة:** فيزياء عامة 1 | **المستوى:** السنة الأولى هندسة ميكاترونكس

---
### 📌 1. المفاهيم الأساسية
- **قانون نيوتن 1:** الجسم الساكن يظل ساكناً والمتحرك يظل متحركاً ما لم تؤثر عليه قوة محصلة ($F_{net} = 0 \\implies a = 0$).
- **قانون نيوتن 2:** القوة المحصلة تكسب الجسم تسارعاً في اتجاهها ($F_{net} = m \\cdot a$).
- **قانون نيوتن 3:** لكل فعل رد فعل مساوٍ له في المقدار ومضاد له في الاتجاه.

### 📐 2. جدول القوانين والأبعاد
| الكمية | الرمز | القانون | الوحدة الدولية (SI) | الأبعاد الفيزيائية |
| :--- | :--- | :--- | :--- | :--- |
| القوة | $F$ | $F = m \\cdot a$ | Newton (N) | $[M L T^{-2}]$ |
| الوزن | $W$ | $W = m \\cdot g$ | Newton (N) | $[M L T^{-2}]$ |
| التسارع | $a$ | $a = \\Delta v / \\Delta t$ | $m/s^2$ | $[L T^{-2}]$ |
| كمية الحركة | $p$ | $p = m \\cdot v$ | $kg \\cdot m/s$ | $[M L T^{-1}]$ |

### ⚠️ 3. نصائح الامتحان:
1. ارسم مخطط الجسم الحر (Free Body Diagram) دائماً قبل البدء بحساب القوى.
2. اتجاه الحركة هو الاتجاه الموجب $(+)$.
3. تأكد أن الكتلة بالكيلوجرام ($kg$) وليس بالجرام ($g$).
`,
  };
}

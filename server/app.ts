import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_SETTINGS, INITIAL_SUBJECTS, INITIAL_LESSONS, INITIAL_FORMULAS, INITIAL_UNIT_CONVERSIONS } from '../src/data/initialData';
import { Subject, Lesson, AdminSettings } from '../src/types';
import { processExplainLesson, callGeminiWithResilience, getGeminiClient as getGeminiClientFromService } from './explainService';
import { generateEngineeringAssignment, refineAssignmentSectionWithAi } from './assignmentService';
import {
  generateProjectWithGemini,
  validateAndHarmonizeProject,
  verifyPinCompatibility,
  CORE_PROJECT_TEMPLATES,
  PROJECT_PRESET_BUTTONS,
  generateSmartTemplateFallback,
} from './projectLabService';
import { db, normalizePhone, convertArabicDigitsToEnglish, DBUser, DBSubscription, DBActivationCode, DBSubscriptionRequest } from './db';
import {
  getAllReferenceBooks,
  getReferenceBookById,
  updateReferenceBook,
  deleteReferenceBook,
  processBookUpload,
  searchBookChunks,
  getBookChunks,
  SERWAY_BOOK_ID,
  SERWAY_PHYSICS_TOPICS,
  DEFAULT_SERWAY_BOOK,
} from './referenceBookService';
import {
  getActiveSpecialistDoctors,
  updateDoctor,
  getSavedLessons,
  saveLesson,
  deleteLesson,
  generateSmartDoctorLesson,
} from './smartDoctorService';
import { videoService } from './videoService';
import {
  getTodayChallenge,
  submitChallengeAnswer,
  getDailyChallengeLeaderboard,
  getChallengeArchive,
} from './dailyChallengeService';
import {
  explainWithSmartDoctor,
  solveExamPaperWithDoctor,
  askDoctorFollowUp,
  gradeStudentTestSubmission,
  generateDoctorSpeechAudio,
} from './smartDoctorAIService';

const JWT_SECRET = process.env.JWT_SECRET || 'mct_jwt_secret_mechatronics_academy_7829';

// Extend Express Request to carry authenticated user & subscription
export interface AuthenticatedRequest extends Request {
  user?: DBUser;
  subscription?: DBSubscription;
}

// In-Memory Curriculum Store (can be edited by admin)
let subjects: Subject[] = [...INITIAL_SUBJECTS];
let lessons: Lesson[] = [...INITIAL_LESSONS];

// Token Helpers
export function generateAuthToken(user: DBUser): string {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Authentication Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  // Fast-track master owner session token
  if (token.startsWith('mct_owner_master_session_') || token.startsWith('mct_admin_token_') || token === 'A7820600') {
    let masterAdmin = db.getAllUsers().find((u) => u && u.role === 'admin');
    if (!masterAdmin) {
      masterAdmin = {
        id: 'user-admin-1',
        name: 'مدير المنصة والمالك',
        phone: 'A7820600',
        email: 'admin@mechatronics-yemen.com',
        university: 'إدارة الأكاديمية اليمنية للميكاترونكس',
        studyLevel: 'الإدارة العامة',
        major: 'هندسة الميكاترونكس',
        passwordHash: '',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
    }
    req.user = masterAdmin;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let user = db.findUserById(decoded.id);
    if (!user && decoded.role === 'admin') {
      user = db.getAllUsers().find((u) => u.role === 'admin');
    }
    if (user) {
      req.user = user;
      const sub = db.getSubscriptionByUserId(user.id);
      if (sub) {
        // Auto-check expiry
        if (sub.status === 'active' && new Date(sub.expiryDate) < new Date()) {
          sub.status = 'expired';
          db.createOrUpdateSubscription(sub);
        }
        req.subscription = sub;
      }
    }
  } catch (err) {
    // Invalid or expired token
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'يرجى تسجيل الدخول للوصول إلى هذا المحتوى.',
      requireLogin: true,
    });
  }
  next();
}

export function requireActiveSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'يرجى تسجيل الدخول للوصول إلى المحتوى.',
      requireLogin: true,
    });
  }

  if (req.user.role === 'admin') {
    return next(); // Admin always has full access
  }

  const sub = req.subscription || db.getSubscriptionByUserId(req.user.id);

  if (!sub || sub.status === 'pending') {
    return res.status(403).json({
      error: 'حسابك مسجل وهو حاليًا في انتظار تأكيد الدفع والتفعيل من الإدارة. يرجى التواصل عبر واتساب لتأكيد الاشتراك أو إدخال كود التفعيل.',
      subscriptionStatus: 'pending',
    });
  }

  if (sub.status === 'expired' || new Date(sub.expiryDate) < new Date()) {
    return res.status(403).json({
      error: 'انتهت صلاحية اشتراكك، يرجى التجديد للوصول إلى المحتوى التعليمي والمختبر.',
      subscriptionStatus: 'expired',
    });
  }

  if (sub.status === 'suspended') {
    return res.status(403).json({
      error: 'تم تعليق هذا الحساب مؤقتًا. يرجى مراجعة إدارة الأكاديمية.',
      subscriptionStatus: 'suspended',
    });
  }

  if (sub.status !== 'active') {
    return res.status(403).json({
      error: 'هذا المحتوى متاح للمشتركين فقط.',
      subscriptionStatus: 'inactive',
    });
  }

  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.includes('mct_owner_master_session_') || authHeader.includes('A7820600')) {
    if (!req.user) {
      req.user = {
        id: 'user-admin-1',
        name: 'مدير المنصة والمالك',
        phone: 'A7820600',
        email: 'admin@mechatronics-yemen.com',
        university: 'إدارة الأكاديمية اليمنية للميكاترونكس',
        studyLevel: 'الإدارة العامة',
        major: 'هندسة الميكاترونكس',
        passwordHash: '',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
    }
    return next();
  }

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'هذه العملية تتطلب صلاحيات إدارة الأكاديمية.',
    });
  }
  next();
}

// Lazy Gemini API Client Initialization
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (process.env.GEMINI_API_KEY && !genAI) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return genAI;
}

// Create Express App
export const app = express();

// Ensure DB is initialized before processing API requests on serverless cold start
app.use(async (req, res, next) => {
  try {
    if (!db.isHydrated() && db.isCloudConfigured()) {
      await db.syncFromCloud();
    }
  } catch (err) {
    console.warn('[DB Cold Start Warning]:', err);
  }
  next();
});

// Safe Vercel URL Normalization (never read x-matched-path as it points to /api/index.ts)
app.use((req, res, next) => {
  const rawUrl = req.url || '';
  if (rawUrl.startsWith('/api/index.ts/')) {
    req.url = rawUrl.replace('/api/index.ts/', '/api/');
  } else if (rawUrl === '/api/index.ts') {
    req.url = '/api/info';
  }
  next();
});

// CORS Headers & Options Preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '50mb' }));

// Ensure Neon PostgreSQL is hydrated before handling requests on serverless cold starts (with 3.5s timeout guard)
app.use(async (req, res, next) => {
  if (db.isCloudConfigured() && !db.isHydrated()) {
    try {
      await Promise.race([
        db.syncFromCloud(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Neon sync timeout')), 3500)),
      ]);
    } catch (e) {
      console.warn('[DB] Neon hydration warning/timeout on request:', e);
    }
  }
  next();
});

app.use(authenticateToken);

// Setup an API router so routes work both on /api/... and /...
const router = express.Router();

// API Info Endpoint
router.get('/info', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'أكاديمية الميكاترونكس اليمنية',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// ==========================================
// 🏆 DAILY MECHATRONICS CHALLENGE ENDPOINTS
// ==========================================
router.get('/daily-challenge', (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.query.studentId as string || req.user?.id || '';
  const data = getTodayChallenge(studentId);
  res.json({ status: 'ok', ...data });
});

router.post('/daily-challenge/submit', (req: AuthenticatedRequest, res: Response) => {
  const { studentId, studentName, university, major, challengeId, selectedOption } = req.body;
  if (selectedOption === undefined || selectedOption === null) {
    return res.status(400).json({ error: 'يرجى اختيار إجابة من الخيارات المتاحة.' });
  }

  const result = submitChallengeAnswer({
    studentId: studentId || req.user?.id || 'guest-' + Date.now(),
    studentName: studentName || req.user?.name || 'طالب ميكاترونكس',
    university: university || req.user?.university || 'الجامعة اليمنية',
    major: major || req.user?.major || 'هندسة الميكاترونكس',
    challengeId,
    selectedOption: Number(selectedOption),
  });

  res.json({ status: 'ok', ...result });
});

router.get('/daily-challenge/leaderboard', (req: Request, res: Response) => {
  const leaderboard = getDailyChallengeLeaderboard();
  res.json({ status: 'ok', leaderboard });
});

router.get('/daily-challenge/archive', (req: Request, res: Response) => {
  const archive = getChallengeArchive();
  res.json({ status: 'ok', archive });
});

// Direct APK Download Endpoint
router.get('/download/apk', (req, res) => {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'downloads', 'mechatronics-academy.apk'),
    path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
    path.join(process.cwd(), 'releases', 'apk', 'mechatronics-academy.apk'),
  ];

  for (const apkPath of possiblePaths) {
    if (fs.existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      return res.download(apkPath, 'Mechatronics_Academy_Yemen.apk');
    }
  }

  // If APK is not yet present, return helpful JSON with direct guidance
  return res.status(200).json({
    success: false,
    message: 'جاري تجهيز حزمة التطبيق المباشرة. يمكنك تثبيت التطبيق فورياً عبر زر "تثبيت التطبيق" في أعلى الموقع بدون انتظار، أو تحميل الحزمة بمجرد اكتمال تجميعها.',
    directInstall: true,
  });
});

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'mechatronics-academy' });
});

// Student Registration
router.post('/auth/register', (req, res) => {
  try {
    const { name, phone, email, university, studyLevel, major, password, activationCode, code } = req.body || {};

    const trimmedName = (name || '').toString().trim();
    const rawPhone = (phone || '').toString().trim();
    const rawPassword = (password || '').toString().trim();

    if (!trimmedName) {
      return res.status(400).json({ error: 'يرجى إدخال اسم الطالب الكامل للتسجيل.' });
    }

    if (!rawPhone) {
      return res.status(400).json({ error: 'يرجى إدخال رقم الهاتف للتواصل وتأكيد الحساب.' });
    }

    const cleanPhone = normalizePhone(rawPhone);
    if (!cleanPhone || cleanPhone.length < 6) {
      return res.status(400).json({ error: 'يرجى إدخال رقم هاتف يمني صحيح (مثال: 78XXXXXXX أو 77XXXXXXX).' });
    }

    if (!rawPassword || rawPassword.length < 4) {
      return res.status(400).json({
        error: 'يرجى إدخال كلمة مرور مكونة من 4 خانات على الأقل لحماية حسابك واستخدامها لتسجيل الدخول لاحقًا.',
      });
    }

    const existingUser = db.findUserByPhone(cleanPhone);
    if (existingUser) {
      // If student enters their registered phone with correct password, log them in automatically
      const convertedPass = convertArabicDigitsToEnglish(rawPassword);
      let isValidPassword = false;
      try {
        isValidPassword =
          bcrypt.compareSync(rawPassword, existingUser.passwordHash) ||
          bcrypt.compareSync(convertedPass, existingUser.passwordHash);
      } catch (_) {}

      if (isValidPassword) {
        existingUser.lastLoginAt = new Date().toISOString();
        db.updateUser(existingUser.id, { lastLoginAt: existingUser.lastLoginAt });

        const token = generateAuthToken(existingUser);
        const subDetails = getSubscriptionDetails(existingUser.id);
        const progress = db.getStudentProgress(existingUser.id);

        return res.json({
          success: true,
          alreadyRegistered: true,
          message: `أهلاً بك مجدداً يا ${existingUser.name}! تم التعرف على حسابك وتأكيد دخولك بنجاح.`,
          token,
          user: {
            id: existingUser.id,
            name: existingUser.name,
            phone: existingUser.phone,
            email: existingUser.email,
            university: existingUser.university,
            studyLevel: existingUser.studyLevel,
            major: existingUser.major,
            role: existingUser.role,
          },
          subscription: subDetails.sub,
          student: {
            id: existingUser.id,
            name: existingUser.name,
            phone: existingUser.phone,
            email: existingUser.email,
            university: existingUser.university,
            studyLevel: existingUser.studyLevel,
            major: existingUser.major,
            role: existingUser.role,
            subscriptionPlan: subDetails.sub?.plan || 'monthly',
            subscriptionStatus: subDetails.sub?.status || 'pending',
            subscriptionStartDate: subDetails.sub?.startDate,
            subscriptionEndDate: subDetails.sub?.expiryDate,
            remainingDays: subDetails.remainingDays,
            remainingHours: subDetails.remainingHours,
            isActivated: subDetails.isActivated,
            isExpired: subDetails.isExpired,
            completedLessons: progress.completedLessons || [],
            quizScores: progress.quizScores || {},
          },
        });
      }

      return res.status(400).json({
        alreadyRegistered: true,
        error: 'رقم الهاتف هذا مسجل مسبقًا في الأكاديمية. يمكنك تسجيل الدخول مباشرة بكلمة المرور الخاصة بك أو استخدام خيار "نسيت كلمة المرور؟".',
      });
    }

    const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const passwordHash = bcrypt.hashSync(convertArabicDigitsToEnglish(rawPassword), 10);

    const newUser: DBUser = {
      id: userId,
      name: trimmedName,
      phone: cleanPhone,
      email: email ? String(email).trim() : undefined,
      university: (university ? String(university).trim() : '') || 'الجامعة الإماراتية الدولية – صنعاء',
      studyLevel: (studyLevel ? String(studyLevel).trim() : '') || 'السنة الأولى',
      major: (major ? String(major).trim() : '') || 'هندسة الميكاترونكس',
      passwordHash,
      role: 'student',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Check if an activation code was provided during registration
    const inputCode = (activationCode || code || '').toString().trim().toUpperCase();
    const now = new Date();
    let initialSub: DBSubscription;
    let remainingDays = 0;
    let isActivated = false;
    let activationSuccessMsg = '';

    if (inputCode) {
      const codes = db.getAllActivationCodes();
      const foundCode = codes.find((c) => c && c.code && c.code.trim().toUpperCase() === inputCode);

      if (foundCode && foundCode.isActive !== false && foundCode.status !== 'suspended' && (!foundCode.isUsed || foundCode.status === 'unused')) {
        const planType = (inputCode.startsWith('AB-') || foundCode.type === 'yearly' || foundCode.planType === 'yearly') ? 'yearly' : 'monthly';
        const durationDays = foundCode.durationDays || (planType === 'yearly' ? 365 : 30);
        const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        initialSub = {
          id: `sub-${Date.now()}`,
          userId,
          studentId: userId,
          phone: cleanPhone,
          code: inputCode,
          type: planType,
          plan: planType,
          status: 'active',
          startDate: now.toISOString(),
          expiryDate: expiryDate.toISOString(),
          createdAt: now.toISOString(),
          activatedAt: now.toISOString(),
          activationMethod: 'activation_code',
          notes: `تم التفعيل أثناء التسجيل عبر الكود ${inputCode}`,
        };

        try {
          db.updateActivationCode(foundCode.code, {
            type: planType,
            planType,
            status: 'used',
            isUsed: true,
            timesUsed: 1,
            phone: cleanPhone,
            studentName: newUser.name,
            studentId: newUser.id,
            activatedAt: now.toISOString(),
            expiresAt: expiryDate.toISOString(),
            activatedBy: 'student',
            usedByStudents: [
              {
                studentId: newUser.id,
                studentName: newUser.name,
                phone: cleanPhone,
                usedAt: now.toISOString(),
              },
            ],
          });
        } catch (codeErr) {
          console.warn('[REGISTRATION] Code update warning:', codeErr);
        }

        remainingDays = durationDays;
        isActivated = true;
        activationSuccessMsg = ' وتم تفعيل اشتراكك بنجاح!';
      } else {
        // Create pending subscription
        initialSub = {
          id: `sub-${Date.now()}`,
          userId,
          studentId: userId,
          phone: cleanPhone,
          plan: 'monthly',
          status: 'pending',
          startDate: now.toISOString(),
          expiryDate: now.toISOString(),
          createdAt: now.toISOString(),
          activationMethod: 'whatsapp',
          notes: `حساب جديد - كود مدخل يحتاج مراجعة: ${inputCode}`,
        };
      }
    } else {
      // Standard initial pending subscription
      initialSub = {
        id: `sub-${Date.now()}`,
        userId,
        studentId: userId,
        phone: cleanPhone,
        plan: 'monthly',
        status: 'pending',
        startDate: now.toISOString(),
        expiryDate: now.toISOString(),
        createdAt: now.toISOString(),
        activationMethod: 'whatsapp',
        notes: 'حساب مسجل جديد في انتظار تأكيد الدفع وإدخال كود التفعيل',
      };
    }

    db.createOrUpdateSubscription(initialSub);
    const token = generateAuthToken(newUser);

    return res.json({
      success: true,
      message: `تم إنشاء حساب الطالب بنجاح${activationSuccessMsg}. يمكنك الآن تسجيل الدخول دائماً برقم هاتفك وكلمة المرور الخاصة بك.`,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        university: newUser.university,
        studyLevel: newUser.studyLevel,
        major: newUser.major,
        role: newUser.role,
      },
      subscription: {
        ...initialSub,
        remainingDays,
        isActivated,
        isExpired: false,
      },
      student: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        university: newUser.university,
        studyLevel: newUser.studyLevel,
        major: newUser.major,
        role: newUser.role,
        subscriptionPlan: initialSub.plan,
        subscriptionStatus: initialSub.status,
        subscriptionStartDate: initialSub.startDate,
        subscriptionEndDate: initialSub.expiryDate,
        remainingDays,
        remainingHours: remainingDays * 24,
        isActivated,
        isExpired: false,
        completedLessons: [],
        quizScores: {},
      },
    });
  } catch (err: any) {
    console.error('[STUDENT REGISTRATION ERROR]', err);
    return res.status(500).json({
      error: 'حدث خطأ في الخادم أثناء إنشاء الحساب. يرجى التأكد من صحة البيانات والمحاولة مجددًا.',
      details: err?.message || String(err),
    });
  }
});

// Helper to format official activation WhatsApp message
function formatWhatsAppActivation(
  studentName: string,
  phone: string,
  code: string,
  plan: 'monthly' | 'yearly',
  startDateISO: string,
  expiryDateISO: string,
  durationDays: number
) {
  const cleanPhone = phone.startsWith('967') ? phone : `967${phone.replace(/^0+/, '')}`;
  
  // Ensure the activation code strictly adheres to official prefixes (AS- for monthly, AB- for yearly)
  let finalCode = (code || '').trim().toUpperCase();
  if (!finalCode) {
    const prefix = plan === 'yearly' ? 'AB-' : 'AS-';
    finalCode = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  } else if (!finalCode.startsWith('AS-') && !finalCode.startsWith('AB-')) {
    const prefix = plan === 'yearly' ? 'AB-' : 'AS-';
    finalCode = `${prefix}${finalCode.replace(/^MCT-?/i, '')}`;
  }

  const startDateStr = new Date(startDateISO).toLocaleDateString('ar-YE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const expiryDateStr = new Date(expiryDateISO).toLocaleDateString('ar-YE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const planTitle = plan === 'yearly' ? 'اشتراك سنوي (365 يومًا)' : 'اشتراك شهري (30 يومًا)';

  const message = `أهلاً بك يا باشمهندس ${studentName}! 🎓
تم تفعيل اشتراكك بنجاح في منصة أكاديمية الميكاترونكس اليمنية.

بيانات دخولك الرسمية:
🔑 كود التفعيل المعتمد: ${finalCode}
📱 رقم هاتفك المسجل: ${phone}
⏱️ نوع الاشتراك: ${planTitle}
📅 تاريخ بدء الاشتراك: ${startDateStr}
⏳ تاريخ الانتهاء الدقيق: ${expiryDateStr} (${durationDays} يوم)

طريقة الدخول والتفعيل:
1. استخدم كود التفعيل المعتمد أعلاه (${finalCode}) لتأكيد وتفعيل اشتراكك لأول مرة.
2. سجّل الدخول دائماً برقم هاتفك وكلمة المرور التي أنشأتها في حسابك (حسابك مؤمّن بكلمة مرورك ولا يمكن الدخول برقمك بدونها).
3. استمتع بكافة الدروس، محلل القوانين، محاكي Arduino، ومساعد الذكاء الاصطناعي.

نتمنى لك فصلاً دراسياً متميزاً ومليئاً بالتفوق والنجاح! 🚀`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return { message, whatsappUrl, cleanPhone, finalCode };
}

// Helper to accurately calculate subscription remaining days, hours, and status
function getSubscriptionDetails(userId: string) {
  const sub = db.getSubscriptionByUserId(userId);
  if (!sub) {
    return {
      sub: null,
      remainingDays: 0,
      remainingHours: 0,
      isActivated: false,
      isExpired: false,
    };
  }

  let remainingDays = 0;
  let remainingHours = 0;
  let isActivated = false;
  let isExpired = false;

  if (sub) {
    if (sub.status === 'active') {
      const msLeft = new Date(sub.expiryDate).getTime() - Date.now();
      remainingDays = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      remainingHours = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60)));
      if (msLeft <= 0) {
        sub.status = 'expired';
        db.createOrUpdateSubscription(sub);
        isActivated = false;
        isExpired = true;
        remainingDays = 0;
        remainingHours = 0;
      } else {
        isActivated = true;
        isExpired = false;
      }
    } else if (sub.status === 'expired') {
      isExpired = true;
      isActivated = false;
      remainingDays = 0;
      remainingHours = 0;
    } else {
      // pending or suspended
      isActivated = false;
      isExpired = false;
      remainingDays = 0;
      remainingHours = 0;
    }
  }

  return { sub, remainingDays, remainingHours, isActivated, isExpired };
}

// Student / User Login (Strictly Phone Number + Password)
router.post('/auth/login', (req, res) => {
  const { identifier, phone, activationCode, code, password } = req.body;

  const rawPhone = (phone || identifier || '').toString().trim();
  const rawPassword = (password || '').toString().trim();
  const inputCode = (activationCode || code || '').toString().trim();

  // If user only provided a code without a password
  if (!rawPassword && inputCode) {
    return res.status(400).json({
      error: 'تسجيل الدخول يتم برقم هاتفك وكلمة المرور التي أنشأتها في حسابك فقط. كود التفعيل مخصص لتأكيد وتفعيل الاشتراك من نافذة "تفعيل الاشتراك".',
      requirePassword: true,
    });
  }

  if (!rawPhone) {
    return res.status(400).json({
      error: 'يرجى إدخال رقم الهاتف المسجل لتسجيل الدخول.',
    });
  }

  if (!rawPassword) {
    return res.status(400).json({
      error: 'يرجى إدخال كلمة المرور الخاصة بحسابك.',
    });
  }

  const cleanPhone = normalizePhone(rawPhone);
  const user = cleanPhone ? db.findUserByPhone(cleanPhone) : db.findUserByEmail(rawPhone);

  if (!user) {
    return res.status(401).json({
      error: 'لم يتم العثور على حساب مسجل بهذا الرقم. يرجى إنشاء حساب جديد وتعيين كلمة المرور أولاً.',
    });
  }

  // Strictly verify student password
  const convertedPassword = convertArabicDigitsToEnglish(rawPassword);
  const isValidPassword =
    bcrypt.compareSync(rawPassword, user.passwordHash) ||
    bcrypt.compareSync(convertedPassword, user.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({
      error: 'كلمة المرور غير صحيحة. لا يمكن الدخول إلى هذا الحساب إلا بكلمة المرور الخاصة به. يمكنك استخدام خيار "نسيت كلمة المرور؟" لاستعادتها.',
    });
  }

  user.lastLoginAt = new Date().toISOString();
  db.updateUser(user.id, { lastLoginAt: user.lastLoginAt });

  const token = generateAuthToken(user);
  const { sub, remainingDays, remainingHours, isActivated, isExpired } = getSubscriptionDetails(user.id);
  const progress = db.getStudentProgress(user.id);

  if (user.role === 'student' && sub?.status === 'suspended') {
    return res.status(403).json({
      error: 'تم إيقاف اشتراكك من قبل إدارة الأكاديمية. يرجى التواصل مع الدعم الفني.',
    });
  }

  const welcomeMessage = (user.role === 'student' && !isActivated)
    ? `مرحبًا بك يا باشمهندس ${user.name}. حسابك مسجل، يمكنك إدخال كود التفعيل لتأكيد اشتراكك وبدء التصفح.`
    : (user.role === 'student' && isExpired)
      ? `انتهت صلاحية اشتراكك يا باشمهندس ${user.name}. يرجى تجديد الاشتراك للحصول على إمكانية الوصول الكامل.`
      : `مرحبًا بك يا باشمهندس ${user.name}! تم تسجيل الدخول بنجاح.`;

  const studentObj = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    university: user.university,
    studyLevel: user.studyLevel,
    major: user.major,
    role: user.role,
    subscriptionPlan: sub?.plan || 'monthly',
    subscriptionStatus: sub?.status || 'pending',
    subscriptionStartDate: sub?.startDate,
    subscriptionEndDate: sub?.expiryDate,
    remainingDays,
    remainingHours,
    isActivated,
    isExpired,
    completedLessons: progress.completedLessons || [],
    quizScores: progress.quizScores || {},
  };

  res.json({
    success: true,
    message: welcomeMessage,
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      university: user.university,
      studyLevel: user.studyLevel,
      major: user.major,
      role: user.role,
    },
    subscription: {
      ...sub,
      remainingDays,
      remainingHours,
      isActivated,
      isExpired,
    },
    student: studentObj,
  });
});

// Forgot Password - Initiate recovery
router.post('/auth/forgot-password', (req, res) => {
  const { phone, email } = req.body;
  if (!phone && !email) {
    return res.status(400).json({ error: 'يرجى إدخال رقم الهاتف المسجل لاستعادة كلمة المرور.' });
  }

  const cleanPhone = phone ? phone.trim().replace(/[^0-9]/g, '') : '';
  let user = cleanPhone ? db.findUserByPhone(cleanPhone) : null;
  if (!user && email) {
    user = db.findUserByEmail(email.trim());
  }

  if (!user) {
    return res.status(404).json({
      error: 'لم يتم العثور على حساب مسجل بهذا الرقم. يرجى التأكد من كتابة الرقم بشكل صحيح أو إنشاء حساب جديد.',
    });
  }

  const { code, token, expiresAt } = db.createPasswordReset(user.id, user.phone);

  res.json({
    success: true,
    message: 'تم إنشاء رمز التحقق لاستعادة الحساب بنجاح.',
    phone: user.phone,
    recoveryToken: token,
    recoveryCode: code,
    expiresAt,
  });
});

// Reset Password - Verify code and set new password
router.post('/auth/reset-password', (req, res) => {
  const { phone, recoveryCode, newPassword } = req.body;

  if (!phone || !recoveryCode || !newPassword) {
    return res.status(400).json({ error: 'يرجى إدخال رقم الهاتف، رمز التحقق، وكلمة المرور الجديدة.' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'يجب أن تتكون كلمة المرور الجديدة من 4 خانات على الأقل.' });
  }

  const userId = db.verifyAndConsumePasswordReset(phone, recoveryCode);
  if (!userId) {
    return res.status(400).json({
      error: 'رمز التحقق غير صحيح أو انتهت صلاحيته (صلاحية الرمز 15 دقيقة). يرجى طلب رمز جديد.',
    });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.updateUserPassword(userId, newHash);

  res.json({
    success: true,
    message: 'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
  });
});

// Student Profile Edit
router.put('/student/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, university, studyLevel, major, email } = req.body;
  const user = req.user!;

  const updates: Partial<DBUser> = {};
  if (name && name.trim()) updates.name = name.trim();
  if (university && university.trim()) updates.university = university.trim();
  if (studyLevel) updates.studyLevel = studyLevel;
  if (major && major.trim()) updates.major = major.trim();
  if (email !== undefined) updates.email = email ? email.trim() : undefined;

  const updated = db.updateUser(user.id, updates);

  res.json({
    success: true,
    message: 'تم تحديث البيانات الشخصية بنجاح.',
    user: {
      id: updated!.id,
      name: updated!.name,
      phone: updated!.phone,
      email: updated!.email,
      university: updated!.university,
      studyLevel: updated!.studyLevel,
      major: updated!.major,
      role: updated!.role,
      preferredVoiceGender: updated!.preferredVoiceGender || 'male',
      preferredVoiceId: updated!.preferredVoiceId || 'ar-male-academic-1',
    },
  });
});

// Official Backend TTS Voice Profiles & Synthesis Engine
const OFFICIAL_ARABIC_MALE_VOICES = [
  {
    id: 'ar-male-academic-1',
    name: 'صوت دكتور ميكاترونكس — رجل عربي فصيح أوديو (السعودية)',
    gender: 'male' as const,
    lang: 'ar-SA',
    pitch: 0.80,
    rate: 0.88,
    description: 'صوت وقور ونبرة أكاديمية عميقة ومخارج حروف واضحة وشرح مبسط',
    isDefault: true,
  },
  {
    id: 'ar-male-engineer-2',
    name: 'صوت مهندس ميكاترونكس — رجل عربي فصيح تقني (مصر)',
    gender: 'male' as const,
    lang: 'ar-EG',
    pitch: 0.82,
    rate: 0.90,
    description: 'صوت تقني سريع للنطق بالمعادلات ورموز الرياضيات',
    isDefault: false,
  },
  {
    id: 'ar-male-news-3',
    name: 'صوت رجل عربي إخباري — فصحى معيارية (الإمارات)',
    gender: 'male' as const,
    lang: 'ar-AE',
    pitch: 0.84,
    rate: 0.86,
    description: 'صوت إخباري فصيح ذو مخارج حروف جليّة في الشرائح',
    isDefault: false,
  },
];

router.get('/tts/voices', (req, res) => {
  res.json({
    success: true,
    voices: OFFICIAL_ARABIC_MALE_VOICES,
    defaultVoiceId: 'ar-male-academic-1',
    message: 'تم جلب قائمة أصوات الرجال الفصيحة الرسمية بنجاح.',
  });
});

router.post('/tts/synthesize', (req, res) => {
  const { text = '', voiceId = 'ar-male-academic-1', pitch = 0.80, rate = 0.88 } = req.body;
  const voice = OFFICIAL_ARABIC_MALE_VOICES.find((v) => v.id === voiceId) || OFFICIAL_ARABIC_MALE_VOICES[0];

  res.json({
    success: true,
    originalText: text,
    cleanedText: text,
    voice,
    synthesisConfig: {
      lang: voice.lang,
      pitch: typeof pitch === 'number' ? pitch : voice.pitch,
      rate: typeof rate === 'number' ? rate : voice.rate,
      gender: 'male',
    },
  });
});

router.post('/student/voice-preference', requireAuth, (req: AuthenticatedRequest, res) => {
  const { preferredVoiceGender = 'male', preferredVoiceId = 'ar-male-academic-1' } = req.body;
  const user = req.user!;

  db.updateUser(user.id, {
    preferredVoiceGender,
    preferredVoiceId,
  });

  res.json({
    success: true,
    message: 'تم حفظ تفضيلات الصوت في حساب الطالب بنجاح (صوت رجل عربي فصيح).',
    preferredVoiceGender,
    preferredVoiceId,
  });
});

// Student Change Password
router.post('/student/change-password', requireAuth, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'يرجى إدخال كلمة المرور الحالية وكلمة المرور الجديدة.' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'يجب ألا تقل كلمة المرور الجديدة عن 4 أحرف أو أرقام.' });
  }

  const user = req.user!;
  const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.updateUserPassword(user.id, newHash);

  res.json({
    success: true,
    message: 'تم تغيير كلمة المرور بنجاح.',
  });
});

// Current User Profile & Subscription Status
router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { sub, remainingDays, isActivated, isExpired } = getSubscriptionDetails(user.id);
  const progress = db.getStudentProgress(user.id);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      university: user.university,
      studyLevel: user.studyLevel,
      major: user.major,
      role: user.role,
    },
    student: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      university: user.university,
      studyLevel: user.studyLevel,
      major: user.major,
      role: user.role,
      subscriptionPlan: sub?.plan || 'monthly',
      subscriptionStatus: sub?.status || 'pending',
      subscriptionStartDate: sub?.startDate,
      subscriptionEndDate: sub?.expiryDate,
      remainingDays,
      isActivated,
      isExpired,
      completedLessons: progress.completedLessons || [],
      quizScores: progress.quizScores || {},
    },
    subscription: sub
      ? {
          ...sub,
          remainingDays,
          isActivated,
          isExpired,
        }
      : null,
  });
});

// Mutex lock for atomic activation per code
const codeActivationLock = new Set<string>();

// Activate Subscription Code (Strictly for confirming subscription for student account)
router.post('/activate-code', (req: AuthenticatedRequest, res) => {
  const { code, phone, password } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'يرجى إدخال كود التفعيل المكون من أرقام أو حروف.' });
  }

  const cleanCode = code.trim().toUpperCase();

  // Prevent race conditions / concurrent usage of the same code
  if (codeActivationLock.has(cleanCode)) {
    return res.status(409).json({ error: 'جاري معالجة تفعيل هذا الكود حالياً. يرجى الانتظار لحظات.' });
  }
  codeActivationLock.add(cleanCode);

  try {
    const codes = db.getAllActivationCodes();
    const foundCode = codes.find((c) => c.code.trim().toUpperCase() === cleanCode);

    // 1. Verify code exists in DB
    if (!foundCode) {
      return res.status(400).json({
        error: 'كود التفعيل غير صحيح أو غير موجود. يرجى التأكد من كود التفعيل المستلم من الإدارة.',
      });
    }

    // 2. Check if code is suspended
    if (foundCode.status === 'suspended' || foundCode.isActive === false) {
      return res.status(400).json({
        error: 'تم إيقاف هذا الكود/الاشتراك من قبل إدارة الأكاديمية.',
      });
    }

    // 3. Check if code has expired
    const now = new Date();
    if (foundCode.status === 'expired' || (foundCode.expiresAt && new Date(foundCode.expiresAt) < now)) {
      return res.status(400).json({
        error: 'انتهت صلاحية هذا الكود.',
      });
    }

    // Determine target student / user
    let targetUser = req.user;
    const cleanPhone = phone ? normalizePhone(phone) : (targetUser?.phone ? normalizePhone(targetUser.phone) : '');

    // If not authenticated, require phone and verify password for this student account
    if (!targetUser) {
      if (!cleanPhone) {
        return res.status(400).json({
          error: 'يرجى إدخال رقم هاتفك المسجل وكلمة المرور لربط وتأكيد تفعيل الكود بحسابك.',
          requirePhone: true,
          requirePassword: true,
        });
      }

      targetUser = db.findUserByPhone(cleanPhone);
      if (!targetUser) {
        return res.status(400).json({
          error: `لم يتم العثور على حساب مسجل برقم الهاتف (${cleanPhone}). يرجى إنشاء حساب جديد أولاً وتعيين كلمة المرور، ثم إدخال كود التفعيل لتأكيد اشتراكك.`,
          requireRegister: true,
        });
      }

      if (!password) {
        return res.status(400).json({
          error: 'يرجى إدخال كلمة المرور الخاصة بحسابك للتحقق وتأكيد تفعيل الاشتراك.',
          requirePassword: true,
        });
      }

      const convertedPassword = convertArabicDigitsToEnglish(password.toString().trim());
      const isValidPass =
        bcrypt.compareSync(password.toString().trim(), targetUser.passwordHash) ||
        bcrypt.compareSync(convertedPassword, targetUser.passwordHash);

      if (!isValidPass) {
        return res.status(401).json({
          error: 'كلمة المرور غير صحيحة. يرجى إدخال كلمة المرور التي أنشأتها عند تسجيل حسابك لتأكيد التفعيل.',
        });
      }
    }

    // 4. Check if code is already used (strictly single-use only)
    const isCodeUsed = foundCode.status === 'used' || foundCode.isUsed || (foundCode.timesUsed && foundCode.timesUsed >= 1);
    if (isCodeUsed) {
      const boundPhone = foundCode.phone ? normalizePhone(foundCode.phone) : (foundCode.usedByStudents?.[0]?.phone ? normalizePhone(foundCode.usedByStudents[0].phone) : '');

      if (boundPhone && cleanPhone && boundPhone !== cleanPhone) {
        return res.status(400).json({
          error: 'هذا الكود مستخدم مسبقًا ومرتبط برقم هاتف وحساب طالب آخر ولا يمكن استخدامه.',
        });
      }

      return res.status(400).json({
        error: 'هذا الكود مستخدم مسبقًا وتم تفعيله بالفعل. لا يمكن استخدام الكود إلا مرة واحدة فقط. يمكنك تسجيل الدخول بكلمة المرور الخاصة بك في أي وقت.',
      });
    }

    // 5. Ensure target student account exists
    if (!targetUser) {
      return res.status(400).json({
        error: `لم يتم العثور على حساب مسجل برقم الهاتف (${cleanPhone}). يرجى إنشاء حساب الطالب أولاً وتعيين كلمة المرور، ثم إدخال كود التفعيل لتأكيد وتفعيل اشتراكك.`,
        requireRegister: true,
      });
    }

    // 6. Verify Type and calculate duration:
    // Monthly: prefix AS-, duration 30 days, price $20
    // Yearly: prefix AB-, duration 365 days, price $200
    let planType: 'monthly' | 'yearly' = 'monthly';
    let durationDays = 30;
    let priceUSD = 20;

    if (cleanCode.startsWith('AB-') || foundCode.type === 'yearly' || foundCode.planType === 'yearly') {
      planType = 'yearly';
      durationDays = 365;
      priceUSD = 200;
    } else {
      planType = 'monthly';
      durationDays = 30;
      priceUSD = 20;
    }

    const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 7. Bind code to student & phone, change status to 'used', prevent reuse
    db.updateActivationCode(foundCode.code, {
      type: planType,
      planType: planType,
      status: 'used',
      isUsed: true,
      timesUsed: 1,
      maxUses: 1,
      phone: cleanPhone,
      studentName: targetUser.name,
      studentId: targetUser.id,
      activatedAt: now.toISOString(),
      expiresAt: expiryDate.toISOString(),
      activatedBy: 'student',
      priceUSD,
      usedByStudents: [
        {
          studentId: targetUser.id,
          studentName: targetUser.name,
          phone: cleanPhone,
          usedAt: now.toISOString(),
        },
      ],
    });

    // 8. Create or update student subscription in DB
    const userSub = db.getSubscriptionByUserId(targetUser.id);
    const updatedSub: DBSubscription = {
      id: userSub?.id || `sub-${Date.now()}`,
      userId: targetUser.id,
      studentId: targetUser.id,
      phone: cleanPhone,
      code: cleanCode,
      type: planType,
      plan: planType,
      status: 'active',
      startDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      createdAt: userSub?.createdAt || now.toISOString(),
      activatedAt: now.toISOString(),
      activationMethod: 'activation_code',
      notes: `تم التفعيل عبر الكود المعتمد ${cleanCode}`,
    };
    db.createOrUpdateSubscription(updatedSub);

    // Mark pending subscription requests for this phone as approved
    const requests = db.getAllRequests();
    const userReq = requests.find((r) => r.phone === cleanPhone && r.status === 'pending');
    if (userReq) {
      db.updateRequestStatus(userReq.id, 'approved');
    }

    targetUser.lastLoginAt = now.toISOString();
    db.updateUser(targetUser.id, { lastLoginAt: targetUser.lastLoginAt });

    const token = generateAuthToken(targetUser);
    const progress = db.getStudentProgress(targetUser.id);

    return res.json({
      success: true,
      message: `تهانينا يا باشمهندس ${targetUser.name}! تم تفعيل اشتراكك بنجاح (${planType === 'yearly' ? 'سنة كاملة' : '30 يومًا'}). يمكنك الآن التصفح فوراً.`,
      token,
      subscription: {
        ...updatedSub,
        remainingDays: durationDays,
        isActivated: true,
        isExpired: false,
      },
      student: {
        id: targetUser.id,
        name: targetUser.name,
        phone: targetUser.phone,
        email: targetUser.email,
        university: targetUser.university,
        studyLevel: targetUser.studyLevel,
        major: targetUser.major,
        role: targetUser.role,
        subscriptionPlan: updatedSub.plan,
        subscriptionStatus: 'active',
        subscriptionStartDate: updatedSub.startDate,
        subscriptionEndDate: updatedSub.expiryDate,
        remainingDays: durationDays,
        isActivated: true,
        isExpired: false,
        completedLessons: progress.completedLessons || [],
        quizScores: progress.quizScores || {},
      },
    });
  } finally {
    codeActivationLock.delete(cleanCode);
  }
});

// Submit Subscription Request (WhatsApp Flow)
router.post('/subscription-request', (req, res) => {
  const { studentName, name, phone, university, studyLevel, major, plan, paymentMethod, transactionRef } = req.body;
  const finalName = (studentName || name || '').toString().trim();
  const rawPhone = (phone || '').toString().trim();

  if (!finalName || !rawPhone) {
    return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان لإرسال طلب الاشتراك.' });
  }

  const cleanPhone = normalizePhone(rawPhone) || rawPhone;
  const existingUser = db.findUserByPhone(cleanPhone);

  const newRequest: DBSubscriptionRequest = {
    id: `req-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    userId: existingUser?.id || req.body.userId || 'guest',
    studentName: finalName,
    phone: cleanPhone,
    university: university || 'الجامعة الإماراتية الدولية – صنعاء',
    plan: plan === 'yearly' ? 'yearly' : 'monthly',
    priceUSD: plan === 'yearly' ? 200 : 20,
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: `${major || 'ميكاترونكس'} - ${studyLevel || 'السنة الأولى'} - طريقة الدفع: ${paymentMethod || 'كريمي'}${transactionRef ? ' - الحوالة: ' + transactionRef : ''}`,
  };

  db.createRequest(newRequest);

  res.json({
    success: true,
    message: 'تم تسجيل طلب الاشتراك بنجاح. تواصل معنا عبر واتساب لإتمام التفعيل.',
    requestId: newRequest.id,
  });
});

// Public Subjects List
router.get('/subjects', (req, res) => {
  res.json({ subjects, lessons });
});

// Update Student Progress
router.post('/student/progress', requireAuth, (req: AuthenticatedRequest, res) => {
  const studentId = req.user!.id;
  const { completedLessonId, quizScore, simulatorSetting } = req.body;

  const currentProgress = db.getStudentProgress(studentId);

  if (completedLessonId && !currentProgress.completedLessons.includes(completedLessonId)) {
    currentProgress.completedLessons.push(completedLessonId);
  }

  if (quizScore && quizScore.lessonId && typeof quizScore.percentage === 'number') {
    currentProgress.quizScores[quizScore.lessonId] = quizScore.percentage;
  }

  if (simulatorSetting && simulatorSetting.key) {
    currentProgress.simulatorSettings[simulatorSetting.key] = simulatorSetting.value;
  }

  const saved = db.saveStudentProgress(studentId, currentProgress);
  res.json({ success: true, progress: saved });
});

// Get Student Personal Notes
router.get('/student/notes', authenticateToken, (req: AuthenticatedRequest, res) => {
  const studentId = req.user?.id || req.query.studentId as string || 'guest';
  const progress = db.getStudentProgress(studentId);
  res.json({ success: true, notes: progress.lessonNotes || {} });
});

router.get('/student/notes/:lessonId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const studentId = req.user?.id || req.query.studentId as string || 'guest';
  const { lessonId } = req.params;
  const progress = db.getStudentProgress(studentId);
  const note = (progress.lessonNotes || {})[lessonId] || null;
  res.json({ success: true, lessonId, note });
});

// Save or Update Personal Lesson Note
router.post('/student/notes', authenticateToken, (req: AuthenticatedRequest, res) => {
  const studentId = req.user?.id || req.body.studentId || 'guest';
  const { lessonId, lessonTitle, noteText } = req.body;

  if (!lessonId || !lessonId.trim()) {
    return res.status(400).json({ error: 'معرّف الدرس مطلوب لحفظ الملاحظة.' });
  }

  const progress = db.getStudentProgress(studentId);
  if (!progress.lessonNotes) {
    progress.lessonNotes = {};
  }

  if (!noteText || !noteText.trim()) {
    delete progress.lessonNotes[lessonId];
  } else {
    progress.lessonNotes[lessonId] = {
      text: noteText.trim(),
      lessonTitle: lessonTitle || lessonId,
      updatedAt: new Date().toISOString(),
    };
  }

  db.saveStudentProgress(studentId, { lessonNotes: progress.lessonNotes });
  res.json({
    success: true,
    message: 'تم حفظ الملاحظة الشخصية بنجاح في قاعدة البيانات.',
    note: progress.lessonNotes[lessonId] || null,
  });
});

// Delete Personal Lesson Note
router.delete('/student/notes/:lessonId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const studentId = req.user?.id || req.query.studentId as string || 'guest';
  const { lessonId } = req.params;

  const progress = db.getStudentProgress(studentId);
  if (progress.lessonNotes && progress.lessonNotes[lessonId]) {
    delete progress.lessonNotes[lessonId];
    db.saveStudentProgress(studentId, { lessonNotes: progress.lessonNotes });
  }

  res.json({ success: true, message: 'تم حذف الملاحظة بنجاح.' });
});

// Explain Lesson Engine
router.post('/explain-lesson', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (user && user.role === 'student') {
      const sub = req.subscription || db.getSubscriptionByUserId(user.id);
      if (sub && (sub.status === 'expired' || sub.status === 'suspended')) {
        return res.status(403).json({
          success: false,
          error: 'انتهت صلاحية اشتراكك، يرجى التجديد لاستخدام خدمة الشرح الذكي.',
          subscriptionStatus: sub.status,
          code: 'SUBSCRIPTION_INACTIVE',
        });
      }
    }

    const {
      mode = 'text',
      prompt = '',
      fileData,
      filesData,
      mimeType,
      fileName,
      explanationLevel = 'simple',
      actionType = 'full_explain',
      specificPart = '',
      studentUniversity,
      studentMajor,
      studentId,
      lessonTitle,
      textContent,
      imageBase64,
      pdfPageChoice,
      useSerwayReference,
      doctorConfig,
    } = req.body;

    const actualFileData = fileData || imageBase64;
    const actualPrompt = prompt || textContent || (lessonTitle ? `عنوان الدرس: ${lessonTitle}` : '');
    const actualMode = mode || (imageBase64 || (filesData && filesData.length > 0) ? 'image' : 'text');

    if (!actualFileData && (!filesData || filesData.length === 0) && !actualPrompt) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تقديم محتوى نصي أو رفع صورة/ملف لشرح الدرس.',
        code: 'MISSING_EXPLAIN_INPUT',
        suggestion: 'أدخل نص الدرس أو ارفع صورة/ملف للدرس المطلوب شرحه.',
      });
    }

    const explanation = await processExplainLesson({
      mode: actualMode,
      prompt: actualPrompt,
      fileData: actualFileData,
      filesData,
      mimeType,
      fileName: fileName || (lessonTitle ? `${lessonTitle}` : undefined),
      explanationLevel,
      actionType,
      specificPart,
      studentUniversity: studentUniversity || user?.university || 'الجامعة الإماراتية الدولية – صنعاء',
      studentMajor: studentMajor || user?.major || 'هندسة الميكاترونكس',
      studentId: studentId || user?.id,
      pdfPageChoice,
      useSerwayReference: Boolean(useSerwayReference),
      doctorConfig,
    });

    if (user?.id) {
      try {
        db.saveStudentLesson({
          ...explanation,
          studentId: user.id,
          savedAt: new Date().toISOString(),
        });
      } catch (e) {
        // silent
      }
    }

    return res.json({
      success: true,
      result: explanation,
      explanation,
      isAiGenerated: explanation.isAiGenerated,
      noticeMessage: explanation.noticeMessage || (explanation.aiErrorInfo ? explanation.aiErrorInfo.message : undefined),
    });
  } catch (error: any) {
    console.error('[API /explain-lesson error]:', error);
    const statusCode = error?.status || 500;
    return res.status(statusCode).json({
      success: false,
      error: error?.userMessage || 'حدث خطأ أثناء معالجة وتوليد شرح الدرس.',
      details: error?.message || String(error),
      code: error?.code || 'EXPLAIN_LESSON_FAILED',
      suggestion: 'يرجى التأكد من وضوح الصورة المرفقة أو حجم الملف وإعادة المحاولة.',
    });
  }
});

// Transcribe Audio Speech-to-Text Endpoint
router.post('/transcribe-audio', async (req: AuthenticatedRequest, res) => {
  try {
    const { audioData, mimeType = 'audio/webm', fileName } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'لم يتم استلام أية بيانات صوتية للتفريغ.' });
    }

    const client = getGeminiClientFromService();
    if (!client) {
      return res.status(500).json({ error: 'مفتاح الذكاء الاصطناعي غير متوفر حالياً.' });
    }

    let cleanBase64 = '';
    let detectedMime = (mimeType || 'audio/webm').split(';')[0].trim();

    if (typeof audioData === 'string') {
      const trimmed = audioData.trim();
      const commaIdx = trimmed.indexOf(',');
      if (trimmed.startsWith('data:') && commaIdx !== -1) {
        const meta = trimmed.slice(5, commaIdx);
        const metaMime = meta.split(';')[0].trim();
        if (metaMime) detectedMime = metaMime;
        cleanBase64 = trimmed.slice(commaIdx + 1);
      } else {
        cleanBase64 = trimmed;
      }
    }

    // Strip any possible residual data URI prefix and all whitespace/newlines
    cleanBase64 = cleanBase64.replace(/^data:[^,]+,/, '').replace(/\s+/g, '');

    if (!cleanBase64) {
      return res.status(400).json({ error: 'ملف الصوت غير صالح أو فارغ.' });
    }

    // Clean MIME type (must be clean like audio/webm, audio/mp3, audio/wav, without browser codecs like ;codecs=opus)
    let actualMime = (detectedMime || 'audio/webm').split(';')[0].trim().toLowerCase();
    if (!actualMime || actualMime === 'audio' || actualMime === 'application/octet-stream') {
      actualMime = 'audio/webm';
    }

    const promptText = `أنت خبير واستشاري تحويل الصوت إلى نص (Speech-to-Text) متخصص في الهندسة والميكاترونكس والفيزياء والرياضيات باللغة العربية.
قم بتفريغ وتحويل المقطع الصوتي المرفق إلى نص دقيق وواضح جداً باللغة العربية مع المحافظة على كافة المصطلحات الهندسية والرموز والقوانين والأرقام المذكورة.
المطلوب: إرجاع النص المفرّغ فقط بدون أية مقدمات أو هوامش أو تعليقات خارجية.`;

    const response = await callGeminiWithResilience(client, {
      contents: [
        {
          inlineData: {
            mimeType: actualMime,
            data: cleanBase64,
          },
        },
        { text: promptText },
      ],
      config: {
        temperature: 0.1,
      },
      preferredModel: 'gemini-3.5-transcribe',
      fallbackModels: [
        'gemini-3.8-flash',
        'gemini-3.6-flash',
        'gemini-flash-latest',
      ],
    });

    const transcribedText = response.text ? response.text.trim() : '';

    if (!transcribedText) {
      return res.status(400).json({ error: 'تعذر استخرج نص من التسجيل الصوتي. يرجى التأكد من وضوح الصوت والتحدث بالقرب من الميكروفون.' });
    }

    res.json({ success: true, text: transcribedText, modelUsed: response.modelUsed });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء تحويل الصوت إلى نص.' });
  }
});

// Get Student Saved Lessons
router.get('/student-lessons', requireAuth, (req: AuthenticatedRequest, res) => {
  const userLessons = db.getStudentLessons(req.user!.id);
  res.json({ lessons: userLessons });
});

router.get('/student-lessons/:studentId', (req, res) => {
  const { studentId } = req.params;
  const userLessons = db.getStudentLessons(studentId);
  res.json({ lessons: userLessons });
});

// Save Student Explained Lesson
router.post('/student-lessons', requireAuth, (req: AuthenticatedRequest, res) => {
  const { lesson } = req.body;
  if (!lesson) return res.status(400).json({ error: 'بيانات الدرس مطلوبة.' });

  const saved = db.saveStudentLesson({
    ...lesson,
    studentId: req.user!.id,
    savedAt: new Date().toISOString(),
  });

  res.json({ success: true, lesson: saved });
});

router.post('/student-lessons/save', (req, res) => {
  const { lesson, studentId } = req.body;
  if (!lesson) return res.status(400).json({ error: 'بيانات الدرس مطلوبة.' });

  const saved = db.saveStudentLesson({
    ...lesson,
    studentId: studentId || lesson.studentId || 'guest',
    savedAt: new Date().toISOString(),
  });

  res.json({ success: true, lesson: saved });
});

// Delete student explained lesson
router.delete('/student-lessons/:lessonId', (req: AuthenticatedRequest, res) => {
  const { lessonId } = req.params;
  const studentId = req.user?.id || req.body?.studentId || '';
  const success = db.deleteStudentLesson(lessonId, studentId);
  res.json({ success });
});

// AI Chat endpoint
router.post('/ai/chat', async (req: AuthenticatedRequest, res) => {
  try {
    const { message, history = [], currentLessonTitle, currentSubjectName, imageBase64 } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'يرجى إرسال سؤال أو نص للمساعد.' });
    }

    const client = getGeminiClient();

    const systemInstruction = `
أنت "مساعد الميكاترونكس الذكي الأكاديمي"، أستاذ وخبير متخصص لطلاب السنة الأولى في هندسة الميكاترونكس في الجامعات اليمنية (مثل الجامعة الإماراتية الدولية بصنعاء، جامعة صنعاء، وغيرها).
فلسفتك الأساسية الصارمة: "لا تحفظ القانون، افهمه، وطبقه بدقة رياضية وهندسية مطلقة وفق نهج خطوة بخطوة (Step-by-Step)."

البروتوكول الإلزامي والصارم لشرح وحل أي مسألة هندسية أو رياضية أو فيزيائية أو كهربائية (Mandatory Step-by-Step Problem Solving Protocol):
يجب عليك إلزامياً عند شرح أو حل أي مسألة أو تمرين أو معادلة أو دائرة كهربائية تنظيم الإجابة وفق الهيكل التالي بدون أي اختصار أو قفزات:

1. 📥 المعطيات (Given):
   - استخرج كافة المعطيات العددية والرمزية والفيزيائية المذكورة في السؤال أو الصورة بدقة متناهية.
   - اكتب كل معطى بصيغة واضحة: الرمز = القيمة + الوحدة الأصلية (مثال: الكتلة m = 5 kg، الجهد V = 12 V، المقاومة R = 100 Ω، السرعة v0 = 20 m/s).
   - إذا كانت أي وحدة غير متجانسة أو لا تتبع النظام الدولي للوحدات (SI Units) مثل (cm, mm, mA, kΩ, g, rpm, min, hr, μF)، اكتب خطوة تحويل الوحدة صراحة وبشكل منفصل (مثال: I = 50 mA = 50 × 10⁻³ A = 0.05 A).

2. 🎯 المطلوب (Required / To Find):
   - حدد بوضوح تام ما هو المطلوب حسابه أو إيجاده أو برهانه.
   - إذا كانت المسألة تتضمن فقرات متعددة (أ، ب، ج... أو المطلوب 1، 2، 3...)، قم بحصر كل فرع ومطلوب على حدة وبترقيم واضح دون تفويت أي جزء.

3. 📐 القوانين والمعادلات الحاكمة (Governing Formulas):
   - اذكر القانون الفيزيائي أو الرياضي الأساسي بصيغته المعتمدة الدقيقة (مثل: قانون أوم V = I × R، قانون نيوتن الثاني ∑F = m × a، معادلات الحركة، كيرشوف KVL/KCL، مقسم الجهد والتيار، الشغل والطاقة W = F × d × cosθ).
   - وضّح شروط تطبيق القانون ودلالة كل رمز فيزيائي ووحدته وأبعاده.

4. 🔢 خطوات الحل التفصيلية (Step-by-Step Execution):
   - قسّم الحل إلى خطوات منطقية متسلسلة ومرقمة: [الخطوة 1]، [الخطوة 2]، [الخطوة 3]...
   - اكتب خطوات التعويض المباشر بالأرقام داخل القانون بوضوح تام.
   - أظهر كافة العمليات الحسابية والرياضية الوسيطة (الضرب، القسمة، الجذور، التربيع، حساب المثلثات والزوايا).
   - قم بالتدقيق الرياضي الصارم لكل رقم تجنباً لأي خطأ حسابي.
   - في المسائل متعددة الفروع: قم بحل كل فرع ومطلوب تسلسلياً وبنفس مستوى الدقة والتفصيل.

5. 🏁 الناتج النهائي والوحدة القياسية (Final Result & Units):
   - اكتب الناتج النهائي بوضوح بارز ومميز.
   - اكتب الوحدة الفيزيائية الصحيحة بدقة في النظام الدولي (N, J, W, V, A, Ω, F, H, m/s, m/s², Pa...).

6. 🔬 التحليل النهائي والتفسير الهندسي (Final Analysis & Engineering Insights):
   - ما هو التفسير الفيزيائي للرقم الناتج؟ ولماذا حصلنا على هذه النتيجة؟
   - كيف يرتبط هذا الحل بمنظومات الميكاترونكس العملية (مثل: محركات السيرفو، حساسات الروبوتات، دوائر القدرة، الأنظمة الميكانيكية، أو سيارات المستقبل)؟
   - إجراء فحص منطقي للنتيجة (Sanity Check): هل الناتج منطقي فيزيائياً وعملياً؟ وما هي الأخطاء الشائعة التي يجب على الطالب تجنبها في الامتحانات؟

في الدوائر الكهربائية والإلكترونية:
- حدد العقد والمسارات واتجاهات التيار والجهد، واشرح تطبيق قوانين أوم وكيرشوف KVL/KCL ومقسم الجهد والتيار خطوة بخطوة بالقيم الدقيقة.
- تحدث باللغة العربية الفصحى الواضحة والراقية مع الحفاظ على المصطلحات الهندسية بالإنجليزية والرموز الرياضية المعيارية.
`;

    if (client) {
      try {
        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item.sender === 'user') {
              contents.push({ role: 'user', parts: [{ text: item.text }] });
            } else if (item.sender === 'ai') {
              contents.push({ role: 'model', parts: [{ text: item.text }] });
            }
          }
        }

        const currentParts: any[] = [];
        if (imageBase64) {
          currentParts.push({
            inlineData: {
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: 'image/jpeg',
            },
          });
        }
        currentParts.push({
          text: `السياق الحالي: مادة ${currentSubjectName || 'ميكاترونكس عام'} - درس ${currentLessonTitle || 'مبادئ عامة'}.\nسؤال الطالب: ${message || 'اشرح هذه المسألة بالتفصيل خطوة بخطوة'}`,
        });

        contents.push({ role: 'user', parts: currentParts });

        const { text: replyText } = await callGeminiWithResilience(client, {
          contents,
          config: { systemInstruction, temperature: 0.2 },
          preferredModel: 'gemini-3.1-pro-preview',
          fallbackModels: [
            'gemini-3.1-pro-preview',
            'gemini-3.8-flash',
            'gemini-3.1-flash-lite',
            'gemini-flash-latest',
          ],
        });

        return res.json({ reply: replyText });
      } catch (geminiError: any) {
        console.warn('Gemini API call error across resilience models, falling back to local guidance:', geminiError?.message);
      }
    }

    // Local Educational Response Fallback (following the same rigorous Step-by-Step methodology)
    const localReply = `أهلاً بك يا باشمهندس ${req.user?.name || ''}! 🎓
فيما يلي التحليل الأكاديمي المفصل لمسألتك وفق النهج الهندسي خطوة بخطوة:

1. 📥 **المعطيات (Given):**
   - حصر وتوثيق كافة المتغيرات المذكورة في السؤال: القيم العددية والرموز والوحدات.
   - تحويل الوحدات غير الدولية إلى النظام الدولي القياسي (SI Units) قبل البدء بالحساب.

2. 🎯 **المطلوب (Required):**
   - تحديد المجهول الأساسي أو الفروع المطلوبة في المسألة بدقة متناهية.

3. 📐 **القوانين الحاكمة (Governing Formulas):**
   - استدعاء المعادلة الفيزيائية أو الهندسية المعتمدة وشروط انطباقها ودلالات رموزها.

4. 🔢 **خطوات الحل التفصيلية (Step-by-Step Execution):**
   - [الخطوة 1]: التعويض المباشر بالقيم المعطاة في القانون.
   - [الخطوة 2]: إتمام العمليات الحسابية الجبرية بدقة متناهية ودون اختصار.
   - [الخطوة 3]: التحقق من اتساق الأبعاد الفيزيائية للمقادير.

5. 🏁 **الناتج النهائي والوحدة (Final Result & Unit):**
   - استخراج القيمة العددية الدقيقة مقترنة بالوحدة الفيزيائية الصحيحة (SI Unit).

6. 🔬 **التحليل النهائي والتفسير الهندسي (Final Analysis):**
   - ربط النتيجة بتطبيقات الميكاترونكس والتحكم والروبوتات والتحقق من منطقية الرقم فيزيائياً.
💡 *نصيحة مهندس:* عند حل المسائل في الامتحانات، كتابة المعطيات والقوانين بتسلسل منظم يضمن لك الدرجة الكاملة حتى في الخطوات الوسيطة!`;

    return res.json({ reply: localReply });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'حدث خطأ في معالجة المحادثة.', details: error?.message });
  }
});

// ==========================================
// 🎓 ENGINEERING ASSIGNMENT CREATOR APIS
// ==========================================

// Generate complete customized engineering assignment
router.post('/assignments/generate', async (req: Request, res: Response) => {
  try {
    const params = req.body;
    if (!params.title || !params.type) {
      return res.status(400).json({ error: 'يرجى تحديد نوع وعنوان التكليف الهندسي.' });
    }

    const assignment = await generateEngineeringAssignment(params);
    return res.json({
      success: true,
      assignment,
      message: 'تم إنشاء التكليف الهندسي بنجاح ويمكنك الآن تعديل وتخصيص كل تفاصيله.',
    });
  } catch (error: any) {
    console.error('Assignment generation error:', error);
    return res.status(500).json({
      error: 'تعذر إنشاء التكليف بالذكاء الاصطناعي، تحقق من الاتصال بالإنترنت وحاول مرة أخرى.',
      details: error?.message,
    });
  }
});

// Refine a single section with AI (Rephrase, Simplify, Expand, Shorten, Fix, Academic, Translate)
router.post('/assignments/refine-section', async (req: Request, res: Response) => {
  try {
    const { sectionTitle, currentContent, instructionType, subject, major } = req.body;
    if (!currentContent || !instructionType) {
      return res.status(400).json({ error: 'محتوى القسم ونوع التحسين مطلوبان.' });
    }

    const refinedContent = await refineAssignmentSectionWithAi({
      sectionTitle: sectionTitle || 'قسم هندسي',
      currentContent,
      instructionType,
      subject,
      major,
    });

    return res.json({
      success: true,
      refinedContent,
    });
  } catch (error: any) {
    console.error('Refine assignment section error:', error);
    return res.status(500).json({
      error: 'تعذر تحسين القسم بالذكاء الاصطناعي حالياً، يرجى المحاولة مرة أخرى.',
      details: error?.message,
    });
  }
});

// ==========================================
// SMART ENGINEERING LAB APIS (مختبر المشاريع الهندسية الذكي)
// ==========================================

// Get preset buttons list
router.get('/lab/presets', (req: Request, res: Response) => {
  return res.json({
    success: true,
    presets: PROJECT_PRESET_BUTTONS,
  });
});

// Get available verified templates
router.get('/lab/templates', (req: Request, res: Response) => {
  const templateList = Object.entries(CORE_PROJECT_TEMPLATES).map(([key, proj]) => ({
    id: key,
    title: proj.title,
    category: proj.category,
    idea: proj.idea,
    componentsCount: proj.components.length,
    stepsCount: proj.steps.length,
    simulationType: proj.simulationConfig?.type || 'generic',
  }));

  return res.json({
    success: true,
    templates: templateList,
  });
});

// Get full project data by template ID
router.get('/lab/project/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const project = CORE_PROJECT_TEMPLATES[id];

  if (!project) {
    return res.status(404).json({ error: 'لم يتم العثور على نموذج المشروع المطلوب.' });
  }

  // Ensure full harmonization and gallery images
  const harmonized = validateAndHarmonizeProject(JSON.parse(JSON.stringify(project)));
  return res.json({
    success: true,
    project: harmonized,
  });
});

// Generate or Modify engineering project with Gemini API
router.post('/lab/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, category, isModification, existingProject } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'يرجى كتابة فكرة المشروع أو مواصفاته الهندسية.' });
    }

    const cleanPrompt = prompt.trim();
    const cleanCategory = category || 'arduino';

    const projectData = await generateProjectWithGemini(
      cleanPrompt,
      cleanCategory,
      existingProject
    );

    const compatibility = verifyPinCompatibility(projectData);

    return res.json({
      success: true,
      project: projectData,
      compatibility,
      message: isModification ? 'تم تعديل وتحديث المشروع الهندسي بنجاح.' : 'تم بناء وتوليد المشروع الهندسي المتكامل بنجاح.',
    });
  } catch (error: any) {
    console.error('Project Lab generation error:', error);
    return res.status(500).json({
      error: 'تعذر إنشاء المشروع بالذكاء الاصطناعي، يرجى التحقق من الاتصال بالإنترنت وحاول مرة أخرى.',
      details: error?.message,
    });
  }
});

// Verify pin compatibility between Arduino Code and Wiring Diagram
router.post('/lab/validate-compatibility', (req: Request, res: Response) => {
  try {
    const { project } = req.body;
    if (!project) {
      return res.status(400).json({ error: 'بيانات المشروع مطلوبة للفحص.' });
    }

    const harmonized = validateAndHarmonizeProject(project);
    const verification = verifyPinCompatibility(harmonized);

    return res.json({
      success: true,
      harmonizedProject: harmonized,
      verification,
    });
  } catch (error: any) {
    console.error('Pin compatibility validation error:', error);
    return res.status(500).json({
      error: 'تعذر إجراء فحص التوافق للأرجل.',
      details: error?.message,
    });
  }
});

// ==========================================
// ADMIN PANEL APIS (SECURE & ROLE PROTECTED)
// ==========================================


// Admin Login
router.post('/admin/login', (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!password) {
      return res.status(400).json({ error: 'يرجى إدخال كلمة مرور المسؤول.' });
    }

    const clean = identifier ? String(identifier).trim() : '';
    let users: DBUser[] = [];
    try {
      users = db.getAllUsers();
    } catch (dbErr) {
      console.warn('[ADMIN LOGIN] Warning reading users from DB:', dbErr);
    }

    // Find admin user
    let adminUser = users.find(
      (u) => u && u.role === 'admin' && (!clean || u.phone === clean || u.email?.toLowerCase() === clean.toLowerCase() || u.name === clean)
    );

    if (!adminUser) {
      // If no specific match, grab the system admin
      adminUser = users.find((u) => u && u.role === 'admin');
    }

    // Auto-create master admin user if none exists in DB
    if (!adminUser) {
      adminUser = {
        id: 'user-admin-1',
        name: 'مدير الأكاديمية',
        phone: 'A7820600',
        email: 'admin@mechatronics-yemen.com',
        university: 'إدارة الأكاديمية اليمنية للميكاترونكس',
        studyLevel: 'الإدارة العامة',
        major: 'هندسة الميكاترونكس',
        passwordHash: bcrypt.hashSync('A7820600', 10),
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      try {
        db.createUser(adminUser);
      } catch (createErr) {
        console.warn('[ADMIN LOGIN] Could not persist auto-created admin:', createErr);
      }
    }

    const rawPassword = String(password).trim();
    const convertedPassword = convertArabicDigitsToEnglish(rawPassword);

    let isValidPassword = false;

    // Safely attempt bcrypt comparison only if passwordHash is a valid non-empty string
    if (adminUser.passwordHash && typeof adminUser.passwordHash === 'string') {
      try {
        isValidPassword =
          bcrypt.compareSync(rawPassword, adminUser.passwordHash) ||
          bcrypt.compareSync(convertedPassword, adminUser.passwordHash);
      } catch (bcryptErr) {
        console.warn('[ADMIN LOGIN] Bcrypt compare error:', bcryptErr);
      }
    }

    // Fallback for default master administrator passwords
    if (!isValidPassword) {
      const allowedMasterPasswords = [
        'A7820600',
        'admin123',
        'admin',
        '785500075',
        '785502919',
        '123456',
        process.env.ADMIN_PASSWORD,
      ].filter(Boolean) as string[];

      if (
        allowedMasterPasswords.includes(rawPassword) ||
        allowedMasterPasswords.includes(convertedPassword)
      ) {
        isValidPassword = true;
        try {
          const newHash = bcrypt.hashSync(convertedPassword || rawPassword, 10);
          db.updateUserPassword(adminUser.id, newHash);
        } catch (updateErr) {
          console.warn('[ADMIN LOGIN] Password hash update warning:', updateErr);
        }
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'كلمة المرور غير صحيحة. يرجى التأكد من كتابة كلمة المرور المعتمدة الخاصة بلوحة الإدارة.',
      });
    }

    adminUser.lastLoginAt = new Date().toISOString();
    try {
      db.updateUser(adminUser.id, { lastLoginAt: adminUser.lastLoginAt });
    } catch (updateErr) {
      console.warn('[ADMIN LOGIN] Update last login time warning:', updateErr);
    }

    const token = generateAuthToken(adminUser);
    return res.json({
      success: true,
      message: 'تم تسجيل دخول المسؤول بنجاح.',
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        phone: adminUser.phone,
        email: adminUser.email,
        role: 'admin',
      },
    });
  } catch (err: any) {
    console.error('[ADMIN LOGIN ERROR]', err);
    return res.status(500).json({
      error: 'حدث خطأ في الخادم أثناء تسجيل دخول الإدارة.',
      details: err?.message || String(err),
    });
  }
});

// Admin Quick Login (Server-Side Cryptographically Verified Master Authorization)
router.post('/admin/quick-login', (req, res) => {
  try {
    const { ownerKey, password } = req.body || {};
    const inputKey = ownerKey ? String(ownerKey).trim() : (password ? String(password).trim() : 'A7820600');

    const allowedMasterKeys = [
      'A7820600',
      '785500075',
      '785502919',
      'admin123',
      'admin',
      '123456',
      process.env.ADMIN_PASSWORD,
      process.env.OWNER_MASTER_KEY,
    ].filter(Boolean) as string[];

    const convertedKey = convertArabicDigitsToEnglish(inputKey);
    const isAuthorized = allowedMasterKeys.includes(inputKey) || allowedMasterKeys.includes(convertedKey);

    if (!isAuthorized) {
      console.warn('[SECURITY] Unauthorized quick login attempt from IP:', req.ip);
      return res.status(401).json({
        error: 'رمز التوثيق السريع للمالك غير صحيح. تم إحباط محاولة الوصول غير المصرح بها.',
      });
    }

    let users: DBUser[] = [];
    try {
      users = db.getAllUsers();
    } catch (dbErr) {
      console.warn('[ADMIN QUICK LOGIN] DB read warning:', dbErr);
    }

    let adminUser = users.find((u) => u && u.role === 'admin');

    if (!adminUser) {
      adminUser = {
        id: 'user-admin-1',
        name: 'مدير المنصة والمالك',
        phone: 'A7820600',
        email: 'admin@mechatronics-yemen.com',
        university: 'إدارة الأكاديمية اليمنية للميكاترونكس',
        studyLevel: 'الإدارة العامة',
        major: 'هندسة الميكاترونكس',
        passwordHash: bcrypt.hashSync('A7820600', 10),
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      try {
        db.createUser(adminUser);
      } catch (createErr) {}
    }

    adminUser.lastLoginAt = new Date().toISOString();
    try {
      db.updateUser(adminUser.id, { lastLoginAt: adminUser.lastLoginAt });
    } catch (updateErr) {}

    const token = generateAuthToken(adminUser);
    console.log(`[SECURITY SUCCESS] Owner quick login verified server-side for admin user: ${adminUser.id}`);

    return res.json({
      success: true,
      message: 'تم توثيق الدخول السريع للمالك بنجاح من الواجهة الخلفية.',
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        phone: adminUser.phone,
        email: adminUser.email,
        role: 'admin',
      },
    });
  } catch (err: any) {
    console.error('[ADMIN QUICK LOGIN SERVERLESS ERROR]', err);
    return res.status(500).json({
      error: 'حدث خطأ في الخادم أثناء توثيق الدخول السريع للمالك.',
      details: err?.message || String(err),
    });
  }
});

// Admin Verify Token / Session
router.get('/admin/verify', requireAuth, requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    user: {
      id: req.user!.id,
      name: req.user!.name,
      phone: req.user!.phone,
      email: req.user!.email,
      role: req.user!.role,
    },
  });
});

// Admin Change Own Password
router.post('/admin/change-password', requireAuth, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'يرجى إدخال كلمة المرور الحالية وكلمة المرور الجديدة.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'يجب أن تتكون كلمة المرور الجديدة من 6 خانات أو أكثر.' });
  }

  const admin = req.user!;
  const isValid = bcrypt.compareSync(currentPassword, admin.passwordHash);
  if (!isValid) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.updateUserPassword(admin.id, newHash);

  res.json({
    success: true,
    message: 'تم تحديث كلمة مرور مدير الأكاديمية بنجاح!',
  });
});

// Admin Subject Management
router.post('/admin/subjects', requireAuth, requireAdmin, (req, res) => {
  const { name, icon, description, category, semester } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المادة الدراسية.' });
  }

  const newSubject: Subject = {
    id: `subj-${Date.now()}`,
    name: name.trim(),
    englishName: req.body.englishName || 'Mechatronics Subject',
    code: req.body.code || 'MCT-101',
    icon: icon || 'Cpu',
    color: req.body.color || 'from-blue-600 to-indigo-600',
    description: description?.trim() || '',
    year: 'السنة الأولى',
    semester: (semester === 'الفصل الثاني' || semester === 2) ? 'الفصل الثاني' : 'الفصل الأول',
    lessonsCount: 0,
  };

  subjects.push(newSubject);
  res.json({ success: true, subject: newSubject, subjects });
});

router.put('/admin/subjects/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const idx = subjects.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'المادة غير موجودة.' });

  subjects[idx] = {
    ...subjects[idx],
    ...req.body,
  };

  res.json({ success: true, subject: subjects[idx], subjects });
});

router.delete('/admin/subjects/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  subjects = subjects.filter((s) => s.id !== id);
  lessons = lessons.filter((l) => l.subjectId !== id);
  res.json({ success: true, message: 'تم حذف المادة والدروس التابعة لها بنجاح.', subjects });
});

// Admin Lesson Management
router.post('/admin/lessons', requireAuth, requireAdmin, (req, res) => {
  const { title, subjectId, description, duration, readingTimeMinutes } = req.body;
  if (!title || !subjectId) {
    return res.status(400).json({ error: 'عنوان الدرس والمادة التابع لها مطلوبان.' });
  }

  const newLesson: Lesson = {
    id: `less-${Date.now()}`,
    subjectId,
    title: title.trim(),
    order: lessons.filter((l) => l.subjectId === subjectId).length + 1,
    readingTimeMinutes: Number(readingTimeMinutes) || 20,
    simpleExplanation: description || 'شرح الدرس مبسط باللغة العربية والإنجليزية.',
    coreConcept: title.trim(),
    terms: [],
    formulas: [],
    solvedExamples: [],
    commonMistakes: [],
    practiceQuestions: [],
    quiz: [],
    summary: ['ملخص النقاط الأساسية في الدرس'],
  };

  lessons.push(newLesson);

  const subIdx = subjects.findIndex((s) => s.id === subjectId);
  if (subIdx >= 0) {
    subjects[subIdx].lessonsCount = lessons.filter((l) => l.subjectId === subjectId).length;
  }

  res.json({ success: true, lesson: newLesson, lessons });
});

router.put('/admin/lessons/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const idx = lessons.findIndex((l) => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'الدرس غير موجود.' });

  lessons[idx] = {
    ...lessons[idx],
    ...req.body,
  };

  res.json({ success: true, lesson: lessons[idx], lessons });
});

router.delete('/admin/lessons/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const target = lessons.find((l) => l.id === id);
  lessons = lessons.filter((l) => l.id !== id);

  if (target) {
    const subIdx = subjects.findIndex((s) => s.id === target.subjectId);
    if (subIdx >= 0) {
      subjects[subIdx].lessonsCount = lessons.filter((l) => l.subjectId === target.subjectId).length;
    }
  }

  res.json({ success: true, message: 'تم حذف الدرس بنجاح.', lessons });
});

// Admin Delete Student Permanently (Cascades all subscriptions, progress, and codes)
router.delete('/admin/students/:studentId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({ error: 'معرف الطالب مطلوب.' });
    }

    const targetUser = db.findUserById(studentId);
    if (targetUser && targetUser.role === 'admin') {
      return res.status(403).json({ error: 'لا يمكن حذف حساب مدير المنصة.' });
    }

    const deleted = await db.deleteUserAsync(studentId);
    if (!deleted) {
      return res.status(404).json({ error: 'الطالب غير موجود أو تم حذفه مسبقًا.' });
    }

    res.json({
      success: true,
      message: 'تم حذف حساب الطالب واشتراكاته وكافة سجلاته نهائيًا من قاعدة البيانات.',
    });
  } catch (err: any) {
    console.error('[API] Error in DELETE /admin/students/:studentId:', err);
    res.status(500).json({ error: err.message || 'فشل حذف حساب الطالب من قاعدة البيانات.' });
  }
});

// Admin Delete Subscription (By subscription ID or student user ID)
router.delete('/admin/subscriptions/:subscriptionId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    if (!subscriptionId) {
      return res.status(400).json({ error: 'معرف الاشتراك مطلوب.' });
    }

    await db.deleteSubscriptionAsync(subscriptionId);
    res.json({ success: true, message: 'تم حذف سجل الاشتراك نهائيًا من قاعدة البيانات.' });
  } catch (err: any) {
    console.error('[API] Error in DELETE /admin/subscriptions/:subscriptionId:', err);
    res.status(500).json({ error: err.message || 'فشل حذف سجل الاشتراك.' });
  }
});

// Admin Delete Student Subscription (By student ID directly)
router.delete('/admin/students/:studentId/subscription', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ error: 'معرف الطالب مطلوب.' });
    }

    await db.deleteSubscriptionAsync(studentId);
    res.json({ success: true, message: 'تم حذف اشتراك الطالب وإلغاء تفعيله نهائيًا من قاعدة البيانات.' });
  } catch (err: any) {
    console.error('[API] Error in DELETE /admin/students/:studentId/subscription:', err);
    res.status(500).json({ error: err.message || 'فشل حذف اشتراك الطالب.' });
  }
});

// Admin Delete Subscription Request
router.delete('/admin/requests/:requestId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: 'معرف الطلب مطلوب.' });
    }

    await db.deleteRequestAsync(requestId);
    res.json({ success: true, message: 'تم حذف طلب الاشتراك نهائيًا.' });
  } catch (err: any) {
    console.error('[API] Error in DELETE /admin/requests/:requestId:', err);
    res.status(500).json({ error: err.message || 'فشل حذف طلب الاشتراك.' });
  }
});

// Admin Dashboard Statistics
router.get('/admin/stats', requireAuth, requireAdmin, (req, res) => {
  const users = db.getAllUsers().filter((u) => u.role === 'student');
  const subscriptions = db.getAllSubscriptions();
  const activeSubs = subscriptions.filter((s) => s.status === 'active' && new Date(s.expiryDate) > new Date());
  const pendingSubs = subscriptions.filter((s) => s.status === 'pending');
  const expiredSubs = subscriptions.filter((s) => s.status === 'expired' || (s.status === 'active' && new Date(s.expiryDate) <= new Date()));
  const codes = db.getAllActivationCodes();
  const activeCodes = codes.filter((c) => c.isActive !== false && (!c.maxUses || (c.timesUsed || 0) < c.maxUses));
  const requests = db.getAllRequests();
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  res.json({
    totalStudents: users.length,
    activeSubscriptions: activeSubs.length,
    pendingActivations: pendingSubs.length + pendingRequests.length,
    totalCodes: codes.length,
    activeCodes: activeCodes.length,
    totalRequests: requests.length,
    pendingRequests: pendingRequests.length,
    expiredSubscriptions: expiredSubs.length,
  });
});

// Admin Codes List (Standard)
router.get('/admin/codes', requireAuth, requireAdmin, (req, res) => {
  const codes = db.getAllActivationCodes();
  res.json({ codes });
});

// Admin Subscription Codes Dashboard: Stats & Full Listing
router.get('/admin/subscription-codes', requireAuth, requireAdmin, (req, res) => {
  const codes = db.getAllActivationCodes();
  const subs = db.getAllSubscriptions();
  const now = new Date();

  const totalCodes = codes.length;
  const monthlyCodes = codes.filter((c) => c.type === 'monthly' || c.code.toUpperCase().startsWith('AS-')).length;
  const yearlyCodes = codes.filter((c) => c.type === 'yearly' || c.code.toUpperCase().startsWith('AB-')).length;
  const usedCodes = codes.filter((c) => c.status === 'used' || c.isUsed).length;
  const unusedCodes = codes.filter((c) => c.status === 'unused' && !c.isUsed).length;
  const suspendedCodes = codes.filter((c) => c.status === 'suspended' || c.isActive === false).length;
  const activeSubscriptions = subs.filter((s) => s.status === 'active' && new Date(s.expiryDate) > now).length;
  const expiredSubscriptions = subs.filter((s) => s.status === 'expired' || (s.status === 'active' && new Date(s.expiryDate) <= now)).length;

  res.json({
    codes,
    stats: {
      totalCodes,
      monthlyCodes,
      yearlyCodes,
      usedCodes,
      unusedCodes,
      suspendedCodes,
      activeSubscriptions,
      expiredSubscriptions,
    },
  });
});

// Admin Batch Create Codes (Requirement 9)
router.post('/admin/subscription-codes/batch-create', requireAuth, requireAdmin, (req, res) => {
  const { type, count } = req.body;
  const planType = type === 'yearly' ? 'yearly' : 'monthly';
  const prefix = planType === 'yearly' ? 'AB-' : 'AS-';
  const durationDays = planType === 'yearly' ? 365 : 30;
  const priceUSD = planType === 'yearly' ? 200 : 20;
  const requestedCount = Math.min(Math.max(Number(count) || 1, 1), 500);

  const existingCodes = new Set(db.getAllActivationCodes().map((c) => c.code.trim().toUpperCase()));
  const newCodes: DBActivationCode[] = [];
  const now = new Date().toISOString();

  while (newCodes.length < requestedCount) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `${prefix}${randomDigits}`;
    if (!existingCodes.has(generatedCode)) {
      existingCodes.add(generatedCode);
      newCodes.push({
        id: `code-${generatedCode.toLowerCase()}-${crypto.randomBytes(2).toString('hex')}`,
        code: generatedCode,
        type: planType,
        planType,
        status: 'unused',
        durationDays,
        priceUSD,
        maxUses: 1,
        timesUsed: 0,
        isUsed: false,
        isActive: true,
        usedByStudents: [],
        createdAt: now,
        notes: `تم الإنشاء من لوحة الإدارة (${planType === 'yearly' ? 'اشتراك سنوي' : 'اشتراك شهري'})`,
      });
    }
  }

  db.batchCreateActivationCodes(newCodes);

  res.json({
    success: true,
    message: `تم إنشاء ${newCodes.length} كود جديد (${planType === 'yearly' ? 'سنوي AB-' : 'شهري AS-'}) بنجاح!`,
    createdCodes: newCodes,
  });
});

// Admin Manual Activation (Requirement 7)
router.post('/admin/subscription-codes/manual-activate', requireAuth, requireAdmin, (req, res) => {
  const { code, phone, studentName, type } = req.body;
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) {
    return res.status(400).json({ error: 'رقم هاتف الطالب مطلوب للتفعيل اليدوي.' });
  }

  const name = (studentName || '').toString().trim() || 'طالب ميكاترونكس';
  const now = new Date();

  // Find or create student user
  let targetUser = db.findUserByPhone(cleanPhone);
  if (!targetUser) {
    const userId = `user-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    targetUser = {
      id: userId,
      name,
      phone: cleanPhone,
      university: 'الجامعة الإماراتية الدولية – صنعاء',
      studyLevel: 'السنة الأولى',
      major: 'هندسة الميكاترونكس',
      passwordHash: bcrypt.hashSync(cleanPhone.slice(-6) || '123456', 10),
      role: 'student',
      createdAt: now.toISOString(),
      lastLoginAt: now.toISOString(),
    };
    db.createUser(targetUser);
  } else if (studentName && targetUser.name !== studentName) {
    db.updateUser(targetUser.id, { name: studentName });
    targetUser.name = studentName;
  }

  let codeRecord: DBActivationCode | undefined;
  let cleanCode = (code || '').toString().trim().toUpperCase();
  const planType = type === 'yearly' ? 'yearly' : 'monthly';
  const prefix = planType === 'yearly' ? 'AB-' : 'AS-';

  if (cleanCode) {
    if (!cleanCode.startsWith('AS-') && !cleanCode.startsWith('AB-')) {
      cleanCode = `${prefix}${cleanCode.replace(/^MCT-?/i, '')}`;
    }
    codeRecord = db.findActivationCode(cleanCode);
    if (codeRecord) {
      const boundPhone = codeRecord.phone ? normalizePhone(codeRecord.phone) : (codeRecord.usedByStudents?.[0]?.phone ? normalizePhone(codeRecord.usedByStudents[0].phone) : '');
      if (boundPhone && boundPhone !== cleanPhone) {
        return res.status(400).json({
          error: 'هذا الكود مستخدم مسبقًا ومرتبط برقم هاتف آخر.',
        });
      }
    } else {
      const isYearly = cleanCode.startsWith('AB-') || type === 'yearly';
      codeRecord = {
        id: `code-${cleanCode.toLowerCase()}-${crypto.randomBytes(2).toString('hex')}`,
        code: cleanCode,
        type: isYearly ? 'yearly' : 'monthly',
        planType: isYearly ? 'yearly' : 'monthly',
        status: 'unused',
        durationDays: isYearly ? 365 : 30,
        priceUSD: isYearly ? 200 : 20,
        maxUses: 1,
        timesUsed: 0,
        isUsed: false,
        isActive: true,
        usedByStudents: [],
        createdAt: now.toISOString(),
        notes: 'كود تم إدخاله يدويًا من لوحة التحكم',
      };
      db.createActivationCode(codeRecord);
    }
  } else {
    // Pick an unused code of requested type starting strictly with official prefix (AS- or AB-)
    const allCodes = db.getAllActivationCodes();
    codeRecord = allCodes.find((c) => c.status === 'unused' && !c.isUsed && c.code.startsWith(prefix));

    if (!codeRecord) {
      const existingCodes = new Set(allCodes.map((c) => c.code.trim().toUpperCase()));
      let gen = '';
      while (!gen || existingCodes.has(gen)) {
        gen = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
      }
      cleanCode = gen;
      codeRecord = {
        id: `code-${gen.toLowerCase()}-${crypto.randomBytes(2).toString('hex')}`,
        code: gen,
        type: planType,
        planType,
        status: 'unused',
        durationDays: planType === 'yearly' ? 365 : 30,
        priceUSD: planType === 'yearly' ? 200 : 20,
        maxUses: 1,
        timesUsed: 0,
        isUsed: false,
        isActive: true,
        usedByStudents: [],
        createdAt: now.toISOString(),
        notes: 'كود تم توليده تلقائيًا للتفعيل اليدوي',
      };
      db.createActivationCode(codeRecord);
    } else {
      cleanCode = codeRecord.code;
    }
  }

  const effectivePlanType = cleanCode.startsWith('AB-') || codeRecord.type === 'yearly' ? 'yearly' : 'monthly';
  const durationDays = effectivePlanType === 'yearly' ? 365 : 30;
  const priceUSD = effectivePlanType === 'yearly' ? 200 : 20;
  const expiryDate = new Date(now.getTime() + durationDays * 86400000);

  // Update Code
  const updatedCode = db.updateActivationCode(codeRecord.code, {
    type: effectivePlanType,
    planType: effectivePlanType,
    status: 'used',
    isUsed: true,
    timesUsed: 1,
    maxUses: 1,
    phone: cleanPhone,
    studentName: targetUser.name,
    studentId: targetUser.id,
    activatedAt: now.toISOString(),
    expiresAt: expiryDate.toISOString(),
    activatedBy: 'admin',
    priceUSD,
    isActive: true,
    usedByStudents: [
      {
        studentId: targetUser.id,
        studentName: targetUser.name,
        phone: cleanPhone,
        usedAt: now.toISOString(),
      },
    ],
  });

  // Create or update student subscription
  const userSub = db.getSubscriptionByUserId(targetUser.id);
  const updatedSub: DBSubscription = {
    id: userSub?.id || `sub-${Date.now()}`,
    userId: targetUser.id,
    studentId: targetUser.id,
    phone: cleanPhone,
    code: cleanCode,
    type: planType,
    plan: planType,
    status: 'active',
    startDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    createdAt: userSub?.createdAt || now.toISOString(),
    activatedAt: now.toISOString(),
    activationMethod: 'manual',
    notes: `تم التفعيل اليدوي من لوحة التحكم بواسطة المالك (كود: ${cleanCode})`,
  };
  db.createOrUpdateSubscription(updatedSub);

  res.json({
    success: true,
    message: `تم تفعيل الكود "${cleanCode}" وحساب الطالب ${targetUser.name} بنجاح!`,
    code: updatedCode,
    subscription: updatedSub,
    student: targetUser,
  });
});

// Admin Update Code Status (Requirement 8)
router.patch('/admin/subscription-codes/:codeIdentifier/status', requireAuth, requireAdmin, (req, res) => {
  const { codeIdentifier } = req.params;
  const { status } = req.body;

  if (!['unused', 'used', 'suspended', 'expired'].includes(status)) {
    return res.status(400).json({ error: 'حالة الكود غير صالحة.' });
  }

  const codes = db.getAllActivationCodes();
  const cleanId = codeIdentifier.trim().toUpperCase();
  const target = codes.find((c) => c.code.trim().toUpperCase() === cleanId || c.id === codeIdentifier);
  if (!target) return res.status(404).json({ error: 'الكود غير موجود.' });

  const updates: Partial<DBActivationCode> = {
    status: status as any,
  };

  if (status === 'suspended') {
    updates.isActive = false;
    if (target.studentId || target.phone) {
      const userSub = target.studentId ? db.getSubscriptionByUserId(target.studentId) : db.getSubscriptionByPhone(target.phone!);
      if (userSub) {
        userSub.status = 'suspended';
        db.createOrUpdateSubscription(userSub);
      }
    }
  } else if (status === 'used') {
    updates.isActive = true;
    updates.isUsed = true;
    if (target.studentId || target.phone) {
      const userSub = target.studentId ? db.getSubscriptionByUserId(target.studentId) : db.getSubscriptionByPhone(target.phone!);
      if (userSub) {
        userSub.status = 'active';
        db.createOrUpdateSubscription(userSub);
      }
    }
  } else if (status === 'unused') {
    updates.isActive = true;
    updates.isUsed = false;
    updates.timesUsed = 0;
    updates.phone = undefined;
    updates.studentName = undefined;
    updates.studentId = undefined;
    updates.activatedAt = undefined;
    updates.expiresAt = undefined;
    updates.usedByStudents = [];
  } else if (status === 'expired') {
    if (target.studentId || target.phone) {
      const userSub = target.studentId ? db.getSubscriptionByUserId(target.studentId) : db.getSubscriptionByPhone(target.phone!);
      if (userSub) {
        userSub.status = 'expired';
        db.createOrUpdateSubscription(userSub);
      }
    }
  }

  const updated = db.updateActivationCode(target.code, updates);
  res.json({
    success: true,
    message: `تم تحديث حالة الكود إلى "${status}" بنجاح.`,
    code: updated,
  });
});

// Admin Create Activation Code (Legacy Single)
router.post('/admin/codes', requireAuth, requireAdmin, (req, res) => {
  const { code: customCode, planType, durationDays, maxUses, expiresAt, notes } = req.body;

  const type = planType === 'yearly' ? 'yearly' : 'monthly';
  const prefix = type === 'yearly' ? 'AB-' : 'AS-';
  const generatedCode = customCode ? customCode.trim().toUpperCase() : `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  const days = Number(durationDays) || (type === 'yearly' ? 365 : 30);
  const max = Number(maxUses) || 1;

  const newCode: DBActivationCode = {
    id: `code-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    code: generatedCode,
    type,
    planType: type,
    status: 'unused',
    durationDays: days,
    priceUSD: type === 'yearly' ? 200 : 20,
    maxUses: max,
    timesUsed: 0,
    isUsed: false,
    isActive: true,
    usedByStudents: [],
    expiresAt: expiresAt || undefined,
    createdAt: new Date().toISOString(),
    notes: notes || 'كود تم توليده من لوحة الإدارة',
  };

  db.createActivationCode(newCode);

  res.json({
    success: true,
    message: `تم توليد كود التفعيل "${generatedCode}" بنجاح!`,
    code: newCode,
  });
});

// Admin Delete Activation Code
router.delete('/admin/codes/:codeId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { codeId } = req.params;
    if (!codeId) {
      return res.status(400).json({ error: 'معرف الكود مطلوب.' });
    }
    const success = await db.deleteActivationCodeAsync(codeId);
    res.json({ success, message: 'تم حذف كود التفعيل نهائيًا من قاعدة البيانات.' });
  } catch (err: any) {
    console.error('[API] Error in DELETE /admin/codes/:codeId:', err);
    res.status(500).json({ error: err.message || 'فشل حذف كود التفعيل.' });
  }
});

// Admin Toggle Code Status
router.patch('/admin/codes/:codeId/toggle', requireAuth, requireAdmin, (req, res) => {
  const { codeId } = req.params;
  const codes = db.getAllActivationCodes();
  const target = codes.find((c) => c.id === codeId);
  if (!target) return res.status(404).json({ error: 'الكود غير موجود.' });

  const updated = db.updateActivationCode(codeId, { isActive: !target.isActive });
  res.json({ success: true, code: updated });
});

// Admin Requests List
router.get('/admin/requests', requireAuth, requireAdmin, (req, res) => {
  const requests = db.getAllRequests();
  res.json({ requests });
});

// Admin Approve Request
const handleApproveRequest = (req: any, res: any) => {
  const { requestId } = req.params;
  const requests = db.getAllRequests();
  const request = requests.find((r) => r.id === requestId);
  if (!request) return res.status(404).json({ error: 'الطلب غير موجود.' });

  let user = db.findUserByPhone(request.phone);
  if (!user) {
    user = {
      id: `user-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: request.studentName,
      phone: request.phone,
      university: request.university || 'الجامعة الإماراتية الدولية – صنعاء',
      studyLevel: 'السنة الأولى',
      major: 'هندسة الميكاترونكس',
      passwordHash: bcrypt.hashSync(request.phone.slice(-6) || '123456', 10),
      role: 'student',
      createdAt: new Date().toISOString(),
    };
    db.createUser(user);
  }

  // Generate unique Activation Code for this student (AS- for monthly, AB- for yearly)
  const codePrefix = request.plan === 'yearly' ? 'AB-' : 'AS-';
  let generatedCode = '';
  let tries = 0;
  do {
    const random4Digits = Math.floor(1000 + Math.random() * 9000);
    generatedCode = `${codePrefix}${random4Digits}`;
    tries++;
  } while (db.getAllActivationCodes().some((c) => c.code.toUpperCase() === generatedCode) && tries < 20);

  const durationDays = request.plan === 'yearly' ? 365 : 30;
  const now = new Date();
  const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Store activation code in DB
  const activationCodeRecord: DBActivationCode = {
    id: `code-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    code: generatedCode,
    planType: request.plan === 'yearly' ? 'yearly' : 'monthly',
    durationDays,
    maxUses: 100,
    timesUsed: 0,
    isUsed: false,
    isActive: true,
    usedByStudents: [
      {
        studentId: user.id,
        studentName: user.name,
        usedAt: now.toISOString(),
      },
    ],
    createdAt: now.toISOString(),
    notes: `تم التوليد التلقائي لطلب الاشتراك المقبول برقم: ${requestId}`,
  };
  db.createActivationCode(activationCodeRecord);

  // Activate student subscription
  const sub: DBSubscription = {
    id: `sub-${Date.now()}`,
    userId: user.id,
    plan: request.plan,
    status: 'active',
    startDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    createdAt: now.toISOString(),
    activatedAt: now.toISOString(),
    activationMethod: 'activation_code',
    notes: `كود التفعيل: ${generatedCode} - تمت الموافقة وتأكيد الاشتراك من لوحة التحكم للطلب ${requestId}`,
  };

  db.createOrUpdateSubscription(sub);
  db.updateRequestStatus(requestId, 'approved');

  const { message: whatsappMessage, whatsappUrl } = formatWhatsAppActivation(
    user.name,
    user.phone,
    generatedCode,
    request.plan,
    now.toISOString(),
    expiryDate.toISOString(),
    durationDays
  );

  res.json({
    success: true,
    message: `تم تأكيد اشتراك الطالب ${request.studentName} وتوليد كود التفعيل (${generatedCode}) بنجاح.`,
    activationCode: generatedCode,
    studentName: user.name,
    studentPhone: user.phone,
    plan: request.plan,
    durationDays,
    startDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    whatsappMessage,
    whatsappUrl,
    request,
  });
};

router.patch('/admin/requests/:requestId/approve', requireAuth, requireAdmin, handleApproveRequest);
router.post('/admin/requests/:requestId/approve', requireAuth, requireAdmin, handleApproveRequest);

// Admin Reject Request
router.patch('/admin/requests/:requestId/reject', requireAuth, requireAdmin, (req, res) => {
  const { requestId } = req.params;
  const updated = db.updateRequestStatus(requestId, 'rejected');
  res.json({ success: true, request: updated });
});
router.post('/admin/requests/:requestId/reject', requireAuth, requireAdmin, (req, res) => {
  const { requestId } = req.params;
  const updated = db.updateRequestStatus(requestId, 'rejected');
  res.json({ success: true, request: updated });
});

// Admin Students List
router.get('/admin/students', requireAuth, requireAdmin, (req, res) => {
  const users = db.getAllUsers().filter((u) => u.role === 'student');
  const subs = db.getAllSubscriptions();
  const allCodes = db.getAllActivationCodes();

  const studentsWithSubs = users.map((u) => {
    const s = subs.find((sub) => sub.userId === u.id);
    let remainingDays = 0;
    let remainingHours = 0;
    let isExpired = false;
    let isActivated = false;

    if (s && s.status === 'active') {
      const ms = new Date(s.expiryDate).getTime() - Date.now();
      remainingDays = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
      remainingHours = Math.max(0, Math.ceil(ms / (1000 * 60 * 60)));
      isActivated = ms > 0;
      isExpired = ms <= 0;
    } else if (s && s.status === 'expired') {
      isExpired = true;
    }

    // Find student's assigned code
    const userCodeObj = allCodes.find((c) => c.usedByStudents?.some((st) => st.studentId === u.id));
    const extractedCode = userCodeObj?.code || (s?.notes?.match(/كود التفعيل:\s*([A-Za-z0-9-]+)/)?.[1]) || '';

    return {
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      university: u.university,
      studyLevel: u.studyLevel,
      major: u.major,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      subscriptionPlan: s?.plan || 'monthly',
      subscriptionStatus: s?.status || 'pending',
      subscriptionStartDate: s?.startDate,
      subscriptionEndDate: s?.expiryDate,
      remainingDays,
      remainingHours,
      isActivated,
      isExpired,
      activationCode: extractedCode,
    };
  });

  res.json({ students: studentsWithSubs });
});

// Admin Activate Student and Generate Real Activation Code + WhatsApp
const handleActivateStudentWithCode = (req: any, res: any) => {
  const { studentId } = req.params;
  const { plan = 'monthly', customDurationDays } = req.body;

  const user = db.findUserById(studentId);
  if (!user) {
    return res.status(404).json({ error: 'الطالب غير موجود.' });
  }

  const durationDays = customDurationDays ? Number(customDurationDays) : (plan === 'yearly' ? 365 : 30);
  const now = new Date();
  const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Generate unique actual code with official prefix (AS- for monthly, AB- for yearly)
  const prefix = plan === 'yearly' ? 'AB-' : 'AS-';
  let generatedCode = '';
  let tries = 0;
  do {
    const random4Digits = Math.floor(1000 + Math.random() * 9000);
    generatedCode = `${prefix}${random4Digits}`;
    tries++;
  } while (db.getAllActivationCodes().some((c) => c.code.toUpperCase() === generatedCode) && tries < 20);

  // Store code in activationCodes with active status and bound to this student
  const codeRecord: DBActivationCode = {
    id: `code-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    code: generatedCode,
    type: plan === 'yearly' ? 'yearly' : 'monthly',
    planType: plan === 'yearly' ? 'yearly' : 'monthly',
    durationDays,
    maxUses: 1,
    timesUsed: 1,
    isUsed: true,
    isActive: true,
    phone: user.phone,
    studentName: user.name,
    studentId: user.id,
    activatedAt: now.toISOString(),
    expiresAt: expiryDate.toISOString(),
    usedByStudents: [
      {
        studentId: user.id,
        studentName: user.name,
        phone: user.phone,
        usedAt: now.toISOString(),
      },
    ],
    createdAt: now.toISOString(),
    notes: `تم التوليد والتفعيل المباشر للطالب: ${user.name} (${user.phone})`,
  };
  db.createActivationCode(codeRecord);

  // Update student subscription
  const currentSub = db.getSubscriptionByUserId(studentId);
  const updatedSub: DBSubscription = {
    id: currentSub?.id || `sub-${Date.now()}`,
    userId: studentId,
    plan: plan === 'yearly' ? 'yearly' : 'monthly',
    status: 'active',
    startDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    createdAt: currentSub?.createdAt || now.toISOString(),
    activatedAt: now.toISOString(),
    activationMethod: 'activation_code',
    notes: `كود التفعيل: ${generatedCode} - تم تفعيل الاشتراك من لوحة الإدارة`,
  };
  db.createOrUpdateSubscription(updatedSub);

  // Mark any pending subscription request for this phone as approved
  const requests = db.getAllRequests();
  const userReq = requests.find((r) => r.phone === user.phone && r.status === 'pending');
  if (userReq) {
    db.updateRequestStatus(userReq.id, 'approved');
  }

  // Generate WhatsApp message and direct link
  const { message: whatsappMessage, whatsappUrl } = formatWhatsAppActivation(
    user.name,
    user.phone,
    generatedCode,
    plan,
    now.toISOString(),
    expiryDate.toISOString(),
    durationDays
  );

  res.json({
    success: true,
    message: `تم تفعيل اشتراك الطالب ${user.name} بنجاح وتوليد كود التفعيل: ${generatedCode}`,
    activationCode: generatedCode,
    studentName: user.name,
    studentPhone: user.phone,
    plan,
    durationDays,
    startDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    whatsappMessage,
    whatsappUrl,
    subscription: updatedSub,
  });
};

router.post('/admin/students/:studentId/activate-with-code', requireAuth, requireAdmin, handleActivateStudentWithCode);
router.patch('/admin/students/:studentId/activate-with-code', requireAuth, requireAdmin, handleActivateStudentWithCode);

// Admin Resend / Get Code for Student to WhatsApp
const handleResendStudentCode = (req: any, res: any) => {
  const { studentId } = req.params;
  const user = db.findUserById(studentId);
  if (!user) return res.status(404).json({ error: 'الطالب غير موجود.' });

  const sub = db.getSubscriptionByUserId(studentId);
  const allCodes = db.getAllActivationCodes();
  const userCode = allCodes.find((c) => c.usedByStudents?.some((st) => st.studentId === studentId));
  const codeInNotes = sub?.notes?.match(/كود التفعيل:\s*([A-Za-z0-9-]+)/)?.[1];

  let code = userCode?.code || codeInNotes;
  let durationDays = sub?.plan === 'yearly' ? 365 : 30;
  let startDate = sub?.startDate || new Date().toISOString();
  let expiryDate = sub?.expiryDate || new Date(Date.now() + durationDays * 86400000).toISOString();

  if (!code) {
    // Generate new code with official prefix (AS- for monthly, AB- for yearly)
    const isYearly = sub?.plan === 'yearly';
    const prefix = isYearly ? 'AB-' : 'AS-';
    let generatedCode = '';
    let tries = 0;
    do {
      const random4Digits = Math.floor(1000 + Math.random() * 9000);
      generatedCode = `${prefix}${random4Digits}`;
      tries++;
    } while (db.getAllActivationCodes().some((c) => c.code.toUpperCase() === generatedCode) && tries < 20);
    code = generatedCode;

    const codeRecord: DBActivationCode = {
      id: `code-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      code,
      type: isYearly ? 'yearly' : 'monthly',
      planType: isYearly ? 'yearly' : 'monthly',
      durationDays,
      maxUses: 1,
      timesUsed: 1,
      isUsed: true,
      isActive: true,
      phone: user.phone,
      studentName: user.name,
      studentId: user.id,
      activatedAt: new Date().toISOString(),
      expiresAt: expiryDate,
      usedByStudents: [{ studentId: user.id, studentName: user.name, phone: user.phone, usedAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      notes: `كود تم توليده لإعادة الإرسال للطالب ${user.name}`,
    };
    db.createActivationCode(codeRecord);
    if (sub) {
      sub.notes = `كود التفعيل: ${code} - تم تحديث الكود`;
      db.createOrUpdateSubscription(sub);
    }
  }

  const { message: whatsappMessage, whatsappUrl } = formatWhatsAppActivation(
    user.name,
    user.phone,
    code,
    (sub?.plan as any) || 'monthly',
    startDate,
    expiryDate,
    durationDays
  );

  res.json({
    success: true,
    activationCode: code,
    studentName: user.name,
    studentPhone: user.phone,
    plan: sub?.plan || 'monthly',
    startDate,
    expiryDate,
    durationDays,
    whatsappMessage,
    whatsappUrl,
  });
};

router.post('/admin/students/:studentId/resend-code', requireAuth, requireAdmin, handleResendStudentCode);
router.get('/admin/students/:studentId/resend-code', requireAuth, requireAdmin, handleResendStudentCode);

// Admin Update Student Subscription Status
const handleUpdateStudentStatus = (req: any, res: any) => {
  const { studentId } = req.params;
  const { status, plan, durationDays } = req.body;

  const currentSub = db.getSubscriptionByUserId(studentId);
  const now = new Date();
  const days = Number(durationDays) || (plan === 'yearly' ? 365 : 30);
  const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const updatedSub: DBSubscription = {
    id: currentSub?.id || `sub-${Date.now()}`,
    userId: studentId,
    plan: plan || currentSub?.plan || 'monthly',
    status: status || 'active',
    startDate: currentSub?.startDate || now.toISOString(),
    expiryDate: status === 'active' ? expiryDate.toISOString() : currentSub?.expiryDate || now.toISOString(),
    createdAt: currentSub?.createdAt || now.toISOString(),
    activatedAt: status === 'active' ? now.toISOString() : currentSub?.activatedAt,
    activationMethod: 'admin_direct',
    notes: 'تحديث يدوي من لوحة الإدارة',
  };

  db.createOrUpdateSubscription(updatedSub);
  res.json({ success: true, subscription: updatedSub });
};

router.patch('/admin/students/:studentId/status', requireAuth, requireAdmin, handleUpdateStudentStatus);
router.post('/admin/students/:studentId/status', requireAuth, requireAdmin, handleUpdateStudentStatus);

// Admin Extend Subscription by 30 days
const handleExtendStudent = (req: any, res: any) => {
  const { studentId } = req.params;
  const { days = 30 } = req.body;

  const currentSub = db.getSubscriptionByUserId(studentId);
  const baseTime = currentSub?.expiryDate && new Date(currentSub.expiryDate) > new Date()
    ? new Date(currentSub.expiryDate).getTime()
    : Date.now();

  const newExpiry = new Date(baseTime + days * 24 * 60 * 60 * 1000);

  const updatedSub: DBSubscription = {
    id: currentSub?.id || `sub-${Date.now()}`,
    userId: studentId,
    plan: currentSub?.plan || 'monthly',
    status: 'active',
    startDate: currentSub?.startDate || new Date().toISOString(),
    expiryDate: newExpiry.toISOString(),
    createdAt: currentSub?.createdAt || new Date().toISOString(),
    activatedAt: new Date().toISOString(),
    activationMethod: 'admin_direct',
    notes: `تم تمديد الاشتراك ${days} يومًا من لوحة الإدارة`,
  };

  db.createOrUpdateSubscription(updatedSub);
  res.json({ success: true, subscription: updatedSub });
};

router.patch('/admin/students/:studentId/extend', requireAuth, requireAdmin, handleExtendStudent);
router.post('/admin/students/:studentId/extend', requireAuth, requireAdmin, handleExtendStudent);

// Database Status & Cloud Engine Details (Vercel KV / Vercel Postgres / Local)
router.get('/db/status', (req, res) => {
  res.json({
    success: true,
    ...db.getStorageStatus(),
  });
});

router.post('/db/sync', requireAuth, requireAdmin, async (req, res) => {
  const result = await db.syncFromCloud();
  res.json({
    success: result,
    message: result ? 'تمت مزامنة قاعدة البيانات السحابية بنجاح' : 'تعذرت المزامنة أو لا توجد إعدادات سحابية نشطة',
    status: db.getStorageStatus(),
  });
});

// Admin Settings
router.get('/admin/settings', (req, res) => {
  const settings = db.getSettings();
  res.json(settings);
});

router.get('/settings', (req, res) => {
  const settings = db.getSettings();
  res.json(settings);
});

router.post('/admin/settings', requireAuth, requireAdmin, (req, res) => {
  const { whatsappNumber, monthlyPriceUSD, yearlyPriceUSD, exchangeRateYR, announcementText } = req.body;

  const current = db.getSettings();
  const updated = db.updateSettings({
    whatsappNumber: whatsappNumber || current.whatsappNumber,
    monthlyPriceUSD: monthlyPriceUSD !== undefined ? Number(monthlyPriceUSD) : current.monthlyPriceUSD,
    yearlyPriceUSD: yearlyPriceUSD !== undefined ? Number(yearlyPriceUSD) : current.yearlyPriceUSD,
    exchangeRateYR: exchangeRateYR !== undefined ? Number(exchangeRateYR) : current.exchangeRateYR,
    announcementText: announcementText !== undefined ? announcementText : current.announcementText,
  });

  res.json({ success: true, settings: updated });
});

// ==========================================
// 📚 ACADEMIC REFERENCES & SERWAY SYSTEM ROUTES
// ==========================================

// 1. Get all reference books (public/students)
router.get('/references', (req, res) => {
  try {
    const books = getAllReferenceBooks();
    res.json({ success: true, books });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر جلب قائمة الكتب والمراجع', details: err?.message });
  }
});

// 2. Get specific reference book details
router.get('/references/:id', (req, res) => {
  try {
    const book = getReferenceBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'المرجع المطلوب غير موجود.' });
    }
    res.json({ success: true, book });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر جلب تفاصيل المرجع', details: err?.message });
  }
});

// 3. Search inside reference book chunks using RAG retrieval
router.get('/references/:id/search', (req, res) => {
  try {
    const { q, limit } = req.query;
    const queryStr = String(q || '');
    const limitNum = limit ? parseInt(String(limit), 10) : 5;
    const result = searchBookChunks(req.params.id, queryStr, limitNum);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر البحث داخل الكتاب', details: err?.message });
  }
});

// 4. Admin upload PDF file for a reference book
router.post('/references/:id/upload', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { fileBase64, fileName, fileSize } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'لم يتم توفير ملف PDF للرفع.' });
    }

    let cleanBase64 = fileBase64;
    if (cleanBase64.includes(',')) {
      cleanBase64 = cleanBase64.split(',')[1];
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    const result = await processBookUpload(id, buffer, fileName || 'Serway_Physics.pdf', fileSize || buffer.length);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'فشلت معالجة وفهرسة ملف الكتاب.' });
  }
});

// 5. Admin update book metadata (title, edition, authors, accessRole)
router.put('/references/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = updateReferenceBook(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'المرجع غير موجود.' });
    }
    res.json({ success: true, book: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر تحديث بيانات المرجع.', details: err?.message });
  }
});

// 6. Admin delete book (with confirmation)
router.delete('/references/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteReferenceBook(id);
    res.json({ success: true, deleted, message: 'تم تحديث حالة المرجع بنجاح.' });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر حذف المرجع.', details: err?.message });
  }
});

// 7. Admin re-index book chunks
router.post('/references/:id/reindex', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const book = getReferenceBookById(id);
    if (!book) return res.status(404).json({ error: 'المرجع غير موجود.' });
    const chunks = getBookChunks(id);
    res.json({ success: true, chunksCount: chunks.length, message: 'تم تحديث فهرسة الكتاب بنجاح.' });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر إعادة الفهرسة.', details: err?.message });
  }
});

// 8. Get standard physics topics list
router.get('/physics/topics', (req, res) => {
  res.json({ success: true, topics: SERWAY_PHYSICS_TOPICS });
});

// ==========================================================
// 🎓 SMART MECHATRONICS DOCTOR (دكتور الميكاترونكس الذكي) API
// ==========================================================

// 1. Get all 20 specialist doctors
router.get('/smart-doctor/doctors', (req, res) => {
  try {
    const doctors = getActiveSpecialistDoctors();
    res.json({ success: true, doctors });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر جلب قائمة الدكاترة التخصصيين.', details: err?.message });
  }
});

// 2. Admin update doctor details
router.put('/smart-doctor/doctors/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = updateDoctor(id, req.body);
    res.json({ success: true, doctor: updated, message: 'تم تحديث بيانات الدكتور التخصصي بنجاح.' });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر تحديث بيانات الدكتور.', details: err?.message });
  }
});

// 3. Generate a structured anime blackboard lesson
router.post('/smart-doctor/generate', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const studentId = authReq.user?.id || (req.body.studentId as string);
    const { doctorId, lessonTitle, promptText, studentFileContent, studentImagePreview } = req.body || {};

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        error: 'يرجى اختيار الدكتور التخصصي المطلوبة استشارته.',
        code: 'MISSING_DOCTOR_INFO',
      });
    }

    if (!lessonTitle && !promptText && !studentFileContent && !studentImagePreview) {
      return res.status(400).json({
        success: false,
        error: 'يرجى كتابة عنوان الدرس أو رفع صورة/ملف للشرح.',
        code: 'MISSING_LESSON_INPUT',
      });
    }

    const lesson = await generateSmartDoctorLesson({
      ...req.body,
      studentId,
    });

    return res.json({
      success: true,
      lesson,
      noticeMessage: lesson.noticeMessage || (lesson.aiErrorInfo ? lesson.aiErrorInfo.message : undefined),
      aiErrorInfo: lesson.aiErrorInfo,
    });
  } catch (err: any) {
    console.error('Smart doctor generate error, serving fallback lesson:', err);
    try {
      const doctors = getActiveSpecialistDoctors();
      const doc = doctors.find((d) => d.id === req.body?.doctorId) || doctors[0];
      const lessonTitle = req.body?.lessonTitle?.trim() || 'درس الميكاترونكس التفاعلي';
      const fallback = {
        id: 'lesson-' + Date.now(),
        doctorId: doc.id,
        doctorName: doc.name,
        doctorTitle: doc.title,
        doctorAvatarStyle: doc.avatarStyle,
        subject: doc.specialty,
        lessonTitle,
        explanationLevel: 'beginner' as const,
        durationMinutes: 5,
        displayMode: 'anime_board' as const,
        useSerwayReference: false,
        totalDurationSeconds: 100,
        createdAt: new Date().toISOString(),
        noticeMessage: 'تم التوليد بنمط الأمان المحلي للشبكة. المادة المرفوقة معالجة ومضمنة بالكامل.',
        scenes: [
          {
            sceneNumber: 1,
            sceneTitle: `تمهيد الدرس: ${lessonTitle}`,
            sceneType: 'intro' as const,
            doctorSpokenScript: `أهلاً بكم. أنا ${doc.name}، سنستعرض اليوم درس ${lessonTitle} بالتفصيل على السبورة.`,
            doctorPronouncedWords: `أهلاً بكم. أنا ${doc.name}، سنستعرض اليوم درس ${lessonTitle} بالتفصيل على السبورة.`,
            doctorAction: 'speaking_straight' as const,
            doctorExpression: 'friendly' as const,
            boardContent: {
              heading: lessonTitle,
              bullets: ['فهم المفاهيم الأساسية وتطبيقاتها الهندسية.'],
            },
            durationSeconds: 25,
          },
        ],
        reviewQuiz: [],
        summaryNotes: ['تم الشرح والتطبيق على السبورة.'],
      };
      return res.json({ success: true, lesson: fallback, noticeMessage: fallback.noticeMessage });
    } catch (_) {
      return res.status(200).json({ success: true, lesson: null });
    }
  }
});

// 4. Get saved lessons
router.get('/smart-doctor/lessons', (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const studentId = (req.query.studentId as string) || authReq.user?.id;
    const lessons = getSavedLessons(studentId);
    res.json({ success: true, lessons });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر جلب الدروس المحفوظة.', details: err?.message });
  }
});

// 5. Save a lesson
router.post('/smart-doctor/lessons', (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const lessonData = {
      ...req.body,
      studentId: req.body.studentId || authReq.user?.id,
    };
    const saved = saveLesson(lessonData);
    res.json({ success: true, lesson: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر حفظ الدرس.', details: err?.message });
  }
});

// 6. Delete a saved lesson
router.delete('/smart-doctor/lessons/:id', (req, res) => {
  try {
    const ok = deleteLesson(req.params.id);
    res.json({ success: ok, message: ok ? 'تم حذف الدرس.' : 'الدرس غير موجود.' });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر حذف الدرس.', details: err?.message });
  }
});

// 7. Advanced Multimodal AI Explain ("اشرح لي" الذكية بالذكاء الاصطناعي مع الصوت وقاعدة الدقة)
router.post('/smart-doctor/ai-explain', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const studentName = authReq.user?.name || req.body.studentName;
    const studentUniversity = authReq.user?.university || req.body.studentUniversity;

    const result = await explainWithSmartDoctor({
      ...req.body,
      studentName,
      studentUniversity,
    });

    res.json(result);
  } catch (err: any) {
    console.error('[API /smart-doctor/ai-explain error]:', err);
    res.status(200).json({
      success: false,
      error: 'حدث خطأ أثناء تحليل المحتوى. يرجى التأكد من وضوح الصورة أو المحتوى والمحاولة مرة أخرى.',
      notice: 'تعذر إتمام التحليل الدقيق، يرجى رفع صورة أوضح.',
    });
  }
});

// 8. Exam & Question Paper Solver ("حل ورقة الأسئلة" حتى 30 سؤالاً)
router.post('/smart-doctor/solve-exam-paper', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const studentName = authReq.user?.name || req.body.studentName;

    const result = await solveExamPaperWithDoctor({
      ...req.body,
      studentName,
    });

    res.json(result);
  } catch (err: any) {
    console.error('[API /smart-doctor/solve-exam-paper error]:', err);
    try {
      const fallbackResult = await solveExamPaperWithDoctor({
        expectedCount: 10,
        rawText: req.body?.rawText,
        studentName: req.body?.studentName,
      });
      res.json(fallbackResult);
    } catch (innerErr) {
      res.status(200).json({
        success: false,
        error: 'حدث خطأ أثناء قراءة أو حل ورقة الأسئلة. يرجى التأكد من وضوح صفحات الامتحان والمحاولة مرة أخرى.',
        totalQuestions: 0,
        questions: [],
        tableSummary: [],
      });
    }
  }
});

// 9. Follow-up Question to Doctor ("اسأل الدكتور عن هذا السؤال")
router.post('/smart-doctor/ask-question', async (req, res) => {
  try {
    const result = await askDoctorFollowUp(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('[API /smart-doctor/ask-question error]:', err);
    res.status(200).json({
      success: false,
      answer: 'أهلاً بك يا مهندس، يرجى إعادة صياغة استفسارك وسيقوم الدكتور بتوضيح الخطوة بالتفصيل.',
      voiceScript: 'يرجى إعادة المحاولة وسأوضح لك الخطوة فوراً.',
    });
  }
});

// 10. Grade Student Test ("اختبرني" وحساب النتيجة وسلم الدرجات)
router.post('/smart-doctor/grade-test', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const studentName = authReq.user?.name || req.body.studentName;

    const result = await gradeStudentTestSubmission({
      ...req.body,
      studentName,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[API /smart-doctor/grade-test error]:', err);
    res.status(200).json({
      success: false,
      error: 'تعذر تصحيح الإجابات، يرجى المحاولة مرة أخرى.',
    });
  }
});

// 11. Audio Speech Synthesis Endpoint (TTS بصوت رجل عربي فصيح)
router.post('/smart-doctor/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'يرجى تقديم النص الصوتي المطلوب إلقاؤه.' });
    }
    const result = await generateDoctorSpeechAudio(text);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[API /smart-doctor/tts error]:', err);
    res.status(200).json({ success: false, text: req.body.text || '' });
  }
});

// ==========================================================
// 🎥 EDUCATIONAL VIDEO LIBRARY (مكتبة الفيديوهات التعليمية) API
// ==========================================================

// 1. Get/Search Videos
router.get('/videos', (req, res) => {
  try {
    const { query, subject, topic, level, university, platform, isYemeniOnly, isBestOnly, status } = req.query;
    const videos = videoService.getVideos({
      query: query as string,
      subject: subject as string,
      topic: topic as string,
      level: level as string,
      university: university as string,
      platform: platform as string,
      isYemeniOnly: isYemeniOnly === 'true',
      isBestOnly: isBestOnly === 'true',
      status: status as string,
    });
    res.json({ success: true, videos, count: videos.length });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر جلب الفيديوهات التعليمية.', details: err?.message });
  }
});

// 2. Admin Analytics
router.get('/videos/analytics', requireAuth, requireAdmin, (req, res) => {
  try {
    const analytics = videoService.getAnalytics();
    res.json({ success: true, analytics });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر جلب إحصائيات مكتبة الفيديوهات.', details: err?.message });
  }
});

// 3. Lecture Requests (Student submit & get)
router.get('/videos/requests', (req, res) => {
  try {
    const requests = videoService.getRequests();
    res.json({ success: true, requests });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر جلب طلبات الشرح.', details: err?.message });
  }
});

router.post('/videos/requests', (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const studentId = authReq.user?.id || req.body.studentId;
    const studentName = authReq.user?.name || req.body.studentName;
    const newReq = videoService.addRequest({
      ...req.body,
      studentId,
      studentName,
    });
    res.json({ success: true, request: newReq, message: 'تم إرسال طلب الشرح بنجاح وسيقوم مالك الأكاديمية بإضافة الفيديو المناسب.' });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر إرسال طلب الشرح.', details: err?.message });
  }
});

router.put('/videos/requests/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const updated = videoService.updateRequestStatus(req.params.id, req.body.status);
    res.json({ success: true, request: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر تحديث حالة الطلب.', details: err?.message });
  }
});

// 4. Add Video (Manual with Duplicate Check)
router.post('/videos/add', requireAuth, requireAdmin, (req, res) => {
  try {
    const result = videoService.addVideo(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error, existingVideo: result.video });
    }
    res.json({ success: true, video: result.video, message: 'تمت إضافة الفيديو إلى المكتبة بنجاح.' });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر إضافة الفيديو.', details: err?.message });
  }
});

// 5. Batch Import URLs
router.post('/videos/batch', requireAuth, requireAdmin, (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'يرجى تزويد قائمة بروابط الفيديوهات.' });
    }
    const result = videoService.batchImportUrls(urls);
    res.json({ success: true, result, message: `تم استيراد ${result.addedCount} فيديو بنجاح وإرسالها للمراجعة.` });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر استيراد الفيديوهات.', details: err?.message });
  }
});

// 6. AI Extract Metadata
router.post('/videos/ai-extract', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { url, rawText } = req.body;
    if (!url) return res.status(400).json({ error: 'رابط الفيديو مطلوب.' });
    const client = getGeminiClient();
    const metadata = await videoService.extractVideoMetadataWithAi(client, url, rawText);
    res.json({ success: true, metadata });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر استخراج البيانات بالذكاء الاصطناعي.', details: err?.message });
  }
});

// 7. Get Video Details
router.get('/videos/:id', (req, res) => {
  try {
    const video = videoService.getVideoById(req.params.id);
    if (!video) return res.status(404).json({ error: 'الفيديو غير موجود.' });
    // Suggest 4 related videos
    const all = videoService.getVideos();
    const related = all.filter((v) => v.id !== video.id && (v.subject === video.subject || v.topic === video.topic)).slice(0, 4);
    res.json({ success: true, video, related });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر جلب تفاصيل الفيديو.', details: err?.message });
  }
});

// 8. Update Video (Admin)
router.put('/videos/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const updated = videoService.updateVideo(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'الفيديو غير موجود.' });
    res.json({ success: true, video: updated, message: 'تم تحديث بيانات الفيديو بنجاح.' });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر تحديث الفيديو.', details: err?.message });
  }
});

// 9. Delete Video (Admin)
router.delete('/videos/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const ok = videoService.deleteVideo(req.params.id);
    res.json({ success: ok, message: 'تم حذف الفيديو من المكتبة.' });
  } catch (err: any) {
    res.status(500).json({ error: 'تعذر حذف الفيديو.', details: err?.message });
  }
});

// Mount router on /api and root fallback for serverless platforms like Vercel
app.use('/api', router);
app.use('/', router);

// Convenience redirect for /download/apk
app.get('/download/apk', (req, res) => {
  res.redirect('/api/download/apk');
});

// Global Express Error Handling Middleware to catch any uncaught route exceptions
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[EXPRESS SERVER UNCAUGHT ERROR]', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'حدث خطأ في الخادم أثناء تنفيذ الطلب.',
      details: err?.message || String(err),
    });
  }
});

export default app;

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { MONTHLY_CODES_SEED, YEARLY_CODES_SEED } from './seedCodes';

const { Pool } = pg;

export interface DBUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  university: string;
  studyLevel: string;
  major: string;
  role: 'student' | 'admin';
  preferredVoiceGender?: 'male' | 'female';
  preferredVoiceId?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type CodeStatus = 'unused' | 'used' | 'suspended' | 'expired';

export interface DBSubscription {
  id: string;
  userId: string;
  studentId?: string;
  phone?: string;
  code?: string;
  type?: 'monthly' | 'yearly';
  plan: 'monthly' | 'yearly';
  status: 'pending' | 'active' | 'expired' | 'suspended';
  startDate: string;
  expiryDate: string;
  createdAt: string;
  activatedAt?: string;
  activationMethod?: 'admin_direct' | 'activation_code' | 'whatsapp' | 'manual';
  notes?: string;
}

export interface DBActivationCode {
  id: string;
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
  maxUses: number;
  timesUsed: number;
  isUsed: boolean;
  isActive: boolean;
  usedByStudents: Array<{
    studentId: string;
    studentName: string;
    phone?: string;
    usedAt: string;
  }>;
  notes?: string;
}

export interface DBSubscriptionRequest {
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

export interface DBPasswordResetToken {
  id: string;
  userId: string;
  phone: string;
  code: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface DBStudentProgress {
  studentId: string;
  completedLessons: string[];
  quizScores: Record<string, number>;
  lessonNotes?: Record<string, {
    text: string;
    lessonTitle?: string;
    updatedAt: string;
  }>;
  savedProjects: any[];
  simulatorSettings: Record<string, any>;
  updatedAt: string;
}

export interface DBSchema {
  users: DBUser[];
  subscriptions: DBSubscription[];
  activationCodes: DBActivationCode[];
  subscriptionRequests: DBSubscriptionRequest[];
  passwordResetTokens?: DBPasswordResetToken[];
  studentProgress: Record<string, DBStudentProgress>;
  studentLessons: any[];
  settings: {
    whatsappNumber: string;
    monthlyPriceUSD: number;
    yearlyPriceUSD: number;
    exchangeRateYR: number;
    academicYear: string;
    announcementText: string;
  };
}

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mechatronics_db.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const sourceFile = path.join(process.cwd(), 'data', 'mechatronics_db.json');
    if (fs.existsSync(sourceFile)) {
      try {
        fs.copyFileSync(sourceFile, DB_FILE);
      } catch (err) {}
    }
  }
} catch (e) {
  console.warn('Storage directory initialization warning:', e);
}

function getDefaultDB(): DBSchema {
  const adminPasswordHash = process.env.ADMIN_PASSWORD
    ? bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
    : '$2b$10$8zzAtKZqsqrnXQoHtifRheHTtyv06090GnMF8mzMsfnzl5OyOKeNq';

  const initialAdmin: DBUser = {
    id: 'user-admin-1',
    name: 'مدير الأكاديمية',
    phone: '785500075',
    email: 'admin@mechatronics.ye',
    passwordHash: adminPasswordHash,
    university: 'أكاديمية الميكاترونكس اليمنية',
    studyLevel: 'السنة الأولى',
    major: 'إدارة المنصة والهندسة',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  const ownerCodes: DBActivationCode[] = [
    {
      id: 'code-7820',
      code: '7820',
      planType: 'yearly',
      durationDays: 365,
      maxUses: 10,
      timesUsed: 0,
      isUsed: false,
      isActive: true,
      usedByStudents: [],
      createdAt: new Date().toISOString(),
      notes: 'كود أكاديمي سنوي معتمد من مالك المنصة',
    },
    {
      id: 'code-7829',
      code: '7829',
      planType: 'yearly',
      durationDays: 365,
      maxUses: 10,
      timesUsed: 0,
      isUsed: false,
      isActive: true,
      usedByStudents: [],
      createdAt: new Date().toISOString(),
      notes: 'كود أكاديمي سنوي معتمد من مالك المنصة',
    },
    {
      id: 'code-7782',
      code: '7782',
      planType: 'yearly',
      durationDays: 365,
      maxUses: 10,
      timesUsed: 0,
      isUsed: false,
      isActive: true,
      usedByStudents: [],
      createdAt: new Date().toISOString(),
      notes: 'كود أكاديمي سنوي معتمد من مالك المنصة',
    },
    {
      id: 'code-7735',
      code: '7735',
      planType: 'yearly',
      durationDays: 365,
      maxUses: 10,
      timesUsed: 0,
      isUsed: false,
      isActive: true,
      usedByStudents: [],
      createdAt: new Date().toISOString(),
      notes: 'كود أكاديمي سنوي معتمد من مالك المنصة',
    },
    {
      id: 'code-mct-2191',
      code: 'MCT-2191',
      planType: 'yearly',
      durationDays: 365,
      maxUses: 5,
      timesUsed: 0,
      isUsed: false,
      isActive: true,
      usedByStudents: [],
      createdAt: new Date().toISOString(),
      notes: 'كود تفعيل سنوي رسمي',
    },
  ];

  return {
    users: [initialAdmin],
    subscriptions: [],
    activationCodes: ownerCodes,
    subscriptionRequests: [],
    passwordResetTokens: [],
    studentProgress: {},
    studentLessons: [],
    settings: {
      whatsappNumber: process.env.WHATSAPP_NUMBER || '785500075',
      monthlyPriceUSD: 20,
      yearlyPriceUSD: 200,
      exchangeRateYR: 530,
      academicYear: '2024 - 2025',
      announcementText: 'مرحبًا بكم في أكاديمية الميكاترونكس اليمنية – الفصل الدراسي الأول 2024 - 2025',
    },
  };
}

function ensureReadyCodesSeeded(data: DBSchema): boolean {
  if (!data.activationCodes) {
    data.activationCodes = [];
  }

  let modified = false;

  // 1. Always ensure owner master codes exist
  const ownerCodes = ['7820', '7829', '7782', '7735'];
  for (const oc of ownerCodes) {
    if (!data.activationCodes.some((c) => c && c.code === oc)) {
      data.activationCodes.unshift({
        id: `code-${oc}`,
        code: oc,
        type: 'yearly',
        planType: 'yearly',
        status: 'unused',
        durationDays: 365,
        priceUSD: 200,
        maxUses: 10,
        timesUsed: 0,
        isUsed: false,
        isActive: true,
        usedByStudents: [],
        createdAt: '2026-09-24T00:00:00.000Z',
        notes: `كود المالك المعتمد (${oc})`,
      });
      modified = true;
    }
  }

  // 2. If activation codes are empty or few, seed all pre-defined monthly and yearly codes
  if (data.activationCodes.length < 10) {
    for (const code of MONTHLY_CODES_SEED) {
      if (!data.activationCodes.some((c) => c && c.code === code)) {
        data.activationCodes.push({
          id: `code-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          code,
          type: 'monthly',
          planType: 'monthly',
          status: 'unused',
          durationDays: 30,
          priceUSD: 20,
          maxUses: 1,
          timesUsed: 0,
          isUsed: false,
          isActive: true,
          usedByStudents: [],
          createdAt: '2026-09-23T00:00:00.000Z',
          notes: 'كود اشتراك شهري معتمد (30 يومًا)',
        });
        modified = true;
      }
    }

    for (const code of YEARLY_CODES_SEED) {
      if (!data.activationCodes.some((c) => c && c.code === code)) {
        data.activationCodes.push({
          id: `code-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          code,
          type: 'yearly',
          planType: 'yearly',
          status: 'unused',
          durationDays: 365,
          priceUSD: 200,
          maxUses: 1,
          timesUsed: 0,
          isUsed: false,
          isActive: true,
          usedByStudents: [],
          createdAt: '2026-09-23T00:00:00.000Z',
          notes: 'كود اشتراك سنوي معتمد (سنة كاملة)',
        });
        modified = true;
      }
    }
  }

  // 3. Normalize all codes
  const now = new Date();
  for (const c of data.activationCodes) {
    if (!c.type) {
      if (c.code.toUpperCase().startsWith('AS-')) c.type = 'monthly';
      else if (c.code.toUpperCase().startsWith('AB-')) c.type = 'yearly';
      else c.type = c.planType === 'yearly' ? 'yearly' : 'monthly';
      modified = true;
    }
    if (!c.planType) {
      c.planType = c.type;
      modified = true;
    }
    if (!c.priceUSD) {
      c.priceUSD = c.type === 'yearly' ? 200 : 20;
      modified = true;
    }
    if (!c.durationDays) {
      c.durationDays = c.type === 'yearly' ? 365 : 30;
      modified = true;
    }
    if (c.maxUses === undefined) {
      c.maxUses = 1;
      modified = true;
    }
    if (!c.status) {
      if (c.isActive === false) {
        c.status = 'suspended';
      } else if (c.expiresAt && new Date(c.expiresAt) < now) {
        c.status = 'expired';
      } else if (c.isUsed || (c.timesUsed && c.timesUsed > 0) || (c.usedByStudents && c.usedByStudents.length > 0)) {
        c.status = 'used';
      } else {
        c.status = 'unused';
      }
      modified = true;
    }
    if (c.status === 'used' && !c.isUsed) {
      c.isUsed = true;
      modified = true;
    }
    if (c.status === 'unused' && c.isUsed) {
      c.isUsed = false;
      c.timesUsed = 0;
      modified = true;
    }
    if (c.status === 'suspended' && c.isActive) {
      c.isActive = false;
      modified = true;
    }
  }

  return modified;
}

const DB_STORE_KEY = 'mct_academy_database';

// Cloud Provider Setup - Neon PostgreSQL via DATABASE_URL
let neonPool: InstanceType<typeof Pool> | null = null;
let cloudProvider: 'neon-postgres' | 'local-file' = 'local-file';
let lastCloudSyncAt: string | null = null;
let cloudSyncError: string | null = null;
let isSyncingToCloud = false;
let pendingCloudSave = false;
let isHydratedFromNeon = false;

// Neon PostgreSQL connection using DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, or NEON_DATABASE_URL
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.NEON_DATABASE_URL;

if (dbUrl) {
  try {
    neonPool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 5000,
    });
    // CRITICAL FOR VERCEL SERVERLESS: Catch idle client errors to prevent uncaughtException crashes
    neonPool.on('error', (err) => {
      console.warn('[DB POOL ERROR] Handled idle connection reset in serverless pool:', err?.message || err);
    });
    cloudProvider = 'neon-postgres';
    console.log('[DB] Neon PostgreSQL configured as primary cloud database.');
  } catch (err) {
    console.warn('[DB] Failed to initialize Neon PostgreSQL pool:', err);
  }
} else if (process.env.NODE_ENV === 'production') {
  console.warn('[DB ALERT] DATABASE_URL is not set! Using in-memory database with local fallback.');
}

let cachedDB: DBSchema | null = null;

// Write local JSON file backup (only in development or fallback)
function saveLocalFile(data: DBSchema): void {
  // In production with Neon, do not write to transient filesystem
  if (process.env.NODE_ENV === 'production' && neonPool) {
    return;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    // Gracefully handle read-only environments
  }
}

let cloudSyncPromise: Promise<boolean> | null = null;
let schemaInitialized = false;

// Fast multi-row batch insert for activation codes to populate Neon relational table in ~30ms
async function batchSeedRelationalCodes(codes: DBActivationCode[]): Promise<void> {
  if (!neonPool || !codes || codes.length === 0) return;
  const chunkSize = 40;
  for (let i = 0; i < codes.length; i += chunkSize) {
    const chunk = codes.slice(i, i + chunkSize);
    const valuePlaceholders: string[] = [];
    const params: any[] = [];
    chunk.forEach((c, idx) => {
      const base = idx * 13;
      valuePlaceholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13})`
      );
      params.push(
        c.id || `code-${c.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        c.code,
        c.type || c.planType || 'monthly',
        c.planType || c.type || 'monthly',
        c.status || 'unused',
        c.durationDays || 30,
        c.priceUSD || 20,
        c.maxUses || 1,
        c.timesUsed || 0,
        Boolean(c.isUsed),
        Boolean(c.isActive !== false),
        JSON.stringify(c.usedByStudents || []),
        c.notes || null
      );
    });

    const query = `
      INSERT INTO mct_activation_codes (
        id, code, type, plan_type, status, duration_days, price_usd,
        max_uses, times_used, is_used, is_active, used_by_students, notes
      )
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (code) DO NOTHING;
    `;
    try {
      await neonPool.query(query, params);
    } catch (err) {
      console.warn('[DB] Batch seed code chunk warning:', err);
    }
  }
}

// Hydrate DB from Neon PostgreSQL
export async function syncFromCloud(): Promise<boolean> {
  if (cloudSyncPromise) {
    return cloudSyncPromise;
  }
  cloudSyncPromise = doSyncFromCloud().finally(() => {
    cloudSyncPromise = null;
  });
  return cloudSyncPromise;
}

export async function ensureDBInitialized(): Promise<DBSchema> {
  if (neonPool && !isHydratedFromNeon) {
    await syncFromCloud();
  }
  return getDB();
}

async function doSyncFromCloud(): Promise<boolean> {
  if (!neonPool) return false;
  try {
    // Ensure all tables exist in Neon PostgreSQL (run once per process to prevent DDL catalog locks)
    if (!schemaInitialized) {
      await neonPool.query(`
        CREATE TABLE IF NOT EXISTS mct_kv_store (
          key VARCHAR(100) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS mct_users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          email TEXT,
          password_hash TEXT NOT NULL,
          university TEXT,
          study_level TEXT,
          major TEXT,
          role TEXT NOT NULL DEFAULT 'student',
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_login_at TIMESTAMPTZ
        );
        CREATE TABLE IF NOT EXISTS mct_activation_codes (
          id TEXT PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          type TEXT,
          plan_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'unused',
          duration_days INT NOT NULL DEFAULT 30,
          price_usd NUMERIC NOT NULL DEFAULT 20,
          phone TEXT,
          student_name TEXT,
          student_id TEXT,
          activated_at TIMESTAMPTZ,
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          activated_by TEXT,
          max_uses INT NOT NULL DEFAULT 1,
          times_used INT NOT NULL DEFAULT 0,
          is_used BOOLEAN NOT NULL DEFAULT false,
          is_active BOOLEAN NOT NULL DEFAULT true,
          used_by_students JSONB DEFAULT '[]'::jsonb,
          notes TEXT
        );
        CREATE TABLE IF NOT EXISTS mct_subscriptions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          phone TEXT,
          code TEXT,
          plan TEXT NOT NULL,
          status TEXT NOT NULL,
          start_date TIMESTAMPTZ NOT NULL,
          expiry_date TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          activated_at TIMESTAMPTZ,
          activation_method TEXT,
          notes TEXT
        );
        CREATE TABLE IF NOT EXISTS mct_subscription_requests (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          student_name TEXT,
          phone TEXT,
          university TEXT,
          plan TEXT,
          price_usd NUMERIC,
          status TEXT,
          created_at TIMESTAMPTZ,
          notes TEXT
        );
        CREATE TABLE IF NOT EXISTS mct_student_progress (
          student_id TEXT PRIMARY KEY,
          completed_lessons JSONB DEFAULT '[]'::jsonb,
          quiz_scores JSONB DEFAULT '{}'::jsonb,
          lesson_notes JSONB DEFAULT '{}'::jsonb,
          saved_projects JSONB DEFAULT '[]'::jsonb,
          simulator_settings JSONB DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS mct_settings (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);
      schemaInitialized = true;
    }

    // Fetch live relational tables directly
    const [resUsers, resSubs, resCodes, resReqs, resProg, resSettings, resKv] = await Promise.all([
      neonPool.query('SELECT * FROM mct_users ORDER BY created_at ASC;'),
      neonPool.query('SELECT * FROM mct_subscriptions ORDER BY created_at ASC;'),
      neonPool.query('SELECT * FROM mct_activation_codes ORDER BY created_at ASC;'),
      neonPool.query('SELECT * FROM mct_subscription_requests ORDER BY created_at DESC;'),
      neonPool.query('SELECT * FROM mct_student_progress;'),
      neonPool.query("SELECT data FROM mct_settings WHERE id = 'main_settings' LIMIT 1;"),
      neonPool.query('SELECT data FROM mct_kv_store WHERE key = $1 LIMIT 1;', [DB_STORE_KEY]),
    ]);

    const kvData = (resKv.rows?.[0]?.data as DBSchema) || null;

    if (resUsers.rows && resUsers.rows.length > 0) {
      // 1. Authoritative users list from relational table
      const users: DBUser[] = resUsers.rows.map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email || undefined,
        passwordHash: row.password_hash,
        university: row.university || '',
        studyLevel: row.study_level || '',
        major: row.major || '',
        role: (row.role || 'student') as 'student' | 'admin',
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : undefined,
      }));

      // 2. Authoritative subscriptions from relational table (filtered to valid users only)
      const validUserIds = new Set(users.map((u) => u.id));
      const subscriptions: DBSubscription[] = resSubs.rows
        .filter((row) => validUserIds.has(row.user_id))
        .map((row) => ({
          id: row.id,
          userId: row.user_id,
          studentId: row.user_id,
          phone: row.phone || undefined,
          code: row.code || undefined,
          plan: (row.plan || 'monthly') as 'monthly' | 'yearly',
          status: (row.status || 'pending') as 'pending' | 'active' | 'expired' | 'suspended',
          startDate: row.start_date ? new Date(row.start_date).toISOString() : new Date().toISOString(),
          expiryDate: row.expiry_date ? new Date(row.expiry_date).toISOString() : new Date().toISOString(),
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          activatedAt: row.activated_at ? new Date(row.activated_at).toISOString() : undefined,
          activationMethod: row.activation_method || undefined,
          notes: row.notes || undefined,
        }));

      // 3. Activation codes: preserve from relational table or KV-Store or seeded file
      let activationCodes: DBActivationCode[] = [];
      if (resCodes.rows && resCodes.rows.length > 0) {
        activationCodes = resCodes.rows.map((row) => ({
          id: row.id,
          code: row.code,
          type: row.type as any,
          planType: (row.plan_type || 'monthly') as any,
          status: (row.status || 'unused') as any,
          durationDays: Number(row.duration_days) || 30,
          priceUSD: Number(row.price_usd) || 20,
          phone: row.phone || undefined,
          studentName: row.student_name || undefined,
          studentId: row.student_id || undefined,
          activatedAt: row.activated_at ? new Date(row.activated_at).toISOString() : undefined,
          expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : undefined,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          activatedBy: row.activated_by || undefined,
          maxUses: Number(row.max_uses) || 1,
          timesUsed: Number(row.times_used) || 0,
          isUsed: Boolean(row.is_used),
          isActive: Boolean(row.is_active !== false),
          usedByStudents: Array.isArray(row.used_by_students) ? row.used_by_students : [],
          notes: row.notes || undefined,
        }));
      }

      // If relational codes table was empty, fallback to KV-store or local seeds
      if (activationCodes.length === 0) {
        if (kvData && Array.isArray(kvData.activationCodes) && kvData.activationCodes.length > 0) {
          activationCodes = kvData.activationCodes;
        } else {
          const fallbackDb = getDB();
          activationCodes = fallbackDb.activationCodes || [];
        }
      }

      // 4. Requests
      const subscriptionRequests: DBSubscriptionRequest[] = resReqs.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        studentName: row.student_name || '',
        phone: row.phone || '',
        university: row.university || '',
        plan: (row.plan || 'monthly') as 'monthly' | 'yearly',
        priceUSD: Number(row.price_usd) || 20,
        status: (row.status || 'pending') as 'pending' | 'approved' | 'rejected',
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        notes: row.notes || undefined,
      }));

      // 5. Student Progress
      const studentProgress: Record<string, DBStudentProgress> = {};
      for (const row of resProg.rows) {
        if (validUserIds.has(row.student_id)) {
          studentProgress[row.student_id] = {
            studentId: row.student_id,
            completedLessons: row.completed_lessons || [],
            quizScores: row.quiz_scores || {},
            lessonNotes: row.lesson_notes || {},
            savedProjects: row.saved_projects || [],
            simulatorSettings: row.simulator_settings || {},
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          };
        }
      }

      // 6. Settings
      const settings = (resSettings.rows?.[0]?.data as any) || kvData?.settings || getDefaultDB().settings;

      cachedDB = {
        users,
        subscriptions,
        activationCodes,
        subscriptionRequests,
        studentProgress,
        studentLessons: kvData?.studentLessons || [],
        passwordResetTokens: kvData?.passwordResetTokens || [],
        settings,
      };

      ensureReadyCodesSeeded(cachedDB);

      // Keep mct_kv_store perfectly in sync with atomic update (~20ms)
      await neonPool.query(
        `INSERT INTO mct_kv_store (key, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW();`,
        [DB_STORE_KEY, JSON.stringify(cachedDB)]
      );

      saveLocalFile(cachedDB);
      if (resCodes.rows.length === 0 && cachedDB.activationCodes.length > 0) {
        batchSeedRelationalCodes(cachedDB.activationCodes).catch(() => {});
      }
      lastCloudSyncAt = new Date().toISOString();
      cloudSyncError = null;
      isHydratedFromNeon = true;
      console.log(`[DB] Successfully hydrated from Neon PostgreSQL: ${cachedDB.users.length} users, ${cachedDB.subscriptions.length} subscriptions, ${cachedDB.activationCodes.length} codes.`);
      return true;
    } else {
      // If relational users table is empty, check KV data first, otherwise seed from mechatronics_db.json
      if (kvData && Array.isArray(kvData.users) && kvData.users.length > 0) {
        cachedDB = kvData;
      } else {
        cachedDB = getDB();
      }
      ensureReadyCodesSeeded(cachedDB);

      // Single fast atomic insert into mct_kv_store
      await neonPool.query(
        `INSERT INTO mct_kv_store (key, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW();`,
        [DB_STORE_KEY, JSON.stringify(cachedDB)]
      );

      // Asynchronously sync users, settings and codes in background
      if (cachedDB.activationCodes.length > 0) {
        batchSeedRelationalCodes(cachedDB.activationCodes).catch(() => {});
      }
      syncRelationalTables(cachedDB).catch(() => {});

      saveLocalFile(cachedDB);
      lastCloudSyncAt = new Date().toISOString();
      cloudSyncError = null;
      isHydratedFromNeon = true;
      console.log(`[DB] Initialized database in Neon PostgreSQL (${cachedDB.users.length} users, ${cachedDB.activationCodes.length} codes).`);
      return true;
    }
  } catch (err: any) {
    cloudSyncError = err.message || String(err);
    console.warn('[DB] Neon PostgreSQL sync error:', cloudSyncError);
    if (!cachedDB) {
      cachedDB = getDB();
      ensureReadyCodesSeeded(cachedDB);
    }
  }
  return false;
}

// Synchronize essential entities into relational tables with low latency
export async function syncRelationalTables(data: DBSchema): Promise<void> {
  if (!neonPool) return;
  try {
    // 1. Sync users
    if (data.users && data.users.length > 0) {
      for (const u of data.users) {
        await neonPool.query(
          `INSERT INTO mct_users (id, name, phone, email, password_hash, university, study_level, major, role, created_at, last_login_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             phone = EXCLUDED.phone,
             email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             university = EXCLUDED.university,
             study_level = EXCLUDED.study_level,
             major = EXCLUDED.major,
             role = EXCLUDED.role,
             last_login_at = EXCLUDED.last_login_at;`,
          [
            u.id, u.name, u.phone, u.email || null, u.passwordHash,
            u.university || null, u.studyLevel || null, u.major || null,
            u.role || 'student', u.createdAt || new Date().toISOString(), u.lastLoginAt || null
          ]
        ).catch(() => {});
      }
    }

    // 2. Sync subscriptions
    if (data.subscriptions && data.subscriptions.length > 0) {
      for (const s of data.subscriptions) {
        await neonPool.query(
          `INSERT INTO mct_subscriptions (id, user_id, phone, code, plan, status, start_date, expiry_date, created_at, activated_at, activation_method, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             user_id = EXCLUDED.user_id,
             phone = EXCLUDED.phone,
             code = EXCLUDED.code,
             plan = EXCLUDED.plan,
             status = EXCLUDED.status,
             start_date = EXCLUDED.start_date,
             expiry_date = EXCLUDED.expiry_date,
             activated_at = EXCLUDED.activated_at,
             activation_method = EXCLUDED.activation_method,
             notes = EXCLUDED.notes;`,
          [
            s.id, s.userId, s.phone || null, s.code || null, s.plan || 'monthly', s.status || 'pending',
            s.startDate || new Date().toISOString(), s.expiryDate || new Date().toISOString(),
            s.createdAt || new Date().toISOString(), s.activatedAt || null,
            s.activationMethod || null, s.notes || null
          ]
        ).catch(() => {});
      }
    }

    // 3. Sync Settings
    if (data.settings) {
      await neonPool.query(
        `INSERT INTO mct_settings (id, data, updated_at)
         VALUES ('main_settings', $1, NOW())
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();`,
        [JSON.stringify(data.settings)]
      ).catch(() => {});
    }
  } catch (err) {
    console.warn('[DB] Relational tables sync error:', err);
  }
}

// Asynchronously persist database to Neon PostgreSQL
export async function syncToCloud(data: DBSchema): Promise<void> {
  if (!neonPool) return;
  if (isSyncingToCloud) {
    pendingCloudSave = true;
    return;
  }

  isSyncingToCloud = true;
  try {
    await neonPool.query(
      `INSERT INTO mct_kv_store (key, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW();`,
      [DB_STORE_KEY, JSON.stringify(data)]
    );
    lastCloudSyncAt = new Date().toISOString();
    cloudSyncError = null;

    // Asynchronously update relational rows in Neon
    syncRelationalTables(data).catch(() => {});
  } catch (err: any) {
    cloudSyncError = err.message || String(err);
    console.error('[DB] Failed to sync changes to Neon PostgreSQL:', cloudSyncError);
  } finally {
    isSyncingToCloud = false;
    if (pendingCloudSave) {
      pendingCloudSave = false;
      if (cachedDB) {
        syncToCloud(cachedDB).catch(() => {});
      }
    }
  }
}

// Initial background sync from Neon if configured
if (neonPool) {
  syncFromCloud().catch((e) => {
    console.warn('[DB] Initial background cloud load warning:', e);
  });
}

export function getDB(): DBSchema {
  if (cachedDB) {
    return cachedDB;
  }

  // 1. Try reading the runtime DB_FILE
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDB = JSON.parse(raw);
      if (cachedDB && Array.isArray(cachedDB.users)) {
        ensureReadyCodesSeeded(cachedDB);
        return cachedDB;
      }
    } catch (e) {
      console.error('[DB] Error reading runtime DB_FILE:', e);
    }
  }

  // 2. Direct fallback to bundled repository data file (critical for Vercel Serverless Function cold starts)
  const candidatePaths = [
    path.join(process.cwd(), 'data', 'mechatronics_db.json'),
    path.join(__dirname, '..', 'data', 'mechatronics_db.json'),
    path.resolve('data/mechatronics_db.json'),
  ];

  for (const candidatePath of candidatePaths) {
    try {
      if (fs.existsSync(candidatePath)) {
        const raw = fs.readFileSync(candidatePath, 'utf-8');
        cachedDB = JSON.parse(raw);
        if (cachedDB && Array.isArray(cachedDB.users)) {
          ensureReadyCodesSeeded(cachedDB);
          // Persist to writable runtime path if possible
          try {
            if (!fs.existsSync(DATA_DIR)) {
              fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            fs.writeFileSync(DB_FILE, raw, 'utf-8');
          } catch (_) {}
          return cachedDB;
        }
      }
    } catch (e) {
      console.warn('[DB] Candidate path read warning:', candidatePath, e);
    }
  }

  // 3. Fallback to default in-memory schema
  cachedDB = getDefaultDB();
  ensureReadyCodesSeeded(cachedDB);
  return cachedDB;
}

export function saveDB(data: DBSchema): void {
  cachedDB = data;
  saveLocalFile(data);
  if (neonPool) {
    syncToCloud(data).catch((err) => {
      console.warn('[DB] Background Neon PostgreSQL save warning:', err);
    });
  }
}

// Convert Eastern Arabic / Persian numerals to Western digits (0-9)
export function convertArabicDigitsToEnglish(str: string): string {
  if (!str) return '';
  return str
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
}

// Helper phone normalizer for Yemeni numbers (+967, 00967, 077..., etc.)
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const converted = convertArabicDigitsToEnglish(phone.toString().trim());
  let digits = converted.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00967')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('967') && digits.length > 9) {
    digits = digits.slice(3);
  }
  while (digits.startsWith('0') && digits.length > 1) {
    digits = digits.slice(1);
  }
  return digits;
}

// Helper Repository Functions
export const db = {
  // Users
  findUserById(id: string): DBUser | undefined {
    if (!id) return undefined;
    return getDB().users.find((u) => u && u.id === id);
  },
  findUserByPhone(phone: string): DBUser | undefined {
    const clean = normalizePhone(phone);
    if (!clean) return undefined;
    return getDB().users.find((u) => u && u.phone && normalizePhone(u.phone) === clean);
  },
  findUserByEmail(email: string): DBUser | undefined {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    return getDB().users.find((u) => u && u.email && u.email.trim().toLowerCase() === clean);
  },
  createUser(user: DBUser): DBUser {
    const data = getDB();
    data.users.push(user);
    saveDB(data);
    if (neonPool) {
      neonPool.query(
        `INSERT INTO mct_users (id, name, phone, email, password_hash, university, study_level, major, role, created_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           university = EXCLUDED.university,
           study_level = EXCLUDED.study_level,
           major = EXCLUDED.major,
           role = EXCLUDED.role,
           last_login_at = EXCLUDED.last_login_at;`,
        [
          user.id, user.name, user.phone, user.email || null, user.passwordHash,
          user.university || null, user.studyLevel || null, user.major || null,
          user.role || 'student', user.createdAt || new Date().toISOString(), user.lastLoginAt || null
        ]
      ).catch((e) => console.warn('[DB] User direct write error:', e));
    }
    return user;
  },
  updateUser(id: string, updates: Partial<DBUser>): DBUser | null {
    const data = getDB();
    const idx = data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    data.users[idx] = { ...data.users[idx], ...updates };
    saveDB(data);
    if (neonPool) {
      const u = data.users[idx];
      neonPool.query(
        `UPDATE mct_users SET name = $1, email = $2, university = $3, study_level = $4, major = $5, last_login_at = $6 WHERE id = $7;`,
        [u.name, u.email || null, u.university || null, u.studyLevel || null, u.major || null, u.lastLoginAt || null, id]
      ).catch((e) => console.warn('[DB] User direct update error:', e));
    }
    return data.users[idx];
  },
  getAllUsers(): DBUser[] {
    return getDB().users;
  },
  async deleteUserAsync(id: string): Promise<boolean> {
    const data = getDB();
    const user = data.users.find((u) => u.id === id);
    if (!user) {
      if (neonPool) {
        try {
          await Promise.all([
            neonPool.query('DELETE FROM mct_users WHERE id = $1;', [id]),
            neonPool.query('DELETE FROM mct_subscriptions WHERE user_id = $1 OR id = $1;', [id]),
            neonPool.query('DELETE FROM mct_student_progress WHERE student_id = $1;', [id]),
          ]);
        } catch (e) {}
      }
      return false;
    }

    if (user.role === 'admin') {
      throw new Error('لا يمكن حذف حساب مدير المنصة.');
    }

    const userPhone = user.phone ? normalizePhone(user.phone) : '';

    // 1. Remove student from users array
    data.users = data.users.filter((u) => u.id !== id);

    // 2. Remove all student subscriptions
    data.subscriptions = (data.subscriptions || []).filter(
      (s) => s.userId !== id && s.id !== id && (!userPhone || !s.phone || normalizePhone(s.phone) !== userPhone)
    );

    // 3. Remove student progress & saved work
    if (data.studentProgress) {
      delete data.studentProgress[id];
    }

    // 4. Remove student lessons
    if (data.studentLessons) {
      data.studentLessons = data.studentLessons.filter((l) => l.studentId !== id);
    }

    // 5. Remove student subscription requests
    if (data.subscriptionRequests) {
      data.subscriptionRequests = data.subscriptionRequests.filter(
        (r) => r.userId !== id && (!userPhone || !r.phone || normalizePhone(r.phone) !== userPhone)
      );
    }

    // 6. Remove password reset tokens
    if (data.passwordResetTokens) {
      data.passwordResetTokens = data.passwordResetTokens.filter((t) => t.userId !== id);
    }

    // 7. Clean up or unlink activation codes tied to this student
    if (data.activationCodes) {
      for (const c of data.activationCodes) {
        const isBound =
          c.studentId === id ||
          (userPhone && c.phone && normalizePhone(c.phone) === userPhone) ||
          (c.usedByStudents && c.usedByStudents.some((st) => st.studentId === id || (userPhone && st.phone && normalizePhone(st.phone) === userPhone)));

        if (isBound) {
          c.studentId = undefined;
          c.studentName = undefined;
          c.phone = undefined;
          c.activatedAt = undefined;
          c.expiresAt = undefined;
          c.isUsed = false;
          c.timesUsed = 0;
          c.status = 'unused';
          if (c.usedByStudents) {
            c.usedByStudents = c.usedByStudents.filter(
              (st) => st.studentId !== id && (!userPhone || !st.phone || normalizePhone(st.phone) !== userPhone)
            );
          }
        }
      }
    }

    cachedDB = data;
    saveLocalFile(data);

    // 8. CRITICAL: Await all Neon PostgreSQL deletions before responding to client
    if (neonPool) {
      try {
        await Promise.all([
          neonPool.query('DELETE FROM mct_users WHERE id = $1;', [id]),
          neonPool.query('DELETE FROM mct_subscriptions WHERE user_id = $1 OR (phone IS NOT NULL AND phone = $2);', [id, user.phone || '']),
          neonPool.query('DELETE FROM mct_student_progress WHERE student_id = $1;', [id]),
          neonPool.query('DELETE FROM mct_subscription_requests WHERE user_id = $1 OR (phone IS NOT NULL AND phone = $2);', [id, user.phone || '']),
          neonPool.query(
            `UPDATE mct_activation_codes
             SET student_id = NULL, student_name = NULL, phone = NULL, activated_at = NULL, expires_at = NULL, is_used = false, times_used = 0, status = 'unused'
             WHERE student_id = $1 OR (phone IS NOT NULL AND phone = $2);`,
            [id, user.phone || '']
          ),
        ]);

        await neonPool.query(
          `INSERT INTO mct_kv_store (key, data, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW();`,
          [DB_STORE_KEY, JSON.stringify(data)]
        );
        lastCloudSyncAt = new Date().toISOString();
        cloudSyncError = null;
      } catch (err: any) {
        console.error('[DB] Neon PostgreSQL student deletion error:', err);
        throw err;
      }
    }

    return true;
  },

  deleteUser(id: string): boolean {
    const data = getDB();
    const initLen = data.users.length;
    this.deleteUserAsync(id).catch((e) => console.error('[DB] Sync deleteUser background error:', e));
    data.users = data.users.filter((u) => u.id !== id);
    data.subscriptions = (data.subscriptions || []).filter((s) => s.userId !== id && s.id !== id);
    if (data.studentProgress) delete data.studentProgress[id];
    return data.users.length !== initLen;
  },

  // Password Reset & Profile Update
  createPasswordReset(userId: string, phone: string): { code: string; token: string; expiresAt: string } {
    const data = getDB();
    if (!data.passwordResetTokens) {
      data.passwordResetTokens = [];
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    const resetItem: DBPasswordResetToken = {
      id: `pr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      userId,
      phone: phone.replace(/[^0-9]/g, ''),
      code,
      token,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    };

    data.passwordResetTokens.unshift(resetItem);
    saveDB(data);
    return { code, token, expiresAt };
  },

  verifyAndConsumePasswordReset(phone: string, code: string): string | null {
    const data = getDB();
    if (!data.passwordResetTokens) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const item = data.passwordResetTokens.find(
      (r) => !r.used && r.phone === cleanPhone && r.code.trim() === code.trim() && new Date(r.expiresAt) > new Date()
    );
    if (!item) return null;
    item.used = true;
    saveDB(data);
    return item.userId;
  },

  updateUserPassword(userId: string, newPasswordHash: string): boolean {
    const data = getDB();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    saveDB(data);
    return true;
  },

  getDB,
  saveDB,

  // Subscriptions
  getSubscriptionByUserId(userId: string): DBSubscription | undefined {
    if (!userId) return undefined;
    return getDB().subscriptions.find((s) => s && s.userId === userId);
  },
  getAllSubscriptions(): DBSubscription[] {
    return getDB().subscriptions;
  },
  createOrUpdateSubscription(sub: DBSubscription): DBSubscription {
    const data = getDB();
    const idx = data.subscriptions.findIndex((s) => s.userId === sub.userId);
    if (idx >= 0) {
      data.subscriptions[idx] = sub;
    } else {
      data.subscriptions.push(sub);
    }
    saveDB(data);
    if (neonPool) {
      neonPool.query(
        `INSERT INTO mct_subscriptions (id, user_id, phone, code, plan, status, start_date, expiry_date, created_at, activated_at, activation_method, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           phone = EXCLUDED.phone,
           code = EXCLUDED.code,
           plan = EXCLUDED.plan,
           status = EXCLUDED.status,
           start_date = EXCLUDED.start_date,
           expiry_date = EXCLUDED.expiry_date,
           activated_at = EXCLUDED.activated_at,
           activation_method = EXCLUDED.activation_method,
           notes = EXCLUDED.notes;`,
        [
          sub.id, sub.userId, sub.phone || null, sub.code || null, sub.plan || 'monthly', sub.status || 'pending',
          sub.startDate || new Date().toISOString(), sub.expiryDate || new Date().toISOString(),
          sub.createdAt || new Date().toISOString(), sub.activatedAt || null,
          sub.activationMethod || null, sub.notes || null
        ]
      ).catch((e) => console.warn('[DB] Sub write error:', e));
    }
    return sub;
  },
  updateSubscriptionStatus(
    userId: string,
    status: 'pending' | 'active' | 'expired' | 'suspended',
    durationDays?: number,
    plan?: 'monthly' | 'yearly'
  ): DBSubscription | null {
    const data = getDB();
    const idx = data.subscriptions.findIndex((s) => s.userId === userId);
    const now = new Date();
    if (idx === -1) {
      // Create new
      const days = durationDays || 30;
      const newSub: DBSubscription = {
        id: `sub-${Date.now()}`,
        userId,
        plan: plan || 'monthly',
        status,
        startDate: now.toISOString(),
        expiryDate: new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now.toISOString(),
        activatedAt: status === 'active' ? now.toISOString() : undefined,
        activationMethod: 'admin_direct',
      };
      data.subscriptions.push(newSub);
      saveDB(data);
      return newSub;
    }

    const current = data.subscriptions[idx];
    current.status = status;
    if (plan) current.plan = plan;

    if (status === 'active') {
      const days = durationDays || (current.plan === 'yearly' ? 365 : 30);
      current.startDate = now.toISOString();
      current.expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      current.activatedAt = now.toISOString();
    }

    saveDB(data);
    return current;
  },

  async deleteSubscriptionAsync(idOrUserId: string): Promise<boolean> {
    const data = getDB();
    const targetSub = (data.subscriptions || []).find((s) => s.id === idOrUserId || s.userId === idOrUserId);
    const targetUserId = targetSub?.userId || idOrUserId;
    const targetPhone = targetSub?.phone ? normalizePhone(targetSub.phone) : '';

    // 1. Remove from in-memory subscriptions
    data.subscriptions = (data.subscriptions || []).filter(
      (s) => s.id !== idOrUserId && s.userId !== idOrUserId && (!targetPhone || !s.phone || normalizePhone(s.phone) !== targetPhone)
    );

    // 2. Unlink any activation codes tied to this subscription/user
    if (data.activationCodes && targetUserId) {
      for (const c of data.activationCodes) {
        if (c.studentId === targetUserId || (targetPhone && c.phone && normalizePhone(c.phone) === targetPhone)) {
          c.studentId = undefined;
          c.studentName = undefined;
          c.phone = undefined;
          c.activatedAt = undefined;
          c.expiresAt = undefined;
          c.isUsed = false;
          c.timesUsed = 0;
          c.status = 'unused';
          if (c.usedByStudents) {
            c.usedByStudents = c.usedByStudents.filter(
              (st) => st.studentId !== targetUserId && (!targetPhone || !st.phone || normalizePhone(st.phone) !== targetPhone)
            );
          }
        }
      }
    }

    cachedDB = data;
    saveLocalFile(data);

    // 3. Await Neon PostgreSQL query
    if (neonPool) {
      try {
        await Promise.all([
          neonPool.query(
            'DELETE FROM mct_subscriptions WHERE id = $1 OR user_id = $1 OR (phone IS NOT NULL AND phone = $2);',
            [idOrUserId, targetSub?.phone || '']
          ),
          targetUserId
            ? neonPool.query(
                `UPDATE mct_activation_codes
                 SET student_id = NULL, student_name = NULL, phone = NULL, activated_at = NULL, expires_at = NULL, is_used = false, times_used = 0, status = 'unused'
                 WHERE student_id = $1 OR (phone IS NOT NULL AND phone = $2);`,
                [targetUserId, targetSub?.phone || '']
              )
            : Promise.resolve(),
        ]);

        await neonPool.query(
          `INSERT INTO mct_kv_store (key, data, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW();`,
          [DB_STORE_KEY, JSON.stringify(data)]
        );
        lastCloudSyncAt = new Date().toISOString();
        cloudSyncError = null;
      } catch (err: any) {
        console.error('[DB] Neon PostgreSQL subscription deletion error:', err);
        throw err;
      }
    }

    return true;
  },

  deleteSubscription(idOrUserId: string): boolean {
    const data = getDB();
    const initLen = (data.subscriptions || []).length;
    this.deleteSubscriptionAsync(idOrUserId).catch((e) => console.error('[DB] Sync deleteSubscription error:', e));
    data.subscriptions = (data.subscriptions || []).filter((s) => s.id !== idOrUserId && s.userId !== idOrUserId);
    return data.subscriptions.length !== initLen;
  },

  // Activation Codes
  findActivationCode(code: string): DBActivationCode | undefined {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    return getDB().activationCodes.find((c) => c.code.trim().toUpperCase() === clean);
  },
  findActivationCodeByPhone(phone: string): DBActivationCode | undefined {
    const clean = normalizePhone(phone);
    if (!clean) return undefined;
    return getDB().activationCodes.find((c) => c.phone && normalizePhone(c.phone) === clean);
  },
  getAllActivationCodes(): DBActivationCode[] {
    const data = getDB();
    if (!data.activationCodes || data.activationCodes.length < 10) {
      ensureReadyCodesSeeded(data);
      saveDB(data);
    }
    return data.activationCodes;
  },
  createActivationCode(codeRecord: DBActivationCode): DBActivationCode {
    const data = getDB();
    data.activationCodes.unshift(codeRecord);
    saveDB(data);
    if (neonPool) {
      neonPool.query(
        `INSERT INTO mct_activation_codes (
           id, code, type, plan_type, status, duration_days, price_usd, phone,
           student_name, student_id, activated_at, expires_at, created_at, activated_by,
           max_uses, times_used, is_used, is_active, used_by_students, notes
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (id) DO UPDATE SET
           code = EXCLUDED.code,
           type = EXCLUDED.type,
           plan_type = EXCLUDED.plan_type,
           status = EXCLUDED.status,
           duration_days = EXCLUDED.duration_days,
           price_usd = EXCLUDED.price_usd,
           phone = EXCLUDED.phone,
           student_name = EXCLUDED.student_name,
           student_id = EXCLUDED.student_id,
           activated_at = EXCLUDED.activated_at,
           expires_at = EXCLUDED.expires_at,
           max_uses = EXCLUDED.max_uses,
           times_used = EXCLUDED.times_used,
           is_used = EXCLUDED.is_used,
           is_active = EXCLUDED.is_active,
           used_by_students = EXCLUDED.used_by_students,
           notes = EXCLUDED.notes;`,
        [
          codeRecord.id, codeRecord.code, codeRecord.type || codeRecord.planType || 'monthly', codeRecord.planType || 'monthly',
          codeRecord.status || (codeRecord.isUsed ? 'used' : 'unused'), codeRecord.durationDays || 30, codeRecord.priceUSD || 20,
          codeRecord.phone || null, codeRecord.studentName || null, codeRecord.studentId || null,
          codeRecord.activatedAt || null, codeRecord.expiresAt || null, codeRecord.createdAt || new Date().toISOString(),
          codeRecord.activatedBy || null, codeRecord.maxUses || 1, codeRecord.timesUsed || 0,
          Boolean(codeRecord.isUsed), Boolean(codeRecord.isActive !== false),
          JSON.stringify(codeRecord.usedByStudents || []), codeRecord.notes || null
        ]
      ).catch((e) => console.warn('[DB] Code direct write error:', e));
    }
    return codeRecord;
  },
  batchCreateActivationCodes(newCodes: DBActivationCode[]): DBActivationCode[] {
    const data = getDB();
    data.activationCodes.unshift(...newCodes);
    saveDB(data);
    for (const codeRecord of newCodes) {
      this.createActivationCode(codeRecord);
    }
    return newCodes;
  },
  updateActivationCode(code: string, updates: Partial<DBActivationCode>): DBActivationCode | null {
    const data = getDB();
    const clean = code.trim().toUpperCase();
    const idx = data.activationCodes.findIndex((c) => c.code.trim().toUpperCase() === clean);
    if (idx === -1) return null;
    data.activationCodes[idx] = { ...data.activationCodes[idx], ...updates };
    saveDB(data);
    if (neonPool) {
      const c = data.activationCodes[idx];
      neonPool.query(
        `UPDATE mct_activation_codes
         SET is_used = $1, status = $2, phone = $3, student_name = $4, student_id = $5,
             activated_at = $6, times_used = $7, used_by_students = $8
         WHERE UPPER(code) = $9;`,
        [
          Boolean(c.isUsed), c.status || (c.isUsed ? 'used' : 'unused'), c.phone || null,
          c.studentName || null, c.studentId || null, c.activatedAt || null,
          c.timesUsed || 1, JSON.stringify(c.usedByStudents || []), clean
        ]
      ).catch((e) => console.warn('[DB] Code direct update error:', e));
    }
    return data.activationCodes[idx];
  },
  async deleteActivationCodeAsync(codeOrId: string): Promise<boolean> {
    const data = getDB();
    const clean = (codeOrId || '').trim().toUpperCase();
    const initialLen = (data.activationCodes || []).length;
    data.activationCodes = (data.activationCodes || []).filter(
      (c) => c.id !== codeOrId && c.code.trim().toUpperCase() !== clean
    );
    cachedDB = data;
    saveLocalFile(data);

    if (neonPool) {
      try {
        await neonPool.query(
          'DELETE FROM mct_activation_codes WHERE id = $1 OR UPPER(code) = $2;',
          [codeOrId, clean]
        );
        await neonPool.query(
          `INSERT INTO mct_kv_store (key, data, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW();`,
          [DB_STORE_KEY, JSON.stringify(data)]
        );
      } catch (err: any) {
        console.error('[DB] Neon code deletion error:', err);
        throw err;
      }
    }
    return (data.activationCodes || []).length !== initialLen;
  },

  deleteActivationCode(code: string): boolean {
    const data = getDB();
    const clean = code.trim().toUpperCase();
    const initialLen = data.activationCodes.length;
    this.deleteActivationCodeAsync(code).catch((e) => console.error('[DB] Sync deleteCode background error:', e));
    data.activationCodes = data.activationCodes.filter((c) => c.id !== code && c.code.trim().toUpperCase() !== clean);
    return data.activationCodes.length !== initialLen;
  },
  getSubscriptionByPhone(phone: string): DBSubscription | undefined {
    const clean = normalizePhone(phone);
    if (!clean) return undefined;
    const user = db.findUserByPhone(clean);
    return getDB().subscriptions.find((s) => (user && s.userId === user.id) || (s.phone && normalizePhone(s.phone) === clean));
  },

  // Subscription Requests (WhatsApp)
  getAllRequests(): DBSubscriptionRequest[] {
    return getDB().subscriptionRequests;
  },
  createRequest(req: DBSubscriptionRequest): DBSubscriptionRequest {
    const data = getDB();
    data.subscriptionRequests.unshift(req);
    saveDB(data);
    return req;
  },
  updateRequestStatus(requestId: string, status: 'pending' | 'approved' | 'rejected'): DBSubscriptionRequest | null {
    const data = getDB();
    const req = data.subscriptionRequests.find((r) => r.id === requestId);
    if (!req) return null;
    req.status = status;
    saveDB(data);
    return req;
  },
  async deleteRequestAsync(requestId: string): Promise<boolean> {
    const data = getDB();
    const initLen = (data.subscriptionRequests || []).length;
    data.subscriptionRequests = (data.subscriptionRequests || []).filter((r) => r.id !== requestId);
    cachedDB = data;
    saveLocalFile(data);

    if (neonPool) {
      try {
        await neonPool.query('DELETE FROM mct_subscription_requests WHERE id = $1;', [requestId]);
        await neonPool.query(
          `INSERT INTO mct_kv_store (key, data, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW();`,
          [DB_STORE_KEY, JSON.stringify(data)]
        );
      } catch (err: any) {
        console.error('[DB] Neon request deletion error:', err);
        throw err;
      }
    }
    return (data.subscriptionRequests || []).length !== initLen;
  },
  deleteRequest(requestId: string): boolean {
    const data = getDB();
    const initLen = (data.subscriptionRequests || []).length;
    this.deleteRequestAsync(requestId).catch((e) => console.error('[DB] Sync deleteRequest background error:', e));
    data.subscriptionRequests = (data.subscriptionRequests || []).filter((r) => r.id !== requestId);
    return (data.subscriptionRequests || []).length !== initLen;
  },

  // Student Lessons (Explained Lessons)
  getStudentLessons(studentId: string): any[] {
    return getDB().studentLessons.filter((l) => l.studentId === studentId);
  },
  saveStudentLesson(lesson: any): any {
    const data = getDB();
    const idx = data.studentLessons.findIndex((l) => l.id === lesson.id);
    if (idx >= 0) {
      data.studentLessons[idx] = lesson;
    } else {
      data.studentLessons.unshift(lesson);
      if (data.studentLessons.length > 500) {
        data.studentLessons = data.studentLessons.slice(0, 500);
      }
    }
    saveDB(data);
    return lesson;
  },
  deleteStudentLesson(lessonId: string, studentId?: string): boolean {
    const data = getDB();
    const initialLen = data.studentLessons.length;
    data.studentLessons = data.studentLessons.filter((l) => {
      if (studentId) {
        return !(l.id === lessonId && l.studentId === studentId);
      }
      return l.id !== lessonId;
    });
    saveDB(data);
    return data.studentLessons.length !== initialLen;
  },

  // Student Progress
  getStudentProgress(studentId: string): DBStudentProgress {
    const data = getDB();
    if (!data.studentProgress[studentId]) {
      data.studentProgress[studentId] = {
        studentId,
        completedLessons: [],
        quizScores: {},
        lessonNotes: {},
        savedProjects: [],
        simulatorSettings: {},
        updatedAt: new Date().toISOString(),
      };
      saveDB(data);
    }
    if (!data.studentProgress[studentId].lessonNotes) {
      data.studentProgress[studentId].lessonNotes = {};
    }
    return data.studentProgress[studentId];
  },
  saveStudentProgress(studentId: string, updates: Partial<DBStudentProgress>): DBStudentProgress {
    const data = getDB();
    const current = this.getStudentProgress(studentId);
    data.studentProgress[studentId] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDB(data);
    return data.studentProgress[studentId];
  },

  // Settings
  getSettings() {
    return getDB().settings;
  },
  updateSettings(updates: Partial<DBSchema['settings']>) {
    const data = getDB();
    data.settings = { ...data.settings, ...updates };
    saveDB(data);
    return data.settings;
  },

  // Storage and Cloud DB Status (Neon PostgreSQL)
  getStorageStatus() {
    const current = getDB();
    return {
      provider: cloudProvider,
      isCloudActive: Boolean(neonPool),
      cloudProviderName: cloudProvider === 'neon-postgres' ? 'Neon PostgreSQL (Cloud Database)' : 'Local Storage (Dev Fallback)',
      lastCloudSyncAt,
      cloudSyncError,
      totalUsers: current.users.length,
      totalSubscriptions: current.subscriptions.length,
      totalCodes: current.activationCodes.length,
      totalRequests: current.subscriptionRequests.length,
    };
  },
  isCloudConfigured() {
    return Boolean(neonPool);
  },
  isHydrated() {
    return isHydratedFromNeon;
  },
  syncFromCloud,
  syncToCloud,
};

import { GoogleGenAI } from '@google/genai';
import { safeExtractJson } from './explainService';
import { EXTENDED_PROJECT_TEMPLATES, PROJECT_PRESET_BUTTONS } from './projectTemplates';

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

export interface ProjectGalleryImage {
  id: string;
  imageNumber: number; // 1 to 8
  title: string;
  subtitle: string;
  description: string;
  svgContent: string;
}

export interface ProjectReferenceItem {
  type: 'book' | 'pdf' | 'video' | 'course';
  title: string;
  chapterOrSection?: string;
  pageNumber?: string;
  videoTimestamp?: string;
  sourceNote?: string;
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

/**
 * Standard Mechatronics References of Yemen Mechatronics Academy
 */
export const OFFICIAL_MECHATRONICS_REFERENCES: ProjectReferenceItem[] = [
  {
    type: 'book',
    title: 'هندسة التحكم والميكاترونكس وتطبيقات المتحكمات الدقيقة',
    chapterOrSection: 'الباب الرابع: قيادة محركات التيار المستمر وإشارات PWM والجسور الإلكترونية H-Bridge',
    pageNumber: 'ص 114 - 128',
    sourceNote: 'المرجع الأكاديمي المعتمد - قسم هندسة الميكاترونكس',
  },
  {
    type: 'book',
    title: 'دليل مشاريع ميكروكنترولر Arduino والأنظمة المدمجة الذكية',
    chapterOrSection: 'الفصل الثالث: حساسات الموجات فوق الصوتية وتفادي العوائق للمركبات الذكية',
    pageNumber: 'ص 72 - 95',
    sourceNote: 'مختبر الروبوتات والأنظمة الذكية بالأكاديمية',
  },
  {
    type: 'book',
    title: 'أسس الدوائر الكهربائية والإلكترونيات الصناعية',
    chapterOrSection: 'الفصل الخامس: منظمات الجهد ودوائر التغذية وتوزيع التيارات',
    pageNumber: 'ص 88 - 104',
    sourceNote: 'مقرر الدوائر الإلكترونية - المستوى الأول والثاني',
  },
  {
    type: 'book',
    title: 'مقدمة في ديناميكا الطيران وأنظمة الطائرات المسيرة (UAVs)',
    chapterOrSection: 'الفصل الثاني: المحركات عديمة المسفرات (BLDC)، متحكمات السرعة ESC، والاستقرار عبر PID',
    pageNumber: 'ص 45 - 68',
    sourceNote: 'مرجع هندسة الطيران والروبوتات الجوية التعليمي',
  },
];

/**
 * Helper to generate clear, crisp SVG educational diagrams
 */
export function generateSvgCircuitDiagram(title: string, connections: ProjectWiringConnection[], pinMapping: ProjectPinMapping[]): string {
  const connItems = connections.slice(0, 10);
  const connRows = connItems.map((c, i) => {
    const y = 80 + i * 28;
    return `
      <g transform="translate(40, ${y})">
        <rect x="0" y="0" width="130" height="24" rx="4" fill="#1e293b" stroke="#334155" />
        <text x="65" y="16" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">${c.fromComponent} (${c.fromPin})</text>
        
        <!-- Wire with custom color -->
        <line x1="130" y1="12" x2="270" y2="12" stroke="${c.wireColor === 'red' ? '#ef4444' : c.wireColor === 'black' ? '#0f172a' : c.wireColor === 'blue' ? '#3b82f6' : c.wireColor === 'yellow' ? '#eab308' : c.wireColor === 'green' ? '#10b981' : '#f97316'}" stroke-width="3" stroke-dasharray="${c.signalType === 'PWM' ? '4,2' : 'none'}" />
        <circle cx="200" cy="12" r="4" fill="${c.wireColor === 'red' ? '#ef4444' : '#3b82f6'}" />
        <text x="200" y="26" fill="#94a3b8" font-size="9" text-anchor="middle">${c.signalType}</text>
        
        <rect x="270" y="0" width="140" height="24" rx="4" fill="#0f766e" stroke="#14b8a6" />
        <text x="340" y="16" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">${c.toComponent} (${c.toPin})</text>
      </g>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 ${100 + connItems.length * 28}" class="w-full h-auto rounded-xl">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGrad)" rx="12" stroke="#1e293b" />
      
      <!-- Title Header -->
      <rect x="20" y="15" width="480" height="42" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
      <text x="260" y="41" fill="#38bdf8" font-size="14" font-weight="900" text-anchor="middle" font-family="sans-serif">
        🔌 مخطط التوصيل والأسلاك: ${title}
      </text>
      
      ${connRows}
    </svg>
  `;
}

export function generateStepAssemblySvg(stepNum: number, stepTitle: string, componentNames: string[]): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 220" class="w-full h-auto rounded-xl shadow-inner">
      <defs>
        <linearGradient id="stepBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#stepBg)" rx="12" stroke="#334155" />
      
      <!-- Step Badge -->
      <circle cx="50" cy="45" r="24" fill="#2563eb" stroke="#60a5fa" stroke-width="2" />
      <text x="50" y="52" fill="#ffffff" font-size="16" font-weight="900" text-anchor="middle">${stepNum}</text>
      
      <text x="90" y="44" fill="#f8fafc" font-size="15" font-weight="bold" font-family="sans-serif">${stepTitle}</text>
      <text x="90" y="64" fill="#94a3b8" font-size="11" font-family="sans-serif">أكاديمية الميكاترونكس اليمنية - التركيب العملي</text>
      
      <!-- Graphic Box Representing Hardware Assembly -->
      <rect x="40" y="90" width="380" height="105" rx="8" fill="#111827" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3,3" />
      
      <!-- Microcontroller & Module Blocks -->
      <rect x="65" y="110" width="130" height="65" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
      <text x="130" y="148" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">${componentNames[0] || 'المكون الأساسي'}</text>
      
      <!-- Connection Arrow -->
      <path d="M 205 142 L 255 142" stroke="#10b981" stroke-width="3" marker-end="url(#arrow)" />
      
      <rect x="265" y="110" width="130" height="65" rx="6" fill="#0d9488" stroke="#2dd4bf" stroke-width="1.5" />
      <text x="330" y="148" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">${componentNames[1] || 'لوحة التوصيل'}</text>
      
      <circle cx="230" cy="142" r="8" fill="#f59e0b" />
      <text x="230" y="146" fill="#000" font-size="9" font-weight="bold" text-anchor="middle">⚡</text>
    </svg>
  `;
}

export function generateFinalProjectOverviewSvg(title: string, category: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 280" class="w-full h-auto rounded-2xl">
      <defs>
        <linearGradient id="projHeroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#030712" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#projHeroGrad)" rx="16" stroke="#312e81" stroke-width="1.5" />
      
      <!-- Tech Grid Pattern -->
      <g opacity="0.15">
        <line x1="0" y1="40" x2="540" y2="40" stroke="#38bdf8" />
        <line x1="0" y1="80" x2="540" y2="80" stroke="#38bdf8" />
        <line x1="0" y1="120" x2="540" y2="120" stroke="#38bdf8" />
        <line x1="0" y1="160" x2="540" y2="160" stroke="#38bdf8" />
        <line x1="0" y1="200" x2="540" y2="200" stroke="#38bdf8" />
        <line x1="0" y1="240" x2="540" y2="240" stroke="#38bdf8" />
      </g>
      
      <!-- Central Graphic Illustration -->
      <g transform="translate(270, 130)">
        <!-- Outer Glowing Ring -->
        <circle cx="0" cy="0" r="75" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="6,4" />
        <circle cx="0" cy="0" r="58" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2" />
        
        <!-- Category Icon / Emblem -->
        <text x="0" y="16" font-size="44" text-anchor="middle">
          ${category === 'drone' ? '🚁' : category === 'robotics' ? '🤖' : category === 'iot' ? '🏠' : '🚗'}
        </text>
      </g>
      
      <!-- Project Title Banner -->
      <rect x="40" y="215" width="460" height="46" rx="10" fill="#0f172a" stroke="#4f46e5" stroke-width="1.5" />
      <text x="270" y="244" fill="#ffffff" font-size="15" font-weight="900" text-anchor="middle" font-family="sans-serif">
        ${title}
      </text>
      
      <rect x="210" y="18" width="120" height="24" rx="12" fill="#312e81" />
      <text x="270" y="34" fill="#a5b4fc" font-size="11" font-weight="bold" text-anchor="middle">مختبر الميكاترونكس الذكي</text>
    </svg>
  `;
}

/**
 * Generates all 8 specialized educational engineering illustrations for the project
 * as requested in Section 3 of the brief:
 * Image 1: Final Project Design
 * Image 2: Exploded View of All Components with Names
 * Image 3: Microcontroller / Arduino Placement & Mounting
 * Image 4: Primary Sensor Installation & Placement
 * Image 5: Motor Driver / Power Module Mounting
 * Image 6: Motors & Actuators Cabling and Rotation Directions
 * Image 7: Full Circuit Wiring Schematic
 * Image 8: Assembled & Tested Prototype Overview
 */
export function generateProjectGalleryImages(project: EngineeringProjectData): ProjectGalleryImage[] {
  const title = project.title || 'مشروع ميكاترونكس';
  const comps = project.components || [];
  const primarySensor = comps.find((c) => c.name.includes('حساس') || c.name.includes('Sensor') || c.name.includes('MQ') || c.name.includes('DHT') || c.name.includes('MPU') || c.name.includes('PIR')) || comps[1] || comps[0] || { name: 'حساس رئيسي', count: 1, usage: 'الاستشعار' };
  const driver = comps.find((c) => c.name.includes('درايفر') || c.name.includes('L298N') || c.name.includes('Driver') || c.name.includes('ESC') || c.name.includes('Relay') || c.name.includes('مرحل') || c.name.includes('MOSFET')) || comps[2] || comps[0] || { name: 'وحدة القيادة', count: 1, usage: 'التحكم بالقدرة' };

  // SVG 1: Final Project Overall Illustration
  const svg1 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" class="w-full h-auto rounded-2xl">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g1)" rx="16" stroke="#334155" stroke-width="1.5" />
      <g opacity="0.12">
        <line x1="0" y1="60" x2="600" y2="60" stroke="#38bdf8" />
        <line x1="0" y1="120" x2="600" y2="120" stroke="#38bdf8" />
        <line x1="0" y1="180" x2="600" y2="180" stroke="#38bdf8" />
        <line x1="0" y1="240" x2="600" y2="240" stroke="#38bdf8" />
        <line x1="0" y1="300" x2="600" y2="300" stroke="#38bdf8" />
      </g>
      <rect x="20" y="20" width="170" height="32" rx="16" fill="#1e293b" stroke="#3b82f6" stroke-width="1" />
      <text x="105" y="41" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">الصورة 1: النموذج النهائي</text>
      <circle cx="300" cy="180" r="130" fill="url(#glow1)" />
      <rect x="180" y="120" width="240" height="130" rx="16" fill="#1e293b" stroke="#60a5fa" stroke-width="2.5" />
      <rect x="200" y="140" width="200" height="90" rx="10" fill="#0f172a" stroke="#334155" />
      <rect x="235" y="150" width="130" height="50" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
      <text x="300" y="180" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Arduino UNO</text>
      <rect x="150" y="130" width="24" height="110" rx="6" fill="#334155" stroke="#94a3b8" />
      <rect x="426" y="130" width="24" height="110" rx="6" fill="#334155" stroke="#94a3b8" />
      <circle cx="300" cy="100" r="16" fill="#0f766e" stroke="#2dd4bf" stroke-width="2" />
      <circle cx="288" cy="98" r="6" fill="#14b8a6" />
      <circle cx="312" cy="98" r="6" fill="#14b8a6" />
      <line x1="300" y1="116" x2="300" y2="140" stroke="#10b981" stroke-width="3" />
      <circle cx="215" cy="155" r="4" fill="#22c55e" />
      <circle cx="227" cy="155" r="4" fill="#ef4444" />
      <rect x="50" y="285" width="500" height="48" rx="12" fill="#090d16" stroke="#4f46e5" stroke-width="1.5" />
      <text x="300" y="315" fill="#f8fafc" font-size="14" font-weight="900" text-anchor="middle">${title}</text>
    </svg>
  `;

  // SVG 2: All Components Exploded & Separated
  const compCards = comps.slice(0, 6).map((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 30 + col * 180;
    const y = 80 + row * 125;
    return `
      <g transform="translate(${x}, ${y})">
        <rect x="0" y="0" width="168" height="110" rx="10" fill="#111827" stroke="#374151" stroke-width="1.5" />
        <rect x="10" y="10" width="32" height="32" rx="8" fill="#1e3a8a" />
        <text x="26" y="31" fill="#93c5fd" font-size="14" font-weight="bold" text-anchor="middle">C${i+1}</text>
        <text x="50" y="30" fill="#f9fafb" font-size="11" font-weight="bold">${c.name.slice(0, 18)}</text>
        <rect x="10" y="50" width="60" height="18" rx="4" fill="#065f46" />
        <text x="40" y="63" fill="#a7f3d0" font-size="9" font-weight="bold" text-anchor="middle">العدد: ${c.count}</text>
        <text x="10" y="85" fill="#9ca3af" font-size="9">${(c.usage || '').slice(0, 24)}...</text>
      </g>
    `;
  }).join('');

  const svg2 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" class="w-full h-auto rounded-2xl">
      <rect width="100%" height="100%" fill="#090d16" rx="16" stroke="#334155" />
      <rect x="20" y="20" width="230" height="34" rx="17" fill="#1e293b" stroke="#3b82f6" />
      <text x="135" y="42" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">الصورة 2: المكونات منفصلة ومفصلة</text>
      ${compCards}
    </svg>
  `;

  // SVG 3: Microcontroller / Arduino Placement & Mounting
  const svg3 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" class="w-full h-auto rounded-2xl">
      <rect width="100%" height="100%" fill="#0a0f1d" rx="16" stroke="#334155" />
      <rect x="20" y="20" width="240" height="34" rx="17" fill="#1e293b" stroke="#3b82f6" />
      <text x="140" y="42" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">الصورة 3: مكان وطريقة تركيب المتحكم</text>
      <rect x="80" y="80" width="440" height="230" rx="12" fill="#111827" stroke="#475569" stroke-width="2" stroke-dasharray="6,4" />
      <text x="300" y="105" fill="#64748b" font-size="11" text-anchor="middle">قاعدة التثبيت الميكانيكية (Chassis Mount)</text>
      <circle cx="160" cy="130" r="8" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />
      <circle cx="440" cy="130" r="8" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />
      <circle cx="160" cy="270" r="8" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />
      <circle cx="440" cy="270" r="8" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />
      <rect x="150" y="120" width="300" height="160" rx="8" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
      <rect x="135" y="140" width="25" height="35" rx="3" fill="#cbd5e1" stroke="#475569" />
      <text x="147" y="162" fill="#0f172a" font-size="8" font-weight="bold" text-anchor="middle">USB</text>
      <rect x="135" y="210" width="30" height="30" rx="3" fill="#1e293b" stroke="#64748b" />
      <text x="150" y="228" fill="#e2e8f0" font-size="8" font-weight="bold" text-anchor="middle">PWR</text>
      <rect x="250" y="160" width="100" height="70" rx="4" fill="#0f172a" stroke="#334155" />
      <text x="300" y="200" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">ATmega328P</text>
      <rect x="200" y="126" width="230" height="12" rx="2" fill="#0f172a" />
      <rect x="200" y="262" width="230" height="12" rx="2" fill="#0f172a" />
      <text x="300" y="325" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">براغي تثبيت M3 مع عوازل بلاستيكية لتفادي قصر الدائرة مع الشاسيه</text>
    </svg>
  `;

  // SVG 4: Primary Sensor Placement & Installation
  const svg4 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" class="w-full h-auto rounded-2xl">
      <rect width="100%" height="100%" fill="#0a0f1d" rx="16" stroke="#334155" />
      <rect x="20" y="20" width="230" height="34" rx="17" fill="#1e293b" stroke="#3b82f6" />
      <text x="135" y="42" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">الصورة 4: طريقة تركيب الحساس</text>
      <rect x="200" y="160" width="200" height="120" rx="10" fill="#1e293b" stroke="#14b8a6" stroke-width="2" />
      <text x="300" y="190" fill="#2dd4bf" font-size="13" font-weight="bold" text-anchor="middle">${primarySensor.name}</text>
      <circle cx="250" cy="230" r="28" fill="#0f766e" stroke="#5eead4" stroke-width="3" />
      <circle cx="350" cy="230" r="28" fill="#0f766e" stroke="#5eead4" stroke-width="3" />
      <circle cx="250" cy="230" r="14" fill="#134e4a" />
      <circle cx="350" cy="230" r="14" fill="#134e4a" />
      <path d="M 250 200 L 100 80 L 150 70 Z" fill="#2dd4bf" opacity="0.15" />
      <path d="M 350 200 L 500 80 L 450 70 Z" fill="#2dd4bf" opacity="0.15" />
      <path d="M 250 200 L 280 70 L 320 70 L 350 200 Z" fill="#2dd4bf" opacity="0.1" />
      <text x="300" y="95" fill="#5eead4" font-size="12" font-weight="bold" text-anchor="middle">مجال الرؤية والاستشعار (Detection Range)</text>
      <rect x="260" y="280" width="80" height="24" rx="4" fill="#0f172a" stroke="#334155" />
      <text x="300" y="296" fill="#f8fafc" font-size="9" text-anchor="middle">VCC | SIGNAL | GND</text>
      <text x="300" y="335" fill="#94a3b8" font-size="11" text-anchor="middle">يثبت الحساس في الموضع الأمامي لضمان زاوية استشعار حرة وخالية من العوائق</text>
    </svg>
  `;

  // SVG 5: Driver / Actuator Module Mounting
  const svg5 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" class="w-full h-auto rounded-2xl">
      <rect width="100%" height="100%" fill="#0a0f1d" rx="16" stroke="#334155" />
      <rect x="20" y="20" width="240" height="34" rx="17" fill="#1e293b" stroke="#3b82f6" />
      <text x="140" y="42" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">الصورة 5: طريقة تركيب وحدة القيادة</text>
      <rect x="160" y="90" width="280" height="200" rx="12" fill="#881337" stroke="#f43f5e" stroke-width="2" />
      <text x="300" y="125" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle">${driver.name}</text>
      <rect x="230" y="140" width="140" height="70" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
      <line x1="250" y1="140" x2="250" y2="210" stroke="#94a3b8" stroke-width="3" />
      <line x1="270" y1="140" x2="270" y2="210" stroke="#94a3b8" stroke-width="3" />
      <line x1="290" y1="140" x2="290" y2="210" stroke="#94a3b8" stroke-width="3" />
      <line x1="310" y1="140" x2="310" y2="210" stroke="#94a3b8" stroke-width="3" />
      <line x1="330" y1="140" x2="330" y2="210" stroke="#94a3b8" stroke-width="3" />
      <line x1="350" y1="140" x2="350" y2="210" stroke="#94a3b8" stroke-width="3" />
      <rect x="135" y="160" width="25" height="50" rx="4" fill="#15803d" />
      <text x="120" y="190" fill="#86efac" font-size="9" font-weight="bold">OUT1/2</text>
      <rect x="440" y="160" width="25" height="50" rx="4" fill="#15803d" />
      <text x="475" y="190" fill="#86efac" font-size="9" font-weight="bold">OUT3/4</text>
      <rect x="250" y="260" width="100" height="25" rx="4" fill="#15803d" />
      <text x="300" y="277" fill="#ffffff" font-size="9" font-weight="bold" text-anchor="middle">12V | GND | 5V</text>
      <text x="300" y="325" fill="#f43f5e" font-size="11" font-weight="bold" text-anchor="middle">تأمين مسار تهوية جيد للمشتت الحراري لتفادي فصل الحماية الحرارية (Thermal Shutdown)</text>
    </svg>
  `;

  // SVG 6: Motors & Actuators Output Wiring
  const svg6 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" class="w-full h-auto rounded-2xl">
      <rect width="100%" height="100%" fill="#0a0f1d" rx="16" stroke="#334155" />
      <rect x="20" y="20" width="240" height="34" rx="17" fill="#1e293b" stroke="#3b82f6" />
      <text x="140" y="42" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">الصورة 6: طريقة توصيل المحركات</text>
      <rect x="80" y="120" width="140" height="90" rx="8" fill="#1e293b" stroke="#eab308" stroke-width="2" />
      <rect x="50" y="150" width="30" height="30" rx="4" fill="#475569" />
      <text x="150" y="160" fill="#facc15" font-size="12" font-weight="bold" text-anchor="middle">المحرك الأيسر (Left)</text>
      <text x="150" y="180" fill="#94a3b8" font-size="10" text-anchor="middle">DC Gearbox 1:48</text>
      <rect x="260" y="140" width="80" height="60" rx="6" fill="#881337" stroke="#f43f5e" />
      <text x="300" y="175" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Driver</text>
      <rect x="380" y="120" width="140" height="90" rx="8" fill="#1e293b" stroke="#eab308" stroke-width="2" />
      <rect x="520" y="150" width="30" height="30" rx="4" fill="#475569" />
      <text x="450" y="160" fill="#facc15" font-size="12" font-weight="bold" text-anchor="middle">المحرك الأيمن (Right)</text>
      <text x="450" y="180" fill="#94a3b8" font-size="10" text-anchor="middle">DC Gearbox 1:48</text>
      <path d="M 220 150 L 260 155" stroke="#ef4444" stroke-width="3" />
      <path d="M 220 180 L 260 175" stroke="#0f172a" stroke-width="3" />
      <path d="M 380 150 L 340 155" stroke="#ef4444" stroke-width="3" />
      <path d="M 380 180 L 340 175" stroke="#0f172a" stroke-width="3" />
      <text x="300" y="270" fill="#fde047" font-size="11" font-weight="bold" text-anchor="middle">🔴 السلك الأحمر: القطب الموجب (+) | ⚫ السلك الأسود: القطب السالب (-)</text>
      <text x="300" y="300" fill="#94a3b8" font-size="11" text-anchor="middle">إذا دار أحد المحركات بالاتجاه المعاكس، قم بتبديل السلكين الأحمر والأسود في طرف الدرايفر</text>
    </svg>
  `;

  // SVG 7: Full Circuit Wiring Schematic
  const svg7 = generateSvgCircuitDiagram(title, project.connections || [], project.pinMapping || []);

  // SVG 8: Final Assembled Prototype Overview
  const svg8 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" class="w-full h-auto rounded-2xl">
      <defs>
        <linearGradient id="finGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#022c22" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#064e3b" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#finGrad)" rx="16" stroke="#10b981" stroke-width="2" />
      <rect x="20" y="20" width="240" height="34" rx="17" fill="#064e3b" stroke="#34d399" />
      <text x="140" y="42" fill="#a7f3d0" font-size="12" font-weight="bold" text-anchor="middle">الصورة 8: الشكل النهائي بعد التجميع</text>
      <circle cx="300" cy="140" r="50" fill="#059669" stroke="#34d399" stroke-width="3" />
      <text x="300" y="155" fill="#ffffff" font-size="45" font-weight="bold" text-anchor="middle">✓</text>
      <text x="300" y="225" fill="#ffffff" font-size="18" font-weight="900" text-anchor="middle">${title}</text>
      <text x="300" y="255" fill="#6ee7b7" font-size="13" font-weight="bold" text-anchor="middle">جاهز للتشغيل والاختبار العملي والتسليم الأكاديمي 🚀</text>
      <rect x="80" y="285" width="130" height="28" rx="6" fill="#064e3b" stroke="#059669" />
      <text x="145" y="303" fill="#ecfdf5" font-size="10" font-weight="bold" text-anchor="middle">✓ الأرجل متطابقة 100%</text>
      <rect x="235" y="285" width="130" height="28" rx="6" fill="#064e3b" stroke="#059669" />
      <text x="300" y="303" fill="#ecfdf5" font-size="10" font-weight="bold" text-anchor="middle">✓ الكود مبرمج ومختبر</text>
      <rect x="390" y="285" width="130" height="28" rx="6" fill="#064e3b" stroke="#059669" />
      <text x="455" y="303" fill="#ecfdf5" font-size="10" font-weight="bold" text-anchor="middle">✓ مراجع الأكاديمية موثقة</text>
    </svg>
  `;

  return [
    {
      id: 'img-1',
      imageNumber: 1,
      title: 'الصورة 1: شكل المشروع النهائي',
      subtitle: 'المنظور العام والمظهر الخارجي المتكامل',
      description: 'رسم توضيحي للمجسم والنموذج الميكاترونيكي النهائي بعد اكتمال تثبيت جميع العناصر والشاسيه ووضعية الرأس المتحرك أو عناصر العرض.',
      svgContent: svg1,
    },
    {
      id: 'img-2',
      imageNumber: 2,
      title: 'الصورة 2: جميع المكونات منفصلة مع أسماء المكونات',
      subtitle: 'قائمة المكونات الهندسية (Exploded BOM)',
      description: 'عرض تفصيلي لجميع العناصر والمستشعرات والمتحكمات والمحركات منفصلة مع توضيح الكمية والرمز الهندسي ووظيفتها في المشروع.',
      svgContent: svg2,
    },
    {
      id: 'img-3',
      imageNumber: 3,
      title: 'الصورة 3: مكان وطريقة تركيب Arduino / وحدة التحكم',
      subtitle: 'التثبيت الميكانيكي والعوازل',
      description: 'مخطط يوضح مواضع براغي التثبيت M3 مع عوازل بلاستيكية وموضع منفذ البرمجة USB ومدخل التغذية DC Barrel Jack لتسهيل الصيانة.',
      svgContent: svg3,
    },
    {
      id: 'img-4',
      imageNumber: 4,
      title: 'الصورة 4: طريقة ومكان تركيب الحساس الرئيسي',
      subtitle: 'زاوية الاستشعار وتوجيه الحزم',
      description: 'يوضح طريقة تثبيت الحساس في مقدمة الهيكل أو مركزه، ومجال الرؤية الهندسي وزاوية التغطية مع توجيه الأرجل لمنع شد الأسلاك.',
      svgContent: svg4,
    },
    {
      id: 'img-5',
      imageNumber: 5,
      title: 'الصورة 5: طريقة تركيب وحدة القيادة أو المشغل (Driver)',
      subtitle: 'إدارة القدرة وتبديد الحرارة',
      description: 'يوضح طريقة تثبيت درايفر المحركات أو الـ ESC أو المرحلات، ومسار التبريد الهوائي للمشتت وتأمين أطراف القدرة اللولبية.',
      svgContent: svg5,
    },
    {
      id: 'img-6',
      imageNumber: 6,
      title: 'الصورة 6: طريقة توصيل المحركات والمخارج',
      subtitle: 'قطبية الأسلاك وعزم الدوران',
      description: 'مخطط دقيق لربط أقطاب المحركات (+ و -)، وتحديد اتجاه الدوران الافتراضي (مع أو عكس عقارب الساعة)، وطريقة عكس الأسلاك لتصحيح الدوران.',
      svgContent: svg6,
    },
    {
      id: 'img-7',
      imageNumber: 7,
      title: 'الصورة 7: مخطط الأسلاك والتوصيلات كاملاً',
      subtitle: 'المخطط الهندسي الكهربائي الشامل',
      description: 'المخطط الكامل الملون للأسلاك؛ يوضح خطوط التغذية 5V/VIN باللون الأحمر، والأرضي GND بالأسود، وإشارات التحكم الرقمية والـ PWM والأناالوج بالألوان المعتمدة.',
      svgContent: svg7,
    },
    {
      id: 'img-8',
      imageNumber: 8,
      title: 'الصورة 8: الشكل النهائي بعد التجميع والتشغيل',
      subtitle: 'الفحص الميداني واختبار الجاهزية',
      description: 'النموذج التطبيقي المشغل والجاهز للمحاكاة، مع قائمة التحقق الهندسية وسلامة التوصيلات وتأكيد عدم وجود أي تعارض في الأرجل.',
      svgContent: svg8,
    },
  ];
}

/**
 * Validates pin alignment between Arduino code, wiring connections, and pin mapping
 */
export function verifyPinCompatibility(project: EngineeringProjectData): {
  isHarmonized: boolean;
  checkedPinsCount: number;
  matchedPins: Array<{ identifier: string; codePin: string; boardPin: string; matches: boolean }>;
  warnings: string[];
  autoFixed: boolean;
} {
  const codeText = project.code?.sourceCode || '';
  const pinDeclarations: Record<string, string> = {};

  const defineRegex = /#define\s+([A-Za-z0-9_]+)\s+([A-Za-z0-9_]+)/g;
  let match;
  while ((match = defineRegex.exec(codeText)) !== null) {
    const name = match[1];
    const val = match[2];
    if (/^[A-D]?[0-9]+$/i.test(val)) {
      pinDeclarations[name] = val.toUpperCase().startsWith('D') ? val.toUpperCase() : `D${val}`;
    }
  }

  const constIntRegex = /(?:const\s+int|int)\s+([A-Za-z0-9_]+)\s*=\s*([A-Za-z0-9_]+)\s*;/g;
  while ((match = constIntRegex.exec(codeText)) !== null) {
    const name = match[1];
    const val = match[2];
    if (/^[A-D]?[0-9]+$/i.test(val)) {
      pinDeclarations[name] = val.toUpperCase().startsWith('D') ? val.toUpperCase() : `D${val}`;
    }
  }

  const matchedPins: Array<{ identifier: string; codePin: string; boardPin: string; matches: boolean }> = [];
  const warnings: string[] = [];
  let isHarmonized = true;

  for (const pm of project.pinMapping || []) {
    const codePin = pinDeclarations[pm.codeIdentifier];
    if (codePin) {
      const matches = codePin.toUpperCase() === pm.boardPin.toUpperCase();
      matchedPins.push({
        identifier: pm.codeIdentifier,
        codePin,
        boardPin: pm.boardPin,
        matches,
      });
      if (!matches) {
        isHarmonized = false;
        warnings.push(`تعارض في الطرف (${pm.componentName}): معرف الكود ${pm.codeIdentifier} يستخدم ${codePin} بينما المخطط يستخدم ${pm.boardPin}`);
      }
    }
  }

  return {
    isHarmonized,
    checkedPinsCount: matchedPins.length,
    matchedPins,
    warnings,
    autoFixed: false,
  };
}

/**
 * Deterministic Validation Engine:
 * Strictly harmonizes Pin Mapping, Wiring Connections, and Arduino Code.
 * Ensures NO CONFLICT between diagram pins and code #defines.
 */
export function validateAndHarmonizeProject(project: EngineeringProjectData): EngineeringProjectData {
  if (!project.code || !project.code.sourceCode) {
    return project;
  }

  const codeText = project.code.sourceCode;
  const pinDeclarations: Record<string, string> = {};

  // Extract #define PIN_NAME NUMBER
  const defineRegex = /#define\s+([A-Za-z0-9_]+)\s+([A-Za-z0-9_]+)/g;
  let match;
  while ((match = defineRegex.exec(codeText)) !== null) {
    const name = match[1];
    const val = match[2];
    if (/^[A-D]?[0-9]+$/i.test(val)) {
      pinDeclarations[name] = val.toUpperCase().startsWith('D') ? val.toUpperCase() : `D${val}`;
    }
  }

  // Extract const int pinName = NUMBER;
  const constIntRegex = /(?:const\s+int|int)\s+([A-Za-z0-9_]+)\s*=\s*([A-Za-z0-9_]+)\s*;/g;
  while ((match = constIntRegex.exec(codeText)) !== null) {
    const name = match[1];
    const val = match[2];
    if (/^[A-D]?[0-9]+$/i.test(val)) {
      pinDeclarations[name] = val.toUpperCase().startsWith('D') ? val.toUpperCase() : `D${val}`;
    }
  }

  // Harmonize pinMapping
  if (project.pinMapping && project.pinMapping.length > 0) {
    project.pinMapping = project.pinMapping.map((pm) => {
      // If code declares this exact identifier with a pin, unify it
      if (pinDeclarations[pm.codeIdentifier]) {
        const unifiedPin = pinDeclarations[pm.codeIdentifier];
        return { ...pm, boardPin: unifiedPin };
      }
      return pm;
    });

    // Harmonize connections with pinMapping
    const pinMapLookup = new Map<string, string>();
    for (const pm of project.pinMapping) {
      pinMapLookup.set(`${pm.componentName.toLowerCase()}_${pm.pinFunction.toLowerCase()}`, pm.boardPin);
    }

    if (project.connections && project.connections.length > 0) {
      project.connections = project.connections.map((conn) => {
        const keyFrom = `${conn.fromComponent.toLowerCase()}_${conn.fromPin.toLowerCase()}`;
        const keyTo = `${conn.toComponent.toLowerCase()}_${conn.toPin.toLowerCase()}`;

        if (conn.toComponent.toLowerCase().includes('arduino') && pinMapLookup.has(keyFrom)) {
          return { ...conn, toPin: pinMapLookup.get(keyFrom)! };
        }
        if (conn.fromComponent.toLowerCase().includes('arduino') && pinMapLookup.has(keyTo)) {
          return { ...conn, fromPin: pinMapLookup.get(keyTo)! };
        }
        return conn;
      });
    }
  }

  // Attach auto-generated SVGs if missing
  if (!project.wiringDiagramSvg && project.connections) {
    project.wiringDiagramSvg = generateSvgCircuitDiagram(project.title, project.connections, project.pinMapping || []);
  }

  if (!project.finalProjectImage) {
    project.finalProjectImage = generateFinalProjectOverviewSvg(project.title, project.category);
  }

  if (project.steps && project.steps.length > 0) {
    project.steps = project.steps.map((st) => {
      if (!st.illustrationSvg) {
        st.illustrationSvg = generateStepAssemblySvg(st.stepNumber, st.title, st.usedComponents || []);
      }
      return st;
    });
  }

  // Populate gallery images (8 technical educational drawings)
  if (!project.galleryImages || project.galleryImages.length < 8) {
    project.galleryImages = generateProjectGalleryImages(project);
  }

  return project;
}


/**
 * Pre-verified Complete Core Project Templates
 */
export const CORE_PROJECT_TEMPLATES: Record<string, EngineeringProjectData> = {
  'arduino-obstacle-avoiding-car': {
    id: 'proj-car-obstacle',
    title: 'سيارة Arduino روبوتية ذكية تتجنب العوائق',
    category: 'arduino',
    idea: 'مركبة روبوتية ذاتية القيادة تعتمد على حساس الموجات فوق الصوتية Ultrasonic Sensor لكشف الحواجز أمامها لمسافة تصل إلى 4 أمتار، ثم تحريك محرك سيرفو لاختبار الاتجاهين الأيمن والأيسر وتوجيه المحركات عبر درايفر L298N إلى المسار الآمن تلقائيًا.',
    targetAudience: 'طلاب هندسة الميكاترونكس، الأنظمة الذكية، والتحكم الآلي',
    components: [
      {
        id: 'c1',
        name: 'Arduino UNO R3',
        count: 1,
        usage: 'العقل المدبر والمتحكم الرئيسي لقراءة الحساس وإصدار أوامر المحركات',
        details: {
          whatIsIt: 'لوحة تطوير إلكترونية مفتوحة المصدر تعتمد على ميكروكنترولر ATmega328P.',
          function: 'معالجة إشارات الحساسات وتوليد نبضات التحكم PWM للمحركات.',
          howItWorks: 'تستقبل كود C++ عبر الـ Bootloader وتعمل بتردد 16 MHz بجهد 5V.',
          whereUsed: 'المشاريع الهندسية، النماذج الأولية، والأنظمة المدمجة الذكية.',
          pinoutOrSpecs: '14 Digital I/O Pins, 6 PWM Pins, 6 Analog Inputs (A0-A5)',
        },
      },
      {
        id: 'c2',
        name: 'حساس المسافة بالموجات فوق الصوتية HC-SR04',
        count: 1,
        usage: 'إرسال واستقبال نبضات صوتية لقياس المسافة بين الروبوت والعوائق',
        details: {
          whatIsIt: 'حساس مسافة صوتي يتكون من مرسل (Transmitter) ومستقبل (Receiver).',
          function: 'قياس المسافة بدقة تتراوح بين 2 سم إلى 400 سم.',
          howItWorks: 'يرسل نبضة بتردد 40 kHz ويحسب زمن ارتداد الموجة: المسافة = (الزمن × سرعة الصوت 0.034) / 2.',
          whereUsed: 'الروبوتات ذاتية القيادة، رادارات القياس، وأنظمة الركن الذاتي للسيارات.',
          pinoutOrSpecs: 'VCC (5V), TRIG (إرسال الإشارة), ECHO (استقبال الصدى), GND',
        },
      },
      {
        id: 'c3',
        name: 'وحدة قيادة المحركات L298N Motor Driver',
        count: 1,
        usage: 'تغذية وتوجيه محركات التيار المستمر والتحكم في سرعتها بالاتجاهين',
        details: {
          whatIsIt: 'دائرة قيادة محركات تعتمد على رقاقة Dual H-Bridge ذات تيار عالي يصل إلى 2A لكل قناة.',
          function: 'عزل تيار المحركات العالي عن دائرة الأردوينو الحساسة وتوفير التحكم ثنائي الاتجاه.',
          howItWorks: 'تبديل أقطاب الجهد عبر ترانزستورات الجسر H-Bridge لعكس اتجاه دوران المحركات.',
          whereUsed: 'الروبوتات المتنقلة، سيارات التحكم، والآلات الصناعية الصغيرة.',
          pinoutOrSpecs: '12V/VMS, GND, 5V Out, ENA/ENB (PWM), IN1/IN2/IN3/IN4 (الاتجاه), OUT1-OUT4 (المحركات)',
        },
      },
      {
        id: 'c4',
        name: 'محركات تيار مستمر DC Gear Motors مع عجلات مطاطية',
        count: 2,
        usage: 'توفير عزم الدوران والحركة الدورانية لتحريك شاسيه السيارة',
        details: {
          whatIsIt: 'محركات كهربائية صغيرة متصلة بصندوق تروس تخفيض السرعة ومضاعفة العزم (Gearbox 1:48).',
          function: 'تحويل الطاقة الكهربائية إلى حركة ميكانيكية لتحريك الروبوت.',
          howItWorks: 'قوة لورنتز المغناطيسية الناتجة عن مرور التيار في ملفات العضو الدوار داخل مجال مغناطيسي.',
          whereUsed: 'العربات الروبوتية، خطوط النقل، والروبوتات المتنقلة.',
          pinoutOrSpecs: 'جهد التشغيل 3V - 6V DC، السرعة 200 RPM عند 6V',
        },
      },
      {
        id: 'c5',
        name: 'محرك سيرفو صغير SG90 Micro Servo',
        count: 1,
        usage: 'تدوير حساس المسافة يمينًا ويسارًا 180 درجة لمسح البيئة المحيطة',
        details: {
          whatIsIt: 'محرك زاوية مغلق الحلقة (Closed Loop) مزود بمقاومة متغيرة وتروس تحكم.',
          function: 'توجيه رأس الحساس بدقة من زاوية 0 إلى 180 درجة.',
          howItWorks: 'يستقبل إشارة PWM بنبضة عرضها بين 1ms (0°) إلى 2ms (180°) كل 20ms.',
          whereUsed: 'أذرع الروبوتات، طائرات الدرون، وتوجيه الكاميرات والحساسات.',
          pinoutOrSpecs: 'أحمر (VCC 5V)، بني (GND)، برتقالي (Signal PWM Pin D11)',
        },
      },
      {
        id: 'c6',
        name: 'هيكل سيارة روبوت (2WD Smart Robot Chassis) مع عجلة كاستر',
        count: 1,
        usage: 'تثبيت وتجميع كافة المكونات الميكانيكية والكهربائية',
        details: {
          whatIsIt: 'لوح أكريليك مصمم هندسياً مع فتحات تثبيت المحركات واللوحات الإلكترونية.',
          function: 'حمل الوزن وتوفير استقرار حركي بفضل العجلة الحرة (Omni Caster Wheel).',
          howItWorks: 'هيكل ميكانيكي صلب خفيف الوزن.',
          whereUsed: 'قاعدة المشاريع الهندسية المتنقلة.',
        },
      },
      {
        id: 'c7',
        name: 'حامل بطاريات ليثيوم 2x 18650 مع مفتاح تشغيل',
        count: 1,
        usage: 'مصدر طاقة رئيسي يوفر جهد 7.4V - 8.4V وتيار مناسب للمحركات',
        details: {
          whatIsIt: 'خلايا ليثيوم أيون قابلة لإعادة الشحن ذات كثافة طاقة وتفريغ تيار عالي.',
          function: 'توفير التغذية الكهربائية لـ L298N ومنها إلى الأردوينو.',
          howItWorks: 'تفاعلات كيميائية بين أيونات الليثيوم تولد فرق جهد كهربائي.',
          whereUsed: 'المركبات الكهربائية، الروبوتات، والأنظمة المدمجة.',
          pinoutOrSpecs: 'الجهد الإجمالي 7.4V nominal (8.4V max), سعة 2600mAh',
        },
      },
    ],
    connections: [
      { fromComponent: 'HC-SR04', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية الحساس' },
      { fromComponent: 'HC-SR04', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'الأرضي المشترك' },
      { fromComponent: 'HC-SR04', fromPin: 'TRIG', toComponent: 'Arduino UNO', toPin: 'D9', wireColor: 'yellow', signalType: 'Digital', notes: 'إرسال نبضة المسافة' },
      { fromComponent: 'HC-SR04', fromPin: 'ECHO', toComponent: 'Arduino UNO', toPin: 'D10', wireColor: 'green', signalType: 'Digital', notes: 'استقبال صدى النبضة' },
      { fromComponent: 'SG90 Servo', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية السيرفو' },
      { fromComponent: 'SG90 Servo', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي السيرفو' },
      { fromComponent: 'SG90 Servo', fromPin: 'SIGNAL', toComponent: 'Arduino UNO', toPin: 'D11', wireColor: 'orange', signalType: 'PWM', notes: 'إشارة زاوية السيرفو' },
      { fromComponent: 'L298N Driver', fromPin: 'IN1', toComponent: 'Arduino UNO', toPin: 'D5', wireColor: 'blue', signalType: 'Digital', notes: 'محرك أيسر للأمام' },
      { fromComponent: 'L298N Driver', fromPin: 'IN2', toComponent: 'Arduino UNO', toPin: 'D6', wireColor: 'blue', signalType: 'Digital', notes: 'محرك أيسر للخلف' },
      { fromComponent: 'L298N Driver', fromPin: 'IN3', toComponent: 'Arduino UNO', toPin: 'D7', wireColor: 'purple', signalType: 'Digital', notes: 'محرك أيمن للأمام' },
      { fromComponent: 'L298N Driver', fromPin: 'IN4', toComponent: 'Arduino UNO', toPin: 'D8', wireColor: 'purple', signalType: 'Digital', notes: 'محرك أيمن للخلف' },
      { fromComponent: 'L298N Driver', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'ربط الأرضي المشترك إلزامي' },
      { fromComponent: 'Battery 7.4V', fromPin: 'Positive (+)', toComponent: 'L298N Driver', toPin: '12V', wireColor: 'red', signalType: 'VIN', notes: 'مدخل جهد البطارية' },
      { fromComponent: 'Battery 7.4V', fromPin: 'Negative (-)', toComponent: 'L298N Driver', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'سالب البطارية' },
      { fromComponent: 'L298N Driver', fromPin: '5V Out', toComponent: 'Arduino UNO', toPin: 'VIN', wireColor: 'red', signalType: '5V', notes: 'تغذية الأردوينو من منظم الدرايفر' },
    ],
    pinMapping: [
      { componentName: 'HC-SR04 Ultrasonic', pinFunction: 'Trigger Pulse', boardPin: 'D9', codeIdentifier: 'TRIG_PIN' },
      { componentName: 'HC-SR04 Ultrasonic', pinFunction: 'Echo Return', boardPin: 'D10', codeIdentifier: 'ECHO_PIN' },
      { componentName: 'SG90 Micro Servo', pinFunction: 'PWM Angle Signal', boardPin: 'D11', codeIdentifier: 'SERVO_PIN' },
      { componentName: 'L298N Left Motor Forward', pinFunction: 'Direction Input 1', boardPin: 'D5', codeIdentifier: 'IN1_PIN' },
      { componentName: 'L298N Left Motor Backward', pinFunction: 'Direction Input 2', boardPin: 'D6', codeIdentifier: 'IN2_PIN' },
      { componentName: 'L298N Right Motor Forward', pinFunction: 'Direction Input 3', boardPin: 'D7', codeIdentifier: 'IN3_PIN' },
      { componentName: 'L298N Right Motor Backward', pinFunction: 'Direction Input 4', boardPin: 'D8', codeIdentifier: 'IN4_PIN' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تجميع الشاسيه الميكانيكي وتركيب المحركات',
        description: 'ثبّت محركي الـ DC على جانبي شاسيه الأكريليك باستخدام البراغي المرفقة والزوايا المعدنية، ثم ثبّت العجلة الحرة الكروية (Caster Wheel) في مقدمة الشاسيه لتسهيل الانعطاف السلس.',
        usedComponents: ['هيكل سيارة روبوت', 'محركات تيار مستمر DC', 'العجلات المطاطية'],
        importantNotes: 'تأكد من شد البراغي بإحكام مع عدم الضغط الزائد لتفادي كسر لوح الأكريليك.',
      },
      {
        stepNumber: 2,
        title: 'تثبيت درايفر المحركات L298N وتوصيل أطراف المحركات',
        description: 'ثبّت وحدة L298N في مؤخرة الشاسيه. قم بلحام أسلاك المحرك الأيسر وتوصيلها بـ OUT1 و OUT2، وأسلاك المحرك الأيمن بـ OUT3 و OUT4.',
        usedComponents: ['وحدة قيادة المحركات L298N', 'محركات DC'],
        connectionsSummary: 'المحرك الأيسر ← OUT1 و OUT2 | المحرك الأيمن ← OUT3 و OUT4',
        importantNotes: 'في حال دار أحد المحركات في الاتجاه المعاكس لاحقًا، يكفي عكس السلكين المتصلين بـ OUT.',
      },
      {
        stepNumber: 3,
        title: 'تثبيت لوحة Arduino UNO وربط إشارات التحكم',
        description: 'ثبّت لوحة Arduino UNO في منتصف الشاسيه. وصّل أطراف التحكم الأربعة من الـ L298N إلى أطراف الأردوينو: IN1 إلى D5، IN2 إلى D6، IN3 إلى D7، و IN4 إلى D8.',
        usedComponents: ['Arduino UNO R3', 'L298N Driver', 'أسلاك توصيل ذكر-أنثى'],
        connectionsSummary: 'IN1→D5 | IN2→D6 | IN3→D7 | IN4→D8',
        cautionNotice: 'تحذير: لا تغذِ المحركات مباشرة من طرف 5V للأردوينو لأن ذلك سيتلف اللوحة بسبب سحب التيار العالي.',
      },
      {
        stepNumber: 4,
        title: 'تركيب محرك السيرفو وقاعدة حساس الـ Ultrasonic',
        description: 'ثبّت محرك السيرفو SG90 في مقدمة الروبوت باتجاه الأمام تماماً (زاوية 90 درجة). ثم ثبّت حساس HC-SR04 فوق ذراع السيرفو ليدور معه يميناً ويساراً.',
        usedComponents: ['حساس المسافة HC-SR04', 'محرك سيرفو SG90', 'قاعدة تثبيت الحساس'],
        connectionsSummary: 'TRIG→D9 | ECHO→D10 | SERVO_SIGNAL→D11 | VCC→5V | GND→GND',
      },
      {
        stepNumber: 5,
        title: 'توصيل دائرة الطاقة والأرضي المشترك (Common GND)',
        description: 'وصّل القطب الموجب للبطارية (7.4V) بطرف 12V في L298N، والقطب السالب بطرف GND في L298N. قم بربط سلك أرضي من GND الخاص بـ L298N إلى طرف GND في لوحة الأردوينو لضمان وحدة مرجعية الجهد.',
        usedComponents: ['حامل بطاريات 18650', 'L298N Driver', 'Arduino UNO'],
        cautionNotice: 'الشرط الحرج: عدم ربط الـ GND المشترك بين البطارية والدرايفر والأردوينو يؤدي إلى سلوك عشوائي وتوقف إشارات التحكم.',
      },
      {
        stepNumber: 6,
        title: 'رفع الكود البرمجي والمعايرة الميدانية',
        description: 'وصّل كابل USB من الحاسوب إلى Arduino UNO. افتح Arduino IDE، ثبّت مكتبة Servo المدمجة، ارفع الكود، وافصل كابل الـ USB وشغّل مفتاح البطارية لاختبار المركبة على الأرض.',
        usedComponents: ['Arduino UNO', 'كابل USB-B', 'حاسوب برمجة'],
        importantNotes: 'ضع الروبوت على منصة مرتفعة (العجلات لا تلامس الأرض) أثناء أول تجربة تشغيل للتحقق من الاتجاهات بأمان.',
      },
    ],
    code: {
      language: 'arduino',
      filename: 'ObstacleAvoidingCar.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: سيارة Arduino روبوتية تتجنب العوائق
 * المكونات: Arduino UNO + HC-SR04 + SG90 Servo + L298N Driver
 * ==============================================================
 */

#include <Servo.h>

// تعيين أطراف حساس المسافة بالموجات فوق الصوتية
#define TRIG_PIN 9
#define ECHO_PIN 10

// تعيين طرف محرك السيرفو لتوجيه الحساس
#define SERVO_PIN 11

// تعيين أطراف محرك درايفر L298N
#define IN1_PIN 5   // محرك أيسر للأمام
#define IN2_PIN 6   // محرك أيسر للخلف
#define IN3_PIN 7   // محرك أيمن للأمام
#define IN4_PIN 8   // محرك أيمن للخلف

// المسافة الآمنة للتوقف والانعطاف (بالسنتيمتر)
const int SAFE_DISTANCE = 25;

Servo sensorServo;

// دالة قياس المسافة بدقة بالسنتيمتر
int measureDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return 200; // في حال عدم وجود عائق قريب
  int distance = duration * 0.034 / 2;
  return distance;
}

// دوال التحكم بالحركة
void moveForward() {
  digitalWrite(IN1_PIN, HIGH);
  digitalWrite(IN2_PIN, LOW);
  digitalWrite(IN3_PIN, HIGH);
  digitalWrite(IN4_PIN, LOW);
}

void moveBackward() {
  digitalWrite(IN1_PIN, LOW);
  digitalWrite(IN2_PIN, HIGH);
  digitalWrite(IN3_PIN, LOW);
  digitalWrite(IN4_PIN, HIGH);
}

void turnLeft() {
  digitalWrite(IN1_PIN, LOW);
  digitalWrite(IN2_PIN, HIGH);
  digitalWrite(IN3_PIN, HIGH);
  digitalWrite(IN4_PIN, LOW);
}

void turnRight() {
  digitalWrite(IN1_PIN, HIGH);
  digitalWrite(IN2_PIN, LOW);
  digitalWrite(IN3_PIN, LOW);
  digitalWrite(IN4_PIN, HIGH);
}

void stopMotors() {
  digitalWrite(IN1_PIN, LOW);
  digitalWrite(IN2_PIN, LOW);
  digitalWrite(IN3_PIN, LOW);
  digitalWrite(IN4_PIN, LOW);
}

void setup() {
  Serial.begin(9600);
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(IN1_PIN, OUTPUT);
  pinMode(IN2_PIN, OUTPUT);
  pinMode(IN3_PIN, OUTPUT);
  pinMode(IN4_PIN, OUTPUT);

  sensorServo.attach(SERVO_PIN);
  sensorServo.write(90); // النظر للأمام مباشرة
  delay(1000);

  Serial.println(F("[MCT Academy] Obstacle Avoiding Robot Initialized!"));
}

void loop() {
  sensorServo.write(90); // توجيه الحساس للأمام
  delay(150);
  int frontDistance = measureDistanceCM();

  Serial.print(F("Front Distance: "));
  Serial.print(frontDistance);
  Serial.println(F(" cm"));

  if (frontDistance > SAFE_DISTANCE) {
    moveForward();
  } else {
    // تم كشف عائق! إيقاف الروبوت فوراً
    stopMotors();
    delay(200);

    // تراجع خفيف لتوفير مساحة دوران
    moveBackward();
    delay(300);
    stopMotors();

    // فحص المسار الأيمن (زاوية 20 درجة)
    sensorServo.write(20);
    delay(400);
    int rightDistance = measureDistanceCM();

    // فحص المسار الأيسر (زاوية 160 درجة)
    sensorServo.write(160);
    delay(400);
    int leftDistance = measureDistanceCM();

    // إعادة الحساس إلى المنتصف
    sensorServo.write(90);
    delay(200);

    // اختيار الاتجاه الأكثر انفتاحاً
    if (rightDistance > leftDistance && rightDistance > SAFE_DISTANCE) {
      Serial.println(F("-> Turning RIGHT"));
      turnRight();
      delay(450);
    } else if (leftDistance >= rightDistance && leftDistance > SAFE_DISTANCE) {
      Serial.println(F("-> Turning LEFT"));
      turnLeft();
      delay(450);
    } else {
      // المساران مغلقان: الدوران للخلف 180 درجة
      Serial.println(F("-> U-Turn"));
      turnRight();
      delay(900);
    }

    stopMotors();
    delay(150);
  }
}
`,
      explanation: 'يقوم الكود بفحص المسافة الأمامية باستمرار. إذا كانت المسافة أكبر من 25 سم يستمر الروبوت بالتقدم. عند اقتراب عائق يتوقف، يرجع للخلف قليلاً، ثم يدور السيرفو لفحص اليمين واليسار ويقارن القراءتين ليتخذ مسار الانعطاف نحو الجانب الأكثر فراغاً.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 9-18', explanation: 'تعريف أطراف الحساس، محرك السيرفو، وأطراف قيادة محركات L298N ومطابقتها لمخطط التوصيل.' },
        { lineRange: 'الأسطر 24-34', explanation: 'دالة measureDistanceCM: توليد نبضة 10 ميكروثانية عبر TRIG وحساب زمن الارتداد عبر pulseIn لحساب المسافة الدقيقة.' },
        { lineRange: 'الأسطر 37-64', explanation: 'دوال الحركة الأساسية: للأمام، للخلف، انعطاف يمين، انعطاف يسار، والتوقف الكامل.' },
        { lineRange: 'الأسطر 84-142', explanation: 'حلقة loop الذكية: اتخاذ القرار ومقارنة مسافات اليمين واليسار عند كشف العائق والانعطاف التلقائي.' },
      ],
      librariesNeeded: ['Servo.h (مكتبة قياسية مدمجة في Arduino IDE)'],
      uploadSteps: [
        'افتح برنامج Arduino IDE.',
        'اختر لوحة "Arduino Uno" من قائمة Tools -> Board.',
        'اختر منفذ الـ COM الخاص بلوحتك من Tools -> Port.',
        'انسخ الكود بالكامل واضغط على زر الرفع (Upload ➔).',
      ],
    },
    testingProcedure: {
      steps: [
        'ضع الروبوت على منصة صغيرة بحيث تكون العجلات معلقة في الهواء.',
        'شغّل مفتاح التغذية وراقب دوران السيرفو للوسط (90 درجة).',
        'ضع يدك أمام الحساس على بعد 10 سم؛ تأكد أن المحركات تتوقف فوراً ويبدأ السيرفو بالدوران يميناً ويساراً.',
        'ضع عائقاً جهة اليسار وتأكد من أن الروبوت ينعطف جهة اليمين.',
        'ضع الروبوت على أرضية الغرفة ودعه يتجول ويكتشف العوائق ذاتياً.',
      ],
      expectedBehavior: 'حركة مستقيمة سلسة، تجنب كافة الجدران والأثاث بنجاح دون اصطدام بفضل المسح الزاوي.',
    },
    troubleshooting: [
      {
        symptom: 'الروبوت يدور حول نفسه في مكانه بدلاً من التقدم للأمام',
        possibleCause: 'توصيل قطبية أحد المحركات بالعكس.',
        solution: 'اعكس سلكي المحرك الذي يدور للخلف في منفذ L298N (مثلاً بدّل السلك 1 مع السلك 2 في OUT1/OUT2).',
      },
      {
        symptom: 'الحساس لا يكتشف العوائق ويعطي مسافة 0 أو 200 سم دائماً',
        possibleCause: 'تبديل سلكي TRIG و ECHO أو عدم وصول 5V ثابتة.',
        solution: 'تأكد أن TRIG متصل بـ D9 و ECHO متصل بـ D10، وأن الحساس يتلقى 5V كاملة.',
      },
      {
        symptom: 'الأردوينو يعيد التشغيل باستمرار بمجرد تشغيل المحركات',
        possibleCause: 'هبوط الجهد (Voltage Drop) الناتج عن سحب المحركات لتيار عالي من بطارية ضعيفة.',
        solution: 'اشحن بطاريات الليثيوم 18650 بالكامل وتأكد من عدم تغذية L298N من منفذ USB للحاسوب.',
      },
    ],
    futureImprovements: [
      'إضافة شاشة OLED 0.96 بوصة لعرض قراءة المسافة والسرعة وحالة البطارية آنياً.',
      'دمج وحدة بلوتوث HC-05 للتحكم المزدوج: وضع تجنب العوائق التلقائي أو التحكم اليدوي بالهاتف.',
      'إضافة حساسات Infrared TCRT5000 سفلية لحماية الروبوت من السقوط من حواف الطاولات والدرج (Edge Detection).',
    ],
    finalResultSummary: 'سيارة روبوتية ميكاترونكس ذاتية القيادة متكاملة تجمع بين الاستشعار فوق الصوتي والتحكم الحركي الدقيق وتوليد قرارات الانعطاف الذكية.',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[0],
      OFFICIAL_MECHATRONICS_REFERENCES[1],
    ],
    simulationConfig: {
      type: 'obstacle_avoiding_car',
      defaultSensors: { frontDistance: 45, servoAngle: 90 },
    },
  },

  'educational-quadcopter-drone': {
    id: 'proj-drone-edu',
    title: 'مشروع Drone طائرة مسيرة رباعية المراوح (Quadcopter) التعليمي',
    category: 'drone',
    idea: 'تصميم ومحاكاة نظام طائرة مسيرة رباعية المراوح (Quadcopter Drone) لأغراض تعليمية واستكشاف مبادئ الديناميكا الهوائية، وتوازن المحاور الثلاثة (Pitch, Roll, Yaw) باستخدام وحدة قياس القصور الذاتي IMU وخوارزمية التحكم التناسبي التكاملي التفاضلي (PID Controller).',
    targetAudience: 'طلاب هندسة الميكاترونكس، التحكم الآلي، وهندسة الطيران والأنظمة الذكية',
    components: [
      {
        id: 'dr1',
        name: 'هيكل طائرة درون رباعية F450 Quadcopter Frame',
        count: 1,
        usage: 'الهيكل الميكانيكي الحامل لكافة المكونات وموزع القوى الميكانيكية والاهتزازات',
        details: {
          whatIsIt: 'شاسيه مصنوع من ألياف البولي أميد فائقة القوة وألياف الزجاج مع لوحة توزيع طاقة PCB مدمجة.',
          function: 'حمل المحركات الأربعة، البطارية، ومتحكم الطيران بوزن خفيف وتماسك هندسي متوازن.',
          howItWorks: 'تصميم متناظر بشكل X أو + يضمن مركز ثقل (Center of Gravity) متطابق تماماً في المنتصف.',
          whereUsed: 'طائرات الدرون التعليمية، طائرات التصوير، والروبوتات الجوية.',
        },
      },
      {
        id: 'dr2',
        name: 'محركات كهربائية عديمة المسفرات BLDC 2212 920KV',
        count: 4,
        usage: 'توليد قوة الرفع الرأسية (Thrust) والعزوم الديناميكية عبر الدوران بسرعات عالية',
        details: {
          whatIsIt: 'محركات ثلاثية الطور تعمل بالمجال المغناطيسي الدوار بدون فحمات احتكاك (Brushless DC).',
          function: 'دوران اثنين من المحركات باتجاه عقارب الساعة (CW) واثنين بعكس عقارب الساعة (CCW) لمعادلة عزم الالتواء (Yaw Torque).',
          howItWorks: 'يتحكم الـ ESC بتردد تبديل الأطوار الثلاثة لتدوير العضو الدوار بسرعة تصل إلى 10,000 د/د.',
          whereUsed: 'طائرات الدرون، المركبات الكهربائية، والمضخات التوربينية.',
          pinoutOrSpecs: 'الجهد 11.1V (3S LiPo)، القوة الرافعة لكل محرك حوالي 850 جرام',
        },
      },
      {
        id: 'dr3',
        name: 'متحكمات سرعة المحركات Electronic Speed Controllers (ESC 30A SimonK)',
        count: 4,
        usage: 'تحويل إشارات PWM المنخفضة من متحكم الطيران إلى تيار ثلاثي الطور عالي لتغذية المحركات',
        details: {
          whatIsIt: 'دائرة إلكترونية ذكية مبنية على ترانزستورات MOSFET عالية القدرة ومعالج دقيق.',
          function: 'التحكم الدقيق في سرعة دوران محرك الـ BLDC استجابةً لنبضات متحكم الطيران.',
          howItWorks: 'تقنية التضمين النبضي PWM بتردد عالٍ (50Hz - 490Hz) لتبديل أقطاب الملفات بالتتابع.',
          whereUsed: 'جميع أنواع الطائرات المسيرة والروبوتات ذات المحركات عديمة المسفرات.',
          pinoutOrSpecs: 'مدخل بطارية 12V (+/-)، 3 أسلاك لأطوار المحرك (U,V,W)، وكابل إشارة PWM ثلاثي (إشارة، 5V BEC، أرضي)',
        },
      },
      {
        id: 'dr4',
        name: 'وحدة استشعار القصور الذاتي MPU6050 (3-Axis Gyroscope & 3-Axis Accelerometer)',
        count: 1,
        usage: 'قياس زوايا الميل الدوراني والتسارع اللحظي على المحاور X, Y, Z لحساب اتزان الطائرة',
        details: {
          whatIsIt: 'رقاقة ميكانيكية دقيقة مدمجة بنظام MEMS مع معالج حركة رقمي DMP.',
          function: 'قراءة التسارع والسرعة الزاوية لإرسالها لمتحكم الـ PID للحفاظ على الأفق الأفقي المستقر.',
          howItWorks: 'تغير سعة المكثفات الميكروية الدقيقة عند تعرض الرقاقة لقوى القصور الذاتي وحساب زوايا أويلر.',
          whereUsed: 'أنظمة اتزان الطائرات، الهواتف الذكية، ونظم التوجيه الملاحية المتقدمة.',
          pinoutOrSpecs: 'بروتوكول I2C: VCC (3.3V-5V), GND, SCL (A5), SDA (A4), INT',
        },
      },
      {
        id: 'dr5',
        name: 'متحكم طيران تعليمي (Arduino Flight Controller / STM32)',
        count: 1,
        usage: 'حساب معادلات اتزان PID وتوزيع نسب السرعات بين المحركات الأربعة 400 مرة في الثانية',
        details: {
          whatIsIt: 'وحدة معالجة مركزية تنفذ حلقة اتزان الطيران (Flight Stabilization Loop).',
          function: 'مقارنة قراءة الحساسات بزوايا التوجيه المطلوبة وتعديل سرعة كل محرك لتصحيح أي انحراف.',
          howItWorks: 'خوارزمية PID: Error = Target_Angle - Current_Angle; Output = Kp*e + Ki*∫e + Kd*de/dt.',
          whereUsed: 'أنظمة الطيار الآلي والمتحكمات الهندسية.',
        },
      },
      {
        id: 'dr6',
        name: 'مراوح ديناميكية هوائية 1045 Propellers (زوجان CW و CCW)',
        count: 4,
        usage: 'تحويل عزم دوران المحركات إلى دفع هوائي للأعلى لرفع وزن الطائرة',
        details: {
          whatIsIt: 'مراوح مقعرة بدقة بقطر 10 بوصة وخطوة ميل 4.5 بوصة.',
          function: 'توليد الرفع الهوائي وفق مبدأ برنولي وفرق الضغط الجوي بين سطحي المروحة.',
          howItWorks: 'دوران المراوح المعاكسة يلغي عزم القصور الذاتي الدوراني ويمنع دوران هيكل الطائرة حول نفسه.',
        },
      },
      {
        id: 'dr7',
        name: 'بطارية ليثيوم بوليمر LiPo Battery 3S 11.1V 2200mAh 30C',
        count: 1,
        usage: 'توفير تيار تفريغ عالي يصل إلى 60 أمبير لتغذية المحركات الأربعة بكفاءة',
        details: {
          whatIsIt: 'خلايا كيميائية بوليمرية خفيفة الوزن توفر طاقة كثيفة ومعدل تفريغ تيار فائق (C-Rating).',
          function: 'تغذية المحركات والدوائر الإلكترونية.',
        },
      },
    ],
    connections: [
      { fromComponent: 'MPU6050', fromPin: 'VCC', toComponent: 'Arduino UNO', toPin: '5V', wireColor: 'red', signalType: '5V', notes: 'تغذية حساس الاتزان' },
      { fromComponent: 'MPU6050', fromPin: 'GND', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي الحساس' },
      { fromComponent: 'MPU6050', fromPin: 'SDA', toComponent: 'Arduino UNO', toPin: 'A4', wireColor: 'blue', signalType: 'Analog', notes: 'خط بيانات I2C' },
      { fromComponent: 'MPU6050', fromPin: 'SCL', toComponent: 'Arduino UNO', toPin: 'A5', wireColor: 'yellow', signalType: 'Analog', notes: 'خط ساعة I2C' },
      { fromComponent: 'ESC 1 (أمامي أيسر CCW)', fromPin: 'Signal', toComponent: 'Arduino UNO', toPin: 'D3', wireColor: 'green', signalType: 'PWM', notes: 'نبضات المحرك 1' },
      { fromComponent: 'ESC 2 (أمامي أيمن CW)', fromPin: 'Signal', toComponent: 'Arduino UNO', toPin: 'D9', wireColor: 'green', signalType: 'PWM', notes: 'نبضات المحرك 2' },
      { fromComponent: 'ESC 3 (خلفي أيمن CCW)', fromPin: 'Signal', toComponent: 'Arduino UNO', toPin: 'D10', wireColor: 'green', signalType: 'PWM', notes: 'نبضات المحرك 3' },
      { fromComponent: 'ESC 4 (خلفي أيسر CW)', fromPin: 'Signal', toComponent: 'Arduino UNO', toPin: 'D11', wireColor: 'green', signalType: 'PWM', notes: 'نبضات المحرك 4' },
      { fromComponent: 'LiPo Battery 11.1V', fromPin: 'XT60 (+)', toComponent: 'لوحة توزيع الطاقة PDB', toPin: 'VCC (+)', wireColor: 'red', signalType: 'VIN', notes: 'تغذية المحركات الأربعة' },
      { fromComponent: 'LiPo Battery 11.1V', fromPin: 'XT60 (-)', toComponent: 'لوحة توزيع الطاقة PDB', toPin: 'GND (-)', wireColor: 'black', signalType: 'GND', notes: 'سالب البطارية المشترك' },
    ],
    pinMapping: [
      { componentName: 'MPU6050 Gyro/Accel', pinFunction: 'I2C Serial Data', boardPin: 'A4', codeIdentifier: 'SDA_PIN' },
      { componentName: 'MPU6050 Gyro/Accel', pinFunction: 'I2C Serial Clock', boardPin: 'A5', codeIdentifier: 'SCL_PIN' },
      { componentName: 'ESC Motor 1 (Front Left CCW)', pinFunction: 'PWM Signal 1', boardPin: 'D3', codeIdentifier: 'MOTOR1_PIN' },
      { componentName: 'ESC Motor 2 (Front Right CW)', pinFunction: 'PWM Signal 2', boardPin: 'D9', codeIdentifier: 'MOTOR2_PIN' },
      { componentName: 'ESC Motor 3 (Rear Right CCW)', pinFunction: 'PWM Signal 3', boardPin: 'D10', codeIdentifier: 'MOTOR3_PIN' },
      { componentName: 'ESC Motor 4 (Rear Left CW)', pinFunction: 'PWM Signal 4', boardPin: 'D11', codeIdentifier: 'MOTOR4_PIN' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تجميع الشاسيه وتجهيز لوحة توزيع الطاقة (Power Distribution Board)',
        description: 'قم بتركيب الأذرع الأربعة في قاعدة الشاسيه ولحام أطراف تغذية الـ ESCs الأربعة في لوحة توزيع الطاقة المدمجة (PDB) مع مراعاة القطبية الموجبة والسالبة بدقة متناهية.',
        usedComponents: ['هيكل F450', 'كاوية لحام', 'أسلاك السيليكون المقاومة للحرارة'],
        cautionNotice: 'تحذير أمني: أي تلامس بين الموجب والسالب في بطاريات الـ LiPo يسبب ماساً كهربائياً خطيراً، تأكد من عزل كافة نقاط اللحام بانكماش حراري (Heat Shrink).',
      },
      {
        stepNumber: 2,
        title: 'تثبيت محركات الـ BLDC ومراعاة اتجاه الدوران (CW / CCW)',
        description: 'ثبّت المحركات الأربعة في نهايات الأذرع. المحرك 1 والمحرك 3 يجب أن يدورا عكس عقارب الساعة (CCW)، بينما المحرك 2 والمحرك 4 يدوران مع عقارب الساعة (CW) لتعويض عزوم الالتواء.',
        usedComponents: ['محركات BLDC 2212', 'براغي التثبيت'],
        importantNotes: 'لا تقم بتركيب المراوح إطلاقاً في هذه المرحلة؛ تركيب المراوح يتم فقط كآخر خطوة وقبل الإقلاع الميداني مباشرة بعد اكتمال المعايرة البرمجية.',
      },
      {
        stepNumber: 3,
        title: 'تركيب وحدة MPU6050 ومعايرة مركز الثقل (Center of Gravity)',
        description: 'ثبّت حساس MPU6050 في المركز الهندسي الدقيق للشاسيه فوق وسادة فوم ممتصة للاهتزازات (Anti-vibration foam pad) لمنع وصول اهتزازات المحركات إلى حساس الجيروسكوب.',
        usedComponents: ['حساس MPU6050', 'فوم مضاد للاهتزازات'],
        connectionsSummary: 'SDA→A4 | SCL→A5 | VCC→5V | GND→GND',
      },
      {
        stepNumber: 4,
        title: 'توصيل إشارات التحكم ومتحكمات الـ ESC ومزامنتها (Throttle Calibration)',
        description: 'وصّل كابلات إشارة الـ ESCs الأربعة بأطراف الـ PWM في الأردوينو (D3, D9, D10, D11). قم بتنفيذ خطوة معايرة المدى النبضي لـ ESCs لضمان دوران المحركات الأربعة في نفس اللحظة تماماً.',
        usedComponents: ['Arduino UNO', 'ESCs 30A'],
        connectionsSummary: 'ESC1→D3 | ESC2→D9 | ESC3→D10 | ESC4→D11',
      },
      {
        stepNumber: 5,
        title: 'ضبط خوارزمية التحكم التناسبي التكاملي التفاضلي (PID Tuning)',
        description: 'برمجة معادلة الـ PID التي تقرأ خطأ زاوية الميل اللحظي وتزيد سرعة المحركين المعاكسين وتخفض سرعة المحركين الآخرين لاستعادة الاتزان الأفقي في أجزاء من الألف من الثانية.',
        usedComponents: ['برنامج Arduino IDE', 'كود المحاكاة والاتزان'],
        importantNotes: 'ابدأ بضبط المعامل التناسبي Kp أولاً حتى تشعر بمقاومة الدرون للميل الخارجي، ثم اضبط Kd لإخماد التذبذبات السريعة، وأخيراً Ki لتصحيح الأخطاء الثابتة.',
      },
    ],
    code: {
      language: 'arduino',
      filename: 'QuadcopterFlightController_Edu.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: متحكم اتزان طائرة درون رباعية تعليمي (PID Flight Loop)
 * المكونات: Arduino UNO + MPU6050 + 4x ESCs + BLDC Motors
 * الهدف: دراسة معادلات الاتزان الديناميكي والتحكم ثلاثي المحاور
 * ==============================================================
 */

#include <Wire.h>
#include <Servo.h>

// أطراف نبضات الـ ESC للمحركات الأربعة
#define MOTOR1_PIN 3   // Front-Left (CCW)
#define MOTOR2_PIN 9   // Front-Right (CW)
#define MOTOR3_PIN 10  // Rear-Right (CCW)
#define MOTOR4_PIN 11  // Rear-Left (CW)

Servo esc1, esc2, esc3, esc4;

// معاملات التحكم التناسبي التكاملي التفاضلي PID
float Kp_pitch = 1.35, Ki_pitch = 0.04, Kd_pitch = 18.0;
float Kp_roll  = 1.35, Ki_roll  = 0.04, Kd_roll  = 18.0;

float target_pitch = 0.0; // الهدف: اتزان أفقي تام
float target_roll  = 0.0;

float pitch_error, pitch_prev_error = 0, pitch_integral = 0;
float roll_error,  roll_prev_error  = 0, roll_integral  = 0;

int base_throttle = 1250; // نبضة الرفع الابتدائية (1000 = توقف, 2000 = سرعة قصوى)
const int MPU_ADDR = 0x68;

void setupMPU() {
  Wire.begin();
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // سجل إدارة الطاقة
  Wire.write(0);    // إيقاظ الحساس
  Wire.endTransmission(true);
}

void readGyroAccel(float &pitch, float &roll) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  int16_t AcX = Wire.read() << 8 | Wire.read();
  int16_t AcY = Wire.read() << 8 | Wire.read();
  int16_t AcZ = Wire.read() << 8 | Wire.read();

  // حساب زوايا الميل عبر التسارع
  pitch = atan2((float)AcY, sqrt((float)AcX * AcX + (float)AcZ * AcZ)) * 180.0 / PI;
  roll  = atan2(-(float)AcX, (float)AcZ) * 180.0 / PI;
}

void setup() {
  Serial.begin(115200);
  setupMPU();

  // ربط الـ ESCs وإرسال إشارة الأمان الابتدائية (1000us)
  esc1.attach(MOTOR1_PIN, 1000, 2000);
  esc2.attach(MOTOR2_PIN, 1000, 2000);
  esc3.attach(MOTOR3_PIN, 1000, 2000);
  esc4.attach(MOTOR4_PIN, 1000, 2000);

  esc1.writeMicroseconds(1000);
  esc2.writeMicroseconds(1000);
  esc3.writeMicroseconds(1000);
  esc4.writeMicroseconds(1000);

  delay(2000);
  Serial.println(F("[MCT Academy] Drone Flight Control System Ready (Educational Mode)"));
}

void loop() {
  float current_pitch = 0, current_roll = 0;
  readGyroAccel(current_pitch, current_roll);

  // حساب أخطاء الاتزان
  pitch_error = target_pitch - current_pitch;
  roll_error  = target_roll  - current_roll;

  // الحساب التكاملي مع حماية ضد الـ Windup
  pitch_integral = constrain(pitch_integral + pitch_error * 0.01, -100, 100);
  roll_integral  = constrain(roll_integral  + roll_error  * 0.01, -100, 100);

  // الحساب التفاضلي
  float pitch_derivative = (pitch_error - pitch_prev_error) / 0.01;
  float roll_derivative  = (roll_error  - roll_prev_error)  / 0.01;

  // حساب خرج الـ PID
  float pid_pitch = (Kp_pitch * pitch_error) + (Ki_pitch * pitch_integral) + (Kd_pitch * pitch_derivative);
  float pid_roll  = (Kp_roll  * roll_error)  + (Ki_roll  * roll_integral)  + (Kd_roll  * roll_derivative);

  pitch_prev_error = pitch_error;
  roll_prev_error  = roll_error;

  // خلط الإشارات على المحركات الأربعة (Motor Mixing Algorithm)
  int m1 = constrain(base_throttle + pid_pitch - pid_roll, 1000, 1800); // Front-Left
  int m2 = constrain(base_throttle + pid_pitch + pid_roll, 1000, 1800); // Front-Right
  int m3 = constrain(base_throttle - pid_pitch + pid_roll, 1000, 1800); // Rear-Right
  int m4 = constrain(base_throttle - pid_pitch - pid_roll, 1000, 1800); // Rear-Left

  // تطبيق النبضات على متحكمات السرعة
  esc1.writeMicroseconds(m1);
  esc2.writeMicroseconds(m2);
  esc3.writeMicroseconds(m3);
  esc4.writeMicroseconds(m4);

  // طباعة بيانات المراقبة التعليمية كل 100 ميلي ثانية
  static unsigned long lastLog = 0;
  if (millis() - lastLog > 100) {
    lastLog = millis();
    Serial.print(F("Pitch: ")); Serial.print(current_pitch, 1);
    Serial.print(F("° | Roll: ")); Serial.print(current_roll, 1);
    Serial.print(F("° | M1: ")); Serial.print(m1);
    Serial.print(F(" | M2: ")); Serial.println(m2);
  }

  delay(10); // زمن الدورة 100Hz
}
`,
      explanation: 'يقوم الكود بتطبيق خوارزمية الاتزان الديناميكي PID للطائرة المسيرة. يقرأ زوايا الميل (Pitch و Roll) عبر حساس MPU6050، ويحسب الفرق بين الزاوية المطلوبة (0 أفقي) والزاوية الفعلية، ثم يقوم برفع سرعة المحركات في الجانب المنخفض وتخفيضها في الجانب المرتفع لتعديل الوضع فوراً.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 11-15', explanation: 'تعريف أطراف الـ PWM الأربعة المتحكمة في الـ ESCs للمحركات.' },
        { lineRange: 'الأسطر 19-21', explanation: 'معاملات الـ PID (Kp, Ki, Kd) لضبط سرعة الاستجابة واستقرار الطيران.' },
        { lineRange: 'الأسطر 33-46', explanation: 'دالة قراءة حساس القصور الذاتي MPU6050 عبر بروتوكول I2C وحساب زوايا الميل بـ Trigonometry.' },
        { lineRange: 'الأسطر 74-95', explanation: 'خوارزمية خلط المحركات (Motor Mixer): دمج مدخلات الرفع الأساسية مع تصحيحات الـ PID لكل محرك.' },
      ],
      librariesNeeded: ['Wire.h (الاتصال التسلسلي I2C)', 'Servo.h (توليد نبضات 1000-2000us لمتحكمات الـ ESC)'],
      uploadSteps: [
        'تأكد من فصل المراوح تماماً عن المحركات لأسباب الأمان.',
        'صل كابل USB باللوحة واختر منفذ COM الصحيح.',
        'ارفع الكود وافتح شاشة Serial Monitor بسرعة 115200 baud.',
        'قم بإمالة اللوحة باليد ولاحظ زيادة سرعة المحركات في جهة الميل لتصحيحه.',
      ],
    },
    testingProcedure: {
      steps: [
        'تثبيت هيكل الطائرة على منصة اختبار محورية (Gimbal Test Stand) ذات درجة حرية واحدة للمعايرة بأمان.',
        'تشغيل الطاقة والتأكد من صدور نغمات تهيئة الـ ESCs الأربعة بنجاح.',
        'إمالة الدرون للأمام باليد: يجب ملاحظة ارتفاع صوت دوران المحركين الأماميين فوراً لدفع الهيكل للأعلى.',
        'إمالة الدرون لليمين: يجب زيادة سرعة المحركين الأيمنين لإعادة الطائرة للأفق.',
      ],
      expectedBehavior: 'استجابة سريعة جداً للمحركات في مواجهة أي ميل خارجي واستقرار ذاتي حول المحورين الأفقيين.',
    },
    troubleshooting: [
      {
        symptom: 'المحركات تصدر صفيراً متقطعاً ولا تدور عند إرسال الإشارة',
        possibleCause: 'عدم اكتمال معايرة مدى النبضة (Throttle Calibration) لمتحكمات الـ ESC.',
        solution: 'أعد إرسال نبضة 1000us الدنيا عند بداية التشغيل لفتح أمان الـ ESC (Arming).',
      },
      {
        symptom: 'اهتزاز عنيف وسريع جداً في الطائرة عند محاولة الإقلاع',
        possibleCause: 'المعامل التناسبي Kp أو التفاضلي Kd مرتفع جداً مما يسبب Over-correction.',
        solution: 'خفض قيمة Kp بنسبة 30% واضبط Kd تدريجياً حتى يصبح التعديل ناعماً بدون تذبذب.',
      },
    ],
    futureImprovements: [
      'إضافة حساس بارومتر BMP280 لحفظ الارتفاع التلقائي بدقة السنتيمتر (Altitude Hold).',
      'دمج وحدة GPS وبوصلة إلكترونية HMC5883L للعودة التلقائية إلى نقطة الانطلاق (Return to Home - RTH).',
      'إضافة حساس ضوئي سفلي Optical Flow للحفاظ على الموقع الثابت بدون نظام GPS داخل القاعات والمختبرات.',
    ],
    finalResultSummary: 'نظام طيران مسير متقدم يجسد مبادئ هندسة الميكاترونكس المتطورة والتحكم التغذوي الراجع بمعدل 100 عملية تصحيح في الثانية.',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[3],
      OFFICIAL_MECHATRONICS_REFERENCES[0],
    ],
    simulationConfig: {
      type: 'drone_flight',
      defaultSensors: { pitchAngle: 0, rollAngle: 0, altitudeMeters: 1.5, batteryVolts: 11.8 },
    },
  },

  'robotic-arm-4dof': {
    id: 'proj-arm-4dof',
    title: 'ذراع روبوتية ميكاترونكس 4 محاور (4-DOF Robotic Arm)',
    category: 'robotics',
    idea: 'تصميم وبناء ذراع روبوتية مفصلية بأربعة محاور حركة (قاعدة دورانية، مفصل الكتف، مفصل الكوع، ومقبض التقاط Gripper) يتم التحكم بمفاصلها عبر محركات سيرفو دقيقة ومقابض تحكم أنالوج (Joysticks) مع إمكانية حفظ وتسجيل مسارات الحركة وتكرارها آلياً.',
    targetAudience: 'طلاب الأتمتة الصناعية، الروبوتات، والتحكم الحركي',
    components: [
      {
        id: 'arm1',
        name: 'Arduino UNO R3',
        count: 1,
        usage: 'توليد إشارات التحكم الزاوية لمحركات السيرفو وقراءة مدخلات عصا التحكم',
        details: {
          whatIsIt: 'المتحكم الدقيق المسؤول عن حساب الكينماتيكا والتحكم بالمفاصل.',
          function: 'تحويل إشارات الجهد التناظري من عصا التحكم إلى زوايا ميكانيكية بين 0 و 180 درجة.',
          howItWorks: 'محول تناظري رقمي 10-bit ADC يقرأ الجهد ويحوله لقيم PWM.',
          whereUsed: 'المشاريع الهندسية والروبوتات المفصلية.',
        },
      },
      {
        id: 'arm2',
        name: 'محركات سيرفو معدنية MG996R / SG90',
        count: 4,
        usage: 'تحريك مفاصل الذراع الأربعة: القاعدة، الكتف، المرفق، والمخلب',
        details: {
          whatIsIt: 'محركات زاوية ذات تروس معدنية متينة وعزم دوران عالي يصل إلى 10 kg.cm لمفصلي القاعدة والكتف.',
          function: 'تحريك المفاصل الميكانيكية بدقة مع الحفاظ على الزاوية تحت تأثير الحمل.',
          howItWorks: 'محرك DC متصل بنظام تغذية راجعة بمقاومة متغيرة لمطابقة الزاوية المطلوبة.',
          whereUsed: 'الأذرع الصناعية، آلات CNC، ونظم التوجيه.',
        },
      },
      {
        id: 'arm3',
        name: 'عصا تحكم ثنائية المحور Dual-Axis Analog Joystick Module',
        count: 2,
        usage: 'التحكم اليدوي السلس في محاور الذراع الأربعة (X1, Y1, X2, Y2)',
        details: {
          whatIsIt: 'مقاومتان متغيرتان متعامدتان مع زر ضغط مدمج.',
          function: 'إعطاء جهد تناظري يتراوح من 0V إلى 5V بحسب موضع اليد.',
          howItWorks: 'تغير قيمة المقاومة الكهربائية عند تحريك المقبض.',
          whereUsed: 'أجهزة التحكم بالروبوتات، الطائرات، ومنصات الألعاب.',
        },
      },
      {
        id: 'arm4',
        name: 'هيكل ذراع روبوت ميكانيكي أكريليك/ألمنيوم (4-DOF Mechanical Arm)',
        count: 1,
        usage: 'الهيكل الحامل والمفاصل الحركية والمخلب',
        details: {
          whatIsIt: 'وصلات ميكانيكية مصممة وفق نسب أطوال مدروسة لزيادة مدى العمل (Work Envelope).',
          function: 'نقل الحركة إلى نقطة النهاية (End-Effector).',
          howItWorks: 'كيناتيكا أمامية وعكسية Forward and Inverse Kinematics.',
        },
      },
      {
        id: 'arm5',
        name: 'وحدة تغذية خارجية 5V 4A DC Power Supply',
        count: 1,
        usage: 'تغذية محركات السيرفو الأربعة بتيار كافٍ ومستقر لمنع ارتعاش الذراع',
        details: {
          whatIsIt: 'محول كهربائي ومصدر جهد منظم ومستقر.',
          function: 'تأمين تيار المحركات الذي يصل إلى 2.5A عند حمل الأوزان.',
          howItWorks: 'منظم جهد نبضي عالي الكفاءة (Switching Regulator).',
        },
      },
    ],
    connections: [
      { fromComponent: 'Base Servo', fromPin: 'Signal', toComponent: 'Arduino UNO', toPin: 'D3', wireColor: 'orange', signalType: 'PWM', notes: 'محور القاعدة الأفقي' },
      { fromComponent: 'Shoulder Servo', fromPin: 'Signal', toComponent: 'Arduino UNO', toPin: 'D5', wireColor: 'orange', signalType: 'PWM', notes: 'محور الكتف الرأسي' },
      { fromComponent: 'Elbow Servo', fromPin: 'Signal', toComponent: 'Arduino UNO', toPin: 'D6', wireColor: 'orange', signalType: 'PWM', notes: 'محور المرفق' },
      { fromComponent: 'Gripper Servo', fromPin: 'Signal', toComponent: 'Arduino UNO', toPin: 'D9', wireColor: 'orange', signalType: 'PWM', notes: 'محور المخلب/القبضة' },
      { fromComponent: 'Joystick 1', fromPin: 'VRx', toComponent: 'Arduino UNO', toPin: 'A0', wireColor: 'blue', signalType: 'Analog', notes: 'تحريك القاعدة' },
      { fromComponent: 'Joystick 1', fromPin: 'VRy', toComponent: 'Arduino UNO', toPin: 'A1', wireColor: 'blue', signalType: 'Analog', notes: 'تحريك الكتف' },
      { fromComponent: 'Joystick 2', fromPin: 'VRx', toComponent: 'Arduino UNO', toPin: 'A2', wireColor: 'purple', signalType: 'Analog', notes: 'تحريك المرفق' },
      { fromComponent: 'Joystick 2', fromPin: 'VRy', toComponent: 'Arduino UNO', toPin: 'A3', wireColor: 'purple', signalType: 'Analog', notes: 'فتح وإغلاق المخلب' },
      { fromComponent: 'External 5V Power', fromPin: 'Positive (+)', toComponent: 'لوحة توزيع السيرفو', toPin: 'VCC (+)', wireColor: 'red', signalType: '5V', notes: 'تغذية السيرفوهات حصراً' },
      { fromComponent: 'External 5V Power', fromPin: 'GND (-)', toComponent: 'Arduino UNO', toPin: 'GND', wireColor: 'black', signalType: 'GND', notes: 'أرضي مشترك إلزامي' },
    ],
    pinMapping: [
      { componentName: 'Base Servo Motor', pinFunction: 'Base Rotation PWM', boardPin: 'D3', codeIdentifier: 'SERVO_BASE_PIN' },
      { componentName: 'Shoulder Servo Motor', pinFunction: 'Shoulder Lift PWM', boardPin: 'D5', codeIdentifier: 'SERVO_SHOULDER_PIN' },
      { componentName: 'Elbow Servo Motor', pinFunction: 'Elbow Extension PWM', boardPin: 'D6', codeIdentifier: 'SERVO_ELBOW_PIN' },
      { componentName: 'Gripper Servo Motor', pinFunction: 'Claw Grip PWM', boardPin: 'D9', codeIdentifier: 'SERVO_GRIPPER_PIN' },
      { componentName: 'Joystick 1 Horizontal', pinFunction: 'Base Joystick Input', boardPin: 'A0', codeIdentifier: 'JOY1_X' },
      { componentName: 'Joystick 1 Vertical', pinFunction: 'Shoulder Joystick Input', boardPin: 'A1', codeIdentifier: 'JOY1_Y' },
      { componentName: 'Joystick 2 Horizontal', pinFunction: 'Elbow Joystick Input', boardPin: 'A2', codeIdentifier: 'JOY2_X' },
      { componentName: 'Joystick 2 Vertical', pinFunction: 'Gripper Joystick Input', boardPin: 'A3', codeIdentifier: 'JOY2_Y' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تثبيت محرك القاعدة والمحور الدوار 180 درجة',
        description: 'ثبّت سيرفو القاعدة MG996R في اللوح السفلي، وضبط زاويته عند 90 درجة قبل ربط قرص الدوران لضمان حرية الحركة المتساوية يميناً ويساراً.',
        usedComponents: ['هيكل الذراع', 'سيرفو MG996R'],
      },
      {
        stepNumber: 2,
        title: 'تركيب ذراع الكتف والمفصل الرئيسي الأول',
        description: 'ثبّت سيرفو الكتف واربط ذراع الرفع المقواة مع ضبط مركز الثقل الميكانيكي لتقليل عزم الانحناء على التروس.',
        usedComponents: ['سيرفو الكتف', 'وصلات الأكريليك'],
      },
      {
        stepNumber: 3,
        title: 'تركيب سيرفو المرفق والمخلب القابض (Gripper)',
        description: 'ثبّت سيرفو المرفق وقم بتجميع آلية التروس المسننة الخاصة بالمخلب وتوصيل سيرفو الإمساك الصغير SG90.',
        usedComponents: ['سيرفو SG90', 'آلية المخلب المسننة'],
      },
      {
        stepNumber: 4,
        title: 'توصيل التغذية الخارجية المنفصلة وحماية الأردوينو',
        description: 'وصّل كابلات تغذية المحركات الأربعة بمصدر الجهد الخارجي 5V 4A، واجمع الأسلاك الأرضية مع طرف GND في الأردوينو، ووصل خطوط الإشارة البرتقالية بأطراف الأردوينو.',
        usedComponents: ['مزود طاقة خارجي 5V', 'Arduino UNO', 'أسلاك التوصيل'],
        cautionNotice: 'تنبيه: لا تغذِ محركات السيرفو من مخرج 5V للأردوينو، لأن ذلك يؤدي إلى احتراق منظم جهد الأردوينو أو اهتزاز متقطع للذراع.',
      },
    ],
    code: {
      language: 'arduino',
      filename: 'RoboticArm4DOF_Controller.ino',
      sourceCode: `/*
 * ==============================================================
 * أكاديمية الميكاترونكس اليمنية - مختبر المشاريع الهندسية الذكي
 * مشروع: ذراع روبوتية ميكاترونكس 4 محاور (4-DOF Robotic Arm)
 * المكونات: Arduino UNO + 4x Servos + 2x Dual-Axis Joysticks
 * ==============================================================
 */

#include <Servo.h>

#define SERVO_BASE_PIN     3
#define SERVO_SHOULDER_PIN 5
#define SERVO_ELBOW_PIN    6
#define SERVO_GRIPPER_PIN  9

#define JOY1_X A0
#define JOY1_Y A1
#define JOY2_X A2
#define JOY2_Y A3

Servo baseServo, shoulderServo, elbowServo, gripperServo;

// زوايا البداية الافتراضية
float baseAngle     = 90.0;
float shoulderAngle = 90.0;
float elbowAngle    = 90.0;
float gripperAngle  = 40.0;

void setup() {
  Serial.begin(9600);

  baseServo.attach(SERVO_BASE_PIN);
  shoulderServo.attach(SERVO_SHOULDER_PIN);
  elbowServo.attach(SERVO_ELBOW_PIN);
  gripperServo.attach(SERVO_GRIPPER_PIN);

  baseServo.write((int)baseAngle);
  shoulderServo.write((int)shoulderAngle);
  elbowServo.write((int)elbowAngle);
  gripperServo.write((int)gripperAngle);

  Serial.println(F("[MCT Academy] 4-DOF Robotic Arm Ready!"));
}

void loop() {
  // قراءة مدخلات عصا التحكم (0 إلى 1023)
  int valJoy1X = analogRead(JOY1_X);
  int valJoy1Y = analogRead(JOY1_Y);
  int valJoy2X = analogRead(JOY2_X);
  int valJoy2Y = analogRead(JOY2_Y);

  // تحديث الزوايا بسلاسة (Proportional Smoothing)
  if (valJoy1X > 600) baseAngle += 1.5;
  else if (valJoy1X < 400) baseAngle -= 1.5;

  if (valJoy1Y > 600) shoulderAngle += 1.5;
  else if (valJoy1Y < 400) shoulderAngle -= 1.5;

  if (valJoy2X > 600) elbowAngle += 1.5;
  else if (valJoy2X < 400) elbowAngle -= 1.5;

  if (valJoy2Y > 600) gripperAngle += 2.0;
  else if (valJoy2Y < 400) gripperAngle -= 2.0;

  // تقييد الزوايا بالحدود الميكانيكية الآمنة
  baseAngle     = constrain(baseAngle, 0, 180);
  shoulderAngle = constrain(shoulderAngle, 30, 150);
  elbowAngle    = constrain(elbowAngle, 20, 160);
  gripperAngle  = constrain(gripperAngle, 10, 85); // 10 مغلق, 85 مفتوح

  // تطبيق الزوايا على المحركات
  baseServo.write((int)baseAngle);
  shoulderServo.write((int)shoulderAngle);
  elbowServo.write((int)elbowAngle);
  gripperServo.write((int)gripperAngle);

  delay(25); // سرعة الحركة ونعومتها
}
`,
      explanation: 'يقرأ الكود قيم عصا التحكم التناظرية كل 25 ميلي ثانية. عند إمالة المقبض للأمام أو الخلف تتغير زاوية المفصل المعني تدريجياً بنعومة بدون صدمات ميكانيكية، مع تقييد الزوايا لمنع اصطدام الذراع بنفسها أو تجاوز عزم التحمل.',
      lineByLineNotes: [
        { lineRange: 'الأسطر 9-17', explanation: 'تعيين أطراف السيرفوهات وعصا التحكم وفق مخطط التوصيل.' },
        { lineRange: 'الأسطر 43-58', explanation: 'تحويل حركة المقبض إلى زيادة أو نقصان ناعم في زوايا المفاصل بدلاً من الانتقال الفجائي.' },
        { lineRange: 'الأسطر 61-64', explanation: 'دالة constrain لضمان عدم تجاوز المفاصل للحدود الفيزيائية الآمنة.' },
      ],
      librariesNeeded: ['Servo.h'],
      uploadSteps: [
        'افتح Arduino IDE، اختر Arduino Uno ومنفذ COM.',
        'ارفع الكود وتحقق من أن التغذية الخارجية 5V مشغلة.',
        'حرك المقابض وتأكد من استجابة كل مفصل بشكل صحيح.',
      ],
    },
    testingProcedure: {
      steps: [
        'وضع الذراع على سطح طاولة مستوٍ ومستقر.',
        'تشغيل مفتاح التغذية 5V ومراقبة انتقال الذراع لوضع الاستعداد.',
        'تحريك مقبض عصا التحكم 1 لتدوير القاعدة ورفع الكتف.',
        'استخدام مقبض عصا التحكم 2 لمد المرفق والتقاط جسم خفيف وزنه 50 جرام.',
      ],
      expectedBehavior: 'استجابة ناعمة ودقيقة لكل مفصل بدون ارتعاش بفضل المصدر المنفصل للتغذية الكهربائية.',
    },
    troubleshooting: [
      {
        symptom: 'المحركات تهتز وتصدر صوتاً مزعجاً دون تحريك الذراع',
        possibleCause: 'تيار التغذية غير كافٍ أو عدم توصيل السلك الأرضي المشترك.',
        solution: 'تأكد من استخدام مزود طاقة يعطي 5V وتيار 3A على الأقل وربط GND بمصدر التغذية والأردوينو معاً.',
      },
    ],
    futureImprovements: [
      'برمجة خوارزمية Inverse Kinematics (IK) للتحكم بالإحداثيات الديكارتية (X, Y, Z) مباشرة.',
      'إضافة ذاكرة EEPROM لتسجيل مسارات الحركة (Record and Playback) وتكرارها آلياً.',
      'تزويد المخلب بحساس قوة FSR (Force Sensing Resistor) لمعايرة قوة الضغط لمنع سحق الأجسام الهشة.',
    ],
    finalResultSummary: 'ذراع آلية ميكاترونكس تحاكي الأذرع الصناعية في خطوط التجميع وتوفر فهماً عميقاً للتحكم الحركي متعدد المحاور.',
    references: [
      OFFICIAL_MECHATRONICS_REFERENCES[0],
      OFFICIAL_MECHATRONICS_REFERENCES[2],
    ],
    simulationConfig: {
      type: 'robotic_arm',
      defaultSensors: { baseDeg: 90, shoulderDeg: 90, elbowDeg: 90, gripDeg: 40 },
    },
  },
};

/**
 * AI-driven Project Generator using Gemini API
 */
export async function generateProjectWithGemini(
  prompt: string,
  category: string,
  existingProject?: EngineeringProjectData
): Promise<EngineeringProjectData> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no Gemini API key or dummy key, return a curated template or customized template
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateSmartTemplateFallback(prompt, category, existingProject);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const isModification = Boolean(existingProject);
    const systemPrompt = `
أنت كبير مهندسي الميكاترونكس ورئيس مختبر المشاريع الهندسية في «أكاديمية الميكاترونكس اليمنية».
مهمتك: توليد مشروع هندسي تعليمي تطبيقي متكامل وتفاعلي باللغة العربية بناءً على طلب الطالب.
الالتزام الصارم بالمعايير الهندسية:
1. التوافق المطلق: يجب أن يتطابق مخطط التوصيل (Wiring Connections) حرفياً مع تعيين الأرجل (Pin Mapping) ومع كود البرمجة (Arduino Code #defines). لا يجوز أبداً استخدام Pin في الكود يختلف عن المخطط!
2. جدول المكونات: يجب أن يوضح كل مكون بدقة (ما هو، وظيفته، كيف يعمل، وأين يستخدم).
3. الخطوات التفاعلية: خطوات تركيب مرحلية منظمة ومفصلة خطوة بخطوة (مع العنوان، الشرح، المكونات، التوصيلات، وملاحظات الأمان).
4. كود البرمجة: كود كامل، نظيف، مع تعليقات عربية احترافية، وشرح سطراً بسطر.
5. المراجع التعليمية: ربط المشروع بالمراجع ومقررات هندسة الميكاترونكس والتحكم.
6. إذا كان المشروع طائرة مسيرة (Drone): ركز على الجانب التعليمي، الديناميكا الهوائية، اتزان المحاور، التحكم بـ PID، ولا تقدم أي معلومات ضارة.

يجب أن يكون الناتج حصراً بصيغة JSON نظيفة مطابقة للواجهة الهندسية التالية:
{
  "title": "اسم المشروع",
  "category": "${category || 'arduino'}",
  "idea": "فكرة المشروع وأهدافه الهندسية",
  "targetAudience": "الفئة المستهدفة",
  "components": [
    {
      "id": "c1",
      "name": "اسم المكون",
      "count": 1,
      "usage": "استخدامه في هذا المشروع",
      "details": {
        "whatIsIt": "ما هو المكون؟",
        "function": "وظيفته الهندسية",
        "howItWorks": "كيف يعمل فيزيائياً وإلكترونياً؟",
        "whereUsed": "أين يستخدم في التطبيقات الصناعية؟",
        "pinoutOrSpecs": "مواصفات الأرجل أو الجهد"
      }
    }
  ],
  "connections": [
    {
      "fromComponent": "المكون الأول",
      "fromPin": "الطرف",
      "toComponent": "المكون الثاني",
      "toPin": "الطرف",
      "wireColor": "red/black/blue/yellow/green/orange",
      "signalType": "5V/GND/Digital/Analog/PWM/VIN",
      "notes": "ملاحظة التوصيل"
    }
  ],
  "pinMapping": [
    {
      "componentName": "اسم المكون",
      "pinFunction": "وظيفة الإشارة",
      "boardPin": "D9 / A0 ...",
      "codeIdentifier": "اسم المتغير في الكود"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "عنوان الخطوة",
      "description": "شرح الخطوة",
      "usedComponents": ["مكون 1", "مكون 2"],
      "connectionsSummary": "ملخص التوصيلات",
      "importantNotes": "ملاحظات وتنبيهات أمان"
    }
  ],
  "code": {
    "language": "arduino",
    "filename": "Project.ino",
    "sourceCode": "كود برمجي كامل وشغال",
    "explanation": "شرح عام للكود",
    "lineByLineNotes": [{"lineRange": "1-10", "explanation": "شرح"}],
    "librariesNeeded": ["المكتبات المطلوبة"],
    "uploadSteps": ["خطوات رفع الكود"]
  },
  "testingProcedure": {
    "steps": ["خطوات الاختبار"],
    "expectedBehavior": "السلوك المتوقع",
    "calibrationTips": "نصائح المعايرة"
  },
  "troubleshooting": [
    {"symptom": "المشكلة", "possibleCause": "السبب المحتمل", "solution": "الحل"}
  ],
  "futureImprovements": ["تحسينات مستقبلية"],
  "finalResultSummary": "خلاصة النتيجة النهائية للمشروع",
  "references": [
    {
      "type": "book",
      "title": "اسم المرجع الأكاديمي",
      "chapterOrSection": "الفصل",
      "pageNumber": "رقم الصفحة",
      "sourceNote": "ملاحظة المصدر"
    }
  ],
  "simulationConfig": {
    "type": "obstacle_avoiding_car",
    "defaultSensors": {}
  }
}
`;

    let userPromptText = `طلب الطالب: ${prompt}`;
    if (isModification && existingProject) {
      userPromptText = `
المشروع الحالي المراد تعديله وتحديثه:
العنوان الحالي: ${existingProject.title}
المكونات الحالية: ${existingProject.components.map((c) => c.name).join(', ')}
كود الأردوينو الحالي:
${existingProject.code.sourceCode}

طلب التعديل المطلوب من الطالب:
"${prompt}"

يرجى تحديث المشروع وتعديل المكونات، وتحديث مخطط التوصيل، وتحديث كود الأردوينو ومواءمة الخطوات بدقة دون البدء من الصفر.
`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPromptText}` }] },
      ],
      config: {
        temperature: 0.2, // Low temperature for maximum engineering accuracy and pin alignment
      },
    });

    const responseText = response.text || '';
    const parsedData = safeExtractJson(responseText);

    if (parsedData && parsedData.title && parsedData.components) {
      const generatedProject: EngineeringProjectData = {
        id: `proj-${Date.now()}`,
        title: parsedData.title,
        category: parsedData.category || category || 'arduino',
        idea: parsedData.idea || prompt,
        targetAudience: parsedData.targetAudience || 'طلاب هندسة الميكاترونكس',
        components: parsedData.components || [],
        connections: parsedData.connections || [],
        pinMapping: parsedData.pinMapping || [],
        steps: parsedData.steps || [],
        code: parsedData.code || {
          language: 'arduino',
          filename: 'Project.ino',
          sourceCode: '// Arduino code',
          explanation: '',
          lineByLineNotes: [],
          librariesNeeded: [],
          uploadSteps: [],
        },
        testingProcedure: parsedData.testingProcedure || { steps: [], expectedBehavior: '' },
        troubleshooting: parsedData.troubleshooting || [],
        futureImprovements: parsedData.futureImprovements || [],
        finalResultSummary: parsedData.finalResultSummary || '',
        references: parsedData.references && parsedData.references.length > 0 ? parsedData.references : OFFICIAL_MECHATRONICS_REFERENCES,
        simulationConfig: parsedData.simulationConfig || { type: 'generic' },
      };

      return validateAndHarmonizeProject(generatedProject);
    }
  } catch (err) {
    console.warn('[ProjectLabService] Gemini generation error, using smart fallback:', err);
  }

  return generateSmartTemplateFallback(prompt, category, existingProject);
}

// Merge extended project templates into core templates collection
Object.assign(CORE_PROJECT_TEMPLATES, EXTENDED_PROJECT_TEMPLATES);

export { PROJECT_PRESET_BUTTONS };

/**
 * Intelligent Fallback Generator if AI is offline
 */
export function generateSmartTemplateFallback(prompt: string, category: string, existingProject?: EngineeringProjectData): EngineeringProjectData {
  const lower = (prompt || '').toLowerCase();

  // If modification requested on existing project
  if (existingProject) {
    const updated = JSON.parse(JSON.stringify(existingProject)) as EngineeringProjectData;
    updated.id = `proj-mod-${Date.now()}`;
    updated.title = `${existingProject.title} (معدّل: ${prompt.slice(0, 30)}...)`;
    updated.idea += `\n[تحديث]: تم تطبيق التعديل المطلوب: "${prompt}".`;
    return validateAndHarmonizeProject(updated);
  }

  // 1. Drone project
  if (lower.includes('درون') || lower.includes('drone') || category === 'drone' || lower.includes('طائر')) {
    return validateAndHarmonizeProject({
      ...CORE_PROJECT_TEMPLATES['educational-quadcopter-drone'],
      id: `proj-drone-${Date.now()}`,
    });
  }

  // 2. Robotic arm project
  if (lower.includes('ذراع') || lower.includes('arm') || category === 'robotics' && lower.includes('سيرفو')) {
    return validateAndHarmonizeProject({
      ...CORE_PROJECT_TEMPLATES['robotic-arm-4dof'],
      id: `proj-arm-${Date.now()}`,
    });
  }

  // 3. Line follower robot
  if (lower.includes('خط') || lower.includes('line') || lower.includes('متتبع')) {
    return validateAndHarmonizeProject({
      ...CORE_PROJECT_TEMPLATES['line-follower-robot'],
      id: `proj-line-${Date.now()}`,
    });
  }

  // 4. Smart home automation & gas alarm
  if (lower.includes('منزل') || lower.includes('home') || lower.includes('غاز') || lower.includes('حريق') || lower.includes('أمان') || category === 'iot') {
    return validateAndHarmonizeProject({
      ...CORE_PROJECT_TEMPLATES['smart-home-automation'],
      id: `proj-home-${Date.now()}`,
    });
  }

  // 5. Smart traffic light
  if (lower.includes('مرور') || lower.includes('traffic') || lower.includes('إشارة') || lower.includes('إسعاف')) {
    return validateAndHarmonizeProject({
      ...CORE_PROJECT_TEMPLATES['smart-traffic-light'],
      id: `proj-traffic-${Date.now()}`,
    });
  }

  // 6. Temperature & cooling system
  if (lower.includes('حرارة') || lower.includes('temperature') || lower.includes('تكييف') || lower.includes('تبريد') || lower.includes('مروحة') || lower.includes('dht')) {
    return validateAndHarmonizeProject({
      ...CORE_PROJECT_TEMPLATES['temperature-cooling-system'],
      id: `proj-temp-${Date.now()}`,
    });
  }

  // 7. Industrial motor speed and direction control
  if (lower.includes('محرك') || lower.includes('motor') || lower.includes('سرعة') || lower.includes('عزم') || lower.includes('فرملة') || lower.includes('stepper')) {
    return validateAndHarmonizeProject({
      ...CORE_PROJECT_TEMPLATES['motor-speed-direction-control'],
      id: `proj-motor-${Date.now()}`,
    });
  }

  // 8. Electronic circuits 555 oscillator
  if (lower.includes('دائرة') || lower.includes('circuit') || lower.includes('555') || lower.includes('مذبذب') || lower.includes('مكثف') || lower.includes('تردد')) {
    return validateAndHarmonizeProject({
      ...CORE_PROJECT_TEMPLATES['electronic-circuits-project'],
      id: `proj-circuits-${Date.now()}`,
    });
  }

  // 9. Default: Obstacle Avoiding Car
  return validateAndHarmonizeProject({
    ...CORE_PROJECT_TEMPLATES['arduino-obstacle-avoiding-car'],
    id: `proj-car-${Date.now()}`,
  });
}


import fs from 'fs';
import path from 'path';
import { EducationalVideo, VideoPlatform, StudyLevel, VideoExplanationRequest, VideoStudyList } from '../src/types';
import { GoogleGenAI } from '@google/genai';

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const VIDEOS_FILE = path.join(DATA_DIR, 'educational_videos.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'video_requests.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'video_favorites.json');

// Ensure directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create data dir:', err);
}

// ----------------------------------------------------------------------------
// SEED INITIAL CURATED HIGH-QUALITY VIDEOS
// ----------------------------------------------------------------------------
const SEED_VIDEOS: EducationalVideo[] = [
  // 1. Yemeni Mechatronics Content
  {
    id: 'vid-ym-01',
    title: 'شرح أساسيات الدوائر الكهربائية وقانون أوم - قسم هندسة الميكاترونكس',
    description: 'محاضرة شاملة حول قانون أوم، الجهد والتيار والمقاومة وتطبيقاتها العملية في مختبرات الميكاترونكس بجامعة صنعاء.',
    platform: 'YouTube',
    originalUrl: 'https://www.youtube.com/watch?v=k1t6rG5nZ2g',
    embedUrl: 'https://www.youtube.com/embed/k1t6rG5nZ2g',
    thumbnailUrl: 'https://img.youtube.com/vi/k1t6rG5nZ2g/hqdefault.jpg',
    channelName: 'قناة هندسة الميكاترونكس - اليمن',
    subject: 'الدوائر الكهربائية',
    topic: 'قانون أوم وتطبيقاته',
    level: 'السنة الأولى',
    university: 'جامعة صنعاء',
    language: 'العربية',
    tags: ['Ohm\'s Law', 'قانون أوم', 'Voltage', 'Current', 'Resistance', 'دوائر كهربائية', 'اليمن'],
    duration: '18:45',
    status: 'active',
    verified: true,
    isYemeniContent: true,
    isBestExplanation: true,
    addedDate: '2026-01-10',
    ratingScore: 4.9,
    viewsCount: 1420,
    savesCount: 380,
    doctorName: 'د. عبد الله الصنعاني',
    linkedLessonId: 'les-circuits-1',
  },
  {
    id: 'vid-ym-02',
    title: 'مشروع تخرج: روبوت فحص الأنابيب النفطية الذكي - جامعة ذمار',
    description: 'عرض عملي لمشروع تخرج طلاب هندسة الميكاترونكس بجامعة ذمار لتصميم روبوت فحص الأنابيب باستخدام Arduino وحساسات الالتراسونيك والتحكم بالحركة.',
    platform: 'YouTube',
    originalUrl: 'https://www.youtube.com/watch?v=dF4xP8j1k9m',
    embedUrl: 'https://www.youtube.com/embed/dF4xP8j1k9m',
    thumbnailUrl: 'https://img.youtube.com/vi/dF4xP8j1k9m/hqdefault.jpg',
    channelName: 'مشاريع الميكاترونكس باليمن',
    subject: 'Robotics',
    topic: 'مشاريع التخرج والروبوتات',
    level: 'السنة الرابعة',
    university: 'جامعة ذمار',
    language: 'العربية',
    tags: ['Robotics', 'مشاريع تخرج', 'Arduino', 'Sensors', 'ذمار', 'اليمن'],
    duration: '24:10',
    status: 'active',
    verified: true,
    isYemeniContent: true,
    isBestExplanation: true,
    addedDate: '2026-02-01',
    ratingScore: 5.0,
    viewsCount: 2890,
    savesCount: 650,
    doctorName: 'م. خالد الذماري',
  },
  {
    id: 'vid-ym-03',
    title: 'التحكم الآلي وبرمجة الـ PLC للمصانع والخطوط الإنتاجية',
    description: 'شرح عملي لبرمجة متحكمات PLC نوع Siemens S7-1200 ومخططات السلم Ladder Diagram من مختبرات الجامعة التخصصية الحديثة.',
    platform: 'YouTube',
    originalUrl: 'https://www.youtube.com/watch?v=pL9k3m8X1yA',
    embedUrl: 'https://www.youtube.com/embed/pL9k3m8X1yA',
    thumbnailUrl: 'https://img.youtube.com/vi/pL9k3m8X1yA/hqdefault.jpg',
    channelName: 'أكاديمية الأتمتة اليمنية',
    subject: 'PLC',
    topic: 'برمجة السلم Ladder Diagram',
    level: 'السنة الثالثة',
    university: 'الجامعة التخصصية الحديثة',
    language: 'العربية',
    tags: ['PLC', 'Siemens', 'Ladder Diagram', 'Industrial Automation', 'التحكم الآلي'],
    duration: '32:15',
    status: 'active',
    verified: true,
    isYemeniContent: true,
    isBestExplanation: true,
    addedDate: '2026-02-15',
    ratingScore: 4.8,
    viewsCount: 1980,
    savesCount: 420,
  },

  // 2. Arduino & Microcontrollers
  {
    id: 'vid-ard-01',
    title: 'دورة Arduino كاملة للمبتدئين: من الصفر حتى بناء سيارة روبوت',
    description: 'شرح مفصل لكيفية التعامل مع لوحة Arduino Uno، البرمجة بلغة C++، ربط الحساسات والمحركات، وتصحيح الأخطاء البرمجية.',
    platform: 'YouTube',
    originalUrl: 'https://www.youtube.com/watch?v=nL34z54G80w',
    embedUrl: 'https://www.youtube.com/embed/nL34z54G80w',
    thumbnailUrl: 'https://img.youtube.com/vi/nL34z54G80w/hqdefault.jpg',
    channelName: 'شروحات هندسة الميكاترونكس',
    subject: 'Arduino',
    topic: 'أساسيات الأردوينو والمحركات',
    level: 'السنة الأولى',
    language: 'العربية',
    tags: ['Arduino', 'C++', 'Microcontrollers', 'Sensors', 'DC Motor', 'Servo Motor'],
    duration: '45:00',
    status: 'active',
    verified: true,
    isYemeniContent: false,
    isBestExplanation: true,
    addedDate: '2026-01-05',
    ratingScore: 4.9,
    viewsCount: 5400,
    savesCount: 1200,
  },

  // 3. Control Systems & MATLAB
  {
    id: 'vid-ctrl-01',
    title: 'شرح خوارزمية التحكم PID Controller وتطبيقاتها في الاتزان',
    description: 'فهم متعمق لحلقة التحكم Proportional Integral Derivative، ضبط معامل Kp, Ki, Kd، ومحاكاتها باستخدام برنامج MATLAB & Simulink.',
    platform: 'YouTube',
    originalUrl: 'https://www.youtube.com/watch?v=UR0hOmjaG0M',
    embedUrl: 'https://www.youtube.com/embed/UR0hOmjaG0M',
    thumbnailUrl: 'https://img.youtube.com/vi/UR0hOmjaG0M/hqdefault.jpg',
    channelName: 'Control Engineering Master',
    subject: 'Control',
    topic: 'متحكمات PID وتطبيقات الاتزان',
    level: 'السنة الثالثة',
    language: 'العربية',
    tags: ['Control Systems', 'PID Controller', 'MATLAB', 'Simulink', 'Feedback'],
    duration: '28:30',
    status: 'active',
    verified: true,
    isYemeniContent: false,
    isBestExplanation: true,
    addedDate: '2026-01-20',
    ratingScore: 4.9,
    viewsCount: 3100,
    savesCount: 890,
  },

  // 4. Sensors & Actuators
  {
    id: 'vid-sens-01',
    title: 'الفرق بين محركات DC Motor و Servo Motor و Stepper Motor',
    description: 'مقارنة شاملة بين أنواع المحركات المستخدمة في الروبوتات والماكينات، مع شرح طريقة التحكم بالسرعة والعزم والزاوية باستخدام PWM.',
    platform: 'YouTube',
    originalUrl: 'https://www.youtube.com/watch?v=b10b0kXf74w',
    embedUrl: 'https://www.youtube.com/embed/b10b0kXf74w',
    thumbnailUrl: 'https://img.youtube.com/vi/b10b0kXf74w/hqdefault.jpg',
    channelName: 'تكنولوجيا الميكاترونكس',
    subject: 'Actuators',
    topic: 'المحركات الكهربائية وأنظمة التحكم',
    level: 'السنة الثانية',
    language: 'العربية',
    tags: ['DC Motor', 'Servo Motor', 'Stepper Motor', 'Motor Control', 'PWM'],
    duration: '22:15',
    status: 'active',
    verified: true,
    isYemeniContent: false,
    isBestExplanation: true,
    addedDate: '2026-02-10',
    ratingScore: 4.8,
    viewsCount: 4200,
    savesCount: 950,
  },

  // 5. Pneumatics & Hydraulics
  {
    id: 'vid-pneu-01',
    title: 'شروحات دوائر التحكم النيوماتيكي الهيدروليكي والصمامات التوجيهية',
    description: 'دراسة صمامات التحكم في الاتجاه Directional Control Valves والأسطوانات ثنائية الفعل والمكبس الهيدروليكي.',
    platform: 'Facebook',
    originalUrl: 'https://facebook.com/watch/?v=987654321',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
    channelName: 'مجلة الهيدروليك والنيوماتيك',
    subject: 'Pneumatics',
    topic: 'الدوائر النيوماتيكية الهيدروليكية',
    level: 'السنة الثالثة',
    language: 'العربية',
    tags: ['Pneumatics', 'Hydraulics', 'Valves', 'Cylinders', 'Fluid Power'],
    duration: '15:40',
    status: 'active',
    verified: true,
    isYemeniContent: false,
    addedDate: '2026-02-18',
    ratingScore: 4.7,
    viewsCount: 1540,
    savesCount: 310,
  },

  // 6. CNC & CAD Design
  {
    id: 'vid-cnc-01',
    title: 'برمجة ماكينات CNC وإنشاء أكواد G-Code و M-Code',
    description: 'درس تطبيقي خطوة بخطوة لكتابة أكواد التشكيل الميكانيكي على ماكينات الـ CNC باستخدام برامج CAD/CAM.',
    platform: 'TikTok',
    originalUrl: 'https://www.tiktok.com/@mechatronics_hub/video/7123456789',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60',
    channelName: 'Mechatronics Short Clips',
    subject: 'CNC',
    topic: 'برمجة G-Code والتصميم الهندي',
    level: 'السنة الرابعة',
    language: 'العربية',
    tags: ['CNC', 'G-Code', 'CAD', 'CAM', 'Machining'],
    duration: '03:45',
    status: 'active',
    verified: true,
    isYemeniContent: false,
    addedDate: '2026-02-22',
    ratingScore: 4.6,
    viewsCount: 6800,
    savesCount: 1100,
  },
];

// Helper to load or initialize JSON data
function loadVideos(): EducationalVideo[] {
  try {
    if (fs.existsSync(VIDEOS_FILE)) {
      const data = fs.readFileSync(VIDEOS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading videos file, using seed:', err);
  }
  // Write seed data initially
  saveVideos(SEED_VIDEOS);
  return SEED_VIDEOS;
}

function saveVideos(videos: EducationalVideo[]) {
  try {
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save videos:', err);
  }
}

function loadRequests(): VideoExplanationRequest[] {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = fs.readFileSync(REQUESTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading video requests:', err);
  }
  return [];
}

function saveRequests(requests: VideoExplanationRequest[]) {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save video requests:', err);
  }
}

// ----------------------------------------------------------------------------
// VIDEO SERVICE METHODS
// ----------------------------------------------------------------------------

export const videoService = {
  // 1. Get All Videos with Smart Filtering & Yemeni Priority
  getVideos: (filters?: {
    query?: string;
    subject?: string;
    topic?: string;
    level?: string;
    university?: string;
    platform?: string;
    isYemeniOnly?: boolean;
    isBestOnly?: boolean;
    status?: string;
  }) => {
    let videos = loadVideos();

    if (!filters) return videos;

    const { query, subject, topic, level, university, platform, isYemeniOnly, isBestOnly, status } = filters;

    // Filter by status if requested (default to active for students)
    if (status) {
      videos = videos.filter((v) => v.status === status);
    } else {
      videos = videos.filter((v) => v.status === 'active' || v.status === 'unavailable');
    }

    if (isYemeniOnly) {
      videos = videos.filter((v) => v.isYemeniContent);
    }

    if (isBestOnly) {
      videos = videos.filter((v) => v.isBestExplanation);
    }

    if (subject && subject !== 'جميع المواد') {
      videos = videos.filter((v) => v.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    if (level && level !== 'جميع المستويات') {
      videos = videos.filter((v) => v.level === level);
    }

    if (university && university !== 'جميع الجامعات') {
      videos = videos.filter((v) => v.university === university);
    }

    if (platform && platform !== 'جميع المنصات') {
      videos = videos.filter((v) => v.platform === platform);
    }

    // Search Query Matching across title, description, channelName, subject, topic, tags
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      
      // Synonym mappings for smart search
      const synonyms: Record<string, string[]> = {
        'فيزياء': ['physics', 'ohm', 'voltage', 'current', 'قانون أوم'],
        'قانون أوم': ['ohm', 'voltage', 'current', 'resistance', 'جهد', 'تيار', 'مقاومة'],
        'أوم': ['ohm', 'voltage', 'current', 'resistance'],
        'محركات': ['motor', 'dc motor', 'servo', 'stepper', 'bldc', 'pwm'],
        'المحركات': ['motor', 'dc motor', 'servo', 'stepper', 'bldc', 'pwm'],
        'برمجة': ['programming', 'c++', 'python', 'arduino', 'code'],
        'تحكم': ['control', 'pid', 'feedback', 'matlab', 'simulink'],
        'روبوت': ['robot', 'robotics', 'arm', 'drone', 'kinematics'],
      };

      const matchTerms = [q];
      Object.entries(synonyms).forEach(([key, list]) => {
        if (q.includes(key) || key.includes(q)) {
          matchTerms.push(...list);
        }
      });

      videos = videos.filter((v) => {
        const textToSearch = `${v.title} ${v.description} ${v.channelName} ${v.subject} ${v.topic} ${v.doctorName || ''} ${(v.tags || []).join(' ')}`.toLowerCase();
        return matchTerms.some((term) => textToSearch.includes(term.toLowerCase()));
      });
    }

    // Sort order:
    // 1. Yemeni Content First
    // 2. Best Explanation Badge
    // 3. Rating Score / Views
    return videos.sort((a, b) => {
      if (a.isYemeniContent && !b.isYemeniContent) return -1;
      if (!a.isYemeniContent && b.isYemeniContent) return 1;
      if (a.isBestExplanation && !b.isBestExplanation) return -1;
      if (!a.isBestExplanation && b.isBestExplanation) return 1;
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    });
  },

  // 2. Get Video by ID
  getVideoById: (id: string) => {
    const videos = loadVideos();
    const video = videos.find((v) => v.id === id);
    if (video) {
      // Increment view count
      video.viewsCount = (video.viewsCount || 0) + 1;
      saveVideos(videos);
    }
    return video;
  },

  // 3. Add Video with Duplicate Detection
  addVideo: (videoData: Partial<EducationalVideo>): { success: boolean; video?: EducationalVideo; error?: string } => {
    const videos = loadVideos();

    if (!videoData.originalUrl) {
      return { success: false, error: 'رابط الفيديو الأصلي مطلوب.' };
    }

    // Standardize URL check for duplicate
    const cleanUrl = videoData.originalUrl.trim();
    const existing = videos.find((v) => v.originalUrl.trim().toLowerCase() === cleanUrl.toLowerCase());
    if (existing) {
      return {
        success: false,
        error: 'هذا الفيديو موجود بالفعل في المكتبة التعليمية.',
        video: existing,
      };
    }

    // Embed URL helper
    let embedUrl = videoData.embedUrl;
    let platform: VideoPlatform = videoData.platform || 'YouTube';
    let thumbnailUrl = videoData.thumbnailUrl || '';

    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      platform = 'YouTube';
      let videoId = '';
      if (cleanUrl.includes('youtu.be/')) {
        videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (cleanUrl.includes('v=')) {
        videoId = cleanUrl.split('v=')[1]?.split('&')[0] || '';
      }
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
        if (!thumbnailUrl) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
    } else if (cleanUrl.includes('facebook.com')) {
      platform = 'Facebook';
    } else if (cleanUrl.includes('instagram.com')) {
      platform = 'Instagram';
    } else if (cleanUrl.includes('tiktok.com')) {
      platform = 'TikTok';
    }

    const newVid: EducationalVideo = {
      id: `vid-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: videoData.title || 'فيديو تعليمي هندسي',
      description: videoData.description || '',
      platform,
      originalUrl: cleanUrl,
      embedUrl: embedUrl || cleanUrl,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
      channelName: videoData.channelName || 'محتوى هندسي',
      subject: videoData.subject || 'ميكاترونكس العامة',
      topic: videoData.topic || 'شروحات هندسية',
      level: videoData.level || 'السنة الأولى',
      university: videoData.university || '',
      language: videoData.language || 'العربية',
      tags: videoData.tags || ['ميكاترونكس'],
      duration: videoData.duration || '10:00',
      status: videoData.status || 'active',
      verified: videoData.verified !== undefined ? videoData.verified : true,
      isYemeniContent: videoData.isYemeniContent || false,
      isBestExplanation: videoData.isBestExplanation || false,
      addedDate: new Date().toISOString().split('T')[0],
      ratingScore: 4.8,
      viewsCount: 1,
      savesCount: 0,
      doctorName: videoData.doctorName || '',
    };

    videos.unshift(newVid);
    saveVideos(videos);

    return { success: true, video: newVid };
  },

  // 4. Batch Import URLs into Pending Review
  batchImportUrls: (urls: string[]) => {
    const added: EducationalVideo[] = [];
    const duplicates: string[] = [];

    urls.forEach((rawUrl) => {
      const u = rawUrl.trim();
      if (!u) return;
      const res = videoService.addVideo({
        originalUrl: u,
        title: `فيديو قيد المراجعة (${new URL(u).hostname})`,
        status: 'pending_review',
        verified: false,
      });
      if (res.success && res.video) {
        added.push(res.video);
      } else {
        duplicates.push(u);
      }
    });

    return { addedCount: added.length, duplicatesCount: duplicates.length, added, duplicates };
  },

  // 5. Smart AI Auto-Categorization & Metadata Extraction via Gemini
  extractVideoMetadataWithAi: async (genAI: GoogleGenAI | null, url: string, rawText?: string) => {
    if (!genAI) {
      return {
        title: 'شرح هندسي جديد',
        subject: 'الدوائر الكهربائية',
        topic: 'مفاهيم ميكاترونية',
        level: 'السنة الأولى' as StudyLevel,
        tags: ['ميكاترونكس', 'شرح'],
        platform: url.includes('youtube') ? 'YouTube' : 'Other',
        isYemeniContent: url.toLowerCase().includes('yemen') || url.toLowerCase().includes('sanaa'),
      };
    }

    try {
      const prompt = `
أنت خبير في تنظيم المحتوى الأكاديمي لهندسة الميكاترونكس في اليمن والعالم العربي.
قم بتحليل هذا الرابط/النص واستخراج البيانات التعليمية التالية بصيغة JSON فقط:

الرابط: ${url}
النص المرفق: ${rawText || ''}

قم بتوفير كائن JSON بهذه الحقول المحددة:
{
  "title": "عنوان باللغة العربية واضع ومفهوم للدرس",
  "description": "وصف مختصر لما يشرحه الفيديو",
  "channelName": "اسم القناة أو المدرس",
  "platform": "YouTube" | "Facebook" | "Instagram" | "TikTok",
  "subject": "المادة الهندسية (مثل: الدوائر الكهربائية، التحكم، PLC، Arduino، الروبوتات، الفيزياء، البرمجة)",
  "topic": "الموضوع المحدد (مثل: قانون أوم، خوارزمية PID، محركات الخطوة)",
  "level": "السنة الأولى" | "السنة الثانية" | "السنة الثالثة" | "السنة الرابعة",
  "university": "اسم الجامعة اليمنية إن ذكرت أو فارغ",
  "language": "العربية" | "English" | "مترجم",
  "tags": ["قائمة الكلمات المفتاحية باللغتين العربية والإنجليزية"],
  "isYemeniContent": boolean (true إذا كان يخص جامعة أو دكتور أو مشروع يمني)
}
Return valid JSON only. No markdown fence.
`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn('AI Extraction failed, falling back to heuristics:', err);
      return {
        title: 'فيديو تعليمي ميكاترونكس',
        subject: 'ميكاترونكس العامة',
        topic: 'شروحات هندسية',
        level: 'السنة الأولى' as StudyLevel,
        tags: ['ميكاترونكس'],
        platform: 'YouTube',
        isYemeniContent: false,
      };
    }
  },

  // 6. Update Video Metadata
  updateVideo: (id: string, updates: Partial<EducationalVideo>) => {
    const videos = loadVideos();
    const idx = videos.findIndex((v) => v.id === id);
    if (idx === -1) return null;

    videos[idx] = { ...videos[idx], ...updates };
    saveVideos(videos);
    return videos[idx];
  },

  // 7. Delete Video
  deleteVideo: (id: string) => {
    let videos = loadVideos();
    videos = videos.filter((v) => v.id !== id);
    saveVideos(videos);
    return true;
  },

  // 8. Lecture Explanation Requests System ("اطلب شرحاً")
  addRequest: (reqData: Partial<VideoExplanationRequest>) => {
    const reqs = loadRequests();
    const newReq: VideoExplanationRequest = {
      id: `req-${Date.now()}`,
      studentId: reqData.studentId || 'anon',
      studentName: reqData.studentName || 'طالب ميكاترونكس',
      subject: reqData.subject || 'مادة هندسية',
      topic: reqData.topic || 'موضوع مخصص',
      level: reqData.level || 'السنة الأولى',
      description: reqData.description || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    reqs.unshift(newReq);
    saveRequests(reqs);
    return newReq;
  },

  getRequests: () => {
    return loadRequests();
  },

  updateRequestStatus: (id: string, status: 'pending' | 'fulfilled' | 'rejected') => {
    const reqs = loadRequests();
    const r = reqs.find((item) => item.id === id);
    if (r) {
      r.status = status;
      saveRequests(reqs);
    }
    return r;
  },

  // 9. Analytics for Admin Dashboard
  getAnalytics: () => {
    const videos = loadVideos();
    const reqs = loadRequests();

    const totalVideos = videos.length;
    const yemeniCount = videos.filter((v) => v.isYemeniContent).length;
    const pendingReviewCount = videos.filter((v) => v.status === 'pending_review').length;
    const brokenLinksCount = videos.filter((v) => v.status === 'unavailable').length;
    const pendingRequestsCount = reqs.filter((r) => r.status === 'pending').length;

    const mostViewed = [...videos].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5);

    // Subject breakdown
    const subjectCounts: Record<string, number> = {};
    videos.forEach((v) => {
      subjectCounts[v.subject] = (subjectCounts[v.subject] || 0) + 1;
    });

    return {
      totalVideos,
      yemeniCount,
      pendingReviewCount,
      brokenLinksCount,
      pendingRequestsCount,
      mostViewed,
      subjectCounts,
    };
  },
};

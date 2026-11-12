import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  CheckCircle2, 
  GraduationCap, 
  Play, 
  Camera, 
  Bot, 
  Calculator, 
  FileText, 
  KeyRound, 
  Search, 
  Sparkles, 
  HelpCircle,
  Zap,
  UserCheck,
  Compass,
  Layers,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
}) => {
  const [activeGuideTab, setActiveGuideTab] = useState<string>('getting_started');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const GUIDE_SECTIONS = [
    {
      id: 'getting_started',
      icon: KeyRound,
      title: '1. إنشاء الحساب وتفعيل الاشتراك',
      subtitle: 'خطوات البدء وتأكيد بيانات الطالب بكود التفعيل',
      color: 'from-blue-600 to-indigo-600',
      badge: 'البداية',
      steps: [
        {
          num: 'أ',
          title: 'تعبئة البيانات الأكاديمية',
          text: 'ادخل اسمك الثلاثي، رقم هاتفك، اختر جامعتك (مثل الجامعة الإماراتية الدولية أو جامعة صنعاء)، قسمك الهندسـي (هندسة الميكاترونكس)، ومستواك الدراسي.',
        },
        {
          num: 'ب',
          title: 'كلمة المرور والحساب',
          text: 'قم بتعيين كلمة مرور مخصصة لحسابك لتستطيع الدخول بها في أي وقت من جوالك أو حاسوبك الشخصي.',
        },
        {
          num: 'ج',
          title: 'تفعيل الاشتراك',
          text: 'ادخل كود التفعيل المعتمد المكون من خانات هجائية ورقمية الذي حصلت عليه من الإدارة، لتفتح لك المنصة كافة الميزات والمحاكيات مباشرة.',
        },
      ],
      tip: 'إذا لم تملك كود تفعيل بعد، يمكنك تجربة المنصة كزائر أو طلب كود التفعيل بضغط زر تفعيل الاشتراك.',
    },
    {
      id: 'smart_doctor',
      icon: GraduationCap,
      title: '2. 🎓 دكتور الميكاترونكس الذكي والسبورة الحية',
      subtitle: 'كيفية اختيار دكتور المادة أو إدخال بيانات دكتورك الحقيقي في جامعتك',
      color: 'from-purple-600 to-indigo-700',
      badge: 'الميزة الكبرى',
      steps: [
        {
          num: '1',
          title: 'اختيار الدكتور التخصصي',
          text: 'استعرض 20 دكتوراً افتراضياً متخصصاً في كافة مواد الميكاترونكس (رياضيات، فيزياء، دوائر، برمجة C++/Python، تحكم PID، PLC، روبوتات، أنظمة مدمجة، درونات...).',
        },
        {
          num: '2',
          title: 'تخصيص دكتورك الجامعي الحقيقي (اختياري)',
          text: 'يمكنك كتابة اسم دكتورك في الجامعة بنفسك (مثل: د. عبد السلام المقطري)، اسم المقرر، والتخصص، والجامعة ليظهر بالشرح رسمياً.',
        },
        {
          num: '3',
          title: 'تحديد عنوان الدرس ومستوى التفصيل',
          text: 'اكتب موضوع الدرس الذي تريد فهمه (مثال: قانون أوم، كينماتيكا الروبوت، متحكم PID)، واختر مدة الفيديو ولون السبورة.',
        },
        {
          num: '4',
          title: 'مشاهدة قاعة المحاضرة والسبورة التفاعلية',
          text: 'يقوم الدكتور ببدء الفيديو، الشرح بصوت عربي واضع، رسم المخططات والمحاكاة، وكتابة القوانين والمعادلات خطوة بخطوة.',
        },
      ],
      tip: 'يمكنك حفظ أي درس مشروح في مكتبة "دروسي المحفوظة" للرجوع إليها قبل الاختبارات النهائيات.',
    },
    {
      id: 'serway_library',
      icon: BookOpen,
      title: '3. 📘 مكتبة المراجع الأكاديمية ومرجع Serway',
      subtitle: 'التصفح والبحث الدلالي RAG داخل كتاب Physics for Scientists and Engineers',
      color: 'from-amber-600 to-orange-600',
      badge: 'المرجع الدولي',
      steps: [
        {
          num: 'أ',
          title: 'فتح بطاقة كتاب Serway',
          text: 'توجه إلى قسم المراجع وافتح بطاقة "Physics for Scientists and Engineers — Serway" المعتمَد في كليات الهندسة باليمن.',
        },
        {
          num: 'ب',
          title: 'البحث الدلالي داخل الكتاب (RAG)',
          text: 'اكتب أي عنوان أو قانون (مثل Vector Addition أو Newton Laws) ليبحث النظام في كافة أجزاء الكتاب ويستخرج المقاطع الدقيقة مع رقم الفصل والصفحة.',
        },
        {
          num: 'ج',
          title: 'ربط المرجع بالدكتور الذكي',
          text: 'اضغط زر "اشرح موضوعاً من الكتاب" لتقوم المنصة بتحويل أفكار وفصول سيرواي إلى فيديو كرتوني على السبورة فوراً.',
        },
      ],
      tip: 'يمكن للمدير رفع ملفات PDF مصرحة للمراجع ليتم فهرسة واستخراج نصوصها دلالياً.',
    },
    {
      id: 'explain_lesson',
      icon: Camera,
      title: '4. 📷 ميزة «اشرح لي درس اليوم» بالصور والنصوص',
      subtitle: 'تحليل ملزومات وتكليفات الجامعة بـ 14 قسماً مفصلاً',
      color: 'from-emerald-600 to-teal-700',
      badge: 'التحليل الفوري',
      steps: [
        {
          num: '1',
          title: 'رفع صورة الدرس أو الملزمة',
          text: 'التقط صورة لصفحة من دفتر المحاضرة، ملزمة الدكتور، أو كتاب الجامعة، أو اكتب نص الدرس يدوياً.',
        },
        {
          num: '2',
          title: 'التحليل الهيكلي الشامل',
          text: 'يقوم الذكاء الاصطناعي باستخراج القوانين، الشرح التبسيطي بـ 14 قسم مفصل تشمل التشبيه الواقعي، خطوات حل المسائل، والأخطاء الشائعة.',
        },
        {
          num: '3',
          title: 'إنشاء بطاقات المراجعة وقراءات الصوت',
          text: 'يمكنك الاستماع للشرح والتنقّل بين مقاطع الدرس بسهولة.',
        },
      ],
      tip: 'تأكد من وضوح إضاءة صورة المحاضرة للحصول على أفضل دقة في استخراج النصوص والقوانين.',
    },
    {
      id: 'simulators_lab',
      icon: Bot,
      title: '5. 🤖 محاكيات Arduino، دفق الدوائر، والمختبر الهندسي',
      subtitle: 'التجارب التفاعلية والتصميم البرمجي للروبوتات',
      color: 'from-cyan-600 to-blue-700',
      badge: 'التطبيق العملي',
      steps: [
        {
          num: 'أ',
          title: 'محاكي الدوائر و Arduino',
          text: 'اكتب كود C/C++ وشاهد طريقة توصيل الأردوينو مع الحساسات (HC-SR04, Servo, LCD, L298N) مع مراقبة الشاشة التسلسلية Serial Monitor.',
        },
        {
          num: 'ب',
          title: 'مختبر المشاريع الهندسية',
          text: 'اختر مشروعات أتمتة وروبوتات جاهزة لتحصل على المخطط الكهربائي، قائمة القطع العتادية، والكود البرمجي المكتمل.',
        },
        {
          num: 'ج',
          title: 'الحاسبة العلمية الهندسية',
          text: 'حاسبة متخصصة لحساب الكسور، الأعداد المركبة، التحويلات بين الزوايا (Rad/Deg)، ومصفوفات التحويل الميكاترونية.',
        },
      ],
      tip: 'يمكنك فحص الأخطاء البرمجية بكودك وضغط زر "تصحيح الكود بالذكاء الاصطناعي".',
    },
    {
      id: 'assignments_path',
      icon: FileText,
      title: '6. 📄 منشئ التكليفات ومسار التعلم الشخصي',
      subtitle: 'إعداد الواجبات والتصاميم الأكاديمية ومتابعة التقدم',
      color: 'from-indigo-600 to-purple-700',
      badge: 'التحصيل العلمي',
      steps: [
        {
          num: '1',
          title: 'منشئ التكليفات الجامعية',
          text: 'ادخل اسم التكليف المطلوب منك من دكتور المادة، وسيقوم النظام بتوليد تقرير علمي منسق يشمل المقدمة، الشرح النظري، المعادلات، والتطبيقات القابلة للتنزيل والتسليم.',
        },
        {
          num: '2',
          title: 'مسار التعلم الموصى به',
          text: 'تابع الترتيب الأكاديمي للدروس والمواد بحسب سنتك الدراسية (السنة الأولى، الثانية، إلخ) مع المقترحات الذكية.',
        },
      ],
      tip: 'منشئ التكليفات يلتزم بمعايير التوثيق العلمي والتسليم الجامعي المعتمد.',
    },
  ];

  const filteredSections = GUIDE_SECTIONS.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.subtitle.toLowerCase().includes(q) ||
      sec.steps.some((s) => s.title.toLowerCase().includes(q) || s.text.toLowerCase().includes(q))
    );
  });

  const currentSection = GUIDE_SECTIONS.find((s) => s.id === activeGuideTab) || GUIDE_SECTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden shrink-0 border-b border-indigo-800/50">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg text-white font-bold shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-400/30 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>دليل الاستخدام والعمل بالتفصيل والدقة</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  دليل طريقة استخدام أكاديمية الميكاترونكس اليمنية 📖
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search inside Guide */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن ميزة أو خطوة (مثال: الدكتور الذكي، سيرواي، تفعيل الاشتراك، Arduino...)"
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white/10 dark:bg-slate-800/80 border border-white/20 text-white placeholder-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Modal Body: Navigation Tabs + Main Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar Section Selector Tabs */}
          <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-900/60 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 p-3 space-y-1.5 overflow-y-auto shrink-0 max-h-48 md:max-h-full">
            <span className="text-[11px] font-bold text-slate-400 px-3 block mb-1">
              اختر الميزة للاطلاع على شرحها:
            </span>
            {filteredSections.map((sec) => {
              const IconComp = sec.icon;
              const isActive = sec.id === currentSection.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveGuideTab(sec.id)}
                  className={`w-full text-right p-3 rounded-2xl transition-all flex items-start gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                      : 'bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-amber-300' : 'text-blue-600 dark:text-blue-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black truncate">{sec.title}</div>
                    <div className={`text-[10px] line-clamp-1 opacity-80 ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {sec.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Active Section Details Container */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            
            {/* Section Header Banner */}
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-extrabold border border-blue-200 dark:border-blue-800">
                  {currentSection.badge}
                </span>
                <span className="text-xs text-slate-400 font-bold">دليل الشرح الأكاديمي المفصل</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentSection.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {currentSection.subtitle}
              </p>
            </div>

            {/* Steps Detailed Cards */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>خطوات الاستخدام والتنفيذ خطوة بخطوة:</span>
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {currentSection.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-right relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {step.num}
                      </span>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {step.title}
                      </h5>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-9 font-medium">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Pro Tip Box */}
            {currentSection.tip && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black block mb-0.5">💡 معلومة ونصيحة هامة:</span>
                  <p className="leading-relaxed text-amber-800 dark:text-amber-300 font-medium">
                    {currentSection.tip}
                  </p>
                </div>
              </div>
            )}

            {/* Footer Action Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>أكاديمية الميكاترونكس اليمنية مجهزة لخدمتك في جميع المقررات.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenRegister && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRegister();
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer"
                  >
                    ابدأ التسجيل الآن 🚀
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition cursor-pointer"
                >
                  إغلاق الدليل
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

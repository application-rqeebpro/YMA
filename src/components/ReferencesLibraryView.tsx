import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  FileText, 
  Layers, 
  Compass, 
  ChevronRight, 
  Bot, 
  ShieldCheck, 
  Eye, 
  Share2, 
  GraduationCap, 
  Book, 
  ArrowLeft,
  X,
  Zap,
  Sliders,
  Scale,
  Play
} from 'lucide-react';
import { StudentProfile, ReferenceBook, BookSearchResult } from '../types';

interface ReferencesLibraryViewProps {
  student: StudentProfile | null;
  onExplainTopic: (topicTitle: string, useSerway: boolean) => void;
  onOpenTool: (toolId: string) => void;
  onBackToDashboard?: () => void;
  isAdmin?: boolean;
}

export const ReferencesLibraryView: React.FC<ReferencesLibraryViewProps> = ({
  student,
  onExplainTopic,
  onOpenTool,
  onBackToDashboard,
  isAdmin = false,
}) => {
  const [books, setBooks] = useState<ReferenceBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookForSearch, setSelectedBookForSearch] = useState<ReferenceBook | null>(null);
  const [searchResults, setSearchResults] = useState<BookSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadModalBook, setUploadModalBook] = useState<ReferenceBook | null>(null);

  // Admin upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Fetch reference books from backend
  const loadBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/references');
      if (res.ok) {
        const data = await res.json();
        if (data.books) {
          setBooks(data.books);
        }
      }
    } catch (e) {
      console.error('Failed to load books:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const serwayBook = books.find(b => b.id === 'book-serway-physics') || books[0];

  // Search within book
  const handleSearchInsideBook = async (bookId: string, query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/references/${bookId}/search?q=${encodeURIComponent(query)}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.result);
      }
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Admin Upload handler
  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadModalBook) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onerror = () => {
      setUploading(false);
      setUploadError('فشل قراءة ملف PDF من جهازك.');
    };

    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        setUploadProgress(45);

        const token = localStorage.getItem('mct_admin_token') || localStorage.getItem('mct_auth_token');
        const res = await fetch(`/api/references/${uploadModalBook.id}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            fileBase64: base64Data,
            fileName: uploadFile.name,
            fileSize: uploadFile.size,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'فشلت معالجة ملف الكتاب');
        }

        setUploadProgress(100);
        setUploadSuccess(data.result?.message || 'تمت معالجة وفهرسة الكتاب بنجاح!');
        setUploadFile(null);
        await loadBooks();
      } catch (err: any) {
        setUploadError(err.message || 'حدث خطأ أثناء رفع ومعالجة الكتاب.');
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(uploadFile);
  };

  const physicsTopics = [
    { titleEn: 'Physical Quantities and Units', titleAr: 'الكميات الفيزيائية ووحدات القياس الدولية', tool: 'units' },
    { titleEn: 'Vectors', titleAr: 'المتجهات وتحليل القوى في بعدين', tool: 'math' },
    { titleEn: 'Motion in One Dimension', titleAr: 'الحركة في بعد واحد ومعادلات التسارع', tool: 'formulas' },
    { titleEn: "Newton's Laws of Motion", titleAr: 'قوانين نيوتن في الحركة ومخطط القوى الحر', tool: 'formulas' },
    { titleEn: 'Work and Energy', titleAr: 'الشغل والطاقة الميكانيكية والقدرة', tool: 'units' },
    { titleEn: 'Momentum and Collisions', titleAr: 'كمية التحرك والتصادمات المرنة وغير المرنة', tool: 'formulas' },
    { titleEn: 'Rotational Motion', titleAr: 'الحركة الدورانية وعزم القصور الذاتي', tool: 'formulas' },
    { titleEn: 'Oscillations', titleAr: 'الاهتزازات والحركة التوافقية البسيطة (SHM)', tool: 'circuits' },
    { titleEn: 'Waves', titleAr: 'حركة الموجات وسرعة الصوت وانتشارها', tool: 'circuits' },
    { titleEn: 'Electric Fields', titleAr: 'المجالات الكهربائية وقانون كولوم', tool: 'circuits' },
    { titleEn: 'Electric Potential', titleAr: 'الجهد الكهربائي وطاقة الوضع في المجال', tool: 'circuits' },
    { titleEn: 'Capacitance', titleAr: 'المكثفات والسعة الكهربائية والعوازل', tool: 'circuits' },
    { titleEn: 'Current and Resistance', titleAr: 'التيار الكهربائي والمقاومة وقانون أوم', tool: 'circuits' },
    { titleEn: 'Direct-Current Circuits', titleAr: 'دوائر التيار المستمر وقواعد كيرشوف', tool: 'circuits' },
    { titleEn: 'Magnetic Fields', titleAr: 'المجالات والقوى المغناطيسية وقانون بيوت-سافار', tool: 'circuits' },
    { titleEn: 'Electromagnetic Induction', titleAr: 'الحث الكهرومغناطيسي وقانون فاراداي ولينز', tool: 'circuits' },
    { titleEn: 'Alternating-Current Circuits', titleAr: 'دوائر التيار المتردد والممانعة RLC', tool: 'circuits' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>مكتبة المراجع الهندسية الأكاديمية</span>
            </div>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>العودة للرئيسية</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            المراجع الأكاديمية المعتمدة لمهندسي الميكاترونكس
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 max-w-3xl leading-relaxed">
            ربط مباشر بين كبرى المراجع العالمية المعتمدة في كليات الهندسة والجامعات اليمنية، وخدمات الشرح الذكي والدكتور الذكي والمحاكيات الهندسية.
          </p>
        </div>
      </div>

      {/* Main Serway Reference Card */}
      {serwayBook && (
        <div className="rounded-2xl border-2 border-blue-500/30 bg-white dark:bg-slate-900 shadow-lg overflow-hidden transition hover:border-blue-500/50">
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header info & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-18 sm:w-16 sm:h-22 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex flex-col items-center justify-center text-white shadow-md p-2 text-center shrink-0">
                  <BookOpen className="w-6 h-6 mb-1 text-blue-200" />
                  <span className="text-[9px] font-bold tracking-tight uppercase">Physics</span>
                  <span className="text-[8px] text-blue-200">Serway</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      📘 المرجع الدولي المعتمد
                    </span>
                    {serwayBook.hasFile && serwayBook.processingStatus === 'ready' ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>متوفر ومفهرس بالكامل ({serwayBook.chunksCount} مقطع)</span>
                      </span>
                    ) : serwayBook.processingStatus === 'processing' ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>قيد المعالجة والفهرسة...</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>غير مرفوع بعد (بانتظار رفع الإدارة للنسخة المصرح بها)</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white" dir="ltr">
                    Physics for Scientists and Engineers — Serway
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    الفيزياء للعلماء والمهندسين — ريموند سيرواي وجون جيوت
                  </p>
                </div>
              </div>

              {/* Admin quick upload trigger */}
              {(isAdmin || student?.role === 'admin') && (
                <button
                  onClick={() => setUploadModalBook(serwayBook)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer self-start"
                >
                  <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{serwayBook.hasFile ? 'تحديث ملف PDF' : 'رفع ملف PDF للمرجع'}</span>
                </button>
              )}
            </div>

            {/* Book Meta Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="block text-slate-400 dark:text-slate-500">المؤلفون:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Raymond A. Serway & John W. Jewett</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500">لغة الكتاب الأصلية:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">الإنجليزية (English)</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500">المجال الأكاديمي:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">الفيزياء العامة والهندسية</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500">التخصص المستفيد:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">هندسة الميكاترونكس</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {serwayBook.description}
            </p>

            {/* Availability Notice when file is not yet uploaded */}
            {!serwayBook.hasFile && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>تنبيه حالة المرجع الأكاديمي:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  ملف الكتاب لم يُرفع بعد بصيغة PDF على السيرفر، وتماشياً مع الأمانة العلمية لا تدعي المنصة وجوده قبل رفعه والتحقق من فهرسته. يمكن للطالب الاستفادة من الشرح الذكي المفصل لكافة مفردات المرجع، ويمكن لمدير الأكاديمية رفع النسخة المصرح بها في أي وقت من لوحة الإدارة.
                </p>
              </div>
            )}

            {/* Action Buttons as requested */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Button 1: افتح المرجع */}
              <button
                onClick={() => {
                  if (serwayBook.hasFile && serwayBook.fileReference) {
                    window.open(serwayBook.fileReference, '_blank');
                  } else if (serwayBook.officialExternalUrl) {
                    window.open(serwayBook.officialExternalUrl, '_blank');
                  } else {
                    alert('ملف الكتاب غير مرفوع حالياً. يرجى مراجعة إدارة المنصة لرفع النسخة المعتمدة.');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                <Book className="w-4 h-4" />
                <span>افتح المرجع</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Button 2: اشرح موضوعًا من الكتاب */}
              <button
                onClick={() => onExplainTopic('قوانين نيوتن وحركة الأجسام في مرجع Serway', true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>اشرح موضوعًا من الكتاب</span>
              </button>

              {/* Button 3: ابحث داخل الكتاب */}
              <button
                onClick={() => {
                  setSelectedBookForSearch(serwayBook);
                  setSearchQuery('');
                  setSearchResults(null);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>ابحث داخل الكتاب</span>
              </button>

              {/* Button 4: شاهد فيديوهات شرح Serway */}
              <button
                onClick={() => onOpenTool('videos')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>شاهد فيديوهات شرح المرجع 🎬</span>
              </button>

              {/* Button 5: اطلب شرح دكتور الفيزياء الذكي */}
              <button
                onClick={() => onOpenTool('smart-doctor')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>دكتور الفيزياء الذكي (سبورة تفاعلية لـ Serway) 🎓</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Physics Topics Catalog (سادسًا: موضوعات الفيزياء التي يمكن البحث عنها) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>فهرس موضوعات الفيزياء الهندسية للبحث والشرح المباشر</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              اختر أي موضوع لاستدعاء الشرح الأكاديمي، أو البحث في مرجع Serway، أو الانتقال للمحاكي المناسب:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {physicsTopics.map((topic, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition flex flex-col justify-between gap-3 group"
            >
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 block" dir="ltr">
                  {topic.titleEn}
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {topic.titleAr}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <button
                  onClick={() => onExplainTopic(topic.titleEn, true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>اشرح بالذكاء الاصطناعي</span>
                </button>

                {topic.tool && (
                  <button
                    onClick={() => onOpenTool(topic.tool)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer text-[11px]"
                    title="افتح أداة المحاكاة المرتبطة"
                  >
                    <span>المحاكي</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Inside Book Modal */}
      {selectedBookForSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  البحث داخل مرجع {selectedBookForSearch.originalTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookForSearch(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchInsideBook(selectedBookForSearch.id, searchQuery);
                  }
                }}
                placeholder="ابحث بالإنجليزية أو العربية (مثال: Vectors, Newton, Capacitance, Work)..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSearchInsideBook(selectedBookForSearch.id, searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute left-2 top-2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? 'جاري البحث...' : 'بحث'}
              </button>
            </div>

            {/* Results */}
            <div className="space-y-3 pt-2">
              {isSearching ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  <span>جاري البحث واسترجاع المقاطع الأكثر صلة...</span>
                </div>
              ) : searchResults ? (
                <div>
                  <div className="text-xs text-slate-500 mb-2">
                    تم العثور على {searchResults.totalMatches} مقطع مطابق لـ "{searchResults.query}":
                  </div>
                  {searchResults.chunks.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 text-center text-slate-500 text-sm">
                      {selectedBookForSearch.hasFile 
                        ? 'لم يتم العثور على مقاطع مباشرة مطابقة. جرب استخدام مصطلحات فيزيائية أعم.' 
                        : 'ملف الكتاب لم يُرفع بعد وفهرسته غير مكتملة. يمكنك تجربة الشرح الذكي للموضوع مباشرة.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.chunks.map((chunk, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold">
                            <span>{chunk.chapterTitle}</span>
                            {chunk.pageNumber && <span>ص {chunk.pageNumber}</span>}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed" dir="ltr">
                            {chunk.snippet}
                          </p>
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedBookForSearch(null);
                                onExplainTopic(searchQuery, true);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px]"
                            >
                              اشرح هذا المقطع باللغة العربية ←
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-4">
                  اكتب مصطلحاً فيزيائياً في شريط البحث أو اختر من الفهرس أعلاه.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin PDF Upload Modal */}
      {uploadModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  رفع ومعالجة ملف PDF لمرجع {uploadModalBook.title}
                </h3>
              </div>
              <button
                onClick={() => setUploadModalBook(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadPdf} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center space-y-2 hover:border-blue-500 transition">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  انقر لاختيار ملف PDF (الحد الأقصى 50MB)
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                        setUploadError('');
                      }
                    }}
                  />
                </label>
                {uploadFile && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    الملف المختار: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>جاري قراءة واستخراج النص وفهرسة المقاطع...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalBook(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                >
                  {uploading ? 'جاري الفهرسة والمعالجة...' : 'بدء المعالجة والفهرسة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

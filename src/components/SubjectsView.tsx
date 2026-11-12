import React, { useState } from 'react';
import { Subject, Lesson } from '../types';
import { 
  BookOpen, 
  Search, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  FileText, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface SubjectsViewProps {
  subjects: Subject[];
  lessons: Lesson[];
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  completedLessons: string[];
  onOpenExam?: (subject: Subject, lesson?: Lesson) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  lessons,
  selectedSubjectId,
  onSelectSubject,
  onSelectLesson,
  completedLessons,
  onOpenExam,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<'all' | 'الفصل الأول' | 'الفصل الثاني'>('all');

  const filteredSubjects = subjects.filter((subj) => {
    const matchesSearch = subj.name.includes(searchQuery) || subj.englishName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = semesterFilter === 'all' || subj.semester === semesterFilter;
    return matchesSearch && matchesSemester;
  });

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentSubjectLessons = lessons
    .filter((l) => l.subjectId === selectedSubjectId)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 pb-12">
      
      {/* If a subject is selected, show its lessons detail */}
      {currentSubject ? (
        <div className="space-y-6">
          {/* Back button & Subject Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <button
                onClick={() => onSelectSubject('')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="الرجوع لجميع المواد"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                    {currentSubject.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentSubject.semester}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentSubject.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                  {currentSubject.englishName}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                  {currentSubject.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onOpenExam && (
                <button
                  onClick={() => onOpenExam(currentSubject)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                  title="استخراج نموذج اختبار رسمي شامل للمادة كصورة أو ملف PDF"
                >
                  <FileText className="w-4 h-4" />
                  <span>نماذج اختبارات المادة (PDF / صورة) 📑</span>
                </button>
              )}

              <span className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {currentSubjectLessons.length} دروس منظمة
              </span>
            </div>
          </div>

          {/* Lessons list */}
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              دروس ومفردات المنهج المعتمد:
            </h2>

            {currentSubjectLessons.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500">جاري إضافة المزيد من دروس هذه المادة وفق الخطة الأكاديمية.</p>
              </div>
            ) : (
              currentSubjectLessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-extrabold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : lesson.order}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {lesson.title}
                          </h3>
                          {isCompleted && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                              مكتمل
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                          {lesson.coreConcept}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.readingTimeMinutes} دقيقة قراءة</span>
                          </span>
                          <span>•</span>
                          <span>{lesson.formulas?.length || 0} قوانين محللة</span>
                          <span>•</span>
                          <span>{lesson.quiz?.length || 0} أسئلة اختبار</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {onOpenExam && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenExam(currentSubject, lesson);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-800 dark:text-amber-300 hover:text-slate-950 text-xs font-bold transition-all border border-amber-500/30 flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="استخراج نموذج اختبار رسمي لهذا الدرس (PDF / صورة)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>نموذج اختبار (PDF / صورة)</span>
                        </button>
                      )}

                      <button className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-1.5">
                        <span>فتح الشرح الكامل (15 قسمًا)</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Overview of all subjects */
        <div className="space-y-6">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                المواد الدراسية - السنة الأولى
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                المناهج المعتمدة لقسم هندسة الميكاترونكس بالجامعات اليمنية
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSemesterFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  semesterFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSemesterFilter('الفصل الأول')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  semesterFilter === 'الفصل الأول'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الفصل الأول
              </button>
              <button
                onClick={() => setSemesterFilter('الفصل الثاني')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  semesterFilter === 'الفصل الثاني'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الفصل الثاني
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مادة أو كود أو مفهوم (مثال: فيزياء، دوائر، رياضيات)..."
              className="w-full px-4 py-3 pr-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubjects.map((subj) => (
              <div
                key={subj.id}
                onClick={() => onSelectSubject(subj.id)}
                className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                      {subj.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {subj.semester}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {subj.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-sans tracking-wide">
                      {subj.englishName}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {subj.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  {onOpenExam && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenExam(subj);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-slate-950 text-xs font-black transition-all border border-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="استعراض وتنزيل نماذج اختبارات متوقعة لهذه المادة"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>نماذج اختبارات المادة (PDF / صورة) 📑</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {subj.lessonsCount} درسًا معتمدًا
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                      <span>استعراض الدروس</span>
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};

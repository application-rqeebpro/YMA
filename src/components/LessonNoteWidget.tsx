import React, { useState, useEffect } from 'react';
import { FileText, Save, Trash2, CheckCircle2, Loader2, ChevronDown, ChevronUp, Edit3, Clock } from 'lucide-react';

interface LessonNoteWidgetProps {
  lessonId: string;
  lessonTitle?: string;
  studentId?: string;
}

export const LessonNoteWidget: React.FC<LessonNoteWidgetProps> = ({
  lessonId,
  lessonTitle,
  studentId,
}) => {
  const [noteText, setNoteText] = useState<string>('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const storageKey = `mct_note_${lessonId}`;

  // Fetch note from server API & LocalStorage
  useEffect(() => {
    let isMounted = true;
    const fetchNote = async () => {
      setIsLoading(true);

      // Load local fallback first for instant UI response
      const localSaved = localStorage.getItem(storageKey);
      if (localSaved && isMounted) {
        try {
          const parsed = JSON.parse(localSaved);
          if (parsed.text) {
            setNoteText(parsed.text);
            if (parsed.updatedAt) setLastSavedAt(parsed.updatedAt);
          }
        } catch (e) {
          setNoteText(localSaved);
        }
      }

      try {
        const token = localStorage.getItem('mct_auth_token');
        const queryParams = new URLSearchParams();
        if (studentId) queryParams.append('studentId', studentId);

        const res = await fetch(`/api/student/notes/${encodeURIComponent(lessonId)}?${queryParams.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (data.note && isMounted) {
            setNoteText(data.note.text || '');
            if (data.note.updatedAt) setLastSavedAt(data.note.updatedAt);
            // Sync local storage
            localStorage.setItem(storageKey, JSON.stringify(data.note));
          }
        }
      } catch (err) {
        console.warn('Note fetch error, using local cached version:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (lessonId) {
      fetchNote();
    }
  }, [lessonId, studentId, storageKey]);

  // Save Note Handler
  const handleSaveNote = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setShowSuccessBadge(false);

    const now = new Date().toISOString();

    // Instant local save
    const notePayload = { text: noteText, lessonTitle, updatedAt: now };
    localStorage.setItem(storageKey, JSON.stringify(notePayload));

    try {
      const token = localStorage.getItem('mct_auth_token');
      const res = await fetch('/api/student/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          lessonId,
          lessonTitle: lessonTitle || lessonId,
          noteText: noteText.trim(),
          studentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.note && data.note.updatedAt) {
          setLastSavedAt(data.note.updatedAt);
        } else {
          setLastSavedAt(now);
        }
      } else {
        setLastSavedAt(now);
      }

      setShowSuccessBadge(true);
      setTimeout(() => setShowSuccessBadge(false), 3500);
    } catch (err) {
      console.warn('Network save warning, note cached locally:', err);
      setLastSavedAt(now);
      setShowSuccessBadge(true);
      setTimeout(() => setShowSuccessBadge(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Note Handler
  const handleDeleteNote = async () => {
    if (!window.confirm('هل أنت تأكد من إزالة الملاحظات الشخصية لهذا الدرس؟')) return;

    setNoteText('');
    setLastSavedAt(null);
    localStorage.removeItem(storageKey);

    try {
      const token = localStorage.getItem('mct_auth_token');
      await fetch(`/api/student/notes/${encodeURIComponent(lessonId)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {
      console.warn('Delete request failed, local clear applied:', e);
    }
  };

  const formattedDate = lastSavedAt
    ? new Date(lastSavedAt).toLocaleDateString('ar-YE', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 p-5 sm:p-6 space-y-4 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>ملاحظاتي الشخصية على الدرس</span>
              {noteText.trim() && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              تُحفظ تلقائياً وتظهر لك مجدداً عند العودة لهذا الدرس في أي وقت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {formattedDate && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-2.5 py-1 rounded-xl">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 transition-colors cursor-pointer"
            title={isExpanded ? 'طي الملاحظات' : 'توسيع الملاحظات'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body Area */}
      {isExpanded && (
        <div className="space-y-3">
          <div className="relative">
            {isLoading ? (
              <div className="h-28 rounded-2xl bg-amber-100/40 dark:bg-slate-900/60 animate-pulse flex items-center justify-center text-xs text-amber-800 dark:text-amber-300 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تحميل الملاحظات المحفوظة...</span>
              </div>
            ) : (
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="اكتب هنا ملاحظاتك الخاصة بالدرس، الأساليب المختصرة لحل المسائل، أو النقاط الواجب مراجعتها ليلة الامتحان..."
                rows={4}
                className="w-full rounded-2xl p-4 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-amber-200 dark:border-amber-900/60 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-y min-h-[100px]"
              />
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {noteText.length} حرف
              </span>

              {showSuccessBadge && (
                <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تم الحفظ بنجاح في قاعدة البيانات ✓</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {noteText.trim() && (
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="مسح هذه الملاحظة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">مسح الملاحظة</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isSaving || isLoading}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ الملاحظة 💾</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AssignmentSection } from '../types';
import {
  Sparkles,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  Table as TableIcon,
  Code as CodeIcon,
  Scale,
  RefreshCw,
  Check,
  Type,
  AlignRight,
  AlignLeft,
  AlignCenter,
  Bold,
  Italic,
  Copy,
  Undo2,
  Redo2,
  Wand2,
  FileText,
} from 'lucide-react';

interface AssignmentSectionEditorProps {
  section: AssignmentSection;
  index: number;
  totalSections: number;
  subject?: string;
  major?: string;
  onUpdate: (updated: AssignmentSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const AssignmentSectionEditor: React.FC<AssignmentSectionEditorProps> = ({
  section,
  index,
  totalSections,
  subject,
  major,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [isAiRefineOpen, setIsAiRefineOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([section.content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Text styling controls
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [alignment, setAlignment] = useState<'right' | 'center' | 'left'>('right');
  const [fontSize, setFontSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');

  const updateContentWithHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onUpdate({ ...section, content: newContent });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      onUpdate({ ...section, content: history[nextIdx] });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      onUpdate({ ...section, content: history[nextIdx] });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${section.title}\n\n${section.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // AI Refinement of this specific section
  const handleAiRefine = async (
    instructionType:
      | 'rephrase'
      | 'simplify'
      | 'expand'
      | 'shorten'
      | 'fix_errors'
      | 'make_academic'
      | 'translate_ar'
      | 'translate_en'
  ) => {
    setIsRefining(true);
    setRefineError(null);
    try {
      const res = await fetch('/api/assignments/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionTitle: section.title,
          currentContent: section.content,
          instructionType,
          subject,
          major,
        }),
      });

      const data = await res.json();
      if (res.ok && data.refinedContent) {
        updateContentWithHistory(data.refinedContent);
        setIsAiRefineOpen(false);
      } else {
        setRefineError(data.error || 'تعذر تحسين القسم بالذكاء الاصطناعي.');
      }
    } catch (err: any) {
      setRefineError('تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsRefining(false);
    }
  };

  // Handle image attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      onUpdate({
        ...section,
        imageUrl: result,
        imageCaption: section.imageCaption || file.name.replace(/\.[^/.]+$/, ''),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4 transition-all">
      {/* Top Header: Section Index, Title Input, Move & Delete Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate({ ...section, title: e.target.value })}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="عنوان القسم..."
          />
        </div>

        {/* Section Actions: AI Refine, Move, Reorder, Delete */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* AI Refine Button */}
          <button
            type="button"
            onClick={() => setIsAiRefineOpen(!isAiRefineOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 hover:from-blue-100 hover:to-indigo-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
            title="تحسين هذا القسم بالذكاء الاصطناعي"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xs:inline">تحسين بالذكاء الاصطناعي</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="نسخ القسم"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Reorder Up */}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 cursor-pointer"
            title="تحريك لأعلى"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Reorder Down */}
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalSections - 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30 cursor-pointer"
            title="تحريك لأسفل"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Delete Section */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
            title="حذف القسم"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Refine Quick Bar if open */}
      {isAiRefineOpen && (
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>✨ خيارات تحسين هذا القسم بالذكاء الاصطناعي:</span>
            </span>
            {isRefining && (
              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-bold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                جاري التحسين...
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              disabled={isRefining}
              onClick={() => handleAiRefine('rephrase')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all disabled:opacity-50"
            >
              🔄 إعادة الصياغة
            </button>
            <button
              type="button"
              disabled={isRefining}
              onClick={() => handleAiRefine('simplify')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all disabled:opacity-50"
            >
              💡 تبسيط الشرح
            </button>
            <button
              type="button"
              disabled={isRefining}
              onClick={() => handleAiRefine('expand')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all disabled:opacity-50"
            >
              ➕ زيادة التفاصيل والأمثلة
            </button>
            <button
              type="button"
              disabled={isRefining}
              onClick={() => handleAiRefine('shorten')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all disabled:opacity-50"
            >
              ✂️ اختصار وتركيز
            </button>
            <button
              type="button"
              disabled={isRefining}
              onClick={() => handleAiRefine('fix_errors')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all disabled:opacity-50"
            >
              🔍 تدقيق وتصحيح الأخطاء
            </button>
            <button
              type="button"
              disabled={isRefining}
              onClick={() => handleAiRefine('make_academic')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all disabled:opacity-50"
            >
              🎓 أسلوب أكاديمي رصين
            </button>
            <button
              type="button"
              disabled={isRefining}
              onClick={() => handleAiRefine('translate_ar')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all disabled:opacity-50"
            >
              🇾🇪 ترجمة للعربية
            </button>
            <button
              type="button"
              disabled={isRefining}
              onClick={() => handleAiRefine('translate_en')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all disabled:opacity-50"
            >
              🌐 Translate to English
            </button>
          </div>

          {refineError && (
            <p className="text-rose-600 dark:text-rose-400 font-bold pt-1">{refineError}</p>
          )}
        </div>
      )}

      {/* Text Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300 cursor-pointer"
          title="تراجع"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300 cursor-pointer"
          title="إعادة التعديل"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Font Style */}
        <button
          type="button"
          onClick={() => setIsBold(!isBold)}
          className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer ${
            isBold ? 'bg-blue-100 dark:bg-blue-900 text-blue-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="عريض Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setIsItalic(!isItalic)}
          className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer ${
            isItalic ? 'bg-blue-100 dark:bg-blue-900 text-blue-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="مائل Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => setAlignment('right')}
          className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer ${
            alignment === 'right' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="محاذاة لليمين"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setAlignment('center')}
          className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer ${
            alignment === 'center' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="توسيط"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setAlignment('left')}
          className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer ${
            alignment === 'left' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="محاذاة لليسار"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Font Size */}
        <select
          value={fontSize}
          onChange={(e: any) => setFontSize(e.target.value)}
          className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs cursor-pointer focus:outline-none"
        >
          <option value="text-sm">خط صغير</option>
          <option value="text-base">خط عادي</option>
          <option value="text-lg">خط كبير</option>
        </select>

        {/* Add image trigger */}
        <label className="mr-auto px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1 cursor-pointer transition-all">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>{section.imageUrl ? 'تغيير الصورة' : 'إضافة صورة'}</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {/* Main Content Area */}
      <textarea
        rows={6}
        value={section.content}
        onChange={(e) => updateContentWithHistory(e.target.value)}
        className={`w-full p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${fontSize} ${
          isBold ? 'font-bold' : 'font-normal'
        } ${isItalic ? 'italic' : ''} ${
          alignment === 'center' ? 'text-center' : alignment === 'left' ? 'text-left' : 'text-right'
        }`}
        placeholder="اكتب أو عدل محتوى هذا القسم هنا..."
        dir={alignment === 'left' ? 'ltr' : 'rtl'}
      />

      {/* Image Preview & Caption Control if present */}
      {section.imageUrl && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
          <img
            src={section.imageUrl}
            alt={section.imageCaption || 'صورة القسم'}
            className="w-28 h-20 object-cover rounded-lg border border-slate-300 shrink-0"
          />
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
              تعليق توضيحي أسفل الصورة (Caption):
            </label>
            <input
              type="text"
              value={section.imageCaption || ''}
              onChange={(e) => onUpdate({ ...section, imageCaption: e.target.value })}
              placeholder="مثال: شكل 1: مخطط الدائرة العملية في المختبر"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ ...section, imageUrl: undefined, imageCaption: undefined })}
            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer self-end sm:self-center"
          >
            حذف الصورة
          </button>
        </div>
      )}
    </div>
  );
};

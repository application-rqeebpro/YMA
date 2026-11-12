import React, { useState } from 'react';
import { FormulaAnalysis } from '../types';
import { INITIAL_FORMULAS } from '../data/initialData';
import { 
  Scale, 
  Search, 
  CheckCircle2, 
  Lightbulb, 
  Cpu, 
  AlertTriangle, 
  Sparkles, 
  Calculator 
} from 'lucide-react';

interface FormulaAnalyzerViewProps {
  onAskAi: (formulaName: string) => void;
}

export const FormulaAnalyzerView: React.FC<FormulaAnalyzerViewProps> = ({ onAskAi }) => {
  const [formulas] = useState<FormulaAnalysis[]>(INITIAL_FORMULAS);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(INITIAL_FORMULAS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedFormula = formulas.find((f) => f.id === selectedFormulaId) || formulas[0];

  const filteredFormulas = formulas.filter((f) =>
    f.name.includes(searchQuery) ||
    f.formulaText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.subject.includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
          <Scale className="w-3.5 h-3.5" />
          <span>أداة هندسية حصرية لطلاب الميكاترونكس</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          محلل القوانين الفيزيائية والهندسية (Formula Analyzer)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          "لا تحفظ القانون، افهمه." اختر أي قانون فيزيائي أو كهربائي، وشاهد تفكيك رموزه، وحداته الدولية، أبعاده الميكانيكية، التحقق من تجانسه البعدي، وتطبيقاته في الروبوتات والحساسات.
        </p>
      </div>

      {/* Selector & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            اختر القانون المراد تحليله:
          </span>
          <div className="relative sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قانون (أوم، نيوتن، شغل...)"
              className="w-full px-3.5 py-2 pr-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Quick formula selection chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filteredFormulas.map((f) => {
            const isSelected = f.id === selectedFormula.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFormulaId(f.id)}
                className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span>{f.name}</span>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-mono ${
                  isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                }`} dir="ltr">
                  {f.formulaText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Dashboard for Selected Formula */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Main Equation Display */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-cyan-950/40 border border-blue-200 dark:border-blue-900">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">
              {selectedFormula.subject}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {selectedFormula.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              معادلة الأبعاد: <span className="font-mono font-bold text-purple-600 dark:text-purple-400" dir="ltr">{selectedFormula.dimensionsAnalysis.lhsDimension}</span>
            </p>
          </div>

          <div className="font-mono text-2xl sm:text-4xl font-black text-blue-700 dark:text-blue-300 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-sm text-center" dir="ltr">
            {selectedFormula.formulaText}
          </div>
        </div>

        {/* 1. تفكيك القانون إلى رموزه ووحداته وأبعاده */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>1. تفكيك القانون إلى رموزه ووحدات الـ SI وأبعاده الفيزيائية:</span>
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3">الرمز</th>
                  <th className="p-3">الاسم بالعربية</th>
                  <th className="p-3">الوحدة الدولية (SI)</th>
                  <th className="p-3">الأبعاد [M, L, T, I]</th>
                  <th className="p-3">الشرح والدور الفيزيائي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {selectedFormula.symbols.map((sym, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-black text-blue-600 dark:text-blue-400 text-base" dir="ltr">
                      {sym.symbol}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {sym.name}
                    </td>
                    <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400" dir="ltr">
                      {sym.unit} ({sym.unitSymbol})
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400" dir="ltr">
                      {sym.dimension}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 text-xs">
                      {sym.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. التحقق من تجانس الأبعاد (Dimensional Homogeneity) */}
        <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-3">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-extrabold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span>2. التحقق من صحة القانون من ناحية الأبعاد (Dimensional Homogeneity):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/40">
              <span className="text-xs text-slate-500 font-bold block mb-1">أبعاد الطرف الأيسر (LHS):</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300" dir="ltr">
                {selectedFormula.dimensionsAnalysis.lhsDimension}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/40">
              <span className="text-xs text-slate-500 font-bold block mb-1">أبعاد الطرف الأيمن (RHS):</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300" dir="ltr">
                {selectedFormula.dimensionsAnalysis.rhsDimension}
              </span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <span className="font-bold text-purple-900 dark:text-purple-200 block">شرح التجانس البعدي:</span>
            <p className="leading-relaxed">
              {selectedFormula.dimensionsAnalysis.verificationExplanation}
            </p>
          </div>
        </div>

        {/* 3. متى نستخدمه ومتى لا نستخدمه */}
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>3. متى تستخدم القانون ومتى تتجنب استخدامه؟</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
              <span className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>متى يُستخدم:</span>
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedFormula.whenToUse}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1">
              <span className="font-black text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>متى لا يُستخدم (أفخاخ شائعة):</span>
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedFormula.whenNotToUse}
              </p>
            </div>
          </div>
        </div>

        {/* 4. مثال رقمي سريع محلول خطوة بخطوة */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>4. مثال رقمي سريع محلول خطوة بخطوة:</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-xs sm:text-sm">
            <p className="font-bold text-slate-900 dark:text-white">
              {selectedFormula.simpleExample.problem}
            </p>
            <div className="space-y-1">
              {selectedFormula.simpleExample.steps.map((step, idx) => (
                <div key={idx} className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 p-2 rounded-lg text-xs" dir="ltr">
                  {step}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 font-bold text-emerald-600 dark:text-emerald-400">
              <span>النتيجة النهائية:</span>
              <span className="text-sm" dir="rtl">{selectedFormula.simpleExample.result}</span>
            </div>
          </div>
        </div>

        {/* 5. تطبيقات القانون في هندسة الميكاترونكس */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-200 dark:border-cyan-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-900 dark:text-cyan-300 font-extrabold text-sm sm:text-base">
            <Cpu className="w-5 h-5 text-cyan-600" />
            <span>5. تطبيق عملي في الميكاترونكس ({selectedFormula.engineeringExample.applicationTitle}):</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {selectedFormula.engineeringExample.description}
          </p>
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-cyan-200 dark:border-cyan-900/60 text-xs font-semibold text-cyan-800 dark:text-cyan-200">
            💡 الخلاصة الهندسية: {selectedFormula.engineeringExample.practicalTakeaway}
          </div>
        </div>

        {/* Ask AI button for this formula */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onAskAi(`اشرح لي تطبيق قانون ${selectedFormula.name} (${selectedFormula.formulaText}) في هندسة الميكاترونكس بالتفصيل`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>اسأل مساعد الميكاترونكس عن هذا القانون</span>
          </button>
        </div>

      </div>

    </div>
  );
};

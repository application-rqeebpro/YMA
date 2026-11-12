import React, { useState } from 'react';
import { Ruler, ArrowLeftRight, Lightbulb, Sparkles, BookOpen } from 'lucide-react';
import { INITIAL_UNIT_CONVERSIONS } from '../data/initialData';
import { UnitConversion } from '../types';

export const UnitConverterView: React.FC = () => {
  const [conversions] = useState<UnitConversion[]>(INITIAL_UNIT_CONVERSIONS);
  
  // Unique categories
  const categories = Array.from(new Set(conversions.map((c) => c.category))) as string[];
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  
  // Selected conversion pair within category
  const filteredConversions = conversions.filter((c) => c.category === selectedCategory);
  const [selectedConvId, setSelectedConvId] = useState<string>(filteredConversions[0]?.id || conversions[0].id);
  
  const [inputValue, setInputValue] = useState<number>(1);
  const [isReversed, setIsReversed] = useState<boolean>(false);

  const currentConversion = conversions.find((c) => c.id === selectedConvId) || conversions[0];

  // If reversed: we convert from `toUnit` back to `fromUnit` (divide by factor)
  const fromSymbol = isReversed ? currentConversion.symbolTo : currentConversion.symbolFrom;
  const toSymbol = isReversed ? currentConversion.symbolFrom : currentConversion.symbolTo;
  const fromName = isReversed ? currentConversion.toUnit : currentConversion.fromUnit;
  const toName = isReversed ? currentConversion.fromUnit : currentConversion.toUnit;

  const resultValue = isReversed 
    ? inputValue / (currentConversion.factor || 1)
    : inputValue * currentConversion.factor;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const firstInCat = conversions.find((c) => c.category === cat);
    if (firstInCat) {
      setSelectedConvId(firstInCat.id);
      setIsReversed(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          <Ruler className="w-3.5 h-3.5" />
          <span>التحويل الهندسي خطوة بخطوة</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          محلل ومحول الوحدات الهندسية (Unit Converter & Analyzer)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          لا نكتفي بإعطاء الناتج المجرد، بل نشرح لك السبب العلمي والرياضي وراء عملية التحويل وكيف تفكر فيها كمهندس باستخدام البادئات القياسية (SI Prefixes).
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = cat === selectedCategory;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Unit Conversion Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filteredConversions.map((conv) => {
          const isSelected = conv.id === currentConversion.id;
          return (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedConvId(conv.id);
                setIsReversed(false);
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {conv.fromUnit} ({conv.symbolFrom}) ← {conv.toUnit} ({conv.symbolTo})
            </button>
          );
        })}
      </div>

      {/* Converter Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Converter Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          
          {/* Input Value and From Unit */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              القيمة والوحدة الأصلية ({fromName}):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                dir="ltr"
              />
              <span className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center shrink-0" dir="ltr">
                {fromSymbol}
              </span>
            </div>
          </div>

          {/* Swap icon */}
          <div className="flex justify-center items-center">
            <button
              onClick={() => setIsReversed(!isReversed)}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 transition-colors shadow-xs cursor-pointer"
              title="عكس اتجاه التحويل"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Output Converted Value and To Unit */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              النتيجة المحسوبة ({toName}):
            </label>
            <div className="flex gap-2">
              <div
                className="w-full px-4 py-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-base font-black flex items-center overflow-x-auto text-left"
                dir="ltr"
              >
                {resultValue}
              </div>
              <span className="px-4 py-3 rounded-2xl bg-emerald-100/60 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-mono font-bold text-emerald-700 dark:text-emerald-300 flex items-center shrink-0" dir="ltr">
                {toSymbol}
              </span>
            </div>
          </div>

        </div>

        {/* Detailed Mathematical Explanation of the Conversion */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-extrabold text-sm sm:text-base">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            <span>خطوات التحويل الرياضية بالتفصيل (كيف تم الحساب؟):</span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 font-mono text-xs sm:text-sm" dir="ltr">
              {inputValue} [{fromSymbol}] {isReversed ? '÷' : '×'} {currentConversion.factor} = <strong className="text-emerald-600 dark:text-emerald-400">{resultValue} [{toSymbol}]</strong>
            </div>

            <p className="font-bold text-emerald-900 dark:text-emerald-200">
              الشرح والقاعدة الهندسية:
            </p>
            <p className="leading-relaxed">
              {currentConversion.explanation}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 font-mono" dir="ltr">
              أبعاد هذه الكمية الفيزيائية: [{currentConversion.dimension}]
            </p>
          </div>
        </div>

        {/* Standard SI Prefixes Cheat Sheet */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>جدول البادئات القياسية المعتمدة (SI Prefixes) لطلاب الميكاترونكس:</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
            {[
              { name: 'جيجا (Giga)', symbol: 'G', factor: '10⁹' },
              { name: 'ميجا (Mega)', symbol: 'M', factor: '10⁶' },
              { name: 'كيلو (Kilo)', symbol: 'k', factor: '10³' },
              { name: 'الوحدة الأساسية', symbol: '-', factor: '10⁰' },
              { name: 'سنتي (Centi)', symbol: 'c', factor: '10⁻²' },
              { name: 'مللي (Milli)', symbol: 'm', factor: '10⁻³' },
              { name: 'مايكرو (Micro)', symbol: 'µ', factor: '10⁻⁶' },
              { name: 'نانو (Nano)', symbol: 'n', factor: '10⁻⁹' },
            ].map((p, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm block" dir="ltr">
                  {p.symbol}
                </span>
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block mt-0.5">
                  {p.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5" dir="ltr">
                  {p.factor}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

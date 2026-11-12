import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  RotateCcw,
  Delete,
  Copy,
  Check,
  History,
  BookOpen,
  Sparkles,
  Zap,
  ArrowRightLeft,
  ChevronRight,
  Info,
  Layers,
  Percent,
  Divide,
  X as Multiply,
  Plus,
  Minus,
  Equal,
  Cpu,
  Compass,
  Scale,
  Gauge,
  HelpCircle,
  Trash2,
  Maximize2
} from 'lucide-react';
import {
  SafeMathParser,
  Fraction,
  Complex,
  AngleMode,
  CalculationHistoryItem,
  CalculationResult,
  UNIT_CATEGORIES,
  UnitCategory,
  convertUnits,
  calculateOhmsLaw,
  OhmsLawResult,
  roundFloat
} from '../utils/scientificCalculatorEngine';

interface ScientificCalculatorViewProps {
  onBackToDashboard?: () => void;
  onAskAiWithTopic?: (topic: string) => void;
}

type CalculatorTab = 'scientific' | 'basic' | 'fractions' | 'complex' | 'engineering' | 'history';

export const ScientificCalculatorView: React.FC<ScientificCalculatorViewProps> = ({
  onBackToDashboard,
  onAskAiWithTopic,
}) => {
  // Calculator state
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [fractionResult, setFractionResult] = useState<string | null>(null);
  const [complexResult, setComplexResult] = useState<string | null>(null);
  const [polarResult, setPolarResult] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string>('0');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [explanationSteps, setExplanationSteps] = useState<string[]>([]);
  const [isShowingExplanation, setIsShowingExplanation] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Settings & Modes
  const [activeTab, setActiveTab] = useState<CalculatorTab>('scientific');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [useArabicI, setUseArabicI] = useState<boolean>(false);
  const [isFractionDisplayMode, setIsFractionDisplayMode] = useState<boolean>(false);

  // History state
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('mct_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dedicated Fraction inputs (for visual numerator/denominator builder)
  const [fracNum1, setFracNum1] = useState<string>('3');
  const [fracDen1, setFracDen1] = useState<string>('4');
  const [fracOp, setFracOp] = useState<string>('+');
  const [fracNum2, setFracNum2] = useState<string>('2');
  const [fracDen2, setFracDen2] = useState<string>('5');
  const [fracDedicatedResult, setFracDedicatedResult] = useState<{
    fraction: string;
    mixed: string;
    decimal: number;
    steps: string[];
  } | null>(null);

  // Unit Converter state
  const [unitCategory, setUnitCategory] = useState<UnitCategory>('length');
  const [unitInputVal, setUnitInputVal] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<string>('cm');
  const [toUnit, setToUnit] = useState<string>('m');
  const [convertedUnitResult, setConvertedUnitResult] = useState<number>(1);

  // Ohm's Law state
  const [ohmsV, setOhmsV] = useState<string>('12');
  const [ohmsI, setOhmsI] = useState<string>('0.5');
  const [ohmsR, setOhmsR] = useState<string>('24');
  const [ohmsP, setOhmsP] = useState<string>('6');
  const [ohmsResult, setOhmsResult] = useState<OhmsLawResult | null>(null);

  // Frequency & Period state
  const [freqInput, setFreqInput] = useState<string>('50'); // 50 Hz
  const [periodResult, setPeriodResult] = useState<number>(0.02); // 0.02 s = 20ms

  // Screen display input ref for focus
  const displayEndRef = useRef<HTMLDivElement>(null);

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem('mct_calc_history', JSON.stringify(history));
    } catch (e) {
      console.warn('History storage error:', e);
    }
  }, [history]);

  // Scroll display to end on typing
  useEffect(() => {
    if (displayEndRef.current) {
      displayEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
    }
  }, [expression, result]);

  // Sync unit conversion when selections change
  useEffect(() => {
    const cat = UNIT_CATEGORIES[unitCategory];
    if (cat && cat.units.length >= 2) {
      const u1 = cat.units.some((u) => u.id === fromUnit) ? fromUnit : cat.units[0].id;
      const u2 = cat.units.some((u) => u.id === toUnit) ? toUnit : cat.units[1].id;
      setFromUnit(u1);
      setToUnit(u2);
      const res = convertUnits(unitCategory, u1, u2, unitInputVal);
      setConvertedUnitResult(res);
    }
  }, [unitCategory, fromUnit, toUnit, unitInputVal]);

  // Solve dedicated fraction on change
  useEffect(() => {
    try {
      const n1 = parseFloat(fracNum1) || 0;
      const d1 = parseFloat(fracDen1) || 1;
      const n2 = parseFloat(fracNum2) || 0;
      const d2 = parseFloat(fracDen2) || 1;

      if (d1 === 0 || d2 === 0) {
        setFracDedicatedResult(null);
        return;
      }

      const f1 = new Fraction(n1, d1);
      const f2 = new Fraction(n2, d2);
      let resF: Fraction;

      switch (fracOp) {
        case '+':
          resF = f1.add(f2);
          break;
        case '-':
          resF = f1.subtract(f2);
          break;
        case '×':
        case '*':
          resF = f1.multiply(f2);
          break;
        case '÷':
        case '/':
          resF = f1.divide(f2);
          break;
        default:
          resF = f1.add(f2);
      }

      setFracDedicatedResult({
        fraction: resF.toString(),
        mixed: resF.toMixedString(),
        decimal: roundFloat(resF.toDecimal(), 6),
        steps: [
          `الكسر الأول: ${f1.toString()} (${roundFloat(f1.toDecimal(), 4)})`,
          `العملية: ${fracOp}`,
          `الكسر الثاني: ${f2.toString()} (${roundFloat(f2.toDecimal(), 4)})`,
          `المقام المشترك وحساب البسط: ${resF.toString()}`,
          `النتيجة بالصيغة العشرية: ${roundFloat(resF.toDecimal(), 6)}`,
        ],
      });
    } catch (e) {
      setFracDedicatedResult(null);
    }
  }, [fracNum1, fracDen1, fracOp, fracNum2, fracDen2]);

  // Initial Ohm's Law computation
  useEffect(() => {
    handleComputeOhmsLaw();
  }, []);

  // Keyboard navigation & typing listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if user is typing in standard text inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key;

      if (/[0-9]/.test(key)) {
        appendSymbol(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        appendSymbol(key === '*' ? '×' : key === '/' ? '÷' : key);
      } else if (key === '.' || key === ',') {
        appendSymbol('.');
      } else if (key === '(' || key === ')') {
        appendSymbol(key);
      } else if (key === '^') {
        appendSymbol('^');
      } else if (key === 'i' || key === 'I') {
        appendSymbol('i');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape') {
        handleClearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, angleMode, useArabicI]);

  // ==========================================
  // CALCULATOR LOGIC
  // ==========================================

  const appendSymbol = (sym: string) => {
    setErrorMsg(null);
    setIsShowingExplanation(false);

    // If an error was showing, reset
    if (result === 'خطأ' && errorMsg) {
      setExpression(sym);
      setResult('0');
      return;
    }

    setExpression((prev) => prev + sym);
  };

  const handleClearAll = () => {
    setExpression('');
    setResult('0');
    setFractionResult(null);
    setComplexResult(null);
    setPolarResult(null);
    setErrorMsg(null);
    setExplanationSteps([]);
    setIsShowingExplanation(false);
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    setExpression((prev) => {
      if (prev.length <= 1) return '';
      // Check multi-character functions to delete in one click (e.g. "sin(", "cos(", "sqrt(")
      const multiFuncs = ['sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', 'cbrt(', 'abs('];
      for (const mf of multiFuncs) {
        if (prev.endsWith(mf)) {
          return prev.slice(0, -mf.length);
        }
      }
      return prev.slice(0, -1);
    });
  };

  const handleCalculate = () => {
    if (!expression.trim()) return;

    try {
      const parser = new SafeMathParser(angleMode, useArabicI);
      const evalRes: CalculationResult = parser.evaluate(expression);

      if (evalRes.success) {
        setResult(evalRes.resultString);
        setLastAnswer(evalRes.resultString);
        setFractionResult(evalRes.fractionString || null);
        setComplexResult(evalRes.complexString || null);
        setPolarResult(evalRes.polarString || null);
        setExplanationSteps(evalRes.steps);
        setErrorMsg(null);

        // Add to history
        const historyItem: CalculationHistoryItem = {
          id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          expression: expression,
          result: evalRes.resultString,
          fractionResult: evalRes.fractionString,
          complexResult: evalRes.complexString,
          mode: angleMode,
          timestamp: Date.now(),
        };

        setHistory((prev) => [historyItem, ...prev.slice(0, 49)]); // keep last 50
      } else {
        setResult('خطأ');
        setErrorMsg(evalRes.error || 'صيغة غير صحيحة');
        setExplanationSteps([]);
      }
    } catch (err: any) {
      setResult('خطأ');
      setErrorMsg(err.message || 'صيغة غير صحيحة');
      setExplanationSteps([]);
    }
  };

  // Toggle Fraction ↔ Decimal (Requirement 5)
  const handleToggleFractionDecimal = () => {
    if (!result || result === 'خطأ') return;

    if (fractionResult && !isFractionDisplayMode) {
      setIsFractionDisplayMode(true);
      return;
    }

    if (isFractionDisplayMode) {
      setIsFractionDisplayMode(false);
      return;
    }

    // Try converting decimal to fraction
    const num = parseFloat(result);
    if (!isNaN(num)) {
      try {
        const frac = Fraction.fromDecimal(num);
        if (frac.den !== 1) {
          setFractionResult(frac.toString());
          setIsFractionDisplayMode(true);
        }
      } catch (e) {}
    }
  };

  // Copy result to clipboard (Requirement 10)
  const handleCopyResult = () => {
    const valToCopy = isFractionDisplayMode && fractionResult ? fractionResult : result;
    if (!valToCopy || valToCopy === '0' || valToCopy === 'خطأ') return;

    navigator.clipboard.writeText(valToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Re-use item from History (Requirement 9)
  const handleReuseHistory = (item: CalculationHistoryItem, type: 'expression' | 'result') => {
    if (type === 'expression') {
      setExpression(item.expression);
      setResult(item.result);
      setFractionResult(item.fractionResult || null);
      setAngleMode(item.mode);
    } else {
      setExpression((prev) => prev + item.result);
    }
    setActiveTab('scientific');
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm('هل تريد مسح سجل العمليات الحسابية بالكامل؟')) {
      setHistory([]);
      try {
        localStorage.removeItem('mct_calc_history');
      } catch (e) {}
    }
  };

  // Compute Ohm's Law
  const handleComputeOhmsLaw = () => {
    const v = ohmsV ? parseFloat(ohmsV) : undefined;
    const i = ohmsI ? parseFloat(ohmsI) : undefined;
    const r = ohmsR ? parseFloat(ohmsR) : undefined;
    const p = ohmsP ? parseFloat(ohmsP) : undefined;

    const res = calculateOhmsLaw({ v, i, r, p });
    setOhmsResult(res);
  };

  // Compute Frequency / Period
  const handleComputeFrequency = (hz: number) => {
    if (hz <= 0) {
      setPeriodResult(0);
      return;
    }
    setPeriodResult(roundFloat(1 / hz, 6));
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in" dir="rtl">
      
      {/* 1. Header & Navigation */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 border-2 border-indigo-500/40 p-6 sm:p-8 text-white shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold text-cyan-300">
              <Calculator className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>الحاسبة العلمية الهندسية المتطورة - أكاديمية الميكاترونكس اليمنية</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>🧮 الحاسبة العلمية</span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                دقة رياضية كاملة ⚡
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              محرك حسابي علمي دقيق للعمليات الحسابية المتقدمة، <strong>الكسور الاعتيادية والمختلطة، الزوايا (DEG/RAD)، الأعداد المركبة (a + bi)، القوى والجذور، سجل العمليات، وشرح خطوات الحل الرياضية.</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>العودة للرئيسية</span>
              </button>
            )}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('scientific')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'scientific'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black scale-105'
                : 'bg-white/10 text-blue-200 hover:bg-white/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>علمية متقدمة</span>
          </button>

          <button
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'basic'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black scale-105'
                : 'bg-white/10 text-blue-200 hover:bg-white/15'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>أساسية</span>
          </button>

          <button
            onClick={() => setActiveTab('fractions')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'fractions'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black scale-105'
                : 'bg-white/10 text-blue-200 hover:bg-white/15'
            }`}
          >
            <Divide className="w-3.5 h-3.5" />
            <span>الكسور الاعتيادية (a/b)</span>
          </button>

          <button
            onClick={() => setActiveTab('complex')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'complex'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black scale-105'
                : 'bg-white/10 text-blue-200 hover:bg-white/15'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>الأعداد المركبة (a + bi)</span>
          </button>

          <button
            onClick={() => setActiveTab('engineering')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'engineering'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-black scale-105'
                : 'bg-white/10 text-blue-200 hover:bg-white/15'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>أدوات هندسية وتحويل وحدات</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'history'
                ? 'bg-slate-700 text-white shadow-md font-black scale-105'
                : 'bg-white/10 text-blue-200 hover:bg-white/15'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>السجل ({history.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN CALCULATOR WORKSPACE (SCIENTIFIC / BASIC) */}
      {/* ========================================================= */}
      {(activeTab === 'scientific' || activeTab === 'basic' || activeTab === 'complex') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT/MAIN: Calculator Screen & Keys (8 Cols on LG) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* CALCULATOR SCREEN (High-End Matte Hardware Display) */}
            <div className="rounded-3xl bg-slate-950 border-2 border-slate-700 p-5 sm:p-7 shadow-2xl text-white space-y-3 relative overflow-hidden select-none">
              
              {/* Top Status Bar: Angle Mode, Indicators, Memory */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 font-bold">
                  {/* Angle Mode Selector (DEG / RAD / GRAD) */}
                  <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700 p-0.5">
                    {(['DEG', 'RAD', 'GRAD'] as AngleMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setAngleMode(mode)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                          angleMode === mode
                            ? 'bg-cyan-500 text-slate-950 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {/* Complex Symbol Toggle (i vs ت) */}
                  {activeTab === 'complex' && (
                    <button
                      onClick={() => setUseArabicI(!useArabicI)}
                      className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold cursor-pointer"
                      title="التبديل بين رمز i اللاتيني والرمز ت العربي"
                    >
                      رمز التخيلي: {useArabicI ? 'ت (عربي)' : 'i (إنجليزي)'}
                    </button>
                  )}

                  {fractionResult && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      [a/b] كسر متاح
                    </span>
                  )}
                  {complexResult && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold">
                      [CMPLX]
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">ANS = {lastAnswer}</span>
                </div>
              </div>

              {/* Expression Input Line (Scrollable) */}
              <div className="overflow-x-auto scrollbar-none py-1 text-right" dir="ltr">
                <div className="text-sm sm:text-base font-mono text-slate-300 min-h-[1.75rem] tracking-wider whitespace-nowrap">
                  {expression ? (
                    expression
                      .replace(/\*/g, ' × ')
                      .replace(/\//g, ' ÷ ')
                      .replace(/\+/g, ' + ')
                      .replace(/-/g, ' - ')
                  ) : (
                    <span className="text-slate-600">0</span>
                  )}
                  <div ref={displayEndRef} className="inline-block w-1" />
                </div>
              </div>

              {/* Primary Result Line */}
              <div className="flex items-end justify-between gap-4 pt-1" dir="ltr">
                <div className="flex items-center gap-2">
                  {/* Action: Copy */}
                  <button
                    onClick={handleCopyResult}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer"
                    title="نسخ النتيجة إلى الحافظة"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* Action: Fraction ↔ Decimal */}
                  {fractionResult && (
                    <button
                      onClick={handleToggleFractionDecimal}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 font-mono text-xs font-bold transition-all cursor-pointer"
                      title="التحويل بين الصيغة العشرية والكسر الاعتيادي (F ↔ D)"
                    >
                      F ↔ D
                    </button>
                  )}

                  {/* Action: Explain Solution */}
                  {explanationSteps.length > 0 && (
                    <button
                      onClick={() => setIsShowingExplanation(!isShowingExplanation)}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isShowingExplanation
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-blue-950/60 text-blue-300 hover:bg-blue-900/80 border-blue-800'
                      }`}
                      title="عرض خطوات الحل الرياضية خطوة بخطوة"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>شرح الحل</span>
                    </button>
                  )}
                </div>

                {/* Big Result Text */}
                <div className="text-right">
                  {errorMsg ? (
                    <div className="text-rose-400 font-bold text-sm sm:text-base animate-shake" dir="rtl">
                      ⚠️ {errorMsg}
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-5xl font-black text-cyan-400 font-mono tracking-tight break-all">
                      {isFractionDisplayMode && fractionResult ? fractionResult : result}
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Vertical Fraction Display (When result is a fraction) */}
              {fractionResult && fractionResult.includes('/') && (
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
                  <span className="font-bold">الصيغة الكسرية الرأسية:</span>
                  <div className="flex items-center gap-3 font-mono font-black text-sm">
                    {/* Visual Vertical Fraction Rendering */}
                    <div className="inline-flex flex-col items-center justify-center">
                      <span className="border-b-2 border-emerald-400 px-2 pb-0.5 text-center leading-none">
                        {fractionResult.split('/')[0]}
                      </span>
                      <span className="pt-0.5 text-center leading-none">
                        {fractionResult.split('/')[1]}
                      </span>
                    </div>
                    <span className="text-slate-400">=</span>
                    <span className="text-white">{result}</span>
                  </div>
                </div>
              )}

              {/* Complex Number Extra Visual Breakdown (Magnitude |z|, Polar) */}
              {complexResult && (
                <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-xs text-purple-200 space-y-1.5" dir="rtl">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
                    <span>📌 المقدار والزاوية القطبية (Polar):</span>
                    <span className="font-mono text-cyan-300 text-sm">{polarResult}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-purple-300 border-t border-purple-900/60 pt-1">
                    <span>المقياس |z| = {result.includes('+') || result.includes('-') ? roundFloat(Math.sqrt(Math.pow(parseFloat(result.split(/[\+\-]/)[0]) || 0, 2) + Math.pow(parseFloat(result.split(/[\+\-]/)[1]) || 0, 2))) : result}</span>
                    <span>الصيغة الديكارتية: {complexResult}</span>
                  </div>
                </div>
              )}
            </div>

            {/* KEYPAD GRID */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
              
              {/* Scientific Functions Row (Visible in Scientific & Complex modes) */}
              {(activeTab === 'scientific' || activeTab === 'complex') && (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2 text-xs">
                  {/* Row 1: Trig */}
                  <button
                    onClick={() => appendSymbol('sin(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    sin
                  </button>
                  <button
                    onClick={() => appendSymbol('cos(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    cos
                  </button>
                  <button
                    onClick={() => appendSymbol('tan(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    tan
                  </button>
                  <button
                    onClick={() => appendSymbol('log(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    log
                  </button>
                  <button
                    onClick={() => appendSymbol('ln(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    ln
                  </button>
                  <button
                    onClick={() => appendSymbol('^')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    xʸ
                  </button>

                  {/* Row 2: Inverse Trig & Roots */}
                  <button
                    onClick={() => appendSymbol('asin(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-[11px]"
                  >
                    sin⁻¹
                  </button>
                  <button
                    onClick={() => appendSymbol('acos(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-[11px]"
                  >
                    cos⁻¹
                  </button>
                  <button
                    onClick={() => appendSymbol('atan(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-[11px]"
                  >
                    tan⁻¹
                  </button>
                  <button
                    onClick={() => appendSymbol('sqrt(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer font-serif"
                  >
                    √x
                  </button>
                  <button
                    onClick={() => appendSymbol('cbrt(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer font-serif"
                  >
                    ∛x
                  </button>
                  <button
                    onClick={() => appendSymbol('^2')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    x²
                  </button>

                  {/* Row 3: Powers, Exp & Constants */}
                  <button
                    onClick={() => appendSymbol('^3')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    x³
                  </button>
                  <button
                    onClick={() => appendSymbol('1/(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-[11px]"
                  >
                    1/x
                  </button>
                  <button
                    onClick={() => appendSymbol('10^(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    10ˣ
                  </button>
                  <button
                    onClick={() => appendSymbol('exp(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    eˣ
                  </button>
                  <button
                    onClick={() => appendSymbol('pi')}
                    className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 font-black text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer font-serif"
                  >
                    π
                  </button>
                  <button
                    onClick={() => appendSymbol('e')}
                    className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 font-black text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer font-serif"
                  >
                    e
                  </button>

                  {/* Row 4: Complex unit 'i', Abs, Factorial */}
                  <button
                    onClick={() => appendSymbol('i')}
                    className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 font-black text-purple-700 dark:text-purple-300 transition-colors cursor-pointer text-sm font-mono shadow-xs"
                    title="الوحدة التخيلية للأعداد المركبة i (أو ت)"
                  >
                    i
                  </button>
                  <button
                    onClick={() => appendSymbol('abs(')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer text-[11px]"
                  >
                    |x|
                  </button>
                  <button
                    onClick={() => appendSymbol('!')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer font-bold"
                  >
                    n!
                  </button>
                  <button
                    onClick={() => appendSymbol('%')}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    %
                  </button>
                  <button
                    onClick={() => appendSymbol('(')}
                    className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-black text-slate-900 dark:text-white transition-colors cursor-pointer text-sm"
                  >
                    (
                  </button>
                  <button
                    onClick={() => appendSymbol(')')}
                    className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-black text-slate-900 dark:text-white transition-colors cursor-pointer text-sm"
                  >
                    )
                  </button>
                </div>
              )}

              {/* Primary 4x5 Keypad (Digits & Core Operations) */}
              <div className="grid grid-cols-4 gap-2 text-base sm:text-lg font-bold">
                {/* Row 1 */}
                <button
                  onClick={handleClearAll}
                  className="h-13 sm:h-15 rounded-2xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-black transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  AC
                </button>
                <button
                  onClick={handleBackspace}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Delete className="w-5 h-5" />
                </button>
                <button
                  onClick={() => appendSymbol('/')}
                  className="h-13 sm:h-15 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-black transition-all cursor-pointer shadow-xs active:scale-95 text-xl"
                >
                  ÷
                </button>
                <button
                  onClick={() => appendSymbol('*')}
                  className="h-13 sm:h-15 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-black transition-all cursor-pointer shadow-xs active:scale-95 text-xl"
                >
                  ×
                </button>

                {/* Row 2: 7 8 9 - */}
                <button
                  onClick={() => appendSymbol('7')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  7
                </button>
                <button
                  onClick={() => appendSymbol('8')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  8
                </button>
                <button
                  onClick={() => appendSymbol('9')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  9
                </button>
                <button
                  onClick={() => appendSymbol('-')}
                  className="h-13 sm:h-15 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-black transition-all cursor-pointer shadow-xs active:scale-95 text-2xl"
                >
                  -
                </button>

                {/* Row 3: 4 5 6 + */}
                <button
                  onClick={() => appendSymbol('4')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  4
                </button>
                <button
                  onClick={() => appendSymbol('5')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  5
                </button>
                <button
                  onClick={() => appendSymbol('6')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  6
                </button>
                <button
                  onClick={() => appendSymbol('+')}
                  className="h-13 sm:h-15 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-black transition-all cursor-pointer shadow-xs active:scale-95 text-xl"
                >
                  +
                </button>

                {/* Row 4: 1 2 3 ANS */}
                <button
                  onClick={() => appendSymbol('1')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  1
                </button>
                <button
                  onClick={() => appendSymbol('2')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  2
                </button>
                <button
                  onClick={() => appendSymbol('3')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  3
                </button>
                <button
                  onClick={() => appendSymbol(lastAnswer)}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  ANS
                </button>

                {/* Row 5: 0 . () = */}
                <button
                  onClick={() => appendSymbol('0')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={() => appendSymbol('.')}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  .
                </button>
                <button
                  onClick={() => {
                    // Smart parentheses insert: open if even or previous was operator
                    const openCount = (expression.match(/\(/g) || []).length;
                    const closeCount = (expression.match(/\)/g) || []).length;
                    if (openCount > closeCount && !/[\+\-\*\/\(]$/.test(expression)) {
                      appendSymbol(')');
                    } else {
                      appendSymbol('(');
                    }
                  }}
                  className="h-13 sm:h-15 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-sm transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  ( )
                </button>
                <button
                  onClick={handleCalculate}
                  className="h-13 sm:h-15 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
                >
                  =
                </button>
              </div>
            </div>

            {/* Educational Step-by-Step Explanation Drawer (Requirement 13) */}
            {isShowingExplanation && explanationSteps.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-blue-500/40 shadow-xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                      خطوات الحل الرياضي المفصلة
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsShowingExplanation(false)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  {explanationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-slate-800 dark:text-blue-100 leading-relaxed font-medium"
                    >
                      {step}
                    </div>
                  ))}
                </div>

                {onAskAiWithTopic && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      هل ترغب في فهم أعمق وتطبيق هندسي لهذه المسألة؟
                    </span>
                    <button
                      onClick={() => onAskAiWithTopic(`اشرح لي بالتفصيل المفهوم الرياضي والهندسي للمعادلة: ${expression} = ${result}`)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform hover:scale-105"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>سؤال المساعد الذكي</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Quick Presets, Formulas & Recent History (4 Cols on LG) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Quick Math Shortcuts Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>أمثلة سريعة جاهزة للاختبار:</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => { setExpression('2 + 3 * 4'); setResult('14'); }}
                  className="p-2.5 rounded-xl text-right bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="font-mono text-cyan-600 dark:text-cyan-400">2 + 3 × 4</div>
                  <div className="text-[10px] text-slate-400">ترتيب العمليات = 14</div>
                </button>

                <button
                  onClick={() => { setExpression('sqrt(144)'); setResult('12'); }}
                  className="p-2.5 rounded-xl text-right bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="font-mono text-cyan-600 dark:text-cyan-400">√144</div>
                  <div className="text-[10px] text-slate-400">الجذر التربيعي = 12</div>
                </button>

                <button
                  onClick={() => { setExpression('sin(30)'); setAngleMode('DEG'); setResult('0.5'); }}
                  className="p-2.5 rounded-xl text-right bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="font-mono text-cyan-600 dark:text-cyan-400">sin(30°)</div>
                  <div className="text-[10px] text-slate-400">مثلثات = 0.5</div>
                </button>

                <button
                  onClick={() => { setExpression('3/4 + 2/5'); setResult('23/20'); setFractionResult('23/20'); }}
                  className="p-2.5 rounded-xl text-right bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="font-mono text-cyan-600 dark:text-cyan-400">3/4 + 2/5</div>
                  <div className="text-[10px] text-slate-400">جمع الكسور = 23/20</div>
                </button>

                <button
                  onClick={() => { setExpression('(3 + 2i) + (4 - i)'); setResult('7 + i'); setComplexResult('7 + i'); }}
                  className="p-2.5 rounded-xl text-right bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="font-mono text-purple-600 dark:text-purple-400">(3+2i) + (4-i)</div>
                  <div className="text-[10px] text-slate-400">مركب = 7 + i</div>
                </button>

                <button
                  onClick={() => { setExpression('abs(3 + 4i)'); setResult('5'); }}
                  className="p-2.5 rounded-xl text-right bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="font-mono text-purple-600 dark:text-purple-400">|3 + 4i|</div>
                  <div className="text-[10px] text-slate-400">المقدار = 5</div>
                </button>
              </div>
            </div>

            {/* Mini History Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>آخر العمليات الحسابية:</span>
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    عرض الكل
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  لا توجد عمليات سابقة بعد. العمليات المحسوبة ستظهر هنا تلقائياً.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleReuseHistory(item, 'expression')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 transition-all cursor-pointer space-y-0.5 group"
                    >
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                        {item.expression}
                      </div>
                      <div className="text-sm font-mono font-black text-blue-600 dark:text-cyan-400 flex items-center justify-between">
                        <span>= {item.result}</span>
                        <span className="text-[10px] text-slate-400 font-sans group-hover:text-blue-600">إعادة استخدام ↵</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DEDICATED FRACTIONS WORKSPACE (Requirement 5) */}
      {/* ========================================================= */}
      {activeTab === 'fractions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Divide className="w-5 h-5 text-emerald-500" />
                <span>حاسبة الكسور الاعتيادية والمختلطة مع الإدخال البصري</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                أدخل البسط والمقام بصرياً بشكل منفصل، مع توحيد المقامات التلقائي والتحويل بين الكسر والعدد العشري.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('scientific')}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer self-start"
            >
              العودة للحاسبة العلمية ↵
            </button>
          </div>

          {/* Interactive Visual Fraction Builder */}
          <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500/40 shadow-inner space-y-6">
            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              
              {/* Fraction 1 (Numerator / Denominator) */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400">الكسر الأول</span>
                <div className="flex flex-col items-center w-24 sm:w-28 space-y-1">
                  <input
                    type="number"
                    value={fracNum1}
                    onChange={(e) => setFracNum1(e.target.value)}
                    placeholder="البسط"
                    className="w-full h-12 text-center text-lg font-mono font-black rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="w-full h-1 bg-emerald-500 rounded-full" />
                  <input
                    type="number"
                    value={fracDen1}
                    onChange={(e) => setFracDen1(e.target.value)}
                    placeholder="المقام"
                    className="w-full h-12 text-center text-lg font-mono font-black rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Operator Selector */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400">العملية</span>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-800">
                  {['+', '-', '×', '÷'].map((op) => (
                    <button
                      key={op}
                      onClick={() => setFracOp(op)}
                      className={`w-10 h-10 rounded-lg text-lg font-black transition-all cursor-pointer ${
                        fracOp === op
                          ? 'bg-emerald-600 text-white shadow-md scale-105'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/40'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fraction 2 (Numerator / Denominator) */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400">الكسر الثاني</span>
                <div className="flex flex-col items-center w-24 sm:w-28 space-y-1">
                  <input
                    type="number"
                    value={fracNum2}
                    onChange={(e) => setFracNum2(e.target.value)}
                    placeholder="البسط"
                    className="w-full h-12 text-center text-lg font-mono font-black rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="w-full h-1 bg-emerald-500 rounded-full" />
                  <input
                    type="number"
                    value={fracDen2}
                    onChange={(e) => setFracDen2(e.target.value)}
                    placeholder="المقام"
                    className="w-full h-12 text-center text-lg font-mono font-black rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

            </div>

            {/* Fraction Result Display */}
            {fracDedicatedResult ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-bold text-lg">=</span>
                    {/* Visual Vertical Fraction */}
                    <div className="inline-flex flex-col items-center justify-center font-mono font-black text-2xl text-emerald-600 dark:text-emerald-400">
                      <span className="border-b-2 border-emerald-500 px-3 pb-1 text-center leading-none">
                        {fracDedicatedResult.fraction.split('/')[0]}
                      </span>
                      <span className="pt-1 text-center leading-none">
                        {fracDedicatedResult.fraction.split('/')[1] || '1'}
                      </span>
                    </div>

                    {fracDedicatedResult.mixed !== fracDedicatedResult.fraction && (
                      <div className="text-sm font-bold text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                        أو: {fracDedicatedResult.mixed} (مختلط)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-bold">القيمة العشرية:</div>
                      <div className="text-xl font-mono font-black text-cyan-600 dark:text-cyan-400">
                        {fracDedicatedResult.decimal}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setExpression(`${fracNum1}/${fracDen1} ${fracOp === '×' ? '*' : fracOp === '÷' ? '/' : fracOp} ${fracNum2}/${fracDen2}`);
                        setResult(fracDedicatedResult.fraction);
                        setFractionResult(fracDedicatedResult.fraction);
                        setActiveTab('scientific');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-transform hover:scale-105"
                    >
                      إرسال للحاسبة ↵
                    </button>
                  </div>
                </div>

                {/* Explanation Steps */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400 block">خطوات الحساب الجبري للكسر:</span>
                  {fracDedicatedResult.steps.map((st, idx) => (
                    <div key={idx} className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-rose-500 font-bold">
                ⚠️ لا يمكن أن يكون المقام صفراً في أي من الكسرين.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DEDICATED COMPLEX NUMBERS WORKSPACE (Requirement 7) */}
      {/* ========================================================= */}
      {activeTab === 'complex' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-500" />
                <span>الأعداد المركبة وأنظمة التحكم والميكاترونكس (Complex Numbers a + bi)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                جمع، طرح، ضرب، قسمة، حساب المقياس |z|، المرافق Conjugate، والتحويل بين الإحداثيات الديكارتية والقطبية (Cartesian ↔ Polar).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-purple-900 dark:text-purple-200">
                1. العمليات الجبرية الأساسية
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                اكتب في شاشة الحاسبة: <code>(3 + 2i) + (4 - i)</code> أو <code>(2 + 3i) * (1 - i)</code> واحصل فوراً على الناتج الديكارتي والقطبي.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-purple-900 dark:text-purple-200">
                2. المقياس |z| وزاوية الطور ∠
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                استخدم دالة <code>abs(3 + 4i)</code> لحساب الوتر، ويتم إظهار زاوية الطور بالدرجات (°DEG) أو الراديان (rad) حسب الوضع المحدد.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-purple-900 dark:text-purple-200">
                3. المرافق الرياضي (Conjugate)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                عكس إشارة الجزء التخيلي: <code>conj(3 + 4i) = 3 - 4i</code> وهو أساسي لحساب المعاوقات في دوائر التيار المتردد AC.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ENGINEERING TOOLS & UNIT CONVERTER (Requirements 15 & 16) */}
      {/* ========================================================= */}
      {activeTab === 'engineering' && (
        <div className="space-y-6">
          
          {/* Unit Converter Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                <span>محول الوحدات الفيزيائية والهندسية المعتمد</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تحويل دقيق ومباشر لوحدات الطول، الزمن، الكتلة، الزوايا، السرعة، الطاقة، والقدرة.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(UNIT_CATEGORIES) as UnitCategory[]).map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => setUnitCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    unitCategory === catKey
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {UNIT_CATEGORIES[catKey].title}
                </button>
              ))}
            </div>

            {/* Converter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-bold text-slate-500">القيمة والوحدة الأصلية:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={unitInputVal}
                    onChange={(e) => setUnitInputVal(parseFloat(e.target.value) || 0)}
                    className="w-1/2 h-12 px-3 text-base font-mono font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-1/2 h-12 px-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {UNIT_CATEGORIES[unitCategory].units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center justify-center">
                <button
                  onClick={() => {
                    const temp = fromUnit;
                    setFromUnit(toUnit);
                    setToUnit(temp);
                  }}
                  className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  title="عكس الوحدات"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-bold text-slate-500">الوحدة الهدف والنتيجة:</label>
                <div className="flex items-center gap-2">
                  <div className="w-1/2 h-12 px-3 flex items-center justify-start text-base font-mono font-black text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
                    {convertedUnitResult}
                  </div>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-1/2 h-12 px-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {UNIT_CATEGORIES[unitCategory].units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ohm's Law Calculator Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>حاسبة قانون أوم والقدرة الكهربائية (V = I · R & P = V · I)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                أدخل أي قيمتين لحساب المجهولين الآخرين فوراً مع القوانين التطبيقية لمشاريع الميكاترونكس.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <label className="text-xs font-bold text-slate-500">الجهد الكهربائي (V - Volt):</label>
                <input
                  type="number"
                  value={ohmsV}
                  onChange={(e) => { setOhmsV(e.target.value); }}
                  placeholder="V"
                  className="w-full h-10 px-3 font-mono font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <label className="text-xs font-bold text-slate-500">التيار (I - Ampere):</label>
                <input
                  type="number"
                  value={ohmsI}
                  onChange={(e) => { setOhmsI(e.target.value); }}
                  placeholder="I"
                  className="w-full h-10 px-3 font-mono font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <label className="text-xs font-bold text-slate-500">المقاومة (R - Ohm Ω):</label>
                <input
                  type="number"
                  value={ohmsR}
                  onChange={(e) => { setOhmsR(e.target.value); }}
                  placeholder="R"
                  className="w-full h-10 px-3 font-mono font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <label className="text-xs font-bold text-slate-500">القدرة (P - Watt):</label>
                <input
                  type="number"
                  value={ohmsP}
                  onChange={(e) => { setOhmsP(e.target.value); }}
                  placeholder="P"
                  className="w-full h-10 px-3 font-mono font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleComputeOhmsLaw}
              className="px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-xs sm:text-sm cursor-pointer transition-transform hover:scale-105"
            >
              حساب قانون أوم ⚡
            </button>

            {ohmsResult && (
              <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-900 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-3 text-yellow-950 dark:text-yellow-200 font-mono font-bold">
                <span>V = {ohmsResult.v} V</span>
                <span>I = {ohmsResult.i} A</span>
                <span>R = {ohmsResult.r} Ω</span>
                <span>P = {ohmsResult.p} W</span>
              </div>
            )}
          </div>

          {/* Frequency & Period Calculator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-cyan-500" />
              <span>التردد والزمن الدوري (f = 1/T & T = 1/f)</span>
            </h2>
            <div className="flex items-center gap-4 max-w-md">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-slate-500 font-bold">التردد (Hz):</label>
                <input
                  type="number"
                  value={freqInput}
                  onChange={(e) => {
                    setFreqInput(e.target.value);
                    handleComputeFrequency(parseFloat(e.target.value) || 0);
                  }}
                  className="w-full h-11 px-3 font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-slate-500 font-bold">الزمن الدوري T (s):</label>
                <div className="h-11 px-3 flex items-center font-mono font-bold text-cyan-500 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {periodResult} ثانية ({periodResult * 1000} ms)
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 6. HISTORY VIEW (Requirement 9) */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>سجل العمليات الحسابية المحفوظة محلياً</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                يمكنك إعادة استخدام أي عملية أو نسخ نتيجتها أو حذفها من السجل.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح السجل</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('scientific')}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
              >
                العودة للحاسبة ↵
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <History className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-bold text-sm">سجل العمليات فارغ حالياً.</p>
              <p className="text-xs">أي عملية رياضية تحسبها سيتم حفظها هنا تلقائياً دون الحاجة لقاعدة بيانات.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 p-3 rounded-2xl transition-colors cursor-pointer group"
                  onClick={() => handleReuseHistory(item, 'expression')}
                >
                  <div className="space-y-1">
                    <div className="font-mono text-sm sm:text-base text-slate-700 dark:text-slate-300">
                      {item.expression}
                    </div>
                    <div className="font-mono font-black text-lg sm:text-xl text-blue-600 dark:text-cyan-400">
                      = {item.result}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>وضع الزاوية: {item.mode}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString('ar-YE')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.result);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
                    </button>

                    <button
                      onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="حذف من السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

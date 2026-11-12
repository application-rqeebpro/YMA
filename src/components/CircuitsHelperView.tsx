import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  Layers, 
  HelpCircle, 
  Calculator, 
  Lightbulb, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CircuitsHelperView: React.FC = () => {
  // Ohm's law state: V, I, R
  const [ohmV, setOhmV] = useState<number>(12);
  const [ohmI, setOhmI] = useState<number>(0.5);
  const [ohmR, setOhmR] = useState<number>(24);
  const [ohmTarget, setOhmTarget] = useState<'V' | 'I' | 'R'>('V');

  // Resistors state: R1, R2, R3
  const [r1, setR1] = useState<number>(100);
  const [r2, setR2] = useState<number>(200);
  const [r3, setR3] = useState<number>(300);
  const [resistorMode, setResistorMode] = useState<'series' | 'parallel'>('series');

  // Voltage Divider state: Vin, R1, R2 -> Vout
  const [vin, setVin] = useState<number>(10);
  const [vdivR1, setVdivR1] = useState<number>(1000);
  const [vdivR2, setVdivR2] = useState<number>(2000);

  // Calculate Ohm's Law
  let calculatedOhm = 0;
  if (ohmTarget === 'V') {
    calculatedOhm = ohmI * ohmR;
  } else if (ohmTarget === 'I') {
    calculatedOhm = ohmR !== 0 ? ohmV / ohmR : 0;
  } else if (ohmTarget === 'R') {
    calculatedOhm = ohmI !== 0 ? ohmV / ohmI : 0;
  }

  // Calculate Resistors
  let rEquiv = 0;
  if (resistorMode === 'series') {
    rEquiv = r1 + r2 + r3;
  } else {
    // Parallel: 1 / (1/R1 + 1/R2 + 1/R3)
    const invSum = (1 / (r1 || 1)) + (1 / (r2 || 1)) + (1 / (r3 || 1));
    rEquiv = invSum > 0 ? 1 / invSum : 0;
  }

  // Voltage Divider
  const vout = (vin * vdivR2) / (vdivR1 + vdivR2 || 1);

  // Power calculations
  const power = ohmV * ohmI;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-800">
          <Zap className="w-3.5 h-3.5" />
          <span>مختبر الدوائر الكهربائية 1 التفاعلي</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          أدوات وحاسبات الدوائر الكهربائية (Electrical Circuits Lab)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          حسابات تفاعلية لقانون أوم، مقاومات التوالي والتوازي، مجزئ الجهد، والقدرة الكهربائية مع خطوات الحل الهندسية.
        </p>
      </div>

      {/* Grid of Interactive Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tool 1: Ohm's Law Calculator */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>1. حاسبة قانون أوم والقدرة:</span>
            </h2>
            <span className="font-mono font-bold text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded" dir="ltr">
              V = I × R
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500">اختر المجهول المراد حسابه:</span>
            <button
              onClick={() => setOhmTarget('V')}
              className={`px-3 py-1 rounded-lg transition-all ${
                ohmTarget === 'V' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              الجهد (V)
            </button>
            <button
              onClick={() => setOhmTarget('I')}
              className={`px-3 py-1 rounded-lg transition-all ${
                ohmTarget === 'I' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              التيار (I)
            </button>
            <button
              onClick={() => setOhmTarget('R')}
              className={`px-3 py-1 rounded-lg transition-all ${
                ohmTarget === 'R' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              المقاومة (R)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {ohmTarget !== 'V' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الجهد V (Volt):</label>
                <input
                  type="number"
                  value={ohmV}
                  onChange={(e) => setOhmV(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                  dir="ltr"
                />
              </div>
            )}

            {ohmTarget !== 'I' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">التيار I (Ampere):</label>
                <input
                  type="number"
                  step="0.01"
                  value={ohmI}
                  onChange={(e) => setOhmI(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                  dir="ltr"
                />
              </div>
            )}

            {ohmTarget !== 'R' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المقاومة R (Ohm Ω):</label>
                <input
                  type="number"
                  value={ohmR}
                  onChange={(e) => setOhmR(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                  dir="ltr"
                />
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">الناتج المحسوب:</span>
              <span className="font-mono font-black text-xl text-blue-600 dark:text-blue-400" dir="ltr">
                {calculatedOhm.toFixed(3)} {ohmTarget === 'V' ? 'V' : ohmTarget === 'I' ? 'A' : 'Ω'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-xs">
              <span className="text-slate-500">القدرة الكهربائية المستهلكة (P = V × I):</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400" dir="ltr">
                {power.toFixed(3)} W (واط)
              </span>
            </div>
          </div>
        </div>

        {/* Tool 2: Series & Parallel Resistors */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>2. حساب المقاومة المكافئة (Req):</span>
            </h2>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setResistorMode('series')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  resistorMode === 'series' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                توالي (Series)
              </button>
              <button
                onClick={() => setResistorMode('parallel')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  resistorMode === 'parallel' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                توازي (Parallel)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">R1 (Ω):</label>
              <input
                type="number"
                value={r1}
                onChange={(e) => setR1(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">R2 (Ω):</label>
              <input
                type="number"
                value={r2}
                onChange={(e) => setR2(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">R3 (Ω):</label>
              <input
                type="number"
                value={r3}
                onChange={(e) => setR3(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">المقاومة المكافئة (Req):</span>
              <span className="font-mono font-black text-xl text-indigo-600 dark:text-indigo-400" dir="ltr">
                {rEquiv.toFixed(2)} Ω
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {resistorMode === 'series'
                ? 'في التوالي: تجمع المقاومات (Req = R1 + R2 + R3)، وتكون المقاومة الكلية أكبر من أكبر مقاومة.'
                : 'في التوازي: 1/Req = 1/R1 + 1/R2 + 1/R3، وتكون المقاومة الكلية دائماً أصغر من أصغر مقاومة.'}
            </p>
          </div>
        </div>

        {/* Tool 3: Voltage Divider */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <span>3. مجزئ الجهد (Voltage Divider):</span>
            </h2>
            <span className="font-mono font-bold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded" dir="ltr">
              Vout = Vin × R2 / (R1+R2)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vin (V):</label>
              <input
                type="number"
                value={vin}
                onChange={(e) => setVin(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">R1 (Ω):</label>
              <input
                type="number"
                value={vdivR1}
                onChange={(e) => setVdivR1(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">R2 (Ω):</label>
              <input
                type="number"
                value={vdivR2}
                onChange={(e) => setVdivR2(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">جهد الخرج (Vout):</span>
              <span className="font-mono font-black text-xl text-emerald-600 dark:text-emerald-400" dir="ltr">
                {vout.toFixed(2)} V
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 استخدام ميكاترونكس حيوي: يستخدم مجزئ الجهد لقراءة الحساسات التناظرية (مثل المقاومة الضوئية LDR وحساس الحرارة NTC) وتخفيض الإشارات 5V إلى 3.3V لتدخل بأمان إلى المتحكمات الدقيقة مثل ESP32.
            </p>
          </div>
        </div>

        {/* Tool 4: Electrical Symbols Reference */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>4. دليل الرموز الكهربائية القياسية:</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {[
              { name: 'مقاومة (Resistor)', symbol: 'R - [Ω]', desc: 'تعيق تدفق التيار' },
              { name: 'مكثف (Capacitor)', symbol: 'C - [F]', desc: 'يخزن طاقة كهروستاتيكية' },
              { name: 'ملف (Inductor)', symbol: 'L - [H]', desc: 'يخزن طاقة مغناطيسية' },
              { name: 'مصدر جهد مستمر (DC)', symbol: 'V - [V]', desc: 'بطارية ثابتة القطبية' },
              { name: 'مصدر متردد (AC)', symbol: '~ [V]', desc: 'جهد جيبي متغير' },
              { name: 'دايود (Diode)', symbol: 'D', desc: 'يمرر التيار باتجاه واحد' },
              { name: 'تأريض (Ground)', symbol: 'GND', desc: 'المرجع الصفري 0V' },
              { name: 'مفتاح (Switch)', symbol: 'SW', desc: 'فتح وغلق الدائرة' },
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block" dir="ltr">
                  {item.symbol}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block mt-0.5">
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

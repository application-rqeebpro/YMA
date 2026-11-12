import React, { useState } from 'react';
import { Binary, Calculator, CheckCircle2, Lightbulb, Compass, Sparkles } from 'lucide-react';

export const MathHelperView: React.FC = () => {
  // Quadratic equation: ax^2 + bx + c = 0
  const [qa, setQa] = useState<number>(1);
  const [qb, setQb] = useState<number>(-5);
  const [qc, setQc] = useState<number>(6);

  // Vector resolution: Vx, Vy -> R, theta
  const [vx, setVx] = useState<number>(3);
  const [vy, setVy] = useState<number>(4);

  // Solve quadratic
  const delta = qb * qb - 4 * qa * qc;
  let root1: number | null = null;
  let root2: number | null = null;
  let rootType = '';

  if (qa !== 0) {
    if (delta > 0) {
      root1 = (-qb + Math.sqrt(delta)) / (2 * qa);
      root2 = (-qb - Math.sqrt(delta)) / (2 * qa);
      rootType = 'جذران حقيقيان مختلفان';
    } else if (delta === 0) {
      root1 = -qb / (2 * qa);
      root2 = root1;
      rootType = 'جذر حقيقي واحد مكرر';
    } else {
      rootType = 'جذران مركبان (تخيليان)';
    }
  }

  // Vector calculation
  const vMag = Math.sqrt(vx * vx + vy * vy);
  const vAngleRad = Math.atan2(vy, vx);
  const vAngleDeg = (vAngleRad * 180) / Math.PI;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
          <Binary className="w-3.5 h-3.5" />
          <span>الرياضيات الهندسية 1 لميكاترونكس</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          حاسبة ومحلل الرياضيات للميكاترونكس (Engineering Math Solver)
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          حل المعادلات الرياضية، تحليل المتجهات ثنائية الأبعاد، واسترجاع قواعد التفاضل والمثلثات الخاصة بخطوات واضحة ومرقمة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quadratic Solver */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span>1. حل المعادلة التربيعية خطوة بخطوة:</span>
            </h2>
            <span className="font-mono text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg" dir="ltr">
              ax² + bx + c = 0
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المعامل a:</label>
              <input
                type="number"
                value={qa}
                onChange={(e) => setQa(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المعامل b:</label>
              <input
                type="number"
                value={qb}
                onChange={(e) => setQb(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المعامل c:</label>
              <input
                type="number"
                value={qc}
                onChange={(e) => setQc(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2 text-xs sm:text-sm">
            <div className="font-bold text-purple-900 dark:text-purple-200">خطوات الحل عبر المميز (Discriminant Δ):</div>
            <div className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1 text-xs" dir="ltr">
              <div>Δ = b² - 4ac = ({qb})² - 4({qa})({qc}) = {delta}</div>
              <div>حالة المميز: {rootType}</div>
            </div>

            {delta >= 0 && root1 !== null && root2 !== null ? (
              <div className="flex justify-between items-center pt-2 font-mono font-black text-purple-700 dark:text-purple-300 text-sm" dir="ltr">
                <span>x₁ = {root1.toFixed(2)}</span>
                <span>x₂ = {root2.toFixed(2)}</span>
              </div>
            ) : (
              <div className="text-rose-600 font-bold text-xs pt-1">
                المميز سالب (Δ &lt; 0)، الجذور مركبة ولا توجد حلول حقيقية.
              </div>
            )}
          </div>
        </div>

        {/* Vector Solver */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>2. تحليل المتجهات ثنائية الأبعاد (2D Vector):</span>
            </h2>
            <span className="font-mono text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg" dir="ltr">
              R = √(Vx² + Vy²)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المركبة الأفقية (Vx):</label>
              <input
                type="number"
                value={vx}
                onChange={(e) => setVx(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المركبة الرأسية (Vy):</label>
              <input
                type="number"
                value={vy}
                onChange={(e) => setVy(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                dir="ltr"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300">مقدار المتجه المحصل (Magnitude):</span>
              <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-lg" dir="ltr">
                R = {vMag.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-800">
              <span className="font-bold text-slate-700 dark:text-slate-300">زاوية الاتجاه مع محور X الموجب:</span>
              <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-base" dir="ltr">
                θ = {vAngleDeg.toFixed(2)}°
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              تطبيق ميكاترونكس: تحديد اتجاه وسرعة ذراع الروبوت أو حركة مركبة ذاتية القيادة (AGV).
            </p>
          </div>
        </div>

      </div>

      {/* Special Angles Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>3. جدول النسب المثلثية للزوايا الخاصة (يحتاجها الطالب في كل تحليل فيزيائي):</span>
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-center text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">الزاوية (θ)</th>
                <th className="p-3">بالراديان (Rad)</th>
                <th className="p-3">sin(θ)</th>
                <th className="p-3">cos(θ)</th>
                <th className="p-3">tan(θ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono" dir="ltr">
              {[
                { deg: '0°', rad: '0', sin: '0', cos: '1', tan: '0' },
                { deg: '30°', rad: 'π/6', sin: '1/2 (0.5)', cos: '√3/2 (0.866)', tan: '1/√3 (0.577)' },
                { deg: '45°', rad: 'π/4', sin: '1/√2 (0.707)', cos: '1/√2 (0.707)', tan: '1' },
                { deg: '60°', rad: 'π/3', sin: '√3/2 (0.866)', cos: '1/2 (0.5)', tan: '√3 (1.732)' },
                { deg: '90°', rad: 'π/2', sin: '1', cos: '0', tan: 'غير معرّف (∞)' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.deg}</td>
                  <td className="p-2.5 text-blue-600 dark:text-blue-400">{row.rad}</td>
                  <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">{row.sin}</td>
                  <td className="p-2.5 text-purple-600 dark:text-purple-400 font-bold">{row.cos}</td>
                  <td className="p-2.5 text-amber-600 dark:text-amber-400">{row.tan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

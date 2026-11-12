import React, { useState } from 'react';
import { Check, Zap, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

interface SubscriptionViewProps {
  onSelectPlan: (plan: 'monthly' | 'yearly') => void;
  onBack: () => void;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  onSelectPlan,
  onBack,
  monthlyPriceUSD = 20,
  yearlyPriceUSD = 200,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'monthly' as const,
      name: 'الاشتراك الشهري',
      price: monthlyPriceUSD,
      period: 'شهر',
      tag: 'مرن وسهل التجربة',
      badgeClass: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
      description: 'مناسب للطلاب الراغبين في تجربة المنصة ومتابعة المواد شهرًا بشهر.',
      features: [
        'الوصول لجميع شروحات مواد السنة الأولى',
        'محلل القوانين الفيزيائية والأبعاد الميكانيكية',
        'محلل الوحدات والتحويلات الهندسية خطوة بخطوة',
        'اختبارات قصيرة تفاعلية بعد كل درس',
        'مساعد الميكاترونكس الذكي (أسئلة واقتراحات غير محدودة)',
        'تتبع نسبة التقدم والإنجاز في كل مادة',
      ],
    },
    {
      id: 'yearly' as const,
      name: 'الاشتراك السنوي',
      price: yearlyPriceUSD,
      period: 'سنة كاملة',
      tag: 'الخيار الأفضل والأكثر توفيرًا (وفر 40$)',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold',
      popular: true,
      description: 'يغطي الفصلين الدراسيين الأول والثاني للسنة الأولى كاملة دون انقطاع.',
      features: [
        'كل مميزات الاشتراك الشهري لمدة 365 يومًا',
        'توفير شهرين مجانًا مقارنة بالاشتراك الشهري',
        'شروحات المنهج المحدثة للفصل الأول والثاني',
        'نماذج وحلول اختبارات جامعية سابقة',
        'أولوية الإجابة وحل المسائل في مساعد الذكاء الاصطناعي',
        'دعم فني واستشارات أكاديمية عبر واتساب',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>خطط الاستثمار في مستقبلك الهندسي</span>
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          اختر خطة الاشتراك المناسبة لك
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          احصل على كود التفعيل الخاص بك للدخول الكامل إلى كافة الدروس، محلل القوانين، ومساعد الذكاء الاصطناعي.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all cursor-pointer border-2 ${
                isCurrent
                  ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-extrabold text-xs shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>الأكثر طلبًا وتوفيرًا</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-lg ${plan.badgeClass}`}>
                    {plan.tag}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isCurrent ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isCurrent && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-3">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-6 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                    {plan.price}$
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    دولار أمريكي / {plan.period}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ما ستحصل عليه:
                  </p>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(plan.id);
                  }}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span>الاشتراك الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Back button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onBack}
          className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
        >
          الرجوع لتعديل بيانات الطالب
        </button>
      </div>

    </div>
  );
};

import React, { useEffect } from 'react';
import { 
  MessageCircle, 
  CreditCard, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ExternalLink 
} from 'lucide-react';

interface PaymentInstructionsViewProps {
  studentData: {
    name: string;
    phone: string;
    university: string;
    studyLevel: string;
    major: string;
    email?: string;
  };
  selectedPlan: 'monthly' | 'yearly';
  whatsappNumber: string;
  onProceedToCodeEntry: () => void;
  onBack: () => void;
}

export const PaymentInstructionsView: React.FC<PaymentInstructionsViewProps> = ({
  studentData,
  selectedPlan,
  whatsappNumber = '785500075',
  onProceedToCodeEntry,
  onBack,
}) => {
  const planNameArabic = selectedPlan === 'yearly' ? 'سنوي (200$)' : 'شهري (20$)';

  // Construct standard prefilled WhatsApp message as requested
  const prefilledMessage = `السلام عليكم، أريد الاشتراك في أكاديمية الميكاترونكس اليمنية.
الاسم: ${studentData.name}
الجامعة: ${studentData.university}
المستوى: ${studentData.studyLevel}
رقم الهاتف: ${studentData.phone}
نوع الاشتراك: ${planNameArabic}`;

  // WhatsApp link generator (Yemeni national number: +967)
  const cleanNumber = whatsappNumber.startsWith('967') ? whatsappNumber : `967${whatsappNumber.replace(/^0+/, '')}`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  // Record subscription request on server
  useEffect(() => {
    const notifyServer = async () => {
      try {
        await fetch('/api/subscription-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: studentData.name,
            phone: studentData.phone,
            university: studentData.university,
            studyLevel: studentData.studyLevel,
            major: studentData.major,
            plan: selectedPlan,
            message: prefilledMessage,
          }),
        });
      } catch (e) {
        // non-blocking
      }
    };
    notifyServer();
  }, [studentData, selectedPlan, prefilledMessage]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(prefilledMessage);
    alert('تم نسخ نص الرسالة إلى الحافظة بنجاح!');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            تعليمات الدفع وتفعيل الاشتراك
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            تواصل مع إدارة الأكاديمية عبر واتساب لتأكيد التحويل واستلام كود التفعيل لحسابك
          </p>
        </div>

        {/* Selected Plan Summary Banner */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block">
              الخطة المختارة
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {selectedPlan === 'yearly' ? 'اشتراك سنوي (365 يومًا)' : 'اشتراك شهري (30 يومًا)'}
            </span>
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {selectedPlan === 'yearly' ? '200$' : '20$'}
            </span>
          </div>
        </div>

        {/* 4 Clear Step Guide */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>خطوات التفعيل السريع:</span>
          </h3>

          <div className="space-y-2.5">
            
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="font-bold">التواصل عبر واتساب:</span> اضغط الزر الأخضر أدناه لفتح محادثة مباشرة مع إدارة الأكاديمية على الرقم <strong>{whatsappNumber}</strong> مرفقة ببياناتك كاملة.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="font-bold">سداد الرسوم:</span> عبر الطرق المتاحة في اليمن (الكريمي إكسبرس، ون كاش، فلوسك، جيب، حساب بنكي، أو تحويل USDT).
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="font-bold">استلام كود التفعيل أو التفعيل المباشر:</span> تتحقق الإدارة من إشعار السداد وترسل لك كود التفعيل أو تقوم بتفعيل حسابك مباشرة.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="font-bold">إدخال كود التفعيل:</span> تضع الكود في صفحة "تفعيل الاشتراك" لتفتح لك كافة مواد ومحاكيات المنصة فورًا.
              </div>
            </div>

          </div>
        </div>

        {/* WhatsApp Message Preview Box */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              الرسالة الجاهزة التي ستُرسل إلى واتساب:
            </span>
            <button
              onClick={handleCopyMessage}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>نسخ النص</span>
            </button>
          </div>
          <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900" dir="rtl">
            {prefilledMessage}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          
          {/* Main WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>التواصل عبر واتساب ({whatsappNumber})</span>
            <ExternalLink className="w-4 h-4 mr-1" />
          </a>

          {/* Proceed to Code Entry Button */}
          <button
            onClick={onProceedToCodeEntry}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>استلمت كود التفعيل؟ أدخل الكود لتفعيل الحساب</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Back button */}
          <button
            onClick={onBack}
            className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            الرجوع لاختيار خطة أخرى
          </button>

        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  School, 
  Cpu, 
  Mail, 
  Lock, 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  ShieldCheck,
  Edit3,
  Save,
  Check
} from 'lucide-react';
import { StudentProfile, StudyLevel } from '../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onUpdateStudent: (updated: StudentProfile) => void;
  onOpenActivation?: () => void;
  onLogout: () => void;
}

const UNIVERSITIES = [
  'الجامعة الإماراتية الدولية – صنعاء',
  'جامعة صنعاء',
  'جامعة العلوم والتكنولوجيا',
  'الجامعة اليمنية',
  'جامعة المستقبل',
  'جامعة الملكة أروى',
  'جامعة ذمار',
  'جامعة تعز',
  'جامعة إب',
  'جامعة عدن',
  'جامعة أخرى',
] as const;

const STUDY_LEVELS: StudyLevel[] = [
  'السنة الأولى',
  'السنة الثانية',
  'السنة الثالثة',
  'السنة الرابعة',
  'السنة الخامسة',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateStudent,
  onOpenActivation,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile edit states
  const [name, setName] = useState(student.name);
  const [university, setUniversity] = useState(student.university);
  const [studyLevel, setStudyLevel] = useState<StudyLevel>(student.studyLevel);
  const [major, setMajor] = useState(student.major);
  const [email, setEmail] = useState(student.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security / Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: 'يرجى إدخال الاسم الكامل للطالب.' });
      return;
    }

    setProfileLoading(true);
    try {
      const token = localStorage.getItem('mct_auth_token');
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          university: university.trim(),
          studyLevel,
          major: major.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تحديث البيانات.');
      }

      onUpdateStudent({
        ...student,
        name: data.user.name,
        university: data.user.university,
        studyLevel: data.user.studyLevel,
        major: data.user.major,
        email: data.user.email,
      });

      setProfileMsg({ type: 'success', text: 'تم حفظ وتحديث بياناتك بنجاح!' });
      setIsEditing(false);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'حدث خطأ أثناء حفظ البيانات.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية.' });
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'يجب ألا تقل كلمة المرور الجديدة عن 4 خانات.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('mct_auth_token');
      const res = await fetch('/api/student/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تغيير كلمة المرور.');
      }

      setPasswordMsg({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'حدث خطأ أثناء تغيير كلمة المرور.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                الملف الأكاديمي للطالب
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إدارة الحساب، البيانات الشخصية، وكلمة المرور
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subscription Status Card */}
        <div className="px-6 pt-5">
          <div className={`p-4 rounded-2xl border ${
            student.isActivated 
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60' 
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${student.isActivated ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">حالة الاشتراك:</span>
                  <span className={`text-sm font-black ${student.isActivated ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {student.isActivated 
                      ? `نشط ومفعل (${student.subscriptionPlan === 'yearly' ? 'اشتراك سنوي - 365 يوم' : 'اشتراك شهري - 30 يوم'})` 
                      : 'قيد التفعيل وتأكيد الدفع'}
                  </span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">المتبقي:</span>
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {student.isActivated 
                    ? (student.remainingDays > 0 
                        ? `${student.remainingDays} يوم` 
                        : `${student.remainingHours || 0} ساعة`)
                    : 'بانتظار الكود'}
                </span>
              </div>
            </div>

            {/* Exact Dates Details */}
            {student.isActivated && (student.subscriptionStartDate || student.subscriptionEndDate) && (
              <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 grid grid-cols-2 gap-2 text-xs">
                {student.subscriptionStartDate && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">تاريخ بدء الاشتراك:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(student.subscriptionStartDate).toLocaleDateString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                {student.subscriptionEndDate && (
                  <div className="text-left">
                    <span className="text-slate-400 block text-[10px]">تاريخ الانتهاء بالدقة:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(student.subscriptionEndDate).toLocaleDateString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric' })}
                      {' '}<span className="text-[10px] text-slate-400 font-mono">({new Date(student.subscriptionEndDate).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })})</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {!student.isActivated && onOpenActivation && (
              <button
                onClick={() => {
                  onClose();
                  onOpenActivation();
                }}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>إدخال كود التفعيل وتنشيط الحساب الآن</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            البيانات الشخصية
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            الأمان وكلمة المرور
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              {profileMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                    />
                    <User className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Phone (Read Only for security) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف (معرف الحساب)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={student.phone}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium select-none"
                    />
                    <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    رقم الهاتف مرتبط بالحساب والاشتراك ولا يمكن تغييره آليًا.
                  </span>
                </div>

                {/* University */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الجامعة
                  </label>
                  <div className="relative">
                    {isEditing ? (
                      <select
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        {UNIVERSITIES.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value={university}
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium"
                      />
                    )}
                    <School className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Level & Major */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المستوى الأكاديمي
                    </label>
                    {isEditing ? (
                      <select
                        value={studyLevel}
                        onChange={(e) => setStudyLevel(e.target.value as StudyLevel)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        {STUDY_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value={studyLevel}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      التخصص
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 text-left dir-ltr"
                    />
                    <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>حفظ التعديلات</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setName(student.name);
                          setUniversity(student.university);
                          setStudyLevel(student.studyLevel);
                          setMajor(student.major);
                          setEmail(student.email || '');
                          setProfileMsg(null);
                        }}
                        className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>تعديل البيانات الشخصية</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {passwordMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كلمة المرور الحالية
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="أدخل كلمة مرورك الحالية"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                    <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة مرور جديدة (4 خانات على الأقل)"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                    <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                    <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading || !currentPassword || !newPassword}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>تحديث كلمة المرور</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold text-xs sm:text-sm cursor-pointer py-1.5 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من الحساب</span>
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { AssignmentCoverPage } from '../types';
import { Cpu, Award } from 'lucide-react';

interface AssignmentCoverProps {
  cover: AssignmentCoverPage;
  pageNumber?: number;
  totalPages?: number;
  isPrintPreview?: boolean;
}

export const AssignmentCover: React.FC<AssignmentCoverProps> = ({ cover }) => {
  return (
    <div
      data-pdf-page="true"
      className="w-full bg-white text-slate-900 mx-auto relative flex flex-col justify-between p-10 sm:p-14 shadow-lg border border-slate-200 print:border-none print:shadow-none min-h-[1050px] aspect-[1/1.414]"
      style={{ boxSizing: 'border-box' }}
      dir="rtl"
    >
      {/* Decorative Elegant Academic Borders */}
      <div className="absolute inset-4 sm:inset-6 border-2 border-slate-900/80 pointer-events-none" />
      <div className="absolute inset-5 sm:inset-7 border border-blue-600/40 pointer-events-none" />

      {/* Top Academic Header */}
      <div className="relative z-10 flex items-start justify-between border-b-2 border-slate-800 pb-6 pt-2">
        <div className="text-right space-y-1">
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
            {cover.university || 'الجامعة الإماراتية الدولية – صنعاء'}
          </h2>
          <h3 className="text-xs sm:text-sm font-bold text-slate-700">
            {cover.college || 'كلية الهندسة وتكنولوجيا المعلومات'}
          </h3>
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-600">
            قسم: {cover.major || 'هندسة الميكاترونكس'}
          </p>
        </div>

        {/* Academic Emblem / Mechatronics Seal */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-md border-2 border-amber-400">
            <Cpu className="w-8 h-8 text-amber-300" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Mechatronics Academy</span>
        </div>

        <div className="text-left space-y-1" dir="ltr">
          <p className="text-xs font-bold text-slate-800">{cover.studyLevel || 'Level 1'}</p>
          <p className="text-[11px] font-medium text-slate-500">Academic Year: {cover.academicYear || '2025/2026'}</p>
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
            {cover.assignmentTypeLabel}
          </span>
        </div>
      </div>

      {/* Center Hero: Title & Subject */}
      <div className="relative z-10 text-center my-auto py-8 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300">
          <Award className="w-4 h-4 text-blue-600" />
          <span>مادة: {cover.subject}</span>
        </div>

        <div className="space-y-3 max-w-xl mx-auto">
          <span className="block text-xs uppercase tracking-widest font-black text-slate-400">
            {cover.assignmentTypeLabel}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug tracking-tight px-4">
            {cover.assignmentTitle}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
        </div>
      </div>

      {/* Bottom Information Card: Student & Doctor Data */}
      <div className="relative z-10 mt-auto pt-6 border-t-2 border-slate-800 space-y-6">
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          {/* Student Column */}
          <div className="space-y-2 border-l border-slate-200 pl-4">
            <span className="text-xs font-black text-blue-900 block border-b border-blue-200 pb-1">
              👨‍🎓 إعداد الطالب المهندس:
            </span>
            <div className="text-sm font-extrabold text-slate-900">{cover.studentName}</div>
            {cover.studentId && (
              <div className="text-xs text-slate-600 font-medium">الرقم الأكاديمي: {cover.studentId}</div>
            )}
            <div className="text-xs text-slate-600">المستوى: {cover.studyLevel}</div>
          </div>

          {/* Supervisor / Doctor Column */}
          <div className="space-y-2 pr-2">
            <span className="text-xs font-black text-blue-900 block border-b border-blue-200 pb-1">
              👨‍🏫 إشراف الدكتور / المعلم:
            </span>
            <div className="text-sm font-extrabold text-slate-900">{cover.professorName}</div>
            <div className="text-xs text-slate-600">المادة: {cover.subject}</div>
            <div className="text-xs text-slate-600">
              تاريخ التسليم:{' '}
              <span dir="ltr" className="font-bold">
                {cover.submissionDate}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 font-medium">
          <span>أكاديمية الميكاترونكس - قسم هندسة الميكاترونكس والنظم الذكية</span>
          <span dir="ltr">Engineering Report • Cover Page</span>
        </div>
      </div>
    </div>
  );
};

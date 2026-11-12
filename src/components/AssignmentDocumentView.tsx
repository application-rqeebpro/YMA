import React from 'react';
import { AssignmentCoverPage, AssignmentSection } from '../types';
import { AssignmentCover } from './AssignmentCover';

interface AssignmentDocumentViewProps {
  cover: AssignmentCoverPage;
  sections: AssignmentSection[];
  id?: string;
  isPrintPreview?: boolean;
}

export const AssignmentDocumentView: React.FC<AssignmentDocumentViewProps> = ({
  cover,
  sections,
  id = 'assignment-document-render',
}) => {
  // Group sections into printable pages or render each major section cleanly
  return (
    <div id={id} className="w-full max-w-[820px] mx-auto space-y-8 print:space-y-0 text-slate-900 bg-transparent">
      {/* 1. Academic Cover Page */}
      <AssignmentCover cover={cover} />

      {/* 2. Main Content Pages */}
      {sections.map((section, idx) => (
        <div
          key={section.id || idx}
          data-pdf-page="true"
          className="w-full bg-white text-slate-900 mx-auto relative flex flex-col justify-between p-10 sm:p-14 shadow-lg border border-slate-200 print:border-none print:shadow-none min-h-[1050px] aspect-[1/1.414]"
          style={{ boxSizing: 'border-box' }}
          dir="rtl"
        >
          {/* Running Header */}
          <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-6 text-xs text-slate-500 font-semibold">
            <span className="line-clamp-1 max-w-sm">{cover.assignmentTitle}</span>
            <span className="text-blue-700 font-bold">{cover.subject}</span>
          </div>

          {/* Section Body */}
          <div className="space-y-5 flex-1 text-slate-800">
            {/* Section Heading */}
            <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {section.title}
              </h2>
            </div>

            {/* Render based on section type */}
            {section.type === 'code' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-mono rounded-t-xl" dir="ltr">
                  <span>{section.codeLanguage || 'C++ / Source Code'}</span>
                  <span className="text-slate-400">Engineering Code Listing</span>
                </div>
                <pre
                  dir="ltr"
                  className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm rounded-b-xl overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre"
                >
                  {section.content}
                </pre>
              </div>
            ) : section.type === 'table' && section.tableData ? (
              <div className="space-y-3">
                {section.content && (
                  <p className="text-sm text-slate-700 leading-relaxed">{section.content}</p>
                )}
                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-right border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        {section.tableData.headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-2.5 sm:p-3 font-black text-slate-900 border-l last:border-none border-slate-200">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {section.tableData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2.5 sm:p-3 text-slate-800 font-medium border-l last:border-none border-slate-200">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : section.type === 'formula' ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
                  <span className="text-xs font-bold text-blue-800 block">📐 الصيغ والمعادلات الرياضية الأساسية:</span>
                  <div className="text-sm sm:text-base font-bold font-mono whitespace-pre-line leading-relaxed">
                    {section.content}
                  </div>
                </div>
              </div>
            ) : section.type === 'components' ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-800 block">⚙️ قائمة العناصر والمكونات (Bill of Materials):</span>
                  <div className="text-sm sm:text-base whitespace-pre-line leading-relaxed font-medium">
                    {section.content}
                  </div>
                </div>
              </div>
            ) : section.type === 'circuit' ? (
              <div className="space-y-3">
                {section.imageUrl ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden p-2 bg-slate-50 text-center">
                    <img
                      src={section.imageUrl}
                      alt={section.imageCaption || 'مخطط الدائرة'}
                      className="max-h-72 mx-auto object-contain rounded-lg"
                    />
                    {section.imageCaption && (
                      <p className="text-xs text-slate-600 mt-2 font-medium">{section.imageCaption}</p>
                    )}
                  </div>
                ) : null}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ) : (
              /* Standard formatted rich text */
              <div className="space-y-3 text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                {section.imageUrl && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden p-2 bg-slate-50 text-center my-3">
                    <img
                      src={section.imageUrl}
                      alt={section.imageCaption || 'شكل توضيحي'}
                      className="max-h-64 mx-auto object-contain rounded-lg"
                    />
                    {section.imageCaption && (
                      <p className="text-xs text-slate-600 mt-2 font-medium">{section.imageCaption}</p>
                    )}
                  </div>
                )}
                <div className="leading-loose text-slate-800">{section.content}</div>
              </div>
            )}
          </div>

          {/* Running Footer & Page Number */}
          <div className="flex items-center justify-between border-t border-slate-300 pt-3 mt-6 text-xs text-slate-500 font-medium">
            <span>{cover.university} • {cover.studentName}</span>
            <span className="font-bold text-slate-800">
              صفحة {idx + 2} من {sections.length + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

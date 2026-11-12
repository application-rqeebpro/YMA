import React from 'react';
import { Terminal, Trash2, Play, Square, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface ArduinoSerialMonitorProps {
  logs: string[];
  onClearLogs: () => void;
  isRunning: boolean;
  baudRate?: number;
}

export const ArduinoSerialMonitor: React.FC<ArduinoSerialMonitorProps> = ({
  logs,
  onClearLogs,
  isRunning,
  baudRate = 9600,
}) => {
  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono flex flex-col h-64">
      {/* Header Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">Arduino Serial Monitor</span>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">
            COM3 ({baudRate} baud)
          </span>
          {isRunning && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              متصل (Active)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            مسح
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1 text-xs text-slate-300 font-mono select-text bg-slate-950">
        {logs.length === 0 ? (
          <div className="text-slate-500 text-center py-10 italic">
            لا توجد بيانات مستلمة بعد. قم بتشغيل الكود والمحاكاة لظهور قراءات Serial.print()...
          </div>
        ) : (
          logs.map((log, index) => {
            const isAlert = log.includes('⚠️') || log.includes('🚨') || log.includes('ALERT');
            const isSuccess = log.includes('✓') || log.includes('Online') || log.includes('Ready');

            return (
              <div
                key={index}
                className={`leading-relaxed ${
                  isAlert
                    ? 'text-amber-400 font-semibold'
                    : isSuccess
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 text-[10px] mr-2">
                  [{new Date().toLocaleTimeString('ar-EG', { hour12: false })}]
                </span>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

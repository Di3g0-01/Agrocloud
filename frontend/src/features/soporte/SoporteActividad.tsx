import { useState } from "react";
import { activityLogs } from "../../data/shared";
import { ActivityIcon } from "../../components/ui";

export function SoporteActividad({ isDark }: { isDark?: boolean }) {
  const [tab, setTab] = useState<"todas" | "pendientes" | "resueltas">("todas");
  const filtered = tab === "pendientes" ? activityLogs.filter(l => l.tipo !== "resuelta") : tab === "resueltas" ? activityLogs.filter(l => l.tipo === "resuelta") : activityLogs;
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-8"><h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Actividad</h1><p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Bitácora de incidencias resueltas y por resolver.</p></div>
      <div className="flex gap-2 mb-6">{(["todas", "pendientes", "resueltas"] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-lime-400 text-gray-900 font-semibold" : isDark ? "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{t}</button>)}</div>
      <div className={`border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className="relative">
          <div className={`absolute left-3.5 top-0 bottom-0 w-px ${isDark ? "bg-slate-800" : "bg-gray-100"}`} />
          <div className="space-y-6">
            {filtered.map(log => (
              <div key={log.id} className="flex items-start gap-4 relative">
                <div className="relative z-10 shrink-0"><ActivityIcon tipo={log.tipo} /></div>
                <div className={`flex-1 rounded-xl p-4 ${isDark ? "bg-slate-800/60" : "bg-gray-50"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div><p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{log.descripcion}</p><p className={`text-xs font-mono mt-1 ${isDark ? "text-lime-400" : "text-lime-600"}`}>{log.incidencia}</p></div>
                    <span className={`text-xs shrink-0 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{log.tiempo}</span>
                  </div>
                  <div className="mt-2"><span className={`text-[10px] font-medium px-2 py-0.5 rounded capitalize ${log.tipo === "resuelta" ? "bg-lime-500/20 text-lime-400 border border-lime-500/30" : log.tipo === "abierta" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : log.tipo === "asignada" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-slate-700 text-slate-300"}`}>{log.tipo}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { PriorityBadge, StatusBadge } from "../../components/ui";
import { incidents } from "../../data/shared";
import type { Incident } from "../../types/shared";

export function AdminIncidencias({ isDark }: { isDark?: boolean }) {
  const [selected, setSelected] = useState<Incident | null>(null);
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Incidencias</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestión global de incidencias de todos los clientes.</p>
        </div>
      </div>
      <div className="flex gap-6">
        <div className={`flex-1 border rounded-xl overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? "bg-slate-800/60 border-slate-800 text-slate-400" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                {["ID", "Cliente", "Instancia", "Asunto", "Prioridad", "Estado", "Fecha"].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
              {incidents.map(inc => (
                <tr
                  key={inc.id}
                  onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
                  className={`cursor-pointer transition-colors ${
                    selected?.id === inc.id
                      ? isDark ? "bg-lime-950/40" : "bg-lime-50"
                      : isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50"
                  }`}
                >
                  <td className={`px-5 py-4 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{inc.id}</td>
                  <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{inc.cliente}</td>
                  <td className={`px-5 py-4 font-mono text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inc.instancia}</td>
                  <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{inc.asunto}</td>
                  <td className="px-5 py-4"><PriorityBadge p={inc.prioridad} /></td>
                  <td className="px-5 py-4"><StatusBadge s={inc.estado} /></td>
                  <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inc.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && (
          <div className={`w-72 border rounded-xl p-5 self-start shrink-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex justify-between mb-4"><span className={`font-mono font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{selected.id}</span><button onClick={() => setSelected(null)} className="text-gray-400">✕</button></div>
            <div className="space-y-3">
              {[["Cliente", selected.cliente], ["Instancia", selected.instancia], ["Asunto", selected.asunto]].map(([k, v]) => (
                <div key={k}><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p><p className={`text-sm ${isDark ? "text-slate-200" : "text-gray-800"}`}>{v}</p></div>
              ))}
              <div><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Problema</p><p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-gray-600"}`}>{selected.problema}</p></div>
              <div><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Guía</p><p className={`text-sm leading-relaxed rounded-lg p-3 ${isDark ? "bg-lime-950/40 border border-lime-800/40 text-lime-300" : "bg-lime-50 border border-lime-100 text-gray-600"}`}>{selected.guia}</p></div>
              <div className="flex gap-2"><PriorityBadge p={selected.prioridad} /><StatusBadge s={selected.estado} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import type { Incident } from "../../types/shared";
import { getIncidencias, mapIncidenciaToIncident, actualizarIncidencia } from "../../api/incidenciasApi";
import { PriorityBadge, StatusBadge } from "../../components/ui";
import { IncidentComments } from "../../components/shared/IncidentComments";

export function SoporteIncidencias({ isDark }: { isDark?: boolean }) {
  const [filter, setFilter] = useState<"todas" | "Abierta" | "En revisión" | "Resuelta" | "Cerrada">("todas");
  const [selected, setSelected] = useState<Incident | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState("");
  const [resolutionMessage, setResolutionMessage] = useState("");
  useEffect(() => {
    const refresh = () => getIncidencias().then(data => {
      const updated = data.map(mapIncidenciaToIncident);
      setIncidents(updated);
      setSelected(current => current ? updated.find(item => item.id === current.id) ?? null : null);
    })
      .catch(() => setError("No se pudieron cargar las incidencias."));
    void refresh();
    window.addEventListener("agrocloud:incidents-updated", refresh);
    return () => window.removeEventListener("agrocloud:incidents-updated", refresh);
  }, []);
  const changeStatus = async (status: 'ABIERTA' | 'EN_REVISION' | 'RESUELTA') => {
    if (!selected) return;
    if (status === 'RESUELTA' && !resolutionMessage.trim()) {
      setError("Escribe al cliente cómo se resolvió la incidencia.");
      return;
    }
    try {
      const changed = mapIncidenciaToIncident(await actualizarIncidencia(selected.id, {
        estado: status,
        ...(status === 'RESUELTA' ? { mensajeResolucion: resolutionMessage.trim() } : {}),
      }));
      setIncidents(prev => prev.map(i => i.id === changed.id ? changed : i));
      setSelected(changed);
      setResolutionMessage("");
      setError("");
    } catch { setError("No se pudo actualizar el estado de la incidencia."); }
  };
  const filtered = filter === "todas" ? incidents : incidents.filter(i => i.estado === filter);
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-8">
        <div><h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Incidencias asignadas</h1><p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Atiende las incidencias que te asignó el administrador.</p></div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="flex gap-2 mb-6">
        {(["todas", "Abierta", "En revisión", "Resuelta", "Cerrada"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === f ? (isDark ? "bg-lime-400 text-gray-900 font-bold" : "bg-gray-900 text-white") : (isDark ? "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      <div className="flex gap-6">
        <div className={`border rounded-xl overflow-hidden ${selected ? "flex-1" : "w-full"} ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? "bg-slate-800/60 border-slate-800 text-slate-400" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                {["ID", "Cliente", "Instancia", "Asunto", "Prioridad", "Estado", "Fecha"].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
              {filtered.map(inc => (
                <tr key={inc.id} onClick={() => { setSelected(selected?.id === inc.id ? null : inc); setResolutionMessage(""); setError(""); }} className={`cursor-pointer transition-colors ${selected?.id === inc.id ? (isDark ? "bg-lime-950/40" : "bg-lime-50") : (isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50")}`}>
                  <td className={`px-5 py-4 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{inc.codigo}</td>
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
          <div className={`w-80 border rounded-xl p-6 self-start shrink-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-4"><span className={`font-mono text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{selected.codigo}</span><button onClick={() => setSelected(null)} className="text-gray-400">✕</button></div>
            <div className="space-y-4">
              {[["Cliente", selected.cliente], ["Instancia", selected.instancia], ["Plantilla", selected.plantilla], ["Asunto", selected.asunto]].map(([k, v]) => (
                <div key={k}><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p><p className={`text-sm ${isDark ? "text-slate-200" : "text-gray-800"}`}>{v}</p></div>
              ))}
              <div><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Problema</p><p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-gray-600"}`}>{selected.problema}</p></div>
              <div><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Guía</p><p className={`text-sm rounded-lg p-3 ${isDark ? "bg-lime-950/40 border border-lime-800/40 text-lime-300" : "bg-lime-50 border border-lime-100 text-gray-600"}`}>{selected.guia}</p></div>
              {selected.mensajeResolucion && <div><p className="text-xs mb-1">Mensaje enviado al cliente</p><p className="text-sm whitespace-pre-wrap">{selected.mensajeResolucion}</p></div>}
              <div className="flex gap-2"><PriorityBadge p={selected.prioridad} /><StatusBadge s={selected.estado} /></div>
              {selected.estado === 'Abierta' && <button onClick={() => changeStatus('EN_REVISION')} className="rounded-lg border px-3 py-2 text-xs">Iniciar revisión</button>}
              {selected.estado === 'En revisión' && <div className="space-y-2">
                <label htmlFor="resolution-message" className="block text-xs font-medium">Explica al cliente cómo se resolvió</label>
                <textarea id="resolution-message" value={resolutionMessage} onChange={e => setResolutionMessage(e.target.value)} maxLength={2000} rows={4} className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900" />
                <button onClick={() => changeStatus('RESUELTA')} className="rounded-lg bg-lime-400 px-3 py-2 text-xs text-gray-900">Resolver y enviar mensaje</button>
              </div>}
              <IncidentComments incidentId={selected.id} closed={selected.estado === "Cerrada"} isDark={isDark} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

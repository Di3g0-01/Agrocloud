import { useState, useEffect } from "react";
import { PriorityBadge, StatusBadge } from "../../components/ui";
import { asignarIncidencia, getIncidencias, mapIncidenciaToIncident } from "../../api/incidenciasApi";
import { listAdminUsers } from "../../api/adminUsersApi";
import type { AdminUser } from "../../api/adminUsersApi";
import type { Incident } from "../../types/shared";

export function AdminIncidencias({ isDark }: { isDark?: boolean }) {
  const [selected, setSelected] = useState<Incident | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agents, setAgents] = useState<AdminUser[]>([]);
  const [agentChoice, setAgentChoice] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const refresh = () => {
      getIncidencias().then(data => {
        const updated = data.map(mapIncidenciaToIncident);
        setIncidents(updated);
        setSelected(current => current ? updated.find(item => item.id === current.id) ?? null : null);
      })
        .catch(() => setError("No se pudieron cargar las incidencias."));
    };
    refresh();
    window.addEventListener("agrocloud:incidents-updated", refresh);
    listAdminUsers().then(data => setAgents(data.filter(user => user.role === "SOPORTE" && user.status === "ACTIVO")))
      .catch(() => setError("No se pudieron cargar los agentes de soporte."));
    return () => window.removeEventListener("agrocloud:incidents-updated", refresh);
  }, []);
  const assign = async () => {
    if (!selected || !agentChoice) { setError("Selecciona un agente de soporte activo."); return; }
    try {
      const updated = mapIncidenciaToIncident(await asignarIncidencia(selected.id, agentChoice));
      setIncidents(current => current.map(incident => incident.id === updated.id ? updated : incident));
      setSelected(updated);
      setError("");
      setNotice(`${updated.codigo} asignada a soporte.`);
    } catch { setError("No se pudo asignar la incidencia."); }
  };
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Incidencias</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestión global de incidencias de todos los clientes.</p>
        </div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg bg-lime-50 border border-lime-200 px-4 py-3 text-sm text-lime-800">{notice}</p>}
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
                  onClick={() => { setSelected(selected?.id === inc.id ? null : inc); setAgentChoice(inc.agenteId ?? ""); setNotice(""); }}
                  className={`cursor-pointer transition-colors ${
                    selected?.id === inc.id
                      ? isDark ? "bg-lime-950/40" : "bg-lime-50"
                      : isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50"
                  }`}
                >
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
          <div className={`w-72 border rounded-xl p-5 self-start shrink-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex justify-between mb-4"><span className={`font-mono font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{selected.codigo}</span><button onClick={() => setSelected(null)} className="text-gray-400">✕</button></div>
            <div className="space-y-3">
              {[["Cliente", selected.cliente], ["Instancia", selected.instancia], ["Plantilla", selected.plantilla], ["Asunto", selected.asunto]].map(([k, v]) => (
                <div key={k}><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p><p className={`text-sm ${isDark ? "text-slate-200" : "text-gray-800"}`}>{v}</p></div>
              ))}
              <div><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Problema</p><p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-gray-600"}`}>{selected.problema}</p></div>
              <div><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Guía</p><p className={`text-sm leading-relaxed rounded-lg p-3 ${isDark ? "bg-lime-950/40 border border-lime-800/40 text-lime-300" : "bg-lime-50 border border-lime-100 text-gray-600"}`}>{selected.guia}</p></div>
              <div className="flex gap-2"><PriorityBadge p={selected.prioridad} /><StatusBadge s={selected.estado} /></div>
              <div>
                <label htmlFor="assigned-agent" className={`block text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Agente de soporte</label>
                <select id="assigned-agent" value={agentChoice} onChange={event => setAgentChoice(event.target.value)} disabled={selected.estado === "Cerrada"} className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900">
                  <option value="">Seleccionar agente...</option>
                  {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.contactName || agent.email}</option>)}
                </select>
                {selected.estado !== "Cerrada" && <button onClick={assign} disabled={!agentChoice || agentChoice === selected.agenteId} className="mt-2 rounded-lg bg-lime-400 px-3 py-2 text-xs font-semibold text-gray-900 disabled:opacity-50">Asignar a soporte</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

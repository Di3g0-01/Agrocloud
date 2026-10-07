import { useState, useEffect } from "react";
import type { Incident } from "../../types/shared";
import type { InstanciaDB } from "../../types";
import { getIncidencias, mapIncidenciaToIncident, crearIncidencia, actualizarIncidencia } from "../../api/incidenciasApi";
import { getInstancias } from "../../api/instanciasApi";
import { PriorityBadge, StatusBadge } from "../../components/ui";
import { CustomSelect } from "../../components/ui/CustomSelect";

export function SoporteIncidencias({ isDark }: { isDark?: boolean }) {
  const [filter, setFilter] = useState<"todas" | "Abierta" | "En revisión" | "Resuelta">("todas");
  const [selected, setSelected] = useState<Incident | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [instances, setInstances] = useState<InstanciaDB[]>([]);
  const [error, setError] = useState("");
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [form, setForm] = useState({ cliente: "", instancia: "", plantilla: "", asunto: "", problema: "", guia: "", prioridad: "Media" as Incident["prioridad"] });
  useEffect(() => {
    getIncidencias().then(data => setIncidents(data.map(mapIncidenciaToIncident))).catch(() => setError("No se pudieron cargar las incidencias."));
    getInstancias().then(setInstances).catch(() => setError("No se pudieron cargar las instancias."));
  }, []);
  const create = async () => {
    const instance = instances.find(i => i.id === form.instancia);
    if (!instance || !form.asunto.trim() || !form.problema.trim()) { setError("Selecciona una instancia y completa asunto y problema."); return; }
    try {
      const created = await crearIncidencia({ instanciaId: instance.id, asunto: form.asunto,
        categoria: "Soporte", problema: form.problema, prioridad: form.prioridad.toUpperCase() as 'ALTA' | 'MEDIA' | 'BAJA' });
      if (form.guia.trim()) await actualizarIncidencia(created.id, { guiaDiagnostico: form.guia });
      const fresh = await getIncidencias();
      setIncidents(fresh.map(mapIncidenciaToIncident));
      setShowForm(false);
    } catch { setError("No se pudo crear la incidencia."); }
  };
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
        <div><h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Incidencias</h1><p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Registro de todas las incidencias enviadas por los clientes.</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva incidencia
        </button>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="flex gap-2 mb-6">
        {(["todas", "Abierta", "En revisión", "Resuelta"] as const).map(f => (
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
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="font-semibold text-gray-900">Nueva incidencia</h2><button onClick={() => setShowForm(false)} className="text-gray-400">✕</button></div>
            <div className="p-6 space-y-4">
              {[{ label: "Asunto", key: "asunto", placeholder: "Resumen breve" }].map(({ label, key, placeholder }) => (
                <div key={key}><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label><input value={(form as Record<string, string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" /></div>
              ))}
              <label className="block text-xs font-medium text-gray-600">Instancia
                <select value={form.instancia} onChange={e => setForm({ ...form, instancia: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white">
                  <option value="">Seleccionar instancia...</option>
                  {instances.map(i => <option key={i.id} value={i.id}>{i.cliente} · {i.nombre}</option>)}
                </select>
              </label>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Problema</label><textarea value={form.problema} onChange={e => setForm({ ...form, problema: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Guía</label><textarea value={form.guia} onChange={e => setForm({ ...form, guia: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none" /></div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prioridad</label>
                <CustomSelect
                  value={form.prioridad}
                  onChange={(val) => setForm({ ...form, prioridad: val as Incident["prioridad"] })}
                  options={["Alta", "Media", "Baja"].map(p => ({ value: p, label: p }))}
                  placeholder="Prioridad..."
                  className="w-full"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
              <button onClick={create} className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium rounded-lg text-sm">Crear incidencia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

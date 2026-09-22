import { useState } from "react";
import type { Ticket, TicketEstado, TicketPrioridad } from "../../types/cliente";
import { TICKETS_INIT, C_INSTANCIAS } from "../../data/cliente";
import { CustomSelect } from "../../components/ui/CustomSelect";

export function ClienteSoporte() {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS_INIT);
  const [search, setSearch] = useState("");
  const [detalle, setDetalle] = useState<Ticket | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmacion, setConfirmacion] = useState("");

  const [form, setForm] = useState({ asunto: "", instancia: "", categoria: "", prioridad: "Media" as TicketPrioridad, descripcion: "" });
  const [formErr, setFormErr] = useState<Partial<typeof form>>({});

  const reciente = tickets[0] ?? null;

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return t.id.toLowerCase().includes(q) || t.asunto.toLowerCase().includes(q);
  });

  const estadoColor = (e: TicketEstado) =>
    e === "Resuelta"   ? "bg-lime-100 text-lime-700 border border-lime-300"
    : e === "En proceso" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-blue-50 text-blue-600 border border-blue-200";

  function validar() {
    const err: Partial<typeof form> = {};
    if (!form.asunto.trim())      err.asunto      = "El asunto es obligatorio.";
    if (!form.instancia)          err.instancia   = "Selecciona una instancia.";
    if (!form.categoria)          err.categoria   = "Selecciona una categoría.";
    if (!form.descripcion.trim()) err.descripcion = "Describe el problema.";
    setFormErr(err);
    return Object.keys(err).length === 0;
  }

  function enviarTicket() {
    if (!validar()) return;
    const nuevo: Ticket = {
      id: `INC-${String(Math.floor(Math.random() * 900) + 100)}`,
      asunto: form.asunto, instancia: form.instancia, categoria: form.categoria,
      prioridad: form.prioridad, estado: "Abierta",
      descripcion: form.descripcion, creado: "2026-09-06", actualizado: "2026-09-06",
      historial: [{ autor: "cliente", texto: form.descripcion, fecha: "2026-09-06 12:00" }],
    };
    setTickets(prev => [nuevo, ...prev]);
    setShowNew(false);
    setForm({ asunto: "", instancia: "", categoria: "", prioridad: "Media", descripcion: "" });
    setFormErr({});
    setConfirmacion(`Incidencia ${nuevo.id} registrada correctamente. El equipo de soporte la revisará a la brevedad.`);
    setTimeout(() => setConfirmacion(""), 5000);
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Soporte</h1>
          <p className="text-sm text-gray-500 mt-1">Reporta un problema técnico o consulta el estado de tus incidencias.</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva incidencia
        </button>
      </div>

      {/* Confirmación de envío */}
      {confirmacion && (
        <div className="mb-6 bg-lime-50 border border-lime-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-lime-800">{confirmacion}</span>
        </div>
      )}

      {/* Tarjeta: incidencia más reciente */}
      {reciente && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Estado de mi incidencia más reciente</h2>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-900">{reciente.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoColor(reciente.estado)}`}>{reciente.estado}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 leading-snug">{reciente.asunto}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">
                    <span>Instancia: <span className="font-mono text-gray-600">{reciente.instancia}</span></span>
                    <span>Última actualización: <span className="text-gray-600">{reciente.actualizado}</span></span>
                    <span>Registrada: <span className="text-gray-600">{reciente.creado}</span></span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetalle(reciente)}
                className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
                Ver detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial de incidencias */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-700">Historial de incidencias</h2>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID o asunto..."
              aria-label="Buscar incidencias"
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 w-60" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-14 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Sin resultados</p>
            <p className="text-xs text-gray-400 mt-1">Ninguna incidencia coincide con tu búsqueda.</p>
            <button onClick={() => setSearch("")} className="mt-4 text-xs text-lime-600 hover:text-lime-700 font-medium">Limpiar búsqueda</button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
            <table className="min-w-max w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["ID", "Fecha", "Asunto", "Instancia", "Estado", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-center text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors text-center">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">{t.id}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{t.creado}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-800 whitespace-nowrap max-w-[240px] truncate mx-auto">{t.asunto}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-mono whitespace-nowrap">{t.instancia}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap flex justify-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoColor(t.estado)}`}>{t.estado}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button onClick={() => setDetalle(t)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mx-auto flex">
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">
              {filtered.length} incidencia{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {/* Drawer: detalle informativo del ticket */}
      {detalle && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDetalle(null)} aria-hidden="true" />
          <aside className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
            role="dialog" aria-label="Detalle de incidencia">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between shrink-0">
              <div className="min-w-0">
                <p className="font-mono font-semibold text-gray-900">{detalle.id}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug truncate">{detalle.asunto}</p>
              </div>
              <button onClick={() => setDetalle(null)} aria-label="Cerrar panel"
                className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4 shrink-0">×</button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-5">
              {/* Badges de estado */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoColor(detalle.estado)}`}>{detalle.estado}</span>
                <span className="text-xs text-gray-400">· {detalle.instancia}</span>
              </div>

              {/* Datos del ticket */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Datos de la incidencia</p>
                <div className="space-y-2">
                  {[
                    ["Categoría",         detalle.categoria],
                    ["Registrada",        detalle.creado],
                    ["Última actualización", detalle.actualizado],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-gray-800 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Descripción</p>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-3">{detalle.descripcion}</p>
              </div>

              {/* Cronología */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Cronología</p>
                <div className="space-y-4">
                  {detalle.historial.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold
                        ${h.autor === "cliente" ? "bg-lime-100 text-lime-700" : "bg-blue-100 text-blue-700"}`}>
                        {h.autor === "cliente" ? "FL" : "ST"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-gray-700">
                            {h.autor === "cliente" ? "Finca Los Pinos" : "Soporte AgroCloud"}
                          </span>
                          <span className="text-[10px] text-gray-400">{h.fecha}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{h.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 shrink-0">
              <button onClick={() => setDetalle(null)}
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors">
                Cerrar
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Modal: nueva incidencia */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-label="Nueva incidencia">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Nueva incidencia</h2>
              <button onClick={() => setShowNew(false)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="sop-asunto" className="block text-xs font-medium text-gray-600 mb-1.5">Asunto <span className="text-red-400">*</span></label>
                <input id="sop-asunto" value={form.asunto}
                  onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}
                  placeholder="Describe brevemente el problema"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${formErr.asunto ? "border-red-300" : "border-gray-200"}`} />
                {formErr.asunto && <p className="text-[10px] text-red-500 mt-1">{formErr.asunto}</p>}
              </div>
              <div>
                <label htmlFor="sop-inst" className="block text-xs font-medium text-gray-600 mb-1.5">Instancia asociada <span className="text-red-400">*</span></label>
                <CustomSelect
                  value={form.instancia}
                  onChange={(val) => setForm(f => ({ ...f, instancia: val }))}
                  options={C_INSTANCIAS.map(i => ({ value: i.nombre, label: i.nombre }))}
                  placeholder="Seleccionar instancia..."
                  className="w-full"
                />
                {formErr.instancia && <p className="text-[10px] text-red-500 mt-1">{formErr.instancia}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sop-cat" className="block text-xs font-medium text-gray-600 mb-1.5">Categoría <span className="text-red-400">*</span></label>
                  <CustomSelect
                    value={form.categoria}
                    onChange={(val) => setForm(f => ({ ...f, categoria: val }))}
                    options={["Conectividad", "Rendimiento", "Datos", "Plan", "Acceso", "Otro"].map(c => ({ value: c, label: c }))}
                    placeholder="Seleccionar..."
                    className="w-full"
                  />
                  {formErr.categoria && <p className="text-[10px] text-red-500 mt-1">{formErr.categoria}</p>}
                </div>
                <div>
                  <label htmlFor="sop-prio" className="block text-xs font-medium text-gray-600 mb-1.5">Prioridad</label>
                  <CustomSelect
                    value={form.prioridad}
                    onChange={(val) => setForm(f => ({ ...f, prioridad: val as TicketPrioridad }))}
                    options={["Alta", "Media", "Baja"].map(p => ({ value: p, label: p }))}
                    placeholder="Prioridad..."
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="sop-desc" className="block text-xs font-medium text-gray-600 mb-1.5">Descripción del problema <span className="text-red-400">*</span></label>
                <textarea id="sop-desc" value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe el problema con el mayor detalle posible..."
                  rows={4}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none ${formErr.descripcion ? "border-red-300" : "border-gray-200"}`} />
                {formErr.descripcion && <p className="text-[10px] text-red-500 mt-1">{formErr.descripcion}</p>}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => { setShowNew(false); setFormErr({}); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button onClick={enviarTicket}
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium rounded-lg text-sm transition-colors">
                Enviar incidencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

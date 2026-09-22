import { useState } from "react";
import { CustomSelect } from "../../components/ui/CustomSelect";

interface PlanItem {
  nombre: string;
  precio: string;
  storage: string;
  instancias: string;
  clientes: number;
  ingresos: string;
  estado: string;
}

export function AdminPlanes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [planes, setPlanes] = useState<PlanItem[]>([
    { nombre: "Finca", precio: "Q25", storage: "10 GB", instancias: "1", clientes: 8, ingresos: "Q200", estado: "Activo" },
    { nombre: "Productor", precio: "Q60", storage: "50 GB", instancias: "2", clientes: 14, ingresos: "Q840", estado: "Activo" },
    { nombre: "Agro Pro", precio: "Q120", storage: "100 GB", instancias: "3", clientes: 6, ingresos: "Q720", estado: "Activo" },
    { nombre: "Agro Enterprise", precio: "Q250", storage: "250 GB", instancias: "5", clientes: 3, ingresos: "Q750", estado: "Activo" },
  ]);

  // Form State
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [storage, setStorage] = useState("");
  const [instancias, setInstancias] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Activo");

  const resetForm = () => {
    setNombre("");
    setPrecio("");
    setStorage("");
    setInstancias("");
    setDescripcion("");
    setEstado("Activo");
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) return;

    const newPlan: PlanItem = {
      nombre,
      precio: precio.startsWith("Q") ? precio : `Q${precio}`,
      storage: storage ? (storage.includes("GB") ? storage : `${storage} GB`) : "20 GB",
      instancias: instancias || "1",
      clientes: 0,
      ingresos: "Q0",
      estado,
    };

    setPlanes((prev) => [...prev, newPlan]);
    resetForm();
    setModalOpen(false);
  };

  const totalIngresosNum = planes.reduce((acc, p) => {
    const val = parseInt(p.ingresos.replace(/[^0-9]/g, "")) || 0;
    return acc + val;
  }, 0);

  // Edit & Subscribers Modal State
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [viewSubscribersPlan, setViewSubscribersPlan] = useState<PlanItem | null>(null);

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setPlanes((prev) =>
      prev.map((p) => (p.nombre === editingPlan.nombre ? editingPlan : p))
    );
    setEditingPlan(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Planes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de planes comerciales de AgroCloud.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nuevo plan</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "PLANES ACTIVOS", value: String(planes.filter(p => p.estado === "Activo").length), sub: "Planes disponibles", color: "text-blue-500 bg-blue-50", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          { label: "SUSCRIPCIONES", value: "31", sub: "Activas en total", color: "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
          { label: "MÁS CONTRATADO", value: "Productor", sub: "14 suscriptores", color: "text-purple-500 bg-purple-50", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
          { label: "INGRESO MENSUAL", value: `Q${totalIngresosNum.toLocaleString()}`, sub: "Estimado total", color: "text-green-600 bg-green-50", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {planes.map(plan => (
          <div key={plan.nombre} className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${plan.estado === "Activo" ? "bg-lime-100 text-lime-700 border border-lime-300" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>{plan.estado}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-base mb-1">{plan.nombre}</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">{plan.precio}<span className="text-xs font-normal text-gray-400"> /mes</span></div>
            <div className="space-y-1.5 mt-3 mb-4">
              {[
                { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8", text: `${plan.storage} almacenamiento` },
                { icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", text: `${plan.instancias} instancia${plan.instancias !== "1" ? "s" : ""} PostgreSQL` },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
                  {f.text}
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div><p className="text-xs text-gray-400">Clientes</p><p className="text-lg font-semibold text-gray-900">{plan.clientes}</p></div>
                <div className="text-right"><p className="text-xs text-gray-400">Ingreso</p><p className="text-lg font-semibold text-lime-600">{plan.ingresos}</p></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPlan({ ...plan })}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 font-medium transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => setViewSubscribersPlan(plan)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 font-medium transition-colors cursor-pointer"
                >
                  Suscriptores
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <form onSubmit={handleCreatePlan} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Nuevo plan</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre del plan</label>
                  <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Agro Plus" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Precio mensual (Q)</label>
                  <input type="number" required value={precio} onChange={e => setPrecio(e.target.value)} placeholder="150" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Almacenamiento (GB)</label>
                  <input type="text" value={storage} onChange={e => setStorage(e.target.value)} placeholder="150" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Cant. de instancias</label>
                  <input type="number" value={instancias} onChange={e => setInstancias(e.target.value)} placeholder="4" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripción</label>
                <textarea rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción del plan..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Estado</label>
                <CustomSelect
                  value={estado}
                  onChange={(val) => setEstado(val)}
                  options={[
                    { value: "Activo", label: "Activo" },
                    { value: "Inactivo", label: "Inactivo" },
                  ]}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg text-sm font-semibold transition-colors">Guardar plan</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleUpdatePlan} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-gray-900">Editar plan: {editingPlan.nombre}</h2>
              <button type="button" onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio Mensual</label>
                <input
                  type="text"
                  required
                  value={editingPlan.precio}
                  onChange={(e) => setEditingPlan({ ...editingPlan, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Almacenamiento</label>
                <input
                  type="text"
                  required
                  value={editingPlan.storage}
                  onChange={(e) => setEditingPlan({ ...editingPlan, storage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Instancias Máximas</label>
                <input
                  type="text"
                  required
                  value={editingPlan.instancias}
                  onChange={(e) => setEditingPlan({ ...editingPlan, instancias: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                <CustomSelect
                  value={editingPlan.estado}
                  onChange={(val) => setEditingPlan({ ...editingPlan, estado: val })}
                  options={[
                    { value: "Activo", label: "Activo" },
                    { value: "Inactivo", label: "Inactivo" },
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setEditingPlan(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg text-sm font-semibold">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}

      {/* View Subscribers Modal */}
      {viewSubscribersPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Suscriptores del plan {viewSubscribersPlan.nombre}</h2>
                <p className="text-xs text-gray-400">{viewSubscribersPlan.clientes} cliente{viewSubscribersPlan.clientes !== 1 ? "s" : ""} registrado{viewSubscribersPlan.clientes !== 1 ? "s" : ""} en este plan</p>
              </div>
              <button type="button" onClick={() => setViewSubscribersPlan(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">×</button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {Array.from({ length: viewSubscribersPlan.clientes }).map((_, idx) => {
                const sampleClients = [
                  { cliente: "Finca Los Pinos", contacto: "carlos@fincalospinos.com", fecha: "Desde Jun 2026", estado: "Activo" },
                  { cliente: "Finca El Roble", contacto: "andrea@fincaelroble.com", fecha: "Desde Jun 2026", estado: "Activo" },
                  { cliente: "Café Export S.A.", contacto: "diana@cafeexport.com", fecha: "Desde Ene 2026", estado: "Suspendido" },
                  { cliente: "Agro Semillas del Sur", contacto: "contacto@semillasdelsur.com", fecha: "Desde Feb 2026", estado: "Activo" },
                  { cliente: "Cooperativa San Juan", contacto: "info@coopsanjuan.com", fecha: "Desde Mar 2026", estado: "Activo" },
                  { cliente: "Hacienda El Parral", contacto: "elparral@hacienda.com", fecha: "Desde Abr 2026", estado: "Activo" },
                  { cliente: "Cultivos del Valle S.A.", contacto: "admin@cultivosdelvalle.com", fecha: "Desde Mayo 2026", estado: "Activo" },
                  { cliente: "Finca La Esperanza", contacto: "laesperanza@finca.gt", fecha: "Desde Jun 2026", estado: "Activo" },
                  { cliente: "Agrícola Los Olivos", contacto: "losolivos@agricola.com", fecha: "Desde Jul 2026", estado: "Activo" },
                  { cliente: "Cosechas Verdes", contacto: "soporte@cosechasverdes.org", fecha: "Desde Ago 2026", estado: "Activo" },
                  { cliente: "Distribuidora del Agro", contacto: "ventas@distroagro.com", fecha: "Desde Ago 2026", estado: "Activo" },
                  { cliente: "Finca Santa Marta", contacto: "santamarta@finca.gt", fecha: "Desde Sep 2026", estado: "Activo" },
                  { cliente: "Cooperativa Altiplano", contacto: "contacto@coopaltiplano.com", fecha: "Desde Sep 2026", estado: "Activo" },
                  { cliente: "Agroindustrial El Sol", contacto: "elsol@agroindustrial.com", fecha: "Desde Sep 2026", estado: "Activo" },
                ];
                const item = sampleClients[idx % sampleClients.length];

                return (
                  <div key={idx} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-lime-100 text-lime-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {item.cliente.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{item.cliente} #{idx + 1}</p>
                        <p className="text-[10px] text-gray-400">{item.contacto} • {item.fecha}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        item.estado === "Activo"
                          ? "bg-lime-100 text-lime-700 border border-lime-300"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {item.estado}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setViewSubscribersPlan(null)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


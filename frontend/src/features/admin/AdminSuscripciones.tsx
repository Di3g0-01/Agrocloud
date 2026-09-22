import { useState } from "react";
import { StatusBadge, CustomSelect } from "../../components/ui";
import { SUSCRIPCIONES_DATA } from "../../data/admin";
import type { Suscripcion } from "../../types/admin";

interface PlanItem {
  nombre: string;
  precio: string;
  storage: string;
  instancias: string;
  clientes: number;
  ingresos: string;
  estado: string;
}

export function AdminSuscripciones({ isDark }: { isDark?: boolean }) {
  const [activeTab, setActiveTab] = useState<"planes" | "listado">("planes");
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [planFilter, setPlanFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Suscripcion | null>(null);

  // Planes State (from former AdminPlanes)
  const [modalOpen, setModalOpen] = useState(false);
  const [planes, setPlanes] = useState<PlanItem[]>([
    { nombre: "Finca", precio: "Q25", storage: "10 GB", instancias: "1", clientes: 8, ingresos: "Q200", estado: "Activo" },
    { nombre: "Productor", precio: "Q60", storage: "50 GB", instancias: "2", clientes: 14, ingresos: "Q840", estado: "Activo" },
    { nombre: "Agro Pro", precio: "Q120", storage: "100 GB", instancias: "3", clientes: 6, ingresos: "Q720", estado: "Activo" },
    { nombre: "Agro Enterprise", precio: "Q250", storage: "250 GB", instancias: "5", clientes: 3, ingresos: "Q750", estado: "Activo" },
  ]);

  // Form State for creating new plan
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [storage, setStorage] = useState("");
  const [instancias, setInstancias] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Activo");

  // Edit & Subscribers Modal State
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [viewSubscribersPlan, setViewSubscribersPlan] = useState<PlanItem | null>(null);

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

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setPlanes((prev) =>
      prev.map((p) => (p.nombre === editingPlan.nombre ? editingPlan : p))
    );
    setEditingPlan(null);
  };

  const totalIngresosNum = planes.reduce((acc, p) => {
    const val = parseInt(p.ingresos.replace(/[^0-9]/g, "")) || 0;
    return acc + val;
  }, 0);

  const filtered = SUSCRIPCIONES_DATA.filter((s) =>
    (estadoFilter === "Todos" || s.estado === estadoFilter) &&
    (planFilter === "Todos" || s.plan === planFilter) &&
    s.cliente.toLowerCase().includes(search.toLowerCase())
  );

  if (detalle) {
    return (
      <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setDetalle(null)}
            className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Suscripciones
          </button>
          <span className={isDark ? "text-slate-700" : "text-gray-300"}>/</span>
          <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{detalle.id}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={`lg:col-span-2 border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{detalle.id}</h2>
              <StatusBadge s={detalle.estado} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                ["Cliente", detalle.cliente],
                ["Plan", detalle.plan],
                ["Precio", detalle.precio + " /mes"],
                ["Fecha de inicio", detalle.inicio],
                ["Próxima renovación", detalle.renovacion],
                ["Método de pago", "Tarjeta •••• 4242"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={`border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Acciones</h3>
            <div className="space-y-2">
              {["Renovar suscripción", "Cambiar plan", "Suspender"].map((a, i) => (
                <button
                  key={a}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    i === 0
                      ? "bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold"
                      : i === 2
                      ? "border border-red-200 text-red-500 hover:bg-red-50"
                      : isDark
                      ? "border border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Historial de renovaciones</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-800 text-slate-400" : "border-gray-100 text-gray-400"}`}>
                <th className="pb-2 text-left font-medium">Período</th>
                <th className="pb-2 text-left font-medium">Monto</th>
                <th className="pb-2 text-left font-medium">Estado</th>
                <th className="pb-2 text-left font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
              {[
                ["ago 2026", detalle.precio, "Pagado", "01 ago 2026"],
                ["jul 2026", detalle.precio, "Pagado", "01 jul 2026"],
                ["jun 2026", detalle.precio, "Pagado", "01 jun 2026"],
              ].map(([p, m, e, f]) => (
                <tr key={p}>
                  <td className={`py-3 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{p}</td>
                  <td className={`py-3 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{m}</td>
                  <td className="py-3">
                    <StatusBadge s={e} />
                  </td>
                  <td className={`py-3 ${isDark ? "text-slate-500" : "text-gray-400"}`}>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Suscripciones y Planes</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestión comercial, planes de precios y estado de contratos de clientes.</p>
        </div>

        {activeTab === "planes" && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo plan</span>
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className={`flex border-b mb-6 gap-6 text-sm font-medium ${isDark ? "border-slate-800" : "border-gray-200"}`}>
        <button
          onClick={() => setActiveTab("planes")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "planes"
              ? "border-lime-400 text-lime-400 font-bold"
              : isDark
              ? "border-transparent text-slate-400 hover:text-slate-200"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Catálogo de Planes Comercial
        </button>
        <button
          onClick={() => setActiveTab("listado")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "listado"
              ? "border-lime-400 text-lime-400 font-bold"
              : isDark
              ? "border-transparent text-slate-400 hover:text-slate-200"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Suscripciones Activas de Clientes
        </button>
      </div>

      {/* TAB 1: CATALOGO DE PLANES */}
      {activeTab === "planes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "PLANES ACTIVOS",
                value: String(planes.filter((p) => p.estado === "Activo").length),
                sub: "Planes disponibles",
                color: isDark ? "text-blue-400 bg-blue-950/60 border border-blue-800/40" : "text-blue-500 bg-blue-50",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              },
              {
                label: "SUSCRIPCIONES",
                value: "31",
                sub: "Activas en total",
                color: isDark ? "text-lime-400 bg-lime-950/60 border border-lime-800/40" : "text-lime-600 bg-lime-50",
                icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
              },
              {
                label: "MÁS CONTRATADO",
                value: "Productor",
                sub: "14 suscriptores",
                color: isDark ? "text-purple-400 bg-purple-950/60 border border-purple-800/40" : "text-purple-500 bg-purple-50",
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
              },
              {
                label: "INGRESO MENSUAL",
                value: `Q${totalIngresosNum.toLocaleString()}`,
                sub: "Estimado total",
                color: isDark ? "text-green-400 bg-green-950/60 border border-green-800/40" : "text-green-600 bg-green-50",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map((k) => (
              <div key={k.label} className={`border rounded-xl p-5 flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {k.icon.split(" M").map((d, i) => (
                        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />
                      ))}
                    </svg>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</span>
                </div>
                <div className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</div>
                <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {planes.map((plan) => (
              <div key={plan.nombre} className={`border rounded-xl p-6 flex flex-col ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-lime-950/40" : "bg-lime-50"}`}>
                    <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      plan.estado === "Activo"
                        ? "bg-lime-100 text-lime-700 border border-lime-300"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {plan.estado}
                  </span>
                </div>
                <h3 className={`font-semibold text-base mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{plan.nombre}</h3>
                <div className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {plan.precio}
                  <span className={`text-xs font-normal ${isDark ? "text-slate-400" : "text-gray-400"}`}> /mes</span>
                </div>
                <div className="space-y-1.5 mt-3 mb-4">
                  {[
                    { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8", text: `${plan.storage} almacenamiento` },
                    { icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", text: `${plan.instancias} instancia${plan.instancias !== "1" ? "s" : ""} PostgreSQL` },
                  ].map((f) => (
                    <div key={f.text} className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-300" : "text-gray-500"}`}>
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {f.icon.split(" M").map((d, i) => (
                          <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />
                        ))}
                      </svg>
                      {f.text}
                    </div>
                  ))}
                </div>
                <div className={`mt-auto pt-4 border-t ${isDark ? "border-slate-800" : "border-gray-50"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>Clientes</p>
                      <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{plan.clientes}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>Ingreso</p>
                      <p className="text-lg font-semibold text-lime-400">{plan.ingresos}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPlan({ ...plan })}
                      className={`flex-1 py-2 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setViewSubscribersPlan(plan)}
                      className={`flex-1 py-2 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      Suscriptores
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LISTADO DE SUSCRIPCIONES */}
      {activeTab === "listado" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "ACTIVAS", value: "31", sub: "Suscripciones vigentes", color: isDark ? "text-lime-400 bg-lime-950/60 border border-lime-800/40" : "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "PRÓX. RENOVAR", value: "7", sub: "En los próximos 15 días", color: isDark ? "text-amber-400 bg-amber-950/60 border border-amber-800/40" : "text-amber-500 bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "SUSPENDIDAS", value: "2", sub: "Acceso restringido", color: isDark ? "text-red-400 bg-red-950/60 border border-red-800/40" : "text-red-500 bg-red-50", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
              { label: "CANCELADAS", value: "3", sub: "Sin renovación", color: isDark ? "text-slate-400 bg-slate-800 border border-slate-700" : "text-gray-500 bg-gray-100", icon: "M6 18L18 6M6 6l12 12" },
            ].map((k) => (
              <div key={k.label} className={`border rounded-xl p-5 flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {k.icon.split(" M").map((d, i) => (
                        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />
                      ))}
                    </svg>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</span>
                </div>
                <div className={`text-3xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</div>
                <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${isDark ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500" : "bg-white border-gray-200 text-gray-900"}`}
              />
            </div>
            <CustomSelect
              value={estadoFilter}
              onChange={(val) => setEstadoFilter(val)}
              options={["Todos", "Activa", "Pendiente", "Suspendida", "Cancelada", "Vencida"].map((s) => ({ value: s, label: s }))}
            />
            <CustomSelect
              value={planFilter}
              onChange={(val) => setPlanFilter(val)}
              options={["Todos", "Finca", "Productor", "Agro Pro", "Agro Enterprise"].map((p) => ({ value: p, label: p }))}
            />
          </div>

          <div className={`border rounded-xl overflow-x-auto ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className={`border-b ${isDark ? "bg-slate-800/60 border-slate-800 text-slate-400" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                  {["ID", "Cliente", "Plan", "Precio", "Inicio", "Próx. renovación", "Estado", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
                {filtered.map((s) => (
                  <tr key={s.id} className={`transition-colors cursor-pointer ${isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50"}`} onClick={() => setDetalle(s)}>
                    <td className={`px-5 py-4 font-mono text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{s.id}</td>
                    <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-300" : "text-gray-700"}`}>{s.cliente}</td>
                    <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-300" : "text-gray-600"}`}>{s.plan}</td>
                    <td className={`px-5 py-4 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{s.precio}</td>
                    <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>{s.inicio}</td>
                    <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>{s.renovacion}</td>
                    <td className="px-5 py-4">
                      <StatusBadge s={s.estado} />
                    </td>
                    <td className="px-5 py-4 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {menuOpen === s.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className={`absolute right-4 top-10 z-20 border rounded-xl shadow-lg py-1 w-40 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-gray-200 text-gray-700"}`}>
                            {["Ver detalle", "Renovar", "Cambiar plan", "Suspender", "Cancelar"].map((a, i) => (
                              <button
                                key={a}
                                onClick={() => {
                                  setMenuOpen(null);
                                  if (a === "Ver detalle") setDetalle(s);
                                }}
                                className={`w-full text-left px-4 py-2 transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"} ${i >= 3 ? "text-red-500" : ""}`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={`px-5 py-3 text-xs border-t ${isDark ? "border-slate-800 text-slate-400" : "border-gray-50 text-gray-400"}`}>
              {filtered.length} suscripción{filtered.length !== 1 ? "es" : ""}
            </div>
          </div>
        </div>
      )}

      {/* Modal to Create New Plan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleCreatePlan} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-gray-900">Nuevo plan comercial</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del plan</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Agro Plus"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio mensual (Q)</label>
                  <input
                    type="number"
                    required
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="150"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Almacenamiento (GB)</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    placeholder="150"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cant. de instancias</label>
                  <input
                    type="number"
                    value={instancias}
                    onChange={(e) => setInstancias(e.target.value)}
                    placeholder="4"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del plan..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
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
            <div className="flex gap-3 mt-6 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg text-sm font-semibold cursor-pointer"
              >
                Guardar plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal to Edit Plan */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleUpdatePlan} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-gray-900">Editar plan: {editingPlan.nombre}</h2>
              <button type="button" onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">
                ×
              </button>
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
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg text-sm font-semibold cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal to View Subscribers */}
      {viewSubscribersPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Suscriptores del plan {viewSubscribersPlan.nombre}</h2>
                <p className="text-xs text-gray-400">
                  {viewSubscribersPlan.clientes} cliente{viewSubscribersPlan.clientes !== 1 ? "s" : ""} registrado
                  {viewSubscribersPlan.clientes !== 1 ? "s" : ""} en este plan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewSubscribersPlan(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
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
              <button
                type="button"
                onClick={() => setViewSubscribersPlan(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { StatusBadge, CustomSelect } from "../../components/ui";
import { CLIENTES_DATA } from "../../data/admin";
import type { ClienteAdmin } from "../../types/admin";

export function AdminClientes({ isDark }: { isDark?: boolean }) {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [planFilter, setPlanFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<ClienteAdmin | null>(null);
  const [tab, setTab] = useState("Información");

  const filtered = CLIENTES_DATA.filter(c =>
    (tipoFilter === "Todos" || c.tipo === tipoFilter) &&
    (planFilter === "Todos" || c.plan === planFilter) &&
    (c.nombre.toLowerCase().includes(search.toLowerCase()) || c.responsable.toLowerCase().includes(search.toLowerCase()))
  );

  if (detalle) {
    const tabs = ["Información", "Instancias", "Pagos", "Suscripción", "Actividad"];
    return (
      <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDetalle(null)} className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Clientes
          </button>
          <span className={isDark ? "text-slate-700" : "text-gray-300"}>/</span>
          <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{detalle.nombre}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={`lg:col-span-2 border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-lime-400/20 text-lime-400 font-bold text-lg flex items-center justify-center">{detalle.nombre[0]}</div>
                <div>
                  <h2 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{detalle.nombre}</h2>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>{detalle.tipo}</p>
                </div>
              </div>
              <StatusBadge s={detalle.estado} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {[
                ["Responsable", detalle.responsable], ["Correo", detalle.correo],
                ["Teléfono", detalle.telefono], ["Registro", detalle.registro],
                ["Plan actual", detalle.plan], ["Suscripción", detalle.suscripcion],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Instancias", value: String(detalle.instancias), sub: "instancias activas" },
              { label: "Almacenamiento", value: detalle.almacenamiento, sub: "utilizado" },
            ].map(k => (
              <div key={k.label} className={`border rounded-xl p-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <p className={`text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</p>
                <p className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</p>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`border rounded-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <div className={`flex gap-0 border-b px-4 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${tab === t ? "border-lime-400 text-lime-400 font-bold" : isDark ? "border-transparent text-slate-400 hover:text-slate-200" : "border-transparent text-gray-400 hover:text-gray-700"}`}>{t}</button>
            ))}
          </div>
          <div className="p-6 text-sm">
            {tab === "Información" && (
              <div className="grid grid-cols-2 gap-6">
                {[["ID de cliente", detalle.id], ["Tipo", detalle.tipo], ["Plan", detalle.plan], ["Fecha de registro", detalle.registro]].map(([k, v]) => (
                  <div key={k}><p className={`text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p><p className={`text-sm ${isDark ? "text-slate-200" : "text-gray-800"}`}>{v}</p></div>
                ))}
              </div>
            )}
            {tab !== "Información" && <p className={`text-xs py-8 text-center ${isDark ? "text-slate-500" : "text-gray-400"}`}>Sin datos disponibles para esta sección.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Clientes</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestión de clientes y organizaciones de AgroCloud. (Los clientes se registran de forma autónoma)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "ACTIVAS", value: "28", sub: "Suscripciones vigentes", color: isDark ? "text-lime-400 bg-lime-950/60 border border-lime-800/40" : "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PRÓX. RENOVAR", value: "7", sub: "Próximos 15 días", color: isDark ? "text-amber-400 bg-amber-950/60 border border-amber-800/40" : "text-amber-500 bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "SUSPENDIDAS", value: "2", sub: "Acceso restringido", color: isDark ? "text-red-400 bg-red-950/60 border border-red-800/40" : "text-red-500 bg-red-50", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
          { label: "CANCELADAS", value: "3", sub: "Sin servicio activo", color: isDark ? "text-slate-400 bg-slate-800 border border-slate-700" : "text-gray-500 bg-gray-100", icon: "M6 18L18 6M6 6l12 12" },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl p-5 flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</span>
            </div>
            <div className={`text-3xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</div>
            <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${isDark ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500" : "bg-white border-gray-200 text-gray-900"}`} />
        </div>
        <CustomSelect
          value={tipoFilter}
          onChange={(val) => setTipoFilter(val)}
          options={["Todos", "Finca", "Cooperativa", "Empresa agroindustrial"].map((t) => ({ value: t, label: t }))}
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
              {["Cliente", "Tipo", "Responsable", "Plan", "Instancias", "Suscripción", "Estado", "Registro", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
            {filtered.map(c => (
              <tr key={c.id} className={`transition-colors cursor-pointer ${isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50"}`} onClick={() => setDetalle(c)}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 text-xs font-bold flex items-center justify-center shrink-0">{c.nombre[0]}</div>
                    <span className={`text-xs font-medium whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>{c.nombre}</span>
                  </div>
                </td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-500"}`}>{c.tipo}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-300" : "text-gray-600"}`}>{c.responsable}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-300" : "text-gray-600"}`}>{c.plan}</td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>{c.instancias} {c.instancias === 1 ? "instancia" : "instancias"}</td>
                <td className="px-5 py-4"><StatusBadge s={c.suscripcion} /></td>
                <td className="px-5 py-4"><StatusBadge s={c.estado} /></td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>{c.registro}</td>
                <td className="px-5 py-4 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === c.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className={`absolute right-4 top-10 z-20 border rounded-xl shadow-lg py-1 w-40 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-gray-200 text-gray-700"}`}>
                        {["Ver perfil", "Editar", "Ver instancias", "Ver suscripción", "Ver pagos", "Suspender"].map((a, i) => (
                          <button key={a} onClick={() => { setMenuOpen(null); if (a === "Ver perfil") setDetalle(c); }} className={`w-full text-left px-4 py-2 transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"} ${i === 5 ? "text-red-500" : ""}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`px-5 py-3 text-xs border-t ${isDark ? "border-slate-800 text-slate-400" : "border-gray-50 text-gray-400"}`}>{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

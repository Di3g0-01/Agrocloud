import { useState } from "react";
import { StatusBadge } from "../../components/ui";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { PLANTILLAS_ADMIN } from "../../data/admin";
import { C_PLANTILLAS } from "../../data/cliente";
import type { PlantillaAdmin } from "../../types/admin";

export function AdminPlantillas({ isDark }: { isDark?: boolean }) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<PlantillaAdmin | null>(null);
  const [tab, setTab] = useState("Resumen");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [plantillasList, setPlantillasList] = useState<PlantillaAdmin[]>(PLANTILLAS_ADMIN);

  // Form State
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [version, setVersion] = useState("1.0");
  const [tablasText, setTablasText] = useState("");
  const [estado, setEstado] = useState<"Activa" | "Inactiva">("Activa");

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setVersion("1.0");
    setTablasText("");
    setEstado("Activa");
  };

  const handleCreatePlantilla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !descripcion) return;

    const schemaArr = tablasText
      ? tablasText.split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "_")).filter(Boolean)
      : ["registro", "datos", "reportes"];

    const newTpl: PlantillaAdmin = {
      id: `TPL-0${plantillasList.length + 1}`,
      nombre,
      descripcion,
      tablas: schemaArr.length,
      version: version || "1.0",
      instancias: 0,
      estado,
      actualizada: "Hoy",
      schema: schemaArr,
    };

    setPlantillasList((prev) => [newTpl, ...prev]);

    PLANTILLAS_ADMIN.unshift(newTpl);
    C_PLANTILLAS.unshift({
      id: newTpl.id,
      nombre: newTpl.nombre,
      categoria: "General",
      descripcion: newTpl.descripcion,
      tablas: newTpl.tablas,
      entidades: schemaArr.slice(0, 5),
      casosDeUso: ["Gestión agrícola general", "Estructura relacional optimizada"],
      icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z",
    });

    resetForm();
    setCreateModalOpen(false);
  };

  const filtered = plantillasList.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (detalle) {
    const tabs = ["Resumen", "Estructura", "Relaciones", "Versiones"];
    return (
      <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDetalle(null)} className={`flex items-center gap-1.5 text-sm transition-colors ${isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-800"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Plantillas DB
          </button>
          <span className={isDark ? "text-slate-600" : "text-gray-300"}>/</span>
          <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-800"}`}>{detalle.nombre}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={`lg:col-span-2 border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"}`}>
                  <svg className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                </div>
                <div>
                  <h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{detalle.nombre}</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{detalle.descripcion}</p>
                </div>
              </div>
              <StatusBadge s={detalle.estado} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              {[["Versión", `v${detalle.version}`], ["Tablas", String(detalle.tablas)], ["Instancias", String(detalle.instancias)], ["Actualizada", detalle.actualizada]].map(([k, v]) => (
                <div key={k} className={`rounded-lg p-3 ${isDark ? "bg-slate-800/60" : "bg-gray-50"}`}>
                  <p className={`text-[10px] mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p>
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={`border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Acciones</h3>
            <div className="space-y-2">
              {["Editar plantilla", "Duplicar", "Descargar SQL"].map(a => (
                <button key={a} className={`w-full py-2 border rounded-lg text-xs font-medium transition-colors text-left px-3 ${isDark ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{a}</button>
              ))}
              <button className={`w-full py-2 border rounded-lg text-xs text-red-500 font-medium transition-colors text-left px-3 ${isDark ? "border-red-900/40 hover:bg-red-950/40" : "border-red-200 hover:bg-red-50"}`}>Desactivar</button>
            </div>
          </div>
        </div>
        <div className={`border rounded-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <div className={`flex gap-0 border-b px-4 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-lime-400 text-lime-400" : isDark ? "border-transparent text-slate-400 hover:text-slate-200" : "border-transparent text-gray-400 hover:text-gray-700"}`}>{t}</button>
            ))}
          </div>
          <div className="p-6">
            {tab === "Resumen" && (
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Tablas incluidas</p>
                <div className="flex flex-wrap gap-2">
                  {detalle.schema.map(t => (
                    <div key={t} className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${isDark ? "bg-slate-800/60 border-slate-700" : "bg-gray-50 border-gray-100"}`}>
                      <svg className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 6h18M3 14h18M3 18h18" /></svg>
                      <span className={`text-xs font-mono ${isDark ? "text-slate-200" : "text-gray-700"}`}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "Estructura" && (
              <div className="space-y-2">
                {detalle.schema.map(t => (
                  <div key={t} className={`flex items-center justify-between px-4 py-3 rounded-lg ${isDark ? "bg-slate-800/60" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${isDark ? "text-slate-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 6h18M3 14h18M3 18h18" /></svg>
                      <span className={`text-xs font-mono ${isDark ? "text-slate-200" : "text-gray-800"}`}>{t}</span>
                    </div>
                    <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>PostgreSQL table</span>
                  </div>
                ))}
              </div>
            )}
            {(tab === "Relaciones" || tab === "Versiones") && (
              <p className={`text-xs py-8 text-center ${isDark ? "text-slate-400" : "text-gray-400"}`}>Información no disponible.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Plantillas DB</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestión de plantillas PostgreSQL disponibles en AgroCloud.</p>
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nueva plantilla</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "DISPONIBLES", value: String(plantillasList.length), sub: "Plantillas en plataforma", color: isDark ? "text-blue-400 bg-blue-950/40" : "text-blue-500 bg-blue-50", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
          { label: "ACTIVAS", value: String(plantillasList.filter(p => p.estado === "Activa").length), sub: "En uso por clientes", color: isDark ? "text-lime-400 bg-lime-950/40" : "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "INSTANCIAS", value: "38", sub: "Usan una plantilla", color: isDark ? "text-purple-400 bg-purple-950/40" : "text-purple-500 bg-purple-50", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
          { label: "MÁS UTILIZADA", value: "Cosechas", sub: "12 instancias activas", color: isDark ? "text-orange-400 bg-orange-950/40" : "text-orange-500 bg-orange-50", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl p-5 flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</span>
            </div>
            <div className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</div>
            <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <div className="relative max-w-xs">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plantilla..." className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${isDark ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500" : "bg-white border-gray-200 text-gray-900"}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => (
          <div key={p.id} className={`border rounded-xl p-5 flex flex-col transition-all cursor-pointer ${isDark ? "bg-slate-900 border-slate-800 hover:border-lime-500/50" : "bg-white border-gray-100 hover:border-lime-200 hover:shadow-sm"}`} onClick={() => setDetalle(p)}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"}`}>
                <svg className={`w-5 h-5 ${isDark ? "text-slate-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <StatusBadge s={p.estado} />
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === p.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className={`absolute right-0 top-8 z-20 border rounded-xl shadow-lg py-1 w-40 text-xs ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-200 text-gray-700"}`}>
                        {["Ver estructura", "Editar", "Duplicar", "Desactivar", "Eliminar"].map((a, i) => (
                          <button key={a} onClick={() => { setMenuOpen(null); if (a === "Ver estructura") setDetalle(p); }} className={`w-full text-left px-4 py-2 transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"} ${i >= 3 ? "text-red-400" : isDark ? "text-slate-200" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <h3 className={`font-semibold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{p.nombre}</h3>
            <p className={`text-xs leading-relaxed mb-4 flex-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{p.descripcion}</p>
            <div className={`flex items-center gap-4 text-[10px] border-t pt-3 ${isDark ? "text-slate-400 border-slate-800" : "text-gray-400 border-gray-50"}`}>
              <span>{p.tablas} tablas</span>
              <span>v{p.version}</span>
              <span>{p.instancias} instancias</span>
            </div>
          </div>
        ))}
      </div>

      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleCreatePlantilla} className={`rounded-2xl shadow-xl w-full max-w-md p-6 border ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Nueva plantilla DB</h2>
              <button type="button" onClick={() => setCreateModalOpen(false)} className={`text-xl leading-none ${isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-400 hover:text-gray-600"}`}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Nombre de la plantilla</label>
                <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Gestión de Riego y Fertilizantes" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-200"}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Versión inicial</label>
                  <input type="text" value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-200"}`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Estado</label>
                  <CustomSelect
                    value={estado}
                    onChange={(val) => setEstado(val as "Activa" | "Inactiva")}
                    options={[
                      { value: "Activa", label: "Activa" },
                      { value: "Inactiva", label: "Inactiva" },
                    ]}
                    className="w-full"
                    isDark={isDark}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Descripción</label>
                <textarea rows={2} required value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Propósito y alcance de esta estructura de base de datos..." className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-200"}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-gray-700"}`}>Tablas del esquema (separadas por coma)</label>
                <input type="text" value={tablasText} onChange={e => setTablasText(e.target.value)} placeholder="sensores, mediciones, alertas, parcelas" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 font-mono text-xs ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-gray-200"}`} />
                <p className={`text-[10px] mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Se crearán como tablas PostgreSQL de forma automática.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setCreateModalOpen(false)} className={`flex-1 py-2.5 border rounded-lg text-sm font-medium transition-colors ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg text-sm font-semibold transition-colors">Crear plantilla</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


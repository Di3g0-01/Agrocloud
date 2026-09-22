import { useState } from "react";
import { C_PLANTILLAS, C_INSTANCIAS, C_PLAN } from "../../data/cliente";
import type { CPlantillaDB, CInstancia, ClientePage } from "../../types/cliente";
import { CreateInstanciaModal, SvgPaths } from "./ClienteInstancias";

export function ClientePlantillas({ onNavigate }: { onNavigate?: (p: ClientePage) => void }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const [drawer, setDrawer] = useState<CPlantillaDB | null>(null);
  const [createModal, setCreateModal] = useState<string | null>(null);

  const handleAddInstance = (newInst: CInstancia) => {
    C_INSTANCIAS.unshift(newInst);
    setCreateModal(null);
    onNavigate?.("instancias");
  };

  const categorias = ["Todas", ...Array.from(new Set(C_PLANTILLAS.map(p => p.categoria)))];

  const filtered = C_PLANTILLAS.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todas" || p.categoria === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Plantillas DB</h1>
        <p className="text-sm text-gray-500 mt-1">Schemas PostgreSQL preconfigurados para el sector agrícola. Úsalos al crear una nueva instancia.</p>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plantilla..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categorias.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${catFilter === cat ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Sin resultados</p>
          <p className="text-xs text-gray-400 mt-1">No hay plantillas que coincidan con tu búsqueda.</p>
          <button onClick={() => { setSearch(""); setCatFilter("Todas"); }} className="mt-4 text-xs text-lime-600 hover:text-lime-700 font-medium">Limpiar filtros</button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className={`grid gap-4 ${drawer ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {filtered.map(plantilla => (
            <div key={plantilla.id} onClick={() => setDrawer(drawer?.id === plantilla.id ? null : plantilla)}
              className={`bg-white border rounded-xl p-5 cursor-pointer transition-all hover:shadow-sm ${drawer?.id === plantilla.id ? "border-lime-300 ring-1 ring-lime-100" : "border-gray-100 hover:border-gray-200"}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <SvgPaths d={plantilla.icon} className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium shrink-0">{plantilla.categoria}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{plantilla.nombre}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{plantilla.descripcion}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{plantilla.tablas} tablas</span>
                <span className="text-[10px] font-semibold bg-lime-100 text-lime-700 border border-lime-200 px-2 py-0.5 rounded-full">Disponible</span>
              </div>
              <button onClick={e => { e.stopPropagation(); setDrawer(plantilla); }}
                className="w-full py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Ver detalles
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drawer: detalle de plantilla */}
      {drawer && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDrawer(null)} aria-hidden="true" />
          <aside className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col" aria-label="Detalle de plantilla">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <SvgPaths d={drawer.icon} className="w-5 h-5 text-gray-500" />
                </div>
                <div><p className="text-sm font-semibold text-gray-900">{drawer.nombre}</p><p className="text-[10px] text-gray-400">{drawer.categoria}</p></div>
              </div>
              <button onClick={() => setDrawer(null)} aria-label="Cerrar panel" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold bg-lime-100 text-lime-700 border border-lime-200 px-2 py-0.5 rounded-full">Disponible</span>
                <span className="text-xs text-gray-400">{drawer.tablas} tablas · PostgreSQL 14+</span>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Descripción</p>
                <p className="text-sm text-gray-600 leading-relaxed">{drawer.descripcion}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Entidades incluidas</p>
                <div className="flex flex-wrap gap-1.5">
                  {drawer.entidades.map(e => <span key={e} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{e}</span>)}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Casos de uso</p>
                <ul className="space-y-2">
                  {drawer.casosDeUso.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 mb-1">Compatibilidad</p>
                <p className="text-xs text-gray-500 leading-relaxed">PostgreSQL 14 o superior. Compatible con el plan Productor y todos los planes superiores.</p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 shrink-0">
              <button onClick={() => { setCreateModal(drawer.nombre); setDrawer(null); }}
                className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold rounded-xl text-sm transition-colors">
                Usar plantilla
              </button>
            </div>
          </aside>
        </>
      )}

      {createModal !== null && (
        <CreateInstanciaModal
          onClose={() => setCreateModal(null)}
          onCreate={handleAddInstance}
          onUpgradePlan={() => onNavigate?.("plan")}
          plantillaInicial={createModal}
          currentCount={C_INSTANCIAS.length}
          maxInstancias={C_PLAN.maxInstancias}
        />
      )}
    </div>
  );
}

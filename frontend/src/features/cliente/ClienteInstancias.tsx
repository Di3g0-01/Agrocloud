import { useState } from "react";
import { CopyBtn, ProgressBar } from "../../components/ui";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { C_INSTANCIAS, C_PLAN, C_PLANTILLAS } from "../../data/cliente";
import type { CInstancia } from "../../types/cliente";

export function CInstanciaStatusBadge({ s }: { s: CInstancia["estado"] }) {
  const cls = s === "Activa" ? "bg-lime-100 text-lime-700 border border-lime-300"
    : s === "Reiniciando" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : s === "Suspendida" ? "bg-gray-100 text-gray-500 border border-gray-200"
    : "bg-red-50 text-red-600 border border-red-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{s}</span>;
}

export function SvgPaths({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {d.split(" M").map((seg, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

export function CreateInstanciaModal({
  onClose,
  onCreate,
  onUpgradePlan,
  plantillaInicial = "",
  currentCount = 0,
  maxInstancias = 999,
}: {
  onClose: () => void;
  onCreate?: (inst: CInstancia) => void;
  onUpgradePlan?: () => void;
  plantillaInicial?: string;
  currentCount?: number;
  maxInstancias?: number;
}) {
  const [nombre, setNombre] = useState("");
  const [plantilla, setPlantilla] = useState(plantillaInicial);
  const atLimit = currentCount >= maxInstancias;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (atLimit || !nombre || !plantilla) return;

    const newInst: CInstancia = {
      nombre,
      plantilla,
      usadoGB: 0,
      totalGB: C_PLAN.totalGB,
      estado: "Activa",
      creada: new Date().toISOString().split("T")[0],
      version: "PostgreSQL 15.4",
      host: `${nombre}.agrocloud.io`,
      puerto: "5432",
      baseDatos: nombre.replace(/-/g, "_"),
      usuario: "client_admin",
      password: "P@ssw0rd!" + Math.floor(Math.random() * 899 + 100),
      cpu: 5,
      memoria: 12,
      actividad: [
        { desc: "Instancia aprovisionada con éxito", tiempo: "Hace un momento", tipo: "info" },
        { desc: "Schema de plantilla " + plantilla + " aplicado", tiempo: "Hace un momento", tipo: "ok" },
      ],
    };

    onCreate?.(newInst);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-label="Crear instancia">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Crear instancia</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {atLimit && (
          <div className="mx-6 mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Límite del plan alcanzado</p>
              <p className="text-xs text-amber-700 mt-0.5">Tu plan {C_PLAN.nombre} permite {maxInstancias} instancia(s) y ya tienes {currentCount}. Mejora tu plan para crear más.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpgradePlan?.();
                }}
                className="mt-2 text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900"
              >
                Mejorar a Agro Pro →
              </button>
            </div>
          </div>
        )}

        <div className={`p-6 space-y-4 ${atLimit ? "opacity-50 pointer-events-none select-none" : ""}`}>
          <div>
            <label htmlFor="ci-nombre" className="block text-xs font-medium text-gray-600 mb-1.5">Nombre de la instancia</label>
            <input id="ci-nombre" value={nombre} onChange={e => setNombre(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="ej. mi-base-de-datos"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent font-mono" />
            <p className="text-[10px] text-gray-400 mt-1">Solo minúsculas, números y guiones.</p>
          </div>
          <div>
            <label htmlFor="ci-plantilla" className="block text-xs font-medium text-gray-600 mb-1.5">Plantilla DB</label>
            <CustomSelect
              value={plantilla}
              onChange={(val) => setPlantilla(val)}
              options={C_PLANTILLAS.map((p) => ({ value: p.nombre, label: p.nombre }))}
              placeholder="Seleccionar plantilla..."
              className="w-full"
            />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
            <p className="font-medium text-gray-700">Resumen del plan</p>
            <div className="flex justify-between text-gray-500"><span>Plan activo</span><span className="font-medium text-gray-800">{C_PLAN.nombre}</span></div>
            <div className="flex justify-between text-gray-500">
              <span>Instancias ({currentCount}/{maxInstancias})</span>
              <span className={`font-medium ${atLimit ? "text-amber-600" : "text-gray-800"}`}>{atLimit ? "Límite alcanzado" : "Disponible"}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button type="submit" disabled={atLimit || !nombre || !plantilla}
            className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg text-sm transition-colors">
            Crear instancia
          </button>
        </div>
      </form>
    </div>
  );
}

export function ClienteInstancias({ onNavigate }: { onNavigate?: (p: any) => void }) {
  const [instanciasList, setInstanciasList] = useState<CInstancia[]>(C_INSTANCIAS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | CInstancia["estado"]>("todas");
  const [view, setView] = useState<"list" | "grid">("list");
  const [drawer, setDrawer] = useState<CInstancia | null>(null);
  const [credModal, setCredModal] = useState<CInstancia | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CInstancia | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleAddInstance = (newInst: CInstancia) => {
    setInstanciasList((prev) => [newInst, ...prev]);
    C_INSTANCIAS.unshift(newInst);
    setShowCreate(false);
  };

  const handleRestart = (nombre: string) => {
    setInstanciasList((prev) =>
      prev.map((inst) => {
        if (inst.nombre === nombre) {
          return {
            ...inst,
            estado: "Reiniciando",
            actividad: [
              { desc: "Reinicio solicitado por el usuario", tiempo: "Hace un momento", tipo: "warn" },
              ...inst.actividad,
            ],
          };
        }
        return inst;
      })
    );
    setTimeout(() => {
      setInstanciasList((prev) =>
        prev.map((inst) => {
          if (inst.nombre === nombre) {
            return {
              ...inst,
              estado: "Activa",
              actividad: [
                { desc: "Reinicio completado con éxito", tiempo: "Hace un momento", tipo: "ok" },
                ...inst.actividad,
              ],
            };
          }
          return inst;
        })
      );
    }, 3000);
  };

  const handleDelete = (nombre: string) => {
    setInstanciasList((prev) => prev.filter((inst) => inst.nombre !== nombre));
    const idx = C_INSTANCIAS.findIndex((i) => i.nombre === nombre);
    if (idx !== -1) C_INSTANCIAS.splice(idx, 1);
    setDeleteConfirm(null);
    if (drawer?.nombre === nombre) setDrawer(null);
  };

  const filtered = instanciasList.filter(inst => {
    const matchSearch = inst.nombre.toLowerCase().includes(search.toLowerCase()) || inst.plantilla.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todas" || inst.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalUsado = instanciasList.reduce((s, i) => s + i.usadoGB, 0);
  const activas = instanciasList.filter(i => i.estado === "Activa").length;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Instancias</h1>
          <p className="text-sm text-gray-500 mt-1">Administra tus bases de datos PostgreSQL contratadas en AgroCloud.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Crear instancia
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total instancias", value: `${instanciasList.length} / ${C_PLAN.maxInstancias}`, sub: "Plan " + C_PLAN.nombre, icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", color: "text-lime-600 bg-lime-50" },
          { label: "Activas", value: String(activas), sub: `${instanciasList.length - activas} con incidencias`, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-lime-600 bg-lime-50" },
          { label: "Almacenamiento usado", value: `${totalUsado} GB`, sub: `de ${C_PLAN.totalGB} GB del plan`, icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", color: "text-blue-500 bg-blue-50" },
          { label: "Almacenamiento disponible", value: `${C_PLAN.totalGB - totalUsado} GB`, sub: "Disponible para nuevas instancias", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-gray-500 bg-gray-100" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-4 text-left flex flex-col items-start">
            <div className="flex items-center justify-start gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o plantilla..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["todas", "Activa", "Reiniciando", "Suspendida", "Error"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setView("list")} aria-label="Vista lista" className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
          <button onClick={() => setView("grid")} aria-label="Vista cuadrícula" className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      {/* Empty / no results */}
      {filtered.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Sin resultados</p>
          <p className="text-xs text-gray-400 mt-1">Ninguna instancia coincide con la búsqueda o filtro activo.</p>
          <button onClick={() => { setSearch(""); setStatusFilter("todas"); }} className="mt-4 text-xs text-lime-600 hover:text-lime-700 font-medium">Limpiar filtros</button>
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <table className="min-w-max w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Instancia", "Plantilla", "Almacenamiento", "Estado", "Creada", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-center text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inst => (
                <tr key={inst.nombre} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors text-center">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-lime-50 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                      </div>
                      <div className="text-left">
                        <p className="font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">{inst.nombre}</p>
                        <p className="text-[10px] text-gray-400">{inst.version}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">{inst.plantilla}</td>
                  <td className="px-4 py-3.5 w-36">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>{inst.usadoGB} GB</span><span>{inst.totalGB} GB</span></div>
                    <ProgressBar value={(inst.usadoGB / inst.totalGB) * 100} color={inst.usadoGB / inst.totalGB > 0.8 ? "bg-red-400" : inst.usadoGB / inst.totalGB > 0.6 ? "bg-amber-400" : "bg-lime-400"} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap flex justify-center"><CInstanciaStatusBadge s={inst.estado} /></td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{inst.creada}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                      <button onClick={() => setDrawer(inst)} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">Detalles</button>
                      <button onClick={() => { setShowPass(false); setCredModal(inst); }} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">Credenciales</button>
                      <button onClick={() => handleRestart(inst.nombre)} className="px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 rounded transition-colors">Reiniciar</button>
                      <button onClick={() => setDeleteConfirm(inst)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(inst => (
            <div key={inst.nombre} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-lime-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-900">{inst.nombre}</p>
                    <p className="text-[10px] text-gray-400">{inst.version}</p>
                  </div>
                </div>
                <CInstanciaStatusBadge s={inst.estado} />
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-xs"><span className="text-gray-400">Plantilla</span><span className="text-gray-700 font-medium">{inst.plantilla}</span></div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Almacenamiento</span><span>{inst.usadoGB} / {inst.totalGB} GB</span></div>
                  <ProgressBar value={(inst.usadoGB / inst.totalGB) * 100} color={inst.usadoGB / inst.totalGB > 0.8 ? "bg-red-400" : "bg-lime-400"} />
                </div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Creada</span><span className="text-gray-700">{inst.creada}</span></div>
              </div>
              <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setDrawer(inst)} className="py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Detalles</button>
                <button onClick={() => { setShowPass(false); setCredModal(inst); }} className="py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Credenciales</button>
                <button onClick={() => handleRestart(inst.nombre)} className="py-1.5 text-xs font-medium text-amber-600 border border-amber-100 rounded-lg hover:bg-amber-50 transition-colors">Reiniciar</button>
                <button onClick={() => setDeleteConfirm(inst)} className="py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer: detalles */}
      {drawer && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDrawer(null)} aria-hidden="true" />
          <aside className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col" aria-label="Detalles de instancia">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-lime-50 flex items-center justify-center"><svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg></div>
                <div><p className="font-mono text-sm font-semibold text-gray-900">{drawer.nombre}</p><p className="text-[10px] text-gray-400">{drawer.version}</p></div>
              </div>
              <button onClick={() => setDrawer(null)} aria-label="Cerrar panel" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-6">
              <div className="flex items-center gap-2">
                <CInstanciaStatusBadge s={drawer.estado} />
                <span className="text-xs text-gray-400">· Creada {drawer.creada}</span>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Consumo de recursos</p>
                <div className="space-y-3">
                  {[
                    { label: "CPU", value: drawer.cpu },
                    { label: "Memoria", value: drawer.memoria },
                    { label: "Almacenamiento", value: Math.round((drawer.usadoGB / drawer.totalGB) * 100), extra: `${drawer.usadoGB} / ${drawer.totalGB} GB` },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{r.label}</span>
                        <span className="font-mono">{r.extra ?? `${r.value}%`}</span>
                      </div>
                      <ProgressBar value={r.value} color={r.value > 70 ? "bg-red-400" : r.value > 50 ? "bg-amber-400" : "bg-lime-400"} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Plantilla aplicada</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>
                  </div>
                  <div><p className="text-xs font-medium text-gray-800">{drawer.plantilla}</p><p className="text-[10px] text-gray-400">Schema PostgreSQL</p></div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Actividad reciente</p>
                <div className="space-y-3">
                  {drawer.actividad.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.tipo === "ok" ? "bg-lime-500" : a.tipo === "warn" ? "bg-amber-400" : "bg-gray-300"}`} />
                      <div><p className="text-xs text-gray-700">{a.desc}</p><p className="text-[10px] text-gray-400">{a.tiempo}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 shrink-0 flex gap-2">
              <button onClick={() => { setShowPass(false); setCredModal(drawer); setDrawer(null); }} className="flex-1 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors">Credenciales</button>
              <button onClick={() => setDrawer(null)} className="flex-1 py-2 text-sm bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg font-medium transition-colors">Cerrar</button>
            </div>
          </aside>
        </>
      )}

      {/* Modal: credenciales */}
      {credModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setCredModal(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-label="Credenciales de conexión">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Credenciales de conexión</h2>
              <button onClick={() => setCredModal(null)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 mb-4">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <p className="text-xs text-amber-700">Mantén estas credenciales seguras. No las compartas ni las expongas en código fuente público.</p>
              </div>
              {([["Host", credModal.host], ["Puerto", credModal.puerto], ["Base de datos", credModal.baseDatos], ["Usuario", credModal.usuario]] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <span className="flex-1 text-sm text-gray-800 font-mono truncate">{value}</span>
                    <CopyBtn text={value} />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="flex-1 text-sm text-gray-800 font-mono">{showPass ? credModal.password : "••••••••••••"}</span>
                  <button onClick={() => setShowPass(p => !p)} aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"} className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                  </button>
                  <CopyBtn text={credModal.password} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setCredModal(null)} className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg text-sm transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Eliminar instancia</h2>
            <p className="text-sm text-gray-500 mb-1">{"¿Seguro que deseas eliminar"} <span className="font-mono font-semibold text-gray-900">{deleteConfirm.nombre}</span>{"?"}</p>
            <p className="text-xs text-red-400 mb-6">Esta acción es irreversible. Se perderán todos los datos almacenados.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm.nombre)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateInstanciaModal
          onClose={() => setShowCreate(false)}
          onCreate={handleAddInstance}
          onUpgradePlan={() => onNavigate?.("plan")}
          currentCount={instanciasList.length}
          maxInstancias={C_PLAN.maxInstancias}
        />
      )}
    </div>
  );
}

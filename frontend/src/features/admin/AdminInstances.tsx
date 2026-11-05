import { useState, useEffect } from "react";
import { CustomSelect, ProgressBar, StatusBadge } from "../../components/ui";
import { getInstances, updateInstanceStatus, restartInstance, deleteInstance } from "../../api/instancesApi";
import { getAllSubscriptions } from "../../api/subscriptionsApi";
import type { AdminInstance } from "../../types/admin";

export function AdminInstances({ isDark }: { isDark?: boolean }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminInstance | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminInstance | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restartPrompt, setRestartPrompt] = useState<AdminInstance | null>(null);
  const [restarting, setRestarting] = useState(false);
  const [restartError, setRestartError] = useState("");
  const [restartSuccess, setRestartSuccess] = useState<AdminInstance | null>(null);
  const [instancesList, setInstancesList] = useState<AdminInstance[]>([]);
  const [error, setError] = useState("");

  const statusMap: Record<string, string> = { active: "Activa", revision: "En revisión", suspended: "Suspendida", terminated: "Detenida" };

  const handleDeleteInstance = async (inst: AdminInstance) => {
    setDeleting(true);
    setError("");
    try {
      await deleteInstance(inst.id);
      setInstancesList(prev => prev.filter(item => item.id !== inst.id));
      if (detail?.id === inst.id) setDetail(null);
      setDeleteConfirm(null);
    } catch {
      setError(`No se pudo eliminar la instancia ${inst.nombre}.`);
    } finally {
      setDeleting(false);
    }
  };

  const handleExecuteRestart = async (inst: AdminInstance) => {
    setRestarting(true);
    setRestartError("");
    try {
      await restartInstance(inst.id);
      setInstancesList(prev => prev.map(item => item.id === inst.id ? { ...item, estado: "Activa" } : item));
      if (detail?.id === inst.id) {
        setDetail(prev => prev ? { ...prev, estado: "Activa" } : null);
      }
      setRestartPrompt(null);
      setRestartSuccess({ ...inst, estado: "Activa" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || `No se pudo reiniciar la instancia ${inst.nombre}.`;
      setRestartError(msg);
      setError(msg);
    } finally {
      setRestarting(false);
    }
  };

  const performAction = async (action: string, inst: AdminInstance) => {
    setMenuOpen(null);
    setError("");
    if (action === "Ver detalles" || action === "Ver métricas") {
      setDetail(inst);
      return;
    }
    if (action === "Eliminar") {
      setDeleteConfirm(inst);
      return;
    }
    if (action === "Reiniciar") {
      setRestartError("");
      setRestartPrompt(inst);
      return;
    }
    try {
      await updateInstanceStatus(inst.id, ({ Detener: "terminated", Iniciar: "active", Suspender: "suspended" } as const)[action as "Detener" | "Iniciar" | "Suspender"]);
      const status = statusMap[({ Detener: "terminated", Iniciar: "active", Suspender: "suspended" } as const)[action as "Detener" | "Iniciar" | "Suspender"]];
      setInstancesList(prev => prev.map(item => item.id === inst.id ? { ...item, estado: status } : item));
      setDetail(prev => prev?.id === inst.id ? { ...prev, estado: status } : prev);
    } catch {
      setError(`No se pudo ${action.toLowerCase()} la instancia ${inst.nombre}.`);
    }
  };

  useEffect(() => {
    Promise.allSettled([getInstances(), getAllSubscriptions()])
      .then(([instancesResult, subscriptionsResult]) => {
        if (instancesResult.status !== "fulfilled") throw new Error("instances unavailable");
        const dbInsts = instancesResult.value;
        const subscriptions = subscriptionsResult.status === "fulfilled" ? subscriptionsResult.value : [];
        if (subscriptionsResult.status === "rejected") setError("Las instancias se cargaron, pero no se pudo consultar su plan.");
        const mapped: AdminInstance[] = dbInsts.map((inst) => {
          const stateMap: Record<string, "Activa" | "Detenida" | "En revisión" | "Suspendida"> = {
            active: "Activa",
            Activa: "Activa",
            suspended: "Suspendida",
            Suspendida: "Suspendida",
            revision: "En revisión",
            "En revisión": "En revisión",
            "En mantenimiento": "En revisión",
            terminated: "Detenida",
            Detenida: "Detenida",
          };
          return {
            id: inst.id,
            nombre: inst.nombre,
            cliente: inst.cliente || "Cliente AgroCloud",
            plantilla: inst.plantilla || "Sin plantilla",
            plan: subscriptions.find(s => s.usuarioId === inst.usuarioId && s.estado === "active")?.planNombre || "Sin plan",
            almacenamiento: `${inst.almacenamientoUsadoGb || 0.1} GB / ${inst.almacenamientoTotalGb || 10} GB`,
            estado: stateMap[inst.estado] || "Activa",
            creada: inst.fechaCreacion || new Date().toISOString().split("T")[0],
            cpu: inst.cpu ?? 0,
            ram: inst.memoria ?? 0,
            conexiones: 3,
          };
        });
        setInstancesList(mapped);
      })
      .catch(() => setError("No se pudieron cargar las instancias."));
  }, []);

  const filtered = instancesList.filter(i =>
    (statusFilter === "Todos" || i.estado === statusFilter) &&
    (i.nombre.toLowerCase().includes(search.toLowerCase()) || i.cliente.toLowerCase().includes(search.toLowerCase()))
  );

  const renderModals = () => (
    <>
      {restartPrompt && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={e => { if (e.target === e.currentTarget && !restarting) setRestartPrompt(null); }}>
          <div className={`rounded-2xl w-full max-w-sm shadow-2xl p-6 ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white"}`} role="dialog" aria-modal="true" aria-label="Confirmar reinicio de instancia">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Reiniciar instancia</h2>
            <p className={`text-sm mb-2 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
              {"¿Deseas reiniciar la instancia"} <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{restartPrompt.nombre}</span>{"?"}
            </p>
            <p className={`text-xs rounded-lg p-2.5 mb-5 leading-relaxed ${isDark ? "bg-amber-950/40 border border-amber-800/40 text-amber-300" : "bg-amber-50 border border-amber-200 text-amber-800"}`}>
              El servicio PostgreSQL se restablecerá. Las conexiones activas se cerrarán momentáneamente y la instancia quedará disponible nuevamente en pocos segundos.
            </p>
            {restartError && (
              <p role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {restartError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={restarting}
                onClick={() => { setRestartPrompt(null); setRestartError(""); }}
                className={`flex-1 py-2.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={restarting}
                onClick={() => handleExecuteRestart(restartPrompt)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {restarting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Reiniciando...</span>
                  </>
                ) : (
                  "Reiniciar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {restartSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={e => { if (e.target === e.currentTarget) setRestartSuccess(null); }}>
          <div className={`rounded-2xl w-full max-w-md shadow-2xl p-6 ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white"}`} role="dialog" aria-modal="true" aria-label="Instancia reiniciada con éxito">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Instancia reiniciada con éxito</h2>
            <p className={`text-sm mb-4 leading-relaxed ${isDark ? "text-slate-300" : "text-gray-600"}`}>
              La instancia <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{restartSuccess.nombre}</span> ha sido reiniciada correctamente y ya se encuentra activa y lista para recibir consultas.
            </p>

            <div className={`border rounded-xl p-3.5 space-y-2 mb-6 text-xs ${isDark ? "bg-slate-800/60 border-slate-700 text-slate-300" : "bg-gray-50 border-gray-100 text-gray-600"}`}>
              <div className="flex justify-between items-center">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Estado actual:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Activa
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Motor de Base de Datos:</span>
                <span className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>PostgreSQL 16</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Plantilla agronómica:</span>
                <span className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>{restartSuccess.plantilla}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Disponibilidad del clúster:</span>
                <span className="font-medium text-emerald-500">99.9% Uptime</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setRestartSuccess(null)}
                className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={e => { if (e.target === e.currentTarget && !deleting) setDeleteConfirm(null); }}>
          <div className={`rounded-2xl w-full max-w-sm shadow-2xl p-6 ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white"}`} role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Eliminar instancia</h2>
            <p className={`text-sm mb-1 ${isDark ? "text-slate-300" : "text-gray-500"}`}>
              {"¿Seguro que deseas eliminar"} <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{deleteConfirm.nombre}</span>{"?"}
            </p>
            <p className="text-xs text-red-400 mb-6">Esta acción es irreversible. Se perderán todos los datos almacenados.</p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirm(null)}
                className={`flex-1 py-2.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteInstance(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (detail) {
    return (
      <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDetail(null)} className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Instancias
          </button>
          <span className={isDark ? "text-slate-700" : "text-gray-300"}>/</span>
          <span className={`text-sm font-mono ${isDark ? "text-slate-200" : "text-gray-800"}`}>{detail.nombre}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-lime-950/40" : "bg-lime-50"}`}>
              <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
            </div>
            <div>
              <h2 className={`font-semibold font-mono ${isDark ? "text-white" : "text-gray-900"}`}>{detail.nombre}</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>{detail.cliente}</p>
            </div>
            <StatusBadge s={detail.estado} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRestartError("");
                setRestartPrompt(detail);
              }}
              className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer ${isDark ? "border-amber-500/30 text-amber-400 hover:bg-amber-950/40" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
            >
              Reiniciar
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(detail)}
              className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer ${isDark ? "border-red-500/30 text-red-400 hover:bg-red-950/40" : "border-red-200 text-red-600 hover:bg-red-50"}`}
            >
              Eliminar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={`lg:col-span-2 border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Información general</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                ["Motor", "PostgreSQL"], ["Versión", "PostgreSQL 16"],
                ["Cliente", detail.cliente], ["Plantilla", detail.plantilla],
                ["Plan", detail.plan], ["Almacenamiento", detail.almacenamiento],
                ["Fecha de creación", detail.creada], ["Región", "us-east-1"],
              ].map(([k, v]) => (
                <div key={k}><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p><p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{v}</p></div>
              ))}
            </div>
          </div>
          <div className={`border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Estado de recursos</h3>
            <div className="space-y-5">
              {[
                { label: "CPU", value: detail.cpu, color: detail.cpu > 70 ? "bg-red-400" : detail.cpu > 50 ? "bg-amber-400" : "bg-lime-400" },
                { label: "RAM", value: detail.ram, color: detail.ram > 70 ? "bg-red-400" : detail.ram > 50 ? "bg-amber-400" : "bg-lime-400" },
                { label: "Almacenamiento", value: Math.round(parseInt(detail.almacenamiento) / parseInt(detail.almacenamiento.split("/")[1]) * 100), color: "bg-blue-400" },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>{r.label}</span>
                    <span className={`text-xs font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{r.value}%</span>
                  </div>
                  <ProgressBar value={r.value} color={r.color} />
                </div>
              ))}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>Conexiones activas</span>
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-gray-800"}`}>{detail.conexiones}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Actividad reciente</h3>
          <div className="space-y-3">
            {["Consulta ejecutada correctamente", "Backup automático completado", "Conexión establecida desde 192.168.1.10", "Índice reconstruido en tabla cosechas"].map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 shrink-0" />
                <span className={isDark ? "text-slate-300" : "text-gray-600"}>{a}</span>
                <span className={`ml-auto whitespace-nowrap ${isDark ? "text-slate-500" : "text-gray-400"}`}>hace {i + 1}h</span>
              </div>
            ))}
          </div>
        </div>
        {renderModals()}
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Instancias</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestión y monitoreo de instancias PostgreSQL de AgroCloud. (Creación reservada únicamente para clientes contratantes)</p>
        </div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL", value: String(instancesList.length), sub: "Instancias registradas", color: isDark ? "text-blue-400 bg-blue-950/60 border border-blue-800/40" : "text-blue-500 bg-blue-50", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
          { label: "ACTIVAS", value: String(instancesList.filter(i => i.estado === "Operativa" || i.estado === "Activa" || (i.estado as string) === "active").length), sub: "En producción", color: isDark ? "text-lime-400 bg-lime-950/60 border border-lime-800/40" : "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "DETENIDAS", value: String(instancesList.filter(i => i.estado === "Detenida" || i.estado === "Suspendida").length), sub: "Sin servicio", color: isDark ? "text-red-400 bg-red-950/60 border border-red-800/40" : "text-red-500 bg-red-50", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "EN REVISIÓN", value: String(instancesList.filter(i => i.estado === "En revisión" || i.estado === "En mantenimiento").length), sub: "En revisión técnica", color: isDark ? "text-amber-400 bg-amber-950/60 border border-amber-800/40" : "text-amber-500 bg-amber-50", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar instancia..." className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${isDark ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500" : "bg-white border-gray-200 text-gray-900"}`} />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={["Todos", "Activa", "Detenida", "En revisión", "Suspendida"].map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div className={`border rounded-xl overflow-x-auto ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className={`border-b ${isDark ? "bg-slate-800/60 border-slate-800 text-slate-400" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
              {["Instancia", "Cliente", "Plantilla", "Plan", "Almacenamiento", "Estado", "Creada", "Acciones"].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
            {filtered.map(inst => (
              <tr key={inst.id} className={`transition-colors cursor-pointer ${isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50"}`} onClick={() => setDetail(inst)}>
                <td className={`px-5 py-4 font-mono text-xs font-medium whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>{inst.nombre}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-300" : "text-gray-600"}`}>{inst.cliente}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.plantilla}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.plan}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.almacenamiento}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado} /></td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inst.creada}</td>
                <td className="px-5 py-4 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === inst.id ? null : inst.id)} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === inst.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className={`absolute right-4 top-10 z-20 border rounded-xl shadow-lg py-1 w-40 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-gray-200 text-gray-700"}`}>
                        {["Ver detalles", "Ver métricas", "Reiniciar", "Detener", "Iniciar", "Suspender", "Eliminar"].map((a, i) => (
                          <button key={a} onClick={() => performAction(a, inst)} className={`w-full text-left px-4 py-2 transition-colors cursor-pointer ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"} ${i >= 5 ? "text-red-500" : ""}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`px-5 py-3 text-xs border-t ${isDark ? "border-slate-800 text-slate-400" : "border-gray-50 text-gray-400"}`}>{filtered.length} instancia{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {renderModals()}
    </div>
  );
}

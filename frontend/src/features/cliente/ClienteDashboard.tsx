import { useState } from "react";
import { ActivityIcon, StatusBadge } from "../../components/ui";
import { C_PLANTILLAS } from "../../data/cliente";
import type { CPlantillaDB, ClientePage } from "../../types/cliente";
import { SvgPaths } from "./ClienteInstancias";

export function ClienteDashboard({ onNavigate }: { onNavigate?: (p: ClientePage) => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState<CPlantillaDB | null>(null);

  const clienteActivity = [
    { icon: "resuelta" as const, title: "Instancia creada", sub: "agro-inventario-db · 30 ago" },
    { icon: "abierta" as const, title: "Suscripción renovada", sub: "Plan Productor · 29 ago" },
    { icon: "asignada" as const, title: "Incidencia enviada", sub: "INC-024 · 28 ago" },
  ];
  const myInstances = [
    { nombre: "agro-produccion-db", motor: "PostgreSQL", plantilla: "Cosechas y producción", almac: "22 / 50 GB", estado: "Activa" },
    { nombre: "agro-inventario-db", motor: "PostgreSQL", plantilla: "Control de inventarios", almac: "10 / 50 GB", estado: "Activa" },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Panel de control</h1>
        <p className="text-sm text-gray-500 mt-1">Administra tus bases de datos y servicios de AgroCloud.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "INSTANCIAS", value: "2", sub: "Instancias activas", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", color: "text-lime-600 bg-lime-50" },
          { label: "ALMACENAMIENTO", value: "32 GB", sub: "/ 50 GB", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", color: "text-blue-500 bg-blue-50" },
          { label: "PLAN", value: "Productor", sub: "Q60 / mes", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "text-purple-500 bg-purple-50" },
          { label: "SUSCRIPCIÓN", value: "Activa", sub: "Estado actual", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-lime-600 bg-lime-50" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 text-left flex flex-col items-start">
            <div className="flex items-center justify-start gap-2 mb-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Mis instancias</h2>
              <p className="text-xs text-gray-400 mt-0.5">Recursos PostgreSQL asociados a tu cuenta.</p>
            </div>
            <button onClick={() => onNavigate?.("instancias")} className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Ver detalles
            </button>
          </div>
          <table className="w-full min-w-max text-xs">
            <thead><tr className="border-b border-gray-100">{["Nombre", "Motor", "Plantilla", "Almac.", "Estado", ""].map(h => <th key={h} className="px-5 py-3 text-center text-gray-400 font-medium uppercase tracking-wide text-[10px]">{h}</th>)}</tr></thead>
            <tbody>
              {myInstances.map(inst => (
                <tr key={inst.nombre} className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-center">
                  <td className="px-5 py-4 font-mono font-medium text-gray-900">{inst.nombre}</td>
                  <td className="px-5 py-4 text-gray-500">{inst.motor}</td>
                  <td className="px-5 py-4 text-gray-600">{inst.plantilla}</td>
                  <td className="px-5 py-4 text-gray-500">{inst.almac}</td>
                  <td className="px-5 py-4 flex justify-center"><StatusBadge s={inst.estado} /></td>
                  <td className="px-5 py-4 text-gray-400">
                    <button onClick={() => onNavigate?.("instancias")} className="text-xs text-lime-600 hover:text-lime-700 font-medium">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 text-center text-xs text-gray-400">2 de 2 instancias · Capacidad disponible 18 GB</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
          </div>
          <div className="p-5 space-y-5">
            {clienteActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <ActivityIcon tipo={a.icon} />
                <div>
                  <p className="text-xs text-gray-800 font-medium">{a.title}</p>
                  <p className="text-[10px] text-gray-400">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Plantillas disponibles</h2>
            <p className="text-xs text-gray-400 mt-0.5">Schemas preconfigurados para crear nuevas bases de datos.</p>
          </div>
          <button onClick={() => onNavigate?.("plantillas")} className="text-xs text-lime-600 hover:text-lime-700 font-medium">
            Ver todas →
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {C_PLANTILLAS.slice(0, 3).map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className="border border-gray-100 rounded-xl p-4 hover:border-lime-200 hover:bg-lime-50/30 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                <SvgPaths d={t.icon} className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-800 mb-0.5">{t.nombre}</p>
              <p className="text-xs text-gray-400 mb-3">{t.categoria}</p>
              <span className="text-[10px] font-semibold bg-lime-100 text-lime-700 px-2 py-0.5 rounded">Disponible</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Detalle de plantilla desde Dashboard */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelectedTemplate(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button onClick={() => setSelectedTemplate(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <SvgPaths d={selectedTemplate.icon} className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">{selectedTemplate.nombre}</h3>
                <span className="text-xs text-gray-400">{selectedTemplate.categoria} · {selectedTemplate.tablas} tablas</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{selectedTemplate.descripcion}</p>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Entidades incluidas</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate.entidades.map(ent => (
                  <span key={ent} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{ent}</span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Casos de uso principales</p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {selectedTemplate.casosDeUso.map((uso, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 shrink-0" />
                    <span>{uso}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setSelectedTemplate(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                Cerrar
              </button>
              <button onClick={() => { setSelectedTemplate(null); onNavigate?.("plantillas"); }} className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg text-sm font-semibold transition-colors">
                Ir a Plantillas DB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

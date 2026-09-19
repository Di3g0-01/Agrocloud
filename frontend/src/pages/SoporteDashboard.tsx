import React, { useState, useEffect } from 'react';
import { getIncidencias, resolverIncidencia } from '../api/incidenciasApi';
import type { Incidencia } from '../types';
import {
  LifeBuoy,
  CheckCircle2,
  RefreshCw,
  FileText,
} from 'lucide-react';

export const SoporteDashboard: React.FC = () => {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIncidencia, setSelectedIncidencia] = useState<Incidencia | null>(null);

  const fetchIncidencias = async () => {
    setLoading(true);
    try {
      const data = await getIncidencias();
      setIncidencias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidencias();
  }, []);

  const handleResolve = async (id: string) => {
    await resolverIncidencia(id);
    setIncidencias(incidencias.map((inc) => (inc.id === id ? { ...inc, estado: 'RESUELTA' } : inc)));
    if (selectedIncidencia?.id === id) {
      setSelectedIncidencia({ ...selectedIncidencia, estado: 'RESUELTA' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-2">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Módulo de Soporte Técnico</span>
            </div>
            <h1 className="text-2xl lg:text-4xl font-extrabold text-white">
              Gestión de Incidencias e Instancias
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-1">
              Monitoreo técnico de bases de datos de clientes y atención de tickets.
            </p>
          </div>

          <button
            onClick={fetchIncidencias}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refrescar Incidencias</span>
          </button>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Tickets */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tickets Reportados</h2>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                Cargando incidencias...
              </div>
            ) : incidencias.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                No hay incidencias registradas.
              </div>
            ) : (
              <div className="space-y-3">
                {incidencias.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidencia(inc)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedIncidencia?.id === inc.id
                        ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono text-slate-500">{inc.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          inc.prioridad === 'ALTA'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : inc.prioridad === 'MEDIA'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {inc.prioridad}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{inc.asunto}</h3>
                    <p className="text-xs text-slate-400 mb-3">{inc.cliente}</p>

                    <div className="flex items-center justify-between text-[11px] border-t border-slate-800 pt-2 text-slate-500">
                      <span>{inc.fecha}</span>
                      <span className="font-semibold text-sky-400">{inc.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Detail / Diagnostics Panel */}
          <div className="lg:col-span-2">
            {selectedIncidencia ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-sky-400 font-bold">{selectedIncidencia.id}</span>
                    <h2 className="text-xl font-bold text-white mt-1">{selectedIncidencia.asunto}</h2>
                    <p className="text-xs text-slate-400 mt-1">Cliente: {selectedIncidencia.cliente}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedIncidencia.estado === 'RESUELTA'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {selectedIncidencia.estado}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Instancia Afectada:</span>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <span className="font-mono text-emerald-400 font-semibold">{selectedIncidencia.instanciaNombre}</span>
                      <span className="text-slate-400 text-[11px]">Plantilla: {selectedIncidencia.plantilla}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Descripción del Problema:</span>
                    <p className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 leading-relaxed">
                      {selectedIncidencia.problema}
                    </p>
                  </div>

                  {selectedIncidencia.guiaDiagnostico && (
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1">Guía de Diagnóstico Técnico:</span>
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-sky-300 space-y-1">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          <span>{selectedIncidencia.guiaDiagnostico}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedIncidencia.estado !== 'RESUELTA' && (
                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleResolve(selectedIncidencia.id)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Marcar como Resuelta</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center text-slate-500 text-xs">
                Selecciona un ticket de la lista para inspeccionar los detalles técnicos y diagnósticos.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

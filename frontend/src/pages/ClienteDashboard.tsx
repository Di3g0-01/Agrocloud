import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInstancias, crearInstancia, reiniciarInstancia, eliminarInstancia } from '../api/instanciasApi';
import type { InstanciaDB } from '../types';
import {
  Database,
  Plus,
  RefreshCw,
  Trash2,
  Key,
  HardDrive,
  Activity,
  Lock,
  Layers,
  Sparkles,
  X,
  Copy,
  Check,
} from 'lucide-react';

export const ClienteDashboard: React.FC = () => {
  const { user } = useAuth();
  const [instancias, setInstancias] = useState<InstanciaDB[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showCredsModal, setShowCredsModal] = useState<InstanciaDB | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // New Instance Form
  const [newInstanceName, setNewInstanceName] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('Cultivos y parcelas');
  const [creating, setCreating] = useState<boolean>(false);

  const plantillas = [
    'Cultivos y parcelas',
    'Cosechas y producción',
    'Control de inventarios',
    'Gestión de trabajadores',
    'Registro de maquinaria',
    'Proveedores',
    'Clientes y ventas',
  ];

  const fetchInstancias = async () => {
    setLoading(true);
    try {
      const data = await getInstancias();
      setInstancias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstancias();
  }, []);

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstanceName) return;
    setCreating(true);

    try {
      const nueva = await crearInstancia({
        nombre: newInstanceName.toLowerCase().replace(/\s+/g, '-'),
        plantilla: selectedTemplate,
      });
      setInstancias([nueva, ...instancias]);
      setShowCreateModal(false);
      setNewInstanceName('');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleRestart = async (id: string) => {
    await reiniciarInstancia(id);
    alert(`Solicitud de reinicio enviada para la instancia ${id}`);
    fetchInstancias();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta instancia de base de datos?')) {
      await eliminarInstancia(id);
      setInstancias(instancias.filter((i) => i.id !== id));
    }
  };

  const copyCredsToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suscripción Activa: Plan Productor (50 GB)</span>
            </div>
            <h1 className="text-2xl lg:text-4xl font-extrabold text-white">
              Bienvenido, {user?.nombre || 'Productor Agricola'}
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-1">
              Empresa: <strong className="text-slate-200">{user?.empresa || 'Finca Los Pinos'}</strong> — Gestión de Instancias DBaaS PostgreSQL
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Instancia DB</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Instancias Activas</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{instancias.length} / 2</div>
            <div className="text-[11px] text-emerald-400 mt-1">1 disponible en tu plan</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Uso Almacenamiento</span>
              <HardDrive className="w-4 h-4 text-lime-400" />
            </div>
            <div className="text-2xl font-bold text-white">12.4 GB / 50 GB</div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div className="bg-lime-400 h-1.5 rounded-full" style={{ width: '24.8%' }} />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Promedio Uptime</span>
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-[11px] text-slate-400 mt-1">Estado de red óptimo</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Motor DBaaS</span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white">PostgreSQL 16</div>
            <div className="text-[11px] text-sky-400 mt-1">Puerto Estándar 5432</div>
          </div>
        </div>

        {/* Instancias List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Tus Instancias de Base de Datos</h2>
            <button
              onClick={fetchInstancias}
              className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar lista</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Cargando instancias de base de datos...
            </div>
          ) : instancias.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
              <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No tienes ninguna instancia creada</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Crea una instancia para comenzar a estructurar tus datos agrícolas.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer"
              >
                Crear Instancia
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instancias.map((inst) => (
                <div
                  key={inst.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          {inst.tipo}
                        </span>
                        <h3 className="text-lg font-bold text-white">{inst.nombre}</h3>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          inst.estado === 'OPERATIVA'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : inst.estado === 'EN_REVISION'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {inst.estado}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-4 mb-6">
                      <div className="flex justify-between">
                        <span>Región:</span>
                        <span className="text-slate-200 font-medium">{inst.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span className="text-slate-200 font-medium">{inst.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uso CPU / RAM:</span>
                        <span className="text-slate-200 font-medium">{inst.cpu}% CPU / {inst.memoria}% RAM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Almacenamiento:</span>
                        <span className="text-slate-200 font-medium">{inst.almacenamientoUsadoGb} GB de {inst.almacenamientoTotalGb} GB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
                    <button
                      onClick={() => setShowCredsModal(inst)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Credenciales</span>
                    </button>
                    <button
                      onClick={() => handleRestart(inst.id)}
                      title="Reiniciar Instancia"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(inst.id)}
                      title="Eliminar Instancia"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Crear Nueva Instancia */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-xl font-bold text-white">Crear Instancia PostgreSQL</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Se desplegará una base de datos administrada con SSL habilitado.
                </p>
              </div>

              <form onSubmit={handleCreateInstance} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Instancia</label>
                  <input
                    type="text"
                    required
                    value={newInstanceName}
                    onChange={(e) => setNewInstanceName(e.target.value)}
                    placeholder="ej: agro-cosechas-2026"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plantilla de Tablas Iniciales</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {plantillas.map((p, idx) => (
                      <option key={idx} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer disabled:opacity-50"
                  >
                    {creating ? 'Creando...' : 'Crear Instancia'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Ver Credenciales Encriptadas */}
        {showCredsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
              <button
                onClick={() => setShowCredsModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Credenciales de Conexión</h3>
                  <p className="text-xs text-slate-400">{showCredsModal.nombre}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Host / Servidor</span>
                  <span className="text-emerald-300 font-mono">{showCredsModal.host || 'db.agrocloud.gt'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Puerto</span>
                    <span className="text-slate-200 font-mono">{showCredsModal.puerto || 5432}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Base de Datos</span>
                    <span className="text-slate-200 font-mono">{showCredsModal.databaseName || 'agro_db'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Usuario DB</span>
                  <span className="text-slate-200 font-mono">{showCredsModal.dbUser || 'agrouser'}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Contraseña Encriptada</span>
                  <span className="text-amber-300 font-mono">pg_sec_key_77a98x21b</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">URI de Conexión JDBC (Spring Boot)</span>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                    jdbc:postgresql://{showCredsModal.host || 'db.agrocloud.gt'}:5432/{showCredsModal.databaseName || 'agro_db'}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  copyCredsToClipboard(
                    `Host: ${showCredsModal.host}\nPuerto: ${showCredsModal.puerto}\nDatabase: ${showCredsModal.databaseName}\nUser: ${showCredsModal.dbUser}`
                  )
                }
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar Credenciales'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

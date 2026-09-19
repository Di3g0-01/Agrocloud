import React, { useState, useEffect } from 'react';
import { getUsuarios, crearUsuario } from '../api/usuariosApi';
import type { User, UserRole } from '../types';
import {
  Users,
  Shield,
  Plus,
  RefreshCw,
  Search,
  Database,
  Activity,
  HardDrive,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New User Form State
  const [newNombre, setNewNombre] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRol, setNewRol] = useState<UserRole>('CLIENTE');
  const [newEmpresa, setNewEmpresa] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre || !newEmail) return;
    setSubmitting(true);

    try {
      const nuevo = await crearUsuario({
        nombre: newNombre,
        email: newEmail,
        rol: newRol,
        empresa: newEmpresa,
      });
      setUsuarios([nuevo, ...usuarios]);
      setShowAddModal(false);
      setNewNombre('');
      setNewEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.empresa && u.empresa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Panel Administrativo Global</span>
            </div>
            <h1 className="text-2xl lg:text-4xl font-extrabold text-white">
              Gestión de Usuarios y Plataforma
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-1">
              Supervisión de cuentas, asignación de roles y métricas de consumo DBaaS.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Usuario</span>
          </button>
        </div>

        {/* Global Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Usuarios Registrados</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{usuarios.length} cuentas</div>
            <div className="text-[11px] text-emerald-400 mt-1">Roles activos: Admin, Cliente, Soporte</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Instancias Totales</span>
              <Database className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white">6 en Plataforma</div>
            <div className="text-[11px] text-slate-400 mt-1">4 Operativas / 2 En revisión</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Capacidad Cloud Almacenada</span>
              <HardDrive className="w-4 h-4 text-lime-400" />
            </div>
            <div className="text-2xl font-bold text-white">410 GB Disponibles</div>
            <div className="text-[11px] text-lime-400 mt-1">Servidor Railway / PostgreSQL</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Salud del Sistema</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">100% Óptima</div>
            <div className="text-[11px] text-slate-400 mt-1">Spring Security + JWT Filtros OK</div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Directorio de Usuarios y Roles</span>
            </h2>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar usuario o finca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={fetchUsers}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refrescar lista"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Usuario</th>
                  <th className="p-3.5">Empresa / Organización</th>
                  <th className="p-3.5">Rol Asignado</th>
                  <th className="p-3.5">Fecha Registro</th>
                  <th className="p-3.5 rounded-r-xl text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-semibold text-white">
                      <div>{u.nombre}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{u.email}</div>
                    </td>
                    <td className="p-3.5">{u.empresa || 'Particular'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          u.rol === 'ADMIN'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : u.rol === 'SOPORTE'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{u.fechaRegistro || '2026-08-01'}</td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Activo</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Agregar Usuario */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white">Registrar Nuevo Usuario</h3>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    placeholder="ej: David Ixquiac"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="usuario@finca.gt"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa / Cooperativa</label>
                  <input
                    type="text"
                    value={newEmpresa}
                    onChange={(e) => setNewEmpresa(e.target.value)}
                    placeholder="ej: Cooperativa El Roble"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rol de Acceso</label>
                  <select
                    value={newRol}
                    onChange={(e) => setNewRol(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="CLIENTE">Cliente (Productor/Finca)</option>
                    <option value="SOPORTE">Soporte Técnico</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : 'Guardar Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from "react";
import { CustomSelect } from "../../components/ui";
import { USUARIOS_DATA } from "../../data/admin";
import type { Usuario } from "../../types/admin";

interface AdminConfiguracionProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export function AdminConfiguracion({ theme, setTheme }: AdminConfiguracionProps) {
  // Filter for staff users only (Administrador & Soporte)
  const staffUsers = USUARIOS_DATA.filter(
    (u) => u.rol === "Administrador" || u.rol === "Soporte"
  );

  // System security and notifications state
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackupInterval, setAutoBackupInterval] = useState("24h");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

  // State for user creation modal in staff
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newCorreo, setNewCorreo] = useState("");
  const [newRol, setNewRol] = useState<"Administrador" | "Soporte">("Soporte");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre || !newCorreo) return;
    const newStaffUser: Usuario = {
      id: `U0${staffUsers.length + 10}`,
      nombre: newNombre,
      correo: newCorreo,
      rol: newRol,
      org: "AgroCloud",
      estado: "Activo",
      registro: "Hoy",
      acceso: "Justo ahora",
    };
    USUARIOS_DATA.push(newStaffUser);
    setNewNombre("");
    setNewCorreo("");
    setShowAddModal(false);
  };

  const isDark = theme === "dark";

  return (
    <div className={`p-4 lg:p-8 space-y-6 transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div>
        <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Configuración del sistema</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          Administra los usuarios del personal (Administración y Soporte), preferencias de interfaz y políticas de seguridad global.
        </p>
      </div>

      {/* Grid Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        
        {/* Left 2 Columns: Staff Users & Appearance */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Staff Users Card */}
          <div className={`border rounded-2xl p-6 shadow-xs ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-base font-semibold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Usuarios del Sistema (Staff)
                </h2>
                <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-slate-400" : "text-gray-400"}`}>
                  Administradores y agentes de soporte autorizados en AgroCloud.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-lime-400 hover:bg-lime-300 text-gray-900 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Staff
              </button>
            </div>

            <div className={`overflow-x-auto border rounded-xl ${theme === "dark" ? "border-slate-800" : "border-gray-100"}`}>
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-medium ${theme === "dark" ? "bg-slate-800/60 border-slate-800 text-slate-300" : "bg-gray-50 border-gray-100 text-gray-500"}`}>
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Último Acceso</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800" : "divide-gray-100"}`}>
                  {staffUsers.map((u) => (
                    <tr key={u.id} className={`transition-colors ${theme === "dark" ? "hover:bg-slate-800/40" : "hover:bg-gray-50/80"}`}>
                      <td className={`px-4 py-3.5 font-medium flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        <div className="w-7 h-7 rounded-full bg-lime-100 text-lime-800 font-bold text-[10px] flex items-center justify-center">
                          {u.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        {u.nombre}
                      </td>
                      <td className={`px-4 py-3.5 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>{u.correo}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.rol === "Administrador"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-lime-100 text-lime-700 border border-lime-300">
                          {u.estado}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 ${theme === "dark" ? "text-slate-400" : "text-gray-400"}`}>{u.acceso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Theme & Appearance Options */}
          <div className={`border rounded-2xl p-6 shadow-xs ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-base font-semibold mb-1 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Apariencia y Tema del Sistema
            </h2>
            <p className={`text-xs mb-5 ${theme === "dark" ? "text-slate-400" : "text-gray-400"}`}>
              Personaliza el tema visual predeterminado del panel de administración.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  id: "light",
                  label: "Tema Claro",
                  sub: "Limpio y brillante",
                  svg: (
                    <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
                {
                  id: "dark",
                  label: "Tema Oscuro",
                  sub: "Modo nocturno pro",
                  svg: (
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ),
                },
                {
                  id: "system",
                  label: "Modo Sistema",
                  sub: "Sincronizado con SO",
                  svg: (
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id === "dark" ? "dark" : "light")}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                    theme === item.id
                      ? "border-lime-500 ring-2 ring-lime-400/30 bg-lime-50/20"
                      : isDark
                      ? "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="mb-3">{item.svg}</div>
                  <div>
                    <p className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{item.label}</p>
                    <p className={`text-[10px] mt-0.5 ${theme === "dark" ? "text-slate-400" : "text-gray-400"}`}>{item.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Platform Controls & Maintenance */}
        <div className="space-y-6">
          
          {/* Security & System Policies */}
          <div className={`border rounded-2xl p-6 shadow-xs space-y-5 ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-100 text-gray-900"}`}>
            <h2 className={`text-base font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Seguridad Global
            </h2>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-gray-800"}`}>Autenticación de 2 Factores (2FA)</p>
                <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>Requerido para cuentas de Administrador y Soporte.</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="w-4 h-4 accent-lime-500 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"}`}>Tiempo de Inactividad de Sesión</label>
              <CustomSelect
                value={sessionTimeout}
                onChange={(val) => setSessionTimeout(val)}
                options={[
                  { value: "15", label: "15 Minutos" },
                  { value: "30", label: "30 Minutos (Recomendado)" },
                  { value: "60", label: "1 Hora" },
                  { value: "120", label: "2 Horas" },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"}`}>Intentos Fallidos de Inicio de Sesión</label>
              <CustomSelect
                value={maxLoginAttempts}
                onChange={(val) => setMaxLoginAttempts(val)}
                options={[
                  { value: "3", label: "3 Intentos (Estricto)" },
                  { value: "5", label: "5 Intentos (Estándar)" },
                  { value: "10", label: "10 Intentos" },
                ]}
                className="w-full"
              />
            </div>
          </div>

          {/* Operational Backup & Maintenance */}
          <div className={`border rounded-2xl p-6 shadow-xs space-y-5 ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-100 text-gray-900"}`}>
            <h2 className={`text-base font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Operaciones de Plataforma
            </h2>

            <div className="space-y-1.5">
              <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-gray-700"}`}>Respaldo Automático de Sistema</label>
              <CustomSelect
                value={autoBackupInterval}
                onChange={(val) => setAutoBackupInterval(val)}
                options={[
                  { value: "6h", label: "Cada 6 horas" },
                  { value: "12h", label: "Cada 12 horas" },
                  { value: "24h", label: "Diario (Cada 24 horas)" },
                ]}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-gray-800"}`}>Alertas por Correo Electrónico</p>
                <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>Notificar fallas de instancias e incidencias.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-lime-500 rounded cursor-pointer"
              />
            </div>

            <div className={`flex items-center justify-between pt-2 border-t ${isDark ? "border-slate-800" : "border-gray-100"}`}>
              <div>
                <p className="text-xs font-semibold text-red-500">Modo Mantenimiento Global</p>
                <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>Restringe accesos a clientes temporalmente.</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-red-500 rounded cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Modal to Register New Staff Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleAddStaff} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Registrar Nuevo Miembro de Staff</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                required
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                placeholder="Ej. Ing. Carlos Mendoza"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Correo institucional</label>
              <input
                type="email"
                required
                value={newCorreo}
                onChange={(e) => setNewCorreo(e.target.value)}
                placeholder="carlos@agrocloud.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rol asignado</label>
              <CustomSelect<"Administrador" | "Soporte">
                value={newRol}
                onChange={(val) => setNewRol(val)}
                options={[
                  { value: "Soporte", label: "Soporte técnico" },
                  { value: "Administrador", label: "Administrador general" },
                ]}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-bold rounded-xl text-xs transition-colors"
              >
                Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

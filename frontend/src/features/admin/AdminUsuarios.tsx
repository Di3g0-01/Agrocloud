import { useState } from "react";
import { CustomSelect } from "../../components/ui";
import { USUARIOS_DATA } from "../../data/admin";
import type { UsuarioEstado, UsuarioRol } from "../../types/admin";

function UsuarioBadge({ estado }: { estado: UsuarioEstado }) {
  const cls = estado === "Activo" ? "bg-lime-100 text-lime-700 border border-lime-300"
    : estado === "Pendiente" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-red-50 text-red-600 border border-red-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{estado}</span>;
}

function RolBadge({ rol }: { rol: UsuarioRol }) {
  const cls = rol === "Administrador" ? "bg-purple-50 text-purple-700 border border-purple-200"
    : rol === "Soporte" ? "bg-blue-50 text-blue-600 border border-blue-200"
    : "bg-gray-100 text-gray-600 border border-gray-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{rol}</span>;
}

export function AdminUsuarios() {
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = USUARIOS_DATA.filter(u =>
    (rolFilter === "Todos" || u.rol === rolFilter) &&
    (estadoFilter === "Todos" || u.estado === estadoFilter) &&
    (u.nombre.toLowerCase().includes(search.toLowerCase()) || u.correo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de usuarios de la plataforma AgroCloud. (Los usuarios se registran de forma autónoma)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL USUARIOS", value: "52", sub: "Usuarios registrados", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-blue-500 bg-blue-50" },
          { label: "USUARIOS ACTIVOS", value: "45", sub: "Con acceso activo", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-lime-600 bg-lime-50" },
          { label: "ADMINISTRADORES", value: "3", sub: "Con acceso total", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "text-purple-500 bg-purple-50" },
          { label: "SUSPENDIDOS", value: "4", sub: "Acceso restringido", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", color: "text-red-500 bg-red-50" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <CustomSelect
          value={rolFilter}
          onChange={(val) => setRolFilter(val)}
          options={["Todos", "Cliente", "Soporte", "Administrador"].map((r) => ({ value: r, label: r }))}
        />
        <CustomSelect
          value={estadoFilter}
          onChange={(val) => setEstadoFilter(val)}
          options={["Todos", "Activo", "Pendiente", "Suspendido"].map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Usuario", "Correo", "Rol", "Organización", "Estado", "Registro", "Último acceso", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">{u.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                    <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{u.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{u.correo}</td>
                <td className="px-5 py-4"><RolBadge rol={u.rol} /></td>
                <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{u.org}</td>
                <td className="px-5 py-4"><UsuarioBadge estado={u.estado} /></td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{u.registro}</td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{u.acceso}</td>
                <td className="px-5 py-4 relative">
                  <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === u.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-4 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 text-xs">
                        {["Ver usuario", "Editar", "Cambiar rol", "Suspender", "Eliminar"].map((a, i) => (
                          <button key={a} onClick={() => setMenuOpen(null)} className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${i === 4 ? "text-red-500" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} usuario{filtered.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

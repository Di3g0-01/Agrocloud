import { useEffect, useMemo, useState } from 'react';
import { adminUserError, createAdminUser, getAdminUser, listAdminUsers, updateAdminUser, type AdminUser, type ApiRole, type ApiStatus } from '../../api/adminUsersApi';

const roles: Record<ApiRole, string> = { ADMINISTRADOR: 'Administrador', CLIENTE: 'Cliente', SOPORTE: 'Soporte' };
const statuses: Record<ApiStatus, string> = { ACTIVO: 'Activo', PENDIENTE: 'Pendiente', SUSPENDIDO: 'Suspendido' };
const blank = { organizationName: 'AgroCloud', contactName: '', email: '', phone: '', password: '', role: 'SOPORTE' as ApiRole, status: 'ACTIVO' as ApiStatus };

export function AdminUsuarios({ currentUserId, initialUserId }: { currentUserId: string; initialUserId?: string | null }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<ApiRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<ApiStatus | ''>('');
  const [mode, setMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ ...blank });

  useEffect(() => {
    listAdminUsers().then(setUsers).catch(e => setError(adminUserError(e))).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => users.filter(user => {
    const term = search.trim().toLowerCase();
    return (!roleFilter || user.role === roleFilter)
      && (!statusFilter || user.status === statusFilter)
      && (!term || [user.contactName, user.organizationName, user.email].some(value => value?.toLowerCase().includes(term)));
  }), [users, search, roleFilter, statusFilter]);

  const openCreate = () => { setForm({ ...blank }); setSelected(null); setError(''); setMode('create'); };
  const openExisting = async (user: AdminUser, nextMode: 'edit' | 'view') => {
    setError('');
    try {
      const fresh = await getAdminUser(user.id);
      setSelected(fresh);
      setForm({ organizationName: fresh.organizationName, contactName: fresh.contactName || '', email: fresh.email,
        phone: fresh.phone || '', password: '', role: fresh.role, status: fresh.status });
      setMode(nextMode);
    } catch (e) { setError(adminUserError(e)); }
  };

  useEffect(() => {
    if (!initialUserId) return;
    getAdminUser(initialUserId).then(fresh => {
      setSelected(fresh);
      setForm({ organizationName: fresh.organizationName, contactName: fresh.contactName || '', email: fresh.email,
        phone: fresh.phone || '', password: '', role: fresh.role, status: fresh.status });
      setMode('edit');
    }).catch(e => setError(adminUserError(e)));
  }, [initialUserId]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      if (mode === 'create') {
        const created = await createAdminUser(form);
        setUsers(previous => [created, ...previous]);
        setNotice(`Cuenta de ${roles[created.role].toLowerCase()} creada. Ya puede iniciar sesión.`);
      } else if (mode === 'edit' && selected) {
        const updated = await updateAdminUser(selected.id, { ...form, password: form.password || undefined });
        setUsers(previous => previous.map(user => user.id === updated.id ? updated : user));
        setNotice('Usuario actualizado.');
      }
      setMode(null);
    } catch (e) { setError(adminUserError(e)); }
    finally { setSaving(false); }
  };

  return <div className="p-4 lg:p-8 max-w-7xl mx-auto">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div><h1 className="text-2xl font-semibold">Usuarios</h1><p className="text-sm text-gray-500 mt-1">Administra cuentas de clientes, soporte y administradores.</p></div>
      <button onClick={openCreate} className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800">Agregar miembro de soporte</button>
    </div>
    {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">{notice}</p>}
    {error && !mode && <p role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</p>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {([['Total usuarios', users.length], ['Activos', users.filter(u => u.status === 'ACTIVO').length], ['Soporte', users.filter(u => u.role === 'SOPORTE').length], ['Suspendidos', users.filter(u => u.status === 'SUSPENDIDO').length]] as const).map(([label, count]) =>
        <div key={label} className="bg-white border border-gray-100 rounded-xl p-4"><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-semibold mt-2">{count}</p></div>)}
    </div>
    <div className="flex flex-wrap gap-3 mb-4">
      <input aria-label="Buscar usuario" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, finca o correo" className="flex-1 min-w-56 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
      <select aria-label="Filtrar por rol" value={roleFilter} onChange={e => setRoleFilter(e.target.value as ApiRole | '')} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"><option value="">Todos los roles</option>{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Filtrar por estado" value={statusFilter} onChange={e => setStatusFilter(e.target.value as ApiStatus | '')} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"><option value="">Todos los estados</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
      <table className="w-full min-w-[740px] text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr>{['Nombre', 'Correo', 'Rol', 'Organización', 'Estado', 'Registro', 'Acciones'].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{filtered.map(user => <tr key={user.id} className="border-t border-gray-100">
          <td className="px-4 py-3 font-medium">{user.contactName || user.organizationName}</td><td className="px-4 py-3">{user.email}</td>
          <td className="px-4 py-3">{roles[user.role]}</td><td className="px-4 py-3">{user.organizationName}</td><td className="px-4 py-3">{statuses[user.status]}</td>
          <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString('es-GT')}</td>
          <td className="px-4 py-3 whitespace-nowrap"><button onClick={() => openExisting(user, 'view')} className="text-green-700 hover:underline mr-3">Ver</button><button onClick={() => openExisting(user, 'edit')} className="text-green-700 hover:underline">Editar</button></td>
        </tr>)}</tbody></table>
      <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">{loading ? 'Cargando usuarios...' : `${filtered.length} usuario(s)`}</p>
    </div>
    {mode && <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-label={mode === 'create' ? 'Agregar miembro de soporte' : 'Detalles de usuario'} className="w-full max-w-xl bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto text-gray-900">
        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">{mode === 'create' ? 'Agregar miembro de soporte' : mode === 'edit' ? 'Editar usuario' : 'Detalle del usuario'}</h2><button onClick={() => setMode(null)} aria-label="Cerrar" className="text-gray-500 text-xl">×</button></div>
        {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm">Nombre del contacto<input required={mode === 'create'} maxLength={150} disabled={mode === 'view'} value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          <label className="text-sm">Organización o finca<input required maxLength={150} disabled={mode === 'view'} value={form.organizationName} onChange={e => setForm({ ...form, organizationName: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          <label className="text-sm">Correo electrónico<input type="email" required maxLength={254} disabled={mode === 'view'} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          <label className="text-sm">Teléfono<input maxLength={30} disabled={mode === 'view'} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          {mode === 'create' && <label className="text-sm sm:col-span-2">Contraseña inicial<input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /><span className="text-xs text-gray-500">Compártela con el miembro de soporte por un canal privado.</span></label>}
          {mode === 'edit' && <label className="text-sm sm:col-span-2">Nueva contraseña (opcional)<input type="password" minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /><span className="text-xs text-gray-500">Déjala vacía para conservar la contraseña actual.</span></label>}
          <label className="text-sm">Rol<select disabled={mode !== 'edit' || selected?.id === currentUserId} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as ApiRole })} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {mode !== 'create' && <label className="text-sm">Estado<select disabled={mode === 'view' || selected?.id === currentUserId} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ApiStatus })} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2"><button type="button" onClick={() => setMode(null)} className="px-4 py-2 rounded-lg border text-sm">Cerrar</button>{mode !== 'view' && <button disabled={saving} type="submit" className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm disabled:opacity-50">{saving ? 'Guardando...' : mode === 'create' ? 'Crear cuenta' : 'Guardar cambios'}</button>}</div>
        </form>
      </div>
    </div>}
  </div>;
}

import { useState } from "react";
import { Toggle } from "../../components/ui";

export function ClienteConfiguracion() {
  const [perfil, setPerfil] = useState({ nombre: "Carlos Monterroso", correo: "carlos@fincalospinos.gt", telefono: "+502 4455 6677", nit: "1234567-8" });
  const [perfilEdit, setPerfilEdit] = useState({ ...perfil });
  const [perfilDirty, setPerfilDirty] = useState(false);
  const [perfilOk, setPerfilOk] = useState(false);

  const [notifs, setNotifs] = useState({ instancias: true, pagos: true, incidencias: false });

  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [passErr, setPassErr] = useState<Partial<typeof passForm>>({});
  const [passOk, setPassOk] = useState(false);

  function handlePerfilChange(field: keyof typeof perfilEdit, value: string) {
    setPerfilEdit(p => ({ ...p, [field]: value }));
    setPerfilDirty(true);
    setPerfilOk(false);
  }

  function guardarPerfil() {
    setPerfil(perfilEdit);
    setPerfilDirty(false);
    setPerfilOk(true);
    setTimeout(() => setPerfilOk(false), 3000);
  }

  function validarPass() {
    const err: Partial<typeof passForm> = {};
    if (!passForm.actual) err.actual = "Ingresa tu contraseña actual.";
    if (passForm.nueva.length < 8) err.nueva = "Mínimo 8 caracteres.";
    if (passForm.nueva !== passForm.confirmar) err.confirmar = "Las contraseñas no coinciden.";
    setPassErr(err);
    return Object.keys(err).length === 0;
  }

  function cambiarPass() {
    if (!validarPass()) return;
    setPassOk(true);
    setShowPassModal(false);
    setPassForm({ actual: "", nueva: "", confirmar: "" });
    setPassErr({});
    setTimeout(() => setPassOk(false), 4000);
  }

  const sectionHead = (title: string, subtitle: string) => (
    <div className="mb-5">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Administra el perfil, preferencias y seguridad de tu cuenta.</p>
      </div>

      {passOk && (
        <div className="mb-5 bg-lime-50 border border-lime-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-lime-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm text-lime-800 font-medium">Contraseña actualizada correctamente.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Perfil */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            {sectionHead("Perfil y organización", "Información de tu cuenta y datos de contacto.")}

            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-lime-600 flex items-center justify-center text-white text-lg font-bold shrink-0">FL</div>
              <div>
                <p className="font-semibold text-gray-900">Finca Los Pinos</p>
                <p className="text-xs text-gray-400">Organización · Plan Productor</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {([
                { id: "cfg-nombre", label: "Nombre de contacto", field: "nombre" as const },
                { id: "cfg-tel", label: "Teléfono", field: "telefono" as const },
                { id: "cfg-nit", label: "NIT / Identificación fiscal", field: "nit" as const },
              ] as { id: string; label: string; field: keyof typeof perfilEdit }[]).map(f => (
                <div key={f.id} className={f.field === "nit" ? "col-span-2" : ""}>
                  <label htmlFor={f.id} className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                  <input id={f.id} value={perfilEdit[f.field]} onChange={e => handlePerfilChange(f.field, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Correo electrónico</label>
                <div className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500 select-none">{perfilEdit.correo}</div>
                <p className="text-[10px] text-gray-400 mt-1">El correo de contacto no puede modificarse directamente. Contacta a soporte si necesitas cambiarlo.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={guardarPerfil} disabled={!perfilDirty}
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg text-sm transition-colors">
                Guardar cambios
              </button>
              {perfilDirty && <span className="text-xs text-amber-600 font-medium">Cambios sin guardar</span>}
              {perfilOk && !perfilDirty && <span className="text-xs text-lime-600 font-medium flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Guardado</span>}
            </div>
          </div>

          {/* Preferencias */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            {sectionHead("Preferencias y Estado", "Configuración de notificaciones y resumen de tu cuenta.")}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Plan Actual</p>
                <p className="text-sm font-medium text-gray-900">Plan Productor</p>
                <p className="text-xs text-gray-500 mt-1">Suscripción activa. Renueva el 1 de oct 2026.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Recursos Utilizados</p>
                <p className="text-sm font-medium text-gray-900">2 de 2 Instancias</p>
                <p className="text-xs text-gray-500 mt-1">32 GB de 50 GB en almacenamiento.</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificaciones por correo</p>
              <Toggle checked={notifs.instancias} onChange={v => setNotifs(n => ({ ...n, instancias: v }))} label="Estado de instancias" />
              <Toggle checked={notifs.pagos} onChange={v => setNotifs(n => ({ ...n, pagos: v }))} label="Pagos y suscripción" />
              <Toggle checked={notifs.incidencias} onChange={v => setNotifs(n => ({ ...n, incidencias: v }))} label="Actualizaciones de incidencias" />
            </div>
          </div>

        </div>

        {/* Right column: Seguridad + aviso */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            {sectionHead("Seguridad", "Contraseña y acceso a tu cuenta.")}

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Correo de acceso</label>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-500 select-none">carlos@fincalospinos.gt</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Contraseña</label>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-400 font-mono tracking-widest select-none">••••••••••••</div>
              </div>
            </div>

            <button onClick={() => setShowPassModal(true)}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors">
              Cambiar contraseña
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3">
            <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">Sesión segura</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">Tu sesión está protegida mediante HTTPS. Si detectas actividad inusual, cambia tu contraseña y contacta a soporte.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: cambiar contraseña */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowPassModal(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" role="dialog" aria-modal="true" aria-label="Cambiar contraseña">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Cambiar contraseña</h2>
              <button onClick={() => setShowPassModal(false)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              {([
                { id: "pass-actual", label: "Contraseña actual", field: "actual" as const },
                { id: "pass-nueva", label: "Nueva contraseña", field: "nueva" as const },
                { id: "pass-conf", label: "Confirmar nueva contraseña", field: "confirmar" as const },
              ] as { id: string; label: string; field: keyof typeof passForm }[]).map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                  <input id={f.id} type="password" value={passForm[f.field]} onChange={e => setPassForm(p => ({ ...p, [f.field]: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${passErr[f.field] ? "border-red-300" : "border-gray-200"}`} />
                  {passErr[f.field] && <p className="text-[10px] text-red-500 mt-1">{passErr[f.field]}</p>}
                </div>
              ))}
              <p className="text-[10px] text-gray-400">La contraseña debe tener al menos 8 caracteres.</p>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => { setShowPassModal(false); setPassErr({}); setPassForm({ actual: "", nueva: "", confirmar: "" }); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button onClick={cambiarPass} className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium rounded-lg text-sm transition-colors">Actualizar contraseña</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

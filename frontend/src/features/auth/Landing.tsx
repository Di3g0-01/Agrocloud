import { useState } from "react";

export function Landing({ onLogin }: { onLogin: () => void }) {
  const DARK = "#0d1a0b";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const features = [
    { icon: "M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7", label: "Infraestructura administrada" },
    { icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", label: "Bases de datos" },
    { icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9", label: "Acceso desde Internet" },
    { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Escalabilidad" },
    { icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Gestión web" },
  ];
  const tplIcons = [
    "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
    "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  ];
  const templates = ["Cultivos y parcelas", "Cosechas y producción", "Inventarios", "Maquinaria", "Proveedores", "Clientes y ventas"];
  const steps = ["Crea tu cuenta", "Selecciona un plan", "Crea tu instancia", "Conecta tu aplicación"];
  const plans = [
    { name: "Finca", storage: "10 GB", instances: "1 instancia de base de datos", price: "Q25", featured: false },
    { name: "Productor", storage: "50 GB", instances: "1 instancia de base de datos", price: "Q60", featured: false },
    { name: "Agro Pro", storage: "100 GB", instances: "1 instancia de base de datos", price: "Q120", featured: false },
    { name: "Agro Ent.", storage: "200 GB", instances: "1 instancia de base de datos", price: "Q250", featured: false },
  ];

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <svg className="w-6 h-6" style={{ color: DARK }} fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
            <span className="font-semibold text-gray-900">AgroCloud</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 flex-1 justify-center">
            {["Plataforma", "Plantillas", "Planes", "Documentación"].map(l => (
              <button key={l} className="hover:text-gray-900 transition-colors">{l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button onClick={onLogin} className="text-sm text-gray-600 hover:text-gray-900 font-medium">Iniciar sesión</button>
            <button onClick={onLogin} className="text-sm bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors">Comenzar gratis</button>
          </div>
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <button onClick={onLogin} className="text-sm bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-3 py-1.5 rounded-lg transition-colors">Comenzar</button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-3">
            {["Plataforma", "Plantillas", "Planes", "Documentación"].map(l => (
              <button key={l} className="text-sm text-gray-600 hover:text-gray-900 text-left py-1 transition-colors">{l}</button>
            ))}
            <button onClick={onLogin} className="text-sm text-gray-600 hover:text-gray-900 font-medium text-left py-1">Iniciar sesión</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: DARK }} className="px-6 pt-20 pb-24 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            Bases de datos en la nube para el sector agrícola.
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-lg mx-auto">
            Crea y administra instancias de PostgreSQL en una infraestructura cloud diseñada para productores, fincas, cooperativas y empresas agroindustriales.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={onLogin} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              Crear instancia →
            </button>
            <button className="border border-white/20 hover:border-white/40 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              Ver planes
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-xs font-semibold tracking-widest text-lime-600 uppercase mb-4 flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
            Una nube diseñada para el campo
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Tu información agrícola merece una<br />infraestructura confiable
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-14">
            AgroCloud proporciona infraestructura de bases de datos administrada en la nube para que productores, fincas, cooperativas y empresas agroindustriales puedan almacenar y centralizar su información sin instalar, configurar o mantener servidores propios.
          </p>
          <div className="flex flex-wrap justify-center gap-10">
            {features.map(f => (
              <div key={f.label} className="flex flex-col items-center gap-3 w-28 text-center">
                <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon.split("M").filter(Boolean).map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={"M" + d} />)}
                  </svg>
                </div>
                <span className="text-xs text-gray-600 leading-snug">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ── */}
      <section className="px-6 py-20 bg-gray-50 text-center">
        <div className="max-w-3xl mx-auto mb-12 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Infraestructura para tus datos agrícolas</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Utiliza tus instancias de AgroCloud para almacenar la información generada por las operaciones de tu organización.
          </p>
        </div>
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
          {templates.map((t, i) => (
            <div key={t} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 hover:border-lime-300 hover:shadow-sm transition-all cursor-pointer text-center">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {tplIcons[i].split("M").filter(Boolean).map((d, j) => <path key={j} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={"M" + d} />)}
                </svg>
              </div>
              <span className="text-xs text-gray-700 font-medium leading-snug">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mid CTA banner ── */}
      <section className="px-6 py-10 flex justify-center">
        <div className="max-w-3xl w-full rounded-2xl px-10 py-10 text-center" style={{ background: DARK }}>
          <h2 className="text-xl font-bold text-white">Administra tus bases de datos desde un solo lugar</h2>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-6 py-20 bg-white text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-14">Tu base de datos lista en pocos pasos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-4 text-center">
                <div className="w-11 h-11 rounded-full bg-lime-400 flex items-center justify-center text-sm font-bold text-gray-900">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <span className="text-sm text-gray-700 font-medium leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 py-20 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto mb-12 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Elige el plan que se adapta a ti</h2>
          <p className="text-gray-500 text-sm">Soluciones flexibles para cada etapa de tu negocio agrícola.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => (
            <div key={plan.name} className="rounded-2xl p-6 flex flex-col items-center text-center gap-4" style={{ background: DARK }}>
              <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="font-semibold text-white text-base">{plan.name}</h3>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>
                  <span className="text-xs text-white/50">{plan.storage} Almacenamiento</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <span className="text-xs text-white/50">{plan.instances}</span>
                </div>
              </div>
              <div className="mt-auto w-full">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-white/40">/mes</span>
                </div>
                <button onClick={onLogin} className="w-full py-2 border border-white/20 hover:border-lime-400 hover:bg-lime-400 hover:text-gray-900 text-white text-sm font-medium rounded-lg transition-all">
                  Elegir plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-20 text-center" style={{ background: DARK }}>
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
            Lleva la infraestructura de datos de tu organización a la nube
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Administra tus instancias de Bases de Datos de forma simple, segura y escalable, sin necesidad de mantener servidores propios.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={onLogin} className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              Comenzar ahora
            </button>
            <button className="border border-white/20 hover:border-white/40 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              Contactar ventas
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10 w-full text-center">
            {[
              { title: "Producto", links: ["Plataforma", "Características", "Planes", "Soluciones"] },
              { title: "Recursos", links: ["Documentación", "Manual de usuario", "Soporte"] },
              { title: "Empresa", links: ["Nosotros", "Contacto"] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-gray-900 mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><button className="text-sm text-gray-400 hover:text-gray-700 transition-colors">{l}</button></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
              <span className="font-semibold text-gray-900 text-sm">AgroCloud</span>
            </div>
            <p className="text-xs text-gray-400">© 2026 AgroCloud. DBaaS para el sector agrícola. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

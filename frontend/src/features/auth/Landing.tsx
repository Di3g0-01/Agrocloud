import { useState } from "react";

export function Landing({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const DARK = "#0a1609";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>("Productor");

  const features = [
    { icon: "M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7", label: "Infraestructura administrada", detail: "Sin servidores físicos que mantener" },
    { icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", label: "Bases de datos", detail: "PostgreSQL 16 optimizado" },
    { icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9", label: "Acceso desde Internet", detail: "Conexión remota con SSL" },
    { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Escalabilidad", detail: "Crece según tu cosecha" },
    { icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Gestión web", detail: "Panel central intuitivo" },
  ];

  const tplIcons = [
    "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
    "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  ];
  const templates = [
    { title: "Cultivos y parcelas", tag: "Geolocalización" },
    { title: "Cosechas y producción", tag: "Rendimientos" },
    { title: "Inventarios", tag: "Agroquímicos" },
    { title: "Maquinaria", tag: "Mantenimiento" },
    { title: "Proveedores", tag: "Insumos" },
    { title: "Clientes y ventas", tag: "Facturación" }
  ];

  const steps = [
    { num: "01", title: "Crea tu cuenta", desc: "Regístrate en menos de 1 minuto sin tarjeta" },
    { num: "02", title: "Selecciona un plan", desc: "Escoge el almacenamiento adecuado para tu cultivo" },
    { num: "03", title: "Crea tu instancia", desc: "Tu clúster PostgreSQL se aprovisiona en segundos" },
    { num: "04", title: "Conecta tu aplicación", desc: "Obtén tus credenciales seguras y empieza a operar" },
  ];

  const plans = [
    { name: "Finca", storage: "10 GB", instances: "1 instancia de BD", price: "Q25", tag: "Para iniciar" },
    { name: "Productor", storage: "50 GB", instances: "1 instancia de BD", price: "Q60", popular: true, tag: "Más popular" },
    { name: "Agro Pro", storage: "100 GB", instances: "2 instancias de BD", price: "Q120", tag: "Alto rendimiento" },
    { name: "Agro Ent.", storage: "200 GB", instances: "5 instancias de BD", price: "Q250", tag: "Cooperativas" },
  ];

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif] text-slate-800 overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0 cursor-pointer group">
            <img 
              src="/agrocloud-isotipo-green.svg" 
              alt="AgroCloud" 
              className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105 active:scale-95" 
            />
            <span className="text-2xl font-extrabold text-gray-950 tracking-tight group-hover:text-emerald-900 transition-colors">
              AgroCloud
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 flex-1 justify-center">
            {["Plataforma", "Plantillas", "Planes", "Documentación"].map(l => (
              <button 
                key={l} 
                className="relative py-1 hover:text-emerald-700 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#76d322] hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
              >
                {l}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button 
              onClick={onLogin} 
              className="text-sm text-gray-700 hover:text-[#083822] font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button 
              onClick={onRegister} 
              className="relative group overflow-hidden text-sm bg-[#76d322] hover:bg-[#68bc1d] active:scale-95 text-[#082113] font-bold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-[#76d322]/25 hover:shadow-lg hover:shadow-[#76d322]/40 hover:-translate-y-0.5 cursor-pointer touch-scale"
            >
              <span className="relative z-10">Comenzar gratis</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </button>
          </div>

          {/* Menú móvil optimizado con botón llamativo */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <button 
              onClick={onRegister} 
              className="text-xs bg-[#76d322] hover:bg-[#68bc1d] active:scale-95 text-[#082113] font-bold px-3.5 py-2 rounded-lg shadow-sm shadow-[#76d322]/20 transition-all cursor-pointer touch-scale"
            >
              Comenzar gratis
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 rounded-lg transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 px-6 py-4 flex flex-col gap-3 backdrop-blur-md">
            {["Plataforma", "Plantillas", "Planes", "Documentación"].map(l => (
              <button key={l} className="text-sm font-medium text-gray-700 hover:text-emerald-700 text-left py-2 transition-colors">{l}</button>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <button 
                onClick={onLogin} 
                className="w-full text-center py-2.5 text-sm font-semibold text-gray-800 border border-gray-200 rounded-xl"
              >
                Iniciar sesión
              </button>
              <button 
                onClick={onRegister} 
                className="w-full text-center py-2.5 text-sm font-bold bg-[#76d322] text-[#082113] rounded-xl shadow-md shadow-[#76d322]/25"
              >
                Comenzar gratis
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Interactivo con Efectos Dinámicos en Móvil y Desktop ── */}
      <section style={{ background: DARK }} className="relative px-6 pt-20 pb-28 sm:pt-24 sm:pb-32 text-center overflow-hidden">
        {/* Orbes de luz con animación suave en todas las pantallas */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[250px] sm:h-[350px] bg-emerald-500/20 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 right-4 sm:right-10 w-[280px] sm:w-[420px] h-[200px] sm:h-[300px] bg-[#76d322]/15 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none animate-pulse-glow-delayed" />
        
        {/* Retícula sutil */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "28px 28px"
          }}
        />

        <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
          {/* Badge dinámico flotante */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#76d322] text-xs font-semibold mb-6 shadow-inner backdrop-blur-sm animate-float">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#76d322] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#76d322]"></span>
            </span>
            <span>Plataforma Cloud Nativa para el Agro de Guatemala</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Bases de datos en la nube <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-white via-lime-200 to-[#76d322] bg-clip-text text-transparent animate-gradient-text">
              para el sector agrícola.
            </span>
          </h1>

          <p className="text-white/70 text-sm sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto font-normal">
            Crea y administra instancias de PostgreSQL en una infraestructura cloud segura, optimizada para productores, fincas, cooperativas y empresas agroindustriales.
          </p>

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap w-full max-w-md sm:max-w-none">
            <button 
              onClick={onRegister} 
              className="relative group overflow-hidden flex items-center justify-center gap-2 bg-[#76d322] hover:bg-[#68bc1d] active:scale-95 text-[#082113] font-bold px-6 sm:px-7 py-3 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-[#76d322]/25 hover:shadow-xl hover:shadow-[#76d322]/40 hover:-translate-y-1 cursor-pointer w-full sm:w-auto touch-scale"
            >
              <span>Comenzar gratis</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </button>

            <button 
              onClick={() => {
                document.getElementById('planes-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border border-white/20 hover:border-[#76d322]/60 hover:bg-white/5 active:scale-95 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer backdrop-blur-sm w-full sm:w-auto touch-scale"
            >
              Ver planes
            </button>
          </div>
        </div>
      </section>

      {/* ── Features con Hover Cards y Efecto Elevación ── */}
      <section className="px-6 py-20 sm:py-24 bg-white text-center relative z-20 -mt-8 rounded-t-3xl shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <p className="text-xs font-bold tracking-widest text-[#083822] uppercase mb-3 flex items-center justify-center gap-2">
            <img src="/agrocloud-isotipo-green.svg" alt="AgroCloud" className="w-4 h-4 object-contain inline-block animate-pulse" />
            Una nube diseñada para el campo
          </p>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            Tu información agrícola merece una<br className="hidden sm:block" /> infraestructura confiable
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-14">
            AgroCloud proporciona infraestructura administrada de bases de datos para que productores, fincas y cooperativas puedan centralizar su información operativa sin lidiar con servidores físicos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5 w-full">
            {features.map((f) => (
              <div 
                key={f.label} 
                className="group bg-slate-50/80 border border-slate-200/80 hover:border-[#76d322] active:border-[#76d322] hover:bg-white rounded-2xl p-5 flex flex-col items-center text-center gap-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-[#76d322]/15 hover:-translate-y-1.5 active:scale-98 cursor-pointer touch-scale"
              >
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border border-gray-200/90 flex items-center justify-center bg-white shadow-xs group-hover:scale-110 group-hover:bg-[#76d322] group-hover:border-[#76d322] transition-all duration-300">
                  <svg className="w-6 h-6 text-[#083822] group-hover:text-[#082113] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon.split("M").filter(Boolean).map((d, idx) => <path key={idx} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={"M" + d} />)}
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 leading-snug group-hover:text-[#083822] transition-colors">{f.label}</h3>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates con Tarjetas Interactivas ── */}
      <section className="px-6 py-20 sm:py-24 bg-gradient-to-b from-gray-50 to-white text-center">
        <div className="max-w-3xl mx-auto mb-14 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#083822] bg-[#76d322]/20 border border-[#76d322]/40 px-3 py-1 rounded-full mb-3">
            Estructuras predefinidas
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Infraestructura para tus datos agrícolas</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
            Tablas y esquemas listos para alimentar tus sistemas administrativos, dashboards y reportes de producción.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t, i) => (
            <div 
              key={t.title} 
              className="group bg-white border border-gray-200/90 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-[#76d322] active:border-[#76d322] hover:shadow-xl hover:shadow-[#76d322]/15 transition-all duration-300 hover:-translate-y-1.5 active:scale-98 cursor-pointer text-center relative overflow-hidden touch-scale"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#76d322]/15 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150" />
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-[#76d322] group-hover:rotate-6 transition-all duration-300">
                <svg className="w-6 h-6 text-[#083822] group-hover:text-[#082113] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {tplIcons[i].split("M").filter(Boolean).map((d, j) => <path key={j} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={"M" + d} />)}
                </svg>
              </div>
              <span className="text-sm text-gray-900 font-bold leading-snug group-hover:text-[#083822] transition-colors">{t.title}</span>
              <span className="text-[11px] font-medium text-[#083822] bg-[#76d322]/20 border border-[#76d322]/30 px-2.5 py-0.5 rounded-full">
                {t.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mid CTA Banner ── */}
      <section className="px-6 py-12 flex justify-center">
        <div 
          className="max-w-4xl w-full rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.01]" 
          style={{ background: DARK }}
        >
          <div className="absolute top-0 right-1/4 w-80 h-40 bg-[#76d322]/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
              Administra todas tus bases de datos desde un solo lugar
            </h2>
            <p className="text-white/60 text-sm max-w-lg mb-6 leading-relaxed">
              Monitorea estado, consumo de almacenamiento y credenciales en tiempo real con 99.9% de disponibilidad.
            </p>
            <button 
              onClick={onRegister}
              className="bg-[#76d322] hover:bg-[#68bc1d] active:scale-95 text-[#082113] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-300 shadow-md shadow-[#76d322]/25 hover:shadow-lg hover:shadow-[#76d322]/40 hover:-translate-y-0.5 cursor-pointer touch-scale"
            >
              Comenzar en 1 clic
            </button>
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-6 py-20 sm:py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#083822] mb-2">Proceso simplificado</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-14 tracking-tight">Tu base de datos lista en 4 sencillos pasos</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {steps.map((s) => (
              <div 
                key={s.num} 
                className="group relative bg-slate-50 border border-slate-200/70 hover:border-[#76d322] active:border-[#76d322] rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-98 touch-scale"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#76d322] flex items-center justify-center text-base font-extrabold text-[#082113] shadow-sm group-hover:scale-110 group-hover:bg-[#083822] group-hover:text-[#76d322] transition-all duration-300">
                  {s.num}
                </div>
                <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="planes-section" className="px-6 py-20 sm:py-24 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto mb-14 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#083822] bg-[#76d322]/20 border border-[#76d322]/40 px-3 py-1 rounded-full mb-3">
            Planes y Precios
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Elige el plan que se adapta a tu cosecha</h2>
          <p className="text-gray-500 text-sm max-w-md">Sin contratos forzosos. Escala tu almacenamiento cuando lo necesites.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => {
            const isHovered = hoveredPlan === plan.name;
            const isPopular = plan.popular;

            return (
              <div 
                key={plan.name} 
                onMouseEnter={() => setHoveredPlan(plan.name)}
                className={`relative rounded-3xl p-7 flex flex-col items-center text-center gap-5 transition-all duration-300 cursor-pointer ${
                  isPopular 
                    ? "ring-2 ring-[#76d322] shadow-xl shadow-[#76d322]/15 -translate-y-2" 
                    : isHovered 
                    ? "shadow-lg shadow-black/20 -translate-y-1.5" 
                    : "opacity-95"
                }`} 
                style={{ background: DARK }}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 bg-gradient-to-r from-[#76d322] to-emerald-400 text-[#082113] text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                    {plan.tag}
                  </div>
                )}

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 ${isPopular ? "bg-[#76d322] text-[#082113]" : "bg-white/10 text-[#76d322]"}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="font-extrabold text-white text-lg tracking-tight">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <svg className="w-4 h-4 text-[#76d322] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                    </svg>
                    <span className="text-xs text-white/80 font-medium">{plan.storage} Almacenamiento</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <svg className="w-4 h-4 text-[#76d322] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-xs text-white/80 font-medium">{plan.instances}</span>
                  </div>
                </div>

                <div className="mt-auto w-full pt-4 border-t border-white/10">
                  <div className="mb-5">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-white/50 font-normal"> / mes</span>
                  </div>
                  <button 
                    onClick={onRegister} 
                    className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer touch-scale ${
                      isPopular 
                        ? "bg-[#76d322] hover:bg-[#68bc1d] active:scale-95 text-[#082113] shadow-md hover:shadow-lg" 
                        : "border border-white/20 hover:border-[#76d322] hover:bg-[#76d322] hover:text-[#082113] text-white"
                    }`}
                  >
                    Elegir plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-24 sm:py-28 text-center relative overflow-hidden" style={{ background: DARK }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[250px] sm:h-[350px] bg-emerald-500/20 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none animate-pulse-glow" />

        <div className="max-w-2xl mx-auto flex flex-col items-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner animate-float">
            <img src="/agrocloud-isotipo.svg" alt="AgroCloud" className="w-9 h-9 object-contain" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Lleva la infraestructura de datos de tu organización a la nube
          </h2>
          <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-8 sm:mb-10 max-w-lg font-normal">
            Administra tus instancias de Bases de Datos de forma simple, segura y escalable, sin necesidad de mantener servidores propios.
          </p>

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap w-full max-w-md sm:max-w-none">
            <button 
              onClick={onRegister} 
              className="bg-[#76d322] hover:bg-[#68bc1d] active:scale-95 text-[#082113] font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-300 shadow-xl shadow-[#76d322]/30 hover:shadow-2xl hover:shadow-[#76d322]/45 hover:-translate-y-1 cursor-pointer w-full sm:w-auto touch-scale"
            >
              Comenzar ahora gratis
            </button>
            <button 
              onClick={onLogin}
              className="border border-white/20 hover:border-white/40 active:scale-95 text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer backdrop-blur-sm w-full sm:w-auto touch-scale"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 px-6 py-12 sm:py-14 text-center">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mb-10 w-full text-center">
            {[
              { title: "Producto", links: ["Plataforma", "Características", "Planes", "Soluciones"] },
              { title: "Recursos", links: ["Documentación", "Manual de usuario", "Soporte"] },
              { title: "Empresa", links: ["Nosotros", "Contacto", "Privacidad"] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <button className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2.5">
              <img src="/agrocloud-isotipo-green.svg" alt="AgroCloud" className="w-8 h-8 object-contain" />
              <span className="text-xl font-extrabold text-gray-950 tracking-tight">AgroCloud</span>
            </div>
            <p className="text-xs text-gray-400">© 2026 AgroCloud DBaaS para el sector agrícola de Guatemala. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

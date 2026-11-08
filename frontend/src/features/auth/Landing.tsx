import { useState } from "react";

type ModalType = "doc" | "manual" | "soporte" | "nosotros" | "contacto" | "privacidad" | null;

interface FeatureItem {
  icon: string;
  label: string;
  detail: string;
  fullDesc: string;
  specs: string[];
}

interface TemplateItem {
  title: string;
  tag: string;
  descripcion: string;
  tablas: string[];
  ejemploSchema: string;
  utilidad: string;
}

export function Landing({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const DARK = "#0a1609";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>("Productor");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);

  const [contactForm, setContactForm] = useState({ nombre: "", email: "", finca: "", mensaje: "" });
  const [contactSent, setContactSent] = useState(false);

  const [docTab, setDocTab] = useState<"inicio" | "conexion" | "seguridad" | "api">("inicio");
  const [manualRole, setManualRole] = useState<"cliente" | "soporte" | "admin">("cliente");

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectPlan = (planName: string) => {
    try {
      localStorage.setItem("agrocloud_preselected_plan", planName);
    } catch {
    }
    onRegister();
  };

  const features: FeatureItem[] = [
    {
      icon: "M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
      label: "Infraestructura administrada",
      detail: "Sin servidores físicos que mantener",
      fullDesc: "AgroCloud elimina la carga de adquirir, configurar y mantener servidores físicos locales en tus fincas o bodegas. Tu entorno se despliega automáticamente en la nube con monitoreo 24/7 y respaldos continuos.",
      specs: [
        "Aprovisionamiento automatizado en clúster cloud",
        "Cero costos de hardware en sitio ni mantenimiento de red",
        "Respaldos periódicos de datos agronómicos",
        "Alta disponibilidad con arquitectura de contenedores Docker"
      ]
    },
    {
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
      label: "Bases de datos",
      detail: "PostgreSQL 16 optimizado",
      fullDesc: "Cada cliente obtiene instancias de PostgreSQL 16 aisladas lógicamente bajo un esquema dedicado, garantizando cumplimiento de propiedades ACID, soporte para consultas espaciales (PostGIS) y alta velocidad transaccional.",
      specs: [
        "Motor PostgreSQL 16 empresarial",
        "Aislamiento estricto multi-tenant por esquemas",
        "Compatibilidad total con herramientas SQL (DBeaver, pgAdmin)",
        "Pool de conexiones optimizado con HikariCP"
      ]
    },
    {
      icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9",
      label: "Acceso desde Internet",
      detail: "Conexión remota con SSL",
      fullDesc: "Conéctate de forma remota y segura a tu base de datos desde cualquier lugar: oficinas centrales, aplicaciones móviles en el campo, sistemas ERP locales o scripts de análisis de datos con cifrado SSL/TLS.",
      specs: [
        "Puerto TCP seguro expuesto para conexiones remotas",
        "Cifrado de datos en tránsito vía SSL/TLS",
        "Credenciales únicas generadas aleatoriamente",
        "Contraseñas maestras cifradas en reposo con AES-256"
      ]
    },
    {
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      label: "Escalabilidad",
      detail: "Crece según tu cosecha",
      fullDesc: "Comienza con capacidades esenciales para pequeños productores y escala tu almacenamiento de 10 GB hasta 250 GB sin perder información histórica ni requerir migraciones complejas.",
      specs: [
        "Planes flexibles desde Q25/mes",
        "Ampliación de cuota de almacenamiento sin desconexión",
        "Gestión de múltiples instancias simultáneas en planes superiores",
        "Auditoría de espacio ocupado por esquema en tiempo real"
      ]
    },
    {
      icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      label: "Gestión web",
      detail: "Panel central intuitivo",
      fullDesc: "Un panel de control web moderno, responsivo e intuitivo pensado para usuarios del sector agropecuario, sin requerir conocimientos avanzados de ingeniería de sistemas.",
      specs: [
        "Monitoreo interactivo de consumo de CPU, RAM y almacenamiento",
        "Explorador de tablas y datos embebido en navegador",
        "Mesa de ayuda y tickets de soporte técnico integrados",
        "Visualización segura de credenciales con revelado bajo demanda"
      ]
    },
  ];

  const tplIcons = [
    "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
    "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  ];

  const templates: TemplateItem[] = [
    {
      title: "Cultivos y parcelas",
      tag: "Geolocalización",
      descripcion: "Estructura relacional para la administración de parcelas, cultivos, etapas de crecimiento y rendimiento agronómico por manzana o hectárea.",
      tablas: ["parcelas", "cultivos", "siembras", "cosechas", "variedades", "suelos", "sectores", "bitacora_agronomica"],
      ejemploSchema: "CREATE TABLE parcelas (\n  id UUID PRIMARY KEY,\n  nombre VARCHAR(100),\n  extension_mz NUMERIC(8,2),\n  tipo_suelo VARCHAR(50),\n  ubicacion_gps VARCHAR(100)\n);",
      utilidad: "Ideal para fincas de café, hortalizas, caña, cardamomo y granos básicos en Guatemala."
    },
    {
      title: "Cosechas y producción",
      tag: "Rendimientos",
      descripcion: "Monitoreo riguroso de volúmenes recolectados, mermas, control de calidad por lote y registros históricos por temporada productiva.",
      tablas: ["cosechas", "lotes_produccion", "pesajes", "clasificacion_calidad", "rendimientos_esperados", "mermas"],
      ejemploSchema: "CREATE TABLE cosechas (\n  id UUID PRIMARY KEY,\n  lote_id UUID REFERENCES lotes(id),\n  quintales_recolectados NUMERIC(10,2),\n  fecha_corte DATE,\n  calidad_grado VARCHAR(20)\n);",
      utilidad: "Permite calcular proyecciones de quintales o toneladas para exportación o venta nacional."
    },
    {
      title: "Inventarios",
      tag: "Agroquímicos",
      descripcion: "Control exhaustivo de existencias de fertilizantes, semillas certificadas, plaguicidas, herramientas y fechas de vencimiento.",
      tablas: ["insumos", "bodegas", "movimientos_stock", "entradas", "salidas", "proveedores_insumos", "alertas_stock"],
      ejemploSchema: "CREATE TABLE insumos (\n  id UUID PRIMARY KEY,\n  nombre VARCHAR(120),\n  categoria VARCHAR(50),\n  stock_actual NUMERIC(10,2),\n  unidad_medida VARCHAR(20)\n);",
      utilidad: "Evita pérdidas por caducidad y desabastecimiento durante los ciclos críticos de siembra."
    },
    {
      title: "Maquinaria",
      tag: "Mantenimiento",
      descripcion: "Bitácora operativa de tractores, sistemas de fertirriego, bombas de agua, consumo de diésel y programación de mantenimientos.",
      tablas: ["maquinaria", "mantenimientos_preventivos", "reparaciones", "consumo_combustible", "operadores_asignados"],
      ejemploSchema: "CREATE TABLE maquinaria (\n  id UUID PRIMARY KEY,\n  codigo_activo VARCHAR(50),\n  tipo_equipo VARCHAR(80),\n  horas_motor NUMERIC(8,1),\n  ultimo_servicio DATE\n);",
      utilidad: "Maximiza la vida útil del equipo agrícola y reduce paros imprevistos en temporada alta."
    },
    {
      title: "Proveedores",
      tag: "Insumos",
      descripcion: "Catálogo centralizado de casas comerciales agrícolas, contratos de insumos, historial de cotizaciones y términos de crédito.",
      tablas: ["proveedores", "contactos_comerciales", "ordenes_compra", "cotizaciones", "calificacion_proveedor"],
      ejemploSchema: "CREATE TABLE proveedores (\n  id UUID PRIMARY KEY,\n  razon_social VARCHAR(150),\n  nit VARCHAR(20),\n  telefono VARCHAR(30),\n  dias_credito INT\n);",
      utilidad: "Optimiza la negociación de precios por volumen para cooperativas y fincas organizadas."
    },
    {
      title: "Clientes y ventas",
      tag: "Facturación",
      descripcion: "Registro de compradores locales e internacionales, órdenes de despacho, trazabilidad de lotes y estados de cuenta comerciales.",
      tablas: ["clientes_comerciales", "ordenes_venta", "detalles_despacho", "facturacion_lotes", "pagos_recibidos"],
      ejemploSchema: "CREATE TABLE ordenes_venta (\n  id UUID PRIMARY KEY,\n  cliente_id UUID REFERENCES clientes(id),\n  monto_total NUMERIC(12,2),\n  destino VARCHAR(100),\n  estado_pago VARCHAR(30)\n);",
      utilidad: "Facilita la conciliación de ingresos por cosecha y cumplimiento con compradores finales."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Crea tu cuenta",
      desc: "Regístrate en menos de 1 minuto ingresando el nombre de tu finca y correo.",
      action: () => onRegister()
    },
    {
      num: "02",
      title: "Selecciona un plan",
      desc: "Escoge el almacenamiento adecuado para el tamaño de tu explotación agrícola.",
      action: () => scrollToSection("planes-section")
    },
    {
      num: "03",
      title: "Crea tu instancia",
      desc: "Tu clúster PostgreSQL 16 con tu plantilla agrícola se aprovisiona en segundos.",
      action: () => scrollToSection("plantillas-section")
    },
    {
      num: "04",
      title: "Conecta tu aplicación",
      desc: "Obtén tus credenciales seguras y conecta DBeaver, pgAdmin o tus sistemas.",
      action: () => setActiveModal("doc")
    },
  ];

  const plans = [
    { name: "Finca", storage: "10 GB", instances: "1 instancia de BD", price: "Q25", tag: "Para iniciar", desc: "Pensado para pequeños productores que inician su digitalización." },
    { name: "Productor", storage: "50 GB", instances: "1 instancia de BD", price: "Q60", popular: true, tag: "Más popular", desc: "Capacidad ideal para fincas medianas con registro activo de cosechas." },
    { name: "Agro Pro", storage: "100 GB", instances: "2 instancias de BD", price: "Q120", tag: "Alto rendimiento", desc: "Para asociaciones o productores con múltiples fincas y bodegas." },
    { name: "Agro Ent.", storage: "200 GB", instances: "5 instancias de BD", price: "Q250", tag: "Cooperativas", desc: "Infraestructura máxima para cooperativas y empresas agroindustriales." },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.nombre || !contactForm.email || !contactForm.mensaje) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactForm({ nombre: "", email: "", finca: "", mensaje: "" });
      setActiveModal(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif] text-slate-800 overflow-x-hidden">

      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
            title="Ir al inicio de AgroCloud"
          >
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
            <button
              onClick={() => scrollToSection("plataforma-section")}
              className="relative py-1 hover:text-emerald-700 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#76d322] hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
            >
              Plataforma
            </button>
            <button
              onClick={() => scrollToSection("plantillas-section")}
              className="relative py-1 hover:text-emerald-700 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#76d322] hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
            >
              Plantillas
            </button>
            <button
              onClick={() => scrollToSection("planes-section")}
              className="relative py-1 hover:text-emerald-700 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#76d322] hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
            >
              Planes
            </button>
            <button
              onClick={() => setActiveModal("doc")}
              className="relative py-1 hover:text-emerald-700 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#76d322] hover:after:w-full after:transition-all after:duration-300 cursor-pointer flex items-center gap-1.5"
            >
              <span>Documentación</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">Guías</span>
            </button>
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
          <div className="md:hidden border-t border-gray-100 bg-white/95 px-6 py-4 flex flex-col gap-3 backdrop-blur-md animate-in slide-in-from-top-2">
            <button
              onClick={() => scrollToSection("plataforma-section")}
              className="text-sm font-medium text-gray-700 hover:text-emerald-700 text-left py-2 transition-colors flex items-center justify-between"
            >
              <span>Plataforma</span>
              <span className="text-xs text-gray-400">→</span>
            </button>
            <button
              onClick={() => scrollToSection("plantillas-section")}
              className="text-sm font-medium text-gray-700 hover:text-emerald-700 text-left py-2 transition-colors flex items-center justify-between"
            >
              <span>Plantillas DB</span>
              <span className="text-xs text-gray-400">→</span>
            </button>
            <button
              onClick={() => scrollToSection("planes-section")}
              className="text-sm font-medium text-gray-700 hover:text-emerald-700 text-left py-2 transition-colors flex items-center justify-between"
            >
              <span>Planes y Precios</span>
              <span className="text-xs text-gray-400">→</span>
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); setActiveModal("doc"); }}
              className="text-sm font-medium text-emerald-800 font-semibold text-left py-2 transition-colors flex items-center justify-between"
            >
              <span>Documentación y Guías</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Abrir</span>
            </button>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={onLogin}
                className="w-full text-center py-2.5 text-sm font-semibold text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                Iniciar sesión
              </button>
              <button
                onClick={onRegister}
                className="w-full text-center py-2.5 text-sm font-bold bg-[#76d322] text-[#082113] rounded-xl shadow-md shadow-[#76d322]/25 active:scale-95 transition-all cursor-pointer"
              >
                Comenzar gratis
              </button>
            </div>
          </div>
        )}
      </nav>

      <section style={{ background: DARK }} className="relative px-6 pt-20 pb-28 sm:pt-24 sm:pb-32 text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[250px] sm:h-[350px] bg-emerald-500/20 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 right-4 sm:right-10 w-[280px] sm:w-[420px] h-[200px] sm:h-[300px] bg-[#76d322]/15 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none animate-pulse-glow-delayed" />

        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "28px 28px"
          }}
        />

        <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
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
              onClick={() => scrollToSection("planes-section")}
              className="border border-white/20 hover:border-[#76d322]/60 hover:bg-white/5 active:scale-95 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer backdrop-blur-sm w-full sm:w-auto touch-scale"
            >
              Ver planes
            </button>

            <button
              onClick={() => setActiveModal("doc")}
              className="text-white/80 hover:text-[#76d322] text-sm font-semibold px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Ver documentación</span>
            </button>
          </div>
        </div>
      </section>

      <section id="plataforma-section" className="px-6 py-20 sm:py-24 bg-white text-center relative z-20 -mt-8 rounded-t-3xl shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <p className="text-xs font-bold tracking-widest text-[#083822] uppercase mb-3 flex items-center justify-center gap-2">
            <img src="/agrocloud-isotipo-green.svg" alt="AgroCloud" className="w-4 h-4 object-contain inline-block animate-pulse" />
            Una nube diseñada para el campo
          </p>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            Tu información agrícola merece una<br className="hidden sm:block" /> infraestructura confiable
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-14">
            Haz clic en cualquiera de las características para conocer a fondo la arquitectura, seguridad y especificaciones de ingeniería que respaldan cada base de datos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5 w-full">
            {features.map((f) => (
              <div
                key={f.label}
                onClick={() => setSelectedFeature(f)}
                className="group bg-slate-50/80 border border-slate-200/80 hover:border-[#76d322] active:border-[#76d322] hover:bg-white rounded-2xl p-5 flex flex-col items-center text-center gap-3.5 transition-all duration-300 hover:shadow-xl hover:shadow-[#76d322]/15 hover:-translate-y-1.5 active:scale-98 cursor-pointer touch-scale relative"
                title="Haz clic para ver detalles técnicos"
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
                <span className="text-[10px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Ver detalle <span>→</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="plantillas-section" className="px-6 py-20 sm:py-24 bg-gradient-to-b from-gray-50 to-white text-center">
        <div className="max-w-3xl mx-auto mb-14 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#083822] bg-[#76d322]/20 border border-[#76d322]/40 px-3 py-1 rounded-full mb-3">
            Estructuras predefinidas
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Infraestructura para tus datos agrícolas</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
            Selecciona cualquier plantilla para examinar sus tablas relacionales, esquemas DDL y casos de aplicación antes de crear tu clúster.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t, i) => (
            <div
              key={t.title}
              onClick={() => setSelectedTemplate(t)}
              className="group bg-white border border-gray-200/90 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-[#76d322] active:border-[#76d322] hover:shadow-xl hover:shadow-[#76d322]/15 transition-all duration-300 hover:-translate-y-1.5 active:scale-98 cursor-pointer text-center relative overflow-hidden touch-scale"
              title="Haz clic para inspeccionar esquema y tablas"
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
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-emerald-700 transition-colors">
                <span>{t.tablas.length} tablas DDL</span>
                <span>•</span>
                <span className="font-semibold underline">Ver estructura</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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
              Monitorea estado, consumo de almacenamiento y credenciales en tiempo real con 99.9% de disponibilidad garantizada.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                onClick={onRegister}
                className="bg-[#76d322] hover:bg-[#68bc1d] active:scale-95 text-[#082113] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-300 shadow-md shadow-[#76d322]/25 hover:shadow-lg hover:shadow-[#76d322]/40 hover:-translate-y-0.5 cursor-pointer touch-scale"
              >
                Comenzar en 1 clic
              </button>
              <button
                onClick={() => setActiveModal("doc")}
                className="border border-white/20 hover:border-white/40 active:scale-95 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                Manual de Conexión
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="proceso-section" className="px-6 py-20 sm:py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#083822] mb-2">Proceso simplificado</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-14 tracking-tight">Tu base de datos lista en 4 sencillos pasos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {steps.map((s) => (
              <div
                key={s.num}
                onClick={s.action}
                className="group relative bg-slate-50 border border-slate-200/70 hover:border-[#76d322] active:border-[#76d322] rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-98 touch-scale cursor-pointer"
                title="Haz clic para avanzar a este paso"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#76d322] flex items-center justify-center text-base font-extrabold text-[#082113] shadow-sm group-hover:scale-110 group-hover:bg-[#083822] group-hover:text-[#76d322] transition-all duration-300">
                  {s.num}
                </div>
                <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                <span className="text-[11px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Continuar →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                onClick={() => setHoveredPlan(plan.name)}
                className={`relative rounded-3xl p-7 flex flex-col items-center text-center gap-5 transition-all duration-300 cursor-pointer ${isPopular
                    ? "ring-2 ring-[#76d322] shadow-xl shadow-[#76d322]/15 -translate-y-2"
                    : isHovered
                      ? "shadow-lg shadow-black/20 -translate-y-1.5 ring-1 ring-white/20"
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
                  <p className="text-[11px] text-white/60 mt-1 min-h-[28px]">{plan.desc}</p>

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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.name);
                    }}
                    className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer touch-scale ${isPopular
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

      <footer className="bg-white border-t border-gray-100 px-6 py-12 sm:py-14 text-center">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mb-10 w-full text-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Producto</p>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection("plataforma-section")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                    Plataforma Cloud
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("plataforma-section")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                    Características Técnicas
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("planes-section")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                    Planes y Tarifas
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("plantillas-section")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                    Soluciones por Cultivo
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Recursos</p>
              <ul className="space-y-2">
                <li>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveModal("doc")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                      Documentación Técnica
                    </button>
                    <a
                      href="/documentation/AgroCloud_Manual_Tecnico.pdf"
                      download="AgroCloud_Manual_Tecnico.pdf"
                      className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      title="Descargar Manual Técnico PDF"
                    >
                      PDF
                    </a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveModal("manual")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                      Manual de Usuario
                    </button>
                    <a
                      href="/documentation/AgroCloud_Manual_Usuario.pdf"
                      download="AgroCloud_Manual_Usuario.pdf"
                      className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      title="Descargar Manual de Usuario PDF"
                    >
                      PDF
                    </a>
                  </div>
                </li>
                <li>
                  <button onClick={() => setActiveModal("soporte")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                    Mesa de Ayuda y Soporte
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Empresa</p>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActiveModal("nosotros")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                    Acerca de Nosotros
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal("contacto")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                    Contacto y Asistencia
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal("privacidad")} className="text-sm text-gray-500 hover:text-emerald-800 transition-colors cursor-pointer">
                    Seguridad y Privacidad
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col items-center gap-3 w-full">
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img src="/agrocloud-isotipo-green.svg" alt="AgroCloud" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
              <span className="text-xl font-extrabold text-gray-950 tracking-tight group-hover:text-emerald-800 transition-colors">AgroCloud</span>
            </div>
            <p className="text-xs text-gray-400">© 2026 AgroCloud DBaaS para el sector agrícola de Guatemala — Universidad Rafael Landívar. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {selectedFeature && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-lime-100 border border-lime-200 flex items-center justify-center text-[#083822]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {selectedFeature.icon.split("M").filter(Boolean).map((d, idx) => <path key={idx} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={"M" + d} />)}
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedFeature.label}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{selectedFeature.detail}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {selectedFeature.fullDesc}
            </p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Especificaciones técnicas:</h4>
              <ul className="space-y-2">
                {selectedFeature.specs.map((sp, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-lime-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <span>{sp}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedFeature(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => { setSelectedFeature(null); onRegister(); }}
                className="px-5 py-2 text-xs font-bold bg-[#76d322] hover:bg-[#68bc1d] text-[#082113] rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Comenzar gratis
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-lime-100 px-2.5 py-0.5 rounded-full">
                {selectedTemplate.tag}
              </span>
              <span className="text-xs text-gray-400">Plantilla Oficial AgroCloud</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTemplate.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {selectedTemplate.descripcion}
            </p>

            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">Tablas generadas en tu base de datos:</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate.tablas.map(tb => (
                  <span key={tb} className="text-xs font-mono bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md">
                    {tb}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">Ejemplo de DDL relacional (PostgreSQL):</h4>
              <pre className="bg-slate-900 text-lime-300 p-3.5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                {selectedTemplate.ejemploSchema}
              </pre>
            </div>

            <p className="text-xs text-gray-500 mb-6 bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
              <strong>Impacto en finca:</strong> {selectedTemplate.utilidad}
            </p>

            <div className="flex gap-3 justify-end border-t pt-4">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem("agrocloud_preselected_template", selectedTemplate.title);
                  } catch {
                    // noop
                  }
                  setSelectedTemplate(null);
                  onRegister();
                }}
                className="px-5 py-2 text-xs font-bold bg-[#76d322] hover:bg-[#68bc1d] text-[#082113] rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Comenzar con esta plantilla
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "doc" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#76d322]/20 flex items-center justify-center text-[#083822]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Centro de Documentación Técnica</h3>
                <p className="text-xs text-gray-500">Guías de conexión, arquitectura e integración para desarrolladores y administradores</p>
              </div>
            </div>

            <div className="flex border-b border-gray-200 gap-2 mb-4 overflow-x-auto">
              {[
                { id: "inicio", label: "Inicio Rápido" },
                { id: "conexion", label: "Conexión Externa (DBeaver / Python)" },
                { id: "seguridad", label: "Cifrado y Seguridad" },
                { id: "api", label: "API REST" },
              ].map(tb => (
                <button
                  key={tb.id}
                  onClick={() => setDocTab(tb.id as any)}
                  className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${docTab === tb.id ? "border-[#083822] text-[#083822]" : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-4 text-xs text-gray-600 leading-relaxed">
              {docTab === "inicio" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Flujo de Puesta en Marcha (0 a 100):</h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li><strong>Registro y Confirmación:</strong> Registra tu cuenta y confirma el enlace recibido en tu bandeja de entrada.</li>
                    <li><strong>Selección de Plan:</strong> Elige un plan acorde a tu capacidad de almacenamiento (Finca 10GB, Productor 50GB, etc.).</li>
                    <li><strong>Aprovisionamiento:</strong> En el panel de <em>Mis Instancias</em>, pulsa "Nueva Instancia" y selecciona una plantilla agronómica.</li>
                    <li><strong>Consulta de Credenciales:</strong> Presiona el botón "Credenciales", desbloquea tu contraseña protegida con AES y copia los parámetros.</li>
                  </ol>
                </div>
              )}

              {docTab === "conexion" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Parámetros de Conexión Estándar:</h4>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 font-mono text-[11px] space-y-1">
                    <div><strong>Host:</strong> localhost (o dominio de tu clúster cloud)</div>
                    <div><strong>Puerto:</strong> 15432 (local) / 5432 (producción)</div>
                    <div><strong>Base de Datos:</strong> agrocloud_db</div>
                    <div><strong>Esquema:</strong> tu_esquema_personal (ej. inst_finca_los_pinos_a1b2)</div>
                    <div><strong>SSL Mode:</strong> prefer / require</div>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 pt-2">Ejemplo en Python con psycopg2:</h4>
                  <pre className="bg-slate-900 text-lime-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {`import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=15432,
    database="agrocloud_db",
    user="tu_usuario",
    password="tu_password_desencriptado",
    options="-c search_path=inst_finca_los_pinos"
)
cursor = conn.cursor()
cursor.execute("SELECT * FROM parcelas;")
print(cursor.fetchall())`}
                  </pre>
                </div>
              )}

              {docTab === "seguridad" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Arquitectura de Cifrado Militar AES-256:</h4>
                  <p>
                    AgroCloud implementa el algoritmo <strong>AES-256 / GCM / NoPadding</strong> en el módulo <code>EncryptionService.java</code>. Las contraseñas de bases de datos se generan aleatoriamente y se almacenan cifradas en la columna <code>db_password_encrypted</code>.
                  </p>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-emerald-900 font-semibold mb-1">Aislamiento por Esquema (Schema-per-Tenant):</p>
                    <p className="text-emerald-800 text-[11px]">
                      Cada instancia tiene su propio namespace en PostgreSQL. Los usuarios no tienen visibilidad ni privilegios sobre datos de otras organizaciones agrícolas.
                    </p>
                  </div>
                </div>
              )}

              {docTab === "api" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Endpoints REST Principales (Base: /api/v1):</h4>
                  <div className="space-y-2">
                    <div className="p-2 border rounded-lg bg-gray-50 flex items-center justify-between">
                      <span className="font-mono text-emerald-700 font-bold">POST /api/v1/auth/login</span>
                      <span className="text-gray-500">Autenticación y obtención de JWT</span>
                    </div>
                    <div className="p-2 border rounded-lg bg-gray-50 flex items-center justify-between">
                      <span className="font-mono text-emerald-700 font-bold">GET /api/v1/instancias</span>
                      <span className="text-gray-500">Listar instancias del usuario autenticado</span>
                    </div>
                    <div className="p-2 border rounded-lg bg-gray-50 flex items-center justify-between">
                      <span className="font-mono text-emerald-700 font-bold">GET /api/v1/instancias/{'{id}'}/credenciales</span>
                      <span className="text-gray-500">Desencripta credenciales con verificación de rol</span>
                    </div>
                    <div className="p-2 border rounded-lg bg-gray-50 flex items-center justify-between">
                      <span className="font-mono text-emerald-700 font-bold">GET /api/v1/instancias/{'{id}'}/metricas</span>
                      <span className="text-gray-500">Telemetría de CPU, RAM y almacenamiento en tiempo real</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href="/documentation/AgroCloud_Manual_Tecnico.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Abrir PDF</span>
                </a>
                <a
                  href="/documentation/AgroCloud_Manual_Tecnico.pdf"
                  download="AgroCloud_Manual_Tecnico.pdf"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Descargar Manual Técnico (PDF 3.5 MB)</span>
                </a>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cerrar documentación
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "manual" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manual de Usuario AgroCloud</h3>
                <p className="text-xs text-gray-500">Guía práctica paso a paso según tu rol dentro del sistema</p>
              </div>
            </div>

            <div className="flex border-b border-gray-200 gap-2 mb-4">
              {[
                { id: "cliente", label: "Rol: Cliente Agrícola" },
                { id: "soporte", label: "Rol: Soporte Técnico" },
                { id: "admin", label: "Rol: Administrador" },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setManualRole(r.id as any)}
                  className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${manualRole === r.id ? "border-emerald-600 text-emerald-800 font-bold" : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-4 text-xs text-gray-600 leading-relaxed">
              {manualRole === "cliente" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Operaciones Disponibles para el Cliente:</h4>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    <p className="font-semibold text-gray-800">1. Aprovisionar nueva base de datos</p>
                    <p>Ingresa a <em>Mis Instancias</em>, pulsa "+ Crear Instancia", asigna un nombre a tu base de datos y elige la plantilla (ej. Cultivos o Maquinaria).</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    <p className="font-semibold text-gray-800">2. Revelar y copiar credenciales</p>
                    <p>Selecciona tu instancia activa, presiona el botón <em>Credenciales</em> y pulsa sobre el botón de ver credenciales para desencriptar la contraseña de conexión.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    <p className="font-semibold text-gray-800">3. Abrir ticket de soporte técnico</p>
                    <p>En el módulo <em>Soporte</em>, redacta la falla observada. Podrás chatear en tiempo real con los ingenieros de soporte hasta resolver el inconveniente.</p>
                  </div>
                </div>
              )}

              {manualRole === "soporte" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Operaciones para Agentes de Soporte Técnico:</h4>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    <p className="font-semibold text-gray-800">1. Bandeja de incidencias pendientes</p>
                    <p>Filtra tickets en estado <em>Abierta</em>, asígnate el caso y cámbialo a <em>En revisión</em>.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    <p className="font-semibold text-gray-800">2. Diagnóstico guiado y comunicación</p>
                    <p>Publica notas técnicas internas o comentarios orientados al cliente. Notifica cuando la base de datos esté restaurada y marca el ticket como <em>Resuelto</em>.</p>
                  </div>
                </div>
              )}

              {manualRole === "admin" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Operaciones del Administrador Global:</h4>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    <p className="font-semibold text-gray-800">1. Supervisión del clúster</p>
                    <p>Consulta métricas consolidadas de todas las instancias, capacidad libre de disco y estado general de la infraestructura PostgreSQL.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                    <p className="font-semibold text-gray-800">2. Gestión de usuarios y precios</p>
                    <p>Activa o suspende cuentas de clientes por mantenimiento o morosidad, y configura las tarifas de los planes de servicio.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href="/documentation/AgroCloud_Manual_Usuario.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Abrir PDF</span>
                </a>
                <a
                  href="/documentation/AgroCloud_Manual_Usuario.pdf"
                  download="AgroCloud_Manual_Usuario.pdf"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Descargar Manual de Usuario (PDF 4.4 MB)</span>
                </a>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cerrar manual
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "soporte" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mesa de Ayuda y Asistencia</h3>
                <p className="text-xs text-gray-500">Atención técnica especializada para el sector agropecuario</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-gray-600 mb-6">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Tickets dentro de la plataforma:</span>
                <p>Si ya posees una cuenta, inicia sesión y dirígete al módulo de <strong>Soporte</strong> para abrir un ticket directo con nuestros ingenieros.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Correo de Soporte Directo:</span>
                <p className="font-mono text-emerald-700">soporte@agrocloud.local / agrocloud.gt@gmail.com</p>
                <p className="text-[11px] text-gray-400 mt-1">Tiempo estimado de respuesta: menos de 2 horas hábiles.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Horarios de Atención:</span>
                <p>Lunes a Sábado de 07:00 a 18:00 (Hora de Guatemala, CST).</p>
                <p className="text-[11px] text-emerald-700 mt-1">Monitoreo automatizado de servidores activo 24/7/365.</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t pt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => { setActiveModal(null); onLogin(); }}
                className="px-5 py-2 text-xs font-bold bg-[#76d322] hover:bg-[#68bc1d] text-[#082113] rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Ir a mis tickets
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "nosotros" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-3 mb-4">
              <img src="/agrocloud-isotipo-green.svg" alt="AgroCloud" className="w-10 h-10 object-contain" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sobre AgroCloud</h3>
                <p className="text-xs text-gray-500">Ingeniería guatemalteca para el desarrollo del agro</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              <strong>AgroCloud</strong> es una plataforma de Base de Datos como Servicio (DBaaS) diseñada y desarrollada por estudiantes de la carrera de <strong>Ingeniería en Informática y Sistemas</strong> de la <strong>Universidad Rafael Landívar</strong> (Facultad de Ingeniería, Quetzaltenango, Guatemala).
            </p>
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-2 mb-6">
              <p><strong>Nuestra Misión:</strong> Facilitar a los productores agrícolas, haciendas, cooperativas y agroindustrias una infraestructura cloud moderna, segura y accesible, eliminando la barrera del mantenimiento físico de servidores.</p>
              <p><strong>Equipo de Ingeniería:</strong> Proyecto desarrollado para el curso de Ingeniería de Software I bajo metodologías ágiles e integración continua.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "contacto" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Contacto y Asistencia</h3>
            <p className="text-xs text-gray-500 mb-5">Déjanos tus datos y un especialista agrícola se comunicará contigo.</p>

            {contactSent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-emerald-900">¡Mensaje enviado con éxito!</h4>
                <p className="text-xs text-emerald-800">Gracias por comunicarte. Nuestro equipo técnico revisará tu consulta inmediatamente.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.nombre}
                    onChange={e => setContactForm({ ...contactForm, nombre: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Correo electrónico *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="tu@finca.com"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nombre de tu finca o cooperativa</label>
                  <input
                    type="text"
                    value={contactForm.finca}
                    onChange={e => setContactForm({ ...contactForm, finca: e.target.value })}
                    placeholder="Ej. Cooperativa Café de Altura"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">¿Cómo podemos ayudarte? *</label>
                  <textarea
                    rows={3}
                    required
                    value={contactForm.mensaje}
                    onChange={e => setContactForm({ ...contactForm, mensaje: e.target.value })}
                    placeholder="Describe los cultivos que manejas o las dudas sobre el aprovisionamiento de bases de datos..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#76d322] hover:bg-[#68bc1d] text-[#082113] font-bold rounded-lg cursor-pointer shadow-sm"
                  >
                    Enviar consulta
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {activeModal === "privacidad" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-lime-100 text-emerald-900 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Seguridad y Privacidad de Datos</h3>
                <p className="text-xs text-gray-500">Compromiso de confidencialidad para los productores agrícolas</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed mb-6">
              <p><strong>1. Propiedad exclusiva de los datos:</strong> Toda la información cargada sobre cosechas, parcelas, trabajadores, finanzas e inventarios pertenece exclusivamente a tu organización.</p>
              <p><strong>2. Cifrado simétrico AES-256:</strong> Las contraseñas maestras de conexión a tus bases de datos se cifran con clave simétrica AES-256 en el backend y solo pueden ser consultadas por el titular autorizado de la cuenta.</p>
              <p><strong>3. Aislamiento lógico multi-tenant:</strong> Cada cuenta cuenta con esquemas de base de datos rigurosamente aislados bajo PostgreSQL 16. Ningún otro usuario de AgroCloud puede consultar ni modificar tus tablas.</p>
              <p><strong>4. Sin venta de datos a terceros:</strong> AgroCloud no comercializa, transfiere ni comparte datos agronómicos con empresas comerciales o intermediarios.</p>
            </div>
            <div className="flex justify-end border-t pt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { getPlanes } from '../api/planesApi';
import type { Plan } from '../types';
import {
  CheckCircle2,
  Sprout,
  TrendingUp,
  Tractor,
  Users,
  Boxes,
  Truck,
  DollarSign,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onSelectPlan: (plan: Plan) => void;
  onNavigateLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPlan, onNavigateLogin }) => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState<boolean>(true);

  useEffect(() => {
    getPlanes()
      .then((data) => setPlanes(data))
      .catch(() => console.error('Error al cargar planes'))
      .finally(() => setLoadingPlanes(false));
  }, []);

  const modulosAgricolas = [
    { icon: Sprout, title: 'Cultivos y Parcelas', desc: 'Organización geográfica de áreas de siembra, variedades de cultivos y extensión por manzana.' },
    { icon: TrendingUp, title: 'Cosechas y Producción', desc: 'Registro histórico de quintales o toneladas cosechadas, rendimiento por ciclo e historial de producción.' },
    { icon: Boxes, title: 'Control de Inventarios', desc: 'Centralización de fertilizantes, agroquímicos, semillas y herramientas sin pérdidas de stock.' },
    { icon: Users, title: 'Gestión de Trabajadores', desc: 'Almacenamiento de datos del personal de campo, jornadas laborales y asignación de fincas.' },
    { icon: Tractor, title: 'Registro de Maquinaria', desc: 'Historial de tractores, sistemas de riego, mantenimiento preventivo y combustible.' },
    { icon: Truck, title: 'Proveedores', desc: 'Registro de casas comerciales, cotizaciones de insumos y contactos clave del sector.' },
    { icon: DollarSign, title: 'Clientes y Ventas', desc: 'Gestión de compradores locales o exportadores, lotes vendidos e ingresos comerciales.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* ─── Hero Section ────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 px-4 lg:px-8 overflow-hidden">
        {/* Glowing Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma DBaaS para el Sector Agrícola de Guatemala</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Tus bases de datos agrícolas, <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-300 bg-clip-text text-transparent">
              gestionadas en la nube.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            AgroCloud proporciona infraestructura <strong>PostgreSQL</strong> segura, escalable y administrada sin instalar ni mantener servidores. Centraliza parcelas, cosechas, inventarios y finanzas en minutos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                document.getElementById('planes-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-base hover:brightness-110 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Planes de Suscripción</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onNavigateLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-base hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Acceder al Sistema</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">99.9%</div>
              <div className="text-xs text-slate-400 mt-1">Uptime Garantizado</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-lime-400">Desde Q25</div>
              <div className="text-xs text-slate-400 mt-1">Planes Accesibles</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-teal-400">PostgreSQL 16</div>
              <div className="text-xs text-slate-400 mt-1">Motor Relacional ACID</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">JWT + SSL</div>
              <div className="text-xs text-slate-400 mt-1">Seguridad de Grado Cloud</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Catálogo de Planes y Precios ───────────────────────────────────────── */}
      <section id="planes-section" className="py-20 px-4 lg:px-8 bg-slate-900/50 border-y border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3">Precios y Capacidades</h2>
            <p className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Catálogo de Planes de Suscripción
            </p>
            <p className="text-slate-400 text-base">
              Selecciona la capacidad de almacenamiento adecuada para las operaciones de tu finca o empresa agrícola.
            </p>
          </div>

          {loadingPlanes ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {planes.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/15 scale-105'
                      : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-[11px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                      Más Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.nombre}</h3>
                    <p className="text-xs text-slate-400 mb-6 min-h-[36px]">{plan.descripcion}</p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-extrabold text-white">Q{plan.precioMensual.toFixed(2)}</span>
                      <span className="text-slate-400 text-xs font-medium">/ mes</span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800 mb-8 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>{plan.almacenamientoGb} GB</strong> de Almacenamiento DB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>{plan.instanciasPermitidas} Instancia</strong> PostgreSQL 16</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Respaldos Diarios Automáticos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Credenciales Encriptadas SSL</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200'
                    }`}
                  >
                    Contratar {plan.nombre}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Módulos de Información Agrícola ───────────────────────────────────── */}
      <section id="modulos-section" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-3">Infraestructura Versátil</h2>
          <p className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Información que puedes Gestionar
          </p>
          <p className="text-slate-400 text-base">
            AgroCloud estructura tus datos operativos para alimentar tus sistemas administrativos y reportes agrícolas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulosAgricolas.map((m, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 hover:bg-slate-900 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <m.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">AgroCloud DBaaS</span>
            <span>— Universidad Rafael Landívar</span>
          </div>
          <div>Ingeniería de Software I — Entregable 03 (30% Funcional)</div>
          <div>© 2026 AgroCloud Platform. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  );
};

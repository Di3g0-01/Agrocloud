import { useState } from "react";
import type { ClientePage } from "../../types/cliente";
import { LogoIcon } from "../../components/ui";
import { SharedDocumentacion } from "../../components/shared/SharedDocumentacion";
import { NotificationMenu } from "../../components/shared/NotificationMenu";
import { GlobalSearchModal } from "../../components/shared/GlobalSearchModal";
import { ClienteDashboard } from "./ClienteDashboard";
import { ClienteInstancias } from "./ClienteInstancias";
import { ClientePlantillas } from "./ClientePlantillas";
import { ClientePlan } from "./ClientePlan";
import { ClientePagos } from "./ClientePagos";
import { ClienteSoporte } from "./ClienteSoporte";
import { ClienteConfiguracion } from "./ClienteConfiguracion";

export const clienteNav = [
  { page: "dashboard" as ClientePage, label: "Dashboard", section: "RESUMEN", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { page: "instancias" as ClientePage, label: "Instancias", section: "SERVICIOS", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
  { page: "plantillas" as ClientePage, label: "Plantillas DB", section: null, icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { page: "plan" as ClientePage, label: "Plan y suscripción", section: "CUENTA", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { page: "pagos" as ClientePage, label: "Pagos", section: null, icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { page: "soporte" as ClientePage, label: "Soporte", section: null, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { page: "configuracion" as ClientePage, label: "Configuración", section: "SISTEMA", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { page: "documentacion" as ClientePage, label: "Documentación", section: null, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export function ClientePanel({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<ClientePage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pageLabels: Record<ClientePage, string> = { dashboard: "Panel de Control", instancias: "Instancias", plantillas: "Plantillas DB", plan: "Plan y suscripción", pagos: "Pagos", soporte: "Soporte", configuracion: "Configuración", documentacion: "Documentación" };
  const navigate = (p: ClientePage) => { setPage(p); setSidebarOpen(false); };
  return (
    <div className="flex h-full">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-52 h-screen flex flex-col justify-between transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 lg:shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "#0e1a0c" }}>
        <div className="p-3 flex items-center gap-2 border-b border-white/5 shrink-0">
          <LogoIcon />
          <span className="text-white font-semibold text-xs flex-1 truncate">AgroCloud</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white/80 text-lg leading-none">×</button>
        </div>
        <nav className="flex-1 px-2 py-1.5 space-y-0.5 overflow-y-auto min-h-0">
          {clienteNav.map(item => (
            <div key={item.page}>
              {item.section && <p className="text-[8px] font-semibold uppercase tracking-widest text-white/30 px-2 pt-2 pb-0.5">{item.section}</p>}
              <button onClick={() => navigate(item.page)} className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${page === item.page ? "bg-lime-400 text-gray-900 font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
                <span className="truncate">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5 space-y-1.5 shrink-0">
          <div className="flex items-center gap-2 px-1">
            <div className="w-6 h-6 rounded-full bg-lime-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">FL</div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate leading-none">Finca Los Pinos</p>
              <p className="text-[9px] text-white/40 truncate mt-0.5">Plan Productor</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md text-xs transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-8 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-sm text-gray-500 flex-1 truncate">{pageLabels[page]}</span>
          <div className="hidden md:block flex-1 max-w-xs">
            <GlobalSearchModal
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onNavigate={(targetPage) => setPage(targetPage as ClientePage)}
              placeholder="Buscar en todo el sistema..."
              role="cliente"
            />
          </div>
          <NotificationMenu role="cliente" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-lime-600 flex items-center justify-center text-white text-xs font-semibold">FL</div>
            <div><p className="text-xs font-medium text-gray-800 leading-none">Finca Los Pinos</p><p className="text-[10px] text-gray-400">Cliente</p></div>
          </div>
        </header>
        {page === "dashboard" && <ClienteDashboard onNavigate={navigate} />}
        {page === "instancias" && <ClienteInstancias onNavigate={navigate} />}
        {page === "plantillas" && <ClientePlantillas onNavigate={navigate} />}
        {page === "plan" && <ClientePlan />}
        {page === "pagos" && <ClientePagos />}
        {page === "soporte" && <ClienteSoporte />}
        {page === "configuracion" && <ClienteConfiguracion />}
        {page === "documentacion" && <SharedDocumentacion userRole="cliente" />}
      </div>
    </div>
  );
}

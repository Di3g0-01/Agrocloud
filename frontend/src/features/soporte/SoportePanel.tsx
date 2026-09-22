import { useState } from "react";
import type { SoportePage } from "../../types/soporte";
import { LogoIcon } from "../../components/ui";
import { SharedDocumentacion } from "../../components/shared/SharedDocumentacion";
import { NotificationMenu } from "../../components/shared/NotificationMenu";
import { GlobalSearchModal } from "../../components/shared/GlobalSearchModal";
import { SoporteDashboard } from "./SoporteDashboard";
import { SoporteIncidencias } from "./SoporteIncidencias";
import { SoporteInstancias } from "./SoporteInstancias";
import { SoporteActividad } from "./SoporteActividad";
import { SoporteConfiguracion } from "./SoporteConfiguracion";

export const soporteNav = [
  { page: "dashboard" as SoportePage, label: "Dashboard", section: "PRINCIPAL", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { page: "incidencias" as SoportePage, label: "Incidencias", section: "SOPORTE", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { page: "instancias" as SoportePage, label: "Instancias", section: null, icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
  { page: "actividad" as SoportePage, label: "Actividad", section: null, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { page: "documentacion" as SoportePage, label: "Documentación", section: "RECURSOS", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { page: "configuracion" as SoportePage, label: "Configuración", section: "SISTEMA", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export function SoportePanel({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<SoportePage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const pageLabels: Record<SoportePage, string> = { dashboard: "Panel de Soporte", incidencias: "Incidencias", instancias: "Instancias", actividad: "Actividad", documentacion: "Documentación", configuracion: "Configuración" };
  const navigate = (p: SoportePage) => { setPage(p); setSidebarOpen(false); };
  const isDark = theme === "dark";

  return (
    <div className={`flex h-full transition-colors duration-300 ${isDark ? "dark bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-52 h-screen flex flex-col justify-between transition-all duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background: isDark ? "#090d16" : "#0e1a0c" }}>
        <div className="p-3 flex items-center gap-2 border-b border-white/5 shrink-0">
          <LogoIcon />
          <span className="text-white font-semibold text-xs flex-1 truncate">AgroCloud</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white/80 text-lg leading-none">×</button>
        </div>
        <nav className="flex-1 px-2 py-1.5 space-y-0.5 overflow-y-auto min-h-0">
          {soporteNav.map(item => (
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
            <div className="w-6 h-6 rounded-full bg-lime-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">LM</div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate leading-none">Lucía Méndez</p>
              <p className="text-[9px] text-white/40 truncate mt-0.5">Disponible</p>
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
        <header className={`h-14 border-b flex items-center px-4 lg:px-8 gap-3 shrink-0 transition-colors duration-300 ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-100 text-gray-900"}`}>
          <button onClick={() => setSidebarOpen(true)} className={`lg:hidden w-8 h-8 flex items-center justify-center rounded-lg shrink-0 ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className={`text-sm flex-1 truncate ${isDark ? "text-slate-300" : "text-gray-500"}`}>{pageLabels[page]}</span>
          <div className="hidden md:block flex-1 max-w-xs">
            <GlobalSearchModal
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onNavigate={(targetPage) => setPage(targetPage as SoportePage)}
              placeholder="Buscar en todo el sistema..."
            />
          </div>
          <NotificationMenu role="soporte" />
          <div className="hidden sm:flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-lime-600 flex items-center justify-center text-white text-xs font-semibold">LM</div><div><p className={`text-xs font-medium leading-none ${isDark ? "text-slate-200" : "text-gray-800"}`}>Lucía Méndez</p><p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>Soporte</p></div></div>
        </header>
        <main className={`flex-1 overflow-auto ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
          {page === "dashboard" && <SoporteDashboard setPage={setPage} isDark={isDark} />}
          {page === "incidencias" && <SoporteIncidencias isDark={isDark} />}
          {page === "instancias" && <SoporteInstancias isDark={isDark} />}
          {page === "actividad" && <SoporteActividad isDark={isDark} />}
          {page === "documentacion" && <SharedDocumentacion userRole="soporte" isDark={isDark} />}
          {page === "configuracion" && <SoporteConfiguracion theme={theme} setTheme={setTheme} />}
        </main>
      </div>
    </div>
  );
}


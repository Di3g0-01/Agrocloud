import { useState } from "react";
import { SharedDocumentacion } from "../../components/shared/SharedDocumentacion";
import { NotificationMenu } from "../../components/shared/NotificationMenu";
import { GlobalSearchModal } from "../../components/shared/GlobalSearchModal";
import type { AdminPage } from "../../types/admin";
import { AdminClientes } from "./AdminClientes";
import { AdminDashboard } from "./AdminDashboard";
import { AdminIncidencias } from "./AdminIncidencias";
import { AdminInstancias } from "./AdminInstancias";
import { AdminMonitoreo } from "./AdminMonitoreo";
import { AdminPagos } from "./AdminPagos";
import { AdminPlantillas } from "./AdminPlantillas";
import { AdminSidebar } from "./AdminSidebar";
import { AdminSuscripciones } from "./AdminSuscripciones";
import { AdminConfiguracion } from "./AdminConfiguracion";

export function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const pageLabels: Record<AdminPage, string> = { dashboard: "Panel Administrativo", clientes: "Clientes", instancias: "Instancias", suscripciones: "Suscripciones", pagos: "Pagos", plantillas: "Plantillas DB", monitoreo: "Monitoreo", incidencias: "Incidencias", configuracion: "Configuración", documentacion: "Documentación" };

  const isDark = theme === "dark";

  return (
    <div className={`flex h-full transition-colors duration-300 ${isDark ? "dark bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <AdminSidebar page={page} setPage={setPage} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} isDark={isDark} />
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
              onNavigate={(targetPage) => setPage(targetPage as AdminPage)}
              placeholder="Buscar en todo el sistema..."
            />
          </div>
          <NotificationMenu role="admin" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-semibold">DA</div>
            <div><p className={`text-xs font-medium leading-none ${isDark ? "text-slate-200" : "text-gray-800"}`}>David Admin</p><p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>Administrador</p></div>
          </div>
        </header>
        <main className={`flex-1 overflow-auto ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
          {page === "dashboard" && <AdminDashboard onNavigate={setPage} isDark={isDark} />}
          {page === "clientes" && <AdminClientes isDark={isDark} />}
          {page === "instancias" && <AdminInstancias isDark={isDark} />}
          {page === "suscripciones" && <AdminSuscripciones isDark={isDark} />}
          {page === "pagos" && <AdminPagos isDark={isDark} />}
          {page === "plantillas" && <AdminPlantillas isDark={isDark} />}
          {page === "monitoreo" && <AdminMonitoreo isDark={isDark} />}
          {page === "incidencias" && <AdminIncidencias isDark={isDark} />}
          {page === "configuracion" && <AdminConfiguracion theme={theme} setTheme={setTheme} />}
          {page === "documentacion" && <SharedDocumentacion userRole="admin" isDark={isDark} />}
        </main>
      </div>
    </div>
  );
}


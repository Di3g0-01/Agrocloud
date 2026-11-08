import { useState, useEffect, useRef } from "react";
import { useNotifications } from "./useNotifications";
import type { NotificationItem, RoleType } from "./useNotifications";

export function NotificationMenu({ 
  role, 
  onNavigate,
  activePage,
  isDark,
}: { 
  role: RoleType; 
  onNavigate?: (page: string) => void;
  activePage?: string;
  isDark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { items, error, markAllRead, markSingleRead } = useNotifications(role);

  // Si no se provee isDark, inferir explícitamente según el almacenamiento de tema de AgroCloud
  const isDarkTheme = isDark !== undefined
    ? isDark
    : (typeof window !== "undefined" && (localStorage.getItem("agrocloud_theme_admin") === "dark" || localStorage.getItem("agrocloud_theme_support") === "dark" || localStorage.getItem("agrocloud_theme") === "dark"));

  const unreadCount = items.filter((i) => !i.leida).length;

  // Si el usuario cambia de página/sección en el sistema, cerramos automáticamente el menú
  useEffect(() => {
    setOpen(false);
  }, [activePage]);

  // Cerrar al hacer clic afuera del contenedor o presionar Escape
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const getBadgeColor = (cat: NotificationItem["categoria"]) => {
    switch (cat) {
      case "critico":
      case "cancelacion":
      case "fallo":
        return isDarkTheme
          ? "bg-red-950/50 text-red-400 border-red-800/60"
          : "bg-red-50 text-red-600 border-red-200";
      case "pago":
      case "morosidad":
        return isDarkTheme
          ? "bg-amber-950/50 text-amber-300 border-amber-800/60"
          : "bg-amber-50 text-amber-700 border-amber-200";
      case "activacion":
      case "resolucion":
      case "cliente":
        return isDarkTheme
          ? "bg-lime-950/50 text-lime-400 border-lime-800/60"
          : "bg-lime-50 text-lime-700 border-lime-200";
      default:
        return isDarkTheme
          ? "bg-blue-950/50 text-blue-300 border-blue-800/60"
          : "bg-blue-50 text-blue-600 border-blue-200";
    }
  };

  /**
   * Resuelve a qué vista navegar según el tipo o categoría de la notificación y el rol del usuario
   */
  const resolveTargetPage = (item: NotificationItem): string => {
    const t = (item.tipo || "").toUpperCase();
    const c = (item.categoria || "").toLowerCase();

    // Incidencias / Soporte / Tickets
    if (t.startsWith("TICKET_") || c === "soporte" || c === "ticket" || c === "resolucion") {
      return role === "cliente" ? "soporte" : "incidencias";
    }

    // Instancias
    if (t.startsWith("INSTANCIA_") || c === "fallo") {
      return "instancias";
    }

    // Suscripciones y Planes
    if (t.startsWith("SUSCRIPCION_") || c === "cancelacion" || c === "activacion") {
      return role === "cliente" ? "plan" : "suscripciones";
    }

    // Pagos
    if (t.startsWith("PAGO_") || c === "pago" || c === "morosidad") {
      return "pagos";
    }

    // Clientes
    if (c === "cliente") {
      return role === "admin" ? "clientes" : "dashboard";
    }

    return "dashboard";
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    // 1. Marcar como leída
    if (!item.leida) {
      void markSingleRead(item.id);
    }

    // 2. Cerrar el menú de notificaciones
    setOpen(false);

    // 3. Redirigir a la vista de donde proviene la notificación
    if (onNavigate) {
      const targetPage = resolveTargetPage(item);
      onNavigate(targetPage);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative ${
          isDarkTheme
            ? "text-slate-400 hover:text-white hover:bg-slate-800"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        }`}
        aria-label="Abrir notificaciones"
        title="Notificaciones"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl z-40 overflow-hidden border ${
              isDarkTheme
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-gray-100 text-gray-900"
            }`}
          >
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDarkTheme ? "bg-slate-800/80 border-slate-800" : "bg-gray-50/80 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-sm ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-400 text-gray-900">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllRead()}
                  className={`text-[11px] font-medium transition-colors ${
                    isDarkTheme ? "text-lime-400 hover:text-lime-300" : "text-lime-700 hover:text-lime-800"
                  }`}
                >
                  Marcar leídas
                </button>
              )}
            </div>

            <div
              className={`max-h-80 overflow-y-auto divide-y ${
                isDarkTheme ? "divide-slate-800 text-slate-100" : "divide-gray-50 text-gray-900"
              }`}
            >
              {error && <p role="alert" className="p-3 text-xs text-red-600">{error}</p>}
              {items.length === 0 ? (
                <p className={`text-xs p-6 text-center ${isDarkTheme ? "text-slate-400" : "text-gray-400"}`}>
                  No tienes notificaciones por el momento.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => void handleNotificationClick(item)}
                    className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start group ${
                      isDarkTheme
                        ? item.leida ? "hover:bg-slate-800/60" : "bg-lime-950/20 hover:bg-lime-950/40"
                        : item.leida ? "hover:bg-gray-50" : "bg-lime-50/40 hover:bg-lime-50/70"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 transition-transform group-hover:scale-125 ${
                        !item.leida
                          ? "bg-lime-500"
                          : isDarkTheme ? "bg-slate-700" : "bg-gray-300"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <p
                          className={`text-xs font-semibold truncate transition-colors ${
                            isDarkTheme
                              ? "text-slate-100 group-hover:text-lime-400"
                              : "text-gray-900 group-hover:text-lime-700"
                          }`}
                        >
                          {item.titulo}
                        </p>
                        <span className={`text-[10px] whitespace-nowrap ${isDarkTheme ? "text-slate-400" : "text-gray-400"}`}>
                          {item.tiempo}
                        </span>
                      </div>
                      <p className={`text-xs leading-snug ${isDarkTheme ? "text-slate-300" : "text-gray-600"}`}>
                        {item.descripcion}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-medium border ${getBadgeColor(item.categoria)}`}>
                          {item.categoria.toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${
                            isDarkTheme ? "text-lime-400" : "text-lime-700"
                          }`}
                        >
                          Ver detalles →
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

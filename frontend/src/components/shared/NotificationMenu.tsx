import { useState } from "react";
import { useNotifications } from "./useNotifications";
import type { NotificationItem, RoleType } from "./useNotifications";

export function NotificationMenu({ role }: { role: RoleType }) {
  const [open, setOpen] = useState(false);
  const { items, error, markAllRead, markSingleRead } = useNotifications(role);

  const unreadCount = items.filter((i) => !i.leida).length;

  const getBadgeColor = (cat: NotificationItem["categoria"]) => {
    switch (cat) {
      case "critico":
      case "cancelacion":
      case "fallo":
        return "bg-red-50 text-red-600 border-red-200";
      case "pago":
      case "morosidad":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "activacion":
      case "resolucion":
      case "cliente":
        return "bg-lime-50 text-lime-700 border-lime-200";
      default:
        return "bg-blue-50 text-blue-600 border-blue-200";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative"
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
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-40 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-400 text-gray-900">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllRead()}
                  className="text-[11px] font-medium text-lime-700 hover:text-lime-800 transition-colors"
                >
                  Marcar leídas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {error && <p role="alert" className="p-3 text-xs text-red-600">{error}</p>}
              {items.length === 0 ? (
                <p className="text-xs text-gray-400 p-6 text-center">No tienes notificaciones por el momento.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => void markSingleRead(item.id)}
                    className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start ${
                      !item.leida ? "bg-lime-50/30" : ""
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        !item.leida ? "bg-lime-500" : "bg-gray-300"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <p className="text-xs font-semibold text-gray-900 truncate">{item.titulo}</p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.tiempo}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-snug">{item.descripcion}</p>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-medium border ${getBadgeColor(item.categoria)}`}>
                          {item.categoria.toUpperCase()}
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

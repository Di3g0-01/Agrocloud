import { useState } from "react";

export type RoleType = "admin" | "soporte" | "cliente";

export interface NotificationItem {
  id: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
  categoria: "pago" | "activacion" | "soporte" | "fallo" | "sistema" | "cliente" | "morosidad" | "cancelacion" | "ticket" | "critico" | "admin" | "resolucion";
}

const INITIAL_NOTIFICATIONS: Record<RoleType, NotificationItem[]> = {
  cliente: [
    { id: "n1", titulo: "Aviso de pago", descripcion: "Próximo vencimiento de cuota mensual de tu Plan Productor el 25 de Septiembre.", tiempo: "Hace 15 min", leida: false, categoria: "pago" },
    { id: "n2", titulo: "Activación de instancia", descripcion: "La instancia 'agro-produccion-db' se ha activado y está lista para recibir conexiones.", tiempo: "Hace 1 hora", leida: false, categoria: "activacion" },
    { id: "n3", titulo: "Respuesta a ticket de soporte", descripcion: "Lucía Méndez respondió a tu incidencia INC-024 sobre el problema de conexión.", tiempo: "Hace 2 horas", leida: false, categoria: "soporte" },
    { id: "n4", titulo: "Fallo o alerta de rendimiento", descripcion: "La instancia 'agro-inventario-db' superó el 75% de almacenamiento utilizado.", tiempo: "Hace 4 horas", leida: true, categoria: "fallo" },
    { id: "n5", titulo: "Mantenimiento general", descripcion: "Mantenimiento programado de motor PostgreSQL para el domingo a las 02:00 UTC.", tiempo: "Hace 1 día", leida: true, categoria: "sistema" },
  ],
  admin: [
    { id: "na1", titulo: "Nuevo cliente registrado", descripcion: "La organización 'Finca El Roble' completó su registro autónomo en la plataforma.", tiempo: "Hace 10 min", leida: false, categoria: "cliente" },
    { id: "na2", titulo: "Pago recibido", descripcion: "Se recibió la transferencia de Q120.00 por suscripción de 'Finca Los Pinos'.", tiempo: "Hace 35 min", leida: false, categoria: "pago" },
    { id: "na3", titulo: "Factura pendiente de pago", descripcion: "'Cooperativa Occidente' tiene 1 pago pendiente de regularizar.", tiempo: "Hace 2 horas", leida: false, categoria: "morosidad" },
    { id: "na4", titulo: "Instancia cancelada / suspendida", descripcion: "La instancia 'cafe-export-db' fue suspendida automáticamente.", tiempo: "Hace 5 horas", leida: true, categoria: "cancelacion" },
    { id: "na5", titulo: "Reporte de soporte técnico", descripcion: "El equipo de soporte ha resuelto 4 incidencias críticas esta semana.", tiempo: "Hace 8 horas", leida: true, categoria: "soporte" },
  ],
  soporte: [
    { id: "ns1", titulo: "Nueva solicitud de soporte", descripcion: "Se asignó la incidencia INC-024 (Problema de conexión) a tu bandeja.", tiempo: "Hace 5 min", leida: false, categoria: "ticket" },
    { id: "ns2", titulo: "Estado crítico de recurso", descripcion: "La instancia 'agro-produccion-db' sobrepasó el 78% de uso de CPU.", tiempo: "Hace 20 min", leida: false, categoria: "critico" },
    { id: "ns3", titulo: "Mensaje del administrador", descripcion: "David Admin autorizó la actualización del esquema para plantillas de cosechas.", tiempo: "Hace 2 horas", leida: true, categoria: "admin" },
    { id: "ns4", titulo: "Instancia restablecida", descripcion: "La instancia 'agricola-norte-db' recuperó métricas normales de uptime (99.8%).", tiempo: "Hace 6 horas", leida: true, categoria: "resolucion" },
  ],
};

export function NotificationMenu({ role }: { role: RoleType }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS[role] || []);

  const unreadCount = items.filter((i) => !i.leida).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, leida: true })));
  };

  const markSingleRead = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, leida: true } : i)));
  };

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
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-lime-700 hover:text-lime-800 transition-colors"
                >
                  Marcar leídas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {items.length === 0 ? (
                <p className="text-xs text-gray-400 p-6 text-center">No tienes notificaciones por el momento.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markSingleRead(item.id)}
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

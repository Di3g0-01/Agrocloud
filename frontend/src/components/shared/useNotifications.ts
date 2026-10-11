import { useEffect, useState } from "react";
import { API_BASE_URL, axiosClient } from "../../api/axiosClient";

export type RoleType = "admin" | "soporte" | "cliente";

export interface NotificationItem {
  id: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
  categoria: "pago" | "activacion" | "soporte" | "fallo" | "sistema" | "cliente" | "morosidad" | "cancelacion" | "ticket" | "critico" | "admin" | "resolucion";
}

interface ApiNotification {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

const toItem = (notification: ApiNotification): NotificationItem => ({
  id: notification.id,
  titulo: notification.titulo,
  descripcion: notification.mensaje,
  tiempo: new Date(notification.fecha).toLocaleString("es-GT"),
  leida: notification.leida,
  categoria: notification.tipo === "TICKET_RESUELTO" ? "resolucion"
    : notification.tipo === "INSTANCIA_CREADA" || notification.tipo === "INSTANCIA_REINICIADA" ? "activacion"
    : notification.tipo === "INSTANCIA_ESTADO" || notification.tipo === "INSTANCIA_ELIMINADA" ? "sistema"
    : "ticket",
});

function notifyChangedResources(notifications: ApiNotification[]) {
  if (notifications.some(item => item.tipo.startsWith("TICKET_")))
    window.dispatchEvent(new Event("agrocloud:incidents-updated"));
  if (notifications.some(item => item.tipo.startsWith("INSTANCIA_")))
    window.dispatchEvent(new Event("agrocloud:instances-updated"));
}

export function useNotifications(role: RoleType) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let initialized = false;
    let knownIds = new Set<string>();
    const controller = new AbortController();

    const refresh = async () => {
      try {
        const response = await axiosClient.get<ApiNotification[]>("/notificaciones");
        if (!active) return;
        const incoming = initialized ? response.data.filter(item => !knownIds.has(item.id)) : [];
        if (incoming.length) notifyChangedResources(incoming);
        knownIds = new Set(response.data.map(item => item.id));
        initialized = true;
        setItems(response.data.map(toItem));
        setError("");
      } catch { if (active) setError("No se pudieron actualizar las notificaciones."); }
    };

    void refresh();
    const fallback = window.setInterval(() => void refresh(), 10000);
    const token = localStorage.getItem("agrocloud_token");
    const listen = async () => {
      if (!token) return;
      while (active) {
        try {
          const response = await fetch(`${API_BASE_URL}/notificaciones/stream`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          if (!response.ok || !response.body) throw new Error("Stream no disponible");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (active) {
            const chunk = await reader.read();
            if (chunk.done) break;
            buffer += decoder.decode(chunk.value, { stream: true });
            let boundary = buffer.search(/\r?\n\r?\n/);
            while (boundary !== -1) {
              const frame = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, "");
              if (/^event:\s*notification\s*$/m.test(frame)) void refresh();
              boundary = buffer.search(/\r?\n\r?\n/);
            }
            if (buffer.length > 65536) buffer = "";
          }
        } catch { if (!active) break; }
        if (active) await new Promise(resolve => window.setTimeout(resolve, 3000));
      }
    };
    void listen();
    return () => { active = false; controller.abort(); window.clearInterval(fallback); };
  }, [role]);

  const markAllRead = async () => {
    try {
      const unread = items.filter(item => !item.leida);
      await Promise.all(unread.map(item => axiosClient.patch(`/notificaciones/${item.id}/leida`)));
      setItems(prev => prev.map(item => ({ ...item, leida: true })));
      setError("");
    } catch { setError("No se pudieron marcar como leídas."); }
  };

  const markSingleRead = async (id: string) => {
    try {
      await axiosClient.patch(`/notificaciones/${id}/leida`);
      setItems(prev => prev.map(item => item.id === id ? { ...item, leida: true } : item));
      setError("");
    } catch { setError("No se pudo marcar como leída."); }
  };

  return { items, error, markAllRead, markSingleRead };
}

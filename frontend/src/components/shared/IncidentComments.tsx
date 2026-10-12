import { useEffect, useState } from "react";
import { crearComentario, editarComentario, eliminarComentario, getComentarios } from "../../api/incidenciasApi";
import type { IncidentComment } from "../../api/incidenciasApi";
import { useAuth } from "../../context/AuthContext";
import { Edit2, Trash2, Lock, MessageSquare, Check, X, Users, Shield, Headphones } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";

import type { User } from "../../types";

export function IncidentComments({
  incidentId,
  closed,
  isDark = false,
  currentUser,
  clientName,
  assignedAgentName,
  defaultTargetRole,
}: {
  incidentId: string;
  closed: boolean;
  isDark?: boolean;
  currentUser?: User;
  clientName?: string;
  assignedAgentName?: string;
  defaultTargetRole?: "CLIENTE" | "SOPORTE" | "ADMIN";
}) {
  const { user: authUser } = useAuth();
  const [localUser, setLocalUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("agrocloud_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        const raw = localStorage.getItem("agrocloud_user");
        setLocalUser(raw ? JSON.parse(raw) : null);
      } catch {
        setLocalUser(null);
      }
    };
    window.addEventListener("storage", syncUser);
    window.addEventListener("agrocloud:auth-change", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("agrocloud:auth-change", syncUser);
    };
  }, []);

  const user = currentUser || authUser || localUser;
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [draft, setDraft] = useState("");
  const [targetRole, setTargetRole] = useState<"CLIENTE" | "SOPORTE" | "ADMIN">(
    defaultTargetRole || "CLIENTE"
  );

  useEffect(() => {
    if (defaultTargetRole) {
      setTargetRole(defaultTargetRole);
    }
  }, [defaultTargetRole]);

  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setComments([]);
    setDraft("");
    setEditingId(null);
    const refresh = () => {
      getComentarios(incidentId).then(rows => {
        if (active) { setComments(rows); setError(""); }
      }).catch(() => { if (active) setError("No se pudieron cargar los comentarios."); });
    };
    refresh();
    window.addEventListener("agrocloud:incidents-updated", refresh);
    return () => { active = false; window.removeEventListener("agrocloud:incidents-updated", refresh); };
  }, [incidentId]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || closed) return;
    setSending(true);
    try {
      const created = await crearComentario(incidentId, text, targetRole);
      setComments(current => [...current, created]);
      setDraft("");
      setError("");
    } catch { setError("No se pudo enviar el comentario."); }
    finally { setSending(false); }
  };

  const handleStartEdit = (comment: IncidentComment) => {
    setEditingId(comment.id);
    setEditText(comment.texto);
  };

  const handleSaveEdit = async (id: string) => {
    const text = editText.trim();
    if (!text || savingEdit) return;
    setSavingEdit(true);
    try {
      const updated = await editarComentario(id, text);
      setComments(current => current.map(c => c.id === id ? updated : c));
      setEditingId(null);
      setEditText("");
      setError("");
    } catch {
      setError("No se pudo editar el comentario.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este comentario?")) return;
    setDeletingId(id);
    try {
      await eliminarComentario(id);
      setComments(current => current.filter(c => c.id !== id));
      setError("");
    } catch {
      setError("No se pudo eliminar el comentario.");
    } finally {
      setDeletingId(null);
    }
  };

  const isStaff = user?.rol === "SOPORTE" || user?.rol === "ADMIN";

  return (
    <section className="space-y-3" aria-label="Comentarios de la incidencia">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          Conversación y Comentarios
        </h3>
        <span className="text-[11px] text-gray-400">
          {comments.length} {comments.length === 1 ? "mensaje" : "mensajes"}
        </span>
      </div>

      {error && <p role="alert" className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">{error}</p>}

      {comments.length === 0 ? (
        <p className="text-xs text-gray-500 py-3 text-center border border-dashed rounded-lg">Aún no hay comentarios en esta incidencia.</p>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-auto pr-1">
          {comments.map(comment => {
            const isAuthor = user?.id === comment.autorId;
            const canManage = isAuthor || user?.rol === "ADMIN";
            const isEditing = editingId === comment.id;
            const isTargetSupport = comment.destinatario === "SOPORTE";
            const isTargetAdmin = comment.destinatario === "ADMIN";

            return (
              <div
                key={comment.id}
                className={`rounded-xl border p-3.5 transition-all ${
                  isDark ? "bg-slate-800/90 border-slate-700 text-slate-100" : "bg-gray-50/90 border-gray-200 text-gray-900"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] mb-1.5 pb-1.5 border-b border-gray-200/50">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 dark:text-white">{comment.autor}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-200/60 dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-medium">
                      {comment.rolAutor === "ADMINISTRADOR" ? "Admin" : comment.rolAutor === "SOPORTE" ? "Soporte" : "Cliente"}
                    </span>
                    {/* Destinatario Pill */}
                    {isTargetSupport && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                        <Lock className="w-2.5 h-2.5" /> Interno Soporte
                      </span>
                    )}
                    {isTargetAdmin && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                        <Lock className="w-2.5 h-2.5" /> Interno Admin
                      </span>
                    )}
                    {(!comment.destinatario || comment.destinatario === "CLIENTE") && isStaff && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-medium border border-blue-200">
                        <MessageSquare className="w-2.5 h-2.5" /> Para Cliente
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <time className="text-gray-400 text-[10px]">
                      {new Date(comment.fecha).toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" })}
                    </time>
                    {canManage && !closed && !isEditing && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleStartEdit(comment)}
                          title="Editar comentario"
                          className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 hover:text-gray-800 dark:hover:text-white"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          title="Eliminar comentario"
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-950 rounded text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={2}
                      maxLength={2000}
                      className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-lime-400 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={savingEdit || !editText.trim()}
                        className="px-3 py-1 text-xs font-semibold bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" /> {savingEdit ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap break-words">{comment.texto}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {closed ? (
        <p className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-800 p-2.5 rounded-lg text-center font-medium">
          Este ticket está cerrado y ya no admite nuevos comentarios.
        </p>
      ) : (
        <div className="space-y-2 pt-1">
          {/* Target Role Selector for Support / Admin */}
          {isStaff && (
            <div className="space-y-1.5 w-full min-w-0">
              <label htmlFor={`target-${incidentId}`} className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                ¿A quién va dirigido el mensaje?
              </label>
              <div className="w-full min-w-0">
                <CustomSelect
                  id={`target-${incidentId}`}
                  value={targetRole}
                  onChange={(val) => setTargetRole(val as "CLIENTE" | "SOPORTE" | "ADMIN")}
                  options={[
                    {
                      value: "CLIENTE",
                      label: clientName ? `Cliente (${clientName})` : "Cliente (Público)",
                      icon: <Users className="w-3.5 h-3.5 text-blue-500" />,
                      description: "Visible para el cliente y el equipo de soporte",
                    },
                    {
                      value: "SOPORTE",
                      label: assignedAgentName ? `Soporte (${assignedAgentName})` : "Equipo de Soporte (Privado)",
                      icon: <Headphones className="w-3.5 h-3.5 text-amber-500" />,
                      description: "Nota interna privada solo para soporte y administración",
                    },
                    {
                      value: "ADMIN",
                      label: "Solo Administradores (Privado)",
                      icon: <Shield className="w-3.5 h-3.5 text-purple-500" />,
                      description: "Nota confidencial visible únicamente para administradores",
                    },
                  ]}
                  isDark={isDark}
                  size="sm"
                  className="w-full"
                  align="left"
                  dropdownClassName="w-full min-w-[240px]"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              id={`comment-${incidentId}`}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder={
                isStaff
                  ? targetRole === "CLIENTE"
                    ? `Escribe una respuesta para ${clientName || "el cliente"}...`
                    : targetRole === "SOPORTE"
                    ? `Escribe instrucciones o nota para ${assignedAgentName || "el agente de soporte"}...`
                    : "Escribe una nota confidencial para administradores..."
                  : "Escribe un comentario o aclaración sobre tu incidencia..."
              }
              className={`w-full rounded-xl border p-3 text-xs transition-colors ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-lime-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-lime-500"
              }`}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-400 flex items-center gap-1 min-w-0">
              {targetRole === "SOPORTE" && isStaff ? (
                <>
                  <Lock className="w-3 h-3 text-amber-500 shrink-0 inline" />
                  <span className="truncate">Visible solo para soporte y administración.</span>
                </>
              ) : targetRole === "ADMIN" && isStaff ? (
                <>
                  <Lock className="w-3 h-3 text-purple-500 shrink-0 inline" />
                  <span className="truncate">Nota confidencial solo para administradores.</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3 h-3 text-lime-600 shrink-0 inline" />
                  <span className="truncate">El cliente podrá ver este mensaje en su panel.</span>
                </>
              )}
            </span>
            <button
              type="button"
              onClick={() => void send()}
              disabled={!draft.trim() || sending}
              className="rounded-xl bg-lime-400 hover:bg-lime-300 px-4 py-2 text-xs font-bold text-gray-900 transition-all disabled:opacity-50 shadow-sm cursor-pointer shrink-0"
            >
              {sending ? "Enviando..." : "Enviar mensaje"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}


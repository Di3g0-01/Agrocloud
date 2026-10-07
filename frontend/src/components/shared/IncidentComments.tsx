import { useEffect, useState } from "react";
import { crearComentario, getComentarios } from "../../api/incidenciasApi";
import type { IncidentComment } from "../../api/incidenciasApi";

export function IncidentComments({ incidentId, closed, isDark = false }: {
  incidentId: string;
  closed: boolean;
  isDark?: boolean;
}) {
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    setComments([]);
    setDraft("");
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
      const created = await crearComentario(incidentId, text);
      setComments(current => [...current, created]);
      setDraft("");
      setError("");
    } catch { setError("No se pudo enviar el comentario."); }
    finally { setSending(false); }
  };

  return (
    <section className="space-y-3" aria-label="Comentarios de la incidencia">
      <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Comentarios</h3>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      {comments.length === 0 ? <p className="text-xs text-gray-500">Aún no hay comentarios.</p> :
        <div className="space-y-2 max-h-56 overflow-auto">
          {comments.map(comment => <div key={comment.id} className={`rounded-lg border p-3 ${isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"}`}>
            <div className="flex flex-wrap justify-between gap-1 text-[11px]">
              <span className="font-semibold">{comment.autor} · {comment.rolAutor === "ADMINISTRADOR" ? "Administrador" : comment.rolAutor === "SOPORTE" ? "Soporte" : "Cliente"}</span>
              <time className="text-gray-500">{new Date(comment.fecha).toLocaleString("es-GT")}</time>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap break-words">{comment.texto}</p>
          </div>)}
        </div>}
      {closed ? <p className="text-xs text-gray-500">Este ticket está cerrado y ya no admite comentarios.</p> :
        <div className="space-y-2">
          <label className="sr-only" htmlFor={`comment-${incidentId}`}>Nuevo comentario</label>
          <textarea id={`comment-${incidentId}`} value={draft} onChange={event => setDraft(event.target.value)}
            maxLength={2000} rows={3} placeholder="Escribe un comentario..."
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900" />
          <button type="button" onClick={() => void send()} disabled={!draft.trim() || sending}
            className="rounded-lg bg-lime-400 px-3 py-2 text-xs font-semibold text-gray-900 disabled:opacity-50">
            {sending ? "Enviando..." : "Enviar comentario"}
          </button>
        </div>}
    </section>
  );
}

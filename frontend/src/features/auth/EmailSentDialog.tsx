import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MailCheck, X } from "lucide-react";
import { forgotPasswordApi, resendVerificationApi } from "../../api/authApi";

export interface EmailNotice {
  email: string;
  purpose: "verification" | "recovery";
  accountCreated?: boolean;
}

interface EmailSentDialogProps extends EmailNotice {
  onClose: () => void;
}

export function EmailSentDialog({ email, purpose, accountCreated, onClose }: EmailSentDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [availableAt, setAvailableAt] = useState(() => Date.now() + 60_000);
  const [now, setNow] = useState(Date.now);
  const verification = purpose === "verification";
  const remaining = Math.max(0, Math.ceil((availableAt - now) / 1000));

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
    heading.current?.focus();
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const resend = async () => {
    if (sending || remaining > 0) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const result = verification ? await resendVerificationApi(email) : await forgotPasswordApi(email);
      setNotice(result.message);
      setAvailableAt(Date.now() + 60_000);
      setNow(Date.now());
    } catch (caught) {
      setError(axios.isAxiosError<{ message?: string }>(caught)
        ? caught.response?.data?.message || "No se pudo reenviar el enlace. Inténtalo de nuevo."
        : "No se pudo reenviar el enlace. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <dialog ref={dialog} aria-labelledby="email-notice-title" aria-describedby="email-notice-description"
      onCancel={event => { event.preventDefault(); if (!sending) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-md max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 text-gray-900 shadow-2xl backdrop:bg-gray-900/50 sm:p-8">
      <button type="button" aria-label="Cerrar ventana" disabled={sending} onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">
        <X size={18} aria-hidden="true" />
      </button>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-green-800">
        <MailCheck size={28} aria-hidden="true" />
      </div>
      <h2 ref={heading} id="email-notice-title" tabIndex={-1} className="pr-4 text-2xl font-bold focus:outline-none">
        {verification ? "Verifica tu correo electrónico" : "Recupera tu contraseña"}
      </h2>
      <div id="email-notice-description" className="mt-3 space-y-3 text-sm leading-6 text-gray-600">
        <p>{verification
          ? accountCreated ? "Tu cuenta está pendiente de verificación. Revisa tu bandeja de entrada en:"
            : "Si tu cuenta está pendiente de verificación, recibirás un enlace en:"
          : "Si existe una cuenta activa con este correo, recibirás un enlace para cambiar tu contraseña en:"}</p>
        <p className="break-all rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-900">{email}</p>
        <p>{verification
          ? "Abre el enlace del mensaje y confirma tu correo. Al verificarlo, continuarás con la selección de tu plan."
          : "Abre el enlace del mensaje y elige una nueva contraseña. Después podrás iniciar sesión con ella."}</p>
        <p>El enlace caduca en <strong>{verification ? "24 horas" : "30 minutos"}</strong> y solo puede usarse una vez.</p>
        <p className="text-xs text-gray-500">Si no encuentras el mensaje, revisa la carpeta de spam o correo no deseado.</p>
      </div>
      {notice && <p role="status" className="mt-4 rounded-xl border border-lime-200 bg-lime-50 p-3 text-sm text-green-800">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 space-y-3">
        <button type="button" disabled={sending} onClick={onClose}
          className="w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold hover:bg-lime-300 disabled:opacity-50">
          {verification ? "Entendido" : "Volver a iniciar sesión"}
        </button>
        <button type="button" disabled={sending || remaining > 0} onClick={resend}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400">
          {sending ? "Reenviando..." : remaining > 0 ? `Reenviar enlace en ${remaining} s` : "Reenviar enlace"}
        </button>
      </div>
    </dialog>
  );
}

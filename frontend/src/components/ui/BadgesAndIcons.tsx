import React from "react";
import type { Incident } from "../../types/shared";

export function PriorityBadge({ p }: { p: Incident["prioridad"] }) {
  const cls =
    p === "Alta"
      ? "bg-red-50 text-red-600 border border-red-200"
      : p === "Media"
      ? "bg-orange-50 text-orange-600 border border-orange-200"
      : "bg-green-50 text-green-700 border border-green-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{p}</span>;
}

export function StatusBadge({ s }: { s: string }) {
  const cls =
    s === "Resuelta" || s === "Operativa" || s === "Activa" || s === "ACTIVA"
      ? "bg-lime-100 text-lime-700 border border-lime-300"
      : s === "En revisión"
      ? "bg-amber-50 text-amber-700 border border-amber-200"
      : s === "Abierta"
      ? "bg-blue-50 text-blue-600 border border-blue-200"
      : "bg-red-50 text-red-600 border border-red-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{s}</span>;
}

export function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function ActivityIcon({ tipo }: { tipo: string }) {
  if (tipo === "asignada")
    return (
      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    );
  if (tipo === "resuelta")
    return (
      <div className="w-7 h-7 rounded-full bg-lime-100 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  if (tipo === "revisada")
    return (
      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h8m-8 5h16" />
        </svg>
      </div>
    );
  if (tipo === "abierta")
    return (
      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
        </svg>
      </div>
    );
  return (
    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
      <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
  );
}

export function LogoIcon({ size = 8 }: { size?: number }) {
  return (
    <div className={`w-${size} h-${size} rounded-lg bg-lime-400 flex items-center justify-center shrink-0`}>
      <svg className={`w-${size === 8 ? 5 : 4} h-${size === 8 ? 5 : 4} text-gray-900`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    </div>
  );
}

export function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }}
      aria-label="Copiar al portapapeles"
      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

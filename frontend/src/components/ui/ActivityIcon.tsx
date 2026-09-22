import type { ActivityLog } from "../../types/shared";

export function ActivityIcon({ tipo }: { tipo: ActivityLog["tipo"] }) {
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

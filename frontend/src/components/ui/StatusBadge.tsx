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

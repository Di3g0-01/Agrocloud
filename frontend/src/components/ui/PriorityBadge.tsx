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

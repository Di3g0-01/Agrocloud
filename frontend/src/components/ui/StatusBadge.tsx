export function getStatusLabel(s: string): string {
  switch (s) {
    case 'active':
      return 'Operativa';
    case 'revision':
      return 'En revisión';
    case 'suspended':
      return 'Suspendida';
    case 'terminated':
      return 'Detenida';
    case 'pending_payment':
      return 'Pago pendiente';
    case 'cancelled':
      return 'Cancelada';
    default:
      return s;
  }
}

export function StatusBadge({ s }: { s: string }) {
  const label = getStatusLabel(s);
  const cls =
    s === "Resuelta" || s === "Operativa" || s === "Activa" || s === "Activo" || s === "ACTIVO" || s === "ACTIVA" || s === "active"
      ? "bg-lime-100 text-lime-700 border border-lime-300"
      : s === "En revisión" || s === "revision" || s === "pending_payment"
      ? "bg-amber-50 text-amber-700 border border-amber-200"
      : s === "Abierta"
      ? "bg-blue-50 text-blue-600 border border-blue-200"
      : "bg-red-50 text-red-600 border border-red-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>;
}

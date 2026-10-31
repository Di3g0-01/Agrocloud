import { useState, useEffect, useMemo } from "react";
import { CustomSelect } from "../../components/ui";
import { getAllPaymentsAdmin, getInvoiceByPaymentId, type BackendPayment, type BackendInvoice } from "../../api/paymentsApi";

function PaymentStatusBadge({ status }: { status: string }) {
  const norm = status.toUpperCase();
  const cls = norm === "COMPLETED" || norm === "PAGADO"
    ? "bg-lime-100 text-lime-700 border border-lime-300 dark:bg-lime-950/60 dark:text-lime-400 dark:border-lime-800"
    : norm === "PENDING" || norm === "PENDIENTE"
    ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
    : norm === "FAILED" || norm === "REJECTED" || norm === "RECHAZADO"
    ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800"
    : "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";

  const label = norm === "COMPLETED" ? "Pagado"
    : norm === "PENDING" ? "Pendiente"
    : norm === "REJECTED" || norm === "FAILED" ? "Rechazado"
    : status;

  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>;
}

interface AdminReceiptModalProps {
  payment: BackendPayment;
  isDark?: boolean;
  onClose: () => void;
}

function AdminReceiptModal({ payment, isDark, onClose }: AdminReceiptModalProps) {
  const [invoice, setInvoice] = useState<BackendInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getInvoiceByPaymentId(payment.id)
      .then((data) => {
        if (isMounted) setInvoice(data);
      })
      .catch((err) => {
        console.warn("No se pudo cargar factura remota detallada:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [payment.id]);

  const handlePrint = () => {
    window.print();
  };

  const isInitialPayment = payment.concepto.toLowerCase().includes("contratación") ||
    payment.concepto.toLowerCase().includes("inicial") ||
    payment.concepto.toLowerCase().includes("alta");

  const total = invoice ? invoice.total : payment.monto;
  const subtotal = invoice ? invoice.subtotal : Number((payment.monto / 1.12).toFixed(2));
  const tax = invoice ? invoice.impuesto : Number((payment.monto - subtotal).toFixed(2));
  const invoiceNumber = invoice ? invoice.numeroFactura : `REC-${payment.id.substring(0, 8).toUpperCase()}`;
  const clientName = payment.clienteNombre || invoice?.clienteNombre || "Cliente AgroCloud";
  const clientEmail = payment.clienteEmail || invoice?.clienteEmail || "";

  const formattedDate = new Date(payment.fecha).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      <aside
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] shadow-2xl z-50 flex flex-col border-l transition-all ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-200 text-gray-900"
        }`}
        role="dialog"
        aria-label="Comprobante de pago administrativo"
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between shrink-0 ${isDark ? "border-slate-800 bg-slate-900/80" : "border-gray-100 bg-gray-50/50"}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{invoiceNumber}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  isInitialPayment
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800"
                }`}
              >
                {isInitialPayment ? "Pago Inicial" : "Pago Mensual"}
              </span>
            </div>
            <p className={`text-xs mt-0.5 font-mono ${isDark ? "text-slate-400" : "text-gray-400"}`}>Ref: {payment.referencia}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar recibo"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status banner */}
          <div className={`border rounded-xl p-4 flex items-center justify-between ${
            payment.estado === "COMPLETED"
              ? isDark ? "bg-lime-950/30 border-lime-800/60 text-lime-300" : "bg-lime-50/80 border-lime-200 text-lime-900"
              : isDark ? "bg-amber-950/30 border-amber-800/60 text-amber-300" : "bg-amber-50/80 border-amber-200 text-amber-900"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm text-white ${
                payment.estado === "COMPLETED" ? "bg-lime-500" : "bg-amber-500"
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={payment.estado === "COMPLETED" ? "M5 13l4 4L19 7" : "M12 8v4l3 3"} />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {payment.estado === "COMPLETED" ? "Pago Confirmado" : "Pago " + payment.estado}
                </p>
                <p className="text-xs opacity-80">Registrado en sistema contable</p>
              </div>
            </div>
            <span className="text-xs font-medium">{formattedDate}</span>
          </div>

          {/* Client info */}
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Datos del Cliente</p>
            <div className={`rounded-xl p-4 space-y-2 text-xs border ${isDark ? "bg-slate-800/60 border-slate-700" : "bg-gray-50 border-gray-100"}`}>
              <div className="flex justify-between items-center">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Cliente / Organización</span>
                <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{clientName}</span>
              </div>
              {clientEmail && (
                <div className="flex justify-between items-center">
                  <span className={isDark ? "text-slate-400" : "text-gray-500"}>Correo electrónico</span>
                  <span className={`font-mono ${isDark ? "text-slate-300" : "text-gray-700"}`}>{clientEmail}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Plan contratado</span>
                <span className="font-medium text-lime-500">{payment.planNombre}</span>
              </div>
            </div>
          </div>

          {/* Details breakdown */}
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Detalle del Movimiento</p>
            <div className={`border rounded-xl p-3.5 space-y-2 text-xs ${isDark ? "bg-slate-800/40 border-slate-700" : "bg-white border-gray-100"}`}>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-700/60">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Tipo de Operación</span>
                <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{isInitialPayment ? "Pago Inicial (1ª Cuota Mensual)" : "Mensualidad Recurrente"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-700/60">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Concepto</span>
                <span className={`font-medium text-right max-w-[260px] truncate ${isDark ? "text-slate-200" : "text-gray-900"}`}>{payment.concepto}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-slate-700/60">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>Método de pago</span>
                <span className={`font-mono font-medium ${isDark ? "text-slate-200" : "text-gray-900"}`}>{payment.metodoPago}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className={isDark ? "text-slate-400" : "text-gray-500"}>ID Pago Interno</span>
                <span className="font-mono text-[10px] text-gray-400">{payment.id}</span>
              </div>
            </div>
          </div>

          {/* Breakdown summary */}
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Desglose Económico</p>
            <div className={`border rounded-xl p-4 space-y-2 text-xs ${isDark ? "bg-slate-800/40 border-slate-700" : "bg-gray-50/70 border-gray-100"}`}>
              <div className={`flex justify-between ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                <span>Subtotal neto</span>
                <span>Q {subtotal.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                <span>IVA (12%)</span>
                <span>Q {tax.toFixed(2)}</span>
              </div>
              <div className={`pt-2 border-t flex justify-between items-center text-sm font-bold ${
                isDark ? "border-slate-700 text-white" : "border-gray-200 text-gray-900"
              }`}>
                <span>Monto Total Cobrado</span>
                <span className="text-lime-500 text-base font-semibold">Q {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {loading && (
            <p className="text-center text-[11px] text-gray-400">Consultando factura electrónica...</p>
          )}
        </div>

        {/* Footer actions */}
        <div className={`p-5 border-t shrink-0 flex gap-3 ${isDark ? "border-slate-800 bg-slate-900/80" : "border-gray-100 bg-gray-50/50"}`}>
          <button
            onClick={handlePrint}
            className={`flex-1 py-2.5 px-4 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm border ${
              isDark
                ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                : "bg-white border-gray-300 hover:bg-gray-100 text-gray-700"
            }`}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / Guardar PDF
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-lime-500 hover:bg-lime-400 text-black font-semibold rounded-xl text-xs transition-colors shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </aside>
    </>
  );
}

export function AdminPayments({ isDark }: { isDark?: boolean }) {
  const [payments, setPayments] = useState<BackendPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [clientFilter, setClientFilter] = useState("Todos");
  const [monthFilter, setMonthFilter] = useState("Todos");

  // Receipt modal state
  const [selectedPayment, setSelectedPayment] = useState<BackendPayment | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPaymentsAdmin();
      setPayments(data || []);
    } catch (err: any) {
      console.error("Error al cargar pagos en área administrativa:", err);
      setError("No se pudieron cargar los pagos desde el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Extraer lista única de clientes para el filtro
  const clientOptions = useMemo(() => {
    const clientsSet = new Set<string>();
    payments.forEach(p => {
      const name = p.clienteNombre?.trim() || "Cliente AgroCloud";
      clientsSet.add(name);
    });
    const sorted = Array.from(clientsSet).sort((a, b) => a.localeCompare(b));
    return [
      { value: "Todos", label: "Todos los clientes" },
      ...sorted.map(c => ({ value: c, label: c }))
    ];
  }, [payments]);

  // Extraer lista única de meses (formato YYYY-MM) para el filtro
  const monthOptions = useMemo(() => {
    const monthsMap = new Map<string, string>();
    payments.forEach(p => {
      if (!p.fecha) return;
      const d = new Date(p.fecha);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthsMap.has(key)) {
        const monthLabel = d.toLocaleDateString("es-GT", { month: "long", year: "numeric" });
        const capitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
        monthsMap.set(key, capitalized);
      }
    });

    const sortedKeys = Array.from(monthsMap.keys()).sort((a, b) => b.localeCompare(a));
    return [
      { value: "Todos", label: "Todos los meses" },
      ...sortedKeys.map(k => ({ value: k, label: monthsMap.get(k)! }))
    ];
  }, [payments]);

  // Filtrado de pagos según los 4 criterios: estado, cliente, mes, búsqueda de texto
  const filtered = useMemo(() => {
    return payments.filter(p => {
      // Filtro por Estado
      if (statusFilter !== "Todos") {
        const pStatus = p.estado === "COMPLETED" ? "Pagado"
          : p.estado === "PENDING" ? "Pendiente"
          : p.estado === "REJECTED" || p.estado === "FAILED" ? "Rechazado"
          : p.estado;
        if (pStatus !== statusFilter) return false;
      }

      // Filtro por Cliente
      if (clientFilter !== "Todos") {
        const cName = p.clienteNombre?.trim() || "Cliente AgroCloud";
        if (cName !== clientFilter) return false;
      }

      // Filtro por Mes (YYYY-MM)
      if (monthFilter !== "Todos") {
        const d = new Date(p.fecha);
        const pMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (pMonthKey !== monthFilter) return false;
      }

      // Filtro por Búsqueda (ID, referencia, cliente, concepto, correo)
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesId = p.id.toLowerCase().includes(term);
        const matchesRef = p.referencia?.toLowerCase().includes(term);
        const matchesClient = (p.clienteNombre || "").toLowerCase().includes(term);
        const matchesEmail = (p.clienteEmail || "").toLowerCase().includes(term);
        const matchesConcept = (p.concepto || "").toLowerCase().includes(term);
        const matchesPlan = (p.planNombre || "").toLowerCase().includes(term);

        if (!matchesId && !matchesRef && !matchesClient && !matchesEmail && !matchesConcept && !matchesPlan) {
          return false;
        }
      }

      return true;
    });
  }, [payments, statusFilter, clientFilter, monthFilter, search]);

  // Métricas dinámicas calculadas sobre los datos reales (o filtrados)
  const totalRevenue = useMemo(() => {
    return filtered
      .filter(p => p.estado === "COMPLETED")
      .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
  }, [filtered]);

  const completedCount = useMemo(() => {
    return filtered.filter(p => p.estado === "COMPLETED").length;
  }, [filtered]);

  const pendingCount = useMemo(() => {
    return filtered.filter(p => p.estado === "PENDING").length;
  }, [filtered]);

  const rejectedCount = useMemo(() => {
    return filtered.filter(p => p.estado === "REJECTED" || p.estado === "FAILED").length;
  }, [filtered]);

  // Gráfica de ingresos mensuales agrupada por los últimos 6 meses a partir de los pagos
  const monthlyRevenueChart = useMemo(() => {
    const monthsData: { mes: string; monto: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const shortName = d.toLocaleDateString("es-GT", { month: "short" });
      const label = shortName.charAt(0).toUpperCase() + shortName.slice(1);

      const sum = payments
        .filter(p => p.estado === "COMPLETED" && p.fecha)
        .filter(p => {
          const pd = new Date(p.fecha);
          return pd.getFullYear() === year && pd.getMonth() === month;
        })
        .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);

      monthsData.push({ mes: label, monto: sum });
    }

    const max = Math.max(...monthsData.map(m => m.monto), 100);
    return { data: monthsData, max };
  }, [payments]);

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Pagos de Clientes</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Gestión centralizada de cobros, facturación y recibos de todos los clientes de AgroCloud.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors self-start sm:self-auto ${
            isDark
              ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin text-lime-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchPayments} className="underline font-semibold ml-3 hover:text-red-900">Reintentar</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "INGRESOS TOTALES", value: `Q${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: monthFilter === "Todos" ? "Vista actual" : monthOptions.find(m => m.value === monthFilter)?.label || "Filtrado", color: isDark ? "text-lime-400 bg-lime-950/40" : "text-lime-600 bg-lime-50", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS COMPLETADOS", value: String(completedCount), sub: "Transacciones exitosas", color: isDark ? "text-blue-400 bg-blue-950/40" : "text-blue-500 bg-blue-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS PENDIENTES", value: String(pendingCount), sub: "En procesamiento", color: isDark ? "text-amber-400 bg-amber-950/40" : "text-amber-500 bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS RECHAZADOS", value: String(rejectedCount), sub: "Revisión requerida", color: isDark ? "text-red-400 bg-red-950/40" : "text-red-500 bg-red-50", icon: "M6 18L18 6M6 6l12 12" },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl p-5 flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}
                </svg>
              </div>
              <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</span>
            </div>
            <div className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</div>
            <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart de ingresos */}
      <div className={`border rounded-xl p-6 mb-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Ingresos mensuales históricos</h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Últimos 6 meses registrados en el sistema</p>
          </div>
          <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>Q (Quetzales)</span>
        </div>
        <div className="flex items-end gap-3 h-36">
          {monthlyRevenueChart.data.map(m => {
            const heightPercent = monthlyRevenueChart.max > 0 ? (m.monto / monthlyRevenueChart.max) * 96 : 4;
            return (
              <div key={m.mes} className="flex-1 flex flex-col items-center gap-1.5">
                <span className={`text-[10px] font-medium ${isDark ? "text-slate-300" : "text-gray-500"}`}>
                  Q{m.monto >= 1000 ? `${(m.monto / 1000).toFixed(1)}k` : m.monto.toFixed(0)}
                </span>
                <div
                  className="w-full rounded-t-md bg-lime-400 hover:bg-lime-300 transition-all cursor-default"
                  style={{ height: `${Math.max(heightPercent, 4)}px` }}
                  title={`${m.mes}: Q${m.monto.toLocaleString()}`}
                />
                <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>{m.mes}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters Bar: Búsqueda, Filtro por Mes, Filtro por Cliente, Filtro por Estado */}
      <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-3 mb-5">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, referencia o ID..."
            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all ${
              isDark ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500" : "bg-white border-gray-200 text-gray-900 shadow-sm"
            }`}
          />
        </div>

        {/* Filter by Month */}
        <div className="w-full sm:w-auto min-w-[160px]">
          <CustomSelect
            value={monthFilter}
            onChange={(val) => setMonthFilter(val)}
            options={monthOptions}
            isDark={isDark}
            ariaLabel="Filtrar pagos por mes"
          />
        </div>

        {/* Filter by Client */}
        <div className="w-full sm:w-auto min-w-[180px]">
          <CustomSelect
            value={clientFilter}
            onChange={(val) => setClientFilter(val)}
            options={clientOptions}
            isDark={isDark}
            ariaLabel="Filtrar pagos por cliente"
          />
        </div>

        {/* Filter by Status */}
        <div className="w-full sm:w-auto min-w-[140px]">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={["Todos", "Pagado", "Pendiente", "Rechazado"].map((s) => ({ value: s, label: s }))}
            isDark={isDark}
            ariaLabel="Filtrar pagos por estado"
          />
        </div>

        {(search || statusFilter !== "Todos" || clientFilter !== "Todos" || monthFilter !== "Todos") && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("Todos");
              setClientFilter("Todos");
              setMonthFilter("Todos");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors self-center ${
              isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`border rounded-xl overflow-x-auto ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100 shadow-sm"}`}>
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className={`border-b ${isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-gray-50"}`}>
              {["Transacción", "Cliente", "Concepto", "Plan", "Monto", "Método", "Fecha", "Estado", "Acciones"].map(h => (
                <th key={h} className={`px-5 py-3 text-left font-medium text-xs uppercase tracking-wide whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-xs text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
                    <span>Cargando historial de pagos...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-xs text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="font-semibold text-gray-500">No se encontraron pagos registrados</p>
                    <p className="text-[11px]">Intenta cambiando los filtros de mes, cliente o estado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const clientDisplayName = p.clienteNombre || "Cliente AgroCloud";
                const clientEmail = p.clienteEmail || "";
                const formattedDate = new Date(p.fecha).toLocaleDateString("es-GT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={p.id} className={`border-b transition-colors ${isDark ? "border-slate-800/60 hover:bg-slate-800/40" : "border-gray-50 hover:bg-gray-50/80"}`}>
                    <td className={`px-5 py-4 font-mono text-xs font-semibold ${isDark ? "text-lime-400" : "text-gray-900"}`}>
                      {p.referencia || p.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <div className={`font-medium ${isDark ? "text-slate-200" : "text-gray-900"}`}>
                        {clientDisplayName}
                      </div>
                      {clientEmail && (
                        <div className={`text-[11px] font-mono ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                          {clientEmail}
                        </div>
                      )}
                    </td>
                    <td className={`px-5 py-4 text-xs max-w-[240px] truncate ${isDark ? "text-slate-300" : "text-gray-600"}`} title={p.concepto}>
                      {p.concepto}
                    </td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap font-medium text-lime-600 dark:text-lime-400">
                      {p.planNombre}
                    </td>
                    <td className={`px-5 py-4 text-sm font-semibold whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                      Q{Number(p.monto).toFixed(2)}
                    </td>
                    <td className={`px-5 py-4 text-xs font-mono uppercase ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                      {p.metodoPago}
                    </td>
                    <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                      {formattedDate}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <PaymentStatusBadge status={p.estado} />
                    </td>
                    <td className="px-5 py-4 relative whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                            isDark
                              ? "bg-slate-800 border-slate-700 text-lime-400 hover:bg-slate-700"
                              : "bg-lime-50 border-lime-200 text-lime-800 hover:bg-lime-100"
                          }`}
                          title="Ver recibo y desglose tributario"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Recibo
                        </button>
                        <button
                          onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                            isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>

                      {menuOpen === p.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className={`absolute right-4 top-10 z-20 border rounded-xl shadow-lg py-1 w-44 text-xs ${
                            isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-200 text-gray-700"
                          }`}>
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                setSelectedPayment(p);
                              }}
                              className={`w-full text-left px-4 py-2 transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"}`}
                            >
                              Ver recibo completo
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpen(null);
                                setSelectedPayment(p);
                                setTimeout(() => window.print(), 300);
                              }}
                              className={`w-full text-left px-4 py-2 transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"}`}
                            >
                              Imprimir comprobante
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className={`px-5 py-3 text-xs border-t flex items-center justify-between ${
          isDark ? "text-slate-400 border-slate-800" : "text-gray-500 border-gray-100"
        }`}>
          <span>Mostrando {filtered.length} de {payments.length} pago{payments.length !== 1 ? "s" : ""}</span>
          {(clientFilter !== "Todos" || monthFilter !== "Todos" || statusFilter !== "Todos") && (
            <span className="text-[11px] text-lime-600 dark:text-lime-400 font-medium">Filtros activos</span>
          )}
        </div>
      </div>

      {/* Slide-over Receipt Modal */}
      {selectedPayment && (
        <AdminReceiptModal
          payment={selectedPayment}
          isDark={isDark}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

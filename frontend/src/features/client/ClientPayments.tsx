import { useState, useEffect } from "react";
import { getMyPayments, getInvoiceByPaymentId, type BackendPayment, type BackendInvoice } from "../../api/paymentsApi";
import type { Payment } from "../../types/client";

interface PaymentReceiptModalProps {
  payment: Payment;
  organizationName: string;
  onClose: () => void;
}

function PaymentReceiptModal({ payment, organizationName, onClose }: PaymentReceiptModalProps) {
  const [invoice, setInvoice] = useState<BackendInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getInvoiceByPaymentId(payment.id)
      .then((data) => {
        if (isMounted) setInvoice(data);
      })
      .catch((err) => {
        console.warn("No se pudo cargar factura remota detallada, usando desglose del pago:", err);
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

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-label="Recibo de pago"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-gray-900">{invoiceNumber}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  isInitialPayment
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                {isInitialPayment ? "Pago Inicial" : "Pago Mensual"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Ref: {payment.referencia}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar recibo"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status badge & date banner */}
          <div className="bg-lime-50/80 border border-lime-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-lime-500 text-white flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-lime-900 uppercase tracking-wide">Transacción Exitosa</p>
                <p className="text-xs text-lime-700">Comprobante de pago verificado</p>
              </div>
            </div>
            <span className="text-xs font-medium text-lime-800">{payment.fecha}</span>
          </div>

          {/* Details breakdown */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Detalle del Recibo</p>
            <div className="bg-white border border-gray-100 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tipo de Recibo</span>
                <span className="text-gray-900 font-semibold">{isInitialPayment ? "Pago Inicial (1ª Cuota Mensual)" : "Mensualidad Recurrente"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Concepto</span>
                <span className="text-gray-900 font-medium text-right max-w-[240px] truncate">{payment.concepto}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Período facturado</span>
                <span className="text-gray-900 font-medium">{payment.periodo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Método de pago</span>
                <span className="text-gray-900 font-mono font-medium">{payment.metodo}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Identificador Interno</span>
                <span className="text-gray-500 font-mono text-[10px]">{payment.id}</span>
              </div>
            </div>
          </div>

          {/* Billing info */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Datos de Facturación</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Razón social</span>
                <span className="text-gray-900 font-semibold">{organizationName || "Cliente AgroCloud"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Emisor</span>
                <span className="text-gray-700">AgroCloud Inc. S.A.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Moneda</span>
                <span className="text-gray-700 font-medium">GTQ (Quetzales de Guatemala)</span>
              </div>
            </div>
          </div>

          {/* Breakdown summary */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Desglose Económico</p>
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal neto</span>
                <span>Q {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA (12%)</span>
                <span>Q {tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Monto Total Pagado</span>
                <span className="text-lime-700 text-base">Q {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {loading && (
            <p className="text-center text-[11px] text-gray-400">Verificando factura electrónica vinculada...</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 shrink-0 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / Guardar PDF
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-xs transition-colors shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </aside>
    </>
  );
}

// Transformador de BackendPayment a Payment UI (Principio SRP y DRY)
function mapBackendPaymentToUi(bp: BackendPayment, indexFromOldest: number): Payment {
  const dateObj = new Date(bp.fecha);
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toISOString().split("T")[0]
    : bp.fecha;

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const periodo = !isNaN(dateObj.getTime())
    ? `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`
    : "Período activo";

  const isFirst = indexFromOldest === 0 || bp.concepto?.toLowerCase().includes("contratación");
  const defaultConcept = isFirst
    ? `Contratación inicial - Plan ${bp.planNombre || "Suscripción"}`
    : `Mensualidad recurrente - Plan ${bp.planNombre || "Suscripción"}`;

  return {
    id: bp.id,
    fecha: formattedDate,
    concepto: bp.concepto || defaultConcept,
    periodo,
    monto: Number(bp.monto),
    metodo: bp.metodoPago || "TARJETA",
    referencia: bp.referencia || `REF-${bp.id.substring(0, 8).toUpperCase()}`,
    estado: "Pagado",
  };
}

export function ClientPayments({ organizationName }: { organizationName: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"todos" | "inicial" | "mensual">("todos");
  const [selectedYear, setSelectedYear] = useState<string>("todos");
  const [detail, setDetail] = useState<Payment | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getMyPayments();
      // Ordenar cronológicamente ascendente para determinar orden inicial -> mensual
      const sortedAsc = [...data].sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
      const mapped = sortedAsc.map((item, idx) => mapBackendPaymentToUi(item, idx));
      // Luego invertimos para visualización (los más recientes primero) o preservamos orden
      setPayments(mapped.reverse());
    } catch (err: any) {
      console.error("Error al cargar pagos:", err);
      setErrorMsg("No se pudieron cargar los registros de pagos desde el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Años disponibles basados en los datos reales
  const availableYears = Array.from(
    new Set(payments.map((p) => p.fecha.split("-")[0]).filter(Boolean))
  ).sort().reverse();

  // Filtrado compuesto
  const filtered = payments.filter((p) => {
    const isInitial = p.concepto.toLowerCase().includes("contratación") ||
      p.concepto.toLowerCase().includes("inicial");
    const isMonthly = !isInitial;

    const matchesType =
      typeFilter === "todos" ||
      (typeFilter === "inicial" && isInitial) ||
      (typeFilter === "mensual" && isMonthly);

    const matchesYear = selectedYear === "todos" || p.fecha.startsWith(selectedYear);

    const q = search.toLowerCase();
    const matchesSearch =
      p.referencia.toLowerCase().includes(q) ||
      p.concepto.toLowerCase().includes(q) ||
      p.periodo.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);

    return matchesType && matchesYear && matchesSearch;
  });

  const totalPaid = payments.reduce((acc, p) => acc + p.monto, 0);
  const initialReceipt = [...payments].reverse().find(
    (p) => p.concepto.toLowerCase().includes("contratación") || p.concepto.toLowerCase().includes("inicial")
  ) || (payments.length > 0 ? payments[payments.length - 1] : null);
  const lastPayment = payments.length > 0 ? payments[0] : null;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Historial de Pagos y Recibos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Revisa y descarga tus comprobantes desde el pago inicial de activación hasta las cuotas mensuales.
          </p>
        </div>
        <button
          onClick={loadPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin text-lime-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Sincronizando..." : "Actualizar"}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={loadPayments} className="underline text-xs font-semibold hover:text-red-900">Reintentar</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lime-600 bg-lime-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">TOTAL HISTÓRICO PAGADO</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">Q {totalPaid.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">{payments.length} recibo{payments.length !== 1 ? "s" : ""} registrado{payments.length !== 1 ? "s" : ""}</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">RECIBO PAGO INICIAL</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {initialReceipt ? `Q ${initialReceipt.monto.toFixed(2)}` : "Sin registro"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {initialReceipt ? `Activado el ${initialReceipt.fecha}` : "No se ha registrado contratación"}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">ÚLTIMO RECIBO EMITIDO</span>
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {lastPayment ? `Q ${lastPayment.monto.toFixed(2)}` : "Q 0.00"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {lastPayment ? `${lastPayment.concepto} (${lastPayment.fecha})` : "Sin registros"}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Segmented Buttons */}
          <div className="inline-flex p-1 bg-gray-200/60 rounded-xl text-xs font-medium text-gray-600">
            <button
              onClick={() => setTypeFilter("todos")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "todos" ? "bg-white text-gray-900 shadow-sm font-semibold" : "hover:text-gray-900"
              }`}
            >
              Todos los recibos
            </button>
            <button
              onClick={() => setTypeFilter("inicial")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "inicial" ? "bg-white text-emerald-800 shadow-sm font-semibold" : "hover:text-gray-900"
              }`}
            >
              Pago Inicial
            </button>
            <button
              onClick={() => setTypeFilter("mensual")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === "mensual" ? "bg-white text-blue-800 shadow-sm font-semibold" : "hover:text-gray-900"
              }`}
            >
              Pagos Mensuales
            </button>
          </div>

          {/* Year selector if multiple years */}
          {availableYears.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedYear("todos")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedYear === "todos" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Todos los años
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedYear === yr ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por referencia, concepto o período..."
            aria-label="Buscar pagos"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table & Empty state */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-800">Cargando recibos de pago...</p>
          <p className="text-xs text-gray-400 mt-1">Consultando transacciones con el servidor</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 flex flex-col items-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-800">Sin recibos encontrados</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {payments.length === 0
              ? "Aún no se registran pagos en tu cuenta. Al contratar un plan, tu recibo inicial aparecerá automáticamente aquí."
              : "No se encontraron recibos con los filtros aplicados."}
          </p>
          {(search || typeFilter !== "todos" || selectedYear !== "todos") && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("todos");
                setSelectedYear("todos");
              }}
              className="mt-4 px-3 py-1.5 text-xs text-lime-600 hover:text-lime-700 font-semibold bg-lime-50 rounded-lg transition-colors"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-max w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-4 py-3.5 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3.5 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3.5 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Concepto / Período</th>
                  <th className="px-4 py-3.5 text-right text-gray-400 font-medium text-xs uppercase tracking-wider">Monto</th>
                  <th className="px-4 py-3.5 text-center text-gray-400 font-medium text-xs uppercase tracking-wider">Método</th>
                  <th className="px-4 py-3.5 text-center text-gray-400 font-medium text-xs uppercase tracking-wider">Referencia</th>
                  <th className="px-4 py-3.5 text-center text-gray-400 font-medium text-xs uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3.5 text-center text-gray-400 font-medium text-xs uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((pago) => {
                  const isInitial = pago.concepto.toLowerCase().includes("contratación") ||
                    pago.concepto.toLowerCase().includes("inicial");
                  return (
                    <tr key={pago.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            isInitial
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isInitial ? "bg-emerald-500" : "bg-blue-500"}`} />
                          {isInitial ? "Pago Inicial" : "Pago Mensual"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap font-medium">
                        {pago.fecha}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-xs font-semibold text-gray-900">{pago.concepto}</p>
                        <p className="text-[11px] text-gray-400">{pago.periodo}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                        Q {pago.monto.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-600 whitespace-nowrap font-mono">
                        {pago.metodo}
                      </td>
                      <td className="px-4 py-3.5 text-center text-[11px] text-gray-400 font-mono whitespace-nowrap">
                        {pago.referencia}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-lime-100 text-lime-800 border border-lime-300">
                          Pagado
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setDetail(pago)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Ver recibo
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Mostrando {filtered.length} de {payments.length} recibos en total</span>
            <span className="font-medium text-gray-700">Comprobantes válidos con fines contables</span>
          </div>
        </div>
      )}

      {/* Modal / Drawer de detalle del recibo */}
      {detail && (
        <PaymentReceiptModal
          payment={detail}
          organizationName={organizationName}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

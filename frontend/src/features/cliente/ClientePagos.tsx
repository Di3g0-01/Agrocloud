import { useState } from "react";
import { PAGOS_MOCK } from "../../data/cliente";
import type { Pago } from "../../types/cliente";

function PagoDetalleDrawer({ pago, onClose }: { pago: Pago; onClose: () => void }) {
  const subtotal = pago.monto;
  const impuesto = 0;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <aside className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col" role="dialog" aria-label="Detalle del pago">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <p className="font-semibold text-gray-900">{pago.id}</p>
            <p className="text-[10px] text-gray-400">{pago.referencia}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar panel" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-lime-100 text-lime-700 border border-lime-300">Pagado</span>
            <span className="text-xs text-gray-400">{pago.fecha}</span>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Detalle del pago</p>
            <div className="space-y-2">
              {[
                ["Concepto", pago.concepto],
                ["Período facturado", pago.periodo],
                ["Método de pago", pago.metodo],
                ["Referencia", pago.referencia],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Datos de facturación</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-xs">
              {[["Razón social", "Finca Los Pinos"], ["NIT", "CF"], ["Dirección", "Guatemala, Guatemala"]].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-gray-700">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Desglose</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800">Q {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Impuestos</span>
                <span className="text-gray-400">Q {impuesto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold text-sm">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">Q {(subtotal + impuesto).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors">Cerrar</button>
        </div>
      </aside>
    </>
  );
}

export function ClientePagos() {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("2026");
  const [detalle, setDetalle] = useState<Pago | null>(null);

  const years = ["2026", "2025"];

  const filtered = PAGOS_MOCK.filter(p => {
    const matchSearch =
      p.referencia.toLowerCase().includes(search.toLowerCase()) ||
      p.concepto.toLowerCase().includes(search.toLowerCase()) ||
      p.periodo.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchYear = p.fecha.startsWith(yearFilter);
    return matchSearch && matchYear;
  });

  const totalAnio = PAGOS_MOCK.filter(p => p.fecha.startsWith(yearFilter)).reduce((s, p) => s + p.monto, 0);
  const ultimoPago = PAGOS_MOCK[0];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Pagos</h1>
        <p className="text-sm text-gray-500 mt-1">Consulta el historial de pagos de tu suscripción.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "TOTAL PAGADO EN 2026", value: `Q ${totalAnio.toFixed(2)}`, sub: "Pagos realizados durante el año", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-lime-600 bg-lime-50" },
          { label: "ÚLTIMO PAGO", value: `Q ${ultimoPago.monto.toFixed(2)}`, sub: ultimoPago.fecha, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-blue-500 bg-blue-50" },
          { label: "MÉTODO USADO", value: "Visa •••• 4242", sub: "Tarjeta de crédito", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", color: "text-purple-500 bg-purple-50" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}
                </svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por referencia, concepto o período..."
            aria-label="Buscar pagos"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <div className="flex gap-1.5">
          {years.map(y => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${yearFilter === y ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Sin resultados</p>
          <p className="text-xs text-gray-400 mt-1">No se encontraron pagos con los filtros actuales.</p>
          <button onClick={() => { setSearch(""); setYearFilter("2026"); }} className="mt-4 text-xs text-lime-600 hover:text-lime-700 font-medium">Limpiar filtros</button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <table className="min-w-max w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["ID", "Fecha", "Concepto / Período", "Monto", "Método", "Referencia", "Estado", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-center text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(pago => (
                <tr key={pago.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors text-center">
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">{pago.id}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">{pago.fecha}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-xs font-medium text-gray-800">{pago.concepto}</p>
                    <p className="text-[10px] text-gray-400">{pago.periodo}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">Q {pago.monto.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap font-mono">{pago.metodo}</td>
                  <td className="px-4 py-3.5 text-[10px] text-gray-400 font-mono whitespace-nowrap">{pago.referencia}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-lime-100 text-lime-700 border border-lime-300">Pagado</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap flex justify-center">
                    <button onClick={() => setDetalle(pago)} className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Ver recibo</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} registro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</div>
        </div>
      )}

      {detalle && <PagoDetalleDrawer pago={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}

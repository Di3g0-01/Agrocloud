import type { FormEvent } from "react";
import type { Plan } from "../../types";

export interface SimulatedCardData {
  numero: string;
  titular: string;
  exp: string;
  cvv: string;
}

interface SimulatedPaymentProps {
  plan: Plan;
  cardData: SimulatedCardData;
  onCardChange: (card: SimulatedCardData) => void;
  saving: boolean;
  onBack: () => void;
  onConfirm: () => Promise<void>;
}

export function SimulatedPayment({ plan: selectedPlan, cardData, onCardChange: setCardData, saving: submitting, onBack, onConfirm }: SimulatedPaymentProps) {
  const inputClass =
    "w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200";
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    await onConfirm();
  };

  return <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Simulación de Pago</h1>
      <p className="mt-1 text-sm text-gray-500">Simula el pago de tu primer mes para activar la cuenta.</p>
    </div>
<form onSubmit={submit} className="space-y-4">
            {/* Resumen del plan */}
            <div className="rounded-xl bg-slate-900 text-white p-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Plan seleccionado</span>
                <span className="text-lime-400 font-semibold">{selectedPlan.nombre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">
                  {selectedPlan.instanciasPermitidas} base(s) de datos · {selectedPlan.almacenamientoGb} GB
                </span>
                <span className="text-lg font-bold text-white">Q {selectedPlan.precioMensual.toFixed(2)} / mes</span>
              </div>
            </div>

            {/* Tarjeta simulada */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Tarjeta de Crédito / Débito (Simulador)</span>
                <span className="text-[10px] font-bold text-lime-700 bg-lime-100 px-2 py-0.5 rounded-full">Pruebas</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Número de tarjeta</label>
                <input
                  type="text"
                  required
                  value={cardData.numero}
                  onChange={(e) => setCardData({ ...cardData, numero: e.target.value })}
                  className={inputClass}
                  placeholder="4532 8912 3456 7890"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Nombre en la tarjeta</label>
                <input
                  type="text"
                  required
                  value={cardData.titular}
                  onChange={(e) => setCardData({ ...cardData, titular: e.target.value })}
                  className={inputClass}
                  placeholder="Nombre del titular"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Vencimiento (MM/AA)</label>
                  <input
                    type="text"
                    required
                    value={cardData.exp}
                    onChange={(e) => setCardData({ ...cardData, exp: e.target.value })}
                    className={inputClass}
                    placeholder="12/28"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">CVV</label>
                  <input
                    type="text"
                    required
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    className={inputClass}
                    placeholder="882"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-800 flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Esta simulación activará tu cuenta de cliente, registrará tu suscripción y generará tu factura electrónica en AgroCloud sin cobro real.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={onBack}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Cambiar plan
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting ? "Simulando pago..." : "Simular Pago y Entrar"}
              </button>
            </div>
          </form>
  </div>;
}

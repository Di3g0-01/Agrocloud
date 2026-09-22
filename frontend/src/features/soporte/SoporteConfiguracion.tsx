import { useState } from "react";
import { instances } from "../../data/shared";
import { StatusBadge } from "../../components/ui";
import { CustomSelect } from "../../components/ui/CustomSelect";

interface SoporteConfiguracionProps {
  theme?: "light" | "dark";
  setTheme?: (theme: "light" | "dark") => void;
}

export function SoporteConfiguracion({ theme = "light", setTheme }: SoporteConfiguracionProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [localInst, setLocalInst] = useState(instances.map(i => ({ ...i, alertaCpu: 80, alertaMemoria: 80, notificaciones: true, backupAuto: true, intervalo: "diario" })));

  const isDark = theme === "dark";

  return (
    <div className={`p-4 lg:p-8 space-y-6 transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Configuración</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          Configuración de interfaz del sistema e individual de cada instancia de cliente.
        </p>
      </div>

      {/* System Theme & Appearance Settings */}
      {setTheme && (
        <div className={`border rounded-2xl p-6 shadow-xs ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <h2 className={`text-base font-semibold mb-1 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Apariencia y Tema del Sistema
          </h2>
          <p className={`text-xs mb-5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>
            Personaliza el tema visual predeterminado de la interfaz.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            {[
              {
                id: "light",
                label: "Tema Claro",
                sub: "Limpio y brillante",
                svg: (
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
              },
              {
                id: "dark",
                label: "Tema Oscuro",
                sub: "Modo nocturno pro",
                svg: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ),
              },
              {
                id: "system",
                label: "Modo Sistema",
                sub: "Sincronizado con SO",
                svg: (
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id === "dark" ? "dark" : "light")}
                className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  theme === item.id
                    ? "border-lime-500 ring-2 ring-lime-400/30 bg-lime-50/20"
                    : isDark
                    ? "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="mb-3">{item.svg}</div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.label}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{item.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instances Configuration Header */}
      <div>
        <h2 className={`text-base font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Configuración de Instancias</h2>
        <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>Ajusta umbrales de recursos y respaldos por cada cliente.</p>
      </div>

      <div className="space-y-4">
        {localInst.map((inst, idx) => (
          <div key={inst.nombre} className={`border rounded-xl overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setEditIdx(editIdx === idx ? null : idx)}>
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-lime-900/40" : "bg-lime-50"}`}>
                  <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <p className={`font-mono text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{inst.nombre}</p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inst.cliente} · {inst.tipo} · {inst.version}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge s={inst.estado} />
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${editIdx === idx ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {editIdx === idx && (
              <div className={`border-t p-5 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Alertas de recursos</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`flex justify-between text-xs mb-2 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          <span>Umbral CPU (%)</span>
                          <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{inst.alertaCpu}%</span>
                        </label>
                        <input type="range" min={50} max={100} value={inst.alertaCpu} onChange={e => setLocalInst(p => p.map((x, i) => i === idx ? { ...x, alertaCpu: +e.target.value } : x))} className="w-full accent-lime-500" />
                      </div>
                      <div>
                        <label className={`flex justify-between text-xs mb-2 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          <span>Umbral memoria (%)</span>
                          <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{inst.alertaMemoria}%</span>
                        </label>
                        <input type="range" min={50} max={100} value={inst.alertaMemoria} onChange={e => setLocalInst(p => p.map((x, i) => i === idx ? { ...x, alertaMemoria: +e.target.value } : x))} className="w-full accent-lime-500" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Notificaciones y respaldo</h3>
                    <div className="space-y-4">
                      {[["notificaciones", "Notificaciones activas"] as const, ["backupAuto", "Backup automático"] as const].map(([key, label]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>{label}</span>
                          <button onClick={() => setLocalInst(p => p.map((x, i) => i === idx ? { ...x, [key]: !x[key] } : x))} className={`relative w-10 h-5 rounded-full transition-colors ${inst[key] ? "bg-lime-400" : isDark ? "bg-slate-700" : "bg-gray-200"}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inst[key] ? "translate-x-5" : ""}`} />
                          </button>
                        </label>
                      ))}
                      <div>
                        <label className={`block text-xs mb-1.5 ${isDark ? "text-slate-300" : "text-gray-600"}`}>Intervalo de backup</label>
                        <CustomSelect
                          value={inst.intervalo}
                          onChange={(val) => setLocalInst(p => p.map((x, i) => i === idx ? { ...x, intervalo: val } : x))}
                          options={[
                            { value: "horario", label: "Horario" },
                            { value: "diario", label: "Diario" },
                            { value: "semanal", label: "Semanal" },
                          ]}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-bold rounded-xl text-xs transition-colors shadow-xs">
                    Guardar cambios
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

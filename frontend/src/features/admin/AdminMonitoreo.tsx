import { ProgressBar, StatusBadge } from "../../components/ui";
import { instances } from "../../data/shared";

export function AdminMonitoreo({ isDark }: { isDark?: boolean }) {
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Monitoreo</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Estado en tiempo real de todas las instancias del sistema.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Operativas", count: 4, color: isDark ? "text-lime-400 bg-lime-950/40 border-lime-900/40" : "text-lime-600 bg-lime-50 border-lime-200" },
          { label: "En revisión", count: 1, color: isDark ? "text-amber-400 bg-amber-950/40 border-amber-900/40" : "text-amber-600 bg-amber-50 border-amber-200" },
          { label: "Detenidas", count: 2, color: isDark ? "text-red-400 bg-red-950/40 border-red-900/40" : "text-red-600 bg-red-50 border-red-200" }
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-4 ${color}`}><span className="text-3xl font-semibold">{count}</span><span className="text-sm font-medium">{label}</span></div>
        ))}
      </div>
      <div className={`border rounded-xl overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-gray-50"}`}>
              {["Instancia", "Cliente", "CPU", "Memoria", "Uptime", "Estado"].map(h => (
                <th key={h} className={`px-5 py-3 text-left font-medium text-xs uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-400"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {instances.map(inst => (
              <tr key={inst.nombre} className={`border-b transition-colors ${isDark ? "border-slate-800/60 hover:bg-slate-800/40" : "border-gray-50 hover:bg-gray-50"}`}>
                <td className={`px-5 py-4 font-mono text-xs font-medium ${isDark ? "text-lime-400" : "text-gray-900"}`}>{inst.nombre}</td>
                <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{inst.cliente}</td>
                <td className="px-5 py-4 w-36"><div className="flex items-center gap-2"><ProgressBar value={inst.cpu} color={inst.cpu > 70 ? "bg-red-400" : inst.cpu > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className={`text-xs w-8 shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.cpu}%</span></div></td>
                <td className="px-5 py-4 w-36"><div className="flex items-center gap-2"><ProgressBar value={inst.memoria} color={inst.memoria > 70 ? "bg-red-400" : inst.memoria > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className={`text-xs w-8 shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.memoria}%</span></div></td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.uptime}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

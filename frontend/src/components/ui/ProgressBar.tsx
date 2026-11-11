export function ProgressBar({ value, color }: { value: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

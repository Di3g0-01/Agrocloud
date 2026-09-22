export function LogoIcon({ size = 8 }: { size?: number }) {
  return (
    <div className={`w-${size} h-${size} rounded-lg bg-lime-400 flex items-center justify-center shrink-0`}>
      <svg className={`w-${size === 8 ? 5 : 4} h-${size === 8 ? 5 : 4} text-gray-900`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    </div>
  );
}

export function LogoIcon({ 
  size = 8, 
  variant = "dark-bg" 
}: { 
  size?: number; 
  variant?: "dark-bg" | "light-bg"; 
}) {
  const isLight = variant === "light-bg";
  const src = isLight ? "/agrocloud-isotipo-green.svg" : "/agrocloud-isotipo.svg";

  return (
    <img 
      src={src} 
      alt="AgroCloud" 
      className={`w-${size} h-${size} object-contain shrink-0`} 
    />
  );
}

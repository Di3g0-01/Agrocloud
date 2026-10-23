/**
 * 1. WebIcon / Favicon:
 * Círculo/app icon verde bosque con isotipo nítido.
 */
export function AgroCloudIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img 
      src="/favicon.svg" 
      alt="AgroCloud Icon" 
      className={`${className} object-contain`} 
    />
  );
}

/**
 * 2. Isotipo:
 * - variant="dark-bg": Blanco con acento verde lima (para fondos oscuros).
 * - variant="light-bg": Verde oscuro con acento verde lima (para fondos claros/blancos).
 */
export function AgroCloudIsotipo({ 
  className = "w-9 h-9",
  variant = "dark-bg"
}: { 
  className?: string;
  variant?: "dark-bg" | "light-bg";
}) {
  const src = variant === "light-bg" ? "/agrocloud-isotipo-green.svg" : "/agrocloud-isotipo.svg";
  return (
    <img 
      src={src} 
      alt="AgroCloud Isotipo" 
      className={`${className} object-contain`} 
    />
  );
}

/**
 * 3. Logotipo Completo:
 * - variant="dark-bg": Isotipo blanco + texto blanco y verde lima (para fondos oscuros).
 * - variant="light-bg": Isotipo verde oscuro + texto verde bosque y verde lima (para fondos claros).
 * - variant="green-box": Logo con cajetín verde oscuro incorporado.
 */
export function AgroCloudLogo({ 
  className = "h-9 w-auto",
  variant = "dark-bg"
}: { 
  className?: string;
  variant?: "dark-bg" | "light-bg" | "green-box";
}) {
  let src = "/agrocloud-logo.svg";
  if (variant === "light-bg") {
    src = "/agrocloud-logo-light-bg.svg";
  } else if (variant === "green-box") {
    src = "/agrocloud-logo-green.svg";
  }

  return (
    <img 
      src={src} 
      alt="AgroCloud" 
      className={`${className} object-contain`} 
    />
  );
}

import React, { useEffect, useState } from "react";

interface LogoSplashAnimationProps {
  onFinish?: () => void;
}

export const LogoSplashAnimation: React.FC<LogoSplashAnimationProps> = ({ onFinish }) => {
  // Estados de la animación:
  // 0: Initial (piezas separadas y difuminadas)
  // 1: Assembled (las piezas se unen en el centro con un ensamble limpio, suave y destello de color)
  // 2: FadingOut (desvanecimiento suave en el centro con zoom elegante hacia adelante)
  // 3: Finished (desmontado del DOM)
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    // 1. Iniciamos el ensamble fluido en el centro
    const tAssemble = setTimeout(() => {
      setStage(1);
    }, 60);

    // 2. Mantenemos el logo visible en el centro y a los 1800ms comienza el fade out elegante
    const tFade = setTimeout(() => {
      setStage(2);
    }, 1800);

    // 3. A los 2350ms finaliza y se desmonta
    const tFinish = setTimeout(() => {
      setStage(3);
      if (onFinish) onFinish();
    }, 2350);

    return () => {
      clearTimeout(tAssemble);
      clearTimeout(tFade);
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  if (stage === 3) return null;

  return (
    <div
      className={`fixed inset-0 z-[9990] flex items-center justify-center pointer-events-none transition-all duration-600 ease-out ${
        stage === 2 ? "opacity-0 backdrop-blur-none" : "opacity-100 bg-white/95 backdrop-blur-md"
      }`}
      aria-hidden="true"
    >
      {/* Resplandor ambiental de fondo */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[380px] rounded-full bg-gradient-to-r from-emerald-500/20 via-lime-400/25 to-emerald-600/20 blur-3xl transition-all duration-1000 ${
          stage === 1 ? "scale-110 opacity-100" : stage === 2 ? "scale-125 opacity-0" : "scale-75 opacity-30"
        }`}
      />

      {/* Contenedor central del Logo */}
      <div
        className={`relative flex flex-col items-center select-none transition-all duration-600 ease-out ${
          stage === 2
            ? "scale-105 opacity-0 -translate-y-2"
            : stage === 1
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-1"
        }`}
      >
        {/* Logo SVG completo con piezas desglosadas que se unen */}
        <svg
          viewBox="0 0 540 160"
          className="w-[340px] sm:w-[480px] md:w-[560px] h-auto drop-shadow-xl overflow-visible"
        >
          <defs>
            <filter id="splash-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#76d322" floodOpacity="0.4" />
            </filter>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#65a30d" />
            </linearGradient>
          </defs>

          {/* GRUPO ISOTIPO */}
          <g transform="translate(15, 15)">
            {/* Pieza 1: La Nube (baja flotando desde arriba) */}
            <path
              d="M 33 60 
                 C 22 60 17 52 19 43 
                 C 21 34 29 31 35 32 
                 C 37 19 50 11 63 13 
                 C 74 15 81 24 80 34 
                 C 87 36 93 41 91 50 
                 C 90 58 83 61 74 61"
              fill="none"
              stroke="#092817"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-800 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={{
                transformOrigin: "50px 35px",
                transform: stage === 0 ? "translateY(-45px) scale(0.65)" : "translateY(0) scale(1)",
                opacity: stage === 0 ? 0 : 1,
                transitionDelay: "60ms",
              }}
            />

            {/* Pieza 2: Discos Superiores del Cilindro BD (suben desde abajo) */}
            <g
              className="transition-all duration-800 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={{
                transformOrigin: "50px 65px",
                transform: stage === 0 ? "translateY(40px) scale(0.7)" : "translateY(0) scale(1)",
                opacity: stage === 0 ? 0 : 1,
                transitionDelay: "120ms",
              }}
            >
              <path
                d="M 33 52 C 33 46 67 46 67 52 C 67 58 33 58 33 52 Z"
                fill="none"
                stroke="#092817"
                strokeWidth="5"
              />
              <path
                d="M 33 54 V 62 C 33 68 67 68 67 62 V 54"
                fill="none"
                stroke="#092817"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 33 65 V 73 C 33 79 67 79 67 73 V 65"
                fill="none"
                stroke="#092817"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Pieza 3: Base Verde Lima del Cilindro (entra desde abajo con rebote y glow) */}
            <path
              d="M 33 76 V 84 C 33 90 67 90 67 84 V 76"
              fill="none"
              stroke="#65a30d"
              strokeWidth="5.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#splash-glow)"
              className="transition-all duration-850 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={{
                transformOrigin: "50px 80px",
                transform: stage === 0 ? "translateY(55px) scale(0.5)" : "translateY(0) scale(1)",
                opacity: stage === 0 ? 0 : 1,
                transitionDelay: "180ms",
              }}
            />

            {/* Pieza 4: La Hoja Germinando (emerge y rota suavemente desde el corazón de la BD) */}
            <g
              className="transition-all duration-900 cubic-bezier(0.34, 1.56, 0.64, 1)"
              style={{
                transformOrigin: "50px 60px",
                transform: stage === 0 ? "scale(0) rotate(-40deg)" : "scale(1) rotate(0deg)",
                opacity: stage === 0 ? 0 : 1,
                transitionDelay: "260ms",
              }}
            >
              <path
                d="M 50 63 
                   V 44 
                   C 50 31 63 28 65 38 
                   C 67 48 54 53 50 63 Z"
                fill="url(#leafGrad)"
              />
              <path
                d="M 50 49 C 54 44 59 40 62 39"
                fill="none"
                stroke="#092817"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* GRUPO TEXTO: "Agro" y "Cloud" */}
          <g transform="translate(135, 96)">
            {/* Palabra "Agro" (entra desde la izquierda) */}
            <text
              x="0"
              y="0"
              fill="#0a2a18"
              fontFamily="system-ui, -apple-system, 'Inter', Roboto, sans-serif"
              fontSize="68"
              fontWeight="900"
              letterSpacing="-2"
              className="transition-all duration-800 cubic-bezier(0.16, 1, 0.3, 1)"
              style={{
                transform: stage === 0 ? "translateX(-35px)" : "translateX(0)",
                opacity: stage === 0 ? 0 : 1,
                transitionDelay: "200ms",
              }}
            >
              Agro
            </text>

            {/* Palabra "Cloud" (entra desde la derecha contorneada en verde lima vivo) */}
            <text
              x="164"
              y="0"
              fill="none"
              stroke="#65a30d"
              strokeWidth="4.2"
              strokeLinejoin="round"
              fontFamily="system-ui, -apple-system, 'Inter', Roboto, sans-serif"
              fontSize="68"
              fontWeight="500"
              letterSpacing="-1.5"
              filter="url(#splash-glow)"
              className="transition-all duration-800 cubic-bezier(0.16, 1, 0.3, 1)"
              style={{
                transform: stage === 0 ? "translateX(45px)" : "translateX(0)",
                opacity: stage === 0 ? 0 : 1,
                transitionDelay: "280ms",
              }}
            >
              Cloud
            </text>
          </g>
        </svg>

        {/* Subtítulo dinámico durante el ensamble */}
        <div
          className={`mt-4 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-800/80 transition-all duration-500 ${
            stage === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-ping" />
          <span>Database as a Service para el Agro</span>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from "react";
import { instances, incidents, INITIAL_DOCS } from "../../data/shared";
import { CLIENTS_DATA, ADMIN_TEMPLATES } from "../../data/admin";

export interface SearchResultItem {
  id: string;
  type: "instancia" | "cliente" | "usuario" | "plan" | "plantilla" | "incidencia" | "documento";
  title: string;
  subtitle: string;
  category: string;
  targetPage: string;
}

export function GlobalSearchModal({
  query,
  onQueryChange,
  onNavigate,
  placeholder = "Buscar en todo el sistema...",
  role,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onNavigate?: (targetPage: string) => void;
  placeholder?: string;
  role?: "admin" | "soporte" | "cliente";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  // Cerrar el dropdown al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Search logic across system entities
  const q = query.trim().toLowerCase();

  const results: SearchResultItem[] = [];

  if (q.length > 0) {
    // Search Instancias
    instances.forEach((inst) => {
      if (
        inst.nombre.toLowerCase().includes(q) ||
        inst.cliente.toLowerCase().includes(q) ||
        inst.tipo.toLowerCase().includes(q)
      ) {
        results.push({
          id: `inst-${inst.nombre}`,
          type: "instancia",
          title: inst.nombre,
          subtitle: `${inst.cliente} · ${inst.version} · ${inst.estado}`,
          category: "Instancias DB",
          targetPage: "instancias",
        });
      }
    });

    // Search Clientes (only for admin/soporte)
    if (role !== "cliente") {
      CLIENTS_DATA.forEach((cli) => {
        if (
          cli.nombre.toLowerCase().includes(q) ||
          cli.responsable.toLowerCase().includes(q) ||
          cli.tipo.toLowerCase().includes(q)
        ) {
          results.push({
            id: `cli-${cli.id}`,
            type: "cliente",
            title: cli.nombre,
            subtitle: `${cli.tipo} · Responsable: ${cli.responsable} · ${cli.plan}`,
            category: "Clientes",
            targetPage: "clientes",
          });
        }
      });
    }

    // Search Plantillas DB
    ADMIN_TEMPLATES.forEach((p) => {
      if (
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.schema.some((t) => t.toLowerCase().includes(q))
      ) {
        results.push({
          id: `pl-${p.id}`,
          type: "plantilla",
          title: p.nombre,
          subtitle: `${p.descripcion} · Tablas: ${p.schema.join(", ")}`,
          category: "Plantillas DB",
          targetPage: "plantillas",
        });
      }
    });

    // Search Planes
    const staticPlans = [
      { nombre: "Finca", precio: "Q25", storage: "10 GB", instancias: "1" },
      { nombre: "Productor", precio: "Q60", storage: "50 GB", instancias: "1" },
      { nombre: "Agro Pro", precio: "Q120", storage: "100 GB", instancias: "2" },
      { nombre: "Agro Empresarial", precio: "Q250", storage: "200 GB", instancias: "5" },
    ];
    staticPlans.forEach((plan) => {
      if (plan.nombre.toLowerCase().includes(q) || plan.precio.toLowerCase().includes(q)) {
        results.push({
          id: `plan-${plan.nombre}`,
          type: "plan",
          title: `Plan ${plan.nombre}`,
          subtitle: `${plan.precio}/mes · ${plan.storage} · ${plan.instancias} instancias`,
          category: "Planes",
          targetPage: role === "cliente" ? "plan" : "suscripciones",
        });
      }
    });

    // Search Incidencias / Soporte
    incidents.forEach((inc) => {
      if (
        inc.id.toLowerCase().includes(q) ||
        inc.asunto.toLowerCase().includes(q) ||
        inc.cliente.toLowerCase().includes(q) ||
        inc.estado.toLowerCase().includes(q)
      ) {
        results.push({
          id: `inc-${inc.id}`,
          type: "incidencia",
          title: `${inc.id}: ${inc.asunto}`,
          subtitle: `${inc.cliente} · Estado: ${inc.estado} · Prioridad: ${inc.prioridad}`,
          category: "Incidencias / Soporte",
          targetPage: role === "cliente" ? "soporte" : "incidencias",
        });
      }
    });

    // Search Documentación
    INITIAL_DOCS.forEach((doc) => {
      if (
        doc.titulo.toLowerCase().includes(q) ||
        doc.descripcion.toLowerCase().includes(q) ||
        doc.categoria.toLowerCase().includes(q)
      ) {
        results.push({
          id: `doc-${doc.id}`,
          type: "documento",
          title: doc.titulo,
          subtitle: `${doc.categoria} · ${doc.descripcion}`,
          category: "Documentación",
          targetPage: "documentacion",
        });
      }
    });
  }

  const handleSelectResult = (item: SearchResultItem) => {
    // 1. Cerrar dropdown inmediatamente y limpiar query
    setIsOpen(false);
    onQueryChange("");
    if (inputRef.current) {
      inputRef.current.blur();
    }

    // 2. Ejecutar la navegación de forma desacoplada
    if (onNavigate) {
      setTimeout(() => {
        onNavigate(item.targetPage);
      }, 0);
    }
  };

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="pl-9 pr-8 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-400 w-full transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-sm leading-none"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
          <div className="p-3 bg-gray-50/70 dark:bg-slate-800/70 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Resultados en la plataforma ({results.length})
            </span>
            <span className="text-[10px] text-gray-400">Presiona para ir a la sección</span>
          </div>

          {results.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No se encontraron coincidencias para &quot;{query}&quot;
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onMouseDown={(e) => {
                  // Prevenir pérdida de foco prematura antes del click
                  e.preventDefault();
                }}
                onClick={() => handleSelectResult(item)}
                className="p-3 hover:bg-lime-50/50 dark:hover:bg-lime-950/20 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-gray-900 dark:text-slate-100 group-hover:text-lime-700 dark:group-hover:text-lime-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-300 group-hover:text-lime-600 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

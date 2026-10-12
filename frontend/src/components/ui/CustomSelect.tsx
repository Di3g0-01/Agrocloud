import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  badge?: string;
}

export interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  isDark?: boolean;
  size?: "xs" | "sm" | "md";
  align?: "left" | "right";
  id?: string;
  ariaLabel?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  disabled = false,
  className = "",
  dropdownClassName = "",
  isDark = false,
  size = "sm",
  align = "left",
  id,
  ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    xs: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
    sm: "px-3 py-1.5 text-xs rounded-xl gap-2",
    md: "px-3.5 py-2 text-sm rounded-xl gap-2.5",
  };

  const optionSizeClasses = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-xs",
    md: "px-3.5 py-2.5 text-sm",
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className ? className : "w-full sm:w-auto"}`}
      id={id ? `${id}-container` : undefined}
    >
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between font-medium border transition-all duration-150 outline-none select-none w-full max-w-full ${
          sizeClasses[size]
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700"
            : isDark
            ? `bg-slate-800 text-slate-100 border-slate-700 hover:border-slate-600 ${
                isOpen ? "ring-2 ring-lime-400/80 border-lime-400" : ""
              }`
            : `bg-white text-gray-800 border-gray-300 hover:border-gray-400 ${
                isOpen ? "ring-2 ring-lime-400 border-lime-500 shadow-sm" : ""
              }`
        }`}
      >
        <span className="flex items-center gap-2 truncate min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-lime-600 dark:text-lime-400">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate min-w-0">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-lime-100 text-lime-800 font-semibold dark:bg-lime-950 dark:text-lime-300 flex-shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 text-gray-400 transition-transform duration-200 ml-1.5 ${
            isOpen ? "transform rotate-180 text-lime-600 dark:text-lime-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute ${align === "right" ? "right-0" : "left-0"} z-50 mt-1.5 min-w-full max-w-xs sm:max-w-sm rounded-xl border shadow-xl overflow-hidden backdrop-blur-sm transition-all duration-150 ${
            isDark
              ? "bg-slate-800/95 border-slate-700 shadow-black/40 text-slate-100"
              : "bg-white/95 border-gray-200 shadow-gray-400/20 text-gray-900"
          } ${dropdownClassName}`}
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-left transition-colors font-medium ${
                    optionSizeClasses[size]
                  } ${
                    isSelected
                      ? isDark
                        ? "bg-lime-950/60 text-lime-300 font-semibold"
                        : "bg-lime-50 text-lime-950 font-semibold"
                      : isDark
                      ? "hover:bg-slate-700/70 text-slate-200 hover:text-white"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {opt.icon && (
                      <span
                        className={`flex-shrink-0 ${
                          isSelected
                            ? "text-lime-600 dark:text-lime-400"
                            : "text-gray-400 dark:text-slate-400"
                        }`}
                      >
                        {opt.icon}
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{opt.label}</span>
                        {opt.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-lime-100 text-lime-800 font-semibold dark:bg-lime-950 dark:text-lime-300">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.description && (
                        <p
                          className={`text-[10px] font-normal mt-0.5 truncate ${
                            isDark ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 ml-2 flex-shrink-0 text-lime-600 dark:text-lime-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

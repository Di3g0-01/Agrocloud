import { useState, useRef, useEffect } from "react";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  isDark?: boolean;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className = "",
  isDark = false,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full font-medium px-3.5 py-2 rounded-xl text-sm flex items-center justify-between gap-2 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-lime-400 border ${
          isDark
            ? "bg-slate-900 border-slate-800 text-white hover:border-slate-700"
            : "bg-white border-gray-300 text-gray-900 hover:border-lime-400"
        } ${isOpen ? "ring-2 ring-lime-400 border-lime-400" : ""}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isDark ? "text-slate-400" : "text-gray-500"} ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-1.5 z-50 rounded-xl shadow-xl py-1.5 overflow-hidden max-h-60 overflow-y-auto min-w-full w-max max-w-xs border ${
          isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-gray-200 text-gray-700"
        }`}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-left text-sm font-medium transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-lime-400 text-gray-900 font-bold"
                    : isDark
                    ? "text-slate-200 hover:bg-slate-800"
                    : "text-gray-700 hover:bg-lime-50 hover:text-gray-900"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-gray-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

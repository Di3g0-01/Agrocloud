import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo Oficial */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src="/agrocloud-logo.svg" 
            alt="AgroCloud" 
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm" 
          />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`hover:text-emerald-400 transition-colors ${currentView === 'landing' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Inicio
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('planes-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-emerald-400 transition-colors"
          >
            Planes y Precios
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('modulos-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-emerald-400 transition-colors"
          >
            Módulos Agrícolas
          </button>
        </div>

        {/* User / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (user.rol === 'ADMIN') onNavigate('admin');
                  else if (user.rol === 'SOPORTE') onNavigate('soporte');
                  else onNavigate('cliente');
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel {user.rol}</span>
              </button>
              <button
                onClick={logout}
                title="Cerrar Sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 hover:brightness-110 transition-all shadow-md shadow-emerald-500/20"
              >
                <span>Comenzar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

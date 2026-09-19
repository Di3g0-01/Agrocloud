import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, Sprout, LayoutDashboard, ChevronRight } from 'lucide-react';
import type { UserRole } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, logout, setSimulatedRole } = useAuth();

  const handleRoleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setSimulatedRole(role);
    if (role === 'ADMIN') onNavigate('admin');
    else if (role === 'SOPORTE') onNavigate('soporte');
    else onNavigate('cliente');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
              AgroCloud
            </span>
            <span className="block text-[10px] font-semibold text-emerald-400/90 tracking-wider uppercase">
              DBaaS Agrícola
            </span>
          </div>
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
          {/* Quick Role Switcher for Testing */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-medium">Rol:</span>
            <select
              value={user?.rol || 'CLIENTE'}
              onChange={handleRoleSwitch}
              className="bg-transparent text-emerald-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="CLIENTE" className="bg-slate-900 text-slate-200">Cliente (Finca)</option>
              <option value="ADMIN" className="bg-slate-900 text-slate-200">Administrador</option>
              <option value="SOPORTE" className="bg-slate-900 text-slate-200">Soporte Técnico</option>
            </select>
          </div>

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

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, User as UserIcon, Building, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import type { UserRole } from '../types';

interface LoginPageProps {
  onNavigateHome: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onLoginSuccess }) => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Form states
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('cliente@finca.gt');
  const [password, setPassword] = useState<string>('password123');
  const [empresa, setEmpresa] = useState<string>('Finca Los Pinos');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (isRegistering) {
        if (!nombre || !email || !password) {
          setErrorMsg('Por favor completa los campos obligatorios.');
          setSubmitting(false);
          return;
        }
        const role = await register(nombre, email, password, empresa);
        onLoginSuccess(role);
      } else {
        if (!email || !password) {
          setErrorMsg('Por favor ingresa tu correo y contraseña.');
          setSubmitting(false);
          return;
        }
        const role = await login(email, password);
        onLoginSuccess(role);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error de autenticación. Verifica tus credenciales.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickAccount = (type: 'cliente' | 'admin' | 'soporte') => {
    setIsRegistering(false);
    if (type === 'cliente') {
      setEmail('cliente@finca.gt');
      setPassword('password123');
    } else if (type === 'admin') {
      setEmail('admin@agrocloud.gt');
      setPassword('admin123');
    } else if (type === 'soporte') {
      setEmail('soporte@agrocloud.gt');
      setPassword('soporte123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Back Button */}
      <div className="max-w-md w-full mx-auto mb-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-0.5 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sprout className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
          {isRegistering ? 'Crear Cuenta en AgroCloud' : 'Iniciar Sesión'}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Acceso seguro mediante tokens JWT y Spring Security
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Diego Ovalle"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa / Finca</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      placeholder="Finca Los Pinos"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@finca.gt"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Procesando...' : isRegistering ? 'Crear Mi Cuenta' : 'Ingresar a la Plataforma'}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">Acceso rápido para demostración:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickAccount('cliente')}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-semibold text-emerald-400 hover:border-emerald-500 transition-colors"
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('admin')}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-semibold text-amber-400 hover:border-amber-500 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('soporte')}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-semibold text-sky-400 hover:border-sky-500 transition-colors"
              >
                Soporte
              </button>
            </div>
          </div>

          {/* Toggle Register / Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-medium text-emerald-400 hover:underline"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

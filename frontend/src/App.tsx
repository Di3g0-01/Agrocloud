import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ClienteDashboard } from './pages/ClienteDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SoporteDashboard } from './pages/SoporteDashboard';
import type { Plan, UserRole } from './types';
import { contratarPlan } from './api/suscripcionesApi';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const { isAuthenticated } = useAuth();

  const handleSelectPlan = async (plan: Plan) => {
    if (!isAuthenticated) {
      setCurrentView('login');
      return;
    }
    try {
      await contratarPlan(plan.id, plan.nombre, plan.precioMensual);
      alert(`¡Felicidades! Has contratado exitosamente el plan ${plan.nombre} (Q${plan.precioMensual}/mes).`);
      setCurrentView('cliente');
    } catch (err) {
      console.error(err);
      alert('Error al procesar la suscripción.');
    }
  };

  const handleLoginSuccess = (role: UserRole) => {
    if (role === 'ADMIN') setCurrentView('admin');
    else if (role === 'SOPORTE') setCurrentView('soporte');
    else setCurrentView('cliente');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar currentView={currentView} onNavigate={(view) => setCurrentView(view)} />

      <main className="flex-grow">
        {currentView === 'landing' && (
          <LandingPage
            onSelectPlan={handleSelectPlan}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onNavigateHome={() => setCurrentView('landing')}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentView === 'cliente' && <ClienteDashboard />}

        {currentView === 'admin' && <AdminDashboard />}

        {currentView === 'soporte' && <SoporteDashboard />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

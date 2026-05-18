import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/landing/LandingPage';
import CustomerDashboard from './components/dashboards/CustomerDashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/home/Dashboard';
import SymptomChecker from './components/symptoms/SymptomChecker';
import DoctorList from './components/doctors/DoctorList';
import EmergencyServices from './components/emergency/EmergencyServices';
import './lib/i18n';
import SymptomAnalysisApp from './components/symptoms/SymptomAnalysisApp';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'customer':
        return <CustomerDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'symptoms':
        return <SymptomAnalysisApp />;
      case 'doctors':
        return <DoctorList />;
      case 'emergency':
        return <EmergencyServices />;
      case 'records':
        return (
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Health Records
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your consultation history and health records here.
            </p>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile and preferences here.
            </p>
          </div>
        );
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/dashboard" element={renderDashboard()} />
            <Route path="/app/*" element={renderContent()} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/QuickConsultant" element={<SymptomAnalysisApp />} />
            <Route path="/EmergencyServices" element={<EmergencyServices />} />
          </Routes>
        </main>
      </div>

      {/* PWA Features */}
      <div id="install-prompt" className="hidden fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Install Rural HealthCare</h3>
            <p className="text-sm opacity-90">Get quick access to healthcare services</p>
          </div>
          <button id="install-button" className="bg-white text-blue-600 px-4 py-2 rounded font-medium">
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppContent />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
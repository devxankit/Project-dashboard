import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Login Page */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        
        {/* Admin Dashboard */}
        <Route 
          path="/dashboard/*" 
          element={user ? (
            <AppProvider>
              <Dashboard />
            </AppProvider>
          ) : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
            fontSize: '14px',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#6366f1', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </AuthProvider>
  );
}

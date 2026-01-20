// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Importación de Componentes y Páginas
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Shipments from './pages/Shipments';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Returns from './pages/Returns';

// 👇 1. IMPORTAR LAS NUEVAS PÁGINAS
import POS from './pages/POS';
import Sales from './pages/Sales';

// --- COMPONENTE DE PROTECCIÓN DE RUTAS ---
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// --- APP PRINCIPAL ---
function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/inventory" 
          element={
            <PrivateRoute>
              <Layout>
                <Inventory />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* 👇 2. RUTA PARA VENDER (POS) */}
        <Route 
          path="/pos" 
          element={
            <PrivateRoute>
              <Layout>
                <POS />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* 👇 3. RUTA PARA HISTORIAL DE VENTAS (ADMIN) */}
        <Route 
          path="/sales" 
          element={
            <PrivateRoute>
              <Layout>
                <Sales />
              </Layout>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/categories" 
          element={
            <PrivateRoute>
              <Layout>
                <Categories />
              </Layout>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/users" 
          element={
            <PrivateRoute>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/shipments" 
          element={
            <PrivateRoute>
              <Layout>
                <Shipments />
              </Layout>
            </PrivateRoute>
          } 
        />

         <Route 
          path="/returns" 
          element={
            <PrivateRoute>
              <Layout>
                <Returns />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
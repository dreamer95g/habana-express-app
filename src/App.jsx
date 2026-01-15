// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Importación de Componentes y Páginas
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Settings from './pages/Settings';

// --- COMPONENTE DASHBOARD (Temporal, luego tendrá su propio archivo) ---
const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Panel Principal</h1>
        <p className="text-gray-500">Resumen de actividad de la tienda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ventas de Hoy</h3>
          <div className="flex items-end mt-2">
            <p className="text-3xl font-bold text-gray-800">$1,240</p>
            <span className="text-green-500 text-sm font-medium ml-2 mb-1">USD</span>
          </div>
          <span className="text-green-600 text-xs font-medium mt-2 inline-block bg-green-50 px-2 py-1 rounded-lg">
            ↑ 12% vs ayer
          </span>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Productos Activos</h3>
          <div className="flex items-end mt-2">
            <p className="text-3xl font-bold text-gray-800">342</p>
            <span className="text-gray-400 text-sm ml-2 mb-1">SKUs</span>
          </div>
          <span className="text-blue-600 text-xs font-medium mt-2 inline-block bg-blue-50 px-2 py-1 rounded-lg">
            Inventario Saludable
          </span>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Tasa del Día</h3>
          <div className="flex items-end mt-2">
            <p className="text-3xl font-bold text-blue-600">320.00</p>
            <span className="text-gray-500 text-sm font-medium ml-2 mb-1">CUP</span>
          </div>
          <span className="text-gray-500 text-xs font-medium mt-2 inline-block bg-gray-100 px-2 py-1 rounded-lg">
            Actualizado 8:00 AM
          </span>
        </div>
      </div>
    </div>
  );
};

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

        {/* Rutas Privadas (Dentro del Layout) */}
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
          path="/settings" 
          element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* Aquí irás agregando más rutas en el futuro (ej: /pos, /inventory) 
            siguiendo el mismo patrón de <PrivateRoute><Layout><Pagina /></Layout></PrivateRoute>
        */}

        {/* Ruta por defecto (Redirige al inicio si no existe la página) */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </>
  );
}

export default App;
// src/pages/Dashboard.jsx
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '../graphql/reports';
import { useAuth } from '../context/AuthContext';
import { Loader2, TrendingUp, Package, ShoppingBag, UserCheck, Globe } from 'lucide-react';

// 👇 Importar el nuevo componente
import AdminDashboard from '../components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, { 
      pollInterval: 30000, 
      fetchPolicy: 'network-only' 
  });

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;
  if (error) return <div className="text-red-500 text-center p-10">Error cargando panel.</div>;

  const { exchangeRate, activeProductsCount, totalItemsSold } = data.dashboardStats;
  const isSeller = user.role === 'seller';
  const isAdmin = user.role === 'admin'; // Verificar si es admin

  return (
    <div className="space-y-6 pb-20 px-2 md:px-0">
      
      {/* 1. HEADER SUGERENTE */}
      <div className="text-left border-l-4 border-blue-600 pl-4 py-1">
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
              {isSeller ? `¡A vender, ${user.name.split(' ')[0]}!` : 'Ecosistema Comercial'}
          </h1>
          <p className="text-gray-400 text-sm font-medium">
              Control de Parámetros y Rendimiento Operativo
          </p>
      </div>

      {/* 2. TARJETAS RESUMEN (Color corregido y Layout) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        
        {/* Tasa del Día */}
        <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="z-10 relative">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">Tasa de Mercado</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-800">${exchangeRate}</span>
                <span className="text-xs font-bold text-gray-400">CUP</span>
              </div>
           </div>
           <TrendingUp className="absolute -right-4 -bottom-4 h-24 w-24 text-gray-50 opacity-50" />
        </div>

        {/* Ventas */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[2rem] shadow-lg shadow-blue-100 text-white relative overflow-hidden">
           <div className="z-10 relative">
              <ShoppingBag size={20} className="mb-3" />
              <p className="text-[10px] font-bold uppercase opacity-80">Unidades Vendidas</p>
              <p className="text-3xl font-black">{totalItemsSold}</p>
           </div>
           <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag size={60} /></div>
        </div>

        {/* Stock - COLOR CAMBIADO DE NEGRO A ÍNDIGO SUAVE */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-[2rem] shadow-lg shadow-purple-100 text-white relative overflow-hidden">
           <div className="z-10 relative">
              <Package size={20} className="mb-3" />
              <p className="text-[10px] font-bold uppercase opacity-80">Stock en Catálogo</p>
              <p className="text-3xl font-black">{activeProductsCount}</p>
           </div>
           <div className="absolute top-0 right-0 p-4 opacity-10"><Package size={60} /></div>
        </div>
      </div>

      {isAdmin && (
         <div className="mt-10">
            <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
               <TrendingUp className="text-blue-600"/> Análisis de Crecimiento
            </h2>
            <AdminDashboard />
         </div>
      )}
    </div>
  );
}
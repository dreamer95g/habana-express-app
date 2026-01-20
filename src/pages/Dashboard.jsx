// src/pages/Dashboard.jsx
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '../graphql/reports';
import { useAuth } from '../context/AuthContext'; // Importamos AuthContext para saber el rol
import { Loader2, TrendingUp, Package, ShoppingBag, UserCheck, Globe } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, { 
      pollInterval: 30000, // Actualizar cada 30s
      fetchPolicy: 'network-only' 
  });

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;
  if (error) return <div className="text-red-500 text-center p-10">Error cargando panel.</div>;

  const { exchangeRate, activeProductsCount, totalItemsSold } = data.dashboardStats;
  const isSeller = user.role === 'seller';

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">
                {isSeller ? `Hola, ${user.name}` : 'Panel de Control'}
            </h1>
            <p className="text-gray-500">
                {isSeller ? 'Resumen de tu actividad comercial.' : 'Resumen global del negocio.'}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TARJETA 1: VENTAS (Cambia según rol) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
           <div className="relative z-10">
              <h3 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                 <ShoppingBag size={14}/>
                 {isSeller ? "Mis Ventas Totales" : "Total Global Vendido"}
              </h3>
              <div className="flex items-end">
                <span className="text-4xl font-bold">{totalItemsSold}</span>
                <span className="mb-1.5 ml-2 text-blue-100 text-sm font-medium">unidades</span>
              </div>
           </div>
           {/* Decoración */}
           <ShoppingBag className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white opacity-10 group-hover:scale-110 transition-transform" />
        </div>

        {/* TARJETA 2: STOCK (Cambia según rol) */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
           <div className="relative z-10">
              <h3 className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                 {isSeller ? <UserCheck size={14}/> : <Globe size={14}/>}
                 {isSeller ? "En mi Posesión" : "Catálogo Global Activo"}
              </h3>
              <div className="flex items-end">
                <span className="text-4xl font-bold">{activeProductsCount}</span>
                <span className="mb-1.5 ml-2 text-indigo-100 text-sm font-medium">
                    {isSeller ? 'productos asignados' : 'SKUs en almacén'}
                </span>
              </div>
           </div>
           <Package className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white opacity-10 group-hover:scale-110 transition-transform" />
        </div>

        {/* TARJETA 3: TASA (Igual para todos) */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <TrendingUp size={14}/>
                  Tasa del Día (CUP)
              </h3>
              <div className="flex items-end">
                <span className="text-4xl font-bold">{exchangeRate}</span>
                <span className="mb-1.5 ml-2 text-white/80 text-sm font-medium">x 1 USD</span>
              </div>
              <p className="text-[10px] text-white/60 mt-3">Base para cálculo de precios</p>
           </div>
           <TrendingUp className="absolute right-[-10px] bottom-[-10px] h-28 w-28 text-white opacity-10" />
        </div>

      </div>
    </div>
  );
}
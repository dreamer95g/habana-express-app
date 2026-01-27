// src/components/dashboard/AdminDashboard.jsx
import { useQuery } from '@apollo/client';
import { GET_ADMIN_DASHBOARD } from '../../graphql/reports';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Loader2, TrendingUp, DollarSign, Award, User } from 'lucide-react';

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Formateador de dinero para los tooltips
const formatCurrency = (value) => `$${new Intl.NumberFormat('en-US').format(value)}`;

export default function AdminDashboard() {
  const { data, loading, error } = useQuery(GET_ADMIN_DASHBOARD, { fetchPolicy: 'network-only' });

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;
  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error cargando gráficos: {error.message}</div>;

  // Preparar datos para gráficos
  const chartData = data?.annualReport?.breakdown.map(item => ({
  name: MONTHS[item.month - 1],
  Inversión: item.investment, // Mostrará los 130 del envío
  Ganancia: item.profit,       // Mostrará los 10 de utilidad de las ventas
  ROI: item.roiPercentage
})) || [];

  const topSellers = data?.topSellers || [];

  return (
    <div className="space-y-6">
      
       {/* GRÁFICO 1: COSTO VS INVERSIÓN */}
      <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase mb-6">Inversión vs Ganancia (USD)</h3>
        
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                
                <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 'bold'}} 
                />

                
                
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                
                {/* LÍNEA DE INVERSIÓN: Ahora más visible */}
                <Area type="monotone" dataKey="Inversión" stroke="#ef4444" strokeWidth={3} fill="transparent" />
                
                {/* LÍNEA DE GANANCIA: Con relleno suave */}
                <Area type="monotone" dataKey="Ganancia" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorGanancia)" />
              </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

     {/* GRÁFICO 2: ROI (BARRAS CON VALORES) */}
<div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100">
  <h3 className="text-xs font-black text-gray-400 uppercase mb-6">Retorno sobre Inversión Mensual (%)</h3>
  <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
          
          {/* Forzamos el eje Y a empezar en 0 */}
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fontWeight: 'bold'}} 
            unit="%" 
            domain={[0, 'auto']} 
          />
          
          <Tooltip 
            cursor={{fill: '#f9fafb'}} 
            contentStyle={{ borderRadius: '15px', border: 'none' }} 
            formatter={(value) => [`${value}%`, 'Retorno']}
          />
          
          <Bar 
            dataKey="ROI" 
            fill="#3b82f6" 
            radius={[8, 8, 8, 8]} 
            barSize={20} 
            label={{ 
              position: 'top', 
              fontSize: 10, 
              fontWeight: 'bold', 
              fill: '#3b82f6',
              formatter: (val) => `${val}%` 
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
  </div>
</div>


      {/* 2. SECCIÓN RANKING DE VENDEDORES (Con Fotos) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Award className="mr-2 text-yellow-500" size={20}/> Mejores Vendedores del Año
          </h3>
          
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                          <th className="pb-3 pl-2">Posición / Vendedor</th>
                          <th className="pb-3 text-center">Ítems Vendidos</th>
                          <th className="pb-3 text-right pr-2">Total Generado (USD)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {topSellers.length === 0 ? (
                          <tr><td colSpan="3" className="text-center py-4 text-gray-400">Sin datos aún</td></tr>
                      ) : topSellers.map((seller, idx) => (
                          <tr key={seller.id_user} className="group hover:bg-gray-50 transition-colors">
                              <td className="py-3 pl-2 flex items-center gap-3">
                                  {/* Medalla de Posición */}
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-blue-100 text-blue-600'}`}>
                                      {idx + 1}
                                  </div>

                                  {/* 👇 FOTO DEL VENDEDOR */}
                                  <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                      {seller.photo_url ? (
                                          <img src={seller.photo_url} alt={seller.name} className="h-full w-full object-cover" />
                                      ) : (
                                          <User className="h-full w-full p-2 text-gray-400" />
                                      )}
                                  </div>

                                  <span className="font-bold text-gray-700 text-sm">{seller.name}</span>
                              </td>
                              <td className="py-3 text-center">
                                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                                      {seller.items_sold} unid.
                                  </span>
                              </td>
                              <td className="py-3 text-right pr-2 font-mono font-bold text-gray-600">
                                  ${new Intl.NumberFormat('en-US').format(seller.total_sales_usd)}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  );
}
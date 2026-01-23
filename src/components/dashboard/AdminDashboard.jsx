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
    name: MONTHS[item.month - 1], // Convertir 1 -> Ene
    Inversión: item.investment,
    Ganancia: item.profit,
    ROI: item.roiPercentage
  })) || [];

  const topSellers = data?.topSellers || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. SECCIÓN GRÁFICOS FINANCIEROS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: COSTO VS GANANCIA (Líneas / Área) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <DollarSign className="mr-2 text-green-600" size={20}/> Costo VS Inversión {new Date().getFullYear()}
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="Inversión" stroke="#ef4444" fillOpacity={1} fill="url(#colorInv)" strokeWidth={2} />
                <Area type="monotone" dataKey="Ganancia" stroke="#16a34a" fillOpacity={1} fill="url(#colorGanancia)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Comparativa de Costos (Envíos+Mercancía) vs Ganancia Neta Real.</p>
        </div>

        {/* GRÁFICO 2: ROI % (Barras) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" size={20}/> Retorno de Inversión (ROI)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} unit="%" />
                <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ROI" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Porcentaje de ganancia sobre lo invertido por mes.</p>
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
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
// Asegúrate de que en graphql/sales.js tengas exportado CANCEL_SALE
import { GET_SALES, UPDATE_SALE, CANCEL_SALE } from '../graphql/sales';
import { Search, FileText, Edit2, Ban, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import SaleModal from '../components/sales/SaleModal';
import toast from 'react-hot-toast';

export default function Sales() {
  const [search, setSearch] = useState('');
  const [editingSale, setEditingSale] = useState(null);
  
  // 1. Carga de Datos (Polling cada 5s para ver actualizaciones de otros usuarios)
  const { data, loading, error } = useQuery(GET_SALES, { 
    pollInterval: 5000,
    fetchPolicy: 'network-only' 
  });
  
  // 2. Mutación de Actualizar (Editar notas, precio, etc.)
  const [updateSale, { loading: updating }] = useMutation(UPDATE_SALE, {
     refetchQueries: [{ query: GET_SALES }]
  });
  
  // 3. Mutación de Anular (Reemplaza al antiguo Delete)
  const [cancelSale] = useMutation(CANCEL_SALE, {
     refetchQueries: [{ query: GET_SALES }]
  });

  // Filtros de Búsqueda (Vendedor, Teléfono o ID)
  const sales = data?.sales?.filter(s => 
     s.seller.name.toLowerCase().includes(search.toLowerCase()) || 
     s.buyer_phone.includes(search) ||
     s.id_sale.toString().includes(search)
  ) || [];

  // --- HANDLERS ---

  const handleCancel = async (id) => {
      if (window.confirm("⚠️ ¿ANULAR esta venta?\n\nEl stock será devuelto automáticamente al vendedor y al almacén. Esta acción es irreversible.")) {
          try {
              await cancelSale({ variables: { id_sale: id } });
              toast.success("Venta anulada correctamente.");
          } catch (e) {
              console.error(e);
              toast.error(e.message || "Error al anular venta");
          }
      }
  };

  const handleSave = async (formData) => {
      try {
          await updateSale({
              variables: {
                  id_sale: editingSale.id_sale,
                  input: {
                      total_cup: parseFloat(formData.total_cup),
                      exchange_rate: parseFloat(formData.exchange_rate),
                      buyer_phone: formData.buyer_phone,
                      payment_method: formData.payment_method,
                      notes: formData.notes
                  }
              }
          });
          toast.success("Venta actualizada");
          setEditingSale(null);
      } catch (e) {
          toast.error(e.message);
      }
  };

  // --- RENDERS DE ESTADO ---

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-blue-600"/></div>;
  
  if (error) return (
    <div className="flex flex-col items-center justify-center p-10 text-red-500">
        <AlertCircle className="h-10 w-10 mb-2"/>
        <p className="font-bold">Error cargando ventas</p>
        <p className="text-sm">{error.message}</p>
        <p className="text-xs mt-2 text-gray-500">Intenta reiniciar el backend o ejecutar 'npx prisma db push'</p>
    </div>
  );

  return (
    <div className="pb-20 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FileText className="mr-3 text-blue-600"/> Historial de Ventas
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Registro de operaciones y anulaciones.
                </p>
            </div>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
             <div className="relative">
                 <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5"/>
                 <input 
                   type="text" 
                   placeholder="Buscar por ID, Vendedor o Teléfono Cliente..." 
                   className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   value={search} onChange={e => setSearch(e.target.value)}
                 />
             </div>
        </div>

        {/* LISTA DE VENTAS */}
        <div className="space-y-3">
            {sales.length === 0 && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <p>No se encontraron ventas con ese criterio.</p>
                </div>
            )}

            {sales.map(sale => {
                const isCancelled = sale.status === 'CANCELLED';

                return (
                    <div 
                        key={sale.id_sale} 
                        className={`p-4 rounded-xl shadow-sm border transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 group 
                        ${isCancelled ? 'bg-red-50/50 border-red-100 opacity-80' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'}`}
                    >
                        
                        {/* 1. INFO IZQUIERDA: ID, Vendedor, Fecha */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 
                                ${isCancelled ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-600'}`}>
                                {isCancelled ? <Ban size={20}/> : sale.seller.name.charAt(0)}
                            </div>
                            
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-gray-400 font-bold">#{sale.id_sale}</span>
                                    {isCancelled && (
                                        <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-red-200">
                                            Anulada
                                        </span>
                                    )}
                                </div>
                                <p className={`font-bold leading-tight ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                    {sale.seller.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(Number(sale.sale_date)).toLocaleDateString()} • {new Date(Number(sale.sale_date)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>

                        {/* 2. INFO CENTRO: Dinero */}
                        <div className="text-left md:text-center w-full md:w-auto pl-16 md:pl-0">
                            <p className={`text-xl font-extrabold ${isCancelled ? 'text-gray-400 line-through decoration-red-400' : 'text-blue-600'}`}>
                                ${sale.total_cup} <span className="text-xs font-normal text-gray-400">CUP</span>
                            </p>
                            <div className="flex items-center md:justify-center gap-2 text-xs text-gray-500 font-medium">
                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                    {sale.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
                                </span>
                                <span className="text-gray-300">|</span>
                                <span>Tasa: {sale.exchange_rate}</span>
                            </div>
                        </div>

                        {/* 3. INFO DERECHA: Cliente & Botones */}
                        <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-16 md:pl-0">
                            <div className="text-left md:text-right">
                                <p className="font-mono font-bold text-gray-700">{sale.buyer_phone}</p>
                                <p className="text-xs text-gray-400 truncate max-w-[120px]" title={sale.notes}>
                                    {sale.notes || "—"}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {/* Solo mostramos botones si NO está cancelada */}
                                {!isCancelled ? (
                                    <>
                                        <button 
                                            onClick={() => setEditingSale(sale)}
                                            className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Editar detalles (Notas, Método Pago)"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleCancel(sale.id_sale)}
                                            className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Anular Venta (Devolver Stock)"
                                        >
                                            <Ban size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-400 font-bold italic select-none">
                                        Cerrada
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>

        {/* MODAL DE EDICIÓN */}
        <SaleModal 
            isOpen={!!editingSale}
            onClose={() => setEditingSale(null)}
            saleToEdit={editingSale}
            onSave={handleSave}
            isSaving={updating}
        />
    </div>
  );
}
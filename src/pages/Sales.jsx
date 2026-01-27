// src/pages/Sales.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SALES, UPDATE_SALE, CANCEL_SALE } from '../graphql/sales';
import { Search, FileText, Edit2, Ban, Loader2, AlertCircle, Calendar, User, Phone, DollarSign, CreditCard } from 'lucide-react';
import SaleModal from '../components/sales/SaleModal';
import TablePagination from '../components/ui/TablePagination';
import toast from 'react-hot-toast';

export default function Sales() {
  const [search, setSearch] = useState('');
  const [editingSale, setEditingSale] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, loading, error } = useQuery(GET_SALES, { 
    pollInterval: 10000,
    fetchPolicy: 'network-only' 
  });
  
  const [updateSale, { loading: updating }] = useMutation(UPDATE_SALE, {
     refetchQueries: [{ query: GET_SALES }]
  });
  
  const [cancelSale] = useMutation(CANCEL_SALE, {
     refetchQueries: [{ query: GET_SALES }]
  });

  const sales = data?.sales?.filter(s => 
     s.seller.name.toLowerCase().includes(search.toLowerCase()) || 
     s.buyer_phone.includes(search) ||
     s.id_sale.toString().includes(search)
  ) || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = sales.slice(indexOfFirstItem, indexOfLastItem);

  const handleCancel = async (id) => {
      if (window.confirm("⚠️ ¿ANULAR esta venta? El stock volverá al inventario.")) {
          try {
              await cancelSale({ variables: { id_sale: id } });
              toast.success("Venta anulada");
          } catch (e) {
              toast.error(e.message);
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-blue-600"/></div>;
  
  if (error) return (
    <div className="flex flex-col items-center justify-center p-10 text-red-500">
        <AlertCircle className="h-10 w-10 mb-2"/>
        <p className="font-bold">Error cargando ventas</p>
    </div>
  );

  return (
    <div className="pb-20 max-w-7xl mx-auto px-2 md:px-0">
        
        {/* --- HEADER CORREGIDO --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="text-left"> {/* Aseguramos alineación izquierda */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                    <FileText className="mr-3 text-blue-600" size={28}/> Historial de Ventas
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Registro de operaciones y control de ingresos.
                </p>
            </div>
        </div>

        {/* BUSCADOR ESTILO CATEGORIAS */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ID, vendedor o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* LISTA DE VENTAS MEJORADA */}
        <div className="space-y-4">
            {currentSales.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p>No se encontraron registros.</p>
                </div>
            )}

            {currentSales.map(sale => {
                const isCancelled = sale.status === 'CANCELLED';
                const date = new Date(Number(sale.sale_date));

                return (
                    <div 
                        key={sale.id_sale} 
                        className={`relative overflow-hidden bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md 
                        ${isCancelled ? 'border-red-100 bg-red-50/30' : 'border-gray-100 hover:border-blue-200'}`}
                    >
                        {/* Indicador lateral de estado */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCancelled ? 'bg-red-400' : 'bg-blue-500'}`}></div>

                        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            {/* Bloque 1: Identificación y Vendedor */}
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow-sm
                                    ${isCancelled ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {isCancelled ? <Ban size={20}/> : <User size={20}/>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID #{sale.id_sale}</span>
                                        {isCancelled && (
                                            <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm">
                                                Anulada
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`font-bold text-lg leading-tight ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {sale.seller.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <Calendar size={12} />
                                        <span>{date.toLocaleDateString()}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bloque 2: Monto y Pago (Muy visual en móvil) */}
                            <div className="flex items-center justify-between md:justify-center md:flex-col border-y md:border-y-0 py-3 md:py-0 border-gray-50">
                                <div className="text-left md:text-center">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block md:mb-1">Total Cobrado</span>
                                    <p className={`text-2xl font-black ${isCancelled ? 'text-gray-300 line-through' : 'text-blue-600'}`}>
                                        ${new Intl.NumberFormat().format(sale.total_cup)}<span className="text-xs ml-1">CUP</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 md:mt-1">
                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${sale.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {sale.payment_method === 'cash' ? <DollarSign size={10}/> : <CreditCard size={10}/>}
                                        {sale.payment_method === 'cash' ? 'EFECTIVO' : 'TRANSF.'}
                                    </span>
                                </div>
                            </div>

                            {/* Bloque 3: Cliente y Acciones */}
                            <div className="flex items-center justify-between md:gap-6">
                                <div className="text-left md:text-right">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Cliente</span>
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-gray-700">
                                        <Phone size={12} className="text-gray-400"/>
                                        {sale.buyer_phone}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {!isCancelled ? (
                                        <>
                                            <button 
                                                onClick={() => setEditingSale(sale)}
                                                className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all active:scale-90"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleCancel(sale.id_sale)}
                                                className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-90"
                                            >
                                                <Ban size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            Archivo
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
        
        <TablePagination 
            currentPage={currentPage}
            totalItems={sales.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
        />

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
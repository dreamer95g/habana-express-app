import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SALES, CREATE_RETURN } from '../graphql/sales';
import { Search, RotateCcw, Package, AlertTriangle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Returns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  
  // Modal State
  const [returnItem, setReturnItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');
  const [returnToStock, setReturnToStock] = useState(true);

  // Data
  const { data, loading } = useQuery(GET_SALES);
  const [createReturn, { loading: processing }] = useMutation(CREATE_RETURN);

  // Filtrar solo ventas completadas
  const sales = data?.sales?.filter(s => 
    s.status === 'COMPLETED' && 
    (s.id_sale.toString().includes(searchTerm) || s.buyer_phone.includes(searchTerm))
  ) || [];

  const handleOpenModal = (product, saleId) => {
      setReturnItem({ ...product, saleId });
      setQty(1);
      setReason('');
      setReturnToStock(true);
  };

  const handleProcessReturn = async () => {
      if (!reason) return toast.error("Escribe un motivo");
      
      try {
          await createReturn({
              variables: {
                  saleId: returnItem.saleId,
                  productId: returnItem.id_product,
                  quantity: parseInt(qty),
                  reason,
                  returnToStock
              }
          });
          toast.success("Devolución procesada");
          setReturnItem(null);
      } catch (e) {
          toast.error(e.message);
      }
  };

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <RotateCcw className="mr-3 text-blue-600" /> Gestión de Devoluciones
      </h1>

      {/* 1. BUSCADOR DE VENTAS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <label className="text-sm font-bold text-gray-700 mb-2 block">Buscar Venta (ID o Teléfono Cliente)</label>
          <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input 
                  type="text" 
                  placeholder="Ej: 55555555" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setSelectedSale(null); }}
              />
          </div>
          
          {/* Resultados de Búsqueda */}
          {searchTerm && (
              <div className="mt-4 space-y-2">
                  {sales.slice(0, 3).map(sale => (
                      <div key={sale.id_sale} onClick={() => setSelectedSale(sale)} className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors">
                          <div>
                              <span className="font-bold text-gray-800">Venta #{sale.id_sale}</span>
                              <span className="mx-2 text-gray-300">|</span>
                              <span className="text-sm text-gray-600">{sale.buyer_phone}</span>
                          </div>
                          <span className="text-blue-600 font-bold">${sale.total_cup}</span>
                      </div>
                  ))}
                  {sales.length === 0 && <p className="text-sm text-gray-400 mt-2">No se encontraron ventas completadas.</p>}
              </div>
          )}
      </div>

      {/* 2. DETALLE DE LA VENTA SELECCIONADA */}
      {selectedSale && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between">
                  <h2 className="font-bold text-blue-800">Productos de Venta #{selectedSale.id_sale}</h2>
                  <button onClick={() => setSelectedSale(null)} className="text-blue-400 hover:text-blue-600"><X size={20}/></button>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSale.sale_products.map((item, idx) => (
                      <div key={idx} className="border p-4 rounded-xl flex flex-col justify-between">
                          <div>
                              <h3 className="font-bold text-gray-800">{item.product.name}</h3>
                              <p className="text-sm text-gray-500">Cantidad vendida: {item.quantity}</p>
                          </div>
                          <button 
                              onClick={() => handleOpenModal(item.product, selectedSale.id_sale)}
                              className="mt-4 w-full py-2 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center text-sm"
                          >
                              <RotateCcw size={16} className="mr-2"/> Devolver
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 3. MODAL DE PROCESAMIENTO */}
      {returnItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in">
                  <h3 className="font-bold text-lg mb-4">Procesar Devolución</h3>
                  <p className="text-sm text-gray-600 mb-4">Producto: <span className="font-bold">{returnItem.name}</span></p>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad</label>
                          <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full p-2 border rounded-lg" />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Motivo</label>
                          <textarea rows="2" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Defecto de fábrica, cliente insatisfecho..." className="w-full p-2 border rounded-lg resize-none"></textarea>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <label className="text-sm font-bold text-gray-700 mb-2 block">Estado del Producto</label>
                          <div className="flex gap-2">
                              <button 
                                  onClick={() => setReturnToStock(true)}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${returnToStock ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white text-gray-500'}`}
                              >
                                  <Check size={14} className="mx-auto mb-1"/> Funciona (Al Stock)
                              </button>
                              <button 
                                  onClick={() => setReturnToStock(false)}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${!returnToStock ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white text-gray-500'}`}
                              >
                                  <AlertTriangle size={14} className="mx-auto mb-1"/> Roto / Merma
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                      <button onClick={() => setReturnItem(null)} className="px-4 py-2 text-gray-500 font-medium">Cancelar</button>
                      <button onClick={handleProcessReturn} disabled={processing} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                          {processing ? 'Procesando...' : 'Confirmar'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
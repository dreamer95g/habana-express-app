// src/pages/Returns.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SALES, CREATE_RETURN } from '../graphql/sales';
import { Search, RotateCcw, Package, AlertTriangle, Check, X, Hash, Phone, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Returns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnItem, setReturnItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');
  const [returnToStock, setReturnToStock] = useState(true);

  const { data, loading } = useQuery(GET_SALES);
  const [createReturn, { loading: processing }] = useMutation(CREATE_RETURN);

  const sales = data?.sales?.filter(s => 
    s.status === 'COMPLETED' && 
    (s.id_sale.toString().includes(searchTerm) || s.buyer_phone.includes(searchTerm))
  ) || [];

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
          toast.success("Devolución completada");
          setReturnItem(null);
      } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="pb-20 max-w-4xl mx-auto px-2 md:px-0">
      
      {/* HEADER ESTANDARIZADO */}
      <div className="text-left mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center">
              <RotateCcw className="mr-3 text-blue-600" size={28} /> Devoluciones
          </h1>
          <p className="text-gray-500 text-sm mt-1">Reintegro de productos al inventario o registro de mermas.</p>
      </div>

      {/* BUSCADOR ESTILO MODERNO */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-4 mb-2 block">Localizar Venta</label>
          <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-300" size={20} />
              <input 
                  type="text" 
                  placeholder="ID de venta o teléfono del cliente..." 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setSelectedSale(null); }}
              />
          </div>
          
          {/* Resultados Rápidos */}
          {searchTerm && !selectedSale && (
              <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                  {sales.slice(0, 3).map(sale => (
                      <button 
                        key={sale.id_sale} 
                        onClick={() => setSelectedSale(sale)} 
                        className="w-full p-4 bg-gray-50 rounded-2xl flex justify-between items-center hover:bg-blue-50 transition-colors group"
                      >
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:text-blue-600"><Hash size={16}/></div>
                              <div className="text-left">
                                  <p className="font-black text-gray-800 text-sm">Venta #{sale.id_sale}</p>
                                  <p className="text-xs text-gray-400 font-bold">{sale.buyer_phone}</p>
                              </div>
                          </div>
                          <span className="text-blue-600 font-black">${sale.total_cup}</span>
                      </button>
                  ))}
                  {sales.length === 0 && <p className="text-center text-xs text-gray-400 py-4 italic">No hay ventas completadas con ese dato.</p>}
              </div>
          )}
      </div>

      {/* DETALLE DE PRODUCTOS DE LA VENTA */}
      {selectedSale && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-blue-50 overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-blue-600 px-6 py-5 flex justify-between items-center">
                  <div className="text-white">
                      <p className="text-[10px] font-black opacity-70 uppercase">Productos de la Venta</p>
                      <h2 className="font-black text-lg">#{selectedSale.id_sale} — {selectedSale.buyer_phone}</h2>
                  </div>
                  <button onClick={() => setSelectedSale(null)} className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30"><X size={20}/></button>
              </div>
              
              <div className="p-4 grid grid-cols-1 gap-3">
                  {selectedSale.sale_products.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-3xl flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><Package size={20}/></div>
                              <div>
                                  <h3 className="font-bold text-gray-800 text-sm">{item.product.name}</h3>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cantidad: {item.quantity}</p>
                              </div>
                          </div>
                          <button 
                              onClick={() => { setReturnItem({ ...item.product, saleId: selectedSale.id_sale }); setQty(1); setReason(''); setReturnToStock(true); }}
                              className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-blue-100 active:scale-90 transition-all"
                          >
                              <RotateCcw size={18}/>
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* MODAL DE PROCESAMIENTO (Estilo Premium con Scroll) */}
      {returnItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in">
                  <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="font-black text-gray-800">Procesar Devolución</h3>
                      <button onClick={() => setReturnItem(null)} className="p-2 bg-gray-50 rounded-full"><X size={18}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Producto Seleccionado</p>
                          <p className="font-bold text-gray-800 text-sm">{returnItem.name}</p>
                      </div>

                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Cantidad a Devolver</label>
                          <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Motivo de la Devolución</label>
                          <textarea rows="2" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Defecto, cambio..." className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none resize-none" />
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Estado tras Devolución</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => setReturnToStock(true)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${returnToStock ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-100 text-gray-300'}`}>
                                  <Check size={20}/>
                                  <span className="text-[10px] font-black uppercase">Útil (Al Stock)</span>
                              </button>
                              <button onClick={() => setReturnToStock(false)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${!returnToStock ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-100 text-gray-300'}`}>
                                  <AlertTriangle size={20}/>
                                  <span className="text-[10px] font-black uppercase">Roto / Merma</span>
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex gap-3">
                      <button onClick={() => setReturnItem(null)} className="flex-1 py-4 text-gray-400 font-bold">Cancelar</button>
                      <button onClick={handleProcessReturn} disabled={processing} className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                          {processing ? <Loader2 className="animate-spin"/> : 'CONFIRMAR'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
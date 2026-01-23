// src/components/sales/MobileCartSheet.jsx
import { X, Trash2, Plus, Minus, Loader2 } from 'lucide-react';

export default function MobileCartSheet({ 
  isOpen, 
  onClose, 
  cart, 
  updateQty, 
  removeFromCart, 
  totalCUP, 
  estimatedCommission,
  buyerPhone,
  setBuyerPhone,
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  processing 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-gray-100 animate-in slide-in-from-bottom duration-300">
      
      {/* HEADER */}
      <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b">
        <h2 className="font-bold text-lg text-gray-800">Tu Carrito ({cart.length})</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <X size={20} />
        </button>
      </div>

      {/* BODY: LISTA DE ITEMS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <p>El carrito está vacío</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3">
               {/* Imagen pequeña */}
               <div className="h-16 w-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.photo ? <img src={item.photo} className="w-full h-full object-cover"/> : null}
               </div>
               
               {/* Info */}
               <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                     <span className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</span>
                     <button onClick={() => removeFromCart(item.id)} className="text-red-400">
                        <Trash2 size={16} />
                     </button>
                  </div>
                  
                  <div className="flex justify-between items-end">
                     <span className="text-blue-600 font-bold text-sm">${item.price * item.qty}</span>
                     
                     {/* Controles Cantidad */}
                     <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 px-2 active:bg-gray-200"><Minus size={14}/></button>
                        <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 px-2 active:bg-gray-200"><Plus size={14}/></button>
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER: COBRO */}
      <div className="bg-white p-4 border-t border-gray-200 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
         {/* Datos Cliente */}
         <div className="mb-4">
            <input 
              type="tel" 
              placeholder="📱 Teléfono del Cliente" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg" 
              value={buyerPhone} 
              onChange={e => setBuyerPhone(e.target.value)} 
            />
         </div>

         {/* Método Pago */}
         <div className="grid grid-cols-2 gap-3 mb-4">
             <button 
                onClick={() => setPaymentMethod('cash')} 
                className={`py-3 rounded-xl font-bold text-sm border transition-all ${paymentMethod==='cash' ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
             >
                💵 Efectivo
             </button>
             <button 
                onClick={() => setPaymentMethod('transfer')} 
                className={`py-3 rounded-xl font-bold text-sm border transition-all ${paymentMethod==='transfer' ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}
             >
                🏦 Transferencia
             </button>
         </div>

         {/* Totales */}
         <div className="flex justify-between items-center mb-4">
             <div className="text-xs text-gray-500">
                <p>Comisión estimada: <span className="text-green-600 font-bold">+${estimatedCommission.toFixed(0)}</span></p>
                <p>{cart.length} Artículos</p>
             </div>
             <div className="text-right">
                <span className="text-gray-400 text-xs font-bold uppercase">Total a Cobrar</span>
                <p className="text-2xl font-black text-gray-900">${totalCUP.toFixed(0)}</p>
             </div>
         </div>

         <button 
            onClick={handleCheckout} 
            disabled={processing || cart.length===0} 
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl text-lg hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-transform shadow-lg shadow-blue-200"
         >
             {processing ? <Loader2 className="animate-spin mx-auto"/> : "CONFIRMAR VENTA"}
         </button>
      </div>
    </div>
  );
}
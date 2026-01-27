// src/components/sales/SaleModal.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, DollarSign, Phone, FileText, CreditCard, TrendingUp, ShoppingBag } from 'lucide-react';

export default function SaleModal({ isOpen, onClose, saleToEdit, onSave, isSaving }) {
  const { register, handleSubmit, setValue, reset } = useForm();

  useEffect(() => {
    if (isOpen && saleToEdit) {
      reset({
        total_cup: saleToEdit.total_cup,
        exchange_rate: saleToEdit.exchange_rate,
        buyer_phone: saleToEdit.buyer_phone,
        payment_method: saleToEdit.payment_method,
        notes: saleToEdit.notes || ''
      });
    }
  }, [isOpen, saleToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-200">
        
        {/* HEADER FIJO */}
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">Venta #{saleToEdit?.id_sale}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 rounded-full"><X size={20} /></button>
        </div>

        {/* CUERPO CON SCROLL */}
        <form id="sale-edit-form" onSubmit={handleSubmit(onSave)} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-2">
             <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Responsable</p>
             <p className="text-sm font-bold text-gray-700">{saleToEdit?.seller?.name}</p>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Total Cobrado (CUP)</label>
             <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 text-blue-500" size={18}/>
                <input type="number" step="0.01" {...register('total_cup')} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-black text-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Teléfono del Cliente</label>
             <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-gray-300" size={18}/>
                <input {...register('buyer_phone')} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-bold" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Método Pago</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-3.5 text-gray-300" size={18}/>
                    <select {...register('payment_method')} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-bold appearance-none">
                        <option value="cash">Efectivo</option>
                        <option value="transfer">Transf.</option>
                    </select>
                  </div>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tasa Aplicada</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-3.5 text-gray-300" size={18}/>
                    <input type="number" {...register('exchange_rate')} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-bold" />
                  </div>
              </div>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Notas de la operación</label>
             <div className="relative">
                <FileText className="absolute left-4 top-4 text-gray-300" size={18}/>
                <textarea {...register('notes')} rows={2} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none resize-none" placeholder="Agregar nota..." />
             </div>
          </div>
        </form>

        {/* FOOTER FIJO */}
        <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3 flex-shrink-0">
             <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-400">Cancelar</button>
             <button form="sale-edit-form" type="submit" disabled={isSaving} className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95 transition-all">
                 {isSaving && <Loader2 className="animate-spin" size={18}/>} GUARDAR
             </button>
        </div>
      </div>
    </div>
  );
}
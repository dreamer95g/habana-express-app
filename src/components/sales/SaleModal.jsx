import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, DollarSign, Phone, FileText } from 'lucide-react';

export default function SaleModal({ isOpen, onClose, saleToEdit, onSave, isSaving }) {
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (isOpen && saleToEdit) {
      setValue('total_cup', saleToEdit.total_cup);
      setValue('exchange_rate', saleToEdit.exchange_rate);
      setValue('buyer_phone', saleToEdit.buyer_phone);
      setValue('payment_method', saleToEdit.payment_method);
      setValue('notes', saleToEdit.notes || '');
    }
  }, [isOpen, saleToEdit, setValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in">
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b rounded-t-2xl">
          <h3 className="font-bold text-gray-800">Editar Venta #{saleToEdit?.id_sale}</h3>
          <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 mb-4">
             <span className="font-bold">Vendedor:</span> {saleToEdit?.seller?.name}
             <br/>
             <span className="text-xs opacity-75">Nota: No se puede cambiar el vendedor ni los productos. Para eso, anula la venta.</span>
          </div>

          <div>
             <label className="text-sm font-bold text-gray-700">Total (CUP)</label>
             <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-gray-400 h-4 w-4"/>
                <input type="number" step="0.01" {...register('total_cup')} className="w-full pl-9 p-2 border rounded-lg" />
             </div>
          </div>

          <div>
             <label className="text-sm font-bold text-gray-700">Teléfono Cliente</label>
             <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-gray-400 h-4 w-4"/>
                <input {...register('buyer_phone')} className="w-full pl-9 p-2 border rounded-lg" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="text-sm font-bold text-gray-700">Método Pago</label>
                  <select {...register('payment_method')} className="w-full p-2 border rounded-lg">
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia</option>
                  </select>
              </div>
              <div>
                  <label className="text-sm font-bold text-gray-700">Tasa Aplicada</label>
                  <input type="number" {...register('exchange_rate')} className="w-full p-2 border rounded-lg" />
              </div>
          </div>

          <div>
             <label className="text-sm font-bold text-gray-700">Notas</label>
             <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4"/>
                <textarea {...register('notes')} rows={2} className="w-full pl-9 p-2 border rounded-lg resize-none" />
             </div>
          </div>

          <div className="flex justify-end pt-2">
             <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center">
                 {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4"/>} Guardar
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
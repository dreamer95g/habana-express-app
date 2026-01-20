// src/components/shipments/ShipmentModal.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, Truck, Calendar, DollarSign, FileText } from 'lucide-react';



// Helper ROBUSTO para fechas
const formatDateForInput = (rawDate) => {
  if (!rawDate) return '';
  try {
    // Intentamos convertir a número primero (por si viene como timestamp string "167234234")
    // Si no, usamos el valor original (ISO string)
    const date = new Date(Number(rawDate) || rawDate);
    
    // Si la fecha es inválida, devolvemos vacío para no romper la app
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

export default function ShipmentModal({ isOpen, onClose, shipmentToEdit, onSave, isSaving }) {
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (shipmentToEdit) {
        // Llenar datos
        setValue('agency_name', shipmentToEdit.agency_name);
        setValue('shipment_date', formatDateForInput(shipmentToEdit.shipment_date));
        setValue('shipping_cost_usd', shipmentToEdit.shipping_cost_usd);
        setValue('merchandise_cost_usd', shipmentToEdit.merchandise_cost_usd);
        setValue('customs_fee_cup', shipmentToEdit.customs_fee_cup);
        setValue('exchange_rate', shipmentToEdit.exchange_rate);
        setValue('notes', shipmentToEdit.notes || '');
      } else {
        // Limpiar
        reset();
      }
    }
  }, [isOpen, shipmentToEdit, setValue, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Truck className="mr-2 text-blue-600" />
            {shipmentToEdit ? 'Editar Envío' : 'Registrar Nuevo Envío'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Agencia */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Agencia de Envíos</label>
              <input {...register('agency_name', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Aerovaradero, Cubapack..." />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Envío</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                <input type="date" {...register('shipment_date', { required: true })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

             {/* Tasa Cambiaria (En ese momento) */}
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tasa de Cambio (CUP)</label>
              <input type="number" step="0.01" {...register('exchange_rate', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
            </div>

            {/* Costos USD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Costo Envío (USD)</label>
              <div className="relative">
                 <DollarSign className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                 <input type="number" step="0.01" {...register('shipping_cost_usd', { required: true })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Costo Mercancía (USD)</label>
              <div className="relative">
                 <DollarSign className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                 <input type="number" step="0.01" {...register('merchandise_cost_usd', { required: true })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {/* Aranceles CUP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Aranceles Aduana (CUP)</label>
              <div className="relative">
                 <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs">CUP</span>
                 <input type="number" step="0.01" {...register('customs_fee_cup', { required: true })} className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {/* Notas */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notas / Observaciones</label>
              <textarea {...register('notes')} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl">Cancelar</button>
            <button type="submit" disabled={isSaving} className="flex items-center px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-70">
              {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Guardar Envío
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
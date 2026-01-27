// src/components/shipments/ShipmentModal.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, Truck, Calendar, DollarSign, FileText, Globe, Box } from 'lucide-react';

const formatDateForInput = (rawDate) => {
  if (!rawDate) return '';
  const date = new Date(Number(rawDate) || rawDate);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const emptyShipmentState = {
  agency_name: '',
  shipment_date: new Date().toISOString().split('T')[0],
  shipping_cost_usd: 0,
  merchandise_cost_usd: 0,
  customs_fee_cup: 0,
  exchange_rate: 0,
  notes: ''
};

export default function ShipmentModal({ isOpen, onClose, shipmentToEdit, onSave, isSaving }) {
   const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: emptyShipmentState
  });

  useEffect(() => {
    if (isOpen) {
      if (shipmentToEdit) {
        // MODO EDICIÓN
        reset({
          agency_name: shipmentToEdit.agency_name,
          shipment_date: formatDateForInput(shipmentToEdit.shipment_date),
          shipping_cost_usd: shipmentToEdit.shipping_cost_usd,
          merchandise_cost_usd: shipmentToEdit.merchandise_cost_usd,
          customs_fee_cup: shipmentToEdit.customs_fee_cup,
          exchange_rate: shipmentToEdit.exchange_rate,
          notes: shipmentToEdit.notes || ''
        });
      } else {
        // MODO CREAR: Reset total
        reset(emptyShipmentState);
      }
    }
  }, [isOpen, shipmentToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-200">
        
        {/* HEADER FIJO */}
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Truck size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">
                {shipmentToEdit ? 'Editar Envío' : 'Nuevo Envío'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 rounded-full"><X size={20} /></button>
        </div>

        {/* CUERPO CON SCROLL */}
        <form id="shipment-form" onSubmit={handleSubmit(onSave)} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Agencia / Courier</label>
              <input {...register('agency_name', { required: true })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold outline-none" placeholder="Ej: Aerovaradero" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Fecha de Envío</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input type="date" {...register('shipment_date', { required: true })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-bold" />
              </div>
            </div>

             <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tasa Mercado (CUP)</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input type="number" step="0.01" {...register('exchange_rate', { required: true })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-bold" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Costo Flete (USD)</label>
              <div className="relative">
                 <DollarSign className="absolute left-4 top-3.5 text-blue-500" size={18} />
                 <input type="number" step="0.01" {...register('shipping_cost_usd', { required: true })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-black text-gray-700" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Costo Mercancía (USD)</label>
              <div className="relative">
                 <Box className="absolute left-4 top-3.5 text-blue-500" size={18} />
                 <input type="number" step="0.01" {...register('merchandise_cost_usd', { required: true })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-black text-gray-700" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Aranceles Aduana (CUP)</label>
              <div className="relative">
                 <span className="absolute left-4 top-3 text-orange-500 font-black text-xs">CUP</span>
                 <input type="number" step="0.01" {...register('customs_fee_cup', { required: true })} className="w-full pl-12 pr-4 py-3 bg-orange-50 border-none rounded-2xl outline-none font-black text-orange-700" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Notas</label>
              <textarea {...register('notes')} rows={2} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none resize-none" />
            </div>
          </div>
        </form>

        {/* FOOTER FIJO */}
        <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-3 text-sm font-bold text-gray-400">Cancelar</button>
          <button form="shipment-form" type="submit" disabled={isSaving} className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95 transition-all">
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            GUARDAR
          </button>
        </div>
      </div>
    </div>
  );
}
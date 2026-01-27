// src/pages/Shipments.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SHIPMENTS, CREATE_SHIPMENT, UPDATE_SHIPMENT, DELETE_SHIPMENT } from '../graphql/shipments';
import { Truck, Plus, Edit2, Trash2, Calendar, Loader2, AlertCircle, DollarSign, Globe, ClipboardList } from 'lucide-react';
import ShipmentModal from '../components/shipments/ShipmentModal';
import toast from 'react-hot-toast';
import TablePagination from '../components/ui/TablePagination';

export default function Shipments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, loading, error } = useQuery(GET_SHIPMENTS);

  const [createShipment, { loading: creating }] = useMutation(CREATE_SHIPMENT, {
    refetchQueries: [{ query: GET_SHIPMENTS }]
  });
  const [updateShipment, { loading: updating }] = useMutation(UPDATE_SHIPMENT, {
    refetchQueries: [{ query: GET_SHIPMENTS }]
  });
  const [deleteShipment] = useMutation(DELETE_SHIPMENT, {
    refetchQueries: [{ query: GET_SHIPMENTS }]
  });

  const allShipments = data?.shipments || [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentShipments = allShipments.slice(indexOfFirstItem, indexOfLastItem);

  const handleOpenCreate = () => {
    setEditingShipment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shipment) => {
    setEditingShipment(shipment);
    setIsModalOpen(true);
  };

  const getDisplayDate = (rawDate) => {
    const date = new Date(Number(rawDate) || rawDate);
    if (isNaN(date.getTime())) {
      return { day: '--', month: '---', year: '----' };
    }
    return {
      day: date.getDate(),
      month: date.toLocaleString('es-ES', { month: 'short' }),
      year: date.getFullYear()
    };
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este envío? Se perderá el registro de costos.')) {
      try {
        await deleteShipment({ variables: { id_shipment: id } });
        toast.success('Envío eliminado');
      } catch (e) {
        toast.error('Error: ' + e.message);
      }
    }
  };

  const handleSave = async (data) => {
    const shipmentInput = {
      agency_name: data.agency_name,
      shipment_date: new Date(data.shipment_date).toISOString(),
      shipping_cost_usd: parseFloat(data.shipping_cost_usd),
      merchandise_cost_usd: parseFloat(data.merchandise_cost_usd),
      customs_fee_cup: parseFloat(data.customs_fee_cup),
      exchange_rate: parseFloat(data.exchange_rate),
      notes: data.notes
    };

    try {
      if (editingShipment) {
        await updateShipment({
          variables: { id_shipment: editingShipment.id_shipment, input: shipmentInput }
        });
        toast.success('Envío actualizado');
      } else {
        await createShipment({ variables: shipmentInput });
        toast.success('Envío registrado');
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error('Error: ' + e.message);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;
  if (error) return <p className="text-center text-red-500 p-10">Error cargando envíos</p>;

  return (
    <div className="pb-20 max-w-7xl mx-auto px-2 md:px-0">
      
      {/* --- HEADER MEJORADO (Botón debajo en móvil) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <Truck className="mr-3 text-blue-600" size={28} /> Gestión de Envíos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Control de importaciones y logística internacional.
          </p>
        </div>
        
        {/* El botón ahora es w-full en móvil por defecto y w-auto en tablets/pc */}
        <button 
          onClick={handleOpenCreate} 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center transition-all active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> Registrar Nuevo Envío
        </button>
      </div>

      {/* --- LISTA DE ENVÍOS ESTILO "FINANCIAL" --- */}
      <div className="space-y-4">
        {allShipments.length === 0 && (
           <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
             <AlertCircle className="mx-auto text-gray-300 h-12 w-12 mb-3" />
             <p className="text-gray-500 font-medium">No hay envíos registrados.</p>
           </div>
        )}

        {currentShipments.map((item) => {
          const dateData = getDisplayDate(item.shipment_date);
          const totalUsd = item.shipping_cost_usd + item.merchandise_cost_usd;

          return (
            <div key={item.id_shipment} className="relative overflow-hidden bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
              
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                
                {/* 1. Agencia y Fecha */}
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex flex-col items-center justify-center font-black border border-blue-100 flex-shrink-0 shadow-sm">
                      <span className="text-lg leading-none">{dateData.day}</span>
                      <span className="text-[10px] uppercase">{dateData.month}</span>
                   </div>
                   
                   <div className="min-w-0">
                     <h3 className="font-bold text-gray-800 text-lg leading-tight truncate">{item.agency_name}</h3>
                     <div className="flex items-center text-gray-500 text-xs mt-1 font-medium">
                        <Globe size={12} className="mr-1 text-blue-400" />
                        Tasa: {item.exchange_rate} CUP
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="truncate">{item.notes || 'Sin observaciones'}</span>
                     </div>
                   </div>
                </div>

                {/* 2. Resumen de Costos (Muy visual) */}
                <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 border-y md:border-y-0 py-3 md:py-0 border-gray-50">
                  <div className="text-left md:text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Inversión Total</span>
                    <p className="text-lg font-black text-gray-800">${totalUsd.toFixed(2)}<span className="text-[10px] ml-1 text-gray-400">USD</span></p>
                  </div>
                  <div className="text-left md:text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Arancel Aduana</span>
                    <p className="text-lg font-black text-orange-600">${item.customs_fee_cup.toFixed(0)}<span className="text-[10px] ml-1 text-gray-400">CUP</span></p>
                  </div>
                </div>

                {/* 3. Acciones */}
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => handleOpenEdit(item)} 
                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all active:scale-90"
                    title="Editar envío"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id_shipment)} 
                    className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all active:scale-90"
                    title="Eliminar registro"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

              </div>
              
              {/* Badge discreto de "Detalles" en móvil */}
              <div className="mt-3 flex items-center gap-3 md:hidden">
                 <div className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-bold">
                    <ClipboardList size={10}/> ENVÍO: ${item.shipping_cost_usd}
                 </div>
                 <div className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-bold">
                    <DollarSign size={10}/> PRODUCTOS: ${item.merchandise_cost_usd}
                 </div>
              </div>

            </div>
          );
        })}
      </div>

      <TablePagination 
        currentPage={currentPage}
        totalItems={allShipments.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <ShipmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shipmentToEdit={editingShipment}
        onSave={handleSave}
        isSaving={creating || updating}
      />
    </div>
  );
}
// src/pages/Shipments.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SHIPMENTS, CREATE_SHIPMENT, UPDATE_SHIPMENT, DELETE_SHIPMENT } from '../graphql/shipments';
import { Truck, Plus, Edit2, Trash2, Calendar, Loader2, AlertCircle } from 'lucide-react';
import ShipmentModal from '../components/shipments/ShipmentModal';
import toast from 'react-hot-toast';

export default function Shipments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);

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

  const handleOpenCreate = () => {
    setEditingShipment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shipment) => {
    setEditingShipment(shipment);
    setIsModalOpen(true);
  };

  // Helper para mostrar fechas en la lista
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
    
        // Preparamos el objeto con los datos
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
        // CORRECCIÓN AQUÍ: Pasamos 'input' como objeto
        await updateShipment({
          variables: { 
            id_shipment: editingShipment.id_shipment, 
            input: shipmentInput // <--- Empaquetado dentro de input
          }
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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (error) return <p className="text-center text-red-500 p-10">Error cargando envíos</p>;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Truck className="mr-3 text-blue-600" /> Gestión de Envíos
          </h1>
          <p className="text-gray-500 text-sm">Control de importaciones y costos.</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center transition-transform active:scale-95">
          <Plus className="mr-2 h-5 w-5" /> Nuevo Envío
        </button>
      </div>

      {/* --- LISTA SIMPLIFICADA (Responsive) --- */}
      <div className="space-y-4">
        {data?.shipments?.length === 0 && (
           <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
             <AlertCircle className="mx-auto text-gray-300 h-10 w-10 mb-2" />
             <p className="text-gray-500">No hay envíos registrados.</p>
           </div>
        )}

         {data?.shipments?.map((item) => {
          // Usamos el helper aquí
          const dateData = getDisplayDate(item.shipment_date);

          return (
            <div key={item.id_shipment} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              
              <div className="flex items-center gap-4">
                 {/* Icono Fecha corregido */}
                 <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center font-bold text-xs border border-blue-100">
                    <span>{dateData.day}</span>
                    <span className="uppercase">{dateData.month}</span>
                 </div>
                 
                 {/* Datos Principales */}
                 <div>
                   <h3 className="font-bold text-gray-800 text-lg">{item.agency_name}</h3>
                   <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {dateData.year}
                      <span className="mx-2">•</span>
                      <span className="text-gray-400 italic text-xs truncate max-w-[150px]">{item.notes || 'Sin notas'}</span>
                   </div>
                 </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                   <Edit2 size={20} />
                </button>
                <button onClick={() => handleDelete(item.id_shipment)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                   <Trash2 size={20} />
                </button>
              </div>

            </div>
          );
        })}



      </div>

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
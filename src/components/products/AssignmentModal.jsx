import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../../graphql/users'; // Asegúrate que esta query traiga users
import { X, Save, Loader2, UserPlus, Package } from 'lucide-react';

export default function AssignmentModal({ isOpen, onClose, product, onAssign, isAssigning }) {
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  
  // 1. Traemos usuarios para llenar el select (Solo vendedores activos)
  const { data: usersData, loading: loadingUsers } = useQuery(GET_USERS);
  
  // Filtramos solo los que son vendedores (role: 'seller') y están activos
  const sellers = usersData?.users?.filter(u => u.role === 'seller' && u.active) || [];

  useEffect(() => {
    if (isOpen) {
      reset({ quantity: 1 }); // Resetear form al abrir
    }
  }, [isOpen, product, reset]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center border-b border-blue-500 rounded-t-2xl">
          <h3 className="text-lg font-bold text-white flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Asignar Mercancía
          </h3>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Info del Producto */}
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center gap-3">
             <div className="h-10 w-10 bg-white rounded-lg border border-blue-100 flex items-center justify-center overflow-hidden">
                {product.photo_url ? (
                    <img src={product.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                    <Package className="text-blue-300" size={20} />
                )}
             </div>
             <div>
                 <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                 <p className="text-xs text-gray-500">Stock Global Disponible: <span className="font-bold text-blue-600">{product.stock}</span></p>
             </div>
        </div>

        <form onSubmit={handleSubmit(onAssign)} className="p-6 space-y-5">
          
          {/* Selector de Vendedor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar Vendedor</label>
            {loadingUsers ? (
                <div className="text-sm text-gray-400 flex items-center"><Loader2 className="animate-spin h-4 w-4 mr-2"/> Cargando vendedores...</div>
            ) : (
                <select 
                    {...register('sellerId', { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="">-- Elige un vendedor --</option>
                    {sellers.map(seller => (
                        <option key={seller.id_user} value={seller.id_user}>
                            {seller.name} ({seller.phone})
                        </option>
                    ))}
                </select>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad a Entregar</label>
            <div className="flex items-center gap-3">
                <input 
                    type="number" 
                    min="1"
                    max={product.stock} // Opcional: limitar al stock global
                    {...register('quantity', { required: true, min: 1 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                />
                <span className="text-sm text-gray-400 font-medium">unidades</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
                ⚠️ Esto sumará al stock que ya tenga este vendedor.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isAssigning}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-70"
            >
              {isAssigning ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Confirmar Asignación
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
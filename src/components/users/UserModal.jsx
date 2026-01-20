// src/components/users/UserModal.jsx
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Loader2, User, Phone, Mail, Lock, Shield, Send } from 'lucide-react';
import ImageDropzone from '../ui/ImageDropzone';

export default function UserModal({ isOpen, onClose, userToEdit, onSave, isSaving, isSelfEdit = false, isAdmin = false }) {
  const { register, handleSubmit, reset, control, setValue } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        // Modo Edición: Llenar datos
        setValue('name', userToEdit.name);
        setValue('phone', userToEdit.phone);
        setValue('email', userToEdit.email || '');
        setValue('photo_url', userToEdit.photo_url || '');
        setValue('telegram_chat_id', userToEdit.telegram_chat_id || '');
        setValue('role', userToEdit.role); // Aunque sea self-edit, cargamos el rol (aunque esté disabled visualmente)
        setValue('password', ''); // Password siempre limpio por seguridad
      } else {
        // Modo Crear: Limpiar
        reset({ role: 'seller', active: true });
      }
    }
  }, [isOpen, userToEdit, setValue, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h3 className="text-lg font-bold text-white flex items-center">
            <User className="mr-2" />
            {isSelfEdit ? 'Mi Perfil' : (userToEdit ? 'Editar Usuario' : 'Nuevo Usuario')}
          </h3>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 md:p-8">
          
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* COLUMNA IZQUIERDA: FOTO */}
            <div className="flex flex-col items-center md:w-1/3 space-y-4">
              <label className="text-sm font-semibold text-gray-700">Foto de Perfil</label>
              <Controller
                control={control}
                name="photo_url"
                render={({ field: { value, onChange } }) => (
                  <ImageDropzone value={value} onChange={onChange} className="w-40 h-40" />
                )}
              />
              <p className="text-xs text-center text-gray-400 px-4">
                Sube una imagen cuadrada para mejor visualización.
              </p>
            </div>

            {/* COLUMNA DERECHA: DATOS */}
            <div className="md:w-2/3 space-y-5">
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                <div className="relative">
                   <User className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                   <input {...register('name', { required: true })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Juan Pérez" />
                </div>
              </div>

              {/* Teléfono & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono (Login)</label>
                   <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                      <input {...register('phone', { required: true })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email (Opcional)</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                      <input {...register('email')} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                </div>
              </div>

              {/* Password */}
              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {userToEdit ? 'Cambiar Contraseña (Opcional)' : 'Contraseña *'}
                 </label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                    <input 
                      type="password" 
                      {...register('password', { required: !userToEdit })} // Requerido solo si es nuevo
                      placeholder={userToEdit ? "Dejar vacío para mantener actual" : "••••••"}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                 </div>
              </div>

              {/* ROL (Solo visible/editable si eres Admin y NO es tu propio perfil en modo edición rápida) */}
              {/* Si es Admin gestionando usuarios -> Editable */}
              {/* Si es Admin editándose a sí mismo -> Disabled */}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rol de Usuario</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                        <select 
                            {...register('role')} 
                            disabled={!isAdmin || isSelfEdit} // Bloqueado si no soy admin o si me edito a mí mismo
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        >
                            <option value="seller">Vendedor</option>
                            <option value="storekeeper">Almacenero</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Telegram Chat ID</label>
                     <div className="relative">
                        <Send className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                        <input {...register('telegram_chat_id')} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" placeholder="Ej: 123456789" />
                     </div>
                  </div>
              </div>

            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {userToEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
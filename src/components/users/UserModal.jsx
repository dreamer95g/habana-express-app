// src/components/users/UserModal.jsx
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Loader2, User, Phone, Mail, Lock, Shield, Send } from 'lucide-react';
import ImageDropzone from '../ui/ImageDropzone';

export default function UserModal({ 
  isOpen, 
  onClose, 
  userToEdit, 
  onSave, 
  isSaving, 
  isSelfEdit = false, 
  isAdmin = false 
}) {
  const { register, handleSubmit, reset, control, setValue } = useForm();

  // Resetear el formulario cuando el modal abre o cambia el usuario a editar
  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        reset({
          name: userToEdit.name || '',
          phone: userToEdit.phone || '',
          email: userToEdit.email || '',
          photo_url: userToEdit.photo_url || '',
          telegram_chat_id: userToEdit.telegram_chat_id || '',
          role: userToEdit.role || 'seller',
          password: '' // Password siempre vacío por seguridad al cargar
        });
      } else {
        reset({
          name: '',
          phone: '',
          email: '',
          photo_url: '',
          telegram_chat_id: '',
          role: 'seller',
          password: ''
        });
      }
    }
  }, [isOpen, userToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      
      {/* CONTENEDOR PRINCIPAL: max-h-[95vh] permite que no se corte en móviles */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-200">
        
        {/* HEADER: Fijo arriba */}
        <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <User size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">
              {isSelfEdit ? 'Mi Perfil' : (userToEdit ? 'Editar Usuario' : 'Nuevo Usuario')}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CUERPO: Scrollable para formularios largos en móvil */}
        <form 
          id="user-form" 
          onSubmit={handleSubmit(onSave)} 
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar"
        >
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* COLUMNA IZQUIERDA: FOTO */}
            <div className="flex flex-col items-center md:w-1/3 space-y-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto de Perfil</span>
              <Controller
                control={control}
                name="photo_url"
                render={({ field: { value, onChange } }) => (
                  <ImageDropzone value={value} onChange={onChange} className="w-32 h-32 md:w-40 md:h-40 shadow-inner" />
                )}
              />
              <p className="text-[10px] text-center text-gray-400 leading-tight px-4">
                Sube una imagen cuadrada para mejores resultados.
              </p>
            </div>

            {/* COLUMNA DERECHA: DATOS */}
            <div className="md:w-2/3 space-y-5">
              
              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nombre Completo</label>
                <div className="relative">
                   <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
                   <input 
                    {...register('name', { required: true })} 
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700" 
                    placeholder="Juan Pérez" 
                   />
                </div>
              </div>

              {/* Teléfono & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Teléfono (Login)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <input 
                      {...register('phone', { required: true })} 
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-mono font-bold" 
                      placeholder="50000000"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <input 
                      {...register('email')} 
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-medium" 
                      placeholder="ejemplo@mail.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                    {userToEdit ? 'Cambiar Contraseña (Opcional)' : 'Contraseña *'}
                 </label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <input 
                      type="password" 
                      {...register('password', { required: !userToEdit })} 
                      placeholder={userToEdit ? "••••••••" : "Mínimo 6 caracteres"}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none" 
                    />
                 </div>
              </div>

              {/* Rol y Telegram */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Rol de Acceso</label>
                    <div className="relative">
                        <Shield className="absolute left-4 top-3.5 text-gray-300" size={18} />
                        <select 
                            {...register('role')} 
                            disabled={!isAdmin || isSelfEdit}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none appearance-none font-bold text-gray-700 disabled:opacity-50"
                        >
                            <option value="seller">Vendedor</option>
                            <option value="storekeeper">Almacenero</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Telegram Chat ID</label>
                     <div className="relative">
                        <Send className="absolute left-4 top-3.5 text-gray-300" size={18} />
                        <input 
                          {...register('telegram_chat_id')} 
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none font-mono text-xs" 
                          placeholder="ID de Chat" 
                        />
                     </div>
                  </div>
              </div>

            </div>
          </div>
        </form>

        {/* FOOTER: Fijo abajo con botones */}
        <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            form="user-form"
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {userToEdit ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO'}
          </button>
        </div>

      </div>
    </div>
  );
}
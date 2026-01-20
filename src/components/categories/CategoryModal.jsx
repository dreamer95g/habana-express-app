// src/components/categories/CategoryModal.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';

export default function CategoryModal({ isOpen, onClose, categoryToEdit, onSave, isSaving }) {
  const { register, handleSubmit, reset, setValue } = useForm();

  // Efecto: Cuando abre el modal, decidimos si es "Crear" (limpiar) o "Editar" (llenar)
  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setValue('name', categoryToEdit.name);
      } else {
        reset();
      }
    }
  }, [isOpen, categoryToEdit, setValue, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSave)} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Categoría</label>
            <input
              {...register('name', { required: true })}
              placeholder="Ej: Electrónica, Hogar..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5 mr-2" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
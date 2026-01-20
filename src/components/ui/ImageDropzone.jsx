import { useState } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageDropzone({ value, onChange, className }) {
  const [isUploading, setIsUploading] = useState(false);

  // Obtener URL base desde variables de entorno
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación básica
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Error subiendo imagen');

      const data = await res.json();
      // data.url ahora será la URL de Cloudinary (https://res.cloudinary...)
      onChange(data.url); 
      toast.success('Foto subida');
    } catch (error) {
      console.error(error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault(); 
    onChange('');
  };

  return (
    <div className={`relative group w-32 h-32 rounded-full border-4 border-dashed border-gray-200 overflow-hidden bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer ${className}`}>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {isUploading ? (
          <div className="flex flex-col items-center text-blue-500">
            <Loader2 className="animate-spin h-8 w-8 mb-1" />
            <span className="text-[10px] font-bold">SUBIENDO...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <UploadCloud className="text-white h-8 w-8" />
               <span className="text-white text-[10px] font-bold mt-1">CAMBIAR</span>
            </div>
          </>
        ) : (
          <div className="text-gray-400 flex flex-col items-center px-2 text-center">
            <ImageIcon className="h-8 w-8 mb-1" />
            <span className="text-[10px] leading-tight">Click para subir foto</span>
          </div>
        )}
      </div>

      {value && !isUploading && (
        <button 
          onClick={handleRemove}
          className="absolute top-1 right-1 z-20 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-transform hover:scale-110"
          type="button"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
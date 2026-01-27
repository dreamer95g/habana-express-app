import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Loader2, ShieldCheck, FileText, Truck } from 'lucide-react'; 
import ImageDropzone from '../ui/ImageDropzone';

export default function ProductModal({ isOpen, onClose, productToEdit, categories, onSave, isSaving }) {
  
  const emptyState = {
  name: '',
  description: '',
  stock: 1,
  purchase_price: 0,
  sale_price: 0,
  sku: '',
  supplier_name: '',
  photo_url: '',
  warranty: false,
  categoryIds: []
};

const { register, handleSubmit, reset, control, setValue } = useForm({
    defaultValues: emptyState
  });
  
   
  // 2️⃣ CHANGE: Efecto de carga corregido
  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        // MODO EDICIÓN: Cargamos datos del producto
        const catIds = productToEdit.product_categories?.map(pc => String(pc.category.id_category)) || [];
        reset({
          name: productToEdit.name,
          description: productToEdit.description || '',
          sku: productToEdit.sku || '',
          supplier_name: productToEdit.supplier_name || '',
          purchase_price: productToEdit.purchase_price,
          sale_price: productToEdit.sale_price,
          stock: productToEdit.stock,
          photo_url: productToEdit.photo_url || '',
          warranty: productToEdit.warranty,
          categoryIds: catIds
        });
      } else {
        // MODO CREAR: Forzamos el reset con el objeto vacío completo
        reset(emptyState); 
      }
    }
  }, [isOpen, productToEdit, reset]);

 const handleFormSubmit = (data) => {
      // Conversión segura: Si viene vacío o inválido, ponemos 0
      const cleanData = {
          ...data,
          stock: data.stock ? parseInt(data.stock) : 0,
          purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : 0,
          sale_price: data.sale_price ? parseFloat(data.sale_price) : 0,
          // Asegurar que categoryIds es un array de números
          categoryIds: (data.categoryIds && Array.isArray(data.categoryIds))
              ? data.categoryIds.map(id => parseInt(id)) 
              : []
      };
      
      console.log("Datos enviados al padre:", cleanData); // Para depurar en consola (F12)
      onSave(cleanData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 flex flex-col max-h-[90vh]">
        
        {/* Header ... */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100 rounded-t-2xl flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800">
            {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Formulario ... */}
        <div className="overflow-y-auto p-6">
            <form id="product-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            
            <div className="flex flex-col md:flex-row gap-6">
                
                {/* Lado Izquierdo... */}
                <div className="md:w-1/3 flex flex-col space-y-4">
                     {/* ... ImageDropzone ... */}
                     <div className="flex flex-col items-center p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                        <label className="text-sm font-semibold text-gray-700 mb-3">Foto del Producto</label>
                        <Controller
                            control={control}
                            name="photo_url"
                            render={({ field: { value, onChange } }) => (
                                <ImageDropzone value={value} onChange={onChange} className="w-40 h-40 rounded-2xl shadow-sm" />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Categorías</label>
                        <select 
                            {...register('categoryIds')} 
                            multiple 
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-32 text-sm"
                        >
                            {categories.map(cat => (
                                // IMPORTANTE: value debe coincidir con el tipo que seteamos en reset (String)
                                <option key={cat.id_category} value={String(cat.id_category)}>{cat.name}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1 text-center">Mantén Ctrl para seleccionar varias</p>
                    </div>
                </div>

                {/* Lado Derecho ... */}
                <div className="md:w-2/3 space-y-4">
                    {/* ... Inputs Nombre, Proveedor, Stock, Precios ... */}
                    {/* (El resto de inputs se mantienen igual, el reset() ya los maneja bien) */}
                    
                     {/* Nombre */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Producto *</label>
                        <input {...register('name', { required: true })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: iPhone 15 Pro Max" />
                    </div>

                    {/* Proveedor y Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1">Proveedor</label>
                             <div className="relative">
                                <Truck size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                                <input {...register('supplier_name')} className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Amazon" />
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Inicial *</label>
                             <input type="number" {...register('stock', { required: true })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    {/* Precios */}
                    <div className="grid grid-cols-2 gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Costo (USD) *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                                <input type="number" step="0.01" {...register('purchase_price', { required: true })} className="w-full pl-6 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-700" placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Venta (CUP) *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-blue-500 font-bold">$</span>
                                <input type="number" step="0.01" {...register('sale_price', { required: true })} className="w-full pl-6 pr-3 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700" placeholder="0.00" />
                            </div>
                        </div>
                    </div>

                    {/* Descripción (Asegúrate que el textarea está bien registrado) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                            <textarea 
                                {...register('description')} 
                                rows={3} 
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                                placeholder="Detalles técnicos, estado, etc..."
                            />
                        </div>
                    </div>

                     {/* Checkbox Garantía */}
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="warranty" {...register('warranty')} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                        <label htmlFor="warranty" className="text-sm font-medium text-gray-700 flex items-center cursor-pointer select-none">
                            <ShieldCheck size={16} className="mr-1 text-green-600" /> Este producto incluye garantía
                        </label>
                    </div>

                </div>
            </div>
            </form>
        </div>

        {/* Footer ... */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button form="product-form" type="submit" disabled={isSaving} className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md disabled:opacity-70 transition-transform active:scale-95">
              {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Guardar
            </button>
        </div>

      </div>
    </div>
  );
}
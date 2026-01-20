// src/components/products/ProductCard.jsx
import { Edit2, Package, Power, Trash2, UserPlus  } from 'lucide-react'; // Agregamos Trash2
import clsx from 'clsx';

export default function ProductCard({ product, onEdit, onDelete, onReactivate, onAssign, isInactiveView }) {
  
  // Procesamos categorías para mostrarlas
  const categories = product.product_categories?.map(pc => pc.category.name) || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full group">
      
      {/* 1. IMAGEN */}
      <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
        {product.photo_url ? (
          <img 
            src={product.photo_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <Package size={48} />
          </div>
        )}

        {/* Badge Garantía Flotante (Si tiene) */}
        {product.warranty && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
              GARANTÍA
            </div>
        )}
      </div>

      {/* 2. CONTENIDO */}
      <div className="p-4 flex-1 flex flex-col">
        
        {/* Título */}
        <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2 mb-1" title={product.name}>
             {product.name}
        </h3>

        {/* Categorías (Debajo del nombre) */}
        <div className="flex flex-wrap gap-1 mb-3">
          {categories.length > 0 ? (
            categories.map((cat, idx) => (
              <span key={idx} className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                {cat}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-gray-400 italic">Sin categoría</span>
          )}
        </div>

        <div className="mt-auto space-y-3">
            {/* Precios */}
            <div className="flex justify-between items-end border-t border-gray-50 pt-3">
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Costo (USD)</span>
                  <span className="text-xl font-bold text-gray-500">${product.purchase_price}</span>
               </div>
               <div className="flex flex-col items-end">
                  {/* CAMBIO: Especificamos CUP explícitamente */}
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Venta (CUP)</span>
                  <span className="text-xl font-bold text-blue-600">${product.sale_price}</span>
               </div>
            </div>

            {/* Stock y Acciones */}
            <div className="flex items-center justify-between pt-2">
                
                {/* Stock */}
                <div className={clsx(
                    "flex items-center px-2 py-1 rounded-lg text-xs font-bold",
                    product.stock === 0 ? "bg-red-100 text-red-700" :
                    product.stock < 3 ? "bg-orange-100 text-orange-700" :
                    "bg-green-100 text-green-700"
                )}>
                    <Package size={14} className="mr-1.5" />
                    {product.stock === 0 ? "Agotado" : `${product.stock} Stock`}
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2">
                   {isInactiveView ? (
                      <button 
                        onClick={() => onReactivate(product)}
                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                        title="Reactivar y poner stock en 1"
                      >
                         <Power size={18} />
                      </button>
                   ) : (
                      <>

{/* 🆕 BOTÓN ASIGNAR (Solo si onAssign existe, es decir, Storekeeper/Admin) */}
                        {onAssign && (
                            <button 
                                onClick={() => onAssign(product)}
                                className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition-colors"
                                title="Asignar a Vendedor"
                            >
                                <UserPlus size={18} />
                            </button>
                        )}

                        <button 
                            onClick={() => onEdit(product)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                            title="Editar"
                        >
                            <Edit2 size={18} />
                        </button>
                        {/* Botón Borrado Lógico */}
                        <button 
                            onClick={() => onDelete(product)}
                            className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                            title="Enviar a Papelera"
                        >
                            <Trash2 size={18} />
                        </button>
                      </>
                   )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
// Queries
import { GET_PRODUCTS, UPDATE_PRODUCT,RETURN_PRODUCT_FROM_SELLER, CREATE_PRODUCT, ASSIGN_PRODUCT, GET_SELLER_PRODUCTS } from '../graphql/products'; // Agregamos GET_SELLER_PRODUCTS


import { GET_CATEGORIES } from '../graphql/categories';
import { GET_USERS } from '../graphql/users'; // Necesario para llenar el select de vendedores
// UI
import { Search, Plus, Loader2, PackageOpen, Filter, Users, User, RefreshCw } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import AssignmentModal from '../components/products/AssignmentModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Inventory() {
  const { user } = useAuth();
  
  // 'active' | 'sellers' | 'inactive'
  const [viewMode, setViewMode] = useState('active'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState(''); // ID del vendedor seleccionado
const [returnProduct] = useMutation(RETURN_PRODUCT_FROM_SELLER);
  // Estados de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [productToAssign, setProductToAssign] = useState(null);

  // --- QUERIES PRINCIPALES ---
  const { data: productsData, loading: loadingProds, refetch: refetchProds } = useQuery(GET_PRODUCTS, {
    variables: { active: viewMode === 'active' },
    skip: viewMode === 'sellers', // No cargar productos globales si estamos viendo vendedores
    fetchPolicy: 'network-only'
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  
  // Cargar usuarios para el dropdown de la vista "Vendedores"
  const { data: usersData } = useQuery(GET_USERS);
  const sellersList = usersData?.users?.filter(u => u.role === 'seller' && u.active) || [];

  // Query específica: Productos del Vendedor Seleccionado
  const { data: sellerStockData, loading: loadingSellerStock, refetch: refetchSellerStock } = useQuery(GET_SELLER_PRODUCTS, {
    variables: { sellerId: parseInt(selectedSeller) },
    skip: viewMode !== 'sellers' || !selectedSeller, // Solo ejecuta si estamos en la tab correcta y hay vendedor
    fetchPolicy: 'network-only'
  });

  // --- MUTACIONES ---
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, { onCompleted: () => refetchProds() });
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT, { onCompleted: () => refetchProds() });
  const [assignProduct, { loading: assigning }] = useMutation(ASSIGN_PRODUCT);
  
  // (Aquí iría la mutación de retorno cuando actualicemos el backend)

  // --- LÓGICA DE FILTRADO ---
  
  // 1. Filtrado Global
  const filteredGlobalProducts = productsData?.products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                            p.product_categories.some(pc => pc.category.id_category === parseInt(selectedCategory));
    return matchesSearch && matchesCategory;
  }) || [];

  // 2. Filtrado Vendedores
  // Aunque ya traemos solo lo del vendedor, aplicamos el buscador por nombre localmente
  const filteredSellerStock = sellerStockData?.sellerProducts?.filter(item => {
     return item.product.name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];


  // --- HANDLERS ---
  const handleOpenCreate = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleOpenEdit = (product) => { setEditingProduct(product); setIsModalOpen(true); };
  
  const handleSoftDelete = async (product) => {
    if(!window.confirm(`¿Mover "${product.name}" a la papelera?`)) return;
    try {
        await updateProduct({
            variables: { id_product: product.id_product, input: { active: false } }
        });
        toast.success("Producto movido a papelera");
    } catch (e) { toast.error(e.message); }
  };

  const handleReactivate = async (product) => {
    // Confirmación opcional para evitar clics accidentales
    if(!window.confirm(`¿Reactivar "${product.name}"? Se establecerá el stock en 1 unidad.`)) return;

    try {
        await updateProduct({
            variables: { 
                id_product: product.id_product, 
                input: { 
                    active: true, // Lo marcamos como activo
                    stock: 1      // Le damos 1 de stock para que aparezca en inventario
                } 
            }
        });
        toast.success("Producto reactivado con éxito");
    } catch (e) {
        console.error(e);
        toast.error("Error al reactivar: " + e.message);
    }
};

  const handleOpenAssign = (product) => { setProductToAssign(product); setIsAssignModalOpen(true); };

  const handleAssign = async (data) => {
    try {
        await assignProduct({
            variables: {
                sellerId: parseInt(data.sellerId),
                productId: productToAssign.id_product,
                quantity: parseInt(data.quantity)
            }
        });
        toast.success("Asignado correctamente");
        setIsAssignModalOpen(false);
        // Si estamos viendo stock de vendedor, actualizarlo también
        if(viewMode === 'sellers' && selectedSeller === data.sellerId) refetchSellerStock();
    } catch (e) { toast.error(e.message); }
  };

  const handleSave = async (formData) => {
    try {
      // 1. Limpiamos los datos para que coincidan con el Schema GraphQL
      // Quitamos campos que no van en el 'input' (como id_product, __typename, arrays de objetos, etc)
      const inputData = {
          name: formData.name,
          description: formData.description,
          stock: formData.stock,
          purchase_price: formData.purchase_price,
          sale_price: formData.sale_price,
          sku: formData.sku,
          supplier_name: formData.supplier_name,
          photo_url: formData.photo_url,
          warranty: formData.warranty,
          active: true, // Siempre true al guardar desde aquí
          categoryIds: formData.categoryIds // El modal ya lo manda como array de números
      };

      if (editingProduct) {
        // --- MODO EDICIÓN ---
        await updateProduct({
          variables: { 
            id_product: editingProduct.id_product, // ID va fuera del input
            input: inputData                       // Datos van dentro del input
          }
        });
        toast.success('Producto actualizado correctamente');
      } else {
        // --- MODO CREACIÓN ---
        await createProduct({
          variables: { 
            input: inputData 
          }
        });
        toast.success('Producto creado correctamente');
      }
      
      setIsModalOpen(false); // Cerrar modal solo si no hubo error

    } catch (err) {
      console.error("Error al guardar:", err);
      // Mostramos el error exacto que devuelve GraphQL
      toast.error('Error: ' + err.message);
    }
};
  
  const handleReturnStock = async (item) => {
      // Pedimos confirmación simple con un prompt para la cantidad (rápido y efectivo)
      const qtyStr = prompt(`¿Cuántos "${item.product.name}" deseas devolver al almacén? (Máx: ${item.quantity})`, item.quantity);
      
      if (!qtyStr) return; // Cancelado
      const qty = parseInt(qtyStr);

      if (isNaN(qty) || qty <= 0 || qty > item.quantity) {
          toast.error("Cantidad inválida");
          return;
      }

      try {
          await returnProduct({
              variables: {
                  sellerId: parseInt(selectedSeller), // ID del vendedor seleccionado en el dropdown
                  productId: item.product.id_product,
                  quantity: qty
              }
          });
          
          toast.success("Producto retornado al almacén");
          refetchSellerStock(); // Actualizar la tabla del vendedor
          refetchProds();       // Actualizar la tabla del almacén (por si cambiamos de tab)
      } catch (e) {
          toast.error(e.message);
      }
  };


  return (
    <div className="pb-20 space-y-6">
       
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <PackageOpen className="mr-3 text-blue-600" /> Inventario
            </h1>
            <p className="text-gray-500 text-sm">Gestiona tus productos y existencias.</p>
          </div>
          {/* Botón solo visible en vistas de inventario propio */}
          {viewMode !== 'sellers' && (
              <button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center transition-transform active:scale-95">
                <Plus className="mr-2 h-5 w-5" /> Nuevo Producto
              </button>
          )}
       </div>

       {/* --- BARRA DE CONTROL (TABS + FILTROS) --- */}
       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
          
          {/* TABS SUPERIORES */}
          <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar">
             <button onClick={() => setViewMode('active')} className={clsx("flex-1 min-w-[100px] px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap", viewMode === 'active' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                En Almacén
             </button>
             <button onClick={() => setViewMode('sellers')} className={clsx("flex-1 min-w-[140px] px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap", viewMode === 'sellers' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                En Vendedores
             </button>
             <button onClick={() => setViewMode('inactive')} className={clsx("flex-1 min-w-[100px] px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap", viewMode === 'inactive' ? "bg-white text-red-500 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                Papelera
             </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center">
             
             {/* BUSCADOR (Común para todos) */}
             <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input 
                  type="text" 
                  placeholder={viewMode === 'sellers' ? "Buscar en posesión del vendedor..." : "Buscar producto..."}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>

             {/* FILTRO CONDICIONAL: CATEGORÍA (Global) O VENDEDOR (Sellers) */}
             {viewMode === 'sellers' ? (
                 <div className="relative w-full lg:w-72">
                    <User className="absolute left-3 top-3 text-purple-500 h-4 w-4" />
                    <select 
                      value={selectedSeller}
                      onChange={(e) => setSelectedSeller(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-purple-50 border border-purple-200 text-purple-900 font-medium rounded-xl focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                       <option value="">-- Seleccionar Vendedor --</option>
                       {sellersList.map(s => (
                          <option key={s.id_user} value={s.id_user}>{s.name}</option>
                       ))}
                    </select>
                 </div>
             ) : (
                 <div className="relative w-full lg:w-64">
                    <Filter className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                       <option value="all">Todas las Categorías</option>
                       {categoriesData?.categories?.map(cat => (
                          <option key={cat.id_category} value={cat.id_category}>{cat.name}</option>
                       ))}
                    </select>
                 </div>
             )}
          </div>
       </div>

       {/* --- CONTENIDO PRINCIPAL --- */}
       
       {/* VISTA 1: EN ALMACÉN / PAPELERA */}
       {viewMode !== 'sellers' && (
           <>
               {loadingProds ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
               ) : filteredGlobalProducts.length === 0 ? (
                  <div className="text-center py-20 opacity-50">
                     <PackageOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                     <p className="text-lg font-medium text-gray-500">No hay productos aquí.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {filteredGlobalProducts.map(product => (
                        <ProductCard 
                           key={product.id_product} 
                           product={product} 
                           onEdit={handleOpenEdit}
                           onDelete={handleSoftDelete}
                           onReactivate={handleReactivate}
                           onAssign={(user?.role === 'admin' || user?.role === 'storekeeper') ? handleOpenAssign : undefined}
                           isInactiveView={viewMode === 'inactive'}
                        />
                     ))}
                  </div>
               )}
           </>
       )}

       {/* VISTA 2: VENDEDORES */}
       {viewMode === 'sellers' && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
               {!selectedSeller ? (
                   <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                       <Users className="h-16 w-16 mb-4 text-purple-200" />
                       <p className="text-lg font-medium">Selecciona un vendedor para ver su inventario.</p>
                   </div>
               ) : loadingSellerStock ? (
                   <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-600 h-10 w-10" /></div>
               ) : filteredSellerStock.length === 0 ? (
                   <div className="text-center py-20 text-gray-500">
                       <p>Este vendedor no tiene mercancía asignada que coincida con la búsqueda.</p>
                   </div>
               ) : (
                   <div className="overflow-x-auto">
                       <table className="w-full text-left">
                           <thead className="bg-purple-50 text-purple-900 border-b border-purple-100">
                               <tr>
                                   <th className="px-6 py-4 font-bold text-sm">Producto</th>
                                   <th className="px-6 py-4 font-bold text-sm text-center">En Posesión</th>
                                   <th className="px-6 py-4 font-bold text-sm text-right">Precio Venta (CUP)</th>
                                   <th className="px-6 py-4 font-bold text-sm text-right">Acciones</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                               {filteredSellerStock.map(item => (
                                   <tr key={item.id_seller_product} className="hover:bg-gray-50 transition-colors">
                                       <td className="px-6 py-4">
                                           <div className="flex items-center gap-3">
                                               <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                   {item.product.photo_url && <img src={item.product.photo_url} className="w-full h-full object-cover" />}
                                               </div>
                                               <span className="font-medium text-gray-800">{item.product.name}</span>
                                           </div>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                           <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">
                                               {item.quantity} unid.
                                           </span>
                                       </td>
                                       <td className="px-6 py-4 text-right font-mono font-bold text-gray-600">
                                           {/* Aquí podrías calcular CUP real si tienes tasa, o mostrar USD */}
                                            ${item.product.sale_price} <span className="text-xs text-gray-400">USD base</span>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                           <button 
                                             onClick={() => handleReturnStock(item)}
                                             className="text-sm bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                                             title="Devolver al almacén principal"
                                           >
                                               <RefreshCw size={14} /> Devolver
                                           </button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               )}
           </div>
       )}

       {/* MODALES */}
       <ProductModal 
         isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
         productToEdit={editingProduct} categories={categoriesData?.categories || []}
         onSave={handleSave} isSaving={creating || updating}
       />

       <AssignmentModal 
         isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}
         product={productToAssign} onAssign={handleAssign} isAssigning={assigning}
       />
    </div>
  );
}
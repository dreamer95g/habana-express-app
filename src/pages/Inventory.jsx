// src/pages/Inventory.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../context/AuthContext'; // <--- ESTA ERA LA IMPORTACIÓN FALTANTE

// Queries y Mutaciones
import { 
  GET_PRODUCTS, 
  UPDATE_PRODUCT, 
  CREATE_PRODUCT, 
  ASSIGN_PRODUCT, 
  GET_SELLER_PRODUCTS, 
  RETURN_PRODUCT_FROM_SELLER 
} from '../graphql/products';
import { GET_CATEGORIES } from '../graphql/categories';
import { GET_USERS } from '../graphql/users';

// UI e Iconos
import { 
  Search, Plus, Loader2, PackageOpen, Users, 
  RefreshCw, Tag, ChevronRight, Filter 
} from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import AssignmentModal from '../components/products/AssignmentModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Inventory() {
  const { user } = useAuth();
  
  // Estados de control
  const [viewMode, setViewMode] = useState('active'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState('');

  // Estados de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [productToAssign, setProductToAssign] = useState(null);

  // --- QUERIES ---
  const { data: productsData, loading: loadingProds, refetch: refetchProds } = useQuery(GET_PRODUCTS, {
    variables: { active: viewMode === 'active' },
    skip: viewMode === 'sellers',
    fetchPolicy: 'network-only'
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: usersData } = useQuery(GET_USERS);
  const sellersList = usersData?.users?.filter(u => u.role === 'seller' && u.active) || [];

  const { data: sellerStockData, loading: loadingSellerStock, refetch: refetchSellerStock } = useQuery(GET_SELLER_PRODUCTS, {
    variables: { sellerId: parseInt(selectedSeller) },
    skip: viewMode !== 'sellers' || !selectedSeller,
    fetchPolicy: 'network-only'
  });

  // --- MUTACIONES ---
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, { onCompleted: () => refetchProds() });
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT, { onCompleted: () => refetchProds() });
  const [assignProduct, { loading: assigning }] = useMutation(ASSIGN_PRODUCT);
  const [returnProduct] = useMutation(RETURN_PRODUCT_FROM_SELLER);

  // --- FILTRADO ---
  const filteredGlobalProducts = productsData?.products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                            p.product_categories.some(pc => pc.category.id_category === parseInt(selectedCategory));
    return matchesSearch && matchesCategory;
  }) || [];

  const filteredSellerStock = sellerStockData?.sellerProducts?.filter(item => {
     return item.product.name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // --- HANDLERS ---
  const handleOpenCreate = () => { setEditingProduct(null); setIsModalOpen(true); };
  const handleOpenEdit = (product) => { setEditingProduct(product); setIsModalOpen(true); };
  const handleOpenAssign = (product) => { setProductToAssign(product); setIsAssignModalOpen(true); };

  const handleSave = async (formData) => {
    try {
      const inputData = {
          name: formData.name,
          description: formData.description,
          stock: formData.stock,
          purchase_price: formData.purchase_price,
          sale_price: formData.sale_price,
          photo_url: formData.photo_url,
          warranty: formData.warranty,
          active: true,
          categoryIds: formData.categoryIds 
      };

      if (editingProduct) {
        await updateProduct({ variables: { id_product: editingProduct.id_product, input: inputData } });
        toast.success('Actualizado');
      } else {
        await createProduct({ variables: { input: inputData } });
        toast.success('Creado');
      }
      setIsModalOpen(false);
    } catch (err) { toast.error(err.message); }
  };

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
    } catch (e) { toast.error(e.message); }
  };

  const handleReturnStock = async (item) => {
  // 1. Preguntamos la cantidad (útil para devoluciones parciales)
  const qtyStr = prompt(
    `¿Cuántos "${item.product.name}" deseas devolver al almacén?\n(Disponible con vendedor: ${item.quantity})`, 
    item.quantity
  );
  
  if (!qtyStr) return; // Si cancela el prompt
  const qty = parseInt(qtyStr);

  // Validaciones básicas
  if (isNaN(qty) || qty <= 0 || qty > item.quantity) {
      toast.error("Cantidad no válida");
      return;
  }

  try {
      await returnProduct({
          variables: {
              sellerId: parseInt(selectedSeller), // Usamos el ID del vendedor seleccionado arriba
              productId: item.product.id_product,
              quantity: qty
          }
      });
      
      toast.success("Mercancía devuelta al almacén");
      
      // 2. Refrescamos ambas listas para que los números cuadren al instante
      refetchSellerStock(); 
      refetchProds();
  } catch (e) {
      toast.error(e.message);
  }
};

  return (
    <div className="pb-24 px-2 md:px-0 relative">
       
      {/* 1. HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <PackageOpen className="mr-3 text-blue-600" size={28} /> Inventario
            </h1>
            <p className="text-gray-500 text-sm mt-1">Control global de mercancía y stock.</p>
          </div>
          <button 
            onClick={handleOpenCreate} 
            className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 items-center transition-all active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Nuevo Producto
          </button>
       </div>

       {/* 2. BARRA DE CONTROL (YA NO ES STICKY) */}
       <div className="mb-6 space-y-3 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
             
             {/* Pestañas de Modo */}
             <div className="flex p-1 bg-gray-100 rounded-2xl overflow-x-auto no-scrollbar">
                {[
                    {id: 'active', label: 'Almacén', color: 'blue'},
                    {id: 'sellers', label: 'Vendedores', color: 'purple'},
                    {id: 'inactive', label: 'Papelera', color: 'red'}
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setViewMode(tab.id)} 
                        className={clsx(
                            "flex-1 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                            viewMode === tab.id 
                                ? `bg-white text-${tab.id === 'active' ? 'blue' : tab.id === 'sellers' ? 'purple' : 'red'}-600 shadow-sm` 
                                : "text-gray-400"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
             </div>

             {/* Buscador */}
             <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                />
             </div>

             {/* Chips de Categoría */}
             {viewMode !== 'sellers' && (
                 <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    <button 
                        onClick={() => setSelectedCategory('all')}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all border",
                            selectedCategory === 'all' ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-400"
                        )}
                    >
                        Todos
                    </button>
                    {categoriesData?.categories?.map(cat => (
                        <button 
                            key={cat.id_category}
                            onClick={() => setSelectedCategory(cat.id_category)}
                            className={clsx(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all border",
                                selectedCategory === cat.id_category ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-400"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                 </div>
             )}

             {/* Selector de Vendedor */}
             {viewMode === 'sellers' && (
                <select 
                    value={selectedSeller}
                    onChange={(e) => setSelectedSeller(e.target.value)}
                    className="w-full px-4 py-2.5 bg-purple-50 text-purple-700 font-bold rounded-2xl border-none text-xs outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">-- Seleccionar Vendedor --</option>
                    {sellersList.map(s => <option key={s.id_user} value={s.id_user}>{s.name}</option>)}
                </select>
             )}
       </div>

       {/* LISTADO */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mt-4">
            {viewMode !== 'sellers' ? (
                loadingProds ? <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 h-10 w-10"/></div> :
                filteredGlobalProducts.map(p => (
                    <ProductCard 
                        key={p.id_product} 
                        product={p} 
                        onEdit={handleOpenEdit} 
                        onDelete={(p) => updateProduct({variables: {id_product: p.id_product, input: {active: false}}})} 
                        onReactivate={(p) => updateProduct({variables: {id_product: p.id_product, input: {active: true, stock: 1}}})}
                        onAssign={(user?.role === 'admin' || user?.role === 'storekeeper') ? handleOpenAssign : undefined}
                        isInactiveView={viewMode === 'inactive'}
                    />
                ))
            ) : (
                <div className="col-span-full space-y-3">
                    {!selectedSeller ? (
                        <div className="text-center py-20 text-gray-300">
                            <Users size={48} className="mx-auto mb-2 opacity-20" />
                            <p className="font-bold text-sm">Selecciona un vendedor arriba</p>
                        </div>
                    ) : filteredSellerStock.map(item => (
                        <div key={item.id_seller_product} className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-gray-100 rounded-xl overflow-hidden">
                                    {item.product.photo_url && <img src={item.product.photo_url} className="w-full h-full object-cover"/>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{item.product.name}</h4>
                                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">STOCK: {item.quantity}</span>
                                </div>
                            </div>
                            <button 
                               onClick={() => handleReturnStock(item)}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
       </div>

       {/* FAB PARA MÓVIL */}
       {viewMode !== 'sellers' && (
           <button 
             onClick={handleOpenCreate}
             className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-30"
           >
              <Plus size={32} />
           </button>
       )}

       <ProductModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          productToEdit={editingProduct} 
          categories={categoriesData?.categories || []} 
          onSave={handleSave} 
          isSaving={creating || updating}
       />

       <AssignmentModal 
         isOpen={isAssignModalOpen} 
         onClose={() => setIsAssignModalOpen(false)} 
         product={productToAssign} 
         onAssign={handleAssign} 
         isAssigning={assigning}
       />
    </div>
  );
}
// src/pages/POS.jsx
import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { GET_SELLER_PRODUCTS } from '../graphql/products';
import { GET_CONFIG } from '../graphql/configuration';
import { CREATE_SALE } from '../graphql/sales';
import { Search, ShoppingCart, Trash2, Plus, Minus, Loader2, Package, AlertCircle, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

// Importar el nuevo componente móvil
import MobileCartSheet from '../components/sales/MobileCartSheet';

export default function POS() {
  const { user } = useAuth();
  
  // --- SEGURIDAD ---
  if (user.role === 'admin') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
              <AlertCircle className="h-16 w-16 mb-4 text-red-400" />
              <h2 className="text-xl font-bold">Modo Administrador</h2>
              <p>El POS está optimizado para Vendedores.</p>
          </div>
      );
  }

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false); // Estado para el modal móvil

  // --- QUERIES ---
  const { data: configData } = useQuery(GET_CONFIG);
  const config = configData?.systemConfiguration?.[0];
  const exchangeRate = config?.default_exchange_rate || 1;
  const commissionPct = config?.seller_commission_percentage || 0;

  const { data: sellerProds, loading, refetch } = useQuery(GET_SELLER_PRODUCTS, {
    variables: { sellerId: parseInt(user.id_user) },
    fetchPolicy: 'network-only'
  });

  const [createSale, { loading: processing }] = useMutation(CREATE_SALE, {
     onCompleted: () => { refetch(); }
  });

  // --- FILTRADO ---
  const availableProducts = useMemo(() => {
      const rawList = sellerProds?.sellerProducts
          ?.filter(sp => sp.quantity > 0) 
          .map(sp => ({
              id: sp.product.id_product,
              name: sp.product.name,
              price: sp.product.sale_price, // Precio ya viene en CUP o USD según tu lógica, asumo CUP final
              stock: sp.quantity,
              photo: sp.product.photo_url
          })) || [];

      return rawList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sellerProds, searchTerm]);

// --- LOGICA CARRITO CORREGIDA ---
  const addToCart = (product) => {
    // 1. Buscamos si ya existe usando el estado actual 'cart' (fuera del setter)
    const existingItem = cart.find(item => item.id === product.id);

    // CASO A: El producto YA está en el carrito
    if (existingItem) {
        // Verificamos el stock ANTES de intentar actualizar
        if (existingItem.qty >= product.stock) {
            // Toast fuera del setter -> Se ejecuta una sola vez
            toast.error("Límite de stock alcanzado", { id: 'stock-limit' }); 
            return; // No hacemos nada más
        }
        
        // Si hay stock, actualizamos el estado limpiamente
        setCart(prev => prev.map(item => 
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        ));
    } 
    
    // CASO B: Es un producto NUEVO
    else {
        // Toast fuera del setter -> Se ejecuta una sola vez
        toast.success("Agregado al carrito", { 
            duration: 1000, 
            position: 'bottom-center',
            id: 'added-cart' // id opcional para evitar duplicados rápidos
        });
        
        // Actualizamos estado
        setCart(prev => [...prev, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              const newQty = item.qty + delta;
              if (newQty > item.stock) {
                  toast.error("Stock insuficiente");
                  return item;
              }
              return newQty > 0 ? { ...item, qty: newQty } : item;
          }
          return item;
      }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const totalCUP = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const estimatedCommission = totalCUP * (commissionPct / 100);

  const handleCheckout = async () => {
      if (cart.length === 0) return toast.error("Carrito vacío");
      if (!buyerPhone) return toast.error("Ingresa el teléfono del cliente");

      try {
          await createSale({
              variables: {
                  sellerId: parseInt(user.id_user),
                  exchange_rate: parseFloat(exchangeRate),
                  total_cup: totalCUP,
                  buyer_phone: buyerPhone,
                  payment_method: paymentMethod,
                  notes: "Venta POS",
                  items: cart.map(i => ({ productId: i.id, quantity: i.qty }))
              }
          });
          toast.success("¡Venta Exitosa!");
          setCart([]);
          setBuyerPhone('');
          setIsMobileCartOpen(false); // Cerrar modal móvil si estaba abierto
      } catch (err) {
          toast.error(err.message);
      }
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full md:flex-row gap-4 pb-20 md:pb-0 relative">
       
       {/* 1. SECCIÓN PRODUCTOS (Izquierda / Full Mobile) */}
       <div className="flex-1 bg-white rounded-none md:rounded-2xl shadow-none md:shadow-sm border-x-0 md:border border-gray-100 flex flex-col overflow-hidden h-full">
          
          {/* Header Sticky */}
          <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-3">
                 <h2 className="font-bold text-gray-800 text-lg">Catálogo</h2>
                 <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                    Tasa: ${exchangeRate}
                 </span>
             </div>
             
             {/* Buscador optimizado para dedos */}
             <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                <input 
                    type="text" placeholder=" Buscar producto..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50/30">
             {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-blue-500"/> : 
              availableProducts.length === 0 ? <div className="text-center mt-10 text-gray-400">No hay productos.</div> :
              
              /* GRID RESPONSIVE: 2 columnas en móvil, más en escritorio */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-24 md:pb-0">
                 {availableProducts.map(prod => (
                    <div 
                        key={prod.id} 
                        onClick={() => addToCart(prod)} 
                        className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 active:scale-95 transition-all cursor-pointer flex flex-col h-full"
                    >
                       <div className="aspect-square bg-gray-100 rounded-lg mb-2 relative overflow-hidden">
                           {prod.photo ? (
                               <img src={prod.photo} className="w-full h-full object-cover"/>
                           ) : (
                               <Package className="absolute inset-0 m-auto text-gray-300 h-8 w-8"/>
                           )}
                           {/* Badge de Stock */}
                           <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                              Stock: {prod.stock}
                           </span>
                       </div>
                       
                       <h3 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-2 leading-tight flex-1">
                          {prod.name}
                       </h3>
                       
                       <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                          <p className="text-blue-600 font-extrabold text-sm sm:text-base">${prod.price}</p>
                          <div className="bg-blue-50 text-blue-600 p-1 rounded-full">
                              <Plus size={14} />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
             }
          </div>
       </div>

       {/* 2. SECCIÓN TICKET DESKTOP (Oculto en móvil) */}
       <div className="hidden md:flex w-80 bg-white rounded-2xl shadow-xl border border-gray-100 flex-col h-[calc(100vh-6rem)] sticky top-4">
           {/* ... (Este es el mismo código de escritorio que ya tenías, no cambia mucho) ... */}
           <div className="p-4 bg-blue-600 text-white rounded-t-2xl font-bold flex items-center shadow-md">
               <ShoppingCart className="mr-2 h-5 w-5"/> Ticket de Venta
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
               {cart.length === 0 && <p className="text-center text-gray-400 text-sm mt-4">Carrito vacío</p>}
               {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center bg-white border border-gray-100 p-2 rounded-lg text-sm shadow-sm">
                       <div className="flex-1 min-w-0 pr-2">
                           <div className="font-bold truncate text-gray-800">{item.name}</div>
                           <div className="text-blue-600 text-xs font-medium">${item.price * item.qty}</div>
                       </div>
                       <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                           <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded transition"><Minus size={12}/></button>
                           <span className="w-5 text-center font-bold text-xs">{item.qty}</span>
                           <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded transition"><Plus size={12}/></button>
                       </div>
                       <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 ml-2 p-1"><Trash2 size={14}/></button>
                   </div>
               ))}
           </div>

           <div className="p-4 bg-white border-t space-y-3 rounded-b-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
               <input type="text" placeholder="📱 Teléfono Cliente" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
               
               <div className="flex gap-2 text-xs">
                   <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-2 rounded-lg border font-bold ${paymentMethod==='cash'?'bg-green-50 border-green-200 text-green-700':'bg-white text-gray-500'}`}>Efectivo</button>
                   <button onClick={() => setPaymentMethod('transfer')} className={`flex-1 py-2 rounded-lg border font-bold ${paymentMethod==='transfer'?'bg-blue-50 border-blue-200 text-blue-700':'bg-white text-gray-500'}`}>Transf.</button>
               </div>

               <div className="space-y-1 pt-2 border-t">
                   <div className="flex justify-between text-lg font-bold">
                       <span>Total:</span><span className="text-blue-600">${totalCUP.toFixed(0)}</span>
                   </div>
               </div>

               <button onClick={handleCheckout} disabled={processing || cart.length===0} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-transform active:scale-95">
                   {processing ? <Loader2 className="animate-spin mx-auto"/> : "COBRAR"}
               </button>
           </div>
       </div>

       {/* 3. BARRA FLOTANTE MÓVIL (Sticky Bottom) */}
       {/* Solo visible en móvil y si hay items en el carrito */}
       {cart.length > 0 && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-40">
              <button 
                  onClick={() => setIsMobileCartOpen(true)}
                  className="w-full bg-blue-600 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between active:scale-95 transition-transform"
              >
                  <div className="flex items-center gap-2">
                      <div className="bg-white/20 px-3 py-1 rounded-lg font-bold text-sm">
                          {cart.reduce((acc, i) => acc + i.qty, 0)} ítems
                      </div>
                      <div className="flex flex-col items-start leading-none">
                          <span className="text-[10px] opacity-80 uppercase font-bold">Total</span>
                          <span className="text-lg font-black">${totalCUP}</span>
                      </div>
                  </div>
                  <div className="flex items-center font-bold text-sm">
                      Ver Carrito <ChevronUp className="ml-1 animate-bounce" size={16}/>
                  </div>
              </button>
          </div>
       )}

       {/* 4. MODAL COMPLETO MÓVIL (Importado) */}
       <MobileCartSheet 
         isOpen={isMobileCartOpen}
         onClose={() => setIsMobileCartOpen(false)}
         cart={cart}
         updateQty={updateQty}
         removeFromCart={removeFromCart}
         totalCUP={totalCUP}
         estimatedCommission={estimatedCommission}
         buyerPhone={buyerPhone}
         setBuyerPhone={setBuyerPhone}
         paymentMethod={paymentMethod}
         setPaymentMethod={setPaymentMethod}
         handleCheckout={handleCheckout}
         processing={processing}
       />
    </div>
  );
}
import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { GET_SELLER_PRODUCTS } from '../graphql/products'; // Solo esta query
import { GET_CONFIG } from '../graphql/configuration';
import { CREATE_SALE } from '../graphql/sales';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Loader2, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function POS() {
  const { user } = useAuth();
  
  // Seguridad extra por si un Admin entra por URL directa
  if (user.role === 'admin') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <AlertCircle className="h-16 w-16 mb-4 text-red-400" />
              <h2 className="text-xl font-bold">Modo Administrador</h2>
              <p>Para vender, por favor crea un usuario Vendedor y accede con él.</p>
              <p className="text-sm mt-2">Puedes gestionar las ventas en "Historial Ventas".</p>
          </div>
      );
  }

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // --- QUERIES ---
  const { data: configData } = useQuery(GET_CONFIG);
  const config = configData?.systemConfiguration?.[0];
  const exchangeRate = config?.default_exchange_rate || 1;
  const commissionPct = config?.seller_commission_percentage || 0;

  // Carga SOLO productos del vendedor
  const { data: sellerProds, loading, refetch } = useQuery(GET_SELLER_PRODUCTS, {
    variables: { sellerId: parseInt(user.id_user) },
    fetchPolicy: 'network-only'
  });

  const [createSale, { loading: processing }] = useMutation(CREATE_SALE, {
     onCompleted: () => { refetch(); }
  });

  // --- PRODUCTOS DISPONIBLES ---
  const availableProducts = useMemo(() => {
      const rawList = sellerProds?.sellerProducts
          ?.filter(sp => sp.quantity > 0) 
          .map(sp => ({
              id: sp.product.id_product,
              name: sp.product.name,
              price: sp.product.sale_price,
              stock: sp.quantity,
              photo: sp.product.photo_url
          })) || [];

      return rawList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sellerProds, searchTerm]);


  // --- CARRITO ---
  const addToCart = (product) => {
    setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
            if (existing.qty >= product.stock) {
                toast.error("Has alcanzado tu límite de stock asignado");
                return prev;
            }
            return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
        }
        return [...prev, { ...product, qty: 1 }];
    });
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

  // --- CÁLCULOS ---
  const totalCUP = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const estimatedCommission = totalCUP * (commissionPct / 100);

  const handleCheckout = async () => {
      if (cart.length === 0) return toast.error("Carrito vacío");
      if (!buyerPhone) return toast.error("Ingresa el teléfono");

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
          toast.success("Venta registrada");
          setCart([]);
          setBuyerPhone('');
      } catch (err) {
          toast.error(err.message);
      }
  };

  // --- RENDER (Igual que antes pero sin condicionales de admin) ---
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 pb-2">
       {/* IZQUIERDA: Grid de Productos */}
       <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h2 className="font-bold text-gray-800">Tu Inventario</h2>
             <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                Tasa: ${exchangeRate}
             </span>
          </div>
          
          <div className="p-4 border-b border-gray-100">
             <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input 
                    type="text" placeholder="Buscar..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
             {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-blue-500"/> : 
              availableProducts.length === 0 ? <div className="text-center mt-10 text-gray-400">Sin productos asignados.</div> :
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {availableProducts.map(prod => (
                    <div key={prod.id} onClick={() => addToCart(prod)} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 cursor-pointer group">
                       <div className="h-28 bg-gray-100 rounded-lg mb-2 relative overflow-hidden">
                           {prod.photo ? <img src={prod.photo} className="w-full h-full object-cover"/> : <Package className="m-auto mt-8 text-gray-300"/>}
                           <span className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">x{prod.stock}</span>
                       </div>
                       <h3 className="font-bold text-sm line-clamp-1">{prod.name}</h3>
                       <p className="text-blue-600 font-bold">${prod.price}</p>
                    </div>
                 ))}
              </div>
             }
          </div>
       </div>

       {/* DERECHA: Ticket (Sin cambios mayores, solo quitando lógica admin) */}
       <div className="w-full md:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col">
           <div className="p-4 bg-blue-600 text-white rounded-t-2xl font-bold flex items-center">
               <ShoppingCart className="mr-2 h-5 w-5"/> Ticket
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-sm">
                       <div className="flex-1">
                           <div className="font-bold truncate w-32">{item.name}</div>
                           <div className="text-blue-600 text-xs">${item.price * item.qty}</div>
                       </div>
                       <div className="flex items-center gap-1">
                           <button onClick={() => updateQty(item.id, -1)} className="p-1 bg-white border rounded"><Minus size={12}/></button>
                           <span className="w-4 text-center font-bold">{item.qty}</span>
                           <button onClick={() => updateQty(item.id, 1)} className="p-1 bg-white border rounded"><Plus size={12}/></button>
                       </div>
                       <button onClick={() => removeFromCart(item.id)} className="text-red-400 ml-1"><Trash2 size={14}/></button>
                   </div>
               ))}
           </div>

           <div className="p-4 bg-gray-50 border-t space-y-3 rounded-b-2xl">
               <input type="text" placeholder="Teléfono Cliente" className="w-full p-2 border rounded-lg text-sm" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} />
               
               <div className="flex gap-2 text-xs">
                   <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-2 rounded border ${paymentMethod==='cash'?'bg-green-100 border-green-300':'bg-white'}`}>Efectivo</button>
                   <button onClick={() => setPaymentMethod('transfer')} className={`flex-1 py-2 rounded border ${paymentMethod==='transfer'?'bg-blue-100 border-blue-300':'bg-white'}`}>Transf.</button>
               </div>

               <div className="space-y-1 pt-2 border-t">
                   <div className="flex justify-between text-green-600 text-xs font-bold">
                       <span>Ganancia:</span><span>+${estimatedCommission.toFixed(0)}</span>
                   </div>
                   <div className="flex justify-between text-lg font-bold">
                       <span>Total:</span><span className="text-blue-600">${totalCUP.toFixed(0)}</span>
                   </div>
               </div>

               <button onClick={handleCheckout} disabled={processing || cart.length===0} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                   {processing ? <Loader2 className="animate-spin mx-auto"/> : "COBRAR"}
               </button>
           </div>
       </div>
    </div>
  );
}
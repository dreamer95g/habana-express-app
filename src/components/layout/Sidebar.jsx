// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_CONFIG } from '../../graphql/configuration';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, FileText, 
  Settings, LogOut, Truck, Tag, RotateCcw, ChevronRight 
} from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const { user, logout } = useAuth();
  
  // 1. Obtener el logo de la configuración
  const { data: configData } = useQuery(GET_CONFIG);
  const systemLogo = configData?.systemConfiguration?.logo_url;
  const defaultLogo = "https://res.cloudinary.com/ddnqbgqfn/image/upload/v1769537581/habana_express_store/img-1769548374002-829424593-logo.png";

  const menus = [
    { name: 'Inicio', path: '/', icon: LayoutDashboard, roles: ['admin', 'seller', 'storekeeper'] },
    { name: 'Inventario', path: '/inventory', icon: Package, roles: ['storekeeper', 'admin'] },
    { name: 'Categorías', path: '/categories', icon: Tag, roles: ['admin'] },
    { name: 'Devoluciones', path: '/returns', icon: RotateCcw, roles: ['admin', 'storekeeper'] },  
    { name: 'Vender', path: '/pos', icon: ShoppingBag, roles: ['seller'] }, 
    { name: 'Historial Ventas', path: '/sales', icon: FileText, roles: ['admin'] },
    { name: 'Envíos', path: '/shipments', icon: Truck, roles: ['admin'] },
    { name: 'Usuarios', path: '/users', icon: Users, roles: ['admin'] },
    { name: 'Configuración', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const allowedMenus = menus.filter(item => item.roles.includes(user?.role));

  // src/components/layout/Sidebar.jsx
// ... (imports y lógica inicial igual)

return (
  <>
    {/* OVERLAY: Fondo oscuro con transición de opacidad lenta */}
    <div 
      className={clsx(
        "fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden",
        "z-[80] top-[64px]", 
        "transition-opacity duration-500 ease-in-out", // 👈 Transición lenta
        (isOpen && isMobile) ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    />

    {/* SIDEBAR: Con transición de movimiento y ancho */}
    <aside 
      className={clsx(
        "bg-white flex flex-col border-r border-gray-100",
        "z-[90] fixed left-0 top-[64px] h-[calc(100vh-64px)]", 
        "transition-all duration-500 ease-in-out transform", // 👈 Transición lenta y suave
        
        // Lógica de visibilidad
        isOpen 
          ? "translate-x-0 w-72 opacity-100" 
          : "-translate-x-full w-0 lg:w-0 opacity-0 pointer-events-none",
        
        // En escritorio, si está abierto, usamos sticky para que empuje el contenido suavemente
        !isMobile && isOpen && "sticky"
      )}
    >
      {/* 
          IMPORTANTE: Envolvemos el contenido en un div de ancho fijo 
          para que el texto NO se amontone mientras el sidebar se cierra.
      */}
      <div className="w-72 flex flex-col h-full flex-shrink-0">
        
        {/* --- CABECERA CON LOGO --- */}
        <div className="flex flex-col items-center justify-center py-6 px-4 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white flex-shrink-0">
          <div className="relative h-20 w-full flex items-center justify-center">
             <div className="absolute inset-0 bg-blue-50 rounded-full opacity-40 blur-md transform scale-75"></div>
             <img 
                src={systemLogo || defaultLogo} 
                className="relative max-h-full max-w-[80%] object-contain rounded-full" 
                alt="Habana Express"
             />
          </div>
          <h2 className="mt-3 text-lg font-black text-gray-800 tracking-tighter leading-none whitespace-nowrap">
            Habana<span className="text-blue-600">Express</span>
          </h2>
        </div>

        {/* --- NAVEGACIÓN --- */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5 custom-scrollbar">
          {allowedMenus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose()}
              className={({ isActive }) => clsx(
                "flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 whitespace-nowrap",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center">
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t border-gray-50 flex-shrink-0 bg-gray-50/30">
           <button 
             onClick={logout} 
             className="flex items-center justify-center w-full px-4 py-3 text-xs font-black text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-95 uppercase tracking-widest whitespace-nowrap"
           >
             <LogOut className="mr-2 h-4 w-4" />
             Cerrar Sesión
           </button>
        </div>
      </div>
    </aside>
  </>
);
}
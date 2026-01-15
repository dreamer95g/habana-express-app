// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Package, Users, FileText, Settings, LogOut, Truck, Flame } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const { user, logout } = useAuth();

  const menus = [
    { name: 'Inicio', path: '/', icon: LayoutDashboard, roles: ['admin', 'seller', 'storekeeper'] },
    { name: 'Vender (POS)', path: '/pos', icon: ShoppingBag, roles: ['seller', 'admin'] },
    { name: 'Inventario', path: '/inventory', icon: Package, roles: ['storekeeper', 'admin'] },
    { name: 'Envíos', path: '/shipments', icon: Truck, roles: ['admin', 'storekeeper'] },
    { name: 'Usuarios', path: '/users', icon: Users, roles: ['admin'] },
    { name: 'Reportes', path: '/reports', icon: FileText, roles: ['admin'] },
    { name: 'Configuración', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const allowedMenus = menus.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* 1. OVERLAY (Solo Móvil) */}
      <div 
        className={clsx(
          "fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden",
          (isOpen && isMobile) ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* 2. SIDEBAR CONTAINER */}
      <aside 
        className={clsx(
          "bg-white shadow-xl h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ease-in-out border-r border-gray-100",
          // Posicionamiento
          isMobile ? "fixed inset-y-0 left-0 z-40 w-64 top-16" : "sticky top-16", 
          // Ancho dinámico en Desktop
          (!isMobile && !isOpen) ? "w-0 overflow-hidden opacity-0" : "w-64 opacity-100",
          // Transformación en Móvil
          (isMobile && !isOpen) ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Header del Sidebar (Logo) */}
        <div className="flex items-center justify-center h-20 border-b border-gray-100 flex-shrink-0">
          <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md">
            <Flame size={24} fill="currentColor" />
          </div>
          <span className="ml-3 text-lg font-bold text-gray-800 tracking-tight whitespace-nowrap">
            Habana<span className="text-orange-500">Express</span>
          </span>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {allowedMenus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose()}
              className={({ isActive }) => clsx(
                "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap",
                isActive 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {/* CORRECCIÓN: Usamos una función interna para acceder a isActive en el icono */}
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={clsx(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors", 
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} 
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
           <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
             <LogOut className="mr-3 h-5 w-5" />
             Cerrar Sesión
           </button>
        </div>
      </aside>
    </>
  );
}
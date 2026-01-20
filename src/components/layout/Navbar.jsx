// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Menu, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '../../graphql/users';
import UserModal from '../users/UserModal';
import toast from 'react-hot-toast';


export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

   const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);


    const handleSelfUpdate = async (data) => {
    try {
        const input = {
            name: data.name,
            phone: data.phone,
            email: data.email,
            photo_url: data.photo_url,
            telegram_chat_id: data.telegram_chat_id,
            // NO enviamos rol
        };
        if (data.password) input.password = data.password;

        const res = await updateUser({
            variables: { id_user: user.id_user, input }
        });

        // IMPORTANTE: Actualizar el contexto de Auth para que se refresque la foto/nombre en el Navbar
        // Aquí asumimos que updateAuth es una función que agregaremos al contexto, 
        // O simplemente forzamos un reload o actualizamos el localStorage manualmente.
        // Por simplicidad ahora:
        const updatedUser = { ...user, ...res.data.updateUser };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Recarga rápida para aplicar cambios en toda la app
        
        toast.success('Perfil actualizado');
        setIsProfileModalOpen(false);
    } catch (e) {
        toast.error(e.message);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md h-16 flex items-center justify-between px-4 z-20 sticky top-0">
      
      {/* IZQUIERDA: Botón Hamburguesa (Visible SIEMPRE ahora) */}
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg text-white hover:bg-white/20 focus:outline-none transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Título (Opcional, ya que tenemos logo en sidebar) */}
        {/* <h1 className="ml-4 text-xl font-bold text-white tracking-wide hidden md:block">
          
        </h1> */}
      </div>

      {/* DERECHA: Perfil de Usuario */}
      <div className="ml-auto relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-3 focus:outline-none group"
        >
            <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-white group-hover:text-blue-100 transition">{user?.name}</p>
                <p className="text-xs text-blue-200 capitalize">{user?.role}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-sm">
                {user?.photo_url ? (
                    <img src={user.photo_url} alt="User" className="h-full w-full object-cover" />
                ) : (
                    <User className="text-white h-6 w-6" />
                )}
            </div>
            <ChevronDown className="h-4 w-4 text-blue-200" />
        </button>

        {/* Dropdown Menu */}
        <div className={clsx(
            "absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 transform transition-all duration-200 origin-top-right ring-1 ring-black ring-opacity-5 z-50",
            isDropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}>
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500 uppercase font-semibold">Cuenta</p>
                {/* <p className="text-sm font-bold text-gray-900 truncate mt-1">{user?.phone}</p> */}
                <p className="text-sm font-bold text-gray-900 truncate mt-1">
                    {user?.phone || 'Sin teléfono'}
                </p>
            </div>

            <div className="py-1">
              {/* Botón Editar Perfil */}
              <button 
                onClick={() => {
                    setIsDropdownOpen(false); // Cerrar dropdown
                    setIsProfileModalOpen(true); // Abrir modal
                }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                  Editar Perfil
              </button>
              
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                  Salir del sistema
              </button>
            </div>
            
            {/* <div className="py-1">
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                  Salir del sistema
              </button>
            </div> */}
        </div>
      </div>

       <UserModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userToEdit={user} // Pasamos el usuario actual del AuthContext
        onSave={handleSelfUpdate}
        isSaving={updating}
        isSelfEdit={true} // Activa el modo "Mi Perfil"
        isAdmin={user?.role === 'admin'} // Solo para saber si puede ver roles (aunque selfEdit lo deshabilita)
      />
    </header>
  );
}
// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
// 👇 AQUÍ ESTABAN FALTANDO IMPORTACIONES
import { Menu, User, ChevronDown, Database, Loader2, Phone, UserCog, LogOut } from 'lucide-react';
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
  
  // Estado para la descarga del backup
  const [isDownloading, setIsDownloading] = useState(false);

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);

  const handleSelfUpdate = async (data) => {
    try {
        const input = {
            name: data.name,
            phone: data.phone,
            email: data.email,
            photo_url: data.photo_url,
            telegram_chat_id: data.telegram_chat_id,
        };
        if (data.password) input.password = data.password;

        const res = await updateUser({
            variables: { id_user: user.id_user, input }
        });

        const updatedUser = { ...user, ...res.data.updateUser };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(""); 
        
        toast.success('Perfil actualizado');
        setIsProfileModalOpen(false);
    } catch (e) {
        toast.error(e.message);
    }
  };

  // Función de Backup
  const handleBackup = async () => {
    setIsDownloading(true);
    const toastId = toast.loading('Generando respaldo...');

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/backup`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al descargar respaldo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `habana_backup_${date}.sql`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Respaldo descargado', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('No se pudo crear el respaldo', { id: toastId });
    } finally {
      setIsDownloading(false);
      setIsDropdownOpen(false);
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
      
      {/* Botón Menú */}
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg text-white hover:bg-white/20 focus:outline-none transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Perfil de Usuario */}
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
            "absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 transform transition-all duration-200 origin-top-right ring-1 ring-black ring-opacity-5 z-50",
            isDropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}>
            {/* Header del Dropdown con Teléfono */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Cuenta Conectada</p>
                <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={14} className="text-blue-500"/>
                    <p className="text-sm font-bold truncate">
                        {user?.phone || 'Sin teléfono'}
                    </p>
                </div>
            </div>

            <div className="py-2">
              {/* Botón Editar Perfil */}
              <button 
                onClick={() => {
                    setIsDropdownOpen(false);
                    setIsProfileModalOpen(true);
                }} 
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <UserCog size={16} />
                  </div>
                  <span className="font-medium">Editar Perfil</span>
              </button>

              {/* Botón Backup (Solo Admin) */}
              {user?.role === 'admin' && (
                 <button 
                   onClick={handleBackup}
                   disabled={isDownloading}
                   className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                 >
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                      {isDownloading ? <Loader2 className="animate-spin h-4 w-4"/> : <Database size={16} />}
                    </div>
                    <span className="font-medium">{isDownloading ? 'Generando...' : 'Respaldo BD'}</span>
                 </button>
              )}
              
              <div className="border-t border-gray-100 my-1"></div>

              {/* Botón Salir */}
              <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors group">
                  <div className="p-1.5 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors">
                    <LogOut size={16} />
                  </div>
                  <span className="font-bold">Cerrar Sesión</span>
              </button>
            </div>
        </div>
      </div>

       <UserModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userToEdit={user}
        onSave={handleSelfUpdate}
        isSaving={updating}
        isSelfEdit={true}
        isAdmin={user?.role === 'admin'}
      />
    </header>
  );
}
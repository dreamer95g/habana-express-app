// src/pages/Users.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, CREATE_USER, UPDATE_USER, DELETE_USER } from '../graphql/users';
import { Plus, Search, Edit2, Trash2, User as UserIcon, Loader2, AlertCircle, Phone, MessageSquare, ShieldCheck, Mail } from 'lucide-react';
import UserModal from '../components/users/UserModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data, loading, error } = useQuery(GET_USERS);
  
  const [createUser, { loading: creating }] = useMutation(CREATE_USER, { refetchQueries: [{ query: GET_USERS }] });
  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, { refetchQueries: [{ query: GET_USERS }] });
  const [deleteUser] = useMutation(DELETE_USER, { refetchQueries: [{ query: GET_USERS }] });

  const filteredUsers = data?.users?.filter(u => 
     u.active && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm))
  ) || [];

  const handleOpenCreate = () => { setEditingUser(null); setIsModalOpen(true); };
  const handleOpenEdit = (user) => { setEditingUser(user); setIsModalOpen(true); };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Desactivar a ${user.name}?`)) {
       try {
         await deleteUser({ variables: { id_user: user.id_user } });
         toast.success('Usuario desactivado');
       } catch (e) { toast.error(e.message); }
    }
  };

  const handleSave = async (data) => {
    try {
        if (editingUser) {
            const input = { ...data, active: true };
            delete input.__typename;
            await updateUser({ variables: { id_user: editingUser.id_user, input } });
            toast.success('Actualizado');
        } else {
            const createInput = { ...data, password_hash: data.password };
            await createUser({ variables: { input: createInput } });
            toast.success('Usuario creado');
        }
        setIsModalOpen(false);
    } catch (e) { toast.error(e.message); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;

  return (
    <div className="pb-20 px-2 md:px-0">
       
       {/* HEADER ESTANDARIZADO */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-left">
         <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center">
                <ShieldCheck className="mr-3 text-blue-600" size={28} /> Gestión de Equipo
            </h1>
            <p className="text-gray-500 text-sm mt-1">Administra el acceso y roles del personal.</p>
         </div>
         <button onClick={handleOpenCreate} className="w-full md:w-auto bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center justify-center active:scale-95 transition-all">
            <Plus className="mr-2 h-5 w-5" /> Añadir Miembro
         </button>
       </div>

       {/* BUSCADOR ESTILO MODERNO */}
       <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
       </div>

       {/* LISTA DE USUARIOS (TARJETAS HORIZONTALES) */}
       <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(user => {
             const isAdmin = user.role === 'admin';
             const isStore = user.role === 'storekeeper';
             
             return (
                <div key={user.id_user} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                    
                    {/* Indicador lateral de rol */}
                    <div className={clsx("absolute left-0 top-0 bottom-0 w-1.5", 
                        isAdmin ? "bg-purple-500" : isStore ? "bg-orange-500" : "bg-blue-500"
                    )}></div>

                    <div className="flex items-center gap-4">
                        {/* Avatar con borde de color según rol */}
                        <div className={clsx(
                            "h-20 w-20 rounded-full p-1 flex-shrink-0 border-2",
                            isAdmin ? "border-purple-100" : isStore ? "border-orange-100" : "border-blue-100"
                        )}>
                            <div className="h-full w-full rounded-full bg-gray-50 overflow-hidden">
                                {user.photo_url ? (
                                    <img src={user.photo_url} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="h-full w-full p-3 text-gray-300" />
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-gray-800 text-lg leading-tight">{user.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className={clsx(
                                    "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                    isAdmin ? "bg-purple-50 text-purple-600" :
                                    isStore ? "bg-orange-50 text-orange-600" :
                                    "bg-blue-50 text-blue-600"
                                )}>
                                    {user.role}
                                </span>
                                <span className="text-gray-300 font-bold">•</span>
                                <div className="flex items-center text-gray-400 font-mono text-xs font-bold">
                                    <Phone size={10} className="mr-1"/> {user.phone}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN RÁPIDA */}
                    <div className="flex items-center justify-between border-t border-gray-50 pt-3 md:border-none md:pt-0 gap-2">
                        <div className="flex gap-2">
                            {/* Llamada Directa */}
                            <a href={`tel:${user.phone}`} className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors">
                                <Phone size={18} />
                            </a>
                            {/* WhatsApp Directo */}
                            <a href={`https://wa.me/${user.phone}`} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors">
                                <MessageSquare size={18} />
                            </a>
                        </div>
                        
                        <div className="flex gap-2">
                            <button onClick={() => handleOpenEdit(user)} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(user)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
             );
          })}

          {filteredUsers.length === 0 && (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                <p className="text-gray-400 font-bold">No hay usuarios activos.</p>
             </div>
          )}
       </div>

       <UserModal 
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          userToEdit={editingUser} onSave={handleSave}
          isSaving={creating || updating} isAdmin={true}
       />
    </div>
  );
}
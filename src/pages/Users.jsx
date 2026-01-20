// src/pages/Users.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, CREATE_USER, UPDATE_USER, DELETE_USER } from '../graphql/users';
import { Plus, Search, Edit2, Trash2, Shield, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import UserModal from '../components/users/UserModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data, loading, error } = useQuery(GET_USERS);
  
  const [createUser, { loading: creating }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }]
  });

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }]
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }]
  });

  // Filtrado (Por nombre o teléfono)
  const filteredUsers = data?.users?.filter(u => 
     u.active && // Solo activos
     (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm))
  ) || [];

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Desactivar usuario "${user.name}"?`)) {
       try {
         await deleteUser({ variables: { id_user: user.id_user } });
         toast.success('Usuario desactivado');
       } catch (e) {
         toast.error(e.message);
       }
    }
  };

  
const handleSave = async (data) => {
    try {
        if (editingUser) {
            // --- MODO EDICIÓN ---
            // Aquí SÍ podemos mandar 'active' si actualizamos el schema UpdateUserInput
            // Pero para estar seguros, mandamos solo lo necesario.
            const input = {
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                photo_url: data.photo_url || null,
                telegram_chat_id: data.telegram_chat_id || null,
                role: data.role,
                active: true 
            };
            
            if (data.password) input.password = data.password;

            await updateUser({
                variables: { id_user: editingUser.id_user, input }
            });
            toast.success('Usuario actualizado');

        } else {
            // --- MODO CREACIÓN (Aquí estaba el error 400) ---
            
            // 1. NO mandamos 'active' (la base de datos lo pone true por defecto).
            // 2. Mapeamos 'password' del formulario a 'password_hash' que pide el backend.
            const createInput = {
                name: data.name,
                phone: data.phone,
                role: data.role,
                password_hash: data.password, // Requerido
                
                // Opcionales: Si están vacíos, mandamos undefined para que GraphQL no se queje
                email: data.email || undefined,
                photo_url: data.photo_url || undefined,
                telegram_chat_id: data.telegram_chat_id || undefined
            };

            await createUser({ variables: { input: createInput } });
            toast.success('Usuario creado');
        }
        setIsModalOpen(false);
    } catch (e) {
        console.error("Error al guardar:", e);
        // Esto te mostrará el detalle exacto del error en la alerta
        toast.error(e.message); 
    }
  };


  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  if (error) return <p className="text-red-500 text-center p-10">Error cargando usuarios.</p>;

  return (
    <div className="pb-20">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
         <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <UserIcon className="mr-3 text-blue-600" /> Usuarios
            </h1>
            <p className="text-gray-500 text-sm">Gestiona el acceso del personal.</p>
         </div>
         <button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center transition-transform active:scale-95">
            <Plus className="mr-2 h-5 w-5" /> Nuevo Usuario
         </button>
       </div>

       {/* SEARCH */}
       <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
       </div>

       {/* LISTA */}
       <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(user => (
             <div key={user.id_user} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* INFO */}
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                        {user.photo_url ? (
                            <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="h-full w-full p-3 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{user.name}</h3>
                        <div className="flex items-center gap-2 text-sm mt-1">
                            <span className={clsx(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                user.role === 'admin' ? "bg-purple-100 text-purple-700" :
                                user.role === 'storekeeper' ? "bg-orange-100 text-orange-700" :
                                "bg-blue-100 text-blue-700"
                            )}>
                                {user.role === 'storekeeper' ? 'Almacén' : user.role === 'seller' ? 'Vendedor' : 'Admin'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 font-mono">{user.phone}</span>
                        </div>
                    </div>
                </div>

                {/* ACCIONES */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                    <button onClick={() => handleOpenEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={20} />
                    </button>
                    {/* No permitir borrar Admin o a uno mismo se podría validar aquí también */}
                    <button onClick={() => handleDelete(user)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>
             </div>
          ))}

          {filteredUsers.length === 0 && (
             <div className="text-center py-10 text-gray-400">
                <AlertCircle className="mx-auto h-10 w-10 mb-2 opacity-50" />
                No se encontraron usuarios activos.
             </div>
          )}
       </div>

       <UserModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userToEdit={editingUser}
          onSave={handleSave}
          isSaving={creating || updating}
          isAdmin={true} // Estamos en el panel de admin
       />
    </div>
  );
}
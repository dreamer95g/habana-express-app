// src/pages/Categories.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES, CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } from '../graphql/categories';
import { Search, Plus, Edit2, Trash2, Tag, Loader2, AlertCircle } from 'lucide-react';
import CategoryModal from '../components/categories/CategoryModal';
import toast from 'react-hot-toast';

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // --- GRAPHQL ---
  const { data, loading, error } = useQuery(GET_CATEGORIES);
  
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }], // Recarga la lista al terminar
  });

  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
  });

  // --- LOGICA ---
  const filteredCategories = data?.categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar "${name}"?\nSe ocultará de la lista.`)) {
      try {
        await deleteCategory({ variables: { id_category: id } });
        toast.success('Categoría eliminada');
      } catch (err) {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingCategory) {
        await updateCategory({
          variables: { id_category: editingCategory.id_category, name: formData.name }
        });
        toast.success('Categoría actualizada');
      } else {
        await createCategory({
          variables: { name: formData.name }
        });
        toast.success('Categoría creada');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  if (error) return <div className="p-4 text-red-500 text-center">Error cargando categorías.</div>;

  return (
    <div className="pb-20">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Tag className="mr-3 text-blue-600" /> Categorías
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona las clasificaciones de tus productos.</p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center transition-transform active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> Nueva Categoría
        </button>
      </div>

      {/* --- BUSCADOR --- */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* --- CONTENIDO --- */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No se encontraron categorías.</p>
        </div>
      ) : (
        <>
          {/* VISTA DESKTOP (TABLA) - Oculta en pantallas pequeñas */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm">#</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Nombre</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Estado</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCategories.map((cat, index) => (
                  <tr key={cat.id_category} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{cat.id_category}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{cat.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                        Activa
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id_category, cat.name)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MOVIL (TARJETAS) - Visible solo en pantallas pequeñas */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredCategories.map((cat) => (
              <div key={cat.id_category} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-400 font-mono">#{cat.id_category}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Activa
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleOpenEdit(cat)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition-transform"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id_category, cat.name)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-transform"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- MODAL --- */}
      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
        onSave={handleSave}
        isSaving={creating || updating}
      />
    </div>
  );
}
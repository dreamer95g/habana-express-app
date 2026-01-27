// src/pages/Categories.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES, CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } from '../graphql/categories';
import { Search, Plus, Edit2, Trash2, Tag, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import CategoryModal from '../components/categories/CategoryModal';
import TablePagination from '../components/ui/TablePagination';
import toast from 'react-hot-toast';

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data, loading } = useQuery(GET_CATEGORIES);
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }] });
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }] });
  const [deleteCategory] = useMutation(DELETE_CATEGORY, { refetchQueries: [{ query: GET_CATEGORIES }] });

  const filteredCategories = data?.categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);

  const handleSave = async (formData) => {
    try {
      if (editingCategory) {
        await updateCategory({ variables: { id_category: editingCategory.id_category, name: formData.name } });
        toast.success('Actualizado');
      } else {
        await createCategory({ variables: { name: formData.name } });
        toast.success('Creado');
      }
      setIsModalOpen(false);
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;

  return (
    <div className="pb-20 px-2 md:px-0">
      
      {/* HEADER ESTANDARIZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center">
            <Tag className="mr-3 text-blue-600" size={28} /> Categorías
          </h1>
          <p className="text-gray-500 text-sm mt-1">Clasifica tus productos para una mejor gestión.</p>
        </div>
        <button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="w-full md:w-auto bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center justify-center active:scale-95 transition-all">
          <Plus className="mr-2 h-5 w-5" /> Nueva Categoría
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text" placeholder="Buscar categoría..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
        />
      </div>

      {/* CUADRÍCULA DE CATEGORÍAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentItems.map((cat) => (
          <div key={cat.id_category} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between items-center text-center group hover:border-blue-200 transition-all">
            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="text-xl font-black">{cat.name.charAt(0)}</span>
            </div>
            <h3 className="font-bold text-gray-800 text-sm leading-tight mb-4">{cat.name}</h3>
            
            <div className="flex gap-2 w-full pt-4 border-t border-gray-50">
                <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all flex justify-center">
                    <Edit2 size={16} />
                </button>
                <button onClick={() => { if(confirm('¿Borrar?')) deleteCategory({variables:{id_category: cat.id_category}}) }} className="flex-1 p-2 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all flex justify-center">
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>

      <TablePagination currentPage={currentPage} totalItems={filteredCategories.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />

      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} categoryToEdit={editingCategory} onSave={handleSave} isSaving={false} />
    </div>
  );
}
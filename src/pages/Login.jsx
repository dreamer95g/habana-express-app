// src/pages/Login.jsx
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// 1. CAMBIO: Importamos ShoppingCart
import { Loader2, Lock, Phone, ShoppingCart } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const { data: response } = await loginMutation({
        variables: { phone: data.phone, password: data.password }
      });
      const { token, user } = response.login;
      login(token, user);
      toast.success(`¡Bienvenido, ${user.name}!`);
      navigate('/'); 
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* 2. CAMBIO: Logo Circular Naranja con Carrito */}
        <div className="mx-auto h-44 w-44 bg-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-200 transform hover:scale-105 transition-transform duration-300">
            <ShoppingCart className="text-white h-24 w-24 " />
        </div>

        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
          Habana Express <span className="text-orange-500">Store</span> 
        </h2>
        {/* <p className="mt-2 text-center text-sm text-gray-600">
          Acceso al sistema de gestión
        </p> */}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Teléfono</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("phone", { required: "El teléfono es requerido" })}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-xl p-3 border outline-none transition-all"
                  placeholder="Ej: 50000001"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register("password", { required: "La contraseña es requerida" })}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-xl p-3 border outline-none transition-all"
                  placeholder="••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              {/* 3. CAMBIO: Botón Rounded Full */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
              >
                {loading ? (
                   <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Entrando...</>
                ) : (
                   "Iniciar Sesión"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
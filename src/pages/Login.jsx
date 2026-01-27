// src/pages/Login.jsx
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import toast from 'react-hot-toast';
import { Loader2, Lock, Phone, ShoppingCart } from 'lucide-react';
import { GET_CONFIG } from '../graphql/configuration';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);
  const { login } = useAuth();
  const navigate = useNavigate();
const { data: configData } = useQuery(GET_CONFIG);
 const systemLogo = configData?.systemConfiguration?.logo_url;

 const logoPlaceholder = "https://res.cloudinary.com/ddnqbgqfn/image/upload/v1769537581/habana_express_store/img-1769548374002-829424593-logo.png";

  const onSubmit = async (data) => {
    try {
      const { data: response } = await loginMutation({
        variables: { phone: data.phone, password: data.password }
      });
      const { token, user } = response.login;
      login(token, user);
      toast.success(`¡Hola de nuevo, ${user.name}!`);
      navigate('/'); 
    } catch (error) { toast.error(error.message); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decoración de fondo suave */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* ESPACIO PARA EL LOGO (Próximamente dinámico) */}
         <div className="mx-auto h-36 w-36 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-100 border border-gray-50 p-4 transform hover:rotate-3 transition-transform duration-500">
            <img 
              src={systemLogo || logoPlaceholder} 
              alt="Habana Express Logo" 
              className="w-full h-full object-contain"
            />
        </div>

        <h2 className="mt-8 text-center text-3xl font-black text-gray-900 tracking-tight">
          Habana<span className="text-blue-600">Express</span>
        </h2>
        <p className="mt-2 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          Productos Internacionales en tu mano
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  type="text"
                  {...register("phone", { required: "Número requerido" })}
                  className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-full text-gray-900 font-bold placeholder-gray-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="Número de Teléfono"
                />
              </div>
              {errors.phone && <p className="ml-6 text-[10px] font-black text-red-500 uppercase">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  type="password"
                  {...register("password", { required: "Contraseña requerida" })}
                  className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-full text-gray-900 font-bold placeholder-gray-300 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="Contraseña"
                />
              </div>
              {errors.password && <p className="ml-6 text-[10px] font-black text-red-500 uppercase">{errors.password.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-xl shadow-blue-100 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "LOGIN"}
              </button>
            </div>
          </form>

          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-8">
            Habana Express Store © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
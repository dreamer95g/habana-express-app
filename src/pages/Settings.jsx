import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CONFIG, UPDATE_CONFIG } from '../graphql/configuration';
import toast from 'react-hot-toast';
import { Save, Building, Phone, Mail, DollarSign, Bot, Info, Loader2, Calendar, Clock, RefreshCw, FileText, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { TRIGGER_SYNC } from '../graphql/configuration';
// --- HELPERS MEJORADOS ---

const extractTimeFromISO = (rawDate) => {
  if (!rawDate) return '';
  
  // 🔍 DEBUG: Mira la consola (F12) para ver qué está llegando
  console.log("Valor recibido del Backend:", rawDate);

  try {
    // INTENTO 1: Crear objeto fecha estándar
    // Prisma suele enviar timestamps numéricos (como strings) o ISO Strings
    const date = new Date(Number(rawDate) || rawDate);

    if (!isNaN(date.getTime())) {
      // Si la fecha es válida, extraemos hora LOCAL
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  } catch (e) {
    console.warn("Fallo al convertir fecha standard", e);
  }

  // INTENTO 2 (FALLBACK): Manipulación de Texto
  // Si llega algo como "2024-01-01T08:00:00.000Z" o simplemente "08:00:00"
  if (typeof rawDate === 'string') {
     // Si tiene una 'T', cortamos después de ella
     if (rawDate.includes('T')) {
         const timePart = rawDate.split('T')[1];
         // Tomamos los primeros 5 caracteres (HH:mm)
         return timePart.substring(0, 5); 
     }
     // Si ya parece una hora "08:00:00", devolvemos los primeros 5
     if (rawDate.includes(':')) {
         return rawDate.substring(0, 5);
     }
  }

  return '';
};

// Convierte "HH:mm" a Fecha ISO completa para guardar
const timeStringToISO = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date.toISOString();
};

export default function Settings() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [configId, setConfigId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentLogo = watch('logo_url');
  

// 1. Obtener datos
  const { data, loading, error } = useQuery(GET_CONFIG, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.systemConfiguration?.length > 0) {
        const config = data.systemConfiguration[0];
        setConfigId(config.id_config);

        // Campos de texto simples
        setValue('company_name', config.company_name);
        setValue('company_phone', config.company_phone || '');
        setValue('company_email', config.company_email || '');
        setValue('description', config.description || '');
        setValue('telegram_bot_token', config.telegram_bot_token || '');
        setValue('logo_url', config.logo_url || '');

        // Campos numéricos
        setValue('seller_commission_percentage', config.seller_commission_percentage);
        setValue('default_exchange_rate', config.default_exchange_rate);
        setValue('monthly_report_day', config.monthly_report_day || 20);
        setValue('annual_report_day', config.annual_report_day || 20);

         // 🕒 AQUI: Asegúrate que esté así:
        if (config.exchange_rate_sync_time) {
            const time = extractTimeFromISO(config.exchange_rate_sync_time);
            setValue('exchange_rate_sync_time', time, { shouldValidate: true });
        }
        if (config.monthly_report_time) {
            const time = extractTimeFromISO(config.monthly_report_time);
            setValue('monthly_report_time', time, { shouldValidate: true });
        }
        if (config.annual_report_time) {
            const time = extractTimeFromISO(config.annual_report_time);
            setValue('annual_report_time', time, { shouldValidate: true });
        }
      }
    }
  });

const [triggerSync, { loading: syncing }] = useMutation(TRIGGER_SYNC);

  const handleManualSync = async () => {
      try {
          await triggerSync();
          toast.success("Precios actualizados con la tasa de hoy");
      } catch (e) {
          toast.error("Error al sincronizar");
      }
  };

  const [updateConfig, { loading: saving }] = useMutation(UPDATE_CONFIG);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen (JPG, PNG)');
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Asegúrate que el puerto coincida con tu backend (4000)
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(API_URL+'/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Error de red al subir imagen');

        const data = await response.json();
        setValue('logo_url', data.url); 
        toast.success('Logo subido correctamente');

    } catch (error) {
        console.error(error);
        toast.error('No se pudo subir la imagen. Verifica el servidor.');
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      if (!configId) {
        toast.error("Error: No se encontró configuración para actualizar.");
        return;
      }

      const input = {
        company_name: formData.company_name,
        company_phone: formData.company_phone,
        company_email: formData.company_email,
        description: formData.description,
        telegram_bot_token: formData.telegram_bot_token,
        logo_url: formData.logo_url,
        active: true,

        seller_commission_percentage: parseFloat(formData.seller_commission_percentage),
        default_exchange_rate: parseFloat(formData.default_exchange_rate),
        monthly_report_day: parseInt(formData.monthly_report_day),
        annual_report_day: parseInt(formData.annual_report_day),

        exchange_rate_sync_time: timeStringToISO(formData.exchange_rate_sync_time),
        monthly_report_time: timeStringToISO(formData.monthly_report_time),
        annual_report_time: timeStringToISO(formData.annual_report_time),
      };

      await updateConfig({
        variables: { id_config: configId, input }
      });

      toast.success('¡Configuración guardada exitosamente!');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar: ' + err.message);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center mt-10">Error cargando configuración. Verifica que el servidor Backend esté activo (Puerto 4000).</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-500 mt-1">Personaliza la identidad y reglas de negocio.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* === SECCIÓN 1: IDENTIDAD === */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center pb-2 border-b border-gray-50">
            <Building className="mr-2 text-blue-500" size={24} /> Identidad Corporativa
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* AREA DEL LOGO */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
                <label className="block text-sm font-semibold text-gray-700 mb-3 self-start w-full text-center md:text-left">Logo de la Tienda</label>
                
                <div className="relative group w-48 h-48 rounded-full border-4 border-gray-100 shadow-sm overflow-hidden bg-gray-50 flex items-center justify-center hover:border-blue-200 transition-colors">
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="animate-spin text-blue-500 h-8 w-8 mb-2" />
                            <span className="text-xs text-gray-400">Subiendo...</span>
                        </div>
                    ) : currentLogo ? (
                        <>
                            <img src={currentLogo} alt="Logo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <UploadCloud className="text-white h-8 w-8 mb-1" />
                                <span className="text-white text-xs font-medium">Cambiar</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon className="h-12 w-12 mb-2" />
                            <span className="text-xs text-center px-2">Click para subir</span>
                        </div>
                    )}

                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                    />
                </div>
                <input type="hidden" {...register('logo_url')} />
            </div>

            {/* CAMPOS DE TEXTO */}
            <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Tienda *</label>
                    <input 
                        {...register('company_name', { required: "Requerido" })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    {errors.company_name && <span className="text-xs text-red-500">{errors.company_name.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"><Phone size={16} className="mr-2 text-gray-400"/> Teléfono</label>
                    <input {...register('company_phone')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"><Mail size={16} className="mr-2 text-gray-400"/> Email</label>
                    <input {...register('company_email')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Visión</label>
                    <textarea {...register('description')} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                </div>
            </div>
          </div>
        </div>

        {/* === SECCIÓN 2: FINANZAS === */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center pb-2 border-b border-gray-50">
            <DollarSign className="mr-2 text-green-500" size={24} /> Reglas Financieras
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">Tasa de Cambio Base (CUP)</label>
              <div className="relative">
                <input type="number" step="0.01" {...register('default_exchange_rate', { required: true })} className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none font-bold text-xl" />
                <span className="absolute left-3 top-3.5 text-green-600 font-bold">$</span>
              </div>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">Comisión Vendedores (%)</label>
              <div className="relative">
                <input type="number" step="0.01" {...register('seller_commission_percentage', { required: true })} className="w-full pl-4 pr-8 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xl" />
                <span className="absolute right-3 top-3.5 text-blue-600 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>


        {/* === SECCIÓN 3: AUTOMATIZACIÓN === */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center pb-2 border-b border-gray-50">
            <RefreshCw className="mr-2 text-purple-500" size={24} /> Automatización
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center text-sm uppercase">
                <RefreshCw size={16} className="mr-2" /> Sync Tasa
              </h3>
              <div className="relative">
                <input type="time" {...register('exchange_rate_sync_time')} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
                <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div> */}

             <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center text-sm uppercase">
                <RefreshCw size={16} className="mr-2" /> Sync Tasa
              </h3>
              
              <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type="time" {...register('exchange_rate_sync_time')} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
                    <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  
                  {/* 👇 BOTÓN MANUAL AÑADIDO 👇 */}
                  <button 
                    type="button" 
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-colors"
                    title="Actualizar precios ahora"
                  >
                    <RefreshCw size={20} className={syncing ? "animate-spin" : ""} />
                  </button>
              </div>
              <p className="text-[10px] text-gray-400">Hora automática o click para manual.</p>
            </div>

            <div className="lg:col-span-1 space-y-4 border-l border-gray-100 lg:pl-6">
              <h3 className="font-semibold text-gray-700 flex items-center text-sm uppercase">
                <FileText size={16} className="mr-2" /> Reporte Mensual
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1" max="28" {...register('monthly_report_day')} placeholder="Día" className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none" />
                <input type="time" {...register('monthly_report_time')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none" />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4 border-l border-gray-100 lg:pl-6">
              <h3 className="font-semibold text-gray-700 flex items-center text-sm uppercase">
                <Calendar size={16} className="mr-2" /> Reporte Anual
              </h3>
               <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1" max="31" {...register('annual_report_day')} placeholder="Día" className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none" />
                <input type="time" {...register('annual_report_time')} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none" />
              </div>
            </div>
          </div>
        </div>



        {/* === SECCIÓN 4: TELEGRAM === */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center pb-2 border-b border-gray-50">
            <Bot className="mr-2 text-blue-400" size={24} /> Telegram Bot
          </h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bot API Token</label>
            <div className="flex">
                <input type="password" {...register('telegram_bot_token')} className="w-full px-4 py-3 rounded-l-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" />
                <div className="bg-gray-50 px-4 flex items-center border border-l-0 border-gray-200 rounded-r-xl text-gray-500"><Info size={18} /></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 sticky bottom-6 z-10">
          <button type="submit" disabled={saving || isUploading} className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-70 transform hover:-translate-y-1">
            {(saving || isUploading) ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
            {isUploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>

      </form>
    </div>
  );
}
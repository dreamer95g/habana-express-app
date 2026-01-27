// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CONFIG, UPDATE_CONFIG, TRIGGER_SYNC } from '../graphql/configuration';
import toast from 'react-hot-toast';
import { 
  Settings as SettingsIcon, Save, Building, Phone, Mail, DollarSign, 
  Bot, Info, Loader2, Clock, RefreshCw, FileText, Calendar, 
  Image as ImageIcon, UploadCloud 
} from 'lucide-react';

// --- HELPERS PARA TIEMPO ---
const extractTimeFromISO = (rawDate) => {
  if (!rawDate) return '';
  try {
    const date = new Date(Number(rawDate) || rawDate);
    if (!isNaN(date.getTime())) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  } catch (e) { console.error(e); }
  
  if (typeof rawDate === 'string' && rawDate.includes('T')) {
      return rawDate.split('T')[1].substring(0, 5);
  }
  return '';
};

const timeStringToISO = (timeString) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date.toISOString();
};

export default function Settings() {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const [configId, setConfigId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const currentLogo = watch('logo_url');

  const { data, loading, error } = useQuery(GET_CONFIG, { fetchPolicy: 'network-only' });
  const [updateConfig, { loading: saving }] = useMutation(UPDATE_CONFIG);
  const [triggerSync, { loading: syncing }] = useMutation(TRIGGER_SYNC);

  // --- EFECTO PARA CARGAR DATOS EN LOS INPUTS ---
  useEffect(() => {
    if (data?.systemConfiguration?.[0]) {
      const config = data.systemConfiguration[0];
      setConfigId(config.id_config);
      
      // Mapeo explícito para asegurar que cada campo se llene
      reset({
        company_name: config.company_name,
        company_phone: config.company_phone,
        company_email: config.company_email,
        description: config.description,
        logo_url: config.logo_url,
        default_exchange_rate: config.default_exchange_rate,
        seller_commission_percentage: config.seller_commission_percentage,
        telegram_bot_token: config.telegram_bot_token,
        
        // Tiempos y Días
        exchange_rate_sync_time: extractTimeFromISO(config.exchange_rate_sync_time),
        monthly_report_day: config.monthly_report_day,
        monthly_report_time: extractTimeFromISO(config.monthly_report_time),
        annual_report_day: config.annual_report_day,
        annual_report_time: extractTimeFromISO(config.annual_report_time),
      });
    }
  }, [data, reset]);

  const handleManualSync = async () => {
      try {
          await triggerSync();
          toast.success("Precios actualizados");
      } catch (e) { toast.error("Error al sincronizar"); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
        const resData = await response.json();
        setValue('logo_url', resData.url); 
        toast.success('Logo actualizado');
    } catch (error) { toast.error('Error al subir imagen'); }
    finally { setIsUploading(false); }
  };

  const onSubmit = async (formData) => {
    try {
      const input = {
        company_name: formData.company_name,
        company_phone: formData.company_phone,
        company_email: formData.company_email,
        description: formData.description,
        logo_url: formData.logo_url,
        telegram_bot_token: formData.telegram_bot_token,
        default_exchange_rate: parseFloat(formData.default_exchange_rate),
        seller_commission_percentage: parseFloat(formData.seller_commission_percentage),
        monthly_report_day: parseInt(formData.monthly_report_day),
        annual_report_day: parseInt(formData.annual_report_day),
        exchange_rate_sync_time: timeStringToISO(formData.exchange_rate_sync_time),
        monthly_report_time: timeStringToISO(formData.monthly_report_time),
        annual_report_time: timeStringToISO(formData.annual_report_time),
        active: true
      };
      await updateConfig({ variables: { id_config: configId, input } });
      toast.success('Configuración guardada');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center mt-10">Error de conexión.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24 px-2 md:px-0">
      
      {/* --- HEADER --- */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
          <div className="p-2 bg-gray-100 rounded-xl mr-3">
            <SettingsIcon className="text-gray-600" size={24} />
          </div>
          Configuración
        </h1>
        <p className="text-gray-500 text-sm mt-1 ml-14 md:ml-16">Parámetros globales del negocio.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* 1. IDENTIDAD */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building className="text-blue-500" size={20} />
            <h2 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Identidad</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative group">
                <div className="w-40 h-40 rounded-full border-4 border-gray-50 shadow-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    {isUploading ? <Loader2 className="animate-spin text-blue-500" /> : 
                     currentLogo ? <img src={currentLogo} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={40} />}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg cursor-pointer">
                    <UploadCloud size={16} /><input type="file" className="hidden" onChange={handleImageUpload} />
                </label>
            </div>

            <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <input {...register('company_name')} placeholder="Nombre Empresa" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input {...register('company_phone')} placeholder="Teléfono" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none" />
                        <input {...register('company_email')} placeholder="Email" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none" />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* 2. FINANZAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase mb-4 flex items-center gap-2">
                    <DollarSign size={14} className="text-green-500"/> Tasa de Cambio (CUP)
                </h3>
                <div className="relative">
                    <input type="number" step="0.01" {...register('default_exchange_rate')} className="w-full px-4 py-4 bg-green-50/50 border-none rounded-2xl text-3xl font-black text-green-700 outline-none" />
                    <button type="button" onClick={handleManualSync} className="absolute right-2 top-2 p-2 bg-green-600 text-white rounded-xl shadow-md active:scale-90 transition-transform">
                        <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-400 text-[10px] uppercase mb-4 flex items-center gap-2">
                    <Info size={14} className="text-orange-500"/> Comisión Vendedores
                </h3>
                <div className="relative">
                    <input type="number" {...register('seller_commission_percentage')} className="w-full px-4 py-4 bg-orange-50/50 border-none rounded-2xl text-3xl font-black text-orange-700 outline-none" />
                    <span className="absolute right-4 top-4 text-orange-200 font-black text-2xl">%</span>
                </div>
            </div>
        </div>

        {/* 3. AUTOMATIZACIÓN (Incluye el Reporte Anual) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <Clock className="text-purple-500" size={18} />
                <h2 className="font-bold text-gray-800 uppercase text-[10px] tracking-wider">Reportes y Sincronización</h2>
            </div>
            
            <div className="p-4 space-y-4">
                {/* Sincronización de Tasa */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <RefreshCw size={16} className="text-purple-400" />
                        <span className="text-sm font-bold text-gray-700">Auto-Sincronizar Tasa</span>
                    </div>
                    <input type="time" {...register('exchange_rate_sync_time')} className="bg-white px-2 py-1 rounded-lg border-none font-bold text-purple-600 outline-none shadow-sm" />
                </div>

                {/* Reporte Mensual */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-2xl gap-3">
                    <div className="flex items-center gap-3">
                        <FileText size={16} className="text-blue-400" />
                        <span className="text-sm font-bold text-gray-700">Reporte Mensual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" {...register('monthly_report_day')} className="w-12 px-2 py-1 rounded-lg border-none text-center font-bold" placeholder="Día" />
                        <span className="text-gray-400 font-bold">@</span>
                        <input type="time" {...register('monthly_report_time')} className="px-2 py-1 rounded-lg border-none font-bold text-blue-600" />
                    </div>
                </div>

                {/* Reporte Anual (Diciembre) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-2xl gap-3 border-l-4 border-orange-400">
                    <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-orange-500" />
                        <div>
                            <span className="text-sm font-bold text-gray-700">Reporte Anual</span>
                            <p className="text-[9px] text-orange-600 font-bold">CIERRE DE DICIEMBRE</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" {...register('annual_report_day')} className="w-12 px-2 py-1 rounded-lg border-none text-center font-bold" placeholder="Día" />
                        <span className="text-gray-400 font-bold">@</span>
                        <input type="time" {...register('annual_report_time')} className="px-2 py-1 rounded-lg border-none font-bold text-orange-600" />
                    </div>
                </div>
            </div>
        </div>

        {/* 4. TELEGRAM BOT */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="text-blue-400" size={20} />
            <h2 className="font-bold text-gray-800 uppercase text-xs">Telegram Bot Token</h2>
          </div>
          <input type="password" {...register('telegram_bot_token')} placeholder="Bot API Token" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-mono text-sm outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="pt-4">
            <button type="submit" disabled={saving} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                GUARDAR CONFIGURACIÓN
            </button>
        </div>

      </form>
    </div>
  );
}
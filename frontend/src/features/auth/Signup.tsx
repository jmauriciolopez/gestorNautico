import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Rocket
} from 'lucide-react';
import { httpClient } from '../../shared/api/HttpClient';
import { useAuth } from './hooks/useAuth';

interface SignupProps {
  onClose: () => void;
}

export function Signup({ onClose }: SignupProps) {
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    adminUsuario: '',
    adminEmail: '',
    adminPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.nombre) {
      setError('Por favor ingresa el nombre de la marina');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleNext();
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await httpClient.post<{ accessToken: string }>('/auth/signup', formData);
      
      await signup(response.accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="auth-card relative w-full max-w-[440px] bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
        >
          <ArrowLeft size={20} className="rotate-45" />
        </button>

        {/* Rocket Icon Badge */}
        <div className="auth-icon-badge mx-auto mb-6">
          <div className="auth-icon-inner">
            <Rocket size={32} strokeWidth={2.5} className="text-indigo-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-1">
            Comenzar Ahora
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Registrá tu marina en minutos
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="premium-input-container">
                  <label className="premium-label">Nombre de la Marina</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Ej. Marina del Este"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="premium-input-container">
                  <label className="premium-label">Persona de Contacto</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="contacto"
                      value={formData.contacto}
                      onChange={handleChange}
                      required
                      placeholder="Nombre del responsable"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Siguiente paso
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >


                <div className="premium-input-container">
                  <label className="premium-label">Nombre de Usuario</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="adminUsuario"
                      value={formData.adminUsuario}
                      onChange={handleChange}
                      required
                      placeholder="admin_marina"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="premium-input-container">
                  <label className="premium-label">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      required
                      placeholder="correo@ejemplo.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="premium-input-container">
                  <label className="premium-label">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center shrink-0"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Finalizar Registro'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed">
          Al registrarte aceptas nuestros <span className="underline cursor-pointer">Términos de Servicio</span> y <span className="underline cursor-pointer">Privacidad</span>.
        </p>
      </motion.div>
    </div>
  );
}

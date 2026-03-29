import { useState } from 'react';
import { Anchor, Calendar, Clock, Ship, User, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchClient } from '../../../api/fetchClient';
import { useMutation } from '@tanstack/react-query';

export default function SolicitudBajadaPublica() {
  const [formData, setFormData] = useState({
    dni: '',
    matricula: '',
    fechaHoraDeseada: '',
    observaciones: ''
  });
  const [success, setSuccess] = useState(false);

  const requestMutation = useMutation({
    mutationFn: (data: typeof formData) => fetchClient('/operaciones/bajada-publica', {
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      setSuccess(true);
      toast.success('Solicitud enviada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al enviar la solicitud. Verifique los datos.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate(formData);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-emerald-500/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl text-center space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-[var(--text-primary)]">¡Solicitud Registrada!</h2>
          <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
            Hemos recibido su solicitud de bajada. En aproximadamente 1 hora recibirá un correo electrónico con la confirmación oficial.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-8 px-8 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--border-primary)] transition-all active:scale-95"
          >
            Realizar Otra Solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decals */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full point-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full point-events-none" />

      <div className="max-w-lg w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 mb-6 shadow-inner text-blue-500">
            <Anchor className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">Portal Náutico</h1>
          <p className="text-[var(--text-secondary)] mt-3 text-sm font-medium uppercase tracking-widest">
            Solicitud Rápida de Bajada
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border border-[var(--border-primary)] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-2 block">DNI del Titular</label>
              <div className="relative relative-group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]/50" />
                <input
                  type="text"
                  required
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="Sin puntos ni espacios"
                  className="w-full bg-[var(--bg-primary)]/80 border border-[var(--border-primary)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-12 pr-5 py-4 text-[var(--text-primary)] transition-all outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-2 block">Matrícula Embarcación (REY)</label>
              <div className="relative">
                <Ship className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]/50" />
                <input
                  type="text"
                  required
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  placeholder="REY-XXXX"
                  className="w-full bg-[var(--bg-primary)]/80 border border-[var(--border-primary)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-12 pr-5 py-4 text-[var(--text-primary)] transition-all outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-2 block">Fecha y Hora Programada</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]/50" />
                <input
                  type="datetime-local"
                  required
                  value={formData.fechaHoraDeseada}
                  onChange={(e) => setFormData({ ...formData, fechaHoraDeseada: e.target.value })}
                  className="w-full bg-[var(--bg-primary)]/80 border border-[var(--border-primary)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-12 pr-5 py-4 text-[var(--text-primary)] transition-all outline-none font-medium custom-calendar-icon"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-2 block">Observaciones (Opcional)</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Instrucciones especiales para portería o mantenimiento..."
                className="w-full bg-[var(--bg-primary)]/80 border border-[var(--border-primary)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-[var(--text-primary)] transition-all outline-none resize-none h-24 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={requestMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-[var(--text-primary)] font-bold py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex justify-center items-center gap-3 text-lg"
          >
            {requestMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <Clock size={24} />}
            Agendar Bajada
          </button>
        </form>
      </div>
    </div>
  );
}

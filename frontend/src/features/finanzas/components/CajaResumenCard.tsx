import { Clock, Unlock, Lock, Calendar } from 'lucide-react';

export interface CajaResumen {
  id: number;
  saldoInicial: number;
  totalRecaudado: number;
  totalEfectivo: number;
  fechaApertura: string;
}

interface CajaResumenCardProps {
  caja?: CajaResumen;
  isLoading: boolean;
  onAbrir: () => void;
  onCerrar: (caja: CajaResumen) => void;
}

export function CajaResumenCard({ caja, isLoading, onAbrir, onCerrar }: CajaResumenCardProps) {
  if (isLoading) return <div className="h-28 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800"></div>;

  if (!caja) return (
    <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h4 className="font-bold text-amber-200">Caja Cerrada</h4>
          <p className="text-sm text-amber-500/60 font-medium">No hay una jornada financiera activa en este momento.</p>
        </div>
      </div>
      <button 
        onClick={onAbrir}
        className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl text-sm font-black transition-all shadow-lg shadow-amber-600/20 active:scale-95 flex items-center justify-center gap-2"
      >
        <Unlock className="w-4 h-4" />
        ABRIR CAJA DIARIA
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Unlock className="w-8 h-8 text-white" />
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Saldo Inicial</p>
          <p className="text-2xl font-black text-white mt-1">${Number(caja.saldoInicial).toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Recaudado Total</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">${Number(caja.totalRecaudado).toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Efectivo</p>
          <p className="text-2xl font-black text-white mt-1">${Number(caja.totalEfectivo).toLocaleString()}</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between items-start">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Estado</p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-500 mt-2 border border-emerald-500/20 tracking-tighter">
              CAJA ABIERTA
            </span>
          </div>
          <button
            onClick={() => onCerrar(caja)}
            className="mt-4 w-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
          >
            <Lock className="w-3 h-3 group-hover/btn:scale-110" />
            CERRAR CAJA
          </button>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-slate-950/30 rounded-full border border-slate-800/50 inline-flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
          Apertura: {new Date(caja.fechaApertura).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

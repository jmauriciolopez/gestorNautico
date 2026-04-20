import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Receipt, Wallet, Plus, Activity, ChevronRight } from 'lucide-react';
import { useFinanzas } from '../hooks/useFinanzas';
import { CargosList } from '../components/CargosList';
import { PagosList } from '../components/PagosList';
import { CajaResumenCard } from '../components/CajaResumenCard';
import { CajaModal } from '../components/CajaModal';
import { HistorialCajasList } from '../components/HistorialCajasList';
import { CajaDetalleModal } from '../components/CajaDetalleModal';
import { NuevoCargoModal } from '../components/NuevoCargoModal';
import { RegistrarPagoModal } from '../components/RegistrarPagoModal';
import { Caja } from '../hooks/useFinanzas';
import type { AxiosError } from 'axios';

export default function FinanzasPage() {
  const [activeTab, setActiveTab] = useState<'cargos' | 'pagos' | 'caja'>('cargos');
  const [isCajaModalOpen, setIsCajaModalOpen] = useState(false);
  const [cajaModalType, setCajaModalType] = useState<'ABRIR' | 'CERRAR'>('ABRIR');
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);

  const { getCargos, getPagos, getCajaResumen, abrirCaja, cerrarCaja, getCajas } = useFinanzas();

  const handleCajaConfirm = async (monto: number) => {
    try {
      if (cajaModalType === 'ABRIR') {
        await abrirCaja.mutateAsync(monto);
        toast.success('Caja abierta correctamente');
      } else {
        const activeCaja = getCajaResumen.data;
        if (activeCaja) {
          await cerrarCaja.mutateAsync({ id: activeCaja.id, saldoFinal: monto });
          toast.success('Caja cerrada correctamente');
        }
      }
      setIsCajaModalOpen(false);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      const msg = axiosErr.response?.data?.message ?? 'Error al operar la caja';
      toast.error(msg);
    }
  };

  const handleActionClick = () => {
    if (activeTab === 'cargos') {
      setIsCargoModalOpen(true);
    } else if (activeTab === 'pagos') {
      setIsPagoModalOpen(true);
    } else {
      setCajaModalType('ABRIR');
      setIsCajaModalOpen(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[var(--bg-secondary)]/[0.3] p-8 rounded-[2.5rem] border border-[var(--border-primary)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
          <Wallet className="w-48 h-48 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          </div>
          <h1 className="text-[2.5rem] font-black text-[var(--text-primary)] leading-none tracking-tight uppercase">Gestión Financiera</h1>
          <p className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest mt-2">Control de flujos, facturación y estados de cuenta auditados.</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={handleActionClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/30 transition-all active:scale-95 flex items-center gap-3 group/btn"
          >
            <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
            {activeTab === 'cargos' ? 'Nuevo Cargo' : activeTab === 'pagos' ? 'Registrar Pago' : 'Nueva Caja'}
          </button>
        </div>
      </header>

      {/* Summary Section */}
      <CajaResumenCard
        caja={getCajaResumen.data ? { ...getCajaResumen.data, estado: 'ABIERTA' as const } : undefined}
        isLoading={getCajaResumen.isLoading}
        onAbrir={() => {
          setCajaModalType('ABRIR');
          setIsCajaModalOpen(true);
        }}
        onCerrar={() => {
          setCajaModalType('CERRAR');
          setIsCajaModalOpen(true);
        }}
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-[var(--bg-secondary)]/[0.5] rounded-[2rem] border border-[var(--border-primary)] w-fit shadow-xl transition-colors duration-300">
        {[
          { id: 'cargos', label: 'Cargos y Facturas', icon: Receipt },
          { id: 'pagos', label: 'Historial de Pagos', icon: CreditCard },
          { id: 'caja', label: 'Auditoría de Cajas', icon: Wallet }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black rounded-[1.25rem] transition-all uppercase tracking-widest ${activeTab === tab.id
              ? 'bg-indigo-600 text-[var(--text-primary)] shadow-2xl shadow-indigo-900/40'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/40'
              }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Data Grid */}
      <div className="bg-[var(--bg-surface)] backdrop-blur-xl rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden transition-colors duration-300 min-h-[500px]">
        <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest leading-none">
                {activeTab === 'cargos' ? 'Libro de Cargos' : activeTab === 'pagos' ? 'Libro de Ingresos' : 'Libro de Arqueos'}
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tighter mt-1">Registros procesados por el motor financiero</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            <span>Vista Detallada</span>
            <ChevronRight className="w-4 h-4 opacity-30" />
          </div>
        </div>

        {activeTab === 'cargos' && (
          <CargosList
            cargos={getCargos.data || []}
            isLoading={getCargos.isLoading}
            onCobrar={(cargo) => {
              setIsPagoModalOpen(true);
            }}
          />
        )}

        {activeTab === 'pagos' && (
          <PagosList
            pagos={getPagos.data || []}
            isLoading={getPagos.isLoading}
          />
        )}

        {activeTab === 'caja' && (
          <HistorialCajasList
            cajas={getCajas.data || []}
            isLoading={getCajas.isLoading}
            onVerDetalle={(caja) => {
              setSelectedCaja(caja);
              setIsDetailModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Modals Suite */}
      <NuevoCargoModal
        isOpen={isCargoModalOpen}
        onClose={() => setIsCargoModalOpen(false)}
      />

      <RegistrarPagoModal
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
      />

      <CajaModal
        isOpen={isCajaModalOpen}
        type={cajaModalType}
        onClose={() => setIsCajaModalOpen(false)}
        onConfirm={handleCajaConfirm}
        currentBalance={(getCajaResumen.data?.saldoInicial || 0) + (getCajaResumen.data?.totalRecaudado || 0)}
      />

      <CajaDetalleModal
        isOpen={isDetailModalOpen}
        caja={selectedCaja}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}

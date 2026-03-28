import { useState } from 'react';
import { CreditCard, Receipt, Wallet, Plus } from 'lucide-react';
import { useFinanzas } from '../hooks/useFinanzas';
import { CargosList } from '../components/CargosList';
import { PagosList } from '../components/PagosList';
import { CajaResumenCard } from '../components/CajaResumenCard';

export default function FinanzasPage() {
  const [activeTab, setActiveTab] = useState<'cargos' | 'pagos' | 'caja'>('cargos');
  const { getCargos, getPagos, getCajaResumen } = useFinanzas();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Finanzas</h2>
          <p className="text-gray-500 mt-1">Gestión de facturación, cobros y tesorería.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all">
          <Plus className="w-4 h-4" />
          {activeTab === 'cargos' ? 'Nuevo Cargo' : activeTab === 'pagos' ? 'Registrar Pago' : 'Nueva Caja'}
        </button>
      </div>

      <CajaResumenCard 
        caja={getCajaResumen.data} 
        isLoading={getCajaResumen.isLoading} 
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('cargos')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'cargos' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Cargos y Facturas
          </div>
          {activeTab === 'cargos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
        <button
          onClick={() => setActiveTab('pagos')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'pagos' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Historial de Pagos
          </div>
          {activeTab === 'pagos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
        <button
          onClick={() => setActiveTab('caja')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'caja' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Cajas Diarias
          </div>
          {activeTab === 'caja' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'cargos' && (
          <CargosList 
            cargos={getCargos.data || []}
            isLoading={getCargos.isLoading}
          />
        )}

        {activeTab === 'pagos' && (
          <PagosList 
            pagos={getPagos.data || []}
            isLoading={getPagos.isLoading}
          />
        )}
        
        {activeTab === 'caja' && (
          <div className="p-12 text-center text-gray-500">
            Módulo de historial de cajas en desarrollo.
          </div>
        )}
      </div>
    </div>
  );
}

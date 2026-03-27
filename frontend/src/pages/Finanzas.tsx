import { useState } from 'react';
import { CreditCard, Receipt, Wallet, Plus, Search, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useFinanzas } from '../hooks/useFinanzas';

export default function Finanzas() {
  const [activeTab, setActiveTab] = useState<'cargos' | 'pagos' | 'caja'>('cargos');
  const { getCargos, getPagos, getCajaResumen } = useFinanzas();

  const renderCajaResumen = () => {
    if (getCajaResumen.isLoading) return <div className="h-24 bg-gray-50 animate-pulse rounded-xl"></div>;
    const caja = getCajaResumen.data;

    if (!caja) return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3 text-amber-800">
          <Clock className="w-5 h-5 text-amber-600" />
          <span className="font-medium">No hay una caja abierta actualmente.</span>
        </div>
        <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Abrir Caja Diaria
        </button>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Saldo Inicial</p>
          <p className="text-xl font-bold text-gray-800">${Number(caja.saldoInicial).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Recaudado Total</p>
          <p className="text-xl font-bold text-emerald-600">${Number(caja.totalRecaudado).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Efectivo</p>
          <p className="text-xl font-bold text-gray-800">${Number(caja.totalEfectivo).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Estado</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
            ABIERTA
          </span>
        </div>
      </div>
    );
  };

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

      {renderCajaResumen()}

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
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Monto</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getCargos.isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Cargando cargos...</td></tr>
              ) : getCargos.data?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No hay cargos registrados.</td></tr>
              ) : (
                getCargos.data?.map((cargo) => (
                  <tr key={cargo.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{cargo.cliente?.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{cargo.descripcion}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(cargo.fechaEmision).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {cargo.pagado ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      ${Number(cargo.monto).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!cargo.pagado && (
                        <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase tracking-wider">
                          Cobrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'pagos' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Método</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Referencia</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getPagos.isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Cargando pagos...</td></tr>
              ) : getPagos.data?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No hay pagos registrados.</td></tr>
              ) : (
                getPagos.data?.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(pago.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{pago.cliente?.nombre}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm px-2 py-1 bg-gray-100 rounded">{pago.metodoPago}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm italic">
                      {pago.cargo?.descripcion || 'Pago general'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      + ${Number(pago.monto).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

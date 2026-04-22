import { useState } from 'react';
import { HelpCircle, ChevronRight, Anchor, CreditCard, Users, ShieldCheck, BarChart3 } from 'lucide-react';

const HELP_TOPICS = [
  {
    id: 'operaciones',
    title: 'Operaciones',
    icon: <Anchor className="w-4 h-4" />,
    content: [
      { q: '¿Cómo registro un movimiento?', a: 'Busca la embarcación en el Buscador Global y selecciona "Nueva Orden de Trabajo". El sistema detectará automáticamente si el propietario posee saldos impagos y mostrará una alerta visual de "Deuda Pendiente" antes de confirmar.' },
      { q: '¿Cómo se asignan las ubicaciones?', a: 'Cada embarcación debe estar vinculada a un Espacio (Cuna) específico dentro de un Rack. Al retirar una embarcación definitivamente, el sistema libera automáticamente el espacio marcándolo como "Disponible".' }
    ]
  },
  {
    id: 'facturacion',
    title: 'Facturación y Mora',
    icon: <CreditCard className="w-4 h-4" />,
    content: [
      { q: '¿Cuándo se generan los cargos?', a: 'Los cargos de guardería se generan automáticamente según el día de facturación (1 al 28) asignado a cada cliente en su ficha técnica, garantizando ciclos de cobro personalizados.' },
      { q: '¿Cómo funciona el recargo por mora?', a: 'A las 9:00 AM, el sistema audita facturas vencidas. Si superan los días de gracia configurados, aplica un recargo fijo inicial y un interés mensual proporcional al tiempo de atraso.' },
      { q: '¿Por qué no puedo cobrar un pago?', a: 'Para garantizar la integridad contable, el sistema exige que exista una "Caja Abierta" activa. Sin una caja operativa, no es posible registrar ingresos ni liquidar facturas.' },
      { q: '¿Cómo descargo un comprobante?', a: 'Desde el historial de facturación o el detalle de pagos, puedes generar y descargar archivos PDF profesionales para entregar a los socios.' }
    ]
  },
  {
    id: 'reportes',
    title: 'Monitoreo y Reportes',
    icon: <BarChart3 className="w-4 h-4" />,
    content: [
      { q: '¿Dónde veo la ocupación real?', a: 'El Dashboard de Ocupación ofrece una vista tridimensional y estadística de los racks, permitiendo identificar espacios libres y optimizar la logística interna.' },
      { q: '¿Cómo analizo la recaudación?', a: 'La sección de Reportes Gerenciales permite comparar la recaudación real frente a la proyectada, filtrando por periodos y estados de cuenta.' }
    ]
  },
  {
    id: 'clientes',
    title: 'Clientes',
    icon: <Users className="w-4 h-4" />,
    content: [
      { q: '¿Cómo asignar una cuna?', a: 'Desde la edición del perfil de la embarcación, puedes seleccionar un espacio disponible. El sistema valida automáticamente que las dimensiones (eslora/manga) sean aptas para el rack elegido.' },
      { q: '¿Qué es un Responsable de Familia?', a: 'En grupos familiares, el "Responsable" centraliza la facturación. El sistema genera un solo cargo mensual unificado, permitiendo que los beneficiarios operen sin generar costos adicionales.' }
    ]
  }
];

export default function UserHelp() {
  const [activeTopic, setActiveTopic] = useState(HELP_TOPICS[0].id);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <HelpCircle className="w-10 h-10 text-indigo-500" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
          Centro de <span className="text-indigo-500">Ayuda</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Guías rápidas y protocolos operativos diseñados para optimizar tu gestión en el Gestor Náutico.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-xl border border-[var(--border-primary)] rounded-[2rem] p-4 shadow-xl">
            {HELP_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group ${
                  activeTopic === topic.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 -translate-y-1' 
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    activeTopic === topic.id ? 'bg-white/20' : 'bg-[var(--bg-primary)] group-hover:bg-indigo-500/10'
                  }`}>
                    {topic.icon}
                  </div>
                  <span className="font-bold tracking-wide uppercase text-sm italic">{topic.title}</span>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${activeTopic === topic.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>

          <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-[2rem] space-y-4 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <ShieldCheck className="w-6 h-6 text-indigo-400 mb-2" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Soporte Técnico</h4>
              <p className="text-sm text-indigo-200/80 leading-relaxed font-medium">
                ¿Necesitas asistencia técnica personalizada? Contacta con el equipo de soporte especializado.
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[2.5rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden min-h-[600px]">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <div className="w-80 h-80 scale-[4] origin-top-right text-indigo-500">
                  {activeTopic === 'operaciones' && <Anchor className="w-full h-full" />}
                  {activeTopic === 'facturacion' && <CreditCard className="w-full h-full" />}
                  {activeTopic === 'reportes' && <BarChart3 className="w-full h-full" />}
                  {activeTopic === 'clientes' && <Users className="w-full h-full" />}
              </div>
            </div>

            <div className="relative z-10 space-y-12">
              <div className="flex items-center gap-6">
                <span className="h-px flex-1 bg-gradient-to-r from-indigo-500 to-transparent" />
                <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight italic">
                  {HELP_TOPICS.find(t => t.id === activeTopic)?.title}
                </h2>
              </div>

              <div className="space-y-10">
                {HELP_TOPICS.find(t => t.id === activeTopic)?.content.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group space-y-4 animate-in slide-in-from-right-8 duration-500" 
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-500 italic">
                        ?
                      </div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] leading-snug tracking-tight group-hover:text-indigo-400 transition-colors">
                        {item.q}
                      </h3>
                    </div>
                    <div className="pl-12">
                      <div className="p-6 bg-[var(--bg-primary)]/50 rounded-2xl border-l-4 border-indigo-500/50 shadow-inner">
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-medium">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

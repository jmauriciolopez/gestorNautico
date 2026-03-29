import { useState } from 'react';
import { HelpCircle, ChevronRight, Anchor, CreditCard, Clock, Users, ShieldCheck } from 'lucide-react';

const HELP_TOPICS = [
  {
    id: 'operaciones',
    title: 'Operaciones',
    icon: <Anchor className="w-4 h-4" />,
    content: [
      { q: '¿Cómo subo una embarcación?', a: 'Desde el panel de "Solicitudes", selecciona una lancha en espera y presiona "Iniciar". Esto asignará un operario y registrará el movimiento.' },
      { q: '¿Qué es "Fuera de hora"?', a: 'Si una embarcación se sube después del horario límite configurado, el sistema la marcará automáticamente para seguimiento administrativo.' },
      { q: '¿Cómo libero un espacio?', a: 'Al registrar una "Salida" (bajada al agua), el espacio del rack queda disponible automáticamente.' }
    ]
  },
  {
    id: 'facturacion',
    title: 'Facturación',
    icon: <CreditCard className="w-4 h-4" />,
    content: [
      { q: '¿Cuándo se generan las cuotas?', a: 'Las cuotas (Individual/Familiar) se generan automáticamente el día del mes configurado para cada cliente.' },
      { q: '¿Cómo facturar un servicio?', a: 'Al completar un servicio, se genera un "Cargo" pendiente. Puedes agrupar varios cargos en una sola factura desde el módulo de Facturación.' },
      { q: '¿Cómo anular una factura?', a: 'Desde el listado de facturas, selecciona la factura y usa el botón de anular. Los cargos volverán a estar pendientes para una nueva facturación.' }
    ]
  },
  {
    id: 'configuraciones',
    title: 'Configuraciones',
    icon: <Clock className="w-4 h-4" />,
    content: [
      { q: '¿Dónde cambio el precio de la cuota?', a: 'En el módulo de Configuración Global. Los cambios afectarán a todos los clientes que tengan asignada esa categoría.' },
      { q: '¿Cómo cambio el horario de la marina?', a: 'Ajusta la "Hora de Apertura" y "Límite Máximo" en Configuración. Esto impacta en el marcado de movimientos fuera de hora.' }
    ]
  },
  {
    id: 'clientes',
    title: 'Clientes y Embarcaciones',
    icon: <Users className="w-4 h-4" />,
    content: [
      { q: '¿Cómo asignar una cuna?', a: 'Al crear o editar una embarcación, puedes seleccionar un espacio disponible del rack.' },
      { q: '¿Qué es un Responsable de Familia?', a: 'En cuotas familiares, solo el responsable recibe el cargo mensual. Los otros miembros son beneficiarios sin cargo individual.' }
    ]
  }
];

export default function UserHelp() {
  const [activeTopic, setActiveTopic] = useState(HELP_TOPICS[0].id);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase italic">
            Centro de <span className="text-indigo-500">Ayuda</span>
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">Conceptos rápidos y guías operativas para el Gestor Náutico.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 min-h-[500px]">
        {/* Sidebar Index */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          {HELP_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id)}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest border border-transparent ${
                activeTopic === topic.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-[var(--bg-secondary)]/[0.4] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/[0.8] hover:border-[var(--border-primary)]'
              }`}
            >
              <div className="flex items-center gap-3">
                {topic.icon}
                {topic.title}
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTopic === topic.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
          
          <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl space-y-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Soporte Técnico</p>
            <p className="text-xs text-indigo-200/70">Para incidencias críticas, contacte con el administrador del sistema.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[var(--bg-secondary)]/[0.2] border border-[var(--border-primary)] rounded-[2.5rem] p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            {HELP_TOPICS.find(t => t.id === activeTopic)?.icon}
            <div className="w-64 h-64 scale-[5] origin-top-right">
                {activeTopic === 'operaciones' && <Anchor className="w-full h-full" />}
                {activeTopic === 'facturacion' && <CreditCard className="w-full h-full" />}
                {activeTopic === 'configuraciones' && <Clock className="w-full h-full" />}
                {activeTopic === 'clientes' && <Users className="w-full h-full" />}
            </div>
          </div>

          <div className="relative z-10 space-y-10">
            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-3 italic">
              <span className="w-8 h-1 bg-indigo-500 rounded-full" />
              {HELP_TOPICS.find(t => t.id === activeTopic)?.title}
            </h2>

            <div className="space-y-8">
              {HELP_TOPICS.find(t => t.id === activeTopic)?.content.map((item, idx) => (
                <div key={idx} className="group p-6 bg-[var(--bg-primary)]/[0.5] hover:bg-[var(--bg-primary)] rounded-3xl border border-[var(--border-primary)] transition-all animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                  <h3 className="text-sm font-black text-[var(--text-primary)] mb-4 tracking-wide group-hover:text-indigo-400 transition-colors uppercase italic flex items-start gap-3">
                    <span className="text-indigo-500 opacity-50">#</span>
                    {item.q}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed border-l-2 border-indigo-500/20 pl-4">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

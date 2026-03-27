import { LayoutDashboard, Users, Ship, CircleDollarSign } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visión general del estado de la guardería náutica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center gap-2">
           <div className="bg-blue-100 p-3 rounded-full text-blue-600">
             <Ship className="w-6 h-6" />
           </div>
           <span className="text-3xl font-bold text-gray-800">42</span>
           <span className="text-sm font-medium text-gray-500 text-center">Embarcaciones Guardadas</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center gap-2">
           <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
             <Users className="w-6 h-6" />
           </div>
           <span className="text-3xl font-bold text-gray-800">128</span>
           <span className="text-sm font-medium text-gray-500 text-center">Clientes Activos</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center gap-2">
           <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
             <CircleDollarSign className="w-6 h-6" />
           </div>
           <span className="text-3xl font-bold text-gray-800">$12,450</span>
           <span className="text-sm font-medium text-gray-500 text-center">Cobros del mes</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center gap-2">
           <div className="bg-amber-100 p-3 rounded-full text-amber-600">
             <LayoutDashboard className="w-6 h-6" />
           </div>
           <span className="text-3xl font-bold text-gray-800">65%</span>
           <span className="text-sm font-medium text-gray-500 text-center">Ocupación de Cunas</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
         <h3 className="text-lg font-semibold text-gray-800 mb-4">Mapa de Cunas / Racks</h3>
         <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
           [Visualización del mapa en construcción]
         </div>
      </div>
    </div>
  );
}

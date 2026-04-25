import { useState } from 'react';
import { Layers, Plus, Loader2, Grid2X2, MapPin, Edit3, Check, X } from 'lucide-react';
import { Ubicacion, Zona } from '../hooks/useUbicaciones';
import { useConfirm } from '../../../shared/hooks/useConfirm';

interface ConfiguracionZonasProps {
  ubicaciones: Ubicacion[];
  zonas: Zona[];
  onCreateUbicacion: (data: { nombre: string; descripcion?: string }) => Promise<void>;
  onCreateZona: (data: { nombre: string; ubicacionId: number }) => Promise<void>;
  onUpdateZona: (id: number, data: { nombre: string; ubicacionId: number }) => Promise<void>;
  onDeleteZona: (id: number) => Promise<void>;
  onCreateRack: (data: {
    zonaId: number;
    codigo: string;
    pisos: number;
    filas: number;
    columnas: number;
    alto: number;
    ancho: number;
    largo: number;
  }) => Promise<void>;
  onUpdateRack: (id: number, data: {
    zonaId: number;
    codigo: string;
    pisos: number;
    filas: number;
    columnas: number;
    alto: number;
    ancho: number;
    largo: number;
  }) => Promise<void>;
  onDeleteRack: (id: number) => Promise<void>;
  isCreatingUbicacion: boolean;
  isCreatingZona: boolean;
  isUpdatingZona: boolean;
  isCreatingRack: boolean;
  isUpdatingRack: boolean;
}

export function ConfiguracionZonas({
  ubicaciones,
  zonas,
  onCreateUbicacion,
  onCreateZona,
  onUpdateZona,
  onDeleteZona,
  onCreateRack,
  onUpdateRack,
  onDeleteRack,
  isCreatingUbicacion,
  isCreatingZona,
  isUpdatingZona,
  isCreatingRack,
  isUpdatingRack
}: ConfiguracionZonasProps) {
  const [newUbicacion, setNewUbicacion] = useState({ nombre: '', descripcion: '' });
  const [newZona, setNewZona] = useState({ nombre: '', ubicacionId: 0 });
  const [editingZona, setEditingZona] = useState<Zona | null>(null);
  const [newRack, setNewRack] = useState({
    zonaId: 0,
    codigo: '',
    pisos: 1,
    filas: 1,
    columnas: 1,
    alto: 0,
    ancho: 0,
    largo: 0,
    tarifaBase: 0
  });
  const [editingRackId, setEditingRackId] = useState<number | null>(null);
  const confirm = useConfirm();

  const handleCreateUbicacion = async () => {
    if (!newUbicacion.nombre) return;
    await onCreateUbicacion(newUbicacion);
    setNewUbicacion({ nombre: '', descripcion: '' });
  };

  const handleCreateZona = async () => {
    if (!newZona.nombre || !newZona.ubicacionId) return;
    await onCreateZona(newZona);
    setNewZona({ nombre: '', ubicacionId: 0 });
  };

  const handleUpdateZona = async () => {
    if (!editingZona || !editingZona.nombre) return;
    await onUpdateZona(editingZona.id, {
      nombre: editingZona.nombre,
      ubicacionId: editingZona.ubicacionId
    });
    setEditingZona(null);
  };

  const handleCreateRack = async () => {
    if (!newRack.zonaId || !newRack.codigo) return;
    if (editingRackId) {
      await onUpdateRack(editingRackId, newRack);
      setEditingRackId(null);
    } else {
      await onCreateRack(newRack);
    }
    setNewRack({ zonaId: newRack.zonaId, codigo: '', pisos: 1, filas: 1, columnas: 1, alto: 0, ancho: 0, largo: 0, tarifaBase: 0 });
    setEditingRackId(null);
  };

  const handleEditRack = (rack: any) => {
    setEditingRackId(rack.id);
    setNewRack({
      zonaId: rack.zonaId,
      codigo: rack.codigo,
      pisos: rack.pisos,
      filas: rack.filas,
      columnas: rack.columnas,
      alto: rack.alto,
      ancho: rack.ancho,
      largo: rack.largo,
      tarifaBase: rack.tarifaBase || 0,
    });
  };

  const selectedZona = zonas.find((z) => z.id === newRack.zonaId);
  const currentRacks = selectedZona?.racks || [];

  const isEditingOccupied = editingRackId
    ? currentRacks.find(r => r.id === editingRackId)?.espacios?.some(e => e.ocupado)
    : false;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 1. Configuración de Ubicaciones */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 border-b border-[var(--border-primary)] pb-4">
            <MapPin className="text-emerald-500" />
            Nueva Ubicación (Sede / Puerto)
          </h3>
          <div className="bg-[var(--bg-secondary)]/60 p-8 rounded-3xl border border-[var(--border-primary)] shadow-2xl space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Nombre de Sede</label>
                <input
                  type="text"
                  value={newUbicacion.nombre}
                  onChange={(e) => setNewUbicacion({ ...newUbicacion, nombre: e.target.value })}
                  placeholder="Ej: Sede Norte, Puerto Bravo"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-[var(--text-primary)] placeholder-slate-600 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={newUbicacion.descripcion}
                  onChange={(e) => setNewUbicacion({ ...newUbicacion, descripcion: e.target.value })}
                  placeholder="Ej: Predio principal con acceso a rampa"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-[var(--text-primary)] placeholder-slate-600 transition-all outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleCreateUbicacion}
              disabled={!newUbicacion.nombre || isCreatingUbicacion}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-[var(--text-primary)] font-bold py-4 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex justify-center gap-2 items-center"
            >
              {isCreatingUbicacion ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              Registrar Ubicación
            </button>
          </div>
        </div>

        {/* 2. Configuración de Zonas */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 border-b border-[var(--border-primary)] pb-4">
            <Layers className="text-blue-500" />
            Zonas Operativas
          </h3>

          <div className="bg-[var(--bg-secondary)]/60 p-8 rounded-3xl border border-[var(--border-primary)] shadow-2xl space-y-6">
            {editingZona ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Editando Zona</span>
                  <button onClick={() => setEditingZona(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  <select
                    value={editingZona.ubicacionId}
                    onChange={(e) => setEditingZona({ ...editingZona, ubicacionId: +e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-slate-700 rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none"
                  >
                    <option value={0}>Seleccionar Sede...</option>
                    {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                  <input
                    type="text"
                    value={editingZona.nombre}
                    onChange={(e) => setEditingZona({ ...editingZona, nombre: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-slate-700 rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none"
                  />
                  <button
                    onClick={handleUpdateZona}
                    disabled={isUpdatingZona}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold py-3 rounded-xl flex justify-center gap-2 items-center"
                  >
                    {isUpdatingZona ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Guardar Cambios
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {zonas.map(zona => (
                    <div
                      key={zona.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${zona.ubicacionId ? 'bg-slate-800/40 border-slate-700/50' : 'bg-amber-500/10 border-amber-500/30'
                        }`}
                    >
                      <span className="text-sm text-[var(--text-primary)]">{zona.nombre}</span>
                      <button
                        onClick={() => setEditingZona(zona)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all text-blue-400"
                        title="Editar Zona"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await confirm({
                            title: 'Eliminar Zona',
                            message: `¿Estás seguro de eliminar la zona "${zona.nombre}"? Esta acción no se puede deshacer.`,
                            confirmText: 'Eliminar Zona',
                            variant: 'danger'
                          });
                          if (confirmed) {
                            onDeleteZona(zona.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all text-red-400"
                        title="Eliminar Zona"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {zonas.length === 0 && <p className="text-xs text-[var(--text-secondary)] italic">No hay zonas registradas.</p>}
                </div>

                <div className="pt-4 border-t border-[var(--border-primary)] space-y-4">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Registrar Nueva Zona</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                      value={newZona.ubicacionId}
                      onChange={(e) => setNewZona({ ...newZona, ubicacionId: +e.target.value })}
                      className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none"
                    >
                      <option value={0}>Elegir sede...</option>
                      {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                    <input
                      type="text"
                      value={newZona.nombre}
                      onChange={(e) => setNewZona({ ...newZona, nombre: e.target.value })}
                      placeholder="Nombre de Zona"
                      className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none"
                    />
                  </div>
                  <button
                    onClick={handleCreateZona}
                    disabled={!newZona.nombre || !newZona.ubicacionId || isCreatingZona}
                    className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-bold py-3 rounded-xl transition-all flex justify-center gap-2 items-center"
                  >
                    {isCreatingZona ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    Agregar Zona
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Configuración de Racks */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 border-b border-[var(--border-primary)] pb-4">
          <Grid2X2 className="text-purple-500" />
          Definición Técnica de Racks (Cuadrícula y Dimensiones)
        </h3>
        <div className="bg-[var(--bg-secondary)]/60 p-8 rounded-3xl border border-[var(--border-primary)] shadow-2xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                {editingRackId ? 'Zona de este Rack' : 'Zona Destino'}
              </label>
              <select
                value={newRack.zonaId}
                disabled={!!editingRackId}
                onChange={(e) => setNewRack({ ...newRack, zonaId: +e.target.value })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-[var(--text-primary)] transition-all outline-none disabled:opacity-50"
              >
                <option value={0}>Elegir una zona...</option>
                {zonas.map(zona => (
                  <option key={zona.id} value={zona.id}>
                    {zona.nombre} ({ubicaciones.find(u => u.id === zona.ubicacionId)?.nombre || 'Sin sede'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Identificador (Código)</label>
                {editingRackId && (
                  <button onClick={() => {
                    setEditingRackId(null);
                    setNewRack({ ...newRack, codigo: '', pisos: 1, filas: 1, columnas: 1, tarifaBase: 0 });
                  }} className="text-[10px] text-purple-400 hover:text-[var(--text-primary)] uppercase font-bold">Cancelar Edición</button>
                )}
              </div>
              <input
                type="text"
                value={newRack.codigo}
                onChange={(e) => setNewRack({ ...newRack, codigo: e.target.value })}
                placeholder="Ej: RACK-A"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl px-5 py-4 text-[var(--text-primary)] outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Pisos (Alto)</label>
                <input
                  type="number"
                  value={newRack.pisos}
                  min={1}
                  disabled={isEditingOccupied}
                  onChange={(e) => setNewRack({ ...newRack, pisos: +e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] outline-none disabled:opacity-40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Filas (Prof.)</label>
                <input
                  type="number"
                  value={newRack.filas}
                  min={1}
                  disabled={isEditingOccupied}
                  onChange={(e) => setNewRack({ ...newRack, filas: +e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] outline-none disabled:opacity-40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Columnas (Ancho)</label>
                <input
                  type="number"
                  value={newRack.columnas}
                  min={1}
                  disabled={isEditingOccupied}
                  onChange={(e) => setNewRack({ ...newRack, columnas: +e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-5 py-4 text-[var(--text-primary)] outline-none disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          {isEditingOccupied && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3">
              <span className="text-amber-400 text-xs font-medium">
                ⚠️ Este rack tiene embarcaciones. No se puede modificar la cuadrícula (pisos/filas/columnas) hasta que esté vacío.
              </span>
            </div>
          )}

          <div className="pt-6 border-t border-[var(--border-primary)]/50">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-6">Configuración Física y Comercial</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[var(--bg-primary)]/50 p-4 rounded-2xl border border-[var(--border-primary)] flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Ancho Total (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRack.ancho}
                  onChange={(e) => setNewRack({ ...newRack, ancho: +e.target.value })}
                  className="bg-transparent text-xl font-bold text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="bg-[var(--bg-primary)]/50 p-4 rounded-2xl border border-[var(--border-primary)] flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Alto Total (Y)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRack.alto}
                  onChange={(e) => setNewRack({ ...newRack, alto: +e.target.value })}
                  className="bg-transparent text-xl font-bold text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="bg-[var(--bg-primary)]/50 p-4 rounded-2xl border border-[var(--border-primary)] flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Profundidad (Z)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newRack.largo}
                  onChange={(e) => setNewRack({ ...newRack, largo: +e.target.value })}
                  className="bg-transparent text-xl font-bold text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="bg-[var(--bg-primary)]/50 p-4 rounded-2xl border border-[var(--border-primary)] flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Tarifa Base ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRack.tarifaBase}
                  onChange={(e) => setNewRack({ ...newRack, tarifaBase: +e.target.value })}
                  className="bg-transparent text-xl font-bold text-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateRack}
            disabled={!newRack.zonaId || !newRack.codigo || (editingRackId ? isUpdatingRack : isCreatingRack)}
            className={`w-full font-bold py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex justify-center gap-2 items-center text-lg ${editingRackId
              ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
              }`}
          >
            {(editingRackId ? isUpdatingRack : isCreatingRack) ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
            {editingRackId ? 'Confirmar Edición de Rack' : 'Generar Rack y Cuadrícula de Espacios'}
          </button>

          {/* Listado de Racks Existentes en la Zona */}
          {newRack.zonaId > 0 && (
            <div className="pt-8 border-t border-[var(--border-primary)]/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                  Racks en esta Zona ({currentRacks.length})
                </span>
              </div>

              {currentRacks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentRacks.map(rack => (
                    <div key={rack.id} className="bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] p-4 rounded-2xl group relative hover:border-purple-500/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-[var(--text-primary)]">{rack.codigo}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditRack(rack)}
                            className="p-1.5 hover:bg-purple-500/20 text-purple-400 rounded-lg"
                            title="Editar Rack"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await confirm({
                                title: 'Eliminar Rack',
                                message: `¿Eliminar rack "${rack.codigo}"? Todos sus espacios y configuraciones asociadas se borrarán permanentemente.`,
                                confirmText: 'Eliminar Rack',
                                variant: 'danger'
                              });
                              if (confirmed) {
                                onDeleteRack(rack.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg"
                            title="Eliminar Rack"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold grid grid-cols-1 gap-1">
                        <div className="flex justify-between">
                          <span>Cuadrícula:</span>
                          <span className="text-slate-300">{rack.pisos}P x {rack.filas}F x {rack.columnas}C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dimensiones:</span>
                          <span className="text-slate-300">{rack.ancho}x{rack.alto}x{rack.largo}m</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[var(--bg-primary)]/20 border border-dashed border-[var(--border-primary)] p-8 rounded-2xl text-center">
                  <p className="text-sm text-[var(--text-secondary)] italic">No hay racks configurados en esta zona aún.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

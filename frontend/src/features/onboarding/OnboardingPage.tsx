import { useState, useEffect, useRef, useCallback } from 'react';
import { motion as framerMotion, AnimatePresence as FramerAnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Settings, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Clock,
  Anchor,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Ship,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { useAuth } from '../auth/hooks/useAuth';
import { httpClient } from '../../shared/api/HttpClient';
import toast from 'react-hot-toast';

interface StepProps {
  onRegisterAction: (action: (() => Promise<boolean>) | null) => void;
  onDataChange?: (data: any) => void;
}

const Step1Profile = ({ onRegisterAction, onDataChange }: StepProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    direccion: '',
    telefono: '',
    email: '',
    ciudad: '',
    pais: 'Argentina'
  });

  useEffect(() => {
    const fetchGuarderia = async () => {
      try {
        const data = await httpClient.get<any>(`/guarderias/${user?.guarderiaId}`);
        setFormData({
          nombre: data.nombre || '',
          contacto: data.contacto || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          email: data.email || '',
          ciudad: data.ciudad || '',
          pais: data.pais || 'Argentina'
        });
      } catch {
        toast.error('Error al cargar datos de la marina');
      } finally {
        setLoading(false);
      }
    };
    if (user?.guarderiaId) fetchGuarderia();
  }, [user?.guarderiaId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    if (onDataChange) onDataChange(newData);
  };

  const handleSave = useCallback(async (): Promise<boolean> => {
    try {
      await httpClient.patch(`/guarderias/${user?.guarderiaId}`, formData);
      toast.success('Perfil actualizado');
      return true;
    } catch {
      toast.error('Error al guardar cambios');
      return false;
    }
  }, [formData, user?.guarderiaId]);

  useEffect(() => {
    onRegisterAction(handleSave);
    return () => onRegisterAction(null);
  }, [onRegisterAction, handleSave]);

  if (loading) return <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 rounded-3xl bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Email de Contacto</label>
            <input 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
              placeholder="info@marina.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Teléfono</label>
            <input 
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
              placeholder="+54 11 ..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Dirección</label>
            <input 
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
              placeholder="Calle 123..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Ciudad</label>
            <input 
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
              placeholder="Tigre"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">País</label>
            <input 
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
              placeholder="Argentina"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Nombre de la Marina</label>
            <input 
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
              placeholder="Ej. Marina del Sol"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Persona de Contacto</label>
            <input 
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
              placeholder="Nombre del responsable"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Step2Config = ({ onRegisterAction, onDataChange }: StepProps) => {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState({
    HORARIO_APERTURA: '08:00',
    HORARIO_MAX_SUBIDA: '18:00'
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await httpClient.get<any>('/configuracion');
        const map: any = {};
        response.data.forEach((c: any) => {
          map[c.clave] = c.valor;
        });
        setConfigs({
          HORARIO_APERTURA: map.HORARIO_APERTURA || '08:00',
          HORARIO_MAX_SUBIDA: map.HORARIO_MAX_SUBIDA || '18:00'
        });
      } catch {
        toast.error('Error al cargar configuración');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newConfigs = { ...configs, [name]: value };
    setConfigs(newConfigs);
    if (onDataChange) onDataChange(newConfigs);
  };

  const handleSave = useCallback(async (): Promise<boolean> => {
    try {
      await httpClient.put('/configuracion/bulk', configs);
      toast.success('Configuración guardada');
      return true;
    } catch {
      toast.error('Error al guardar configuración');
      return false;
    }
  }, [configs]);

  useEffect(() => {
    onRegisterAction(handleSave);
    return () => onRegisterAction(null);
  }, [onRegisterAction, handleSave]);

  if (loading) return <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 rounded-3xl bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                <Clock size={18} />
              </div>
              <label className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Apertura de Marina</label>
            </div>
            <input 
              type="time"
              name="HORARIO_APERTURA"
              value={configs.HORARIO_APERTURA}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all text-xl font-black text-slate-800" 
            />
            <p className="text-xs text-[var(--text-secondary)] font-bold">Hora en que el personal comienza a operar.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <Anchor size={18} />
              </div>
              <label className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Límite de Subida</label>
            </div>
            <input 
              type="time"
              name="HORARIO_MAX_SUBIDA"
              value={configs.HORARIO_MAX_SUBIDA}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all text-xl font-black text-slate-800" 
            />
            <p className="text-xs text-[var(--text-secondary)] font-bold">Hora máxima para solicitar que un barco sea sacado del agua.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step3Infra = ({ onRegisterAction }: StepProps) => {
  const [infraData, setInfraData] = useState({
    ubicacion: 'Sede Principal',
    zona: 'Hangar A',
    rackCodigo: 'MOD-1',
    pisos: 3,
    filas: 5,
    columnas: 4,
    tarifaBase: 50000
  });
  const [created, setCreated] = useState(false);

  const handleCreate = useCallback(async (): Promise<boolean> => {
    if (created) return true;

    try {
      const ub = await httpClient.post<any>('/ubicaciones', { nombre: infraData.ubicacion });
      const zona = await httpClient.post<any>('/zonas', { 
        nombre: infraData.zona, 
        ubicacionId: ub.id 
      });
      await httpClient.post<any>('/racks', {
        codigo: infraData.rackCodigo,
        zonaId: zona.id,
        pisos: infraData.pisos,
        filas: infraData.filas,
        columnas: infraData.columnas,
        tarifaBase: infraData.tarifaBase
      });
      setCreated(true);
      toast.success('Infraestructura creada con éxito');
      return true;
    } catch {
      toast.error('Error al crear infraestructura');
      return false;
    }
  }, [infraData, created]);

  useEffect(() => {
    onRegisterAction(handleCreate);
    return () => onRegisterAction(null);
  }, [onRegisterAction, handleCreate]);

  if (created) {
    return (
      <div className="p-12 rounded-3xl bg-green-500/10 border border-green-500/20 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black mb-2">¡Todo listo!</h3>
        <p className="text-[var(--text-secondary)] mb-6">Has creado {infraData.pisos * infraData.filas * infraData.columnas} cunas iniciales.</p>
        <button 
          onClick={() => setCreated(false)}
          className="text-sm font-bold text-[var(--accent-primary)] hover:underline"
        >
          Editar infraestructura
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 rounded-3xl bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] backdrop-blur-xl">
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Configura un módulo inicial para empezar. Podrás agregar más luego desde el panel de administración.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Nombre de Sede</label>
            <input 
              value={infraData.ubicacion}
              onChange={e => setInfraData({...infraData, ubicacion: e.target.value})}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Nombre de Zona/Hangar</label>
            <input 
              value={infraData.zona}
              onChange={e => setInfraData({...infraData, zona: e.target.value})}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
            />
          </div>

        </div>

        <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
          <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Layers size={16} className="text-[var(--accent-primary)]" />
            Configuración del Primer Rack
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase">Código</label>
              <input 
                value={infraData.rackCodigo}
                onChange={e => setInfraData({...infraData, rackCodigo: e.target.value})}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] outline-none font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase">Pisos</label>
              <input 
                type="number"
                value={infraData.pisos}
                onChange={e => setInfraData({...infraData, pisos: parseInt(e.target.value)})}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] outline-none font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase">Filas</label>
              <input 
                type="number"
                value={infraData.filas}
                onChange={e => setInfraData({...infraData, filas: parseInt(e.target.value)})}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] outline-none font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase">Columnas</label>
              <input 
                type="number"
                value={infraData.columnas}
                onChange={e => setInfraData({...infraData, columnas: parseInt(e.target.value)})}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] outline-none font-bold" 
              />
            </div>

          </div>


          <div className="mt-6 p-6 rounded-2xl bg-[var(--bg-secondary)] border border-dashed border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-black uppercase tracking-widest text-[var(--accent-primary)]">Tarifa Mensual Base ($)</label>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold">Precio sugerido para los espacios de este módulo.</p>
              </div>

              <input 
                type="number"
                value={infraData.tarifaBase}
                onChange={e => setInfraData({...infraData, tarifaBase: parseFloat(e.target.value)})}
                className="w-40 px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none text-right font-bold text-lg" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step4Policies = ({ onRegisterAction, onDataChange }: StepProps) => {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState({
    MORA_TASA_INTERES: '3',
    MORA_TASA_RECARGO: '10',
    MORA_DIAS_GRACIA: '5',
    DIAS_VENCIMIENTO: '15'
  });

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await httpClient.get<any>('/configuracion');
        const map: any = {};
        response.data.forEach((c: any) => { map[c.clave] = c.valor; });
        setConfigs({
          MORA_TASA_INTERES: map.MORA_TASA_INTERES || '3',
          MORA_TASA_RECARGO: map.MORA_TASA_RECARGO || '10',
          MORA_DIAS_GRACIA: map.MORA_DIAS_GRACIA || '5',
          DIAS_VENCIMIENTO: map.DIAS_VENCIMIENTO || '15'
        });
      } catch {
        toast.error('Error al cargar políticas');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newConfigs = { ...configs, [name]: value };
    setConfigs(newConfigs);
    onDataChange(newConfigs);
  };

  const handleSave = useCallback(async (): Promise<boolean> => {
    try {
      await httpClient.put('/configuracion/bulk', configs);
      toast.success('Políticas actualizadas');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar políticas');
      return false;
    }
  }, [configs]);

  useEffect(() => {
    onRegisterAction(handleSave);
    return () => onRegisterAction(null);
  }, [onRegisterAction, handleSave]);

  if (loading) return <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 rounded-3xl bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Interés Mensual (%)</label>
            <input 
              type="number"
              name="MORA_TASA_INTERES"
              value={configs.MORA_TASA_INTERES}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Recargo Fijo (%)</label>
            <input 
              type="number"
              name="MORA_TASA_RECARGO"
              value={configs.MORA_TASA_RECARGO}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Días de Gracia</label>
            <input 
              type="number"
              name="MORA_DIAS_GRACIA"
              value={configs.MORA_DIAS_GRACIA}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Vencimiento Factura (Días)</label>
            <input 
              type="number"
              name="DIAS_VENCIMIENTO"
              value={configs.DIAS_VENCIMIENTO}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-all font-bold" 
            />
          </div>

        </div>
        
      </div>
    </div>
  );
};

const Step5Migration = ({ onRegisterAction }: StepProps) => {
  const [uploading, setUploading] = useState<'clientes' | 'embarcaciones' | null>(null);

  useEffect(() => {
    // La migración es opcional, así que simplemente permitimos avanzar
    onRegisterAction(async () => true);
    return () => onRegisterAction(null);
  }, [onRegisterAction]);

  const downloadTemplate = (type: 'clientes' | 'embarcaciones') => {
    window.open(`${import.meta.env.VITE_API_URL}/import/templates/${type}`, '_blank');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'clientes' | 'embarcaciones') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await httpClient.post<any>(`/import/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Importación exitosa: ${response.registrosProcesados} registros.`);
    } catch {
      toast.error('Error al importar archivo. Verifica el formato CSV.');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 rounded-3xl bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] backdrop-blur-xl">
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Descarga las plantillas, completa los datos y súbelas aquí. Puedes saltar este paso y hacerlo después.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex flex-col items-center text-center transition-all hover:shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <UserIcon size={24} />
            </div>
            <h4 className="font-bold mb-1">Clientes</h4>
            <p className="text-[10px] text-[var(--text-muted)] mb-6 uppercase tracking-widest font-black">Paso Obligatorio para Barcos</p>
            
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={() => downloadTemplate('clientes')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-bold hover:bg-[var(--bg-secondary)] transition-all"
              >
                <Download size={14} /> Plantilla
              </button>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all">
                {uploading === 'clientes' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileSpreadsheet size={14} />}
                Subir CSV
                <input type="file" className="hidden" accept=".csv" onChange={e => handleFileUpload(e, 'clientes')} disabled={!!uploading} />
              </label>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex flex-col items-center text-center transition-all hover:shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4">
              <Ship size={24} />
            </div>
            <h4 className="font-bold mb-1 text-slate-800">Embarcaciones</h4>
            <p className="text-[10px] text-[var(--text-secondary)] mb-6 uppercase tracking-widest font-black">Asociadas a Clientes</p>

            
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={() => downloadTemplate('embarcaciones')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-bold hover:bg-[var(--bg-secondary)] transition-all"
              >
                <Download size={14} /> Plantilla
              </button>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all">
                {uploading === 'embarcaciones' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileSpreadsheet size={14} />}
                Subir CSV
                <input type="file" className="hidden" accept=".csv" onChange={e => handleFileUpload(e, 'embarcaciones')} disabled={!!uploading} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const STEPS = [
  { id: 1, title: 'Perfil', icon: Building2, component: Step1Profile },
  { id: 2, title: 'Configuración', icon: Settings, component: Step2Config },
  { id: 3, title: 'Infraestructura', icon: Layers, component: Step3Infra },
  { id: 4, title: 'Políticas', icon: ShieldAlert, component: Step4Policies },
  { id: 5, title: 'Migración', icon: Download, component: Step5Migration },
];

export function OnboardingPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [stepData, setStepData] = useState<any>({});
  const stepActionRef = useRef<(() => Promise<boolean>) | null>(null);

  const handleNext = async () => {
    if (stepActionRef.current) {
      setLoading(true);
      const success = await stepActionRef.current();
      setLoading(false);
      if (!success) return;
    }

    if (currentStep < STEPS.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await httpClient.patch(`/guarderias/${user?.guarderiaId}/finish-onboarding`, { finalizoOnboarding: true });
      toast.success('¡Onboarding completado! Bienvenido a bordo.');
      window.location.href = '/'; 
    } catch {
      toast.error('Error al finalizar el onboarding. Por favor intenta de nuevo.');
      setFinishing(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6 font-sans">
      {/* Premium Backdrop Overlay - Darker and more focused */}
      <framerMotion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
      />

      {/* Modal Container - Focused Card Style */}
      <framerMotion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl h-[min(850px,90vh)] bg-white rounded-[48px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-10 border border-slate-100"
      >
        {/* Modal Header / Progress */}
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="p-3.5 rounded-2xl bg-[var(--auth-accent)] shadow-lg shadow-indigo-200">
              <Anchor size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none text-slate-800">
                Gestor<span className="text-[var(--auth-accent)]">Náutico</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Configuración Inicial
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <p className="text-[11px] font-black text-[var(--auth-accent)] uppercase tracking-widest">
                  Paso {currentStep} de {STEPS.length}
                </p>
              </div>

            </div>
          </div>

          {/* Steps Indicator - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {STEPS.map((s, i) => {
              const isCurrent = currentStep === s.id;
              const isCompleted = completedSteps.includes(s.id);
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => s.id <= Math.max(...completedSteps, currentStep) && setCurrentStep(s.id)}
                    className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all ${
                      isCurrent 
                        ? 'bg-[var(--auth-accent)] text-white shadow-xl shadow-indigo-100' 
                        : isCompleted 
                          ? 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                          : 'bg-white text-slate-400 border border-slate-100' 
                    }`}
                  >
                    {isCompleted && !isCurrent ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                    {/* Tooltip */}
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-[10px] font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                      {s.title}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-[2px] mx-1 rounded-full transition-colors ${
                      completedSteps.includes(s.id) ? 'bg-emerald-200' : 'bg-slate-100'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
              <p className="text-xs font-black text-slate-800">{user?.nombre}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-tighter font-black">Administrador</p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
              <UserIcon size={20} className="text-slate-600" />
            </div>

          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-10 md:px-20 py-12">
            <div className="max-w-4xl mx-auto w-full">
              <FramerAnimatePresence mode="wait">
                <framerMotion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <div className="mb-10 text-center">
                    <h2 className="text-5xl font-black tracking-tight mb-4 text-slate-900">
                      {STEPS[currentStep - 1].title}
                    </h2>
                    <p className="text-slate-600 font-bold max-w-lg mx-auto text-base">
                      {currentStep === 1 && "Configura los datos básicos para que tus clientes puedan identificarte fácilmente."}
                      {currentStep === 2 && "Establece los horarios de atención y límites para las solicitudes de bajada."}
                      {currentStep === 3 && "Define dónde se guardarán las embarcaciones. No te preocupes, podrás agregar más luego."}
                      {currentStep === 4 && "Configura las tasas de mora y plazos de vencimiento para automatizar tu cobranza."}
                      {currentStep === 5 && "Importa tus datos actuales para empezar a operar en minutos con GestorNáutico."}
                    </p>
                  </div>

                  <div className="bg-slate-50/50 p-2 rounded-[40px] border border-slate-100">
                    <div className="bg-white rounded-[36px] p-8 md:p-12 shadow-sm border border-slate-200">

                      <CurrentStepComponent 
                        onRegisterAction={(fn) => stepActionRef.current = fn}
                        onDataChange={(data: any) => setStepData({ ...stepData, [currentStep]: data })} 
                      />
                    </div>
                  </div>
                </framerMotion.div>
              </FramerAnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="px-10 py-8 border-t border-white/5 bg-white/5 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-[var(--text-secondary)] hover:bg-white/5 transition-all disabled:opacity-0"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map(s => (
              <div 
                key={s.id} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentStep === s.id ? 'w-10 bg-[var(--accent-primary)]' : 
                  completedSteps.includes(s.id) ? 'w-3 bg-green-500' : 'w-3 bg-slate-200'
                }`}
              />

            ))}
          </div>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-sm shadow-[0_8px_32px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continuar
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-green-500 text-white font-bold text-sm shadow-[0_8px_32px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
            >
              {finishing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Finalizar Configuración
                  <CheckCircle2 size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </framerMotion.div>
    </div>
  );
}

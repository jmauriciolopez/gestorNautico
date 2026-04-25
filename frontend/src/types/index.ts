export enum Role {
    SUPERADMIN = 'SUPERADMIN', // Dueño del SaaS
    ADMIN = 'ADMIN',           // Propietario de la guardería
    SUPERVISOR = 'SUPERVISOR', // Gestor operativo
    OPERADOR = 'OPERADOR',     // Trabajo diario básico
}

export interface User {
    id: number;
    usuario: string;
    nombre: string;
    email: string;
    role: Role;
    guarderiaId?: number; // Tenant actual del usuario
    guarderia?: Guarderia; // Relación cargada
    token?: string;
}

export interface Guarderia {
    id: number;
    nombre: string;
    contacto: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    activo: boolean;
    logo?: string;
    finalizoOnboarding?: boolean;
}

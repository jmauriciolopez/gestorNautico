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
    token?: string;
}

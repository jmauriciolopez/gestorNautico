export enum Role {
    SUPERADMIN = 'SUPERADMIN',
    ADMIN = 'ADMIN',
    OPERADOR = 'OPERADOR',
}

export interface User {
    id: number;
    usuario: string;
    nombre: string;
    email: string;
    role: Role;
    token?: string;
}

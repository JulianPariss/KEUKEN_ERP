import { TUserRole } from "@repo/api-contracts/erp";

export interface IOperationalRoleOption {
    id: TUserRole | string;
    name: string;
    label: string;
}

export const OPERATIONAL_ROLES: IOperationalRoleOption[] = [
    { id: 'user', name: 'Usuario (User)', label: 'Usuario (user) - Operativo básico' },
    { id: 'salesman', name: 'Vendedor (Salesman)', label: 'Vendedor (salesman) - Ventas y clientes' },
    { id: 'driver', name: 'Conductor (Driver)', label: 'Conductor (driver) - Logística y entregas' },
    { id: 'accountant', name: 'Contador (Accountant)', label: 'Contador (accountant) - Contabilidad y finanzas' },
    { id: 'admin', name: 'Administrador (Admin)', label: 'Administrador (admin) - Acceso amplio a operaciones' },
    { id: 'dbadmin', name: 'DB Admin', label: 'DB Admin (dbadmin) - Recuperación y lectura' },
    { id: 'superadmin', name: 'Superadmin', label: 'Super Admin (superadmin) - Control total' },
];

export const DEFAULT_ROLE_OPTIONS = OPERATIONAL_ROLES;

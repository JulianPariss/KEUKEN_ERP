export interface IOperationalRoleOption {
    id: string;
    name: string;
}

export const OPERATIONAL_ROLES: IOperationalRoleOption[] = [
    { id: 'superadmin', name: 'Superadmin' },
    { id: 'admin', name: 'Admin' },
    { id: 'dbadmin', name: 'DB Admin' },
    { id: 'accountant', name: 'Contador (Accountant)' },
    { id: 'salesman', name: 'Vendedor (Salesman)' },
    { id: 'driver', name: 'Conductor (Driver)' },
    { id: 'user', name: 'Usuario (User)' },
];

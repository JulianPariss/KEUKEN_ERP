'use client';

import { useMemo } from 'react';

import { usersService } from "@/app/services/users.service";
import { IFUser } from "@repo/api-contracts/erp";
import { IFRole } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Popup, Position } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import PermissionsSelector from "../../system/keysManager/components/permissionsSelector";

interface UserPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: IFUser | null;
    onSuccess?: () => void;
}

export default function UserPermissionsModal({ isOpen, onClose, user, onSuccess }: UserPermissionsModalProps) {
    const { token, currentCompany } = useAuth();

    const handleSave = async (newPermissions: string[], active: boolean) => {
        if (!user || !token) return;

        try {
            await usersService.update(user.id, {
                roleAssignments: [
                    {
                        companyId: currentCompany?.id || '',
                        level: 'company',
                        roles: newPermissions
                    }
                ],
                scopeGrants: []
            }, token);

            notify('Permisos actualizados correctamente', 'success', 3000);
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Error al actualizar permisos:', error);
            const errorMessage = error instanceof Error && error.message ? error.message : 'Error al actualizar permisos';
            notify(errorMessage, 'error', 3000);
        }
    };

    const pseudoRole = useMemo<IFRole | null>(() => {
        if (!user) return null;
        const currentRoleAssignment = user.roleAssignments?.find(
            (ra: any) => ra.companyId === currentCompany?.id
        );
        const userScopes = currentRoleAssignment?.roles ?? (user?.roles || []);
        return {
            id: user.id,
            name: user.name,
            scopes: userScopes,
            active: user.active,
            keyPrefix: '',
            createdAt: '',
            lastUsedAt: '',
        };
    }, [user, currentCompany?.id]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Configuración de Permisos"
            width={850}
            height={'80vh'}
        >
            <Position at="center" my="center" of="window" />
            {user ? (
                <div className="w-full h-full overflow-hidden flex flex-col pt-2 rounded-dx">
                    <PermissionsSelector
                        isReadOnly={false}
                        selectedRoles={pseudoRole}
                        onSave={handleSave}
                        onCancel={onClose}
                        hideTitle={true}
                    />
                </div>
            ) : null}
        </Popup>
    );
}

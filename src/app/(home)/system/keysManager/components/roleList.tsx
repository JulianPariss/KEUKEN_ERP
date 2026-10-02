import { IFRole, TFRoles } from "@repo/api-contracts/erp";
import dayjs from "dayjs";
import { Button } from '@repo/devextreme';
import { ScrollView } from "devextreme-react/scroll-view";
import notify from "devextreme/ui/notify";
import { useState } from "react";
import RoleDeleteModal from "./actions/delete";

interface IRoleProps {
    role: IFRole;
    onEdit: () => void;
    onDelete: () => void;
    onClick: () => void;
    isActive?: boolean;
    isEditing: boolean;
    canModify: boolean;
}

const RoleCard = (props: IRoleProps) => {
    const {
        role,
        onEdit,
        onDelete,
        onClick,
        isActive,
        isEditing,
        canModify
    } = props;

    const [showKey, setShowKey] = useState(false);

    const textColor = isActive ? '!text-variant' : '!text-main';

    return (
        <div
            onClick={onClick}
            className={`flex flex-col items-between justify-between p-3 mb-3 rounded-dx border transition-all cursor-pointer group shadow-md
            ${isActive
                    ? 'bg-focus-100/80 border-focus-500 shadow-black/10'
                    : 'bg-primary-500 border-main/10 hover:bg-primary-500/50 hover:border-main/20'}`}>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative flex size-2.5">
                        <span className={`relative inline-flex rounded-full size-2.5 ${role.active ? 'bg-focus-100' : 'bg-primary-900/70'}`}></span>
                    </div>
                    <span className={`font-medium ${textColor}`}>
                        {role.name}
                    </span>
                </div>

                {isEditing ?
                    <div className={`flex gap-1 ${isActive ? 'opacity-100' : 'opacity-0'} transition-colors`}>
                        <Button
                            icon="check"
                            hint="Guardar"
                            stylingMode="text"
                            onClick={(e) => {
                                e.event?.stopPropagation();
                                document.getElementById('permissions-save-btn')?.click();
                            }}
                            className={textColor}
                        />
                        <Button
                            icon="close"
                            hint="Cancelar"
                            stylingMode="text"
                            onClick={(e) => {
                                e.event?.stopPropagation();
                                document.getElementById('permissions-discard-btn')?.click();
                            }}
                            className={textColor}
                        />
                    </div>
                    :
                    canModify ? (
                        <div className="flex gap-1 transition-colors">
                            <Button
                                icon="edit"
                                hint="Editar permisos"
                                stylingMode="text"
                                onClick={(e) => { e.event?.stopPropagation(); onEdit(); }}
                                className={textColor}
                            />
                            <Button
                                icon="trash"
                                hint="Eliminar rol"
                                stylingMode="text"
                                onClick={(e) => { e.event?.stopPropagation(); onDelete(); }}
                                className={textColor}
                            />
                        </div>
                    ) : null}
            </div>
            <div className="flex flex-col gap-1 mt-1">
                <p className={`text-xs  ${textColor}`}>Creado: <span className={`${textColor}`}>{dayjs(role.createdAt).format('DD/MM/YYYY HH:mm')}</span></p>
                <p className={`text-xs  ${textColor}`}>Último uso: <span className={`${textColor}`}>{role.lastUsedAt ? dayjs(role.lastUsedAt).format('DD/MM/YYYY HH:mm') : 'Sin uso'}</span></p>
            </div>
            {isActive &&
                <div className="flex justify-between items-stretch mt-2">
                    <div className="rounded-l-dx bg-primary-500/20 px-2 py-1 flex items-center w-full">
                        <p className={`text-xs  ${textColor} password-text font-mono`}>
                            {showKey ? role.keyPrefix : '••••••••••••••••••••••••'}
                        </p>
                    </div>
                    <div className="bg-primary-500/40 w-fit rounded-r-dx flex items-center justify-center px-1 border-l-1 border-focus-100/50">
                        <div
                            className="flex p-1 cursor-pointer"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setShowKey(true);
                            }}
                            onMouseLeave={() => setShowKey(false)}
                            onMouseUp={() => setShowKey(false)}
                        >
                            <i className={`dx-icon-${!showKey ? 'eyeclose' : 'eyeopen'} !text-xl hover:text-focus-100 text-variant`} title={showKey ? "Ocultar" : "Mostrar"} />
                        </div>
                        <div
                            className="flex p-1 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(role.keyPrefix);
                                notify('Clave copiada!', 'success', 1000);
                            }}
                        >
                            <i className={`dx-icon-copy !text-xl hover:text-focus-100 text-variant`} title="Copiar" />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

interface RoleListProps {
    selectedRoleId: string | null;
    selectedRoleName: string;
    onSelectRole: (id: string) => void;
    onEditRole: (id: string) => void;
    isEditing: boolean;
    roles: TFRoles;
    onDelete: (id: string) => void;
    canModify: boolean;
}

const RoleList = (props: RoleListProps) => {
    const {
        selectedRoleId,
        onSelectRole,
        onEditRole,
        isEditing,
        roles,
        onDelete,
        selectedRoleName,
        canModify
    } = props;

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const handleDeleteClick = (id: string) => {
        onSelectRole(id);
        setIsDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        onDelete(selectedRoleId!);
        setIsDeleteModalVisible(false);
    };

    return (
        <div className="h-full flex flex-col">
            <ScrollView height="100%" showScrollbar="onHover">
                <div className="p-1">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onClick={() => onSelectRole(role.id)}
                            onEdit={() => onEditRole(role.id)}
                            onDelete={() => handleDeleteClick(role.id)}
                            isActive={role.id === selectedRoleId}
                            isEditing={isEditing}
                            canModify={canModify}
                        />
                    ))}
                </div>
            </ScrollView>

            <RoleDeleteModal
                visible={isDeleteModalVisible && selectedRoleId !== null}
                onHiding={() => setIsDeleteModalVisible(false)}
                onConfirm={handleConfirmDelete}
                roleName={selectedRoleName}
            />
        </div>
    );
};
export default RoleList;

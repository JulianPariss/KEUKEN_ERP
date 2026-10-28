'use client';

import {
    permissionsConfig,
    TFPermissionsConfig,
    TPermissionAction
} from "@repo/access";
import { mapPermissionsToBackend, mapPermissionsToFrontend } from "@repo/access";
import { IFRole } from "@repo/api-contracts/erp";
import { Button } from '@repo/devextreme';
import { Popover } from "devextreme-react/popover";
import { CheckBox } from "devextreme-react/check-box";
import { ScrollView } from "devextreme-react/scroll-view";
import { memo, useCallback, useEffect, useState } from "react";
import { PermissionRow } from "./permissionRow";

interface PermissionsSelectorProps {
    isReadOnly?: boolean;
    onCancel?: () => void;
    onSave: (newPermissions: string[], active: boolean) => void;
    selectedRoles: IFRole | null;
    hideTitle?: boolean;
}

export const actionHeaders: { key: TPermissionAction; label: string }[] = [
    { key: 'view', label: 'Ver' },
    { key: 'modify', label: 'Modificar' },
    { key: 'extract', label: 'Extraer' },
];

const PermissionsSelector = ({ isReadOnly = true, onCancel, onSave, selectedRoles, hideTitle = false }: PermissionsSelectorProps) => {
    const [permissions, setPermissions] = useState<TFPermissionsConfig>(permissionsConfig);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [isActive, setIsActive] = useState<boolean>(true);

    const getPermissions = () => {
        if (!selectedRoles) return;
        setPermissions(mapPermissionsToFrontend(selectedRoles.scopes));
        setIsActive(selectedRoles.active ?? true);
    };

    useEffect(() => {
        getPermissions();
    }, [selectedRoles?.id, selectedRoles?.scopes, selectedRoles?.active]);

    const handleActionChange = useCallback((routeKey: string, action: TPermissionAction, value: boolean) => {
        if (isReadOnly) return;
        setPermissions(prev => ({
            ...prev,
            [routeKey]: {
                ...prev[routeKey as keyof TFPermissionsConfig]!,
                actions: {
                    ...prev[routeKey as keyof TFPermissionsConfig]?.actions,
                    [action]: value
                }
            }
        }));
    }, [isReadOnly]);

    const handleDiscard = () => {
        getPermissions();
        onCancel?.();
    };

    const handleSave = () => {
        const backendPermissions = mapPermissionsToBackend(permissions);
        onSave(backendPermissions, isActive);
    };

    const handleSelectAllInRow = useCallback((routeKey: string) => {
        if (isReadOnly) return;

        setPermissions(prev => {
            const currentActions = prev[routeKey as keyof TFPermissionsConfig]?.actions || {};
            const nonNullActions = Object.values(currentActions).filter(v => v !== null) as boolean[];
            const allSelected = nonNullActions.every(v => v === true);
            const newValue = !allSelected;

            const updatedActions = { ...currentActions };
            Object.keys(updatedActions).forEach(action => {
                if (updatedActions[action as TPermissionAction] !== null) {
                    updatedActions[action as TPermissionAction] = newValue;
                }
            });

            return {
                ...prev,
                [routeKey]: {
                    ...prev[routeKey as keyof TFPermissionsConfig]!,
                    actions: updatedActions
                }
            };
        });
    }, [isReadOnly]);

    const handleToggleAllPermissions = () => {
        const allEntries = Object.entries(permissions);
        const isEverythingSelected = allEntries.every(([_, config]) => {
            const actions = config?.actions || {};
            return Object.values(actions).every(v => v === true || v === null);
        });
        const newValue = !isEverythingSelected;

        const updatedPermissions = {} as TFPermissionsConfig;
        (Object.keys(permissions) as Array<keyof TFPermissionsConfig>).forEach(key => {
            const currentActions = permissions[key]!.actions;
            const updatedActions = { ...currentActions };
            Object.keys(updatedActions).forEach(action => {
                const typedAction = action as TPermissionAction;
                if (updatedActions[typedAction] !== null) {
                    updatedActions[typedAction] = newValue;
                }
            });

            updatedPermissions[key] = {
                ...permissions[key]!,
                actions: updatedActions
            };
        });
        setPermissions(updatedPermissions);
        setIsPopoverVisible(false);
    };



    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden">
            <div className="flex flex-col justify-between p-4 bg-primary-500 border-b border-main/20 rounded-t-dx">
                {!hideTitle && (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Configuración de Permisos</h2>
                    </div>
                )}
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6 flex items-center justify-between">
                        <div className="text-main text-xs  uppercase">
                            Módulo / Sección
                        </div>
                        {!isReadOnly ? (
                            <Button
                                id="global-toggle-btn"
                                icon="selectall"
                                hint="Alternar todos los permisos"
                                stylingMode="text"
                                className="!text-variant hover:!text-focus-300"
                                onClick={() => setIsPopoverVisible(true)}
                            />
                        ) : null}
                    </div>
                    <div className="col-span-6 flex justify-end gap-12 pr-4">
                        {actionHeaders.map(header => (
                            <div key={header.key} className="text-main text-xs  uppercase w-20 text-center font-semibold">
                                {header.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content with optional Overlay */}
            <div className="flex-1 min-h-0 relative">
                <ScrollView height="100%" showScrollbar="onHover">
                    <div className={`flex flex-col gap-2 p-4 transition-all duration-500 ${isReadOnly ? 'opacity-80' : 'opacity-100'}`}>
                        {Object.entries(permissionsConfig).map(([key, config]) => {
                            if (!config) return null;

                            return (
                                <PermissionRow
                                    key={key}
                                    routeKey={key}
                                    config={config}
                                    permissionsData={permissions[key as keyof TFPermissionsConfig]}
                                    isReadOnly={isReadOnly}
                                    onSelectAllInRow={handleSelectAllInRow}
                                    onActionChange={handleActionChange}
                                />
                            );
                        })}
                    </div>
                </ScrollView>
            </div>

            {/* Footer Buttons (Hidden if readOnly) */}
            {!isReadOnly ? (
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 ml-5">
                        <CheckBox
                            value={isActive}
                            onValueChanged={(e) => setIsActive(e.value)}
                        />
                        <p className={`text-xs  ${isActive ? 'text-focus-300' : 'text-main'}`}>{isActive ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <div className="p-3 flex justify-end gap-2">
                        <Button
                            id="permissions-discard-btn"
                            text="Descartar Cambios"
                            stylingMode="outlined"
                            type="default"
                            onClick={handleDiscard}
                        />
                        <Button
                            id="permissions-save-btn"
                            stylingMode="contained"
                            type="default"
                            onClick={handleSave}
                            className="shadow-md shadow-black/20"
                        >
                            <div className="flex items-center justify-center">
                                <p className={`text-xs !text-variant`}>Guardar Cambios</p>
                            </div>
                        </Button>
                    </div>
                </div>
            ) : null}

            {!isReadOnly ? (
                <Popover
                    target="#global-toggle-btn"
                    position="bottom"
                    width={'auto'}
                    visible={isPopoverVisible}
                    onHiding={() => setIsPopoverVisible(false)}
                    className="custom-popover-confirmation"
                    showTitle={false}
                >
                    <div className="p-2">
                        <p className="text-sm  mb-4 font-medium text-left">
                            ¿Deseas cambiar todos los permisos al mismo tiempo?
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                text="Cancelar"
                                stylingMode="outlined"
                                onClick={() => setIsPopoverVisible(false)}
                                height={36}
                            />
                            <Button
                                type="default"
                                stylingMode="contained"
                                onClick={handleToggleAllPermissions}
                            >
                                <div className="flex items-center justify-center">
                                    <p className={`text-sm !text-variant`}>Confirmar</p>
                                </div>
                            </Button>
                        </div>
                    </div>
                </Popover>
            ) : null}
        </div>
    );
};



export default PermissionsSelector;

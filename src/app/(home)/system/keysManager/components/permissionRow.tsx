import { memo } from "react";
import { Button } from '@repo/devextreme';
import { CheckBox } from "devextreme-react/check-box";
import { TPermissionAction } from "@/app/lib/permissions/getPermissions";
import { actionHeaders } from "./permissionsSelector";

export interface PermissionRowProps {
    routeKey: string;
    config: any;
    permissionsData: any;
    isReadOnly: boolean;
    onSelectAllInRow: (key: string) => void;
    onActionChange: (key: string, action: TPermissionAction, value: boolean) => void;
}

export const PermissionRow = memo(({
    routeKey,
    config,
    permissionsData,
    isReadOnly,
    onSelectAllInRow,
    onActionChange
}: PermissionRowProps) => {
    return (
        <div className="grid grid-cols-12 gap-2 items-center p-3 rounded-dx bg-primary-500 border border-main/20 hover:bg-main/20 transition-all group">
            <div className="col-span-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium group-hover:text-focus-300 transition-colors">
                        {config.label}
                    </p>
                    <p className="!text-main/40 text-sm italic">
                        Backend: {config.backendKey}
                    </p>
                </div>
                {!isReadOnly ? (
                    <Button
                        icon="selectall"
                        hint="Habilitar todos"
                        stylingMode="text"
                        className="!text-variant hover:!text-focus-300"
                        onClick={() => onSelectAllInRow(routeKey)}
                    />
                ) : null}
            </div>
            <div className="col-span-6 flex justify-end gap-12 pr-4">
                {actionHeaders.map(action => {
                    const actionValue = permissionsData?.actions[action.key];
                    const isActionDisabled = actionValue === null;

                    return (
                        <div key={action.key} className="w-20 flex justify-center">
                            <CheckBox
                                disabled={isActionDisabled}
                                readOnly={isReadOnly}
                                value={actionValue === null ? false : actionValue}
                                onValueChanged={(e) => onActionChange(routeKey, action.key, e.value)}
                                className={
                                    isActionDisabled
                                        ? 'opacity-20 cursor-not-allowed'
                                        : isReadOnly
                                            ? 'cursor-default'
                                            : ''
                                }
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
PermissionRow.displayName = 'PermissionRow';

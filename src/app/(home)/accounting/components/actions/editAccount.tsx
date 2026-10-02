'use client';

import { accountsService } from '@/app/services/accountant/accounts.service';
import { IFAccountUpdate, TFAccountStatus } from "@repo/api-contracts/erp";
import { useAccounting } from '@/contexts/AccountingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button, SelectBox } from '@repo/devextreme';
import { Popup } from 'devextreme-react/popup';
import { TextBox } from 'devextreme-react/text-box';
import notify from 'devextreme/ui/notify';
import { useEffect, useState } from 'react';

interface EditAccountProps {
    isOpen: boolean;
    onClose: () => void;
    accountId: string | null;
}

const accountStatuses = [
    { id: 'active', name: 'Activa' },
    { id: 'summary', name: 'Sumarizado' },
    { id: 'deprecated', name: 'Deprecada' }
];

export default function EditAccount({ isOpen, onClose, accountId }: EditAccountProps) {
    const { getAccountById, triggerRefresh } = useAccounting();
    const { token, currentCompany } = useAuth();

    const [name, setName] = useState('');
    const [status, setStatus] = useState<TFAccountStatus>('active');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && accountId) {
            const account = getAccountById(accountId);
            if (account) {
                setName(account.name);
                setStatus(account.status);
            }
        }
    }, [isOpen, accountId, getAccountById]);

    const handleUpdate = async () => {
        if (!name || !status) {
            notify('Por favor complete todos los campos obligatorios', 'warning', 3000);
            return;
        }

        if (!token || !currentCompany || !accountId) {
            notify('Error de autenticación o cuenta inválida', 'error', 3000);
            return;
        }

        setLoading(true);
        try {
            const data: IFAccountUpdate = {
                name,
                status
            };

            await accountsService.update(accountId, data, token, currentCompany.id);
            notify('Cuenta actualizada exitosamente', 'success', 3000);
            triggerRefresh();
            onClose();
        } catch (error) {
            console.error(error);
            notify('Error al actualizar la cuenta', 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showTitle={true}
            title="Editar Cuenta"
            width={500}
            height="auto"
            className="rounded-dx"
        >
            <div className="flex flex-col gap-4 p-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-main/80">Nombre</label>
                    <TextBox
                        value={name}
                        onValueChanged={(e) => setName(e.value)}
                        placeholder="Nombre de la cuenta..."
                        width="100%"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-main/80">Estado</label>
                    <SelectBox
                        items={accountStatuses}
                        valueExpr="id"
                        displayExpr="name"
                        value={status}
                        onValueChanged={(e) => setStatus(e.value)}
                        width="100%"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        text="Cancelar"
                        type="normal"
                        stylingMode="outlined"
                        onClick={onClose}
                        disabled={loading}
                    />
                    <Button
                        text={loading ? "Guardando..." : "Guardar Cambios"}
                        type="default"
                        stylingMode="contained"
                        onClick={handleUpdate}
                        disabled={loading}
                        className='!text-variant'
                    />
                </div>
            </div>
        </Popup>
    );
}

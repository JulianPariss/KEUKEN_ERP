"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { GenericButton } from '@repo/devextreme';
import { useAuth } from "@/contexts/AuthContext";
import { useAccess } from "@repo/access";
import { branchesService } from "@repo/erp-services/userContext/branches.service";
import { establishmentsService } from "@repo/erp-services/userContext/establishments.service";
import { logisticsCentersService } from "@repo/erp-services/userContext/logisticsCenters.service";
import { cashRegistersService } from "@repo/erp-services/accountant/cashRegisters.service";
import { IFBranchCreate, IFBranchDetail } from "@repo/api-contracts/erp";
import { IFEstablishment } from "@repo/api-contracts/erp";
import { IFLogisticsCenter } from "@repo/api-contracts/erp";
import { IFCashRegister } from "@repo/api-contracts/erp";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";

interface BranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onHidden?: () => void;
    initialData?: IFBranchDetail | null;
}

const BranchCreationModal = ({ isOpen, onClose, onSuccess, onHidden, initialData }: BranchModalProps) => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const { token, currentCompany, companies } = useAuth();
    const { canAccess } = useAccess();
    const canUseCashRegisters = canAccess("treasury.cashRegisters.lookup");

    const [establishments, setEstablishments] = useState<IFEstablishment[]>([]);
    const [logisticsCenters, setLogisticsCenters] = useState<IFLogisticsCenter[]>([]);
    const [cashRegisters, setCashRegisters] = useState<IFCashRegister[]>([]);

    const [formData, setFormData] = useState<IFBranchCreate & { active?: boolean }>({
        code: "",
        name: "",
        companyId: currentCompany?.id || "",
        establishmentId: null,
        logisticsCenterId: null,
        cashRegisterId: null,
        active: true,
    });

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    code: initialData.code || "",
                    name: initialData.name || "",
                    companyId: initialData.companyId || currentCompany?.id || "",
                    establishmentId: initialData.establishmentId || null,
                    logisticsCenterId: initialData.logisticsCenterId || null,
                    cashRegisterId: initialData.cashRegisterId || null,
                    defaultIncomeAccountId: initialData.defaultIncomeAccountId || null,
                    defaultExpenseAccountId: initialData.defaultExpenseAccountId || null,
                    defaultCustomerAccountId: initialData.defaultCustomerAccountId || null,
                    defaultSupplierAccountId: initialData.defaultSupplierAccountId || null,
                    active: initialData.active ?? true,
                }
                : {
                    code: "",
                    name: "",
                    companyId: currentCompany?.id || "",
                    establishmentId: null,
                    logisticsCenterId: null,
                    cashRegisterId: null,
                    active: true,
                };

            setFormData(nextData);

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                    if (typeof formInstance.reset === 'function') {
                        formInstance.reset();
                    }
                    formInstance.option("formData", nextData);
                }
            }, 0);
        }
    }, [isOpen, initialData, currentCompany?.id]);

    useEffect(() => {
        if (!isOpen || !token) return;

        const targetCompanyId = formData.companyId || currentCompany?.id;
        if (!targetCompanyId) return;

        const loadOptions = async () => {
            try {
                const [estRes, logRes, cashRes] = await Promise.allSettled([
                    establishmentsService.getAll({ limit: 100, company_id: targetCompanyId }, token),
                    logisticsCentersService.getAll({ limit: 100, company_id: targetCompanyId }, token),
                    canUseCashRegisters
                        ? cashRegistersService.getAll(token, targetCompanyId)
                        : Promise.resolve({ items: [] as IFCashRegister[] }),
                ]);

                if (estRes.status === "fulfilled") {
                    setEstablishments(estRes.value.items || []);
                }
                if (logRes.status === "fulfilled") {
                    setLogisticsCenters(logRes.value.items || []);
                }
                if (canUseCashRegisters && cashRes.status === "fulfilled") {
                    setCashRegisters(cashRes.value.items || []);
                } else {
                    setCashRegisters([]);
                }
            } catch (err) {
                console.error("Error loading branch options:", err);
            }
        };

        loadOptions();
    }, [isOpen, token, formData.companyId, currentCompany?.id, canUseCashRegisters]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const targetCompanyId = currentFormData.companyId || currentCompany?.id;
            const payload = {
                ...currentFormData,
                companyId: targetCompanyId,
            };

            if (initialData?.id) {
                await branchesService.update(initialData.id, payload, token);
                notify("Sucursal actualizada exitosamente", "success", 3000);
            } else {
                await branchesService.create(payload, token);
                notify("Sucursal creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving branch:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al guardar la sucursal";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, currentCompany?.id, onClose, onSuccess, token]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={onHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Sucursal" : "Nueva Sucursal"}
            width={600}
            height="auto"
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <Form
                    ref={formRef}
                    formData={formData}
                    labelLocation="top"
                >
                    <GroupItem colCount={2}>
                        <SimpleItem
                            dataField="code"
                            label={{ text: "Código" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                placeholder: "Código de la sucursal",
                                valueChangeEvent: "blur",
                                stylingMode: 'filled',
                                maxLength: FIELD_LIMITS.stringTeeny,
                            }}
                            validationRules={[
                                { type: 'required', message: "El código es obligatorio" },
                                { type: 'stringLength', max: FIELD_LIMITS.stringTeeny, message: `El código no puede superar los ${FIELD_LIMITS.stringTeeny} caracteres` }
                            ]}
                        />
                        <SimpleItem
                            dataField="name"
                            label={{ text: "Nombre" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                placeholder: "Nombre de la sucursal",
                                valueChangeEvent: "blur",
                                stylingMode: 'filled',
                                maxLength: FIELD_LIMITS.stringLong,
                            }}
                            validationRules={[
                                { type: 'required', message: "El nombre es obligatorio" },
                                { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` }
                            ]}
                        />
                        <SimpleItem
                            dataField="companyId"
                            label={{ text: "Empresa" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: companies,
                                valueExpr: "id",
                                displayExpr: "name",
                                placeholder: "Seleccione una empresa...",
                                searchEnabled: true,
                                stylingMode: 'filled',
                                dropDownOptions: {
                                    wrapperAttr: {
                                        class: 'popup-menu-container'
                                    }
                                }
                            }}
                            validationRules={[{ type: 'required', message: "La empresa es obligatoria" }]}
                        />
                        <SimpleItem
                            dataField="establishmentId"
                            label={{ text: "Establecimiento" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: establishments,
                                valueExpr: "id",
                                displayExpr: "name",
                                placeholder: "Seleccione un establecimiento...",
                                searchEnabled: true,
                                showClearButton: true,
                                stylingMode: 'filled',
                                dropDownOptions: {
                                    wrapperAttr: {
                                        class: 'popup-menu-container'
                                    }
                                }
                            }}
                        />
                        <SimpleItem
                            dataField="logisticsCenterId"
                            label={{ text: "Centro Logístico" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: logisticsCenters,
                                valueExpr: "id",
                                displayExpr: "name",
                                placeholder: "Seleccione un centro logístico...",
                                searchEnabled: true,
                                showClearButton: true,
                                stylingMode: 'filled',
                                dropDownOptions: {
                                    wrapperAttr: {
                                        class: 'popup-menu-container'
                                    }
                                }
                            }}
                        />
                        <SimpleItem
                            dataField="cashRegisterId"
                            visible={canUseCashRegisters}
                            label={{ text: "Caja Registradora" }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: cashRegisters,
                                valueExpr: "id",
                                displayExpr: "name",
                                placeholder: "Seleccione una caja...",
                                searchEnabled: true,
                                showClearButton: true,
                                stylingMode: 'filled',
                                dropDownOptions: {
                                    wrapperAttr: {
                                        class: 'popup-menu-container'
                                    }
                                }
                            }}
                        />
                        <SimpleItem
                            dataField="active"
                            label={{ text: "Estado" }}
                            editorType="dxCheckBox"
                            colSpan={2}
                            editorOptions={{
                                text: "Activo",
                                stylingMode: 'filled',
                            }}
                        />
                    </GroupItem>
                </Form>
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <GenericButton
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                    className="!bg-main/10"
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <GenericButton
                    text="Guardar"
                    type="default"
                    stylingMode="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="!bg-focus-300 !text-variant"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default BranchCreationModal;

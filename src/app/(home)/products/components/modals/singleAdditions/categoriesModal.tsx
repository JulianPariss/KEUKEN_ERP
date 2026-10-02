"use client";

import { accountsService } from "@/app/services/accountant/accounts.service";
import { categoriesService } from "@/app/services/product_services/categories.service";
import { IFAccount } from "@repo/api-contracts/erp";
import { IFCategory } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";


interface CategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categories: IFCategory[];
    initialData?: any;
    onHidden?: () => void;
}

const emptyCategoryData = {
    code: "",
    name: "",
    parentId: null,
    companyId: "",
    expenseAccountId: null,
    incomeAccountId: null,
};

const CategoriesModal = ({ isOpen, onClose, onSuccess, categories, initialData, onHidden }: CategoriesModalProps) => {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<any>(null);
    const [accounts, setAccounts] = useState<IFAccount[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchAccounts = async () => {
            if (!token || !currentCompany?.id) return;
            try {
                const res = await accountsService.getAll(token, currentCompany.id);
                if (mounted) {
                    setAccounts(res.items);
                }
            } catch (error) {
                console.error("Error fetching accounts:", error);
            }
        };

        if (isOpen) {
            fetchAccounts();
        }

        return () => { mounted = false; };
    }, [isOpen, token, currentCompany?.id]);

    const activeAccounts = useMemo(() => {
        return accounts.filter(acc => acc.status === 'active');
    }, [accounts]);

    const [formData, setFormData] = useState<{
        code: string;
        name: string;
        parentId: string | null;
        companyId: string;
        expenseAccountId: string | null;
        incomeAccountId: string | null;
    }>({
        ...emptyCategoryData,
        companyId: currentCompany?.id ?? "",
    });

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    code: initialData.code || "",
                    name: initialData.name || "",
                    parentId: initialData.parentId || null,
                    companyId: initialData.companyId ?? currentCompany?.id ?? "",
                    expenseAccountId: initialData.expenseAccountId || (initialData as any).expense_account_id || (initialData as any).accountDebitId || null,
                    incomeAccountId: initialData.incomeAccountId || (initialData as any).income_account_id || (initialData as any).accountCreditId || null,
                }
                : {
                    ...emptyCategoryData,
                    companyId: currentCompany?.id ?? "",
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
    }, [isOpen, currentCompany?.id, initialData]);

    const handleHidden = useCallback(() => {
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        const formInstance = formRef.current?.instance();
        const result = formInstance?.validate();
        if (!result?.isValid) return;

        const currentFormData = formInstance?.option("formData") || formData;

        setLoading(true);
        try {
            const normalizedData = {
                ...currentFormData,
                companyId: currentFormData.companyId || currentCompany?.id || "",
                expenseAccountId: typeof currentFormData.expenseAccountId === 'string' && currentFormData.expenseAccountId.trim() === "" ? null : currentFormData.expenseAccountId,
                incomeAccountId: typeof currentFormData.incomeAccountId === 'string' && currentFormData.incomeAccountId.trim() === "" ? null : currentFormData.incomeAccountId,
            };

            if (initialData?.id) {
                await categoriesService.update(normalizedData, initialData.id, token);
                notify("Categoría actualizada exitosamente", "success", 3000);
            } else {
                await categoriesService.create(normalizedData, token);
                notify("Categoría creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving category:", error);
            notify(error?.message || "Error al guardar la categoría", "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, initialData?.id, currentCompany?.id, token, onClose, onSuccess]);

    const parentCategoriesOptions = useMemo(() => {
        return categories.filter(c => c.id !== initialData?.id);
    }, [categories, initialData?.id]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}
        >
            <GroupItem colCount={2} colSpan={2}>
                <SimpleItem
                    colSpan={1}
                    dataField="code"
                    label={{ text: "Código" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: HERRAMIENTAS",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        disabled: !!initialData,
                        maxLength: FIELD_LIMITS.stringShort,
                    }}
                    validationRules={[
                        { type: 'required', message: "El código es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringShort, message: `El código no puede superar los ${FIELD_LIMITS.stringShort} caracteres` },
                    ]}
                />
                <SimpleItem
                    colSpan={1}
                    dataField="name"
                    label={{ text: "Nombre de la Categoría" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Herramientas, Electrónica",
                        valueChangeEvent: "blur",
                        stylingMode: 'filled',
                        maxLength: FIELD_LIMITS.stringLong,
                    }}
                    validationRules={[
                        { type: 'required', message: "El nombre es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre no puede superar los ${FIELD_LIMITS.stringLong} caracteres` },
                    ]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="parentId"
                    label={{ text: "Categoría Padre" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: parentCategoriesOptions,
                        valueExpr: "id",
                        displayExpr: "name",
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                />
            </GroupItem>
            <SimpleItem
                dataField="companyId"
                label={{ text: "Compañía" }}
                editorType="dxSelectBox"
                visible={false}
                editorOptions={{
                    dataSource: [currentCompany],
                    valueExpr: "id",
                    displayExpr: "name",
                    readOnly: true,
                    stylingMode: 'filled',
                }}
                validationRules={[{ type: 'required', message: "La compañía es obligatoria" }]}
            />

            <GroupItem colCount={2} colSpan={2}>
                <SimpleItem
                    colSpan={1}
                    dataField="expenseAccountId"
                    label={{ text: "Cuenta Debe" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: activeAccounts,
                        valueExpr: "id",
                        displayExpr: (item: any) => item ? `${item.name} (${item.code})` : '',
                        searchExpr: ['name', 'code'],
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                />

                <SimpleItem
                    colSpan={1}
                    dataField="incomeAccountId"
                    label={{ text: "Cuenta Haber" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: activeAccounts,
                        valueExpr: "id",
                        displayExpr: (item: any) => item ? `${item.name} (${item.code})` : '',
                        searchExpr: ['name', 'code'],
                        searchEnabled: true,
                        showClearButton: true,
                        stylingMode: 'filled',
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                />
            </GroupItem>
        </Form>
    ), [formData, parentCategoriesOptions, currentCompany, activeAccounts, initialData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Categoría" : "Nueva Categoría"}
            width={550}
            height={450}
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                {formContent}
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                    stylingMode="text"
                    className="!rounded-dx !bg-main/10"
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    type="default"
                    stylingMode="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="!bg-focus-300 !rounded-dx shadow-lg shadow-black/20 !text-variant"
                    text="Guardar"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default CategoriesModal;

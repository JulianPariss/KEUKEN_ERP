"use client";

import { useAuth } from "@/contexts/AuthContext";
import { logisticProfileService } from "@repo/erp-services/product_services/logisticProfile.service";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import notify from "devextreme/ui/notify";
import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { IFLogisticProfile } from "@repo/api-contracts/erp";
import { operativeProfileService } from "@repo/erp-services/product_services/operativeProfile.service";
import { segregationGroupsService } from "@repo/erp-services/product_services/segregationGroups.service";
import { temperatureService } from "@repo/erp-services/product_services/temperature.service";
import { IFOperativeProfile } from "@repo/api-contracts/erp";
import { IFSegregationGroup } from "@repo/api-contracts/erp";
import { IFTemperatureClass } from "@repo/api-contracts/erp";

interface LogisticProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const emptyLogisticProfileData = {
    code: "",
    name: "",
    description: "",
    consolidatePickOnRoute: false,
    defaultSegregationGroupId: "",
    defaultTemperatureClassId: "",
    operationalProfileId: "",
    requiresSegregatedPicking: false,
    requiresSegregatedTransport: false,
};

const LogisticProfileInnerForm = forwardRef(({ initialData, isOpen, token, currentCompany }: { initialData?: any, isOpen: boolean, token: string | null, currentCompany: any }, ref) => {
    const formRef = useRef<any>(null);

    const [operationalProfiles, setOperationalProfiles] = useState<IFOperativeProfile[]>([]);
    const [segregationGroups, setSegregationGroups] = useState<IFSegregationGroup[]>([]);
    const [temperatureClasses, setTemperatureClasses] = useState<IFTemperatureClass[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            if (!currentCompany?.id || !token) return;
            try {
                const [opProfiles, segGroups, tempClasses] = await Promise.all([
                    operativeProfileService.getAll(currentCompany.id, token),
                    segregationGroupsService.getAll(currentCompany.id, token),
                    temperatureService.getAll(currentCompany.id, token),
                ]);
                setOperationalProfiles(opProfiles);
                setSegregationGroups(segGroups);
                setTemperatureClasses(tempClasses);
            } catch (error: any) {
                console.error("Error fetching options:", error);
                const errorMessage = error instanceof Error && error.message
                    ? error.message
                    : "Error al cargar las opciones de listado";
                notify(errorMessage, "error", 3000);
            }
        };
        fetchOptions();
    }, [currentCompany?.id, token]);

    const [formData, setFormData] = useState(emptyLogisticProfileData);

    useEffect(() => {
        if (isOpen) {
            const nextData = {
                code: initialData?.code || "",
                name: initialData?.name || "",
                description: initialData?.description || "",
                consolidatePickOnRoute: initialData?.consolidatePickOnRoute ?? false,
                defaultSegregationGroupId: initialData?.defaultSegregationGroupId || "",
                defaultTemperatureClassId: initialData?.defaultTemperatureClassId || "",
                operationalProfileId: initialData?.operationalProfileId || "",
                requiresSegregatedPicking: initialData?.requiresSegregatedPicking ?? false,
                requiresSegregatedTransport: initialData?.requiresSegregatedTransport ?? false,
            };
            setFormData(nextData);
            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                }
            }, 0);
        } else {
            setFormData({ ...emptyLogisticProfileData });
        }
    }, [isOpen, initialData]);

    useImperativeHandle(ref, () => ({
        validate: () => formRef.current?.instance().validate(),
        getData: () => formRef.current?.instance().option("formData") || formData
    }));

    return (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
            colCount={2}
        >
            <GroupItem colCount={2} colSpan={2}>
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: REFRIG_PHARMA_2_8",
                        stylingMode: 'filled',
                        disabled: !!initialData
                    }}
                    validationRules={[{ type: 'required', message: "El código es obligatorio" }]}
                />
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Refrigerado pharma 2-8°C",
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "El nombre es obligatorio" }]}
                />
            </GroupItem>

            <GroupItem colSpan={2}>
                <SimpleItem
                    dataField="description"
                    label={{ text: "Descripción" }}
                    editorType="dxTextArea"
                    editorOptions={{
                        placeholder: "Ej: Cadena de frío pharma...",
                        height: 70,
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "La descripción es obligatoria" }]}
                />
            </GroupItem>

            <GroupItem caption="Asignaciones" colCount={2} colSpan={2}>
                <SimpleItem
                    dataField="operationalProfileId"
                    label={{ text: "Perfil Operacional" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: operationalProfiles,
                        valueExpr: "id",
                        displayExpr: "name",
                        placeholder: "Seleccione un perfil...",
                        searchEnabled: true,
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "Requerido" }]}
                />
                <SimpleItem
                    dataField="defaultSegregationGroupId"
                    label={{ text: "Grupo de Segregación por Defecto" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: segregationGroups,
                        valueExpr: "id",
                        displayExpr: "name",
                        placeholder: "Seleccione un grupo...",
                        searchEnabled: true,
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "Requerido" }]}
                />
                <SimpleItem
                    dataField="defaultTemperatureClassId"
                    label={{ text: "Clase de Temperatura por Defecto" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        dataSource: temperatureClasses,
                        valueExpr: "id",
                        displayExpr: "name",
                        placeholder: "Seleccione clase de temperatura...",
                        searchEnabled: true,
                        stylingMode: 'filled',
                    }}
                    validationRules={[{ type: 'required', message: "Requerido" }]}
                />
            </GroupItem>

            <GroupItem caption="Configuraciones Adicionales" colCount={2} colSpan={2}>
                <SimpleItem
                    dataField="requiresSegregatedPicking"
                    label={{ text: "Picking Segregado" }}
                    editorType="dxCheckBox"
                />
                <SimpleItem
                    dataField="requiresSegregatedTransport"
                    label={{ text: "Transporte Segregado" }}
                    editorType="dxCheckBox"
                />
                <SimpleItem
                    dataField="consolidatePickOnRoute"
                    label={{ text: "Consolidar Pick en Ruta" }}
                    editorType="dxCheckBox"
                />
            </GroupItem>
        </Form>
    );
});
LogisticProfileInnerForm.displayName = 'LogisticProfileInnerForm';


const LogisticProfileModal = ({ isOpen, onClose, onHidden, onSuccess, initialData }: LogisticProfileModalProps) => {
    const { token, currentCompany } = useAuth();
    const [loading, setLoading] = useState(false);
    const innerFormRef = useRef<any>(null);

    const handleHidden = useCallback(() => {
        setLoading(false);
        if (onHidden) {
            onHidden();
        }
    }, [onHidden]);

    const handleSubmit = useCallback(async () => {
        const innerForm = innerFormRef.current;
        if (!innerForm) return;

        const result = innerForm.validate();
        if (!result?.isValid) return;

        if (!currentCompany?.id || !token) {
            notify("Error de autenticación", "error", 3000);
            return;
        }

        setLoading(true);
        try {
            const formData = innerForm.getData();
            const normalizedData: Partial<IFLogisticProfile> = {
                ...initialData,
                code: formData.code,
                name: formData.name,
                description: formData.description,
                consolidatePickOnRoute: formData.consolidatePickOnRoute,
                defaultSegregationGroupId: formData.defaultSegregationGroupId,
                defaultTemperatureClassId: formData.defaultTemperatureClassId,
                operationalProfileId: formData.operationalProfileId,
                requiresSegregatedPicking: formData.requiresSegregatedPicking,
                requiresSegregatedTransport: formData.requiresSegregatedTransport,
            };

            if (initialData?.id) {
                await logisticProfileService.update(currentCompany.id, initialData.id, normalizedData, token);
                notify("Perfil logístico actualizado exitosamente", "success", 3000);
            } else {
                await logisticProfileService.create(currentCompany.id, normalizedData, token);
                notify("Perfil logístico creado exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving logistic profile:", error);
            const errorMessage = error instanceof Error && error.message
                ? error.message
                : "Error al guardar el perfil logístico";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [initialData, currentCompany, token, onClose, onSuccess]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Perfil Logístico" : "Nuevo Perfil Logístico"}
            width={700}
            height={550}
            className="custom-popup"
            deferRendering={false}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4">
                <LogisticProfileInnerForm
                    ref={innerFormRef}
                    initialData={initialData}
                    isOpen={isOpen}
                    token={token}
                    currentCompany={currentCompany}
                />
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
                />
            </ToolbarItem>
            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Guardar"
                    type="default"
                    stylingMode="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                />
            </ToolbarItem>
        </Popup>
    );
};

export default LogisticProfileModal;

"use client";

import { zonesService } from "@repo/erp-services/zones.service";
import { IFZoneCreate, IFZoneUpdate, TFZoneType } from "@repo/api-contracts/erp";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@repo/devextreme';
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import Popup, { Position, ToolbarItem } from "devextreme-react/popup";
import TextBox from "devextreme-react/text-box";
import TagBox from "devextreme-react/tag-box";
import TextArea from "devextreme-react/text-area";
import notify from "devextreme/ui/notify";
import { deliveryZones } from "@/app/lib/utils/prittier";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FIELD_LIMITS } from "@/app/lib/constants/common.constants";
import { GeozoneInput, type LatLngTuple } from "@repo/map-core";
import "@repo/map-core/styles.css";

interface ZonesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHidden?: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const emptyZoneData = {
    code: "",
    name: "",
    parentId: "",
    zoneType: [] as string[],
};

function normalizePolygons(raw: any): LatLngTuple[][] {
    if (!raw) return [];
    if (typeof raw === "string") {
        try {
            raw = JSON.parse(raw);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(raw) || raw.length === 0) return [];

    return raw
        .map((poly: any) => {
            if (!Array.isArray(poly)) return [];
            return poly
                .map((point: any) => {
                    if (Array.isArray(point) && point.length >= 2) {
                        return [Number(point[0]), Number(point[1])] as LatLngTuple;
                    }
                    if (point && typeof point === "object") {
                        const lat = point.lat ?? point.latitude;
                        const lng = point.lng ?? point.lon ?? point.longitude;
                        if (lat !== undefined && lng !== undefined) {
                            return [Number(lat), Number(lng)] as LatLngTuple;
                        }
                    }
                    return null;
                })
                .filter((p): p is LatLngTuple => p !== null && !isNaN(p[0]) && !isNaN(p[1]));
        })
        .filter((poly) => poly.length >= 3);
}

const ZoneCreationModal = ({ isOpen, onClose, onHidden, onSuccess, initialData }: ZonesModalProps) => {
    const [loading, setLoading] = useState(false);
    const [polygons, setPolygons] = useState<LatLngTuple[][]>([]);
    const formRef = useRef<any>(null);
    const { token, currentCompany } = useAuth();

    const [formData, setFormData] = useState(emptyZoneData);

    useEffect(() => {
        if (isOpen) {
            const nextData = initialData
                ? {
                    code: initialData.code || "",
                    name: initialData.name || "",
                    parentId: initialData.parentId || "",
                    zoneType: Array.isArray(initialData.zoneType) ? initialData.zoneType : [],
                }
                : { ...emptyZoneData };

            setFormData(nextData);
            setPolygons(normalizePolygons(initialData?.polygons));

            setTimeout(() => {
                const formInstance = formRef.current?.instance();
                if (formInstance) {
                    formInstance.option("formData", nextData);
                }
            }, 0);
        }
    }, [isOpen, initialData]);

    const handleHidden = useCallback(() => {
        setFormData({ ...emptyZoneData });
        setPolygons([]);
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
        const zoneTypes = currentFormData.zoneType || [];

        setLoading(true);
        try {
            if (initialData?.id) {
                const updatePayload: IFZoneUpdate = {
                    code: currentFormData.code,
                    name: currentFormData.name,
                    parentId: currentFormData.parentId || null,
                    zoneType: zoneTypes,
                    polygons,
                };
                await zonesService.update(initialData.id, updatePayload, token, currentCompany?.id);
                notify("Zona actualizada exitosamente", "success", 3000);
            } else {
                const createPayload: IFZoneCreate = {
                    code: currentFormData.code,
                    name: currentFormData.name,
                    parentId: currentFormData.parentId || null,
                    zoneType: zoneTypes,
                    polygons,
                };
                await zonesService.create(createPayload, token, currentCompany?.id);
                notify("Zona creada exitosamente", "success", 3000);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving zone:", error);
            const errorMessage = error instanceof Error && error.message ? error.message : "Error al guardar la zona";
            notify(errorMessage, "error", 3000);
        } finally {
            setLoading(false);
        }
    }, [formData, polygons, initialData?.id, token, currentCompany?.id, onClose, onSuccess]);

    const formContent = useMemo(() => (
        <Form
            ref={formRef}
            formData={formData}
            labelLocation="top"
        >
            <GroupItem colCount={2}>
                <SimpleItem
                    dataField="code"
                    label={{ text: "Código Zona" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: ZONE-NORTH",
                        stylingMode: "filled",
                        maxLength: FIELD_LIMITS.stringTeeny,
                    }}
                    validationRules={[
                        { type: 'required', message: "El código es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringTeeny, message: `El código debe tener como máximo ${FIELD_LIMITS.stringTeeny} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="name"
                    label={{ text: "Nombre" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "Ej: Zona Norte GBA",
                        stylingMode: "filled",
                        maxLength: FIELD_LIMITS.stringLong,
                    }}
                    validationRules={[
                        { type: 'required', message: "El nombre es obligatorio" },
                        { type: 'stringLength', max: FIELD_LIMITS.stringLong, message: `El nombre debe tener como máximo ${FIELD_LIMITS.stringLong} caracteres` }
                    ]}
                />
                <SimpleItem
                    dataField="parentId"
                    label={{ text: "Zona Padre (ID)" }}
                    editorType="dxTextBox"
                    editorOptions={{
                        placeholder: "ID de zona superior (opcional)",
                        stylingMode: "filled",
                    }}
                />
                <SimpleItem
                    dataField="zoneType"
                    label={{ text: "Tipos de Zona" }}
                    editorType="dxTagBox"
                    editorOptions={{
                        dataSource: Object.keys(deliveryZones),
                        displayExpr: (value: any) => deliveryZones[value as TFZoneType] || value,
                        placeholder: "Seleccione tipos de zona...",
                        showSelectionControls: true,
                        stylingMode: "filled",
                        dropDownOptions: {
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }
                    }}
                />
            </GroupItem>
        </Form>
    ), [formData]);

    return (
        <Popup
            visible={isOpen}
            onHiding={onClose}
            onHidden={handleHidden}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title={initialData ? "Editar Zona" : "Nueva Zona"}
            width={780}
            height={680}
            onShown={(e) => {
                e.component.repaint();
            }}
        >
            <Position at="center" my="center" />
            <div className="p-4 space-y-3">
                {formContent}

                <div className="w-full space-y-1">
                    <label className="text-xs font-semibold text-main/80 block">
                        Geozonas (Delimitación en mapa)
                    </label>
                    <GeozoneInput
                        value={polygons}
                        onChange={setPolygons}
                        height={380}
                        rules={{
                            minPointsPerGeozone: 3,
                            allowIntersection: false,
                        }}
                    />
                </div>
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
            {false && (
                <>
                    <TextBox />
                    <TagBox />
                    <TextArea />
                </>
            )}
        </Popup>
    );
};

export default ZoneCreationModal;

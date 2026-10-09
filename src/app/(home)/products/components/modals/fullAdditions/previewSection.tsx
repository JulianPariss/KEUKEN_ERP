import { IFBrand } from "@repo/api-contracts/erp";
import { IFCategory } from "@repo/api-contracts/erp";
import { IFUOM } from "@repo/api-contracts/erp";
import { Accordion } from "devextreme-react/accordion";
import Form, { GroupItem, SimpleItem } from "devextreme-react/form";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { currenciesService } from "@/app/services/payments_services/currencies.service";
import { logisticProfileService } from "@/app/services/product_services/logisticProfile.service";
import { temperatureService } from "@/app/services/product_services/temperature.service";
import { hazardService } from "@/app/services/product_services/hazard.service";
import { segregationGroupsService } from "@/app/services/product_services/segregationGroups.service";
import { providerService } from "@/app/services/location_services/provider.service";
import { commercialPlatformsService } from "@/app/services/partners/commercialPlatforms.service";
import { IFCurrency, IFLogisticProfile, IFTemperatureClass, IFHazardClass, IFSegregationGroup, IFProvider, IFCommercialPlatform } from "@repo/api-contracts/erp";

interface IPreviewSectionProps {
    productData: any;
    itemsData: any[];
    uoms: IFUOM[];
    categories: IFCategory[];
    brands: IFBrand[];
    classifications: any[];
    saleBillingModes: any[];
    packagingLevels: any[];
}

const PreviewSection = ({ productData, itemsData, uoms, categories, brands, classifications, saleBillingModes, packagingLevels }: IPreviewSectionProps) => {

    const { token, currentCompany } = useAuth();
    const [currencies, setCurrencies] = useState<IFCurrency[]>([]);
    const [logisticsProfiles, setLogisticsProfiles] = useState<IFLogisticProfile[]>([]);
    const [temperatureClasses, setTemperatureClasses] = useState<IFTemperatureClass[]>([]);
    const [hazardClasses, setHazardClasses] = useState<IFHazardClass[]>([]);
    const [segregationGroups, setSegregationGroups] = useState<IFSegregationGroup[]>([]);
    const [suppliers, setSuppliers] = useState<IFProvider[]>([]);
    const [platforms, setPlatforms] = useState<IFCommercialPlatform[]>([]);

    useEffect(() => {
        if (!token || !currentCompany?.id) return;
        currenciesService.getAll(token).then(res => setCurrencies(res.items)).catch(console.error);
        logisticProfileService.getAll(currentCompany.id, token).then(setLogisticsProfiles).catch(console.error);
        temperatureService.getAll(currentCompany.id, token).then(setTemperatureClasses).catch(console.error);
        hazardService.getAll(currentCompany.id, token).then(setHazardClasses).catch(console.error);
        segregationGroupsService.getAll(currentCompany.id, token).then(setSegregationGroups).catch(console.error);
        providerService.getAll(token, currentCompany.id).then(res => setSuppliers(res.items)).catch(console.error);
        commercialPlatformsService.getAll({ companyId: currentCompany.id, limit: 500, offset: 0 }, token).then(res => setPlatforms(res.items)).catch(console.error);
    }, [token, currentCompany?.id]);

    const getCurrencyName = (id: string) => currencies.find(c => c.id === id)?.name || id;
    const getLogisticName = (id: string) => logisticsProfiles.find(l => l.id === id)?.name || id;
    const getTempName = (id: string) => temperatureClasses.find(t => t.id === id)?.name || id;
    const getHazardName = (id: string) => hazardClasses.find(h => h.id === id)?.name || id;
    const getSegregationName = (id: string) => segregationGroups.find(s => s.id === id)?.name || id;
    const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || id;
    const getPlatformName = (id: string) => platforms.find(p => p.id === id)?.name || id;

    const getUomName = (id: string) => uoms.find(u => u.id === id)?.name || id;
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
    const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;
    const getClassificationName = (code: string) => classifications.find(c => c.code === code)?.name || code;
    const getSaleBillingModeName = (code: string) => saleBillingModes?.find(m => m.code === code)?.name || code || "No seleccionado";

    const selectedMode = saleBillingModes?.find((m: any) => m.code === productData.saleBillingModeCode);

    const renderItemTitle = (item: any) => {
        return (
            <div className="flex justify-between items-center w-full pr-8">
                <span className="font-semibold text-dx-primary">{item.itemName}</span>
                <span className="bg-focus-300/10 text-focus-300 px-2 py-0.5 rounded text-xs">{item.sku}</span>
            </div>
        );
    };

    const renderItemContent = (item: any) => {
        const requiresSecondaryUom = selectedMode ? (selectedMode.requiresSecondaryUom || selectedMode.isDualUom) : false;

        return (
            <div className="p-4 bg-primary-0/20 flex flex-col gap-4">
                <Form
                    formData={{
                        itemName: item.itemName,
                        sku: item.sku,
                        costMethod: item.costMethod === 'average' ? 'Promedio' : item.costMethod === 'fifo' ? 'FIFO' : 'Estándar',
                        weight: item.weight,
                        volume: item.volume,
                        palletUnits: item.palletUnits,
                        palletUomId: getUomName(item.palletUomId),
                        uomRatio: item.uomRatio,
                        logisticsProfileId: getLogisticName(item.logisticsProfileId),
                        temperatureClassId: getTempName(item.temperatureClassId),
                        hazardClassId: getHazardName(item.hazardClassId),
                        segregationGroupId: getSegregationName(item.segregationGroupId),
                        suppliers: item.supplierIds?.map(getSupplierName).join(", ") || "—",
                        platforms: item.platformIds?.map(getPlatformName).join(", ") || "—"
                    }}
                    readOnly={true}
                    labelLocation="top"
                    scrollingEnabled={false}
                    colCount={4}
                >
                    <GroupItem colSpan={4} colCount={4} cssClass="!p-0">
                        <SimpleItem
                            dataField="itemName"
                            label={{ text: "Nombre de Item" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                stylingMode: 'filled'
                            }}
                        />

                        <SimpleItem
                            dataField="sku"
                            label={{ text: "SKU" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                stylingMode: 'filled'
                            }}
                        />

                        <SimpleItem
                            dataField="costMethod"
                            label={{ text: "Método de Costo" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                stylingMode: 'filled'
                            }}
                        />

                        <SimpleItem
                            dataField="weight"
                            label={{ text: "Peso" }}
                            editorType="dxNumberBox"
                            editorOptions={{
                                stylingMode: 'filled'
                            }}
                        />

                        <SimpleItem
                            dataField="volume"
                            label={{ text: "Volumen" }}
                            editorType="dxNumberBox"
                            editorOptions={{
                                stylingMode: 'filled'
                            }}
                        />

                        <SimpleItem
                            dataField="palletUnits"
                            label={{ text: "Unidades por Pallet" }}
                            editorType="dxNumberBox"
                            editorOptions={{
                                stylingMode: 'filled'
                            }}
                        />

                        <SimpleItem
                            dataField="palletUomId"
                            label={{ text: "U. Medida Pallet" }}
                            editorType="dxTextBox"
                            editorOptions={{
                                stylingMode: 'filled'
                            }}
                        />

                        <SimpleItem
                            dataField="uomRatio"
                            label={{ text: "Ratio de Unidad" }}
                            editorType="dxNumberBox"
                            visible={requiresSecondaryUom}
                            editorOptions={{
                                stylingMode: 'filled'
                            }}
                        />

                        <SimpleItem
                            dataField="logisticsProfileId"
                            label={{ text: "Perfil Logístico" }}
                            editorType="dxTextBox"
                            editorOptions={{ stylingMode: 'filled' }}
                        />

                        <SimpleItem
                            dataField="temperatureClassId"
                            label={{ text: "Clase Temperatura" }}
                            editorType="dxTextBox"
                            editorOptions={{ stylingMode: 'filled' }}
                        />

                        <SimpleItem
                            dataField="hazardClassId"
                            label={{ text: "Clase Peligro" }}
                            editorType="dxTextBox"
                            editorOptions={{ stylingMode: 'filled' }}
                        />

                        <SimpleItem
                            dataField="segregationGroupId"
                            label={{ text: "Grupo Segregación" }}
                            editorType="dxTextBox"
                            editorOptions={{ stylingMode: 'filled' }}
                        />

                        <SimpleItem
                            colSpan={2}
                            dataField="suppliers"
                            label={{ text: "Proveedores" }}
                            editorType="dxTextBox"
                            editorOptions={{ stylingMode: 'filled' }}
                        />

                        <SimpleItem
                            colSpan={2}
                            dataField="platforms"
                            label={{ text: "Plataformas" }}
                            editorType="dxTextBox"
                            editorOptions={{ stylingMode: 'filled' }}
                        />
                    </GroupItem>
                </Form>

                {item.presentations && item.presentations.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-dx-primary border-b border-main/10 pb-1">Presentaciones</h4>
                        <div className="overflow-x-auto border border-main/10 rounded-dx overflow-hidden shadow-none">
                            <table className="w-full text-left border-collapse rounded-none">
                                <thead>
                                    <tr className="bg-main/5 border-b border-main/10">
                                        <th className="p-2 text-xs font-bold text-dx-primary uppercase tracking-wider">Nombre</th>
                                        <th className="p-2 text-xs font-bold text-dx-primary uppercase tracking-wider">Código de Barras</th>
                                        <th className="p-2 text-xs font-bold text-dx-primary uppercase tracking-wider">UoM</th>
                                        <th className="p-2 text-xs font-bold text-dx-primary uppercase tracking-wider">Nivel Empaque</th>
                                        <th className="p-2 text-xs font-bold text-dx-primary uppercase tracking-wider text-right">Ratio</th>
                                        <th className="p-2 text-xs font-bold text-dx-primary uppercase tracking-wider text-center">Principal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {item.presentations.map((pres: any, idx: number) => (
                                        <tr
                                            key={idx}
                                            className={`${idx % 2 === 0 ? 'bg-primary-0/10' : 'bg-primary-0/20'} border-b border-main/5 last:border-0 hover:bg-focus-300/10 transition-colors duration-100`}
                                        >
                                            <td className="p-2 text-xs font-medium text-main">{pres.name}</td>
                                            <td className="p-2 text-xs font-mono text-main/80">{pres.barcode || "—"}</td>
                                            <td className="p-2 text-xs text-main">{getUomName(pres.uomId)}</td>
                                            <td className="p-2 text-xs text-main">{packagingLevels?.find(pl => pl.id === pres.packagingLevelId)?.name || pres.packagingLevelId || "—"}</td>
                                            <td className="p-2 text-xs text-main text-right font-semibold">{pres.uomRatio ?? "—"}</td>
                                            <td className="p-2 text-xs text-main text-center">
                                                {pres.isPrimary ? <i className="dx-icon-check text-green-500" /> : <i className="dx-icon-close text-red-500" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="mt-2 p-2 bg-main/5 rounded text-sm text-main/60">
                        No hay presentaciones para este ítem.
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <Form
                formData={{
                    name: productData.name,
                    classification: getClassificationName(productData.classification),
                    prefix: productData.prefix,
                    uomId: getUomName(productData.uomId),
                    categoryId: getCategoryName(productData.categoryId),
                    brandId: getBrandName(productData.brandId),
                    procurementType: productData.procurementType === "BUY" ? "Comprar" : productData.procurementType === "MANUFACTURE" ? "Fabricar" : productData.procurementType === "BOTH" ? "Ambos" : "Comprar",
                    saleBillingModeCode: getSaleBillingModeName(productData.saleBillingModeCode),
                    defaultSecUomId: productData.defaultSecUomId ? getUomName(productData.defaultSecUomId) : "Ninguna",
                    currencyId: productData.currencyId ? getCurrencyName(productData.currencyId) : "—",
                    defaultLogisticsProfileId: productData.defaultLogisticsProfileId ? getLogisticName(productData.defaultLogisticsProfileId) : "—",
                    defaultTemperatureClassId: productData.defaultTemperatureClassId ? getTempName(productData.defaultTemperatureClassId) : "—",
                    defaultHazardClassId: productData.defaultHazardClassId ? getHazardName(productData.defaultHazardClassId) : "—",
                    defaultSegregationGroupId: productData.defaultSegregationGroupId ? getSegregationName(productData.defaultSegregationGroupId) : "—",
                    handlingNotes: productData.handlingNotes || ""
                }}
                readOnly={true}
                colCount={2}
                scrollingEnabled={false}
            >
                {/* Card 1: Información del Producto */}
                <GroupItem
                    colSpan={2}
                    colCount={2}
                    cssClass="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mb-6"
                >
                    <SimpleItem
                        colSpan={2}
                        cssClass="!p-0"
                        label={{ visible: false }}
                    >
                        <div className="mb-6 border-b border-main/10 pb-4">
                            <h3 className="text-lg font-bold text-dx-primary mb-1">Información del Producto</h3>
                            <p className="text-xs opacity-60">Resumen de los datos generales del nuevo producto terminado.</p>
                        </div>
                    </SimpleItem>

                    <SimpleItem
                        dataField="name"
                        label={{ text: "Nombre del Producto" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    <SimpleItem
                        dataField="classification"
                        label={{ text: "Clasificación" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    <SimpleItem
                        dataField="prefix"
                        label={{ text: "Prefijo SKU" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    <SimpleItem
                        dataField="categoryId"
                        label={{ text: "Categoría" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    <SimpleItem
                        dataField="brandId"
                        label={{ text: "Marca" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    <SimpleItem
                        dataField="procurementType"
                        label={{ text: "Abastecimiento" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />
                </GroupItem>

                {/* Card 2: Modo de Operación */}
                <GroupItem
                    colSpan={2}
                    colCount={2}
                    cssClass="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mb-6"
                >
                    <SimpleItem
                        colSpan={2}
                        cssClass="!p-0"
                        label={{ visible: false }}
                    >
                        <div className="mb-6 border-b border-main/10 pb-4">
                            <h3 className="text-lg font-bold text-dx-primary mb-1">Modo de Operación</h3>
                            <p className="text-xs opacity-60">Resumen de facturación y unidades duales.</p>
                        </div>
                    </SimpleItem>

                    <SimpleItem
                        dataField="saleBillingModeCode"
                        label={{ text: "Modo de Venta" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    <SimpleItem
                        dataField="currencyId"
                        label={{ text: "Moneda Base" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    <SimpleItem
                        dataField="uomId"
                        label={{ text: "Unidad de Medida" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    <SimpleItem
                        dataField="defaultSecUomId"
                        label={{ text: "Unidad de medida Secundaria" }}
                        editorType="dxTextBox"
                        editorOptions={{
                            stylingMode: "filled"
                        }}
                    />

                    {selectedMode?.description && (
                        <SimpleItem
                            colSpan={2}
                            label={{ visible: false }}
                        >
                            <div className="mt-4 p-3 rounded-dx bg-main/5 border border-main/10">
                                <p className="text-xs font-semibold text-dx-primary mb-1">Descripción del modo seleccionado:</p>
                                <p className="text-xs text-main/70 leading-relaxed">
                                    {selectedMode.description}
                                </p>
                            </div>
                        </SimpleItem>
                    )}
                </GroupItem>

                {/* Card 3: Manejo de Artículos */}
                <GroupItem
                    colSpan={2}
                    colCount={2}
                    cssClass="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm !mb-6"
                >
                    <SimpleItem
                        colSpan={2}
                        cssClass="!p-0"
                        label={{ visible: false }}
                    >
                        <div className="mb-6 border-b border-main/10 pb-4">
                            <h3 className="text-lg font-bold text-dx-primary mb-1">Manejo de Artículos</h3>
                            <p className="text-xs opacity-60">Configuración por defecto para el producto.</p>
                        </div>
                    </SimpleItem>

                    <SimpleItem
                        dataField="defaultLogisticsProfileId"
                        label={{ text: "Perfil Logístico" }}
                        editorType="dxTextBox"
                        editorOptions={{ stylingMode: "filled" }}
                    />

                    <SimpleItem
                        dataField="defaultTemperatureClassId"
                        label={{ text: "Clase Temperatura" }}
                        editorType="dxTextBox"
                        editorOptions={{ stylingMode: "filled" }}
                    />

                    <SimpleItem
                        dataField="defaultHazardClassId"
                        label={{ text: "Clase Peligro" }}
                        editorType="dxTextBox"
                        editorOptions={{ stylingMode: "filled" }}
                    />

                    <SimpleItem
                        dataField="defaultSegregationGroupId"
                        label={{ text: "Grupo Segregación" }}
                        editorType="dxTextBox"
                        editorOptions={{ stylingMode: "filled" }}
                    />

                    <SimpleItem
                        colSpan={2}
                        dataField="handlingNotes"
                        label={{ text: "Notas de Manipulación" }}
                        editorType="dxTextArea"
                        editorOptions={{
                            height: 60,
                            stylingMode: "filled"
                        }}
                    />
                </GroupItem>

                {/* Card 4: Items a Crear */}
                <GroupItem
                    colSpan={2}
                    cssClass="!p-5 !rounded-dx !bg-primary-0/40 !border !border-focus-100/40 !shadow-sm"
                >
                    <SimpleItem
                        colSpan={2}
                        cssClass="!p-0"
                        label={{ visible: false }}
                    >
                        <div className="mb-6 border-b border-main/10 pb-4">
                            <h3 className="text-lg font-bold text-dx-primary mb-1">Ítems ({itemsData.length})</h3>
                            <p className="text-xs opacity-60">Resumen de los ítems y presentaciones que se darán de alta.</p>
                        </div>
                    </SimpleItem>

                    <SimpleItem
                        colSpan={2}
                        label={{ visible: false }}
                    >
                        <Accordion
                            dataSource={itemsData}
                            collapsible={true}
                            multiple={true}
                            itemTitleRender={renderItemTitle}
                            itemRender={renderItemContent}
                            className="custom-accordion custom-accordion-preview"
                        />
                    </SimpleItem>
                </GroupItem>
            </Form>
        </div>
    );
};

export default React.memo(PreviewSection);

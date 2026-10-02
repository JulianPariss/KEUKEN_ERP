'use client';

import { IFItem } from "@repo/api-contracts/erp";
import { NumberBox, Validator } from "devextreme-react";
import { SelectBox } from "@repo/devextreme";
import { RequiredRule } from "devextreme-react/validator";

interface InventoryItemProps {
    formData: {
        id: string;
        itemId: string;
        quantity: number;
    };
    updateFormData: (data: any) => void;
    onDelete?: () => void;
    items: IFItem[];
}

const InventoryItem = ({ formData, updateFormData, onDelete, items }: InventoryItemProps) => {
    return (
        <div className="p-6 rounded-dx border bg-primary-900/40 border-main/5 flex flex-col gap-6 relative group/item">
            {onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    className="absolute -right-2 -top-2 size-8 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-600 shadow-lg z-10 active:scale-95"
                >
                    <i className="dx-icon-trash text-xs "></i>
                </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <SelectBox
                        label="Producto/Item"
                        dataSource={items}
                        displayExpr="productName"
                        valueExpr="id"
                        value={formData.itemId}
                        onValueChanged={(e) => updateFormData({ itemId: e.value })}
                        searchEnabled={true}
                        stylingMode="filled"
                        placeholder="Seleccione un item..."
                        elementAttr={{ class: '!bg-main/5 !rounded-dx' }}
                        dropDownOptions={{
                            wrapperAttr: {
                                class: "popup-menu-container"
                            }
                        }}
                    >
                        <Validator>
                            <RequiredRule message="El item es obligatorio" />
                        </Validator>
                    </SelectBox>
                </div>

                <div className="col-span-1">
                    <NumberBox
                        label="Cantidad"
                        value={formData.quantity}
                        onValueChanged={(e) => updateFormData({ quantity: e.value })}
                        min={1}
                        stylingMode="filled"
                        elementAttr={{ class: '!bg-main/5 !rounded-dx' }}
                    >
                        <Validator>
                            <RequiredRule message="La cantidad es obligatoria" />
                        </Validator>
                    </NumberBox>
                </div>
            </div>

            <div className="h-0.5 w-full bg-main/5 rounded-full"></div>
        </div >
    );
};

export default InventoryItem;

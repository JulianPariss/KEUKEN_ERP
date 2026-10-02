'use client';

import { Button } from '@repo/devextreme';
import { Popup, Position, ToolbarItem } from "devextreme-react/popup";
import { TextBox } from "devextreme-react/text-box";
import { useState } from "react";

interface RoleCreationModalProps {
    visible: boolean;
    onHiding: () => void;
    onSave: (name: string) => void;
}

const RoleCreationModal = ({ visible, onHiding, onSave }: RoleCreationModalProps) => {
    const [roleName, setRoleName] = useState("");

    const handleCancel = () => {
        setRoleName("");
        onHiding();
    }

    const handleSave = () => {
        if (roleName.trim()) {
            onSave(roleName);
            setRoleName("");
            onHiding();
        }
    };

    return (
        <Popup
            visible={visible}
            onHiding={handleCancel}
            dragEnabled={false}
            hideOnOutsideClick={true}
            showCloseButton={true}
            showTitle={true}
            title="Nueva Clave"
            width={400}
            height="auto"
        >
            <Position at="center" my="center" />

            <div className="p-4">
                <TextBox
                    label="Nombre de la clave"
                    value={roleName}
                    valueChangeEvent="keyup"
                    onValueChanged={(e) => setRoleName(e.value)}
                    placeholder="Ej: Clave de API"
                    labelMode="outside"
                    stylingMode="filled"
                    elementAttr={{ class: "!bg-primary-900 !rounded-dx" }}
                />
            </div>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Cancelar"
                    onClick={onHiding}
                    stylingMode="text"
                />
            </ToolbarItem>

            <ToolbarItem
                toolbar="bottom"
                location="after"
            >
                <Button
                    text="Crear Clave"
                    type="default"
                    stylingMode="contained"
                    onClick={handleSave}
                    disabled={!roleName.trim()}
                    className="!bg-focus-300 !rounded-dx"
                />
            </ToolbarItem>
        </Popup>
    );
};

export default RoleCreationModal;

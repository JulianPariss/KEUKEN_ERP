import CreateAreaModal from "../components/locations/actions/createArea";
import LocationsMassiveCreation from "../components/locations/actions/massiveCreation";
import LocationsSimpleCreation from "../components/locations/actions/simpleCreation";

interface ILocationActionsProps {
    warehouseId: string;
    parentPath: string;
    parentId: string;
    onSuccess: () => void;
}

export const renderLocationActions = ({
    warehouseId,
    parentPath,
    parentId,
    onSuccess,
}: ILocationActionsProps) => {
    return {
        SimpleCreation: (
            <LocationsSimpleCreation
                warehouseId={warehouseId}
                parentPath={parentPath}
                parentId={parentId}
                onSuccess={onSuccess}
            />
        ),
        MassiveCreation: (
            <LocationsMassiveCreation
                warehouseId={warehouseId}
                parentPath={parentPath}
                onSuccess={onSuccess}
            />
        ),
        CreateArea: (
            <CreateAreaModal
                warehouseId={warehouseId}
                onSuccess={onSuccess}
            />
        ),
    };
};

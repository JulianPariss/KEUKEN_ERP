"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useRef, useState, useCallback } from "react";
import { GenericDataGrid, IGenericDataGridColumn } from '@repo/devextreme';
import CustomStore from "devextreme/data/custom_store";
import notify from "devextreme/ui/notify";
import { createGridStateStorage } from "@/lib/storage/gridStateStorage";
import { consignmentsService } from "@/app/services/consignments.service";
import { CONSIGNMENT_STATES } from "@/app/lib/constants/common.constants";
import ConsignmentModal from "./components/actions/consignmentModal";
import ConsignmentReturnModal from "./components/actions/consignmentReturnModal";

const { customLoad, customSave } = createGridStateStorage({
  gridId: "consignments-grid",
});

const ConsignmentsClient = () => {
  const { token, currentCompany } = useAuth();
  const gridRef = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleRefreshGrid = useCallback(() => {
    if (gridRef.current?.refresh) {
      gridRef.current.refresh();
    } else if (gridRef.current?.instance && typeof gridRef.current.instance === 'function') {
      gridRef.current.instance()?.refresh();
    }
  }, []);

  const dataSource = useMemo(() => {
    return new CustomStore({
      key: "id",
      load: async (loadOptions: any) => {
        try {
          const params = {
            limit: loadOptions.take || 20,
            offset: loadOptions.skip || 0,
          };
          const response = await consignmentsService.getAll(params, token, currentCompany?.id);
          return {
            data: response.items,
            totalCount: response.metadata.totalItems,
          };
        } catch (error: any) {
          const errorMessage = error instanceof Error && error.message ? error.message : "Error al cargar consignaciones";
          notify(errorMessage, "error", 3000);
          return { data: [], totalCount: 0 };
        }
      },
    });
  }, [token, currentCompany?.id]);

  const columns: IGenericDataGridColumn[] = useMemo(() => [
    { dataField: "id", caption: "ID", visible: false },
    {
      dataField: "itemName",
      caption: "Item",
      calculateCellValue: (rowData: any) =>
        rowData?.itemName
          ? (rowData.itemSku ? `${rowData.itemName} (${rowData.itemSku})` : rowData.itemName)
          : rowData?.itemId
    },
    {
      dataField: "partnerName",
      caption: "Cliente",
      calculateCellValue: (rowData: any) =>
        rowData?.partnerName
          ? (rowData.partnerCode ? `${rowData.partnerName} (${rowData.partnerCode})` : rowData.partnerName)
          : rowData?.partnerId
    },
    { dataField: "quantity", caption: "Cantidad" },
    { dataField: "returnedQuantity", caption: "Retornados" },
    { 
      dataField: "state", 
      caption: "Estado",
      lookup: {
        dataSource: CONSIGNMENT_STATES,
        valueExpr: "value",
        displayExpr: "label"
      }
    },
    { dataField: "notes", caption: "Notas" },
  ], []);

  return (
    <div className="flex flex-col w-full h-full rounded-dx">
      <GenericDataGrid
        ref={gridRef}
        gridId="consignments-grid"
        keyExpr="id"
        dataSource={dataSource}
        remoteOperations={true}
        columns={columns}
        export={{
          enabled: true,
          fileName: "Consignaciones",
        }}
        editing={{
          allowAdding: true,
          allowUpdating: false,
          allowDeleting: false,
          useIcons: true,
          onAdd: () => {
            setSelectedItem(null);
            setIsModalOpen(true);
          },
        }}
        actions={[
          {
            icon: "undo",
            hint: "Devolución de consignación",
            visible: (data: any) => {
              if (!data) return false;
              const pending = Number(data.quantity || 0) - Number(data.returnedQuantity || 0);
              return pending > 0;
            },
            onClick: (data) => {
              setSelectedItem(data);
              setIsReturnModalOpen(true);
            }
          }
        ]}
        stateStoring={{
          enabled: true,
          type: "custom",
          storageKey: "consignments-grid",
          customLoad,
          customSave,
        }}
      />
      <ConsignmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onHidden={() => {
          setSelectedItem(null);
        }}
        onSuccess={handleRefreshGrid}
        initialData={selectedItem}
      />
      <ConsignmentReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
        }}
        onHidden={() => {
          setSelectedItem(null);
        }}
        onSuccess={handleRefreshGrid}
        initialData={selectedItem}
      />
    </div>
  );
};

export default ConsignmentsClient;

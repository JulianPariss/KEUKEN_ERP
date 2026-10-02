import { DOCUMENTS_URL } from "../lib/constants/api.constants";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IBDocument, IBDocumentsListParams } from "@repo/api-contracts/erp";
import { IFListV2 } from "@repo/api-contracts/erp";
import { IFDocument } from "@repo/api-contracts/erp";
import { mapDocumentListV2 } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";

export const documentsService = {
  async getAll(params: IBDocumentsListParams, token: string, companyId?: string): Promise<IFListV2<IFDocument>> {
    try {
      const filteredParams = formatQueryParams(params);
      const query = new URLSearchParams(filteredParams).toString();
      const targetCompanyId = companyId || (params.company_id ?? undefined);

      const data: IBListV2<IBDocument> = await apiFetch<IBListV2<IBDocument>>(
        `${DOCUMENTS_URL}?${query}`,
        { method: "GET" },
        "No se pudieron obtener los documentos",
        { token, companyId: targetCompanyId }
      );

      return mapDocumentListV2(data);
    } catch (error) {
      console.error("Error en getAllDocuments:", error);
      throw error;
    }
  }
};


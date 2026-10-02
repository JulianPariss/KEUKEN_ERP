import { IBBrand } from "@repo/api-contracts/erp";
import { IBListV2 } from "@repo/api-contracts/erp";
import { IFBrand } from "@repo/api-contracts/erp";
import { IFListBasicParams, IFListV2 } from "@repo/api-contracts/erp";
import { mapBrand, mapBrandListV2, mapBrandToCreate, mapBrandToUpdate } from "@repo/api-contracts/erp";
import { mapListParams } from "@repo/api-contracts/erp";
import { formatQueryParams } from "@/lib/utils/formatter.helper";
import { PRODUCTS_URL } from "../../lib/constants/api.constants";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";

export const brandsService = {
    async getAll(companyId: string, searchParams: IFListBasicParams, token: string): Promise<IFListV2<IFBrand>> {
        try {
            const mappedParams = mapListParams(searchParams);
            const filteredParams = formatQueryParams(mappedParams);
            const queryParams = new URLSearchParams(filteredParams);
            if (companyId) {
                queryParams.set("company_id", companyId);
            }

            const url = `${PRODUCTS_URL}/brands?${queryParams.toString()}`;

            const data = await apiFetch<IBListV2<IBBrand>>(
                url,
                { method: "GET" },
                "No se pudieron obtener las marcas",
                { token, companyId }
            );

            return mapBrandListV2(data);
        } catch (error) {
            console.error("Error en getAllBrands:", error);
            throw error;
        }
    },
    async create(companyId: string, data: any, token: string): Promise<IFBrand> {
        try {
            const mappedData = mapBrandToCreate(data);
            const queryParams = new URLSearchParams();
            if (companyId) {
                queryParams.set("company_id", companyId);
            }
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/brands?${queryParams.toString()}`
                : `${PRODUCTS_URL}/brands`;

            const itemResponse = await apiFetch<IBBrand>(
                url,
                {
                    method: "POST",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo crear la marca",
                { token, companyId }
            );

            return mapBrand(itemResponse);
        } catch (error) {
            console.error("Error en createBrand:", error);
            throw error;
        }
    },
    async update(data: Partial<IFBrand>, id: string, token: string, companyId?: string): Promise<IFBrand> {
        try {
            const mappedData = mapBrandToUpdate(data);
            const queryParams = new URLSearchParams();
            if (companyId) {
                queryParams.set("company_id", companyId);
            }
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/brands/${id}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/brands/${id}`;

            const itemResponse = await apiFetch<IBBrand>(
                url,
                {
                    method: "PATCH",
                    body: JSON.stringify(mappedData),
                },
                "No se pudo actualizar la marca",
                { token, companyId }
            );

            return mapBrand(itemResponse);
        } catch (error) {
            console.error("Error en updateBrand:", error);
            throw error;
        }
    },
    async delete(id: string, token: string, companyId?: string): Promise<string> {
        try {
            const queryParams = new URLSearchParams();
            if (companyId) {
                queryParams.set("company_id", companyId);
            }
            const url = queryParams.toString()
                ? `${PRODUCTS_URL}/brands/${id}?${queryParams.toString()}`
                : `${PRODUCTS_URL}/brands/${id}`;

            const message = await apiFetch<string>(
                url,
                { method: "DELETE" },
                "No se pudo eliminar la marca",
                { token, companyId }
            );

            return message;
        } catch (error) {
            console.error("Error en deleteBrand:", error);
            throw error;
        }
    },
};
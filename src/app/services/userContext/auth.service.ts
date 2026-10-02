import { AUTH_URL } from "@/app/lib/constants/api.constants";
import { IBAuth, IBProfile, IBProfileContext } from "@repo/api-contracts/erp";
import { IFAuth, IFProfile, IFProfileContext } from "@repo/api-contracts/erp";
import { mapAuth, mapProfile, mapProfileContext } from "@repo/api-contracts/erp";

export const authService = {
    async login(login: string, password: string): Promise<IFAuth> {
        try {
            const url = `${AUTH_URL}/login`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ login, password, expires_in_minutes: 60 })
            });

            const data: IBAuth = await response.json();
            return mapAuth(data);
        } catch (error) {
            console.log("Ocurrió un error:", error);
            throw error;
        }
    },
    async getProfile(token: string, companyId?: string): Promise<IFProfile> {
        try {
            let url = `${AUTH_URL}/me`;
            if (companyId) {
                url += `?company_id=${encodeURIComponent(companyId)}`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo obtener el perfil de usuario`);
            }

            const data: IBProfile = await response.json();
            return mapProfile(data);
        } catch (error) {
            console.log("Ocurrió un error:", error);
            throw error;
        }
    },
    async getProfileContext(token: string, companyId?: string, branchId?: string): Promise<IFProfileContext> {
        try {
            let url = `${AUTH_URL}/me`;
            const params = new URLSearchParams();
            if (companyId) params.append("company_id", companyId);
            if (branchId) params.append("branch_id", branchId);
            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo obtener el contexto de perfil`);
            }

            const data: IBProfileContext = await response.json();
            return mapProfileContext(data);
        } catch (error) {
            console.log("Ocurrió un error al obtener el contexto de perfil:", error);
            throw error;
        }
    }
};

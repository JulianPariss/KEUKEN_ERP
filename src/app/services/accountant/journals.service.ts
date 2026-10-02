import { ACCOUNTS_URL } from "@/app/lib/constants/api.constants";
import { apiFetch } from "@/app/lib/utils/apiClient.helper";
import { IBDimensionBalance, IBJournal, IBJournalCreationResponse, IBJournalEntry } from "@repo/api-contracts/erp";
import { IBListV4 } from "@repo/api-contracts/erp";
import { IFDimensionBalance, IFJournal, IFJournalCreationResponse, IFJournalEntry } from "@repo/api-contracts/erp";
import { IFListV4 } from "@repo/api-contracts/erp";
import { mapDimensionBalance, mapJournalCreationResponse, mapJournalEntry, mapJournalToCreate, mapJournalsListV4 } from "@repo/api-contracts/erp";

export const journalsService = {
    async getAllJournals(token: string, companyId: string): Promise<IFListV4<IFJournal>> {
        try {
            const data: IBListV4<IBJournal> = await apiFetch(
                `${ACCOUNTS_URL}/journals?company_id=${companyId}`,
                { method: "GET" },
                "No se pudieron obtener los asientos contables",
                { token, companyId }
            );

            return mapJournalsListV4(data);
        } catch (error) {
            throw error;
        }
    },

    async journalEntry(journal: IFJournalEntry, token: string): Promise<IFJournalCreationResponse> {
        try {
            const mapped = mapJournalToCreate(journal);
            const data: IBJournalCreationResponse = await apiFetch(
                `${ACCOUNTS_URL}/journals/${journal.journalId}/entries`,
                {
                    method: "POST",
                    body: JSON.stringify(mapped),
                },
                "No se pudo crear el asiento contable",
                { token, companyId: journal.companyId }
            );

            return mapJournalCreationResponse(data);
        } catch (error) {
            throw error;
        }
    },
    async getLevelBalance(token: string, companyId: string, accountId: string): Promise<IFDimensionBalance> {
        try {
            const data: IBDimensionBalance = await apiFetch(
                `${ACCOUNTS_URL}/balances/${accountId}?company_id=${companyId}`,
                { method: "GET" },
                "No se pudo obtener el balance del nivel",
                { token, companyId }
            );

            return mapDimensionBalance(data);
        } catch (error) {
            throw error;
        }
    },
    async getJournalMove(token: string, moveId: string): Promise<IFJournalEntry> {
        try {
            const data: IBJournalEntry = await apiFetch(
                `${ACCOUNTS_URL}/entries/${moveId}`,
                { method: "GET" },
                "No se pudieron obtener los asientos contables",
                { token }
            );

            return mapJournalEntry(data);
        } catch (error) {
            throw error;
        }
    }
};

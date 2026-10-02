"use server";

import { packagingLevelService } from "../services/product_services/packagingLevel.service";

export async function getCachedPackagingLevels(token: string) {
    "use cache";
    
    if (!token) return [];
    
    try {
        return await packagingLevelService.getAll(token);
    } catch (error) {
        console.error("Error fetching cached packaging levels:", error);
        return [];
    }
}

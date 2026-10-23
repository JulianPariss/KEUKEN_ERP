"use server";

import { productsService } from "@repo/erp-services/product_services/products.service";
import { updateTag } from "next/cache";

export async function revalidateProducts() {
    updateTag("products");
}

export async function getProductFullById(id: string, token: string) {
    if (!token || !id) return null;
    try {
        return await productsService.getFullById(id, token);
    } catch (error) {
        console.error("Error fetching full product details:", error);
        return null;
    }
}

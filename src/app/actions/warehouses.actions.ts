"use server";

import { updateTag } from "next/cache";

export async function revalidateWarehouses() {
    updateTag("warehouses");
}

"use server";

import { updateTag } from "next/cache";

export async function revalidateConsignments() {
    updateTag("consignments");
}

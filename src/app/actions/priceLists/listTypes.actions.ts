"use server";

import { revalidatePath } from "next/cache";

export async function revalidateListTypes() {
    revalidatePath("/priceLists/listTypes");
}

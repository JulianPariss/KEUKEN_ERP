"use server";

import { updateTag } from "next/cache";

export async function revalidateCategories() {
    updateTag("categories");
}

"use server";

import { updateTag } from "next/cache";

export async function revalidateUoms() {
    updateTag("uoms");
}

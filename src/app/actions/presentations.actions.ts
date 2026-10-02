"use server";

import { updateTag } from "next/cache";

export async function revalidatePresentations() {
    updateTag("presentations");
}

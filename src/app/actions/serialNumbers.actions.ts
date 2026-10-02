"use server";

import { updateTag } from "next/cache";

export async function revalidateSerialNumbers() {
    updateTag("serial-numbers");
}

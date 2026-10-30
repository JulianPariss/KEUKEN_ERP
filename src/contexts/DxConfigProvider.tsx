"use client";
import "@/lib/erp-api-client.setup";
import "@repo/devextreme/registerEditors";

export function DxConfigProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

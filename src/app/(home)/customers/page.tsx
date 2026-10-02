import SectionHeader from "../components/section/sectionHeader";
import { Metadata } from "next";
import CustomersClient from "./";

export const metadata: Metadata = {
    title: "Clientes",
};

export default function CustomersPage() {
    return (
        <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
            <SectionHeader title="Clientes" />
            <CustomersClient />
        </div>
    );
}

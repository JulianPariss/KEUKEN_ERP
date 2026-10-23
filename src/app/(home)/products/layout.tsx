import { ProductUiBridge } from "./ProductUiBridge";

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProductUiBridge>{children}</ProductUiBridge>;
}

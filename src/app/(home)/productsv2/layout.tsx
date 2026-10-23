import { ProductUiBridge } from '../products/ProductUiBridge';

export default function ProductsV2Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProductUiBridge>{children}</ProductUiBridge>;
}

"use client";

import SectionHeader from "../../components/section/sectionHeader";
import ProductDetailView from "@repo/product-ui/productDetail/ProductDetailView";

export default function ProductDetailPage() {
    return <ProductDetailView SectionHeader={SectionHeader} />;
}

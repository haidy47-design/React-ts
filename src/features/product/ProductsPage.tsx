import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Spinner from "../../components/common/Spinner";
import ProductCard, { Product } from "../../components/product/ProductCard";
import HelmetWrapper from "../../components/common/HelmetWrapper";

async function fetchProducts(): Promise<Product[]> {
  const res = await axios.get("https://68e43ee28e116898997b5bf8.mockapi.io/product");
  return res.data;
}

export default function ProductsPage(): React.ReactElement {
  const { data, isLoading, isError } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const products = useMemo(() => data ?? [], [data]);

  return (
    <div className="container py-4">
      <HelmetWrapper title="Shop" />
      <h3 className="mb-3 text-center">Shop Flowers</h3>
      {isLoading && <Spinner />}
      {isError && <div className="alert alert-danger">Failed to load products.</div>}
      <div className="row g-3">
        {products.map((p) => (
          <div key={p.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}



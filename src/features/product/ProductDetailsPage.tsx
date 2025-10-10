import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Spinner from "../../components/common/Spinner";
import { Product } from "../../components/product/ProductCard";
import { useAppDispatch } from "../hooks";
import { addToCart } from "./cartSlice";
import HelmetWrapper from "../../components/common/HelmetWrapper";

async function fetchProduct(id: string): Promise<Product> {
  const res = await axios.get(`https://68e43ee28e116898997b5bf8.mockapi.io/product/${id}`);
  return res.data;
}

export default function ProductDetailsPage(): React.ReactElement {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useQuery({ queryKey: ["product", id], queryFn: () => fetchProduct(id) });

  if (isLoading) return <Spinner />;
  if (isError || !data) return <div className="container py-4">Unable to load product.</div>;

  return (
    <div className="container py-4">
      <HelmetWrapper title={data.title} />
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-6">
          <img src={data.image} alt={data.title} className="img-fluid rounded shadow-sm" />
        </div>
        <div className="col-12 col-lg-6">
          <h3>{data.title}</h3>
          <p className="text-muted">{data.description}</p>
          <h4 className="mb-3">${data.price.toFixed(2)}</h4>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => dispatch(addToCart(data))}>Add to Cart</button>
            <Link to="/checkout" className="btn btn-outline-dark">Cash on Delivery</Link>
          </div>
        </div>
      </div>
    </div>
  );
}





import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../app/axiosInstance";
import Spinner from "../../components/common/Spinner";
import ProductCard, { Product } from "../../components/product/ProductCard";
import "../../styles/price.css";



export default function ListOfLowestProduct(): React.ReactElement {
  const navigate = useNavigate();

  
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["lowest-priced-products"],
    queryFn: async (): Promise<Product[]> => {
      const response = await axiosInstance.get<Product[]>(
        "https://68e43ee28e116898997b5bf8.mockapi.io/product"
      );
    
      return response.data.sort((a, b) => a.price - b.price).slice(0, 6);
    },
    staleTime: 5 * 60 * 1000, 
    retry: 2,
  });

  if (isLoading) {
    return (
      <section className="container py-4">
        <h2 className="section-title mt-2 text-center">Best Deals</h2>
        <p className="text-center mb-5">
          Discover our lowest-priced products with unbeatable value
        </p>
        <Spinner />
      </section>
    );
  }

  if (error) {
    return (
      <section className="container py-4">
        <h3 className="text-center mb-4">Best Deals</h3>
        <div className="alert alert-warning text-center" role="alert">
          <h4 className="alert-heading">Oops!</h4>
          <p>We're having trouble loading our best deals. Please try again later.</p>
          <hr />
          <p className="mb-0">
            <button 
              className="btn btn-outline-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </p>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="container py-4">
        <h3 className="text-center mb-4">Best Deals</h3>
        <div className="alert alert-info text-center" role="alert">
          <h4 className="alert-heading">No Products Available</h4>
          <p>We're currently updating our inventory. Check back soon for amazing deals!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-4">
      <h3 className="section-title text-center mb-2 mt-5">Best Deals</h3>
      <p className="text-center mb-5">
        Unbeatable prices, limited time – discover our lowest-priced products today!
      </p>


      <div className="row g-4">
        {products.map((product) => (
          <div key={product.id} className="col-lg-4 col-md-6 col-12">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

  
      <div className="text-center mt-4">
        <button
          className="btn btn-outline-success rounded-0 btn-lg"
          onClick={() => navigate("/products")}
        >
          View All Products
        </button>
      </div>
    </section>
  );
}


import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Spinner from "../../components/common/Spinner";
import { Product } from "../../components/product/ProductCard";
import { useAppDispatch } from "../hooks";
import { addToCart } from "./cartSlice";
import HelmetWrapper from "../../components/common/HelmetWrapper";
import toast from "react-hot-toast";
import "./CartPage.css"; 



async function fetchProduct(id: string): Promise<Product> {
  const res = await axios.get(`https://68e43ee28e116898997b5bf8.mockapi.io/product/${id}`);
  return res.data;
}

export default function ProductDetailsPage(): React.ReactElement {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  const handleAddToCart = async () => {
    const userID = localStorage.getItem("user");
    if (!userID) {
      toast.error("⚠️ Please login first!");
      return;
    }

    if (isAdding) return;
    setIsAdding(true);

    try {
      await dispatch(addToCart({ ...data!, quantity })).unwrap();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error) {
      toast.error(typeof error === "string" ? error : "❌ Failed to add to cart!");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError || !data) return <div className="container py-4">Unable to load product.</div>;

  return (
    <div className="container py-5 product-details-page">
      <HelmetWrapper title={data.title} />

      <div className="row g-5 align-items-start">
        {/* Image Section */}
        <div className="col-12 col-lg-6 text-center">
          <img src={data.image} alt={data.title} className="product-image" />
        </div>

        {/* Product Info */}
        <div className="col-12 col-lg-6">
          <h3 className="product-title">{data.title}</h3>
          <p className="product-sku">SKU: {id}</p>

          <div className="product-price">${data.price.toFixed(2)}</div>

          <div className="quantity-section">
            <label className="quantity-label">Quantity*</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          <div className="product-actions">
            <button
              className="btn add-cart-btn"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
            <Link to="/cart" className="btn view-cart-btn">
              View Cart
            </Link>
          </div>

          {/* Description Section */}
          {data.description && (
            <div className="product-description mt-4">
              <h5>Description</h5>
              <p>{data.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

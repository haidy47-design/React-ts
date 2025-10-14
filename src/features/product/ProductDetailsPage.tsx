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
import Slider from "react-slick"
import ProductCard from "../../components/product/ProductCard";
import "./CartPage.css";

async function fetchProduct(id: string): Promise<Product> {
  const res = await axios.get(`https://68e43ee28e116898997b5bf8.mockapi.io/product/${id}`);
  return res.data;
}

async function fetchAllProducts(): Promise<Product[]> {
  const resAll = await axios.get(`https://68e43ee28e116898997b5bf8.mockapi.io/product`);
  return resAll.data;
}

export default function ProductDetailsPage(): React.ReactElement {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  const { data: related } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });

  const handleAddToCart = async () => {
    const userID = localStorage.getItem("user");
    if (!userID) {
      toast.custom((t) => (
          <div
            className={`${
              t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } transition-all duration-300 bg-white shadow-lg rounded-4 border py-3 px-5 text-center`}
            style={{
              minWidth: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              className="rounded-circle bg-warning d-flex align-items-center justify-content-center"
              style={{ width: "50px", height: "50px" }}
            >
              <span style={{ fontSize: "24px", color: "white" }}>!</span>
            </div>
            <h5 className="fw-semibold mt-2 mb-1 text-dark">Please Login First</h5>
          </div>
        ),
        { duration: 1500, position: "top-right" }
      );
      return;
    }

    if (isAdding) return;
    setIsAdding(true);

    try {
      await dispatch(addToCart({ ...product!, quantity })).unwrap();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } transition-all duration-300 bg-white shadow-lg rounded-4 border py-2 px-5 text-center`}
            style={{
              minWidth: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              className="rounded-circle bg-success d-flex align-items-center justify-content-center"
              style={{ width: "50px", height: "50px" }}
            >
              <span style={{ fontSize: "24px", color: "white" }}>✔</span>
            </div>
            <h6 className="fw-semibold mt-2 mb-1 text-dark">Added To Cart Successful</h6>
          </div>
        ),
        { duration: 2000, position: "top-right" }
      );
    } catch (error) {
      toast.custom((t) => (
          <div
            className={`${
              t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } transition-all duration-300 bg-white shadow-lg rounded-4 border py-3 px-5 text-center`}
            style={{
              minWidth: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
              style={{ width: "50px", height: "50px" }}
            >
              <span style={{ fontSize: "24px", color: "white" }}>X</span>
            </div>
            <h5 className="fw-semibold mt-2 mb-1 text-dark">Failed to add to cart!</h5>
          </div>
        ),
        { duration: 1500, position: "top-right" });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError || !product) return <div className="container py-4">Unable to load product.</div>;

  const settings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 1 ,  slidesToScroll: 1,} },
      { breakpoint: 480, settings: { slidesToShow: 1 ,  slidesToScroll: 1,} },
    ],
  };

  return (
    <div className="container py-5 product-details-page">
      <HelmetWrapper title={product.title} />

      <div className="row g-5 align-items-start justify-content-between pb-5">
        {/* Image Section */}
        <div className="col-12 col-md-7 col-lg-7">
          <img src={product.image} alt={product.title} className="product-image" />
        </div>

        {/* Product Info */}
        <div className="col-12 col-md-5 col-lg-5">
          <h5 className="mb-3">{product.title}</h5>
          <p className="product-sku">SKU: {id}</p>

          <span className="text-muted text-decoration-line-through small me-5">
            ${product.price.toFixed(2)}
          </span>
          <span className="fw-semibold main-color">${product.discount}</span>

          <div className="quantity-section mt-4">
            <label className="quantity-label">Quantity</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="main-color">-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="main-color">+</button>
            </div>
          </div>

          <div className="product-actions">
            <button
              className="btn btn-success rounded-0 py-2 col-8 col-md-9 col-lg-9"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
            <Link to="/cart" className="btn btn-outline-success rounded-0 py-2">
              View Cart
            </Link>
          </div>

          {product.description && (
            <div className="product-description main-color mt-4">
              <h5>Description</h5>
              <p className="text-muted">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {related && related.length > 1 && (
        <div className="related-products mt-5">
          <h4 className="text-center mb-4 main-color">Related Products</h4>
          <Slider {...settings} className="text-center related-slider" >
            {related
              .filter(prod => prod.id !== product.id &&prod.category == product.category)
              .map(prod => (
                <div key={prod.id} className="p-2">
                  <ProductCard product={prod} />
                </div>
              ))}
          </Slider>
        </div>
      )}
    </div>
  );
}

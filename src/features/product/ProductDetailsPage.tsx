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
import Slider from "react-slick";
import ProductCard from "../../components/product/ProductCard";
import "./CartPage.css";
import { Rating } from "@mui/material";
import PolicyAccordion from "./PolicyAccordion";
import ReviewForm from "./ReviewForm";


// ✅ تعريف Zod Schema

// جلب منتج واحد
async function fetchProduct(id: string): Promise<Product> {
  const res = await axios.get(
    `https://68e43ee28e116898997b5bf8.mockapi.io/product/${id}`
  );
  return res.data;
}

// جلب كل المنتجات
async function fetchAllProducts(): Promise<Product[]> {
  const resAll = await axios.get(
    `https://68e43ee28e116898997b5bf8.mockapi.io/product`
  );
  return resAll.data;
}

export default function ProductDetailsPage(): React.ReactElement {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingValue, setRatingValue] = useState<number | null>(4);
  const queryClient = useQueryClient();

  

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  const { data: related } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
  });



  // --- Fetch Reviews ---
const { data: reviews, isLoading: loadingReviews } = useQuery({
  queryKey: ["reviews", id],
  queryFn: async () => {
    const res = await axios.get(
      "https://68f17bc0b36f9750dee96cbb.mockapi.io/reviews"
    );
    return res.data.filter((r: any) => r.productID === id);
  },
});


  // ✅ إضافة المنتج للسلة
  const handleAddToCart = async () => {
    const userID = localStorage.getItem("user");
    if (!userID) {
      toast.error("Please Login First");
      return;
    }

    if (isAdding) return;
    setIsAdding(true);

    try {
      await dispatch(addToCart({ ...product!, quantity })).unwrap();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Added To Cart Successfully");
    } catch {
      toast.error("Failed to add to cart!");
    } finally {
      setIsAdding(false);
    }
  };

  // ✅ إرسال الريفيو
  
  if (isLoading) return <Spinner />;
  if (isError || !product)
    return <div className="container py-4">Unable to load product.</div>;

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
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="container py-5 product-details-page">
      <HelmetWrapper title={product.title} />

      {/* --- Product Info --- */}
      <div className="row g-5 align-items-start justify-content-between pb-5">
        
        <div className="col-12 col-md-7 col-lg-7">
          <img src={product.image} alt={product.title} className="product-image" />
        </div>


        <div className="col-12 col-md-5 col-lg-5">
          <h5 className="mb-3">{product.title}</h5>
          <p className="product-sku">SKU: {id}</p>
           <div>{product.stock >1 ? <p className="text-success">Available {product.stock}</p>:<p className="text-danger">Out Of Stock</p>}</div>

          <span className="text-muted text-decoration-line-through small me-3">
            ${product.price.toFixed(2)}
          </span>
          <span className="fw-semibold main-color">${product.discount}</span>
           
          <div className="quantity-section mt-4">
            <label className="quantity-label">Quantity</label>
            <div className="quantity-control">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="main-color"
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="main-color">
                +
              </button>
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

          <div>
            <PolicyAccordion />
          </div>
        </div>
      </div>

      {/* --- Write Review Button --- */}
      <div className="row">
        <div className="col-12 d-flex justify-content-end">
          <button
            className="btn btn-outline-success rounded-0"
            onClick={() => setShowReviewForm((prev) => !prev)}
          >
            <i className="fa-solid fa-pen-to-square"></i>{" "}
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
        </div>
      </div>


      {/* --- Review Form --- */}
    {showReviewForm && <ReviewForm productID={id} />}

    {/* --- Reviews Section --- */}
    {/* --- Reviews Section --- */}
<div className="reviews-section mt-5">
  <h4 className="text-center mb-4 main-color">Customer Reviews</h4>

  {loadingReviews ? (
    <div className="text-center py-4">Loading reviews...</div>
  ) : reviews && reviews.length > 0 ? (
    <Slider
      dots={false}
      infinite={true}
      speed={600}
      slidesToShow={3}
      slidesToScroll={1}
      autoplay={true}
      autoplaySpeed={3000}
      arrows={true}
      responsive={[
        { breakpoint: 1024, settings: { slidesToShow: 2 } },
        { breakpoint: 768, settings: { slidesToShow: 1 } },
      ]}
      className="review-slider related-slider"
    >
      {reviews.map((rev: any) => (
        <div key={rev.id} className="p-3">
          <div className="card shadow-sm border-0 h-100 review-card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <i className="fa-solid fa-user-circle fs-3 me-2 main-color"></i>
                <div>
                  <h6 className="mb-0">{rev.name}</h6>
                  <small className="main-color">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fa-solid fa-star me-1 ${
                      star <= rev.rate ? "text-warning" : "text-secondary"
                    }`}
                  ></i>
                ))}
              </div>

              <h6 className="fw-semibold">{rev.reviewTitle}</h6>
              <p className="main-color small">{rev.overall}</p>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  ) : (
    <div className="text-center py-4 text-muted">
      No reviews yet. Be the first to write one!
    </div>
  )}
</div>


      {/* --- Related Products --- */}
      {related && related.length > 1 && (
        <div className="related-products mt-5">
          <h4 className="text-center mb-4 main-color">Related Products</h4>
          <Slider {...settings} className="text-center related-slider">
            {related
              .filter(
                (prod) => prod.id !== product.id && prod.category === product.category
              )
              .map((prod) => (
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

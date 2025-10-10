import React from "react";
import { useNavigate, Link  } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../app/axiosInstance";
import Spinner from "../../components/common/Spinner";
import { useAppDispatch } from "../hooks";
import { addToCart } from "../product/cartSlice";
import "../../styles/home.css";

// Interface for product data structure from API
interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
}

// Interface for API response
interface ProductsResponse {
  data: Product[];
}


export default function ListOfLowestProduct(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Fetch products from the API
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["lowest-priced-products"],
    queryFn: async (): Promise<Product[]> => {
      try {
        const response = await axiosInstance.get<Product[]>(
          "https://68e43ee28e116898997b5bf8.mockapi.io/product"
        );
        
        // Sort products by price (ascending) and take top 8
        const sortedProducts = response.data
          .sort((a, b) => a.price - b.price)
          .slice(0, 8);
        
        return sortedProducts;
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Handle add to cart click
  const handleAddToCart = (product: Product): void => {
    // Dispatch to cart slice
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
    }));
  };

  // Calculate discounted price (10% off)
  const calculateDiscountedPrice = (originalPrice: number): number => {
    return originalPrice * 0.9; // 10% discount
  };

  // Check if product should have discount (every 3rd product)
  const hasDiscount = (): boolean => {
  return true;
};


  // Show spinner while loading
  if (isLoading) {
    return (
      <section className="container py-4">
        <div className="container">

        <h2 className="section-title mt-2">Best Deals</h2>
        </div>
        <div className="mb-5 pb-1">
      
      <h6 className="text-center mb-5">Discover our lowest-priced products with unbeatable value</h6>
      </div>


        <Spinner />
      </section>
    );
  }

  // Show error message if API call fails
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

  // Show message if no products found
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
      <h3 className="section-title text-center mb-2 mt-5">
        Best Deals
      </h3>
      <div className="mb-5 pb-1">
      <h6 className="text-center mt-3 mb-5">Unbeatable prices, limited time – discover our lowest-priced products today!</h6>
      </div>

      
      
      {/* Responsive product grid */}
      <div className="row g-4">
        {products.map((product, index) => (
          <div key={product.id} className="col-lg-3 col-md-6 col-12">
            <Link to={`/products/${product.id}`} className="text-decoration-none">

            <div className="card h-100 shadow-sm product-card ">
              {/* Product image with hover effect */}
              <div 
                className="card-img-top-container position-relative "
                style={{ height: "200px", overflow: "hidden" }}
              >
                <img
                  src={product.image || "/Images/1.jpg"} // Fallback image
                  className="card-img-top h-100 w-100 object-fit-cover"
                  alt={product.title}
                  style={{ 
                    transition: "transform 0.3s ease, box-shadow 0.3s ease" 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                
                {/* Discount badge */}
                {hasDiscount() && (
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className="badge bg-danger">
                      10% OFF
                    </span>
                  </div>
                )}
                
                {/* Price badge */}
                {/* <div className="position-absolute top-0 end-0 m-2">
                  <span className="badge bg-success fs-6">
                    {hasDiscount() ? (
                      <>
                        <span style={{ textDecoration: 'line-through', opacity: 0.7, fontSize: '0.8rem' }}>
                          ${product.price.toFixed(2)}
                        </span>
                        <br />
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>
                          ${calculateDiscountedPrice(product.price).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </span>
                </div> */}
              </div>

              {/* Product details */}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-2 text-truncate" title={product.title}>
                  {product.title}
                </h5>
                
                <p className="card-text text-muted small mb-2">
                  <span className="badge bg-cat text-start  me-2">{product.category}</span>
                </p>
                
                <p className="card-text text-muted small mb-3 flex-grow-1">
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description
                  }
                </p>

                {/* Add to cart button */}
                {/* <button
                  className="btn btn-primary w-100 mt-auto"
                  onClick={() => handleAddToCart(product)}
                  style={{ 
                    transition: "all 0.3s ease",
                    fontSize: "0.9rem"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(233,30,99,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  {hasDiscount(index) ? "Add to Cart (Save 10%)" : "Add to Cart"}
                </button> */}
              </div>
            </div>
            </Link>
          </div>
        ))}
      </div>

      {/* View all products link */}
      <div className="text-center mt-4">
        <button
          className="btn btn-outline-primary btn-lg"
          onClick={() => navigate("/products")}
        >
          View All Products
        </button>
      </div>


      
    </section>

    
  );
}



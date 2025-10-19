
import React, { memo } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../features/hooks";
import { addToCart } from "../../features/product/cartSlice";
import { toast } from "react-hot-toast";
import "../../styles/card.css";
import { FaShoppingCart, FaEye, FaHeart } from "react-icons/fa";
import { toggleWishlist } from "../../features/product/wishlistSlice";


export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  discount: number;
  stock: number;
  
};

type Props = {
  product: Product;
};

function ProductCardComponent({ product }: Props): React.ReactElement {
  const hasDiscount = true;
  

  const dispatch = useAppDispatch();
  


const handleAddToCart = () => {
  dispatch(addToCart({ ...product, quantity: 1 }))
    .unwrap()
    .then(() => {
      toast.success("Added to cart!");
    })
    .catch((err) => {
      toast.error(err || "Failed to add to cart");
    });
};

  const wishlist = useAppSelector((state) => state.wishlist.items);
const isInWishlist = wishlist.some(
  (item) => String(item.productId) === String(product.id)
);

const handleToggleWishlist = () => {
  dispatch(toggleWishlist(product));

  if (isInWishlist) {
    toast("Removed from wishlist 💔", { icon: "💔" });
  } else {
    toast.success("Added to wishlist ❤️");
  }
};


  return (
    <div
      className="border-0 pb-3 position-relative overflow-hidden product-card mb-3"
      style={{
        backgroundColor: "transparent",
        borderRadius: "0px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-20px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* badge */}
      {hasDiscount && (
        <div
          className="bg-main-color px-2 text-white"
          style={{
            position: "absolute",
            top: "0px",
            left: "0px",
            zIndex: 2, 
          }}
        >
          VDAY 10% Off
        </div>
      )}

      {/* image */}
      <div className="position-relative">
        <Link
          to={`/products/${product.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <img
            src={product.image}
            alt={product.title}
            style={{ height: "500px", objectFit: "contain" }}
            className="card-img-top rounded-0 object-fit-cover"
            loading="lazy"
          />
        </Link>

        

        {/* hover overlay */}
        <div className="hover-overlay">
              {/*Wishlist*/}
              
              <button
                  className={`wishlist-btn btn rounded-circle p-3 shadow-sm ${
                    isInWishlist ? "active" : ""
                  }`}
                  onClick={handleToggleWishlist}
                >
                  <FaHeart size={26} />
                </button>


              <div className="bottom-icons">
                <button
                  className="btn btn-light rounded-circle p-3 shadow-sm"
                  style={{ transition: "all 0.3s ease" }}
                  onClick={handleAddToCart}
                >
                  <FaShoppingCart size={26} className="fs-5 text-dark" />
                </button>

                <Link
                  to={`/products/${product.id}`}
                  className="btn btn-light rounded-circle p-3 shadow-sm"
                  style={{ transition: "all 0.3s ease" }}
                >
                  <FaEye size={26} className="fs-5 text-dark" />
                </Link>
              </div>
            </div>
          </div>

      {/* info */}
      <div className="text-center">
        <h5 className="mt-3 mb-2">{product.title}</h5>

        <div>
          {hasDiscount ? (
            <>
              <span className="fw-bold main-color me-2">
                ${product.discount}
              </span>
              <span className="text-muted text-decoration-line-through small">
                ${product.price}
              </span>
            </>
          ) : (
            <span className="fw-bold">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}

const ProductCard = memo(ProductCardComponent);
export default ProductCard;

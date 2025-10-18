import React from "react";
import { useAppSelector, useAppDispatch } from "../../features/hooks";
import { clearWishlist } from "./wishlistSlice";
import ProductCard from "../../components/product/ProductCard";
import "../../styles/card.css";
import { FaHeart } from "react-icons/fa";
import { FaHeartBroken } from "react-icons/fa";


const Wishlist: React.FC = () => {
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const dispatch = useAppDispatch();

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
  };

  return (
    <section className="container py-4">
      <h3 className="section-title text-center mb-2 mt-5 d-flex justify-content-center align-items-center gap-2">
        My Wishlist
        <FaHeart size={26} color="#79253D" />
      </h3>
      <p className="text-center mb-5">
        Your favorite products – save them for later or shop them now!
      </p>

      {wishlist.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-center fs-3 mt-5 d-flex justify-content-center align-items-center gap-2">
            Your wishlist is empty
            <FaHeartBroken size={25} color="#79253D" />
          </p>
        </div>
      ) : (
        <>
          <div className="text-center mb-5">
            <button
              className="btn btn-outline-primary btn-lg mb-2"
              onClick={handleClearWishlist}
            >
              Reset Wishlist
            </button>
            
          </div>

          <div className="row g-4">
            {wishlist.map((product) => (
              <div key={product.id} className="col-lg-4 col-md-6 col-12">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Wishlist;

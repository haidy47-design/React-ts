import React from "react";
import { Link } from "react-router-dom";
import "../../styles/hero.css";

const SpecialOffer: React.FC = () => {
  return (
    <section
      className="hero-section d-flex justify-content-center align-items-center text-center text-white"
      style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/Images/offer4.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center py-5  position-relative">
      <div className="container">
        <h2 className="fw-bold text-uppercase mb-3 heading-font text-white">
          10% Off Selected Flowers for Valentine's Day
        </h2>

        <p className="lead mx-auto w-75 mb-4 paragraph-font text-white">
          From classic red roses to elegant mixed bouquets, each
        design is crafted to express your heartfelt emotions.
        </p>

        <Link
          to="/products" 
          className="btn btn-outline-light px-4 py-2 fw-semibold offer-btn"
        >
          Shop Now
        </Link>

      </div>
      </div>
       
    </section>
  );
};


export default SpecialOffer;
import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/insta.css";

const InstagramPhotos: React.FC = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 576,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const images = [
    "/Images/insta.jpg",
    "/Images/insta9.jpg",
    "/Images/insta10.jpg",
    "/Images/insta11.jpg",
    "/Images/insta12.jpg",
    "/Images/insta13.jpg",
    "/Images/insta7.jpg",
    "/Images/insta8.jpg",
  ];

  return (
    <section className="insta-section text-center py-5">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="fw-semibold mb-4 text-maroon"
      >
        Roséa Flower Shop
      </motion.h2>

      {/* Carousel */}
      <div className="container">
        <Slider {...settings}>
          {images.map((src, index) => (
            <div key={index} className="insta-wrapper">
              <img
                src={src}
                alt={`Instagram ${index + 1}`}
                className="img-fluid insta-img rounded-2"
              />
              <div className="overlay">
                <i className="bi bi-instagram fs-3"></i>
              </div>
            </div>
          ))}
        </Slider>

        {/* Button */}
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-follow"
          >
            Follow Us
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default InstagramPhotos;

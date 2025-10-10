import React, { useEffect , useRef } from "react";
import { Link } from "react-router-dom";
import "../../styles/hero.css";
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function Welcome(): React.ReactElement {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 

    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;

      
      if (textRef.current) {
        textRef.current.style.transform = `translateY(${scrollTop * 0.5}px)`;
      }

      
      const carouselItems = document.querySelectorAll<HTMLImageElement>(".carousel-item img");
      carouselItems.forEach((img) => {
        img.style.transform = `translateY(${scrollTop * 0.1}px)`;
        img.style.transition = "transform 0.1s linear";
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <section className="container hero-section text-white position-relative  mx-auto vh-100">
      {/* Overlay */}
      <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>

     
      <Carousel fade interval={3000} className="position-absolute w-100 h-100" style={{ zIndex: 0 }}>
        <Carousel.Item className="h-100">
          <img
            className="d-block w-100 h-100 object-fit-cover"
            src="/Images/13.jpg"
            alt="Hero 1"
          />
        </Carousel.Item>
        <Carousel.Item className="h-100">
          <img
            className="d-block w-100 h-100 object-fit-cover"
            src="/Images/4.jpg"
            alt="Hero 2"
          />
        </Carousel.Item>
        <Carousel.Item className="h-100">
          <img
            className="d-block w-100 h-100 object-fit-cover"
            src="/Images/6.jpg"
            alt="Hero 2"
          />
        </Carousel.Item>
        <Carousel.Item className="h-100">
          <img
            className="d-block w-100 h-100 object-fit-cover"
            src="/Images/5.jpg"
            alt="Hero 2"
          />
        </Carousel.Item>
        <Carousel.Item className="h-100">
          <img
            className="d-block w-100 h-100 object-fit-cover"
            src="/Images/17.jpg"
            alt="Hero 2"
          />
        </Carousel.Item>
        <Carousel.Item className="h-100">
          <img
            className="d-block w-100 h-100 object-fit-cover"
            src="/Images/18.jpg"
            alt="Hero 2"
          />
        </Carousel.Item>
      </Carousel>

      {/* Content */}
      <div className="container position-relative text-center d-flex flex-column justify-content-center align-items-center h-100 fade-up" style={{ zIndex: 2 }}>
        <h1 className="hero-heading display-3 fw-bold text-uppercase heading-font mb-3">
          Roséa
        </h1>
        <p className="fs-5 text-uppercase subheading-font mb-4">Flower Shop</p>
        <p className="hero-paragraph lead mx-auto w-75 mb-4 paragraph-font text-shadow">
          Fresh blooms, delivered with love. Celebrate life’s special moments with Roséa’s stunning arrangements.
        </p>
        <Link to="/products" className="btn btn-primary px-4 py-2 mt-2">
          Shop Now
        </Link>
      </div>
    </section>
  );
}


// {/* Carousel as background */}
//       <div
//         id="hero"
//         className="carousel slide position-absolute w-100 h-100"
//         data-bs-ride="carousel"
//         style={{ zIndex: 0 }}
//       >
//         <div className="carousel-inner h-100">
//           <div className="carousel-item active h-100">
//             <img
//               src="/Images/1.jpg"
//               className="d-block w-100 h-100 object-fit-cover"
//               alt="Hero 1"
//             />
//           </div>
//           <div className="carousel-item h-100">
//             <img
//               src="/Images/2.jpg"
//               className="d-block w-100 h-100 object-fit-cover"
//               alt="Hero 2"
//             />
//           </div>
//         </div>
//         <button
//           className="carousel-control-prev"
//           type="button"
//           data-bs-target="#hero"
//           data-bs-slide="prev"
//         >
//           <span className="carousel-control-prev-icon" aria-hidden="true"></span>
//           <span className="visually-hidden">Previous</span>
//         </button>
//         <button
//           className="carousel-control-next"
//           type="button"
//           data-bs-target="#hero"
//           data-bs-slide="next"
//         >
//           <span className="carousel-control-next-icon" aria-hidden="true"></span>
//           <span className="visually-hidden">Next</span>
//         </button>
//       </div>
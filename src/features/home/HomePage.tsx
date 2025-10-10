import React from "react";
import { Link } from "react-router-dom";
// import ProductsPage from "../product/ProductsPage";
import HelmetWrapper from "../../components/common/HelmetWrapper";
import Welcome from "./Welcome";
import CategorySlider from "./CategorySlider";
import ListOfLowestProduct from "./ListOfLowestProduct";
import "../../styles/home.css";
import About from "./About";
import Contact from "./Contact";
import SpecialOffer from "./SpecialOffer";
import InstagramPhotos from "./InstagramPhotos";


export default function HomePage(): React.ReactElement {
  return (
    <>
      <HelmetWrapper title="Roséa Flower Shop" />



    <Welcome />

    <section className="container mt-4">

    <About />
    </section>
      
      {/* Category Slider Section */}
      <section className="container mt-4">
      <CategorySlider />
      </section>
      <section className="container mt-4">
      <SpecialOffer />
      </section>

      {/* Lowest Priced Products Section */}
      <ListOfLowestProduct />
      <section className="container mt-4">
      <InstagramPhotos />
      </section>
      
      <section className="container mt-4">
      <Contact />
      </section>

      
    </>
  );
}



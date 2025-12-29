import React from "react";
import { Link } from "react-router-dom";
// import HelmetWrapper from "../../components/common/HelmetWrapper";
import Welcome from "./Welcome";
import CategorySlider from "./CategorySlider";
import ListOfLowestProduct from "./ListOfLowestProduct";
import About from "./About";
import Contact from "./Contact";
import SpecialOffer from "./SpecialOffer";
import InstagramPhotos from "./InstagramPhotos";
import CategorySlider2 from "./CategorySlider2";



export default function HomePage(): React.ReactElement {
  return (
    <>
      {/* <HelmetWrapper title="Roséa Flower Shop" /> */}



    <Welcome />

  
      <section className="container mt-4">
      <CategorySlider />
      </section>

      <section className="container ">
      <CategorySlider2 />
      </section>
      <section className="container mt-4">
      <SpecialOffer />
      </section>


      <ListOfLowestProduct />
      <section className="container mt-4">
      <InstagramPhotos />
      </section>


      
    </>
  );
}



import React, { use } from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/about.css";
// import HelmetWrapper from "../../components/common/HelmetWrapper";
import { useNavigate } from "react-router";


const About: React.FC = () => {
const  navigate = useNavigate();
  const handleGoToContact = () => {
    navigate("/contact");
  }


  return (

    <>
      {/* <HelmetWrapper title="About Us" /> */}
      <section className="about-section py-5">
        <div className="container">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-5 about-title"
          >
            About Roséa
          </motion.h2>
      
          <div className="row align-items-center justify-content-center   rounded overflow-hidden">
      
            {/* Left Column */}
            <motion.div
              className="col-12 col-md-6 p-5 text-center "
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h4 className="fw-semibold mb-3 text-dark">
                Blossoming Beauty, Delivered with Love
              </h4>
              <p className="text-muted mb-3">
                
              At Roséa, we believe that every flower tells a story.
              Our passion for fresh, elegant blooms inspired us to create
              an online flower shop that makes it easy to share love,
              joy, and warmth through nature’s most beautiful creations. 
                       
              </p>
              <p className="text-muted mb-3">
               
              Each bouquet is carefully handpicked and thoughtfully arranged
               by our expert florists to ensure it arrives fresh and full of life — ready to brighten someone’s day or celebrate life’s special moments.
                          
              </p>
              
      
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-success rounded-0 px-4 py-2"
                onClick={handleGoToContact}
              >
                Contact Us
              </motion.button>
            </motion.div>
      
            {/* Right Column (Image) */}
            <motion.div
              className="col-12 col-md-6 p-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <img
                src="/Images/aboutus.jpeg"
                alt="Flowers"
                className="rounded-0" style={{width:"100%" , height:"600px" , filter: "brightness(0.5)"}}
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;

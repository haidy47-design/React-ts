import React from "react";
import "../../styles/footer.css";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="custom-footer py-5 mt-5">
      <div className="container">
        <div className="row text-center  border"> 

          {/* Logo */}
          <div className="col-12 col-md-3 p-4 border-end d-flex flex-column align-items-center ">
            <Link to="/" className="navbar-brand">
          <img
            src="/Images/Rlogo.png"       
            alt="Roséa Logo"
            height={100}                  
            className="d-inline-block align-text-top"
          />
          </Link>
          <p className="mt-2 footer-text"> Roséa</p>
          <span className="mt-2 footer-text">Flower Shop</span>
          </div>

          {/* Menu */}
          <div className="col-12 col-sm-6 col-md-3 p-4 border-end">
            <h6 className="footer-title">Quick Menu</h6>
            <ul className="list-unstyled mt-3">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/products" className="footer-link">Shop</Link></li>
              <li><Link to="/about" className="footer-link">About</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div className="col-12 col-sm-6 col-md-3 p-4 border-end">
            <h6 className="footer-title">Policy</h6>
            <ul className="list-unstyled mt-3">
              <li><a href="#" className="footer-link">Shipping & Returns</a></li>
              <li><a href="#" className="footer-link">Store Policy</a></li>
              <li><a href="#" className="footer-link">Payment Methods</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
            </ul>
          </div>

          {/* Address */}
          <div className="col-12 col-md-3 p-4">
            <h6 className="footer-title">Address</h6>
            <p className="mb-1 mt-3 footer-text">500 Terry Francine Street</p>
            <p className="mb-3 footer-text">San Francisco, CA 94158</p>
            <div className="d-flex align-items-center gap-3 justify-content-center ">
              <span className="footer-text">Follow</span>
              <a href="#" className="footer-icon"><i className="bi bi-facebook"></i></a>
              <a href="#" className="footer-icon"><i className="bi bi-instagram"></i></a>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-4">
          <small className="footer-text">
            © 2025 by  Roséa. Powered and secured by <a href="#" className="footer-link">ITI</a>
          </small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../features/hooks";
import { logout } from "../../features/auth/authSlice";
import "../../styles/navbar.css";


export default function Navbar(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) => s.cart.items.length);

  return (
    <>
    <div className=" py-3 small w-75 mx-auto ">
        
      </div>
      {/* 🔹 Top Promo Bar */}
      <div className="container bg-maroon text-white text-center fs-6 py-3 small fw-semibold  mx-auto ">
        Valentine’s Day Promotions <a href="#"className= "text-decoration-underline text-white">Shop Now</a> <span className="ms-1">♡</span>
      </div>

      {/* 🔹 Main Navbar */}
      <nav className="container navbar navbar-expand-lg navbar-light  sticky-top shadow-sm   mx-auto border border-danger-subtle border-bottom-0">
        <div className="container ">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
          <img
            src="/Images/Rlogo.png"       
            alt="Roséa Logo"
            height={40}                
            className="d-inline-block align-text-top"
          />
          </Link>


          {/* Toggle Button */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Content */}
          <div className="collapse navbar-collapse" id="mainNav">
            {/* Center Nav Links */}
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className="nav-link px-3 text-dark">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/products" className="nav-link px-3 text-dark">
                  Shop
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about" className="nav-link px-3 text-dark">
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact" className="nav-link px-3 text-dark">
                  Contact
                </NavLink>
              </li>
            </ul>

            {/* Right Side */}
            <ul className="navbar-nav ms-lg-auto align-items-lg-center">
              {/* User Section */}
              <li className="nav-item dropdown">
                {token ? (
                  <>
                    <a
                      href="#!"
                      className="nav-link dropdown-toggle text-dark"
                      id="userDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Hi, {user?.name ?? "User"}
                    </a>
                    <ul
                      className="dropdown-menu dropdown-menu-end shadow-sm"
                      aria-labelledby="userDropdown"
                    >
                      <li>
                        <NavLink to="/profile" className="dropdown-item">
                          Profile Details
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/reset-password" className="dropdown-item">
                          Reset Password
                        </NavLink>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => dispatch(logout())}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <NavLink to="/login" className="nav-link text-dark">
                    Login
                  </NavLink>
                )}
              </li>

              {/* Cart Button */}
              <li className="nav-item ms-lg-3">
                <NavLink
                  to="/cart"
                  className="btn-outline-maroon position-relative text-decoration-none px-2 py-1 rounded"
                >
                  Cart ({cartCount})
                  {/* <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span> */}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

  
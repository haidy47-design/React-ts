import React, { useEffect, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../features/hooks";
import { logoutUser } from "../../features/auth/authSlice";
import "../../styles/navbar.css";
import { GiShoppingCart } from 'react-icons/gi';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { fetchCartItems } from "../../features/product/cartSlice";
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -1,
    top: 2,
    border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: '#79253D',
    color: 'white', 
  },
}));


export default function Navbar(): React.ReactElement {
  const dispatch = useAppDispatch();
  const  user  = useAppSelector((s) => s.auth);
  const cartItems = useAppSelector((s) => s.cart.items);
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  useEffect(() => {
      dispatch(fetchCartItems());
    }, [dispatch]);
  

  return (
    <>
    <div className=" py-3 small w-75 mx-auto ">
        
      </div>
      {/* 🔹 Top Promo Bar */}
      <div className="container bg-success text-white text-center fs-6 py-3 small fw-semibold ">
        Valentine’s Day Promotions <Link to="/products"className= "text-decoration-underline text-white">Shop Now</Link> <span className="ms-1">♡</span>
      </div>

      {/* 🔹 Main Navbar */}
      <nav className="container navbar navbar-expand-lg sticky-top shadow-sm mx-auto " style={{backgroundColor:"#F4EFE8"}}>
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
                {user ? (
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
                          onClick={() => dispatch(logoutUser())}
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
              <li className="nav-item ms-lg-3 mx-3">
                <NavLink
                  to="/cart"
                  className=" "
                >
                    <StyledBadge badgeContent={cartItems.length>=1?cartCount:"0"} >
                         <GiShoppingCart style={{height:"30px",width:"30px" ,color:"#79253D"}} />
                    </StyledBadge>
                  
                  {/* <span className="position-absolute top-0 start-100 translate-middle rounded-circle py-1 px-2  bg-success">
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

  
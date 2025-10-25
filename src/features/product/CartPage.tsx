import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import {
  fetchCartItems,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "./cartSlice";
import { Link, useNavigate } from "react-router";
import "./CartPage.css"; 
import Spinner from "../../components/common/Spinner";
import { FaLongArrowAltRight } from 'react-icons/fa';
import HelmetWrapper from "../../components/common/HelmetWrapper";

export default function CartPage(): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const total = items.reduce((sum, i) => sum + i.discount * i.quantity, 0);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartQuantity({ id, quantity }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading)
    return (
      <Spinner/>
    );

  if (items.length === 0)
    return (
      <div className="cart-empty"><img src="/Images/trolley.png" width={100} height={100} alt="" className="mx-4 mx-md-4" /> <span className="display-6">Your cart is empty.</span> </div>
    );

  return (
    <>
     <HelmetWrapper title="Cart" />


      <div className="cart-page py-4">
        <div className="container ">
            <h2 className="">My Cart</h2>
            <div className="cart-divider mb-4"></div>
          <div className="cart-grid">
            
            <div className="cart-section px-5">
              
              {items.map((item) => (
                <div key={item.id} className="cart-item d-flex align-items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="cart-item-img"
                  />
      
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.title}</h3>
                    <span className=" text-decoration-line-through">
                      ${((item.price * item.quantity)).toFixed(2)}
                    </span>
                  </div>
      
                  <div className="cart-quantity-group">
                    <div className="cart-quantity-controls align-items-center">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id!, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id!, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
      
                    
                  </div>
      
                  <div className="cart-item-total fw-semibold">
                    ${(item.discount * item.quantity).toFixed(2)}
                  </div>
                  <button
                      onClick={() => handleRemove(item.id!)}
                      className="main-color bg-transparent border-0"
                    >
                        <i className="fa-solid fa-trash m-1" />
                    </button>
                </div>
              ))}
          
            </div>
      
            
            <div className="order-summary mt-3">
              <h5 className="">Order Summary</h5>
              <div className="cart-divider"></div>
      
              <div className="order-subtotal mt-5">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
      
              <div className="order-total">
                <strong>Total</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
               <div className="cart-divider"></div>
                <div className="d-flex flex-column justify-content-between align-items-center ">
                  <button onClick={handleClear} className="btn btn-outline-success rounded-0 col-12  mt-4">  <i className="fa-solid fa-trash m-1" />Clear Cart</button>
                  <button onClick={handleCheckout} className="btn btn-success col-12 rounded-0 py-3 mt-3">
                  Checkout
                  </button>
                  <Link to="/products" className="btn btn-link mt-4 fs-5 main-color text-decoration-none">Continue Shopping<FaLongArrowAltRight/></Link>
                </div>
            
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

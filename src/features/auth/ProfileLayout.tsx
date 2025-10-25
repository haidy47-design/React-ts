import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, NavLink } from "react-router-dom";
import { FaUser, FaClipboardList, FaHome, FaSignOutAlt, FaBars, FaTimes, FaFacebookMessenger } from "react-icons/fa";
import "../../styles/auth.css";

export default function ProfileLayout(): React.ReactElement {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false); 

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="profile-container main-color">
      
      <div className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </div>

    
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <img
            src={
              user?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="avatar"
            className="drawer-avatar"
          />
          <h4>{user?.name ?? "Guest"}</h4>
          <p>{user?.email ?? "—"}</p>
        </div>

        <ul className="drawer-links mt-3">
          <li>
            <NavLink to="/profile/info" className="drawer-link" onClick={() => setIsOpen(false)}>
              <FaUser /> Update account
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile/messages" className="drawer-link" onClick={() => setIsOpen(false)}>
              <FaFacebookMessenger /> My Messages
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile/orders" className="drawer-link" onClick={() => setIsOpen(false)}>
              <FaClipboardList /> Orders
            </NavLink>
          </li>
          <li>
            <NavLink  to="/" className="drawer-link" onClick={() => setIsOpen(false)}>
              <FaHome /> Back to Home
            </NavLink>
          </li>
            <button onClick={handleLogout} className="logout-btn mt-5 col-12">
          <FaSignOutAlt /> Logout
        </button>
        </ul>
      </div>

      
      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
}

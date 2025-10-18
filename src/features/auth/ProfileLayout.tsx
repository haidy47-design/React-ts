import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { FaUser, FaClipboardList, FaHome, FaSignOutAlt } from "react-icons/fa";
import "../../styles/auth.css";

export default function ProfileLayout(): React.ReactElement {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

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
      
      <div className="drawer">
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

        <ul className="drawer-links">
          <li>
            <Link to="/profile/info" className="drawer-link">
              <FaUser /> Update account
            </Link>
          </li>
          <li>
            <Link to="/profile/orders" className="drawer-link">
            <FaClipboardList /> Orders
            </Link>

          </li>
          <li>
            <Link to="/" className="drawer-link">
              <FaHome /> Back to Home
            </Link>
          </li>
        </ul>

        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
         
        </button>
      </div>

      
      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
}
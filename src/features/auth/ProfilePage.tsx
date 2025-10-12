import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "../../styles/auth.css";

export default function ProfilePage(): React.ReactElement {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    oldPassword: "",
    password: "",
    "re-password": "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFormData((prev) => ({ ...prev, name: parsed.name || "" }));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("⚠️ User not found!");
      return;
    }

    const { name, oldPassword, password, "re-password": rePassword } = formData;

    
    if (!name && !password && !rePassword) {
      toast.error("⚠️ Please update at least one field.");
      return;
    }

    
    if (password || rePassword) {
      if (!oldPassword) {
        toast.error("❌ Enter your old password to change it.");
        return;
      }

      if (oldPassword !== user.password) {
        toast.error("❌ Old password is incorrect.");
        return;
      }

      if (password !== rePassword) {
        toast.error("❌ Passwords do not match.");
        return;
      }
    }

    try {
      
      const updatedFields: any = {};
      if (name && name !== user.name) updatedFields.name = name;
      if (password) {
        updatedFields.password = password;
        updatedFields["re-password"] = rePassword;
      }

      if (Object.keys(updatedFields).length === 0) {
        toast("⚠️ Nothing to update.");
        return;
      }

      
      const res = await axios.put(
        `https://68e83849f2707e6128ca32fb.mockapi.io/users/${user.id}`,
        updatedFields
      );

      const updatedUser = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("✅ Information updated successfully!");
      setFormData({ ...formData, oldPassword: "", password: "", "re-password": "" });
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Something went wrong while updating.");
    }
  };

  return (
    <div className="profile-page">
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <Toaster position="top-center" />

      <div className="profile-card">
        <div className="main">
          <img
            src={
              user?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="avatar"
            className="avatar"
          />
          <h2 className="profile-name">{user?.name ?? "Guest"}</h2>
          <p className="profile-email">{user?.email ?? "—"}</p>
          <p className="profile-date">
            Joined:{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "—"}
          </p>

          <button className="btn btn-danger w-100 mt-4" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <hr />

        <form className="password-info" onSubmit={handleUpdate}>
          <h5 className="text-center mb-3">Update Information</h5>

         
          <label className="auth-label">Name</label>
          <input
            type="text"
            name="name"
            className="auth-inputt"
            placeholder="Enter new name"
            onChange={handleChange}
          />

          
          <label className="auth-label">Old Password</label>
          <input
            type="password"
            name="oldPassword"
            className="auth-inputt"
            placeholder="Enter old password"
            value={formData.oldPassword}
            onChange={handleChange}
          />

          
          <label className="auth-label">New Password</label>
          <input
            type="password"
            name="password"
            className="auth-inputt"
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleChange}
          />

          
          <label className="auth-label">Re-enter Password</label>
          <input
            type="password"
            name="re-password"
            className="auth-inputt"
            placeholder="Confirm new password"
            value={formData["re-password"]}
            onChange={handleChange}
          />

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

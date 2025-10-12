import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import "../../styles/auth.css";
import { FaSignInAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setUser } from "../auth/authSlice";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .regex(/^[A-Z][a-z0-9]{3,8}$/, "Must start with uppercase and 4–9 chars"),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const { register, handleSubmit, formState } = form;

  const handleLogin = async (values: LoginForm) => {
    if (loading) return;
    setLoading(true);

    try {
      const { data } = await axios.get("https://68e83849f2707e6128ca32fb.mockapi.io/users");

      const user = data.find(
        (u: any) =>
          u.email.toLowerCase() === values.email.toLowerCase() &&
          u.password === values.password
      );

      if (user) {
        dispatch(setUser(user)); 
        toast.success("✅ Logged in successfully!");
        setTimeout(() => navigate("/home"), 1200);
      } else {
        toast.error("❌ Invalid email or password!");
      }
    } catch (err) {
      const e = err as AxiosError;
      console.error(e);
      toast.error("⚠️ Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <Toaster position="top-center" />

      <div className="auth-container">
        <div className="auth-overlay" />
        <div className="auth-card">
          <h2 className="auth-title">
            <FaSignInAlt /> Welcome Back
          </h2>
          <p className="auth-subtitle">Please enter your details to sign in</p>

          <form onSubmit={handleSubmit(handleLogin)}>
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              {...register("email")}
            />
            {formState.errors.email && (
              <div className="error-message">{formState.errors.email.message}</div>
            )}

            <label className="auth-label mt-3">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              {...register("password")}
            />
            {formState.errors.password && (
              <div className="error-message">{formState.errors.password.message}</div>
            )}

            <button className="auth-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-3">
            Don’t have an account?{" "}
            <span className="auth-link" onClick={() => navigate("/signup")}>
              Register
            </span>
          </p>

          <p className="auth-link mt-2" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </p>
        </div>
      </div>
    </>
  );
}

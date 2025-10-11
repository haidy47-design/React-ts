import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/auth.css";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>("");
  const form = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const { register, handleSubmit, formState } = form;

  const handleForgot = async (values: ForgotForm) => {
  try {
    const { data } = await axios.get("https://68e83849f2707e6128ca32fb.mockapi.io/users");
    const user = data.find((u: any) => u.email.toLowerCase() === values.email.toLowerCase());

    if (user) {
      toast.success("📩 Email found! Redirecting...");
      setTimeout(() => navigate(`/reset-password?email=${values.email}`), 1500);
    } else {
      toast.error("❌ Email not found. Please check again.");
    }
  } catch (error) {
    toast.error("⚠️ Something went wrong. Try again later.");
    console.error(error);
  }
};


  return (
    <>
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>
      <Toaster position="top-center" />

      <div className="auth-container">
        <div className="auth-overlay" />
        <div className="auth-card">
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Enter your email to reset your password</p>

          <form onSubmit={handleSubmit(handleForgot)}>
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

            
            {serverError && <div className="error-message">{serverError}</div>}

            <button className="auth-btn" type="submit">
              Send Reset Link
            </button>
          </form>

          <p className="mt-3">
            Back to{" "}
            <span className="auth-link" onClick={() => navigate("/login")}>
              Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import "../../styles/auth.css";
import { showErrorAlert, showSuccessAlert } from "../../components/common/CustomSwal";

const schema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    age: z.number().min(1, "Age is required"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .regex(/^[A-Z][a-z0-9]{3,8}$/, "Must start with uppercase and 4–9 chars"),
    "re-password": z.string(),
  })
  .refine((data) => data.password === data["re-password"], {
    message: "Passwords must match",
    path: ["re-password"],
  });

type RegisterForm = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      age: 0,
      email: "",
      password: "",
      "re-password": "",
    },
  });

  const { register, handleSubmit, formState } = form;

  const handleRegister = async (values: RegisterForm) => {
    if (loading) return;
    setLoading(true);

    try {
       const userData = { ...values, role: "user" };
      await axios.post("https://68e83849f2707e6128ca32fb.mockapi.io/users", userData);
      showSuccessAlert("Account created!");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
    showErrorAlert("Failed to register. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register</title>
      </Helmet>
      <Toaster position="top-center" />

      <div className="auth-container">
        <div className="auth-overlay" />
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us and start managing your tasks</p>

          <form onSubmit={handleSubmit(handleRegister)}>
            <label className="auth-label">Full Name</label>
            <input className="auth-input" placeholder="Your name" {...register("name")} />
            {formState.errors.name && (
              <div className="error-message">{formState.errors.name.message}</div>
            )}

            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Your email"
              {...register("email")}
            />
            {formState.errors.email && (
              <div className="error-message">{formState.errors.email.message}</div>
            )}

            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              {...register("password")}
            />
            {formState.errors.password && (
              <div className="error-message">{formState.errors.password.message}</div>
            )}

            <label className="auth-label">Re-enter Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Re-enter password"
              {...register("re-password")}
            />
            {formState.errors["re-password"] && (
              <div className="error-message">{formState.errors["re-password"].message}</div>
            )}

            <label className="auth-label">Age</label>
            <input
              type="number"
              className="auth-input"
              placeholder="Your age"
              {...register("age", { valueAsNumber: true })}
            />
            {formState.errors.age && (
              <div className="error-message">{formState.errors.age.message}</div>
            )}

            <button className="auth-btn" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="mt-3">
            Already have an account?{" "}
            <span className="auth-link" onClick={() => navigate("/login")}>
              Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
}



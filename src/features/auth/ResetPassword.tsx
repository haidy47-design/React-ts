import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../../styles/auth.css";
import { showErrorAlert, showSuccessAlert } from "../../components/common/CustomSwal";
import HelmetWrapper from "../../components/common/HelmetWrapper";

const schema = z
  .object({
    newPassword: z
      .string()
      .regex(/^[A-Z][a-z0-9]{3,8}$/, "Must start with uppercase and 4–9 chars"),
    "re-password": z.string(),
  })
  .refine((data) => data.newPassword === data["re-password"], {
    message: "Passwords must match",
    path: ["re-password"],
  });

type ResetForm = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const form = useForm<ResetForm>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", "re-password": "" },
  });
  const { register, handleSubmit, formState } = form;

  const handleReset = async (values: ResetForm) => {
    try {
      
      const { data } = await axios.get(
        "https://68e83849f2707e6128ca32fb.mockapi.io/users"
      );

      const user = data.find(
        (u: any) => u.email.toLowerCase() === email?.toLowerCase()
      );

      if (!user) {
        showErrorAlert(" No email found. Please request a password reset again.");
        return;
      }

      
      const updatedUser = {
        ...user,
        password: values.newPassword,
        "re-password": values["re-password"],
      };

      await axios.put(
        `https://68e83849f2707e6128ca32fb.mockapi.io/users/${user.id}`,
        updatedUser
      );

      
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showSuccessAlert("Password updated successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error("⚠️ Something went wrong. Try again later.");
      console.error(error);
    }
  };

  return (
    <>
        <HelmetWrapper title="Reset Password" />
      <Toaster position="top-center" />

      <div className="auth-container">
        <div className="auth-overlay" />
        <div className="auth-card">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Set a new password for your account</p>

          <form onSubmit={handleSubmit(handleReset)}>
            <label className="auth-label">New Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Enter new password"
              {...register("newPassword")}
            />
            {formState.errors.newPassword && (
              <div className="error-message">
                {formState.errors.newPassword.message}
              </div>
            )}

            <label className="auth-label">Re-enter Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Re-enter new password"
              {...register("re-password")}
            />
            {formState.errors["re-password"] && (
              <div className="error-message">
                {formState.errors["re-password"].message}
              </div>
            )}

            <button className="auth-btn" type="submit">
              Reset Password
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

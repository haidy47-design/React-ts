import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "../../components/common/Spinner";
import HelmetWrapper from "../../components/common/HelmetWrapper";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage(): React.ReactElement {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700));
    alert("Reset link sent (mocked)");
  };
  return (
    <div className="container py-4">
      <HelmetWrapper title="Forgot Password" />
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h4 className="mb-3 text-center">Forgot Password</h4>
              {isSubmitting && <Spinner />}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className={`form-control ${errors.email ? "is-invalid" : ""}`} {...register("email")} />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>
                <button className="btn btn-primary w-100" disabled={isSubmitting}>Send Reset Link</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "../../components/common/Spinner";
import HelmetWrapper from "../../components/common/HelmetWrapper";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
type FormValues = z.infer<typeof schema>;

export default function SignupPage(): React.ReactElement {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    alert("Account created locally. Use Login to authenticate.");
  };

  return (
    <div className="container py-4">
      <HelmetWrapper title="Sign Up" />
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h4 className="mb-3 text-center">Create account</h4>
              {isSubmitting && <Spinner />}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className={`form-control ${errors.name ? "is-invalid" : ""}`} {...register("name")} />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} {...register("email")} />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className={`form-control ${errors.password ? "is-invalid" : ""}`} {...register("password")} />
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>
                <button className="btn btn-primary w-100" disabled={isSubmitting} type="submit">Create</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



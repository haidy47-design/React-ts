import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { setCredentials } from "./authSlice";
import Spinner from "../../components/common/Spinner";
import HelmetWrapper from "../../components/common/HelmetWrapper";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await axios.post("https://notes-mrp9.onrender.com/signin", values);
      return res.data as { token: string };
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.token }));
      const to = (location.state as any)?.from?.pathname ?? "/";
      navigate(to, { replace: true });
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="container py-4">
      <HelmetWrapper title="Login" />
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h4 className="mb-3 text-center">Welcome back</h4>
              {mutation.isPending && <Spinner />}
              <form onSubmit={handleSubmit(onSubmit)} className="needs-validation" noValidate>
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
                {mutation.isError && (
                  <div className="alert alert-danger">Login failed. Please check your credentials.</div>
                )}
                <button className="btn btn-primary w-100" disabled={mutation.isPending} type="submit">Login</button>
              </form>
              <div className="d-flex justify-content-between mt-3 small">
                <Link to="/forgot-password">Forgot password?</Link>
                <Link to="/signup">Create account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



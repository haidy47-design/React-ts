import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/contact.css";
import { showErrorAlert, showSuccessAlert } from "../../components/common/CustomSwal";
import z from "zod";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import HelmetWrapper from "../../components/common/HelmetWrapper";



export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  let userEmail: string | null = null;
  let userID: string | null = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user) {
        userEmail = parsed.user.email ?? null;
        userID = parsed.user.id ?? null;
      } else {
        userEmail = parsed?.email ?? null;
        userID = parsed?.id ?? null;
      }
    }
  } catch (err) {
    console.warn("Failed to parse user from localStorage", err);
  }


  const createSchema = (expectedEmail: string | null) =>
    z
      .object({
        firstName: z.string().min(3, "First name must be at least 3 characters"),
        lastName: z.string().min(3, "Last name must be at least 3 characters"),
        email: z.string().email("Invalid email"),
        subject: z.string().regex(/^[A-Za-z\s]+$/, "Subject must contain only letters").optional(),
        message: z.string().min(10, "Message must be at least 10 characters"),
      })
      .refine((data) => {
        if (!expectedEmail) return false;
        return data.email === expectedEmail;
      }, {
        message: "Email must match your logged-in account email",
        path: ["email"],
      });

  const schema = createSchema(userEmail);

  type ContactForm = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: userEmail ?? "",
      subject: "",
      message: "",
    },
  });


  const handleFormSubmit = async (values: ContactForm) => {
    if (loading) return;
    setLoading(true);

    try {
  
      await axios.post("https://68f17bc0b36f9750dee96cbb.mockapi.io/contact", {
        ...values,
        replay: "unRead",
        userId: userID ?? "unknown", 
      });

      showSuccessAlert("Thank you, your message has been sent.");
      reset();
    } catch (error) {
      showErrorAlert("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <HelmetWrapper title="Countact Us" />
      <section className="contact-section py-5">
        <div className="container">
      
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center contact-title mb-5"
          >
            Contact Us
          </motion.h2>
      
      
          <div className="row rounded overflow-hidden">
      
      
            <motion.div
              className="col-12 col-md-6 p-5"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h5 className="text-center mb-4 fw-semibold text-dark">
                We’re Here for Any Question
              </h5>
      
              <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                    <input
                      type="text"
                      className={`form-control border-0 border-bottom rounded-0 ${
                        errors.firstName ? "is-invalid" : ""
                      }`}
                      placeholder="First Name *"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName.message}</div>
                    )}
                  </div>
      
                  <div className="col-12 col-md-6 mb-3">
                    <input
                      type="text"
                      className={`form-control border-0 border-bottom rounded-0 ${
                        errors.lastName ? "is-invalid" : ""
                      }`}
                      placeholder="Last Name *"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName.message}</div>
                    )}
                  </div>
                </div>
      
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
      
                    <input
                      type="email"
                      readOnly
                      className={`form-control border-0 border-bottom rounded-0 ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      placeholder="Email *"
                      {...register("email")}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email.message}</div>
                    )}
      
                    {!userEmail && (
                      <small className="text-warning">
                        No logged-in email found. Please log in first.
                      </small>
                    )}
                  </div>
      
                  <div className="col-12 col-md-6 mb-3">
                    <input
                      type="text"
                      className="form-control border-0 border-bottom rounded-0"
                      placeholder="Subject"
                      {...register("subject")}
                    />
                  </div>
                </div>
      
                <div className="mb-3">
                  <textarea
                    rows={3}
                    className={`form-control border-0 border-bottom rounded-0 ${
                      errors.message ? "is-invalid" : ""
                    }`}
                    placeholder="Leave us a message..."
                    {...register("message")}
                  />
                  {errors.message && (
                    <div className="invalid-feedback">{errors.message.message}</div>
                  )}
                </div>
      
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-grid">
                  <button type="submit" className="btn btn-success py-2 rounded-0" disabled={loading}>
                    {loading ? "Sending..." : "Submit"}
                  </button>
                </motion.div>
              </form>
      
      
              <div className="row mt-5 text-center text-md-start">
                <div className="col-12 col-md-6">
                  <h6 className="fw-semibold">Address</h6>
                  <p className="mb-0">500 Terry Francine St.</p>
                  <p>SF, CA 94158</p>
                </div>
                <div className="col-12 col-md-6">
                  <h6 className="fw-semibold">Info</h6>
                  <p className="mb-0">123-456-7890</p>
                  <p>info@mysite.com</p>
                </div>
              </div>
            </motion.div>
            
      
            <motion.div
              className="col-12 col-md-6 p-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <img
                src="/Images/contactUs.jpg"
                alt="Contact illustration"
                className="rounded-4"
                style={{ width: "100%", height: "600px", filter: "brightness(0.9)" }}
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

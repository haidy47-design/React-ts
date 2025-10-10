import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/contact.css";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

const Contact: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Form Submitted:", data);
    alert("✅ Thank you! Your message has been sent.");
    reset();
  };

  return (
    <section className="contact-section py-5">
      <div className="container">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center contact-title mb-5"
        >
          Contact Us
        </motion.h2>

        <div className="row shadow-sm bg-white rounded overflow-hidden">
          {/* Left Column - Form */}
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

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <input
                    type="text"
                    className={`form-control border-0 border-bottom rounded-0 ${
                      errors.firstName ? "is-invalid" : ""
                    }`}
                    placeholder="First Name *"
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">
                      {errors.firstName.message}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6 mb-3">
                  <input
                    type="text"
                    className={`form-control border-0 border-bottom rounded-0 ${
                      errors.lastName ? "is-invalid" : ""
                    }`}
                    placeholder="Last Name *"
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">
                      {errors.lastName.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <input
                    type="email"
                    className={`form-control border-0 border-bottom rounded-0 ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Email *"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email format",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email.message}
                    </div>
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
                  {...register("message", {
                    required: "Message is required",
                  })}
                ></textarea>
                {errors.message && (
                  <div className="invalid-feedback">
                    {errors.message.message}
                  </div>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="d-grid"
              >
                <button
                  type="submit"
                  className="btn btn-outline-custom py-2 rounded-0"
                >
                  Submit
                </button>
              </motion.div>
            </form>

            {/* Address & Info */}
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

          {/* Right Column - Image */}
          <motion.div
            className="col-12 col-md-6 p-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <img
              src="/Images/contact.jpg" 
              alt="Flowers"
              className="img-fluid w-100 h-100 object-fit-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

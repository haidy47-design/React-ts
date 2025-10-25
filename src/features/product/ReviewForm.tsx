import React, { useState } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";


const reviewSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  rate: z.number().min(1, "Rate is required").max(5),
  reviewTitle: z.string().min(3, "Title is required"),
  overall: z.string().min(5, "Overall feedback is required"),
  productID: z.string().min(1, "Product ID required"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export interface ReviewResponse extends ReviewFormData {
  id: string;
  createdAt: string;
}

const ReviewForm: React.FC<{ productID: string }> = ({ productID }) => {
  const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      email: "",
      rate: 1,
      reviewTitle: "",
      overall: "",
      productID,
    },
  });

    const queryClient = useQueryClient();

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setLoading(true);
      await axios.post("https://68f17bc0b36f9750dee96cbb.mockapi.io/reviews", {
        ...data,
        createdAt: new Date().toISOString(),
      });
      toast.success("Review submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews", productID] });
      
      reset({
        name: "",
        email: "",
        rate: 1,
        reviewTitle: "",
        overall: "",
        productID,
      });
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to submit review. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-12 col-lg-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" p-4 shadow-lg rounded-4 border-0"
        >
        <h5 className="mb-3 text-center">Write Your Review</h5>

       
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            {...register("name")}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Enter your name"
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </div>

        
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            {...register("email")}
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email.message}</div>
          )}
        </div>

       
        <div className="mb-3">
          <label className="form-label d-block">Rate</label>
          <Controller
            name="rate"
            control={control}
            render={({ field }) => (
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fa-solid fa-star fs-3 me-2 ${
                      star <= field.value ? "text-warning" : "text-secondary"
                    }`}
                    style={{ 
                      cursor: "pointer", 
                      transition: "all 0.2s ease",
                      opacity: star <= field.value ? 1 : 0.3
                    }}
                    onClick={() => field.onChange(star)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  ></i>
                ))}
              </div>
            )}
          />
          {errors.rate && (
            <p className="text-danger small mt-2">{errors.rate.message}</p>
          )}
        </div>

        
        <div className="mb-3">
          <label className="form-label">Review Title</label>
          <input
            {...register("reviewTitle")}
            className={`form-control ${
              errors.reviewTitle ? "is-invalid" : ""
            }`}
            placeholder="Short title for your review"
          />
          {errors.reviewTitle && (
            <div className="invalid-feedback">
              {errors.reviewTitle.message}
            </div>
          )}
        </div>

      
        <div className="mb-3">
          <label className="form-label">Overall Review</label>
          <textarea
            {...register("overall")}
            className={`form-control ${errors.overall ? "is-invalid" : ""}`}
            rows={3}
            placeholder="Write your detailed feedback"
          ></textarea>
          {errors.overall && (
            <div className="invalid-feedback">{errors.overall.message}</div>
          )}
        </div>

        
        <input type="hidden" {...register("productID")} value={productID} />

        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>

        {success && (
          <div className="alert alert-success mt-3 text-center">
            Review submitted successfully!
          </div>
        )}
              </form>
      </div>
    </div>
  );
};

export default ReviewForm;
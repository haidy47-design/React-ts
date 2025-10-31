import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../api";
import { showSuccessAlert, showErrorAlert } from "../../../components/common/CustomSwal";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import HelmetWrapper from "../../../components/common/HelmetWrapper";


const productFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z
    .number({ message: "Price must be a number" })
    .positive("Price must be greater than 0"),
  category: z.string().min(2, "Category is required"),
  image: z.string().url("Must be a valid image URL"),
  stock: z
    .number({ message: "Stock must be a number" })
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative"),
  discountPercentage: z
    .number({ message: "Discount must be a number" })
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100"),
});

type ProductFormData = z.infer<typeof productFormSchema>;


interface ProductPayload {
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  discount: number; 
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccessAlert("Product created successfully!");
      navigate("/admin/products");
    },
    onError: (error) => {
      console.error("Failed to create product:", error);
      showErrorAlert("Failed to create product!");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      image: "",
      price: 0,
      stock: 0,
      discountPercentage: 0,
    },
  });

  const onSubmit = (data: ProductFormData) => {

    const discountAmount = (data.price * data.discountPercentage) / 100;
    const priceAfterDiscount = data.price - discountAmount;
    
    const payload: ProductPayload = {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      stock: data.stock,
      discount: parseFloat(priceAfterDiscount.toFixed(2)), 
    };

    mutation.mutate(payload);
  };

  return (
    <>
    <HelmetWrapper title="Add Product" />
      <div className="container mt-4">
        <h3 style={{ color: "#79253D" }}>Add Product</h3>
      
        <Form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded-4 shadow-sm mt-4">
          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                {...register("title")} 
                isInvalid={!!errors.title}
                placeholder="Enter product title"
              />
              <Form.Control.Feedback type="invalid">
                {errors.title?.message}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                {...register("description")} 
                isInvalid={!!errors.description}
                placeholder="Enter product description"
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>
            
          </div>
          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Category</Form.Label>
              <Form.Control 
                {...register("category")} 
                isInvalid={!!errors.category}
                placeholder="e.g., Roses, Lilies"
              />
              <Form.Control.Feedback type="invalid">
                {errors.category?.message}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Image URL</Form.Label>
              <Form.Control 
                {...register("image")} 
                isInvalid={!!errors.image}
                placeholder="https://example.com/image.jpg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.image?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
      
        <div className="row">
            <Form.Group className="mb-3 col-12 col-md-4">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01" 
                min="0"
                {...register("price", { valueAsNumber: true })} 
                isInvalid={!!errors.price}
                placeholder="0.00"
              />
              <Form.Control.Feedback type="invalid">
                {errors.price?.message}
              </Form.Control.Feedback>
            </Form.Group>
          
            <Form.Group className="mb-3 col-12 col-md-4">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control 
                type="number" 
                min="0"
                {...register("stock", { valueAsNumber: true })} 
                isInvalid={!!errors.stock}
                placeholder="0"
              />
              <Form.Control.Feedback type="invalid">
                {errors.stock?.message}
              </Form.Control.Feedback>
            </Form.Group>
          
            <Form.Group className="mb-3 col-12 col-md-4">
              <Form.Label>Discount Percentage (%)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("discountPercentage", { valueAsNumber: true })}
                isInvalid={!!errors.discountPercentage}
                placeholder="0"
              />
              <Form.Control.Feedback type="invalid">
                {errors.discountPercentage?.message}
              </Form.Control.Feedback>
              
            </Form.Group>
        </div>
      
          <div className="d-flex justify-content-between mt-4">
            <Button type="submit" variant="success" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Add Product"}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/admin/products")}>
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default AddProduct;
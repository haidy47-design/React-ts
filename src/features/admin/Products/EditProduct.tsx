import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Button, Spinner } from "react-bootstrap";
import { fetchProducts, updateProduct } from "../api";
import { Product } from "src/components/product/ProductCard";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../components/common/CustomSwal";

const editProductSchema = z.object({
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

type EditProductForm = z.infer<typeof editProductSchema>;

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const product = products?.find((p) => p.id === id);

  const mutation = useMutation({
    mutationFn: (data: Partial<Product>) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccessAlert("Product updated successfully");
      navigate("/admin/products");
    },
    onError: () => {
      showErrorAlert("Failed to update product!");
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProductForm>({
    resolver: zodResolver(editProductSchema),
  });

  const watchPrice = watch("price", 0);
  const watchDiscount = watch("discountPercentage", 0);

  // ✅ السعر بعد الخصم كـ number
  const priceAfterDiscount = Number(
    (watchPrice - (watchPrice * watchDiscount) / 100).toFixed(2)
  );

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description,
        category: product.category,
        image: product.image,
        price: product.price,
        stock: product.stock,
        discountPercentage: 0,
      });
    }
  }, [product, reset]);

  const onSubmit = (data: EditProductForm) => {
    const discountedValue = Number(
      (data.price - (data.price * data.discountPercentage) / 100).toFixed(2)
    );

    const updatedProduct: Partial<Product> = {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      stock: data.stock,
      discount: discountedValue, 
    };

    mutation.mutate(updatedProduct);
  };

  if (isLoading || !product) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <h3 className="mb-4" style={{ color: "#79253D" }}>
        Edit Product
      </h3>
    <div className="row bg-white p-0 p-md-4 rounded-4 shadow-sm">
       <img src={product.image} style={{height:"350px"}} className="col-12 col-md-4 rounded-4 mt-4"></img>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-4  col-12 col-md-8"
        >
          <Form.Group className="mb-3 ">
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
      
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register("description")}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description?.message}
            </Form.Control.Feedback>
          </Form.Group>
      
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              {...register("category")}
              isInvalid={!!errors.category}
            />
            <Form.Control.Feedback type="invalid">
              {errors.category?.message}
            </Form.Control.Feedback>
          </Form.Group>
      
          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              {...register("image")}
              isInvalid={!!errors.image}
            />
            <Form.Control.Feedback type="invalid">
              {errors.image?.message}
            </Form.Control.Feedback>
          </Form.Group>
      
          <Form.Group className="mb-3">
            <Form.Label>Price ($)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              {...register("price", { valueAsNumber: true })}
              isInvalid={!!errors.price}
            />
            <Form.Control.Feedback type="invalid">
              {errors.price?.message}
            </Form.Control.Feedback>
          </Form.Group>
      
          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              min="0"
              {...register("stock", { valueAsNumber: true })}
              isInvalid={!!errors.stock}
            />
            <Form.Control.Feedback type="invalid">
              {errors.stock?.message}
            </Form.Control.Feedback>
          </Form.Group>
      
          <Form.Group className="mb-3">
            <Form.Label>Discount Percentage (%)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("discountPercentage", { valueAsNumber: true })}
              isInvalid={!!errors.discountPercentage}
            />
            <Form.Control.Feedback type="invalid">
              {errors.discountPercentage?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              The discounted price will be saved automatically in the "discount" field.
            </Form.Text>
          </Form.Group>
      
        
          <div className="alert alert-info mt-3">
            <strong>Price after discount:</strong> ${priceAfterDiscount}
          </div>
      
          <div className="d-flex justify-content-between mt-4">
            <Button
              type="submit"
              variant="success"
              disabled={isSubmitting || mutation.isPending}
            >
              {isSubmitting || mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
      
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </Button>
          </div>
        </Form>
    </div>
    </div>
  );
};

export default EditProduct;

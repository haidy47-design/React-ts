import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { placeOrder } from "./orderSlice";
import { clearCart, fetchCartItems } from "../product/cartSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "../../components/common/Spinner";
import { showSuccessAlert } from "../../components/common/CustomSwal";

const schema = z.object({
  name: z.string().min(3, "Name is required").max(30, "Max 30 chars"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().regex(/^01[0-2,5][0-9]{8}$/, "Invalid Egyptian phone number"),
  age: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof schema>;

export default function CheckoutPage(): React.ReactElement {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ للتحكم في الزر

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.discount * i.quantity, 0),
    [items]
  );

  useEffect(() => {
    const loadCart = async () => {
      try {
        await dispatch(fetchCartItems());
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [dispatch]);

  const form = useForm<CheckoutFormData>({
    defaultValues: {
      name: "",
      email: "",
      address: "",
      phone: "",
      age: "",
    },
    resolver: zodResolver(schema),
  });

  const { register, handleSubmit, formState, reset } = form;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!items.length) {
      toast.error("Your cart is empty!");
      return;
    }

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (!currentUser) {
      toast.error("Please login first");
      return;
    }

    setIsSubmitting(true); // ✅ منع الضغط المتكرر

    const orderData = {
      createdAt: new Date().toISOString(),
      userID: currentUser.id,
      totalPrice: total.toFixed(2),
      status: "Pending",
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        discount: i.discount,
        image: i.image,
        category: i.category,
      })),
      address: data.address,
      userName: data.name,
      phone: data.phone,
    };

    try {
      await axios.post("https://68e43ee28e116898997b5bf8.mockapi.io/orders", orderData);

      // تحديث المخزون
      const updateStockPromises = items.map(async (item) => {
        try {
          const productId = item.productId || item.id;
          const response = await axios.get(
            `https://68e43ee28e116898997b5bf8.mockapi.io/product/${productId}`
          );

          const product = response.data;
          const currentStock = Number(product.stock) || 0;
          const orderQty = Number(item.quantity) || 0;
          const newStock = Math.max(0, currentStock - orderQty);

          return axios.put(
            `https://68e43ee28e116898997b5bf8.mockapi.io/product/${productId}`,
            { ...product, stock: newStock }
          );
        } catch (error) {
          console.error(`❌ Error updating stock for ${item.id}:`, error);
          return null;
        }
      });

      await Promise.all(updateStockPromises);

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });

      dispatch(placeOrder({ items, total }));
      dispatch(clearCart());
      reset();

      showSuccessAlert("Ordered Successfully");
      setTimeout(() => navigate("/orders"), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while placing your order.");
    } finally {
      setIsSubmitting(false); // ✅ فك القفل بعد الانتهاء
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container py-3 py-md-4 py-lg-4" style={{ minHeight: "100vh" }}>
      <h2 className="col-12 mb-4 pb-3 border-bottom border-secondary border-opacity-50">
        Checkout
      </h2>

      <div className="row ms-lg-5 justify-content-center justify-content-md-between">

        {/* 🧾 Order Summary */}
        {items.length === 0 ? (
          <div className="text-center py-5 text-secondary p-lg-4 mb-lg-4 ms-lg-4 col-11 col-md-7 col-lg-6 col-xl-6 mt-3 mt-md-0">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div className="p-lg-4 mb-lg-4 ms-lg-4 col-11 col-md-5 col-lg-5 col-xl-5 mt-5 mt-md-3">
            <h5 className="mb-3 text-secondary">Order Summary</h5>
            {items.map((item) => (
              <div
                key={item.id}
                className="d-flex justify-content-between align-items-center py-3 border-bottom border-secondary border-opacity-50"
              >
                <div className="d-flex align-items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="me-3"
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <div>{item.title}</div>
                    <div className="text-muted small">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div>${(item.discount * item.quantity).toFixed(2)}</div>
              </div>
            ))}

            <div className="d-flex justify-content-between mt-3">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="fs-5 border-top border-secondary border-opacity-50 mt-3 py-2 d-flex justify-content-between border-bottom">
              <span>Total</span>
              <span className="fw-semibold">${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* 👤 Checkout Form */}
        <div className="py-lg-4 mb-lg-4 ms-lg-0 mt-3 mt-md-2 col-11 col-md-5 col-lg-5 col-xl-5 ">
          <h5 className="mb-3 text-secondary">User Details</h5>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control rounded-0"
                {...register("name")}
                id="name"
                placeholder="Name"
              />
              <label htmlFor="name">Name</label>
              {formState.errors.name && (
                <p className="alert alert-danger p-1 mt-1 text-center">
                  {formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control rounded-0"
                {...register("email")}
                id="email"
                placeholder="Email"
              />
              <label htmlFor="email">Email</label>
              {formState.errors.email && (
                <p className="alert alert-danger p-1 mt-1 text-center">
                  {formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control rounded-0"
                {...register("address")}
                id="address"
                placeholder="Address"
              />
              <label htmlFor="address">Address</label>
              {formState.errors.address && (
                <p className="alert alert-danger p-1 mt-1 text-center">
                  {formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control rounded-0"
                {...register("phone")}
                id="phone"
                placeholder="Phone"
              />
              <label htmlFor="phone">Phone</label>
              {formState.errors.phone && (
                <p className="alert alert-danger p-1 mt-1 text-center">
                  {formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* ✅ الزرار داخل الفورم */}
            <button
              type="submit"
              disabled={!items.length || isSubmitting}
              className="btn col-12 px-4 py-2 rounded-0 btn-success mt-3"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

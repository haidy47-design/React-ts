import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { placeOrder } from "./orderSlice";
import { clearCart, fetchCartItems } from "../product/cartSlice";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query"; // ✅ استيراد useQueryClient

// ✅ تحديث الـ schema لقبول رقم مصري فقط
const schema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Max 30 chars"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
  phone: z
    .string()
    .regex(/^01[0-2,5][0-9]{8}$/, "Invalid Egyptian phone number"),
  age: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof schema>;

export default function CheckoutPage(): React.ReactElement {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); 

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );


   useEffect(() => {
    dispatch(fetchCartItems());
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

    const orderData = {
      createdAt: new Date().toISOString(),
      userID: currentUser.id,
      totalPrice: total.toFixed(2),
      status: "Pending",
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
        category: i.category,
      })),
      address: data.address,
      userName: data.name,
      phone: data.phone,
    };

    try {
      await axios.post(
        "https://68e43ee28e116898997b5bf8.mockapi.io/orders",
        orderData
      );


queryClient.invalidateQueries({ queryKey: ["orders"] });


      dispatch(placeOrder({ items, total }));
      dispatch(clearCart());
      reset();

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } transition-all duration-300 bg-white shadow-lg rounded-4 border py-4 px-5 text-center`}
            style={{
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              className="rounded-circle bg-success d-flex align-items-center justify-content-center"
              style={{ width: "50px", height: "50px" }}
            >
              <span style={{ fontSize: "24px", color: "white" }}>✔</span>
            </div>
            <h5 className="fw-semibold mt-2 mb-1 text-dark">Order Successful!</h5>
            <p className="text-muted mb-0">
              Your order has been placed successfully.
            </p>
          </div>
        ),
        { duration: 2000, position: "top-right" }
      );

      setTimeout(() => navigate("/orders"), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while placing your order.");
    }
  };

  return (
    <div className="container py-3 py-md-4 py-lg-4" style={{ minHeight: "100vh" }}>
      <Toaster position="top-center" reverseOrder={false} />

      <h3 className="col-12 mb-4 pb-3 border-bottom border-secondary border-opacity-50">
        Checkout
      </h3>

      <div className="row ms-lg-5 justify-content-center justify-content-md-between">
        {/* 🧾 Order Summary */}
        {items.length === 0 ? (
          <div className="text-center py-5 text-secondary p-lg-4 mb-lg-4 ms-lg-4 col-11 col-md-7 col-lg-6 col-xl-6 mt-3 mt-md-0">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div className="p-lg-4 mb-lg-4 ms-lg-4 col-11 col-md-7 col-lg-6 col-xl-6 mt-3 mt-md-0">
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
                <div>${(item.price * item.quantity).toFixed(2)}</div>
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
            <div className="border-top border-secondary border-opacity-50 mt-2 py-2 d-flex justify-content-between fw-semibold border-bottom">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* 👤 Checkout Form */}
        <div className="p-lg-4 mb-lg-4 ms-lg-5 mt-5 mt-md-2 col-11 col-md-4 col-lg-5 col-xl-5">
          <h5 className="mb-3 text-secondary">User Details</h5>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
            <div className="form-floating mb-3">
              <input type="text" className="form-control rounded-0" {...register("name")} id="name" placeholder="Name" />
              <label htmlFor="name">Name</label>
              {formState.errors.name && <p className="alert alert-danger p-1 mt-1 text-center">{formState.errors.name.message}</p>}
            </div>

            <div className="form-floating mb-3">
              <input type="email" className="form-control rounded-0" {...register("email")} id="email" placeholder="Email" />
              <label htmlFor="email">Email</label>
              {formState.errors.email && <p className="alert alert-danger p-1 mt-1 text-center">{formState.errors.email.message}</p>}
            </div>

            <div className="form-floating mb-3">
              <input type="text" className="form-control rounded-0" {...register("address")} id="address" placeholder="Address" />
              <label htmlFor="address">Address</label>
              {formState.errors.address && <p className="alert alert-danger p-1 mt-1 text-center">{formState.errors.address.message}</p>}
            </div>

            {/* ✅ حقل الموبايل المصري */}
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

            <div className="text-end">
              <button
                disabled={!items.length}
                className="btn px-4 py-2 rounded-0 btn-success"
              >
                Place Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

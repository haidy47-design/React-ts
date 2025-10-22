import Swal from "sweetalert2";
import type { NavigateFunction } from "react-router-dom";

/* ✅ Success Alert */
export const showSuccessAlert = (message: string) => {
  Swal.fire({
    icon: "success",
    title: "Success!",
    iconColor: "#79253D",
    text: message,
    confirmButtonColor: "#79253D",
    timer: 2000,
    showConfirmButton: false,
  });
};

/* ❌ Error Alert */
export const showErrorAlert = (message: string) => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    confirmButtonColor: "#ef4444",
  });
};

/* ⚠️ Confirm Alert */
export const showConfirmAlert = async (message: string) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#79253D",
    cancelButtonColor: "gray",
    confirmButtonText: "Yes",
  });
  return result.isConfirmed;
};

/* 🟢 Login Success */
export const showLoginSuccess = (message = "You have successfully logged in!",name:string) => {
  Swal.fire({
    title: `Welcome Back ${name}`,
    text: message,
    icon: "success",
    iconColor: "#79253D",
    background: "#fff",
    color: "#333",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
};

/* 🔴 Login Error */
export const showLoginError = (message = "Invalid email or password.") => {
  Swal.fire({
    title: "Login Failed",
    text: message,
    icon: "error",
    iconColor: "#d33",
    confirmButtonText: "Try Again",
    confirmButtonColor: "#79253D",
    background: "#fff",
    color: "#333",
  });
};

/* ⚠️ Login Required */
export const showLoginRequired = (message = "Please login first", navigate?: NavigateFunction) => {
  Swal.fire({
    title: "Login Required ⚠️",
    text: message,
    icon: "warning",
    confirmButtonText: "Login Now",
    confirmButtonColor: "#79253D",
    showCancelButton: true,
    cancelButtonText: "Cancel",
    background: "#fff",
    color: "#333",
  }).then((result) => {
    if (result.isConfirmed && navigate) {
      setTimeout(() => {
        navigate("/login");
      }, 300);
    }
  });
};


import type { AppDispatch } from "../../app/store"; 
import { logoutUser } from "../../features/auth/authSlice";


export const showLogout = (navigate?: NavigateFunction, dispatch?: AppDispatch) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out from your account.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#79253D",
    cancelButtonColor: "gray",
    confirmButtonText: "Yes, log out",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      // 🔥 نظّف التخزين المحلي
      localStorage.removeItem("user");

      // 🔥 حدّث الـ Redux store لو متاح
      if (dispatch) {
        dispatch(logoutUser());
      }

      // ✅ رسالة نجاح
      showSuccessAlert("You have logged out successfully!");

      // ✅ رجّع المستخدم لصفحة الدخول
      if (navigate) {
        setTimeout(() => {
          navigate("/login");
        }, 500);
      }
    }
  });
};

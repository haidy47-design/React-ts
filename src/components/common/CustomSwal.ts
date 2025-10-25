import Swal from "sweetalert2";
import type { NavigateFunction } from "react-router-dom";


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


export const showErrorAlert = (message: string) => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    confirmButtonColor: "#ef4444",
  });
};


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


export const showLoginRequired = (message = "Please login first", navigate?: NavigateFunction) => {
  Swal.fire({
    title: "Login Required ",
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

      localStorage.removeItem("user");


      if (dispatch) {
        dispatch(logoutUser());
      }


      showSuccessAlert("You have logged out successfully!");

      
      if (navigate) {
        setTimeout(() => {
          navigate("/login");
        }, 500);
      }
    }
  });
};



export const showDiscountPrompt = async () => {
  const { value: discount } = await Swal.fire({
    title: "Apply Discount",
    input: "number",
    inputLabel: "Enter discount percentage (0 - 100)",
    inputAttributes: {
      min: "0",
      max: "100",
      step: "1",
    },
    showCancelButton: true,
    confirmButtonText: "Apply",
    cancelButtonText: "Cancel",
    inputValidator: (value) => {
      if (!value) return "Please enter a discount percentage!";
      if (isNaN(value) || value < 0 || value > 100)
        return "Discount must be between 0 and 100!";
    },
  });

  return discount ? Number(discount) : null;
};



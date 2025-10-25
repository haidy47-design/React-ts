import { Product } from "src/components/product/ProductCard";
import axiosInstance from "../../app/axiosInstance";
import { AdminOrder, AdminProduct, AdminUser } from "./types";
import { IOrder } from "../order/OrdersPage";
import { ReviewFormData, ReviewResponse } from "../product/ReviewForm";
import { Contact } from "./Contact/ContactUs";

const USERS_URL = "https://68e83849f2707e6128ca32fb.mockapi.io/users";
const PRODUCTS_URL = "https://68e43ee28e116898997b5bf8.mockapi.io/product";
const ORDERS_URL = "https://68e43ee28e116898997b5bf8.mockapi.io/orders";
const REVIEWS_URL= "https://68f17bc0b36f9750dee96cbb.mockapi.io/reviews"
const API_URL = "https://68f17bc0b36f9750dee96cbb.mockapi.io/contact";

 export const fetchContacts = async (): Promise<Contact[]> => {
  const { data } = await axiosInstance.get<Contact[]>(API_URL);
  return data;
};
export const sendReply = async (id: string, reply: string): Promise<void> => {
  await axiosInstance.put(`${API_URL}/${id}`, { replay: reply });
};
// Users
export const fetchUsers = async (): Promise<AdminUser[]> => {
  const { data } = await axiosInstance.get<AdminUser[]>(USERS_URL);
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${USERS_URL}/${id}`);
};

export const toggleBlockUser = async (id: string, blocked: boolean): Promise<AdminUser> => {
  const { data } = await axiosInstance.put<AdminUser>(`${USERS_URL}/${id}`, { blocked });
  return data;
};

// Products
export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axiosInstance.get<Product[]>(PRODUCTS_URL);
  return data;
};

export const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const { data } = await axiosInstance.post<Product>(PRODUCTS_URL, product);
  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const { data } = await axiosInstance.put<Product>(`${PRODUCTS_URL}/${id}`, product);
  return data;
};

export const applyDiscountForAllProducts = async (discount: number): Promise<void> => {

  const { data: products } = await axiosInstance.get<Product[]>(PRODUCTS_URL);

  await Promise.all(
    products.map((p) => {
      const discountAmount = (Number(p.price) * discount) / 100;
      const newPrice = Number(p.price) - discountAmount;

      return updateProduct(p.id, {
        discount: parseFloat(newPrice.toFixed(2)),
      });
    })
  );
};


export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${PRODUCTS_URL}/${id}`);
};

// Orders
export const fetchOrders = async (): Promise<IOrder[]> => {
  const { data } = await axiosInstance.get<IOrder[]>(ORDERS_URL);
  return data;
};

export const updateOrderStatus = async (id: string, status: IOrder["status"]): Promise<IOrder> => {
  const { data } = await axiosInstance.put<IOrder>(`${ORDERS_URL}/${id}`, { status });
  return data;
};

//Reviews
export const fetchReviews = async (): Promise<ReviewResponse[]> => {
  const { data } = await axiosInstance.get<ReviewResponse[]>(REVIEWS_URL);
  return data;
};



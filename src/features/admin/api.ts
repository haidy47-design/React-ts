import axiosInstance from "../../app/axiosInstance";
import { AdminOrder, AdminProduct, AdminUser } from "./types";

const USERS_URL = "https://68e83849f2707e6128ca32fb.mockapi.io/users";
const PRODUCTS_URL = "https://68e43ee28e116898997b5bf8.mockapi.io/product";
const ORDERS_URL = "https://68e43ee28e116898997b5bf8.mockapi.io/orders";

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
export const fetchProducts = async (): Promise<AdminProduct[]> => {
  const { data } = await axiosInstance.get<AdminProduct[]>(PRODUCTS_URL);
  return data;
};

export const createProduct = async (product: Omit<AdminProduct, "id">): Promise<AdminProduct> => {
  const { data } = await axiosInstance.post<AdminProduct>(PRODUCTS_URL, product);
  return data;
};

export const updateProduct = async (id: string, product: Partial<AdminProduct>): Promise<AdminProduct> => {
  const { data } = await axiosInstance.put<AdminProduct>(`${PRODUCTS_URL}/${id}`, product);
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${PRODUCTS_URL}/${id}`);
};

// Orders
export const fetchOrders = async (): Promise<AdminOrder[]> => {
  const { data } = await axiosInstance.get<AdminOrder[]>(ORDERS_URL);
  return data;
};

export const updateOrderStatus = async (id: string, status: AdminOrder["status"]): Promise<AdminOrder> => {
  const { data } = await axiosInstance.put<AdminOrder>(`${ORDERS_URL}/${id}`, { status });
  return data;
};



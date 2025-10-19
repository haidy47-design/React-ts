import axios from "axios";
import { Product } from "../../components/product/ProductCard";

const API_URL = "https://68f4ce63b16eb6f4683589d0.mockapi.io/home/wishlist";

// Get wishlist (for the logged-in user only)
export const getWishlist = async () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return [];

  const userId = JSON.parse(storedUser).id;
  const res = await axios.get(API_URL);

  const filtered = res.data.filter((item: any) => item.userId === userId);
  return filtered;
};

// Add to wishlist (attach userId automatically)
export const addWishlistItem = async (item: Product) => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) throw new Error("User not logged in");

  const userId = JSON.parse(storedUser).id;

  const newItem = {
    ...item,
    userId,
    createdAt: new Date().toISOString(),
  };

  const res = await axios.post(API_URL, newItem);
  return res.data;
};

// Remove wishlist item by ID
export const removeWishlistItem = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

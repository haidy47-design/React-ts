import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Product } from "../../components/product/ProductCard";
import { toast } from "react-hot-toast";

export type CartItem = Product & {
  quantity: number;
  userID: string;
  id?: string;
  productId?: string;
  createdAt?: string;
};

type CartState = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
};

const API_URL = "https://68e83849f2707e6128ca32fb.mockapi.io/cart";

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// 🟢 Fetch cart items (local filter)
export const fetchCartItems = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  "cart/fetchCartItems",
  async (_, { rejectWithValue }) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login first");
      return rejectWithValue("Please login first");
    }

    const userID = JSON.parse(storedUser).id;
    const res = await axios.get(API_URL);

    // ✅ تحديد النوع بشكل صريح
    const filtered = (res.data as CartItem[]).filter((item: CartItem) => item.userID === userID);
    return filtered;
  }
);

// 🟡 Add or update cart item
export const addToCart = createAsyncThunk<CartItem,Product & { quantity: number },{ rejectValue: string }>
("cart/addToCart", async (product, { rejectWithValue }) => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
  
    return rejectWithValue("Please login first");
  }

  const userID = JSON.parse(storedUser).id;

  const res = await axios.get(API_URL);
  const userCart = (res.data as CartItem[]).filter((item: CartItem) => item.userID === userID);

  const existing = userCart.find((item: CartItem) => item.title === product.title);

  if (existing) {
    const updated = await axios.put(`${API_URL}/${existing.id}`, {
      ...existing,
      quantity: existing.quantity + product.quantity,
    });
    return updated.data;
  } else {
    const newItem: CartItem = {
      ...product,
      productId: product.id,
      createdAt: new Date().toISOString(),
      userID,
    };
    const addRes = await axios.post(API_URL, newItem);
    return addRes.data;
  }
});


// 🔵 Update quantity manually
export const updateCartQuantity = createAsyncThunk<CartItem, { id: string; quantity: number }>(
  "cart/updateCartQuantity",
  async ({ id, quantity }) => {
    const res = await axios.put(`${API_URL}/${id}`, { quantity });
    toast.success("Cart updated");
    return res.data;
  }
);

// 🔴 Remove single item
export const removeFromCart = createAsyncThunk<string, string>(
  "cart/removeFromCart",
  async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    toast.success("Item removed");
    return id;
  }
);

// ⚫ Clear all user's items (local filter)
export const clearCart = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login first");
      return rejectWithValue("Please login first");
    }

    const userID = JSON.parse(storedUser).id;
    const res = await axios.get(API_URL);

    const userCart = (res.data as CartItem[]).filter((item: CartItem) => item.userID === userID);

    await Promise.all(
      userCart.map((item: CartItem) => axios.delete(`${API_URL}/${item.id}`))
    );

    toast.success("Cart cleared");
    return [];
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        else state.items.push(action.payload);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
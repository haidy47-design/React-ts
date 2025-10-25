import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Product } from "../../components/product/ProductCard";
import { toast } from "react-hot-toast";
import { showConfirmAlert, showLoginRequired, showSuccessAlert } from "../../components/common/CustomSwal";
import Swal from "sweetalert2";

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


export const fetchCartItems = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  "cart/fetchCartItems",
  async (_, { rejectWithValue }) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return rejectWithValue("Please login first");
    }

    const userID = JSON.parse(storedUser).id;
    const res = await axios.get(API_URL);

    
    const filtered = (res.data as CartItem[]).filter((item: CartItem) => item.userID === userID);
    return filtered;
  }
);




export const addToCart = createAsyncThunk<
  CartItem,
  Product & { quantity: number },
  { rejectValue: string }
>("cart/addToCart", async (product, { rejectWithValue }) => {
  const storedUser = localStorage.getItem("user");

  
  if (!storedUser) {
    showLoginRequired(); 
    return rejectWithValue("Please login first");
  }

  const userID = JSON.parse(storedUser).id;

  
  if (product.quantity > product.stock) {
    Swal.fire({
      icon: "warning",
      title: "Not Enough Stock ",
      text: `Only ${product.stock} items available in stock.`,
      confirmButtonColor: "#79253D",
    });
    return rejectWithValue("Not enough stock available");
  }

 
  const res = await axios.get(API_URL);
  const userCart = (res.data as CartItem[]).filter((item: CartItem) => item.userID === userID);
  const existing = userCart.find((item: CartItem) => item.title === product.title);

 
  if (existing) {
    const newQuantity = existing.quantity + product.quantity;
    if (newQuantity > product.stock) {
      Swal.fire({
        icon: "warning",
        title: "Stock Limit Reached ",
        text: `You already have ${existing.quantity} in cart, and only ${product.stock} are available.`,
        confirmButtonColor: "#79253D",
      });
      return rejectWithValue("Quantity exceeds stock");
    }

    const updated = await axios.put(`${API_URL}/${existing.id}`, {
      ...existing,
      quantity: newQuantity,
    });
    return updated.data;
  }

  const newItem: CartItem = {
    ...product,
    productId: product.id,
    createdAt: new Date().toISOString(),
    userID,
  };

  const addRes = await axios.post(API_URL, newItem);
  return addRes.data;
});





export const updateCartQuantity = createAsyncThunk<
  CartItem,
  { id: string; quantity: number },
  { rejectValue: string }
>("cart/updateCartQuantity", async ({ id, quantity }, { rejectWithValue }) => {
  try {
   
    const itemRes = await axios.get(`${API_URL}/${id}`);
    const itemData = itemRes.data as CartItem;

   
    if (quantity > itemData.stock) {
      Swal.fire({
        icon: "warning",
        title: "Not Enough Stock ",
        text: `Only ${itemData.stock} items available in stock.`,
        confirmButtonColor: "#79253D",
      });
      return rejectWithValue("Quantity exceeds available stock");
    }

    
    const res = await axios.put(`${API_URL}/${id}`, { quantity });
    showSuccessAlert("Cart quantity updated successfully.")
    return res.data;
  } catch (err) {
    console.error("Update quantity error:", err);
    return rejectWithValue("Failed to update quantity");
  }
});


export const removeFromCart = createAsyncThunk<string, string, { rejectValue: string }>(
  "cart/removeFromCart",
  async (id, { rejectWithValue }) => {
    
    const confirmed = await showConfirmAlert("Are you sure you want to delete this item?");
    if (!confirmed) {
      return rejectWithValue("Delete cancelled");
    }

    
    await axios.delete(`${API_URL}/${id}`);

   
    showSuccessAlert("Item removed from your cart.")

    return id;
  }
);


export const clearCart = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {

      return rejectWithValue("Please login first");
    }

    const userID = JSON.parse(storedUser).id;
    const res = await axios.get(API_URL);

    const userCart = (res.data as CartItem[]).filter((item: CartItem) => item.userID === userID);

    await Promise.all(
      userCart.map((item: CartItem) => axios.delete(`${API_URL}/${item.id}`))
    );

    
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
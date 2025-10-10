import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../components/product/ProductCard";

export type CartItem = Product & { quantity: number };

type CartState = { items: CartItem[] };

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const found = state.items.find((i) => i.id === action.payload.id);
      if (found) {
        found.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;



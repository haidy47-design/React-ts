import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../product/cartSlice";

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
};

type OrderState = { orders: Order[] };

const initialState: OrderState = {
  orders: [],
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    placeOrder: (state, action: PayloadAction<{ items: CartItem[]; total: number }>) => {
      const order: Order = {
        id: String(Date.now()),
        items: action.payload.items,
        total: action.payload.total,
        createdAt: new Date().toISOString(),
      };
      state.orders.unshift(order);
    },
  },
});

export const { placeOrder } = orderSlice.actions;
export default orderSlice.reducer;



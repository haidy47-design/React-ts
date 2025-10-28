import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Product } from "../../components/product/ProductCard";

const API_URL = "https://68f4ce63b16eb6f4683589d0.mockapi.io/home/wishlist";


export type WishlistItem = Product & {
  id?: string;
  productId?: string;
  userId?: string;
  createdAt?: string;
};


type WishlistState = {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
};

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};


const getLoggedUserId = (): string | null => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.id ? String(parsed.id) : null;
  } catch (err) {
    console.error("Failed parsing localStorage user:", err);
    return null;
  }
};

export const fetchWishlist = createAsyncThunk<WishlistItem[], void, { rejectValue: string }>(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const userId = getLoggedUserId();
      if (!userId) return [];

      const res = await axios.get<WishlistItem[]>(API_URL);
      const filtered = res.data.filter((item) => String(item.userId) === String(userId));

      return filtered;
    } catch (err) {
      console.error("fetchWishlist error:", err);
      return rejectWithValue("Failed to fetch wishlist");
    }
  }
);

// ✅ Toggle Wishlist
export const toggleWishlist = createAsyncThunk<
  { added?: WishlistItem; removedId?: string },
  Product,
  { rejectValue: string }
>(
  "wishlist/toggle",
  async (product, { rejectWithValue }) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return rejectWithValue("User not logged in");

      const userId = JSON.parse(storedUser).id as string;

      const res = await axios.get<WishlistItem[]>(API_URL, {
        params: { userId },
      });

      const userItems = res.data;
      const existing = userItems.find(
        (item) =>
          String(item.productId) === String(product.id) ||
          String(item.id) === String(product.id)
      );

      if (existing && existing.id) {
        await axios.delete(`${API_URL}/${existing.id}`);
        return { removedId: existing.id };
      } else {
        const newItem: WishlistItem = {
          ...product,
          userId,
          productId: product.id,
          createdAt: new Date().toISOString(),
        };

        const addRes = await axios.post<WishlistItem>(API_URL, newItem);
        return { added: addRes.data };
      }
    } catch (err) {
      console.error("toggleWishlist error:", err);
      return rejectWithValue("Failed to toggle wishlist");
    }
  }
);

// ✅ Clear Wishlist
export const clearWishlist = createAsyncThunk<WishlistItem[], void, { rejectValue: string }>(
  "wishlist/clear",
  async (_, { rejectWithValue }) => {
    try {
      const userId = getLoggedUserId();
      if (!userId) return rejectWithValue("User not logged in");

      const res = await axios.get<WishlistItem[]>(API_URL);
      const userItems = res.data.filter((item) => String(item.userId) === String(userId));

      await Promise.all(userItems.map((item) => axios.delete(`${API_URL}/${item.id}`)));

      return [];
    } catch (err) {
      console.error("clearWishlist error:", err);
      return rejectWithValue("Failed to clear wishlist");
    }
  }
);

// ✅ Slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })

      // Toggle
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (action.payload?.removedId) {
          state.items = state.items.filter((item) => item.id !== action.payload.removedId);
        } else if (action.payload?.added) {
          const exists = state.items.some(
            (item) => String(item.productId) === String(action.payload.added?.productId)
          );
          if (!exists && action.payload.added) {
            state.items.push(action.payload.added);
          }
        }
      })

      // Clear
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default wishlistSlice.reducer;


import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id?: string;
  name?: string;
  email?: string;
}

const storedUser = localStorage.getItem("user");

const initialState: UserState = storedUser ? JSON.parse(storedUser) : {};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
     logoutUser: () => {
      localStorage.removeItem("user");
      return {};
    }
  
  },
});

export const { setUser,logoutUser} = userSlice.actions;
export default userSlice.reducer;

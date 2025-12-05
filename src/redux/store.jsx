import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./cartSlice";
import matkaReducer from "./matkaSlice";

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    matka: matkaReducer,
  },
  devTools: true,
});

import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../../index";

export interface Toast {
  id: string;
  text: string;
  state: "error" | "success" | "info";
}

interface ToastState {
  message: Toast | null;
}

const initialState: ToastState = {
  message: null,
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    succesToast: (state, action) => {
      state.message = { id: uuidv4(), text: action.payload, state: "success" };
    },
    errorToast: (state, action) => {
      state.message = { id: uuidv4(), text: action.payload, state: "error" };
    },
    infoToast: (state, action) => {
      state.message = { id: uuidv4(), text: action.payload, state: "info" };
    },
    removeToast: (state) => {
      state.message = null;
    },
  },
});

export const { succesToast, errorToast, infoToast, removeToast } =
  toastSlice.actions;

export const selectToastMessage = (state: RootState) => state.toast.message;

export default toastSlice.reducer;

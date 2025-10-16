import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";

interface CompanyState {
  token: string;
  isDarkMode: boolean;
  // Дополнительные поля компании могут быть добавлены здесь
}

const initialState: CompanyState = {
  token: localStorage.getItem("token") || "",
  isDarkMode: false,
};

export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    clearToken: (state) => {
      state.token = "";
    },
    // Здесь могут быть добавлены другие редьюсеры для управления данными компании
  },
});

export const { setToken, clearToken } = companySlice.actions;
export const selectToken = (state: RootState) => state.company.token;

export default companySlice.reducer;

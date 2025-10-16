import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";

interface locationState {
  lat: number;
  lon: number;
}

const initialState: { location: locationState } = {
  location: {
    lat: 0 || import.meta.env.VITE_LAT,
    lon: 0 || import.meta.env.VITE_LON,
  },
};

export const userLocationSlice = createSlice({
  name: "userLocation",
  initialState,
  reducers: {
    setuserLocation(state, action: PayloadAction<locationState>) {
      state.location = action.payload;
    },
  },
});

export const { setuserLocation } = userLocationSlice.actions;
export const selectedUserLocation = (state: RootState) =>
  state.userLocation.location;
export default userLocationSlice.reducer;

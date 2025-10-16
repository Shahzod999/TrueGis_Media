import { apiSlice } from "../apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStreetName: builder.query({
      query: ({ lat, long }) => ({
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&accept-language=ru`,
      }),
    }),
  }),
});

export const { useGetStreetNameQuery } = orderApiSlice;
// OpenStreetMap (бесплатно, без API-ключа)
// nominatim 1000 запросов в день

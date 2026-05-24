import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../services/api/baseApi';
import '../services/api/holdingsApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

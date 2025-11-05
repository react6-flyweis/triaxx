// src/api/axiosInstance.ts
import axios from "axios";
import { store, type RootState } from "@/redux/store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.example.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = (store.getState() as RootState).auth?.token ?? null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid token => clear session and go to login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLogin = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;
  if (data?.errors?.length) return data.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
  return data?.message || fallback;
};

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("swapwear_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on /auth/me (used to check login state)
      if (!error.config.url.includes("/auth/me")) {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export const formatError = (e) => {
  const detail = e.response?.data?.detail;
  if (!detail) return e.message || "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  return String(detail);
};

export default api;

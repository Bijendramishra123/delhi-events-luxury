import axios from "axios";

// Environment-aware API URL configuration
const getApiUrl = () => {
  // Production: Use environment variable
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_API_URL || "/api";
  }
  
  // Development: Use local Docker backend
  return process.env.REACT_APP_API_URL || "http://localhost:8001/api";
};

const API_URL = getApiUrl();

console.log(`🌐 API URL: ${API_URL} (${process.env.NODE_ENV} mode)`);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`📡 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("🔒 Unauthorized access");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function formatPrice(n) {
  if (n == null) return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => e?.msg || JSON.stringify(e)).filter(Boolean).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

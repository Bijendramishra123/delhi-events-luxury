import axios from "axios";

const getApiUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_API_URL || "/api";
  }
  return process.env.REACT_APP_API_URL || "http://localhost:8001/api";
};

const API_URL = getApiUrl();

console.log(`🌐 API URL: ${API_URL} (${process.env.NODE_ENV} mode)`);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`📡 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && process.env.NODE_ENV !== "production") {
      console.warn("🔒 Unauthorized access");
    }
    return Promise.reject(error);
  }
);

export default api;

export function buildWhatsAppLink(phone, message) {
  const encoded = encodeURIComponent(message);
  const isMobile = typeof navigator !== "undefined" &&
    /android|iphone|ipad|ipod|iemobile|blackberry|opera mini|mobile/i.test(navigator.userAgent || "");
  if (isMobile) {
    return `https://wa.me/${phone}?text=${encoded}`;
  }
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
}

export function openWhatsApp(e, phone, message) {
  if (e && e.preventDefault) e.preventDefault();
  const url = buildWhatsAppLink(phone, message);
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.top.location.href = url;
  } catch (err) {
    window.location.href = url;
  }
}

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
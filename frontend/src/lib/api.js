import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export function buildWhatsAppLink(phone, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

// Opens WhatsApp in a top-level new tab so it works inside iframes (preview/embed)
// and avoids the api.whatsapp.com block when clicked from within an iframe context.
export function openWhatsApp(e, phone, message) {
  if (e && e.preventDefault) e.preventDefault();
  const url = buildWhatsAppLink(phone, message);
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) {
      // Popup blocked — fall back to top-level navigation
      window.top.location.href = url;
    }
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
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

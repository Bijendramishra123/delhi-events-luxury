import axios from "axios";

const PRIMARY_URL = process.env.REACT_APP_BACKEND_URL;
// Fallback to Emergent's always-working host if primary (custom domain) fails
// e.g. SSL handshake errors, DNS issues, Cloudflare proxy misconfig on decodiaries.com
const FALLBACK_URL = "https://delhi-events-luxury.emergent.host";

let activeBackend = PRIMARY_URL;

export const BACKEND_URL = PRIMARY_URL;
export const API = `${PRIMARY_URL}/api`;

const api = axios.create({
  baseURL: `${PRIMARY_URL}/api`,
  withCredentials: true,
});

// Track if we've already failed over to avoid loops
let failedOver = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkError =
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message?.includes("Network Error") ||
        error.message?.includes("SSL") ||
        error.message?.includes("handshake"));

    // If primary backend fails with network/SSL error, switch to fallback once
    if (isNetworkError && !failedOver && activeBackend !== FALLBACK_URL) {
      failedOver = true;
      activeBackend = FALLBACK_URL;
      api.defaults.baseURL = `${FALLBACK_URL}/api`;

      if (process.env.NODE_ENV !== "production") {
        console.warn(`[api] Primary backend ${PRIMARY_URL} failed, falling back to ${FALLBACK_URL}`);
      }

      // Retry the original request against the fallback backend
      const original = error.config;
      original.baseURL = `${FALLBACK_URL}/api`;
      return api.request(original);
    }

    return Promise.reject(error);
  }
);

export default api;

export function getActiveBackend() {
  return activeBackend;
}

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
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

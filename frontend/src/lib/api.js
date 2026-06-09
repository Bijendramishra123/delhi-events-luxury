import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// withCredentials sends the httpOnly access_token cookie set by /api/auth/login.
// We intentionally no longer mirror the token in localStorage — that prevents
// XSS-stealable tokens. The cookie is HttpOnly + SameSite=Lax (same-origin only).
const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export default api;

export function buildWhatsAppLink(phone, message) {
  const encoded = encodeURIComponent(message);
  // Use web.whatsapp.com directly on desktop to avoid the wa.me → api.whatsapp.com
  // redirect, which is blocked inside the Emergent preview iframe (ERR_BLOCKED_BY_RESPONSE).
  // On mobile devices, we still use wa.me so it deep-links into the WhatsApp app.
  const isMobile = typeof navigator !== "undefined" &&
    /android|iphone|ipad|ipod|iemobile|blackberry|opera mini|mobile/i.test(navigator.userAgent || "");
  if (isMobile) {
    return `https://wa.me/${phone}?text=${encoded}`;
  }
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
}

// Opens WhatsApp in a top-level new tab so it works inside iframes (preview/embed)
// and avoids the api.whatsapp.com block when clicked from within an iframe context.
export function openWhatsApp(e, phone, message) {
  if (e && e.preventDefault) e.preventDefault();
  const url = buildWhatsAppLink(phone, message);
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) {
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

import api from "./axios"; // reuse axios instance

// ── Dashboard ──────────────────────────────────────────
export const getDashboardStats = () =>
  api.get("/bank-admin/dashboard");

// ── Requests ───────────────────────────────────────────
export const getRequests = (status = "") =>
  api.get(`/bank-admin/requests${status ? `?status=${status}` : ""}`);

export const acceptRequest = (id) =>
  api.patch(`/bank-admin/requests/${id}/accept`);

export const rejectRequest = (id, reason = "") =>
  api.patch(`/bank-admin/requests/${id}/reject`, { reason });

// ── Notifications ──────────────────────────────────────
export const getAdminNotifications = () =>
  api.get("/bank-admin/notifications");

export const markAdminNotificationRead = (id) =>
  api.patch(`/bank-admin/notifications/${id}/read`);

export const getProfile = () =>
  api.get("/bank-admin/profile");
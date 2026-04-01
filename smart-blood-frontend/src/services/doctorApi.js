import api from "./axios";

/* ===============================
   NEARBY BLOOD BANKS
================================ */
export const getNearbyBloodBanks = async (lat, lng, radius) => {
  // radius slider is in km → convert to meters for Overpass
  const radiusMeters = radius * 1000;
  const res = await api.get("/doctor/nearby-blood-banks", {
    params: { lat, lng, radius: radiusMeters },
  });
  // res.data shape: { success, source, count, data: [...] }
  return res.data;
};

/* ===============================
   DISTANCE HELPER
================================ */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/* ===============================
   DOCTOR PROFILE
================================ */
export const getMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};

export const updateMyProfile = (data) => api.put("/doctor/profile", data);

export const changePassword = (data) =>
  api.put("/doctor/change-password", data);

export const uploadPhoto = (file) => {
  const form = new FormData();
  form.append("photo", file);
  return api.post("/doctor/upload-photo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ===============================
   BLOOD STOCK
================================ */
export const getBloodStock = (bankId) =>
  api.get(`/doctor/blood-stock/${bankId}`);

/* ===============================
   BLOOD REQUESTS
================================ */
export const raiseBloodRequest = (bankId, data) =>
  api.post(`/doctor/request-blood/${bankId}`, data);

export const getMyRequests = () => api.get("/doctor/my-requests");

export const getRequestById = (id) => api.get(`/doctor/request/${id}`);

/* ===============================
   NOTIFICATIONS
================================ */
export const getNotifications = () => api.get("/doctor/notifications");

export const markNotificationRead = (id) =>
  api.patch(`/doctor/notifications/${id}/read`);

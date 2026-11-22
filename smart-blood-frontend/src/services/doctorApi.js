import api from "./axios";

/* ===============================
   NEARBY BLOOD BANKS
   radius → km (backend expects km, NOT meters)
   bloodGroup → optional e.g. "A+", "O-"
================================ */
export const getNearbyBloodBanks = async (lat, lng, radius, bloodGroup = "") => {
  const params = { lat, lng, radius };
  if (bloodGroup) params.bloodGroup = bloodGroup;

  const res = await api.get("/doctor/nearby-blood-banks", { params });
  // shape: { success, source, count, data: [...] }
  return res.data;
};

/* ===============================
   DISTANCE HELPER (Haversine)
   Used by Dashboard / BloodBankMap
================================ */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ===============================
   DOCTOR PROFILE
================================ */
export const getMyProfile = async () => {
  const res = await api.get("/doctor/profile");
  return res.data;
};

export const updateMyProfile  = (data) => api.put("/doctor/profile", data);
export const changePassword    = (data) => api.put("/doctor/change-password", data);

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
export const getBloodStock = (bankId) => api.get(`/doctor/blood-stock/${bankId}`);

/* ===============================
   BLOOD REQUESTS
================================ */
export const raiseBloodRequest = (bankId, data) =>
  api.post(`/doctor/request-blood/${bankId}`, data);

export const getMyRequests  = ()    => api.get("/doctor/my-requests");
export const getRequestById = (id)  => api.get(`/doctor/request/${id}`);

/* ===============================
   NOTIFICATIONS
================================ */
export const getNotifications      = ()    => api.get("/doctor/notifications");
export const markNotificationRead  = (id)  => api.patch(`/doctor/notifications/${id}/read`);

export const getBestDonors = (bloodGroup) =>
  api.get("/doctor/best-donors", {
    params: { bloodGroup }
  });

export const notifyDonor = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `http://localhost:5000/api/doctor/notify/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};
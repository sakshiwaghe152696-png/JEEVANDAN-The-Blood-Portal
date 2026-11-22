import api from "./axios";

/* ===============================
   CREATE
================================ */

// 🩺 Create Doctor
export const createDoctor = (data) => {
  return api.post("/super-admin/create-doctor", data);
};

// 🏥 Create Bank Admin + Blood Bank
export const createBankAdminWithBloodBank = (payload) => {
  return api.post("/super-admin/create-bank-admin", payload);
};

/* ===============================
   DASHBOARD
================================ */

export const getDashboardStats = () =>
  api.get("/super-admin/dashboard-stats");

/* ===============================
   FETCH LISTS
================================ */

export const getBloodBanks = () =>
  api.get("/super-admin/blood-banks");

export const getBankAdmins = () =>
  api.get("/super-admin/bank-admins");

export const getDoctors = () =>
  api.get("/super-admin/doctors");

/* ===============================
   ✏️ UPDATE
================================ */

// ✏️ Update Doctor
export const updateDoctor = (id, data) => {
  return api.put(`/super-admin/doctors/${id}`, data);
};

// ✏️ Update Bank Admin
export const updateBankAdmin = (id, data) => {
  return api.put(`/super-admin/bank-admins/${id}`, data);
};

/* ===============================
   ❌ DELETE (Soft Delete)
================================ */

// ❌ Delete Doctor
export const deleteDoctor = (id) => {
  return api.delete(`/super-admin/doctors/${id}`);
};


// ❌ Delete Bank Admin
export const deleteBankAdmin = (id) => {
  return api.delete(`/super-admin/bank-admins/${id}`);
};

/* ===============================
   DONORS
================================ */

export const getDonors = () =>
  api.get("/donors/all");

export const deleteDonor = (id) =>
  api.delete(`/super-admin/donors/${id}`);
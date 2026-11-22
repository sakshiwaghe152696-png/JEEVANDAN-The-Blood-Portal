import api from "./axios";

// 🔐 Login
export const loginUser = (data) =>
  api.post("/auth/login", data);

// 👤 Get Logged-in User Profile
export const getMyProfile = () =>
  api.get("/profile/me");
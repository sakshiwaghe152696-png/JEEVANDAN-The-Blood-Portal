import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";

import {
  ShieldCheck,
  Hospital,
  User,
  Crown,
  Stethoscope,
} from "lucide-react";

export default function Login() {
  const [userType, setUserType] = useState("public");
  const [adminRole, setAdminRole] = useState("doctor");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 🔥 MAP UI ROLE → BACKEND ROLE
    let roleToSend = "USER";

    if (userType === "admin") {
      if (adminRole === "super") roleToSend = "SUPER_ADMIN";
      if (adminRole === "bloodbank") roleToSend = "BANK_ADMIN";
      if (adminRole === "doctor") roleToSend = "DOCTOR";
      
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: roleToSend,
      });

      // save auth
      login(res.data);

      const role = res.data.user.role;

      // redirect
      if (role === "SUPER_ADMIN") {
        navigate("/superadmin", { replace: true });
      } else if (role === "BANK_ADMIN") {
        navigate("/bank-admin", { replace: true });
      } else if (role === "DOCTOR") {
        navigate("/doctor", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Secure Access to <br />
            <span className="text-red-500">Jeevandan</span>
          </h1>

          <p className="text-gray-300 mt-6 max-w-md">
            Jeevandan ensures fast, secure, and role-based access for donors,
            hospitals, and administrators managing critical blood logistics.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Verified & Authorized Access",
              "Emergency Priority Handling",
              "Secure Medical Infrastructure",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-red-500">✔</span>
                <p className="text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT LOGIN CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
        >
          <h3 className="text-white text-xl font-semibold mb-6">
            Login Access
          </h3>

          {/* USER TYPE TOGGLE */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setUserType("public")}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition
                ${
                  userType === "public"
                    ? "bg-red-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
            >
              <User className="inline w-4 h-4 mr-2" />
              Public User
            </button>

            <button
              type="button"
              onClick={() => setUserType("admin")}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition
                ${
                  userType === "admin"
                    ? "bg-red-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
            >
              <ShieldCheck className="inline w-4 h-4 mr-2" />
              Medical / Admin
            </button>
          </div>

          {/* ADMIN ROLE SELECTION */}
          {userType === "admin" && (
            <div className="mb-6">
              <p className="text-gray-400 text-xs uppercase mb-3">
                Select Admin Role
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAdminRole("super")}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-4 rounded-xl text-sm font-medium transition
                    ${
                      adminRole === "super"
                        ? "bg-white text-gray-900 scale-105 shadow-lg"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                >
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Super
                </button>

                <button
                  type="button"
                  onClick={() => setAdminRole("bloodbank")}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-4 rounded-xl text-sm font-medium transition
                    ${
                      adminRole === "bloodbank"
                        ? "bg-white text-gray-900 scale-105 shadow-lg"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                >
                  <Hospital className="w-5 h-5" />
                  Blood Bank
                </button>

                <button
                  type="button"
                  onClick={() => setAdminRole("doctor")}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-4 rounded-xl text-sm font-medium transition
                    ${
                      adminRole === "doctor"
                        ? "bg-white text-gray-900 scale-105 shadow-lg"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                >
                  <Stethoscope className="w-5 h-5" />
                  Doctor
                </button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white
                         placeholder-gray-400 focus:outline-none
                         focus:ring-2 focus:ring-red-500"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 text-white
                           placeholder-gray-400 focus:outline-none
                           focus:ring-2 focus:ring-red-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-gray-900 py-3 rounded-xl
                         font-semibold hover:bg-gray-100 transition"
            >
              Continue
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

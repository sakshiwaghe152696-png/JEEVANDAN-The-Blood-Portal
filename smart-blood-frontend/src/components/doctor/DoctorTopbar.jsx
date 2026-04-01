import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, getNotifications, markNotificationRead } from "../../services/doctorApi";
import defaultAvatar from "../../assets/avatar.jpg";
import NotificationBell from "../common/NotificationBell";

export default function DoctorTopbar() {
  const [open, setOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    getMyProfile()
      .then(setDoctor)
      .catch(console.error);
  }, []);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!doctor) return null;

  return (
    <header className="h-16 bg-white border-b flex items-center px-6 justify-between shadow-sm">

      {/* LEFT — title */}
      <h1 className="text-lg font-semibold text-gray-800">
        Doctor Dashboard
      </h1>

      {/* RIGHT — bell + profile */}
      <div className="flex items-center gap-4">

        {/* ✅ NOTIFICATION BELL — renders the dropdown with polling */}
        <NotificationBell
          fetchFn={getNotifications}
          markReadFn={markNotificationRead}
        />

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 focus:outline-none"
          >
            {/* AVATAR */}
            <div className="h-9 w-9 rounded-full overflow-hidden border cursor-pointer hover:ring-2 hover:ring-red-400 transition">
              {doctor.photo ? (
                <img
                  src={`http://localhost:5000/uploads/${doctor.photo}`}
                  alt="Doctor"
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = defaultAvatar; }}
                />
              ) : (
                <div className="h-full w-full bg-red-600 text-white flex items-center justify-center font-semibold">
                  {doctor.full_name?.charAt(0)}
                </div>
              )}
            </div>

            {/* NAME */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800">{doctor.full_name}</p>
              <p className="text-xs text-gray-500">Doctor</p>
            </div>
          </button>

          {/* DROPDOWN MENU */}
          {open && (
            <div className="absolute right-0 top-12 w-64 bg-white border rounded-xl shadow-lg z-50">
              {/* INFO */}
              <div className="p-4 border-b">
                <p className="font-semibold text-gray-800">{doctor.full_name}</p>
                <p className="text-sm text-gray-500">{doctor.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {doctor.degree || "Registered Doctor"}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="p-2 space-y-1">
                <button
                  onClick={() => { setOpen(false); navigate("/doctor/profile"); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
                >
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
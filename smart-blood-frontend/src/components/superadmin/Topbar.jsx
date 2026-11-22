import { useEffect, useRef, useState } from "react";
import { getMyProfile } from "../../services/authApi";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const avatarRef = useRef(null);

 useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ IMPORTANT CHECK
      if (!token) return;

      const res = await getMyProfile();
      setAdmin(res.data);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
    
  };

  fetchProfile();
}, []);



  // 🔒 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* TOP BAR */}
      <header
        className="bg-[#0f0f0f]/95 backdrop-blur border-b border-[#1f1f1f]
        px-6 py-5 flex justify-between items-center shadow-md relative z-40"
      >
        {/* Title */}
       <h1 className="flex items-center gap-2 text-lg font-semibold tracking-wide text-white">
  <span className="text-red-500">❤️</span>
  <span className="bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
    Saving Lives Through Smart Blood Management
  </span>
</h1>

        {/* Avatar */}
        <button
          ref={avatarRef}
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-gradient-to-br
            from-red-500 to-red-700 flex items-center justify-center
            text-white font-bold shadow hover:ring-2 hover:ring-red-500
            transition"
        >
          {admin?.email?.[0]?.toUpperCase() || "A"}
        </button>
      </header>

      {/* 🔥 PROFILE DROPDOWN — FIXED POSITION */}
      {open && admin && (
        <div
          className="fixed top-[72px] right-6
          w-72 bg-[#121212]
          border border-[#1f1f1f]
          rounded-xl shadow-2xl p-4
          z-[9999]
          animate-[fadeIn_0.15s_ease-out]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#1f1f1f]">
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br
              from-red-500 to-red-700 flex items-center justify-center
              text-white text-lg font-bold"
            >
              {admin?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-white font-semibold leading-tight">
                Super Admin
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="pt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-white break-all">{admin.email}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-white">{admin.phone || "—"}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">City</p>
              <p className="text-white">{admin.city || "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown animation */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-6px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </>
  );
}

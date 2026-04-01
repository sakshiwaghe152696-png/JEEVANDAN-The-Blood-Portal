import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Stethoscope,
  Users,
  UserCog,
  UserPlus,
} from "lucide-react";

import StatCard from "../../components/superadmin/StatCard";
import CreateUserModal from "../../components/superadmin/CreateUserModal";
import { getDashboardStats } from "../../services/superAdminApi";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({
    bloodBanks: 0,
    doctors: 0,
    donors: 0,
    bankAdmins: 0,
  });

  // ✅ single source of truth for stats loading
  const fetchStats = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">
          Overview
        </h2>

        {/* 🔥 Enhanced Create User Button */}
        <button
          onClick={() => setOpen(true)}
          className="
            relative overflow-hidden
            flex items-center gap-2
            bg-gradient-to-r from-red-600 to-red-700
            text-white px-5 py-2 rounded-lg
            transition-all duration-300
            shadow-md
            hover:scale-[1.05]
            hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]
            active:scale-[0.98]
          "
        >
          <span
            className="
              pointer-events-none absolute inset-0
              opacity-0 hover:opacity-100 transition
              bg-gradient-to-r from-transparent via-white/10 to-transparent
            "
          />
          <UserPlus size={18} />
          Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          title="Blood Banks"
          value={stats.bloodBanks}
          icon={Building2}
        />
        <StatCard
          title="Doctors"
          value={stats.doctors}
          icon={Stethoscope}
        />
        <StatCard
          title="Blood Bank Admins"
          value={stats.bankAdmins}
          icon={UserCog}
        />
        <StatCard
          title="Donors"
          value={stats.donors}
          icon={Users}
        />
      </div>

      {/* Modal */}
      {open && (
        <CreateUserModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            fetchStats(); // ✅ refresh stats after creation
          }}
        />
      )}
    </>
  );
}

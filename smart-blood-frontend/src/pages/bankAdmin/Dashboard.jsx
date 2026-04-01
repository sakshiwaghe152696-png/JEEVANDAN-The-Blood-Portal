import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getAdminNotifications, markAdminNotificationRead
} from "../../services/bankAdminApi";
import NotificationBell from "../../components/common/NotificationBell";
import {
  FaClipboardList, FaCheckCircle,
  FaTimesCircle, FaClock, FaExclamationTriangle
} from "react-icons/fa";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from "recharts";

export default function BankAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const chartData = stats ? [
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected }
  ] : [];

  const lowStock = stats?.stock?.filter(s => s.units < 5) || [];

  const COLORS = ["#f59e0b", "#10b981", "#ef4444"];

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Blood Bank Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring & analytics
          </p>
        </div>

        <NotificationBell
          fetchFn={getAdminNotifications}
          markReadFn={markAdminNotificationRead}
        />
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl shadow animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <StatCard icon={<FaClipboardList />} label="Total Requests" value={stats.totalRequests} color="blue" />
          <StatCard icon={<FaClock />} label="Pending" value={stats.pending} color="yellow" />
          <StatCard icon={<FaCheckCircle />} label="Approved" value={stats.approved} color="green" />
          <StatCard icon={<FaTimesCircle />} label="Rejected" value={stats.rejected} color="red" />
        </div>
      )}

      {/* 🚨 Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="relative bg-red-50 border border-red-200 rounded-xl p-5 mb-10 shadow-sm overflow-hidden">
          
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-200 opacity-20 rounded-full blur-3xl"></div>

          <h2 className="font-semibold text-red-700 flex items-center gap-2 mb-4">
            <FaExclamationTriangle className="animate-pulse" />
            Low Stock Alert
          </h2>

          <div className="flex flex-wrap gap-3">
            {lowStock.map((s) => (
              <div
                key={s._id}
                className="px-4 py-2 bg-white border border-red-100 rounded-lg text-sm shadow-sm 
                hover:shadow-md hover:scale-[1.05] transition duration-300"
              >
                <span className="font-bold text-red-600">{s.blood_group}</span>
                <span className="text-gray-500 ml-2">({s.component})</span>
                <span className="ml-2 text-red-500 font-semibold">
                  {s.units} units
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📊 Graph Section */}
      {/* 📊 Graph Section */}
{stats && (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border p-6 hover:shadow-xl transition duration-300">
    
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-semibold text-gray-800 text-lg">
        Request Analytics
      </h2>

      <span className="text-xs text-gray-400">
        Live Overview
      </span>
    </div>

    <div className="h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
        >
          {/* Gradient defs */}
          <defs>
            <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#fde68a" stopOpacity={0.6}/>
            </linearGradient>

            <linearGradient id="approved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.6}/>
            </linearGradient>

            <linearGradient id="rejected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.6}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

          <XAxis 
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />

          <YAxis allowDecimals={false} />

          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              fontSize: "13px"
            }}
          />

          <Bar
            dataKey="value"
            radius={[12, 12, 0, 0]}
            barSize={45}
          >
            {chartData.map((entry, index) => {
              const fills = ["url(#pending)", "url(#approved)", "url(#rejected)"];
              return <Cell key={index} fill={fills[index]} />;
            })}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
)}
    </div>
  );
}

// ── Enhanced Stat Card ───────────────────────────────

function StatCard({ icon, label, value, color }) {
  const styles = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700",
    green: "from-green-50 to-green-100 border-green-200 text-green-700",
    red: "from-red-50 to-red-100 border-red-200 text-red-700"
  };

  return (
    <div className={`relative p-5 rounded-xl border bg-gradient-to-br ${styles[color]}
      shadow-sm transition duration-300 transform 
      hover:scale-[1.06] hover:shadow-xl cursor-pointer overflow-hidden`}>

      {/* Glow Effect */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{icon}</span>
      </div>

      <p className="text-3xl font-bold">{value ?? "—"}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
}
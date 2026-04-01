import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/bankAdminApi";
import { FaTint, FaExclamationTriangle } from "react-icons/fa";

export default function Inventory() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStock = async () => {
    try {
      const { data } = await getDashboardStats();
      setStock(data.stock || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  // 👉 Group by blood group
  const grouped = {};
  stock.forEach((s) => {
    if (!grouped[s.blood_group]) {
      grouped[s.blood_group] = [];
    }
    grouped[s.blood_group].push(s);
  });

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Blood Stock Dashboard
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-xl shadow animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {Object.keys(grouped).map((bg) => {
            const items = grouped[bg];

            const total = items.reduce((sum, i) => sum + i.units, 0);
            const isCritical = total < 20;

            const getUnits = (type) =>
              items.find((i) => i.component === type)?.units || 0;

            return (
              <div
                key={bg}
                className="bg-white rounded-xl shadow-md p-5 border hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <FaTint className="text-red-500" />
                    <span className="font-bold text-lg text-gray-800">
                      {bg}
                    </span>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-medium
                    ${isCritical
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                    }`}
                  >
                    {isCritical ? "Critical" : "Available"}
                  </span>
                </div>

                {/* Total */}
                <p className="text-sm text-gray-500 mb-4">
                  Total Units: <span className="font-semibold">{total}</span>
                </p>

                {/* Bars */}
                <Bar label="Whole Blood" value={getUnits("WHOLE")} color="bg-red-500" />
                <Bar label="RBC" value={getUnits("RBC")} color="bg-blue-500" />
                <Bar label="Plasma" value={getUnits("PLASMA")} color="bg-yellow-400" />
                <Bar label="Platelets" value={getUnits("PLATELETS")} color="bg-green-500" />

                {/* Warning */}
                {isCritical && (
                  <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                    <FaExclamationTriangle />
                    Critical blood shortage
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 🔹 Progress Bar Component
function Bar({ label, value, color }) {
  const percentage = Math.min(value * 5, 100); // scale

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{value} Units</span>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
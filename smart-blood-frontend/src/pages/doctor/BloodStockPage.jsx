import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/axios";
import { FaTint, FaTimes } from "react-icons/fa";

export default function BloodStockPage() {
  const { bankId } = useParams();
  const navigate = useNavigate();

  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await api.get(`/doctor/blood-stock/${bankId}`);

        console.log("BANK ID:", bankId);
        console.log("API RESPONSE:", res.data);


        // ✅ Handle different backend formats
        const raw = Array.isArray(res.data)
          ? res.data
          : res.data.stock || res.data.data || [];

        if (!raw.length) {
          setStock({});
          return;
        }

        // 🔥 Convert array → grouped object
        const grouped = {};

        raw.forEach((item) => {
          const group = item.blood_group;
          const component = item.component;

          if (!grouped[group]) {
            grouped[group] = {};
          }

          grouped[group][component] = item.units;
        });

        setStock(grouped);

      } catch (err) {
        console.error("Error loading blood stock:", err);
        setStock({});
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [bankId]);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading blood stock...
      </div>
    );
  }

  // ✅ Empty state
  if (!stock || Object.keys(stock).length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        No blood stock available for this bank
      </div>
    );
  }

  // Status logic
  const getStatus = (value) => {
    if (value <= 5) return { label: "Critical", color: "bg-red-500" };
    if (value <= 10) return { label: "Low", color: "bg-yellow-400" };
    return { label: "Available", color: "bg-green-500" };
  };

  return (
    <div className="p-8 relative bg-gray-50 min-h-screen">

      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 bg-white hover:bg-red-100 text-gray-600 hover:text-red-600 p-3 rounded-full shadow"
      >
        <FaTimes />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-red-100 p-3 rounded-full">
          <FaTint className="text-red-600 text-xl" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Blood Stock Dashboard</h2>
          <p className="text-gray-500 text-sm">
            Live blood component availability
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {Object.entries(stock).map(([group, components]) => {

          const whole = components?.WHOLE || 0;
          const rbc = components?.RBC || 0;
          const plasma = components?.PLASMA || 0;
          const platelets = components?.PLATELETS || 0;

          const total = whole + rbc + plasma + platelets;
          const status = getStatus(whole);

          return (
            <div
              key={group}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition"
            >

              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-lg font-bold text-red-600">
                  <FaTint />
                  {group}
                </div>

                <span
                  className={`text-xs text-white px-3 py-1 rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Total */}
              <p className="text-sm text-gray-500 mb-4">
                Total Units: <span className="font-semibold">{total}</span>
              </p>

              {/* Components */}
              <div className="space-y-3">

                {[
                  { label: "Whole Blood", value: whole, color: "bg-red-500" },
                  { label: "RBC", value: rbc, color: "bg-blue-500" },
                  { label: "Plasma", value: plasma, color: "bg-yellow-400" },
                  { label: "Platelets", value: platelets, color: "bg-green-500" }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span>{item.value} Units</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className={`${item.color} h-2 rounded transition-all duration-700`}
                        style={{ width: `${Math.min(item.value * 5, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}

              </div>

              {/* Warning */}
              {whole <= 5 && (
                <p className="text-red-500 text-xs mt-3">
                  ⚠ Critical blood shortage
                </p>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
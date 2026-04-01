import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequests } from "../../services/doctorApi";
import { FaTint, FaClock, FaCheckCircle, FaTimesCircle, FaChevronRight } from "react-icons/fa";

// Status badge config
const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700" },
  APPROVED:  { label: "Approved",  color: "bg-green-100 text-green-700"   },
  REJECTED:  { label: "Rejected",  color: "bg-red-100 text-red-700"       },
  COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-700"     }
};

const URGENCY_COLOR = {
  Routine:   "bg-gray-100 text-gray-600",
  Urgent:    "bg-orange-100 text-orange-600",
  Emergency: "bg-red-100 text-red-700 font-semibold"
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyRequests();
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === "ALL"
    ? requests
    : requests.filter((r) => r.status === filter);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Blood Requests</h2>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition
              ${filter === s ? "bg-red-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FaTint className="mx-auto text-4xl mb-3 text-red-200" />
          <p>No requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
            return (
              <div
                key={req._id}
                onClick={() => navigate(`/doctor/requests/${req._id}`)}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md hover:border-red-200 
                           transition cursor-pointer p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {/* Blood group badge */}
                  <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-200
                                  flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold text-sm">{req.blood_group}</span>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">{req.patient_name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {req.units} units · {req.component} ·{" "}
                      {req.blood_bank_id?.name || "Blood Bank"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(req.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${URGENCY_COLOR[req.urgency]}`}>
                    {req.urgency}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                  <FaChevronRight className="text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import {
  getRequests,
  acceptRequest,
  rejectRequest
} from "../../services/bankAdminApi";
import { FaEye } from "react-icons/fa";

/* ===============================
   BADGES
================================ */
const URGENCY_BADGE = {
  Routine: "bg-gray-100 text-gray-600",
  Urgent: "bg-yellow-100 text-yellow-700",
  Emergency: "bg-red-100 text-red-600"
};

const STATUS_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600"
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[status]}`}>
    {status}
  </span>
);

/* ===============================
   COMPONENT
================================ */
export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // ✅ NEW STATE (MODAL)
  const [selectedRequest, setSelectedRequest] = useState(null);

  /* ===============================
     FETCH REQUESTS
  =============================== */
  const loadRequests = async () => {
    try {
      setLoadingReqs(true);

      const res =
        activeTab === "ALL"
          ? await getRequests()
          : await getRequests(activeTab);

      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoadingReqs(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  /* ===============================
     ACCEPT
  =============================== */
  const handleAccept = async (id) => {
    try {
      setActionLoading(id);
      await acceptRequest(id);
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  /* ===============================
     REJECT
  =============================== */
  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setActionLoading(id);
      await rejectRequest(id, reason);
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">Blood Requests</h2>

        <div className="flex gap-2">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition
                ${activeTab === tab
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loadingReqs ? (
        <div className="py-12 text-center text-gray-400">
          Loading...
        </div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No {activeTab.toLowerCase()} requests
        </div>
      ) : (

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500 text-xs uppercase tracking-wide">
                <th className="pb-3 text-left">Patient</th>
                <th className="pb-3 text-left">Blood</th>
                <th className="pb-3 text-left">Doctor</th>
                <th className="pb-3 text-left">Urgency</th>
                <th className="pb-3 text-left">Date</th>
                <th className="pb-3 text-left">Status</th>
                <th className="pb-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50 transition">

                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-800">
                      {req.patient_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {req.hospital_name}
                    </p>
                  </td>

                  <td className="py-3 pr-4">
                    <span className="font-bold text-red-600">
                      {req.blood_group}
                    </span>
                    <span className="text-gray-400 ml-1 text-xs">
                      × {req.units}
                    </span>
                  </td>

                  <td className="py-3 pr-4">
                    <p className="text-gray-700">
                      {req.doctor_id?.name || "Doctor"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {req.doctor_id?.email}
                    </p>
                  </td>

                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${URGENCY_BADGE[req.urgency]}`}>
                      {req.urgency}
                    </span>
                  </td>

                  <td className="py-3 pr-4 text-gray-500">
                    {new Date(req.created_at).toLocaleDateString("en-IN")}
                  </td>

                  <td className="py-3 pr-4">
                    <StatusBadge status={req.status} />
                  </td>

                  {/* ✅ UPDATED ACTIONS */}
                  <td className="py-3 flex gap-2">

                    {/* 👁 VIEW */}
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <FaEye className="text-gray-600" />
                    </button>

                    {req.status === "PENDING" && (
                      <>
                        <button
                          disabled={actionLoading === req._id}
                          onClick={() => handleAccept(req._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
                        >
                          ✓
                        </button>

                        <button
                          disabled={actionLoading === req._id}
                          onClick={() => handleReject(req._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                        >
                          ✗
                        </button>
                      </>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ MODAL */}
      {/* ✅ ENHANCED MODAL */}
{selectedRequest && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl w-[95%] max-w-xl shadow-xl p-6 relative animate-fadeIn">

      {/* CLOSE */}
      <button
        onClick={() => setSelectedRequest(null)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
      >
        ✕
      </button>

      {/* HEADER */}
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Request Details
        </h2>

        <div className="flex gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs ${STATUS_BADGE[selectedRequest.status]}`}>
            {selectedRequest.status}
          </span>

          <span className={`px-3 py-1 rounded-full text-xs ${URGENCY_BADGE[selectedRequest.urgency]}`}>
            {selectedRequest.urgency}
          </span>
        </div>
      </div>

      {/* BLOOD HIGHLIGHT */}
      <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl mb-5">
        <div>
          <p className="text-sm text-gray-500">Blood Required</p>
          <h3 className="text-2xl font-bold text-red-600">
            {selectedRequest.blood_group}
          </h3>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Units</p>
          <h3 className="text-xl font-semibold text-gray-800">
            {selectedRequest.units}
          </h3>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">

        {/* PATIENT */}
        <div>
          <p className="text-gray-400 text-xs">Patient</p>
          <p className="font-medium">{selectedRequest.patient_name}</p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Hospital</p>
          <p className="font-medium">{selectedRequest.hospital_name}</p>
        </div>

        {/* DOCTOR */}
        <div>
          <p className="text-gray-400 text-xs">Doctor</p>
          <p className="font-medium">
            {selectedRequest.doctor_id?.name || "Doctor"}
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-xs">Email</p>
          <p className="font-medium">
            {selectedRequest.doctor_id?.email || "-"}
          </p>
        </div>

        {/* DATE */}
        <div className="col-span-2">
          <p className="text-gray-400 text-xs">Requested On</p>
          <p className="font-medium">
            {new Date(selectedRequest.created_at).toLocaleString()}
          </p>
        </div>

      </div>

      {/* ACTIONS */}
      {selectedRequest.status === "PENDING" && (
        <div className="flex gap-3 mt-6">

          <button
            onClick={() => {
              handleAccept(selectedRequest._id);
              setSelectedRequest(null);
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium"
          >
            ✅ Accept Request
          </button>

          <button
            onClick={() => {
              handleReject(selectedRequest._id);
              setSelectedRequest(null);
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-medium"
          >
            ❌ Reject
          </button>

        </div>
      )}

    </div>
  </div>
)}
    </div>
  );
}
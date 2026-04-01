import { useEffect, useState } from "react";
import api from "../../services/axios";
import { useNavigate } from "react-router-dom";

export default function MyRequests() {

  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/doctor/my-requests");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load requests");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h2 className="text-2xl font-bold mb-6">
        My Blood Requests
      </h2>

      <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">

        {requests.length === 0 ? (
          <p>No requests found</p>
        ) : (
          <table className="w-full text-left border-collapse">

            {/* HEADER */}
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3">Patient</th>
                <th className="p-3">Hospital</th>
                <th className="p-3">Blood</th>
                <th className="p-3">Units</th>
                <th className="p-3">Component</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="border-b hover:bg-gray-50">

                  <td className="p-3 font-medium">
                    {req.patient_name}
                  </td>

                  <td className="p-3">
                    {req.hospital_name || "—"}
                  </td>

                  <td className="p-3">
                    {req.blood_group}
                  </td>

                  <td className="p-3">
                    {req.units}
                  </td>

                  <td className="p-3">
                    {req.component}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        req.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : req.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>

                  {/* ACTION BUTTON 🔥 */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => navigate(`/doctor/request/${req._id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      View Details
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}
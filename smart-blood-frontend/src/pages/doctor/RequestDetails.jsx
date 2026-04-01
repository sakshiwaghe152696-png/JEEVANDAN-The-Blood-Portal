import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRequestById } from "../../services/doctorApi";
import {
  FaHospital, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaTint, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock
} from "react-icons/fa";

const STATUS_ICON = {
  PENDING:   <FaClock className="text-yellow-500" />,
  APPROVED:  <FaCheckCircle className="text-green-500" />,
  REJECTED:  <FaTimesCircle className="text-red-500" />,
  COMPLETED: <FaCheckCircle className="text-blue-500" />
};

const BLOOD_COLORS = {
  "A+": "bg-red-100 text-red-700",
  "A-": "bg-red-200 text-red-800",
  "B+": "bg-orange-100 text-orange-700",
  "B-": "bg-orange-200 text-orange-800",
  "O+": "bg-yellow-100 text-yellow-700",
  "O-": "bg-yellow-200 text-yellow-800",
  "AB+": "bg-purple-100 text-purple-700",
  "AB-": "bg-purple-200 text-purple-800"
};

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await getRequestById(id);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!data?.request) {
  return <div className="p-8 text-red-500">Request not found.</div>;
}

  const request = data?.request;
  const stock = data?.stock;
  const bank = request?.blood_bank_id;

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-red-600 mb-6 transition"
      >
        <FaArrowLeft /> Back to Requests
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Request Details</h2>

      {/* Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 border
        ${request.status === "APPROVED" ? "bg-green-50 border-green-200" :
          request.status === "REJECTED" ? "bg-red-50 border-red-200" :
          "bg-yellow-50 border-yellow-200"}`}>
        {STATUS_ICON[request.status]}
        <div>
          <p className="font-semibold text-gray-800">Status: {request.status}</p>
          {request.rejection_reason && (
            <p className="text-sm text-red-600 mt-0.5">Reason: {request.rejection_reason}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Info */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaTint className="text-red-500" /> Patient Info
          </h3>
          <InfoRow label="Name" value={request.patient_name} />
          <InfoRow label="Age / Gender" value={`${request.age} / ${request.gender}`} />
          <InfoRow label="Blood Group" value={
            <span className={`px-2 py-0.5 rounded-full text-sm font-bold ${BLOOD_COLORS[request.blood_group]}`}>
              {request.blood_group}
            </span>
          } />
          <InfoRow label="Units" value={`${request.units} units`} />
          <InfoRow label="Component" value={request.component} />
          <InfoRow label="Urgency" value={request.urgency} />
          {request.diagnosis && <InfoRow label="Diagnosis" value={request.diagnosis} />}
          {request.hospital_name && <InfoRow label="Hospital" value={request.hospital_name} />}
          <InfoRow
            label="Requested On"
            value={new Date(request.created_at).toLocaleString("en-IN")}
          />
        </div>

        {/* Blood Bank Info */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaHospital className="text-blue-500" /> Blood Bank
          </h3>
          {bank ? (
            <>
              <p className="font-bold text-gray-800 mb-3">{bank.name}</p>
              {bank.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <FaMapMarkerAlt className="text-gray-400 mt-0.5 shrink-0" />
                  <span>{[bank.address, bank.city, bank.district, bank.state, bank.pincode]
                    .filter(Boolean).join(", ")}</span>
                </div>
              )}
              {bank.contact_number && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FaPhone className="text-gray-400" />
                  <a href={`tel:${bank.contact_number}`} className="hover:text-red-600">
                    {bank.contact_number}
                  </a>
                </div>
              )}
              {bank.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaEnvelope className="text-gray-400" />
                  <a href={`mailto:${bank.email}`} className="hover:text-red-600">
                    {bank.email}
                  </a>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm">Bank details unavailable</p>
          )}

          {/* Available stock for this blood group */}
          <div className="mt-5 pt-4 border-t">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Available Stock ({request.blood_group})
            </p>
            {stock && stock.length > 0 ? (
              <div className="space-y-1">
                {stock.map((s) => (
                  <div key={s._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{s.component}</span>
                    <span className={`font-semibold ${s.units < 5 ? "text-red-600" : "text-green-600"}`}>
                      {s.units} units{s.units < 5 ? " ⚠️" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No stock data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}
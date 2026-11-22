import { useEffect, useState } from "react";
import { getNearbyBloodBanks } from "../../services/doctorApi";
import { useNavigate } from "react-router-dom";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const RANK_BADGES = [
  { label: "🥇 Best Match",  bg: "bg-yellow-50",  border: "border-yellow-300", badge: "bg-yellow-100 text-yellow-800" },
  { label: "🥈 Second Best", bg: "bg-slate-50",   border: "border-slate-300",  badge: "bg-slate-100 text-slate-700"   },
  { label: "🥉 Third Best",  bg: "bg-orange-50",  border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
];

export default function NearbyBloodBanks() {
  const [banks, setBanks]           = useState([]);
  const [radius, setRadius]         = useState(20);
  const [bloodGroup, setBloodGroup] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [source, setSource]         = useState("");

  const navigate = useNavigate();

  /* ── GPS ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setError("Location access denied. Please allow location."); setLoading(false); },
      { enableHighAccuracy: true }
    );
  }, []);

  /* ── Fetch ── */
  useEffect(() => {
    if (!userLocation) return;
    const fetch_ = async () => {
      try {
        setLoading(true);
        const res = await getNearbyBloodBanks(userLocation.lat, userLocation.lng, radius, bloodGroup);
        setSource(res.source || "");
        const withCoords = (res.data || []).map((bank) => {
          const lat = parseFloat(bank.location?.coordinates?.[1]);
          const lng = parseFloat(bank.location?.coordinates?.[0]);
          if (isNaN(lat) || isNaN(lng)) return null;
          return { ...bank, latitude: lat, longitude: lng };
        }).filter(Boolean);
        setBanks(withCoords);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch blood banks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [userLocation, radius, bloodGroup]);

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Blood Banks Near Me</h2>
        <p className="text-sm text-gray-500 mt-1">
          {loading
            ? "Searching..."
            : `${banks.length} bank${banks.length !== 1 ? "s" : ""} found within ${radius} km`}
          {source === "smart" && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">⚡ Smart Ranked</span>
          )}
        </p>
      </div>

      {/* ── FILTERS ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🩸 Blood Group
            <span className="ml-1 text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
            <option value="">-- All Groups --</option>
            {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
            <span>Search Radius</span>
            <span className="text-red-600">{radius} km</span>
          </div>
          <input type="range" min="1" max="100" value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-red-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 km</span><span>100 km</span>
          </div>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">
              {bloodGroup ? `Finding ${bloodGroup} near you...` : "Fetching nearby banks..."}
            </p>
          </div>
        </div>
      )}

      {/* ── CARDS ── */}
      {!loading && (
        banks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🩸</p>
            <p className="font-medium text-gray-600">
              {bloodGroup
                ? `No ${bloodGroup} blood available within ${radius} km`
                : `No blood banks found within ${radius} km`}
            </p>
            <p className="text-sm mt-1">Try increasing the radius or changing the blood group.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {banks.map((bank, index) => {
              const rank = RANK_BADGES[index] || null;
              return (
                <div key={bank._id}
                  className={`p-5 rounded-xl shadow-sm border transition hover:shadow-md ${
                    rank ? `${rank.bg} ${rank.border}` : "bg-white border-gray-100"
                  }`}>

                  {rank && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rank.badge}`}>
                      {rank.label}
                    </span>
                  )}

                  <h3 className="font-bold text-gray-900 mt-2 text-base leading-tight">{bank.name}</h3>
                  {bank.city    && <p className="text-gray-500 text-sm mt-0.5">{bank.city}</p>}
                  {bank.address && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{bank.address}</p>}
                  {bank.phone   && <p className="text-gray-600 text-sm mt-1">📞 {bank.phone}</p>}
                  {bank.hours   && <p className="text-gray-500 text-xs mt-1">🕐 {bank.hours}</p>}

                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="text-red-600 font-semibold text-sm">
                      📍 {bank.distance?.toFixed(2)} km
                    </span>
                    {bank.units != null && (
                      <span className="text-green-700 font-semibold text-sm">
                        ✅ {bank.units} unit{bank.units !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {bank.score != null && (
                    <p className="text-xs text-gray-400 mt-1">Smart score: {bank.score}</p>
                  )}

                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`}
                    target="_blank" rel="noreferrer"
                    className="block mt-3 text-center text-sm text-blue-600 underline">
                    Navigate →
                  </a>

                  <button onClick={() => navigate(`/doctor/request-blood/${bank._id}`)}
                    className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition">
                    Request Blood
                  </button>

                  <button onClick={() => navigate(`/doctor/blood-stock/${bank._id}`)}
                    className="mt-2 w-full border border-red-500 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                    View Stock
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
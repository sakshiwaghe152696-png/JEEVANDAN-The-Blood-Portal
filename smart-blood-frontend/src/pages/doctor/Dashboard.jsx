import { useEffect, useState } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Circle, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getNearbyBloodBanks } from "../../services/doctorApi";
import { useNavigate } from "react-router-dom";

/* ── Fix Leaflet icon bug ── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:   "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:    [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const bankIcon = new L.Icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:   "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:    [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const bestIcon = new L.Icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:   "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:    [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 12); }, [lat, lng, map]);
  return null;
}

/* ══════════════════════════════════════
   DASHBOARD
══════════════════════════════════════ */
export default function Dashboard() {
  const [banks, setBanks]               = useState([]);
  const [radius, setRadius]             = useState(20);
  const [bloodGroup, setBloodGroup]     = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [source, setSource]             = useState("");

  const navigate = useNavigate();

  /* ── Get GPS location once ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setError("Location access denied. Please allow location."); setLoading(false); },
      { enableHighAccuracy: true }
    );
  }, []);

  /* ── Fetch banks when location / radius / bloodGroup changes ── */
  useEffect(() => {
    if (!userLocation) return;
    const fetch_ = async () => {
      try {
        setLoading(true);
        const res = await getNearbyBloodBanks(userLocation.lat, userLocation.lng, radius, bloodGroup);
        setSource(res.source || "");
        // Attach lat/lng for Leaflet
        const withCoords = (res.data || []).map((bank) => {
          const lat = parseFloat(bank.location?.coordinates?.[1]);
          const lng = parseFloat(bank.location?.coordinates?.[0]);
          if (isNaN(lat) || isNaN(lng)) return null;
          return { ...bank, latitude: lat, longitude: lng };
        }).filter(Boolean);
        setBanks(withCoords);
      } catch (e) {
        console.error(e);
        setError("Failed to load blood banks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [userLocation, radius, bloodGroup]);

  /* ── Error ── */
  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading
              ? "Searching nearby blood banks..."
              : `${banks.length} blood bank${banks.length !== 1 ? "s" : ""} found within ${radius} km`}
            {source === "smart" && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">⚡ Smart Ranked</span>
            )}
          </p>
        </div>
      </div>

      {/* ── FILTERS ROW ── */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Blood group */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🩸 Blood Group
            <span className="ml-1 text-gray-400 font-normal text-xs">(optional — filters by availability)</span>
          </label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">-- Show All Banks --</option>
            {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>

        {/* Radius */}
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

      {/* ── MAP ── */}
      {userLocation && (
        <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={12}
            style={{ height: "420px", width: "100%" }}
          >
            <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Radius circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={radius * 1000}
              pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.05, weight: 1.5 }}
            />

            {/* User pin */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup><b>📍 You are here</b></Popup>
            </Marker>

            {/* Bank pins */}
            {!loading && banks.map((bank, i) => (
              <Marker key={bank._id} position={[bank.latitude, bank.longitude]}
                icon={i === 0 ? bestIcon : bankIcon}>
                <Popup>
                  <div className="min-w-[180px]">
                    {i === 0 && <p className="text-xs font-bold text-green-700 mb-1">⭐ Best Match</p>}
                    <p className="font-bold">🩸 {bank.name}</p>
                    {bank.city    && <p className="text-sm text-gray-600">📍 {bank.city}</p>}
                    {bank.address && <p className="text-xs text-gray-500">{bank.address}</p>}
                    {bank.phone   && <p className="text-sm text-gray-600">📞 {bank.phone}</p>}
                    <p className="text-red-600 font-semibold text-sm mt-1">
                      {bank.distance?.toFixed(2)} km away
                    </p>
                    {bank.units != null && (
                      <p className="text-green-700 font-semibold text-sm">
                        ✅ {bank.units} units available
                      </p>
                    )}
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`}
                      target="_blank" rel="noreferrer"
                      className="block mt-2 text-center text-xs bg-blue-600 text-white py-1.5 rounded">
                      Navigate →
                    </a>
                    <button onClick={() => navigate(`/doctor/request-blood/${bank._id}`)}
                      className="mt-1 w-full text-xs bg-red-600 text-white py-1.5 rounded">
                      Request Blood
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* ── LOADING SPINNER ── */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">
              {bloodGroup ? `Finding ${bloodGroup} blood near you...` : "Fetching nearby banks..."}
            </p>
          </div>
        </div>
      )}

      {/* ── BANK CARDS ── */}
      {!loading && (
        <>
          {banks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🩸</p>
              <p className="font-medium text-gray-600">
                {bloodGroup
                  ? `No ${bloodGroup} blood available within ${radius} km`
                  : `No blood banks found within ${radius} km`}
              </p>
              <p className="text-sm mt-1">Try increasing the radius above.</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-800">
                Nearby Banks
                <span className="ml-2 text-sm font-normal text-gray-400">
                  — sorted by {bloodGroup ? "smart score" : "distance"}
                </span>
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {banks.map((bank, index) => (
                  <div
                    key={bank._id}
                    className={`p-5 rounded-xl shadow-sm border transition hover:shadow-md ${
                      index === 0
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    {/* Badge */}
                    {index === 0 && (
                      <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                        ⭐ Best Match
                      </span>
                    )}
                    {index === 1 && (
                      <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                        🥈 2nd
                      </span>
                    )}
                    {index === 2 && (
                      <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        🥉 3rd
                      </span>
                    )}

                    <h3 className="font-bold text-gray-900 mt-2 text-base leading-tight">
                      {bank.name}
                    </h3>

                    {bank.city    && <p className="text-gray-500 text-sm mt-0.5">{bank.city}</p>}
                    {bank.address && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{bank.address}</p>}
                    {bank.phone   && <p className="text-gray-600 text-sm mt-1">📞 {bank.phone}</p>}
                    {bank.hours   && <p className="text-gray-500 text-xs mt-1">🕐 {bank.hours}</p>}

                    {/* Distance + Units */}
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

                    {/* Actions */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`}
                      target="_blank" rel="noreferrer"
                      className="block mt-3 text-center text-sm text-blue-600 underline"
                    >
                      Navigate →
                    </a>

                    <button
                      onClick={() => navigate(`/doctor/request-blood/${bank._id}`)}
                      className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                    >
                      Request Blood
                    </button>

                    <button
                      onClick={() => navigate(`/doctor/blood-stock/${bank._id}`)}
                      className="mt-2 w-full border border-red-500 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                    >
                      View Stock
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
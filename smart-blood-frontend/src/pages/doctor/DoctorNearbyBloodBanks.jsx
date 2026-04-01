import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getNearbyBloodBanks, calculateDistanceKm } from "../../services/doctorApi";
import { useNavigate } from "react-router-dom";

/* ===============================
   FIX LEAFLET DEFAULT ICON BUG
================================ */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const bloodIcon = new L.Icon({
  iconUrl:  "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl:  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

/* ===============================
   MAP RECENTER HELPER
================================ */
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

/* ===============================
   MAIN COMPONENT
================================ */
export default function NearbyBloodBanks() {
  const [banks, setBanks]               = useState([]);
  const [radius, setRadius]             = useState(15);       // in KM (UI slider)
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab]       = useState("map");    // "map" | "list"
  const [source, setSource]             = useState("");       // "osm" | "db" | "db_fallback"

  const navigate = useNavigate();

  /* ===============================
     GET USER LOCATION
  =============================== */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        setError("Location access denied. Please allow location access.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /* ===============================
     FETCH BANKS WHEN LOCATION READY
  =============================== */
  useEffect(() => {
    if (!userLocation) return;

    const fetchBanks = async () => {
      try {
        setLoading(true);
        setError("");

        // radius is KM in UI → service converts to meters
        const res = await getNearbyBloodBanks(
          userLocation.lat,
          userLocation.lng,
          radius
        );

        setSource(res.source || "");
        setBanks(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch nearby blood banks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, [userLocation, radius]);

  /* ===============================
     COMPUTE DISTANCE + FILTER
  =============================== */
  const filteredBanks = (Array.isArray(banks) ? banks : [])
    .map((bank) => {
      const lat = parseFloat(bank.location?.coordinates?.[1]);
      const lng = parseFloat(bank.location?.coordinates?.[0]);

      if (isNaN(lat) || isNaN(lng)) return null;

      const distance = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );

      return { ...bank, latitude: lat, longitude: lng, distance };
    })
    .filter(Boolean)
    .filter((bank) => bank.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  /* ===============================
     ERROR STATE
  =============================== */
  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nearby Blood Banks</h2>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? "Searching..."
              : `${filteredBanks.length} blood bank(s) found within ${radius} km`}
            {source === "osm" && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Live · OpenStreetMap
              </span>
            )}
            {source === "db_fallback" && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                ⚠ Offline data
              </span>
            )}
          </p>
        </div>

        {/* TAB TOGGLE */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => setActiveTab("map")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === "map"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🗺 Map
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === "list"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* RADIUS SLIDER */}
      <div className="max-w-md bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between mb-2 text-sm font-medium text-gray-700">
          <span>Search Radius</span>
          <span className="text-red-600 font-bold">{radius} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full accent-red-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 km</span>
          <span>100 km</span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Fetching nearby blood banks...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* ======= MAP TAB ======= */}
          {activeTab === "map" && userLocation && (
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200">
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={13}
                style={{ height: "480px", width: "100%" }}
              >
                <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Radius circle */}
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={radius * 1000}
                  pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.05, weight: 1.5 }}
                />

                {/* User marker */}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                    <b>📍 You are here</b>
                  </Popup>
                </Marker>

                {/* Blood bank markers */}
                {filteredBanks.map((bank) => (
                  <Marker
                    key={bank._id}
                    position={[bank.latitude, bank.longitude]}
                    icon={bloodIcon}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-bold text-base">🩸 {bank.name}</p>
                        {bank.city    && <p className="text-sm text-gray-600">📍 {bank.city}</p>}
                        {bank.address && <p className="text-sm text-gray-600">{bank.address}</p>}
                        {bank.phone   && <p className="text-sm text-gray-600">📞 {bank.phone}</p>}
                        {bank.hours   && <p className="text-sm text-gray-600">🕐 {bank.hours}</p>}
                        <p className="text-red-600 font-semibold text-sm mt-1">
                          {bank.distance.toFixed(2)} km away
                        </p>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block mt-2 text-center text-xs bg-blue-600 text-white py-1.5 rounded"
                        >
                          Navigate →
                        </a>
                        {/* Only show Request button for DB banks (not OSM-only) */}
                        {!bank._id.toString().startsWith("osm_") && (
                          <button
                            onClick={() => navigate(`/doctor/request-blood/${bank._id}`)}
                            className="mt-1 w-full text-xs bg-red-600 text-white py-1.5 rounded"
                          >
                            Request Blood
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* ======= LIST TAB ======= */}
          {activeTab === "list" && (
            <>
              {filteredBanks.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">🩸</p>
                  <p className="font-medium">No blood banks found within {radius} km</p>
                  <p className="text-sm mt-1">Try increasing the radius above.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredBanks.map((bank, index) => (
                    <div
                      key={bank._id}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                    >
                      {index === 0 && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          ⭐ Nearest
                        </span>
                      )}

                      <h3 className="font-bold text-lg mt-2 text-gray-900">
                        {bank.name}
                      </h3>

                      {bank.city && (
                        <p className="text-gray-500 text-sm">{bank.city}</p>
                      )}

                      {bank.address && (
                        <p className="text-gray-400 text-xs mt-1">{bank.address}</p>
                      )}

                      {bank.phone && (
                        <p className="text-gray-600 text-sm mt-1">📞 {bank.phone}</p>
                      )}

                      {bank.hours && (
                        <p className="text-gray-500 text-xs mt-1">🕐 {bank.hours}</p>
                      )}

                      <p className="text-red-600 font-semibold mt-3">
                        {bank.distance.toFixed(2)} km away
                      </p>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-3 text-center text-sm text-blue-600 underline"
                      >
                        Navigate →
                      </a>

                      {/* Only show these buttons for DB-registered banks */}
                      {!bank._id.toString().startsWith("osm_") ? (
                        <>
                          <button
                            onClick={() => navigate(`/doctor/request-blood/${bank._id}`)}
                            className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                          >
                            Request Blood
                          </button>
                          <button
                            onClick={() => navigate(`/doctor/blood-stock/${bank._id}`)}
                            className="mt-2 w-full border border-red-500 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                          >
                            View Stock
                          </button>
                        </>
                      ) : (
                        <p className="mt-3 text-xs text-gray-400 text-center italic">
                          OSM listing · Contact directly
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

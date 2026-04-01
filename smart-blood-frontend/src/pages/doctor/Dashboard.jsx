import { useEffect, useState } from "react";
import api from "../../services/axios";
import BloodBankMap from "../../components/doctor/BloodBankMap";
import { calculateDistanceKm } from "../../services/doctorApi";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [mapData, setMapData] = useState(null);
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const doctor = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };

          const res = await api.get("/doctor/map-data");

          const rawBanks = Array.isArray(res.data)
            ? res.data
            : res.data?.banks || [];

          const banksWithDistance = rawBanks
            .filter((bank) => bank.location?.coordinates?.length === 2)
            .map((bank) => {
              const longitude = parseFloat(bank.location.coordinates[0]);
              const latitude = parseFloat(bank.location.coordinates[1]);

              if (isNaN(latitude) || isNaN(longitude)) return null;

              const distance = calculateDistanceKm(
                doctor.latitude,
                doctor.longitude,
                latitude,
                longitude
              );

              return {
                ...bank,
                latitude,
                longitude,
                distance,
              };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance);

          setMapData({ doctor, banks: banksWithDistance });
        } catch (err) {
          console.error(err);
          setError("Failed to load blood banks");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 animate-pulse">
        Fetching nearby blood banks...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-20 font-medium">
        {error}
      </div>
    );

  if (!mapData) return null;

  const filteredBanks = mapData.banks.filter(
    (bank) => bank.distance <= radius
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Nearby Blood Banks
        </h2>

        <div className="text-sm text-gray-500">
          Total: {filteredBanks.length}
        </div>
      </div>

      {/* RADIUS SLIDER */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Search Radius</span>
          <span className="font-semibold text-red-500">{radius} km</span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full accent-red-500"
        />
      </div>

      {/* MAP */}
      <div className="rounded-xl overflow-hidden shadow mb-6">
        <BloodBankMap
          doctor={mapData.doctor}
          banks={filteredBanks}
        />
      </div>

      {/* EMPTY STATE */}
      {filteredBanks.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          ❌ No blood banks found within {radius} km
        </div>
      )}

      {/* CARDS */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredBanks.map((bank, index) => (
          <div
            key={bank._id}
            className={`p-5 rounded-xl shadow-sm border transition hover:shadow-md ${
              index === 0
                ? "bg-red-50 border-red-200"
                : "bg-white"
            }`}
          >
            {/* NEAREST BADGE */}
            {index === 0 && (
              <div className="text-xs bg-red-500 text-white px-2 py-1 rounded w-fit mb-2">
                ⭐ Nearest
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-800">
              {bank.name}
            </h3>

            <p className="text-sm text-gray-500">{bank.city}</p>

            {/* DISTANCE BADGE */}
            <div className="mt-3 inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              📍 {bank.distance.toFixed(2)} km away
            </div>

            <button
              onClick={() =>
                navigate(`/doctor/request-blood/${bank._id}`)
              }
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
            >
              Request Blood
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
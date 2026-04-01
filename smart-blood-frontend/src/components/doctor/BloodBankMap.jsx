import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

/* Auto zoom component */
function FitBounds({ doctor, banks }) {
  const map = useMap();

  useEffect(() => {
    if (!doctor) return;

    const bounds = [];

    bounds.push([doctor.latitude, doctor.longitude]);

    banks.forEach((bank) => {
      if (
        typeof bank.latitude === "number" &&
        typeof bank.longitude === "number"
      ) {
        bounds.push([bank.latitude, bank.longitude]);
      }
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        animate: true,
        duration: 1.5
      });
    } else {
      map.setView(bounds[0], 12, { animate: true });
    }
  }, [doctor, banks, map]);

  return null;
}

export default function BloodBankMap({ doctor, banks }) {
  if (!doctor) return <p>Loading map...</p>;

  /* ✅ SORT BANKS BY DISTANCE (VERY IMPORTANT) */
  const sortedBanks = [...banks].sort(
    (a, b) => (a.distance || 0) - (b.distance || 0)
  );

  /* Doctor icon */
  const doctorIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  /* Blood bank icon */
  const bankIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  /* Nearest bank icon */
  const nearestIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <MapContainer
      center={[doctor.latitude, doctor.longitude]}
      zoom={10}
      scrollWheelZoom={true}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "10px"
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Auto zoom */}
      <FitBounds doctor={doctor} banks={sortedBanks} />

      {/* Doctor marker */}
      <Marker position={[doctor.latitude, doctor.longitude]} icon={doctorIcon}>
        <Popup>
          <strong>Your Location</strong>
        </Popup>
      </Marker>

      {/* Blood bank markers */}
      {sortedBanks.map((bank, index) => {
        // ✅ Skip invalid coordinates
        if (
          typeof bank.latitude !== "number" ||
          typeof bank.longitude !== "number"
        ) return null;

        return (
          <Marker
            key={bank._id}
            position={[bank.latitude, bank.longitude]}
            icon={index === 0 ? nearestIcon : bankIcon}
          >
            <Popup>
              <strong>{bank.name}</strong>
              <br />
              {bank.city}
              <br />
              🚑 {bank.distance?.toFixed(2)} km away

              {index === 0 && (
                <>
                  <br />
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    ⭐ Nearest Blood Bank
                  </span>
                </>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
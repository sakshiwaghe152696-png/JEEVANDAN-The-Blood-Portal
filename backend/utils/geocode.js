const axios = require("axios");

module.exports = async (address, city) => {

  // Append India context for better Nominatim results
  const query = address
    ? `${address}, ${city}, Maharashtra, India`
    : `${city}, Maharashtra, India`;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

  console.log("Geocoding query:", query);

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Jeevandan-BloodManagement/1.0 (jeevandan@gmail.com)",
    },
    timeout: 10000,
  });

  console.log("Nominatim response:", response.data);

  if (!response.data || response.data.length === 0) {
    throw new Error(`Geocoding failed for query: "${query}"`);
  }

  return {
    latitude: parseFloat(response.data[0].lat),
    longitude: parseFloat(response.data[0].lon),
  };

};
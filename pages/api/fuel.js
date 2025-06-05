// pages/api/fuel.js

export default async function handler(req, res) {
  const { fuelType = "E10" } = req.query;

  const url = `https://data.nsw.gov.au/data/api/3/action/datastore_search?resource_id=6f15cbd0-bf58-4bcb-a52e-6d40868b40b0&limit=1000`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (!json.result || !Array.isArray(json.result.records)) {
      return res.status(500).json({ error: "Unexpected API response structure" });
    }

    const stations = json.result.records
      .filter((station) => station.FuelCode === fuelType)
      .map((station) => ({
        name: station.Brand,
        lat: parseFloat(station.Lat),
        lng: parseFloat(station.Lng),
        price: parseFloat(station.Price),
      }));

    res.status(200).json(stations);
  } catch (error) {
    console.error("API fetch error:", error);
    res.status(500).json({ error: "Failed to fetch fuel data" });
  }
}

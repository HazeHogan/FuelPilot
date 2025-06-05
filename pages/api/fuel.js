export default async function handler(req, res) {
  const { fuelType = "E10" } = req.query;

  const apiUrl = `https://data.nsw.gov.au/data/api/3/action/datastore_search?resource_id=6f15cbd0-bf58-4bcb-a52e-6d40868b40b0&limit=100`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const filtered = data.result.records
      .filter(r => r.fueltype === fuelType)
      .map((record, idx) => ({
        id: idx,
        name: record.station_name,
        lat: parseFloat(record.latitude),
        lng: parseFloat(record.longitude),
        price: record.price,
      }));

    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch FuelCheck data" });
  }
}

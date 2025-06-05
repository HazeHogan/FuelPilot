export default async function handler(req, res) {
  const { fuelType = "E10" } = req.query;

  try {
    const response = await fetch(
      `https://data.nsw.gov.au/data/api/3/action/datastore_search?resource_id=6f15cbd0-bf58-4bcb-a52e-6d40868b40b0&limit=1000`
    );

    const json = await response.json();

    if (!json.result || !Array.isArray(json.result.records)) {
      return res.status(200).json([]); // ✅ always return an array
    }

    const stations = json.result.records
      .filter((s) => s.FuelCode === fuelType)
      .map((s) => ({
        name: s.Brand,
        lat: parseFloat(s.Lat),
        lng: parseFloat(s.Lng),
        price: parseFloat(s.Price),
      }));

    return res.status(200).json(stations);
  } catch (err) {
    console.error("FuelCheck fetch error:", err);
    return res.status(200).json([]); // ✅ always return an array
  }
}

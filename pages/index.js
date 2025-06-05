// pages/index.js - FuelPilot with Next.js and Google Maps API integration
import { useEffect, useState } from "react";

const FUELCHECK_API_URL = "https://data.nsw.gov.au/data/api/3/action/datastore_search?resource_id=6f15cbd0-bf58-4bcb-a52e-6d40868b40b0&limit=100";

export default function Home() {
  const [stations, setStations] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [map, setMap] = useState(null);
  const [fuelType, setFuelType] = useState("E10");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    const fetchFuelData = async () => {
      try {
        const response = await fetch(FUELCHECK_API_URL);
        const data = await response.json();
        const filtered = data.result.records.filter(r => r.fueltype === fuelType);
        const records = filtered.map((record, idx) => ({
          id: idx,
          name: record.station_name,
          lat: parseFloat(record.latitude),
          lng: parseFloat(record.longitude),
          price: record.price,
        }));
        setStations(records);
      } catch (err) {
        console.error("Failed to fetch FuelCheck data:", err);
      }
    };
    fetchFuelData();
  }, [fuelType]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (document.getElementById("google-maps-script")) return;
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };
    loadGoogleMapsScript();
  }, [darkMode]);

  const initMap = () => {
    const mapInstance = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: -31.085, lng: 152.832 },
      zoom: 13,
      styles: darkMode ? [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      ] : [],
    });
    setMap(mapInstance);
  };

  useEffect(() => {
    if (!map) return;
    map.setZoom(13);
    stations.forEach((station) => {
      const marker = new window.google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map,
        title: `${station.name} - $${station.price}/L`,
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<strong>${station.name}</strong><br/>$${station.price} / L`
      });
      marker.addListener("click", () => infoWindow.open(map, marker));
    });
  }, [map, stations]);

  const calculateRoute = () => {
    if (!origin || !destination || !window.google || !map) return;
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsService.route(
      {
        origin,
        destination,
        travelMode: "DRIVING",
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
        } else {
          alert("Could not display directions: " + status);
        }
      }
    );
  };

  return (
    <div className={darkMode ? "dark" : "light"}>
      <header className="p-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">FuelPilot</h1>
        <div className="flex gap-2 items-center">
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="E10">E10</option>
            <option value="U91">U91</option>
            <option value="U95">U95</option>
            <option value="U98">U98</option>
            <option value="Diesel">Diesel</option>
          </select>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 border rounded"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>
      <div className="p-4 flex gap-4 bg-gray-100 dark:bg-gray-900">
        <input
          type="text"
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="border p-2 w-1/3"
        />
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border p-2 w-1/3"
        />
        <button
          onClick={calculateRoute}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Plan Trip
        </button>
      </div>
      <main className="h-[calc(100vh-160px)]">
        <div id="map" className="w-full h-full"></div>
      </main>
      <footer className="text-center text-sm p-2 text-gray-500">
        Ad-supported — coming soon!
      </footer>
    </div>
  );
}

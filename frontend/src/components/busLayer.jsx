import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import polyline from "polyline"; 
import myBusIcon from "../assets/images/bus-stop-removebg-preview.png";
import myBusStop from "../assets/images/bus-stop__1_-removebg-preview.png";
const API_KEY = import.meta.env.VITE_API_KEY;
import { fetchBuses } from "../apiService";

const BusMap = ({ map,bus1}) => {
  const [activeBusLayer, setActiveBusLayer] = useState(null);
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const response =await fetchBuses();
        const data = await response.json();
        const extractedBuses = [];
        let uniqueId = 1; 
        data.forEach(entry => {
          entry.country.forEach(region => {
            region.buses.forEach(bus => {
              extractedBuses.push({ ...bus, id: uniqueId++ });
            });
          });
        });
        setBuses(extractedBuses);
      } catch (error) {
        console.error("Error fetching bus data:", error);
      }
    };
    fetchBus();
  }, []);

  const fetchRoute = async (bus) => {
    const origin = encodeURIComponent(bus.startLocation);
    const destination = encodeURIComponent(bus.endLocation);
    const waypoints = bus.stops&&bus.stops.length > 0
      ? `&waypoints=${bus.stops.map(stop => encodeURIComponent(stop)).join("|")}`
      : "";
    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${origin}&destination=${destination}${waypoints}&key=${API_KEY}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Error fetching directions: HTTP Status", response.status);
        return null;
      }
      const data = await response.json();
      if (data.status !== "OK" || !data.routes.length) {
        console.error("Error fetching route data:", data);
        return null;
      }
      return data.routes[0].overview_polyline.points;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  };

  const showBusRoute = async (bus) => {
    console.log(bus);
    if (!map) return;
    if (activeBusLayer) {
      map.removeLayer(activeBusLayer);
    }
    const { name, startCoords, endCoords, stopCoords } = bus;
    const busLayer = L.layerGroup().addTo(map);
    const busIcon = L.icon({ iconUrl: myBusIcon, iconSize: [30, 40] });
    const stopIcon = L.icon({ iconUrl: myBusStop, iconSize: [20, 30] });

    if (startCoords) {
      L.marker([startCoords.lat, startCoords.lng], { icon: busIcon })
        .addTo(busLayer)
        .bindPopup(`<b>Start: ${name}</b>`);
    }
    if(stopCoords&&stopCoords.length>=1){
    stopCoords.forEach((stop, i) => {
      if (stop) {
        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .addTo(busLayer)
          .bindPopup(`<b>Stop ${i + 1}: ${stop.name}</b>`);
      }
    });
  }
    if (endCoords) {
      L.marker([endCoords.lat, endCoords.lng], { icon: busIcon })
        .addTo(busLayer)
        .bindPopup(`<b>End: ${name}</b>`);
    }

    const polylinePoints = await fetchRoute(bus);
    if (polylinePoints) {
      const latLngs = polyline.decode(polylinePoints).map(([lat, lng]) => L.latLng(lat, lng));
      L.polyline(latLngs, { color: "blue" }).addTo(busLayer);
    }

    setActiveBusLayer(busLayer);
  };
  return (
    <div>
      <button onClick={()=>showBusRoute(bus1)} className="btn btn-info mb-2">{bus1.name} <i className="bi bi-crosshair"></i></button>
    </div>
  );
};

export default BusMap;

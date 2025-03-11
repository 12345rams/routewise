
const API_KEY =import.meta.env.VITE_API_KEY;
const BASE_URL =import.meta.env.VITE_BASE_URL;
const MAPS_API_URL = "https://maps.gomaps.pro/maps/api/directions/json";
export const registerUser = async (email, password) => {
    const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Signup failed!");
    }
    return data;
};
export const loginUser = async (email, password) => {
    const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return response;
};
export const fetchPassengers = async () => {
    console.log(API_KEY);
    try {
      const response = await fetch(`${BASE_URL}/user/getAllUser`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching passengers:", error);
      return [];
    }
  };
  
  export const fetchBuses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/bus/busCountry`);
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
      return extractedBuses;
    } catch (error) {
      console.error("Error fetching buses:", error);
      return [];
    }
  };
  export const createBus = async (busDetails) => {
      try {
          const response = await fetch(`${BASE_URL}/bus/create`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(busDetails),
          });
  
          const result = await response.json();
  
          if (!response.ok) {
              console.error("Error saving bus details:", result);
              return null;
          }
  
          return result;
      } catch (error) {
          console.error("Error saving bus details:", error);
          return null;
      }
  };
  
  export const fetchRoute = async (busDetails) => {
      try {
          if (!busDetails.startLocation || !busDetails.endLocation) return null;
  
          const origin = encodeURIComponent(busDetails.startLocation);
          const destination = encodeURIComponent(busDetails.endLocation);
          const waypoints = busDetails.stops.length > 0
              ? `&waypoints=${busDetails.stops.map(stop => encodeURIComponent(stop)).join("|")}`
              : "";
  
          const url = `${MAPS_API_URL}?origin=${origin}&destination=${destination}${waypoints}&key=${API_KEY}`;
          const response = await fetch(url);
  
          if (!response.ok) {
              console.error("Error fetching directions: HTTP Status", response.status);
              return null;
          }
  
          const text = await response.text();
          if (!text) {
              console.error("Error: Empty response from API");
              return null;
          }
  
          const data = JSON.parse(text);
          if (data.status !== "OK" || !data.routes.length) {
              console.error("Error fetching route data:", data);
              return null;
          }
  
          return data.routes[0].legs.flatMap(leg =>
              leg.steps.map(step => [step.start_location.lat, step.start_location.lng])
          );
      } catch (error) {
          console.error("Error fetching route:", error);
          return null;
      }
  };
  


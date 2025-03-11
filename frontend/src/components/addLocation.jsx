import { useState, useEffect } from "react";
import L from "leaflet";
import "./style.css";
import "./addLocation.css";
import myBusIcon from "../assets/images/placeholder-removebg-preview.png";
import { updateUserLocation } from "../apiService";
import { useNavigate } from "react-router-dom";
const AddLocation = ({ map }) => {
  const [location, setLocation] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const API_KEY = import.meta.env.VITE_API_KEY;
 const navigate=useNavigate();
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPredictions = async (input) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${encodeURIComponent(input)}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.predictions.length > 0) {
        setPredictions(data.predictions);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  var myIcon = L.icon({
    iconUrl: myBusIcon,
    iconSize: [30, 40],
  });

  const selectPrediction = async (description, placeId) => {
    setLocation(description);
    setPredictions([]);
    setSelectedPlaceId(placeId);
    try {
      const response = await fetch(
        `https://maps.gomaps.pro/maps/api/place/details/json?placeid=${placeId}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const { lat, lng } = data.result.geometry.location;
        setCoordinates({ lat, lng });

        if (map) {
          map.setView([lat, lng], 13);
          L.marker([lat, lng], { icon: myIcon })
            .addTo(map)
            .bindPopup(
              `<b>${description}</b><div class="time"><br/>Time: ${time}<br/><input type="time" id="time-input" value="${time}" onchange="updateMarkerTime(this)"></div>`,
              { closeButton: false, offset: L.point(0, -8) }
            )
            .openPopup();
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const saveLocationToDB = async () => {
    const token = localStorage.getItem("token"); 
    if (!token) {
      navigate("/signup");
      return;
    }

    if (!coordinates.lat || !coordinates.lng) {
      alert("Please select a valid location!");
      return;
    }

    try {
      const data =await updateUserLocation(token, coordinates);
      if (data.success) {
        alert("Location updated successfully!");
      } else {
        alert(`Failed to update location: ${data.message}`);
      }
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Error updating location. Please try again.");
    }
  };

  return (
    <div className="overlay">
      <div className="location-input-container">
        <div
          style={{
            borderBottomLeftRadius: "50%",
            width: "40px",
            height: "40px",
            backgroundColor: "#ffbf3f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderTopLeftRadius: "50%",
          }}
          className="search-icon"
        >
          <i className="bi bi-search" style={{ color: "white", fontSize: "18px" }}></i>
        </div>
        <div style={{ maxWidth: "300px" }}>
          <input
            type="text"
            placeholder="Enter location..."
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              fetchPredictions(e.target.value);
            }}
            autoCorrect="on"
            autoComplete="on"
            spellCheck="true"
          />
          {predictions.length > 0 && (
            <ul className="predictions-dropdown list-group">
              {predictions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  onClick={() => selectPrediction(prediction.description, prediction.place_id)}
                  className="list-group-item"
                >
                  {prediction.description}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          style={{
            width: "70px",
            height: "40px",
            backgroundColor: "#ffbf3f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            marginTop: "-2px",
          }}
          className="add-button"
        >
          <button onClick={saveLocationToDB} className="add-button">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLocation;

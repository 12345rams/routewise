import { useState } from "react";
import L from "leaflet";
import "./style.css";
import "./addLocation.css";
import myBusIcon from "../assets/images/bus-stop-removebg-preview.png";
import { createBus, fetchRoute } from "../apiService";
const API_KEY =import.meta.env.VITE_API_KEY;
const BusRouteManager = ({ map }) => {
    const [busDetails, setBusDetails] = useState({
        busId: "",
        state: "",
        name: "",
        startTime: "",
        endTime: "",
        startLocation: "",
        startCoords: null,
        endLocation: "",
        endCoords: null,
        stops: [],
        stopCoords: [],
        stopageTime: "",
        passengerCount: "",
    });
    const [predictions, setPredictions] = useState([]);
    const [stopPredictions, setStopPredictions] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [isSelectingStartLocation, setIsSelectingStartLocation] = useState(true);
    const [startLocation, setStartLocation] = useState("");
    const [endLocation, setEndLocation] = useState("");
    const [stopInput, setStopInput] = useState("");


    const fetchPredictions = async (input, type) => {
        if (!input.trim()) {
            if (type === "stop") setStopPredictions([]);
            else setPredictions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${encodeURIComponent(input)}&key=${API_KEY}`
            );
            const data = await response.json();
            if (data.status === "OK" && data.predictions.length > 0) {
                if (type === "stop") setStopPredictions(data.predictions);
                else setPredictions(data.predictions);
            } else {
                if (type === "stop") setStopPredictions([]);
                else setPredictions([]);
            }
        } catch (error) {
            console.error("Error fetching predictions:", error);
        }
    };

    var myIcon = L.icon({
        iconUrl: myBusIcon,
        iconSize: [30, 40],
    });

    const selectPrediction = async (description, placeId, type) => {
        if (type === "stop") {
            setStopPredictions([]);
        } else {
            setPredictions([]);
        }
        setSelectedPlaceId(placeId);

        try {
            const response = await fetch(
                `https://maps.gomaps.pro/maps/api/place/details/json?placeid=${placeId}&key=${API_KEY}`
            );
            const data = await response.json();
            if (data.status === "OK") {
                const { lat, lng } = data.result.geometry.location;
                if (map) {
                    map.setView([lat, lng], 13);
                    L.marker([lat, lng], { icon: myIcon }).addTo(map).bindPopup(description, { closeButton: false, offset: L.point(0, -8) }).openPopup();
                }

                if (type === "stop") {
                    setBusDetails((prev) => ({
                        ...prev,
                        stops: [...prev.stops, description],
                        stopCoords: [...prev.stopCoords, { lat, lng }],
                    }));
                    setStopInput("");
                } else {
                    setBusDetails((prev) => ({
                        ...prev,
                        [isSelectingStartLocation ? "startLocation" : "endLocation"]: description,
                        [isSelectingStartLocation ? "startCoords" : "endCoords"]: { lat, lng },
                    }));
                }

            }
        } catch (error) {
            console.error("Error fetching place details:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBusDetails((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async () => {
        console.log("Bus Details:", busDetails);
        if (!busDetails.startLocation || !busDetails.endLocation) return;

        const result = await createBus(busDetails);
        if (!result) return;

        console.log("Bus saved successfully:", result);
        if (!map) return;

        const route = await fetchRoute(busDetails);
        if (!route) return;

        L.polyline(route, { color: "red", weight: 4 }).addTo(map);
    };
    return (
        <div className="bus-route-overlay">
            <div className="bus-route-container">
                <div className="bus-route-title">
                    <h2>Add Bus Details</h2>
                </div>
                <div className="bus-route-form">
                    <div>
                        <label>Bus ID:</label>
                        <input type="text" name="busId" value={busDetails.busId} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label>Bus Name:</label>
                        <input type="text" name="name" value={busDetails.name} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label>Start Time:</label>
                        <input type="time" name="startTime" value={busDetails.startTime} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label>End Time:</label>
                        <input type="time" name="endTime" value={busDetails.endTime} onChange={handleInputChange} />
                    </div>
                    <div className="start_location_search">
                        <label>Start Location:</label>
                        <input
                            type="text"
                            placeholder="Search Start Location..."
                            value={startLocation}
                            onChange={(e) => {
                                fetchPredictions(e.target.value, "start");
                                setIsSelectingStartLocation(true);
                                setStartLocation(e.target.value);
                            }}
                        />
                        {predictions.length > 0 && (
                            <ul className="autocomplete-list list-group">
                                {predictions.map((p) => (
                                    <li key={p.place_id} onClick={() => selectPrediction(p.description, p.place_id, "start")} className="list-group-item">
                                        {p.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="start_location_search">
                        <label>End Location:</label>
                        <input
                            type="text"
                            placeholder="Search End Location..."
                            value={endLocation}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEndLocation(value);
                                setIsSelectingStartLocation(false);
                                fetchPredictions(value);
                            }}
                        />

                        {predictions.length > 0 && (
                            <ul className="autocomplete-list list-group">
                                {predictions.map((p) => (
                                    <li key={p.place_id} onClick={() => selectPrediction(p.description, p.place_id, "end")} className="list-group-item">
                                        {p.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="start_location_search">
                        <label>Stops:</label>
                        <input
                            type="text"
                            placeholder="Search Stops..."
                            value={stopInput}
                            onChange={(e) => {
                                fetchPredictions(e.target.value, "stop");
                                setStopInput(e.target.value);
                            }}
                        />
                        {stopPredictions.length > 0 && (
                            <ul className="autocomplete-list list-group">
                                {stopPredictions.map((p) => (
                                    <li key={p.place_id} onClick={() => selectPrediction(p.description, p.place_id, "stop")} className="list-group-item">
                                        {p.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button className="addBusBtn" onClick={handleSubmit}>Save & Draw Route</button>
                </div>
            </div>
        </div>
    );
};

export default BusRouteManager;

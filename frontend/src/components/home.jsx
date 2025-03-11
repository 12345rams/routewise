import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import AddLocation from "./addLocation";
import markerPerson from "../assets/images/placeholder-removebg-preview.png";
import AddBusLocation from "./addBusLocation";
import BusMap from "./busLayer";
import Signup from "./signup";
import passengerIcon from '../assets/images/placeholder-removebg-preview.png'
import { fetchPassengers, fetchBuses } from "../apiService"; 

const Home = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showBuses, setShowBuses] = useState(false);
  const [addBuses, setAddBuses] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [buses, setBuses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.token !== "");
  const [passengers, setPassengers] = useState([]);

  useEffect(() => {
    const loadPassengers = async () => {
      const data = await fetchPassengers();
      setPassengers(data);
    };
    loadPassengers();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([28.7041, 77.1025], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    const loadBuses = async () => {
      const data = await fetchBuses();
      setBuses(data);
    };
    loadBuses();
  }, []);
  const busIcon = L.icon({ iconUrl: passengerIcon, iconSize: [30, 40] });
  useEffect(() => {
    passengers.forEach((passenger) => {
      if (passenger.currLocation?.latitude && passenger.currLocation?.longitude) {
        L.marker([passenger.currLocation.latitude, passenger.currLocation.longitude],{icon:busIcon })
          .addTo(mapRef.current)
          .bindPopup(`You are here! ${passenger.email}`, { closeButton: false, offset: L.point(0, -8) })
          .openPopup();
      }
    });
  }, [passengers]);

  const myIcon = L.icon({
    iconUrl: markerPerson,
    iconSize: [30, 40],
  });

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (!mapRef.current) return;
          mapRef.current.setView([lat, lng], 15);

          if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng], { icon: myIcon })
              .addTo(mapRef.current)
              .bindPopup("You are here!", { closeButton: false, offset: L.point(0, -8) })
              .openPopup();
          } else {
            markerRef.current.setLatLng([lat, lng]);
          }
        },
        (error) => {
          alert("Error getting location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const flyToPosition = (lat, lon, name) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 10, { duration: 3 });
      L.popup({ closeButton: false, offset: L.point(0, -4) })
        .setLatLng([lat, lon])
        .setContent(`<b>${name}</b> is here!`)
        .openOn(mapRef.current);
    }
  };

  return (
    <div className="home">
      <div className="left-container">
        <div className="side-bar">
          <button onClick={() => setShowAddLocation(!showAddLocation)} className="btn btn-primary mb-2">
            <i className="bi bi-geo-alt-fill"></i>
          </button>
          <button className="btn btn-info mb-2" onClick={() => setAddBuses(!addBuses)}>
            <i className="bi bi-bus-front-fill"></i>
            <i className="bi bi-plus-lg"></i>
          </button>
          <button className="btn btn-info mb-2">
            <i className="bi bi-bus-front-fill"></i>
          </button>
          <button className="btn btn-secondary mb-2">
            <i className="bi bi-person-circle"></i>
          </button>
          <button className="btn btn-danger mb-2" onClick={locateMe}>
            <i className="bi bi-crosshair"></i>
          </button>
          <button className="btn btn-success mb-2" onClick={() => setShowBuses(!showBuses)}>
            <i className="bi bi-people-fill"></i>
          </button>
          <button
            className={`btn ${isLoggedIn ? "btn-danger" : "btn-primary"} mb-2`}
            onClick={() => setIsLoggedIn(!isLoggedIn)}
          >
            <i className={`bi ${isLoggedIn ? "bi-box-arrow-right" : "bi-box-arrow-in-right"}`}></i>
          </button>
          {!isLoggedIn && <Signup isLoggedIn={isLoggedIn} />}
        </div>

        <div className="left-content card">
          {showBuses ? (
            <div className="buses card contentLeft-container">
              <div className="titleLeft-container">
                <h2>Bus Details</h2>
              </div>
              <div className="search-bus">
                <i className="bi bi-search"></i>
                <input type="text" placeholder="Search for a Bus" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {buses.filter((bus) => bus.name.toLowerCase().includes(searchTerm.toLowerCase())).map((bus) => (
                <div key={bus.id} className="bus">
                  <i className="bi bi-bus-front-fill"></i>
                  <div>{bus.startLocation} -------- {bus.endLocation}</div>
                  <div>{showBuses && <BusMap map={mapRef.current} bus1={bus} />}</div>
                </div>
              ))}
            </div>
          ) :(
            <div className="passengers card contentLeft-container">
              <div className="titleLeft-container"> <h1>Passengers Details</h1></div>
             
              {passengers.filter((p) => p.email.toLowerCase().includes(searchTerm.toLowerCase())).map((passenger) => (
                <div key={passenger._id} className="passenger card" onClick={() => flyToPosition(passenger.currLocation?.latitude, passenger.currLocation?.longitude, passenger.email)}>
                  <i className="bi bi-person-circle"></i>
                  <div>{passenger.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="map-container">
          <div id="map" style={{ height: "400px" }}>Map loading...</div>
        </div>
        {showAddLocation && <AddLocation map={mapRef.current} />}
        {addBuses && <AddBusLocation map={mapRef.current} />}
      </div>
    </div>
  );
};

export default Home;

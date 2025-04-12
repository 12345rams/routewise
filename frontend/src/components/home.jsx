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
import { fetchPassengers, fetchBuses, updateUserLocation } from "../apiService";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import Chat from "./Chat";
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
  const navigate = useNavigate();
  useEffect(() => {
    const loadPassengers = async () => {
      const data = await fetchPassengers();
      setPassengers(data);
    };
    loadPassengers();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([22.9074872, 79.07306671], 6);
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
        L.marker([passenger.currLocation.latitude, passenger.currLocation.longitude], { icon: busIcon })
          .addTo(mapRef.current)
          .bindPopup(`You are here! ${passenger.email}`, { closeButton: false, offset: L.point(0, -8) })
          .openPopup();
        L.circleMarker([passenger.currLocation.latitude, passenger.currLocation.longitude], {
          color: 'orange',
          fillColor: 'rgb(255, 200, 99)',
          fillOpacity: 0.1,
          radius: 50
        }).addTo(mapRef.current);
      }
    });
  }, [passengers]);

  const myIcon = L.icon({
    iconUrl: markerPerson,
    iconSize: [30, 40],
  });
  const locateMe = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          let lat = position.coords.latitude;
          let lng = position.coords.longitude;
          if (!mapRef.current) return;
          mapRef.current.setView([lat, lng], 15);
          const token = localStorage.getItem("token");
          if (!token) {
            navigate("/signup");
            return;
          }
          if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng], { icon: myIcon })
              .addTo(mapRef.current)
              .bindPopup("You are here!", { closeButton: false, offset: L.point(0, -8) })
              .openPopup();
          } else {
            markerRef.current.setLatLng([lat, lng]);
          }
          const coordinates = {
            lat,
            lng
          }
          const data = await updateUserLocation(token, coordinates);
          if (data.success) {
            // alert("Location updated successfully!");
            toast.success("location added succefully");
          } else {
            toast.error(`Failed to update location: ${data.message}`);
          }
        },
        (error) => {
          toast.error("Error getting location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
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
  const showMsg=()=>{
    navigate('/chat');
  }
  return (
    <div className="home">
      <div className="left-container">
        <div className="side-bar">
          <button onClick={() => setShowAddLocation(!showAddLocation)} style={{border:'none',background:'#f8f9fa'}}>
          <i className="bi bi-geo-alt"
          style={{fontSize:'1.5rem',color:'black'}}
          ></i>
          </button>
          <button style={{border:'none',background:'#f8f9fa'}} onClick={() => setAddBuses(!addBuses)}>
            <i className="bi bi-bus-front-fill"
            
          style={{fontSize:'1.2rem',color:'black'}}></i>
            <i className="bi bi-plus-lg"
            
          style={{fontSize:'1rem',color:'black'}}></i>
          </button>
          <button style={{border:'none',background:'#f8f9fa'}} onClick={locateMe}>
            <i className="bi bi-crosshair"
            
          style={{fontSize:'1.5rem',color:'black'}}></i>
          </button>
          <button style={{border:'none',background:'#f8f9fa'}} onClick={() => setShowBuses(!showBuses)}>
            <i className="bi bi-people-fill"
            
          style={{fontSize:'1.5rem',color:'black'}}></i>
          </button>
          <button style={{border:'none',background:'#f8f9fa'}} onClick={showMsg}>
            <i className="bi bi-chat-dots"
            
          style={{fontSize:'1.5rem',color:'black'}}></i>
          </button>
          <button
            className={`btn ${isLoggedIn ? "btn-danger" : "btn-primary"} mb-2`}
            onClick={() => {
              setIsLoggedIn(!isLoggedIn)
            navigate("/signup");
            }}
          >
            <i style={{fontSize:'1.2rem'}} className={`bi ${isLoggedIn ? "bi-box-arrow-right" : "bi-box-arrow-in-right"}`
          }></i>
          </button>
          {!isLoggedIn && <Signup isLoggedIn={isLoggedIn} />}
        </div>
        <div className="left-content card">
          {showBuses ? (
            <div className="buses card contentLeft-container bus_details">
              <div className="titleLeft-container">
                <h2>Bus Details</h2>
              </div>
              <div className="search-bus">
                <i className="bi bi-search"></i>
                <input type="text" placeholder="Search for a Bus" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {buses.filter((bus) => bus.name.toLowerCase().includes(searchTerm.toLowerCase())).map((bus) => (
             <>   <div key={bus.id} className="bus"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1rem",
                  gap: "0.5rem",
                  cursor:'default',
                  borderBottom: '2px solid #a6a6a6' 
                }}
               
                >
                  <i className="bi bi-bus-front-fill"></i>
                  <div>{bus.startLocation} -------- {bus.endLocation}</div>
                  <div>{showBuses && <BusMap map={mapRef.current} bus1={bus} />}</div>
                  
                </div>

                </>
              ))} 
            </div>
          ) : (
            <div className="passengers card contentLeft-container passenger_details"
            style={{gap:'0.5rem'}}
            >
              <div className="titleLeft-container">
                <h1>Passengers Details</h1>
              </div>
              <div className="search-bus">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search for a Passenger"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {passengers
                .filter((p) => p.email.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((passenger) => (
                <div
                    key={passenger._id}
                    className="passenger card"
                    onClick={() => {
                      if (passenger.currLocation) {
                        flyToPosition(passenger.currLocation.latitude, passenger.currLocation.longitude, passenger.email);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem 1rem",
                      gap: "0.5rem",
                    cursor:'default',
                    }}
                    title={passenger.email}
                  >
                    <i className="bi bi-person-circle" style={{ fontSize: "1.2rem", flexShrink: 0 }}></i>
                    <div
                      style={{
                        flexGrow: 1,
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: "500",
                      }}
                    >
                      {passenger.email.length > 10 ? `${passenger.email.slice(0, 10)}...` : passenger.email}
                    </div>
                    <i className="bi bi-geo-alt-fill" style={{ fontSize: "1.2rem", flexShrink: 0 }}></i>
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
        <ToastContainer />
      </div>
    </div>
  );
};

export default Home;

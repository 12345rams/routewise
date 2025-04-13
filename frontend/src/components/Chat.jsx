import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { fetchPassengers, getMessages, sendMessages } from "../apiService";
import { ToastContainer, toast } from "react-toastify";
import "./Chat.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const socket = io(BASE_URL);

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const sender = localStorage.getItem("username");
  const navigate = useNavigate();

  // Fetch passengers
  useEffect(() => {
    const getPassenger = async () => {
      try {
        const data = await fetchPassengers();
        setPassengers(data);
      } catch (error) {
        console.error("Error fetching passengers:", error);
      }
    };
    getPassenger();
  }, []);

  // Setup socket.io and listen for online users and messages
  useEffect(() => {
    if (!sender) return;
    socket.emit("addUser", sender);

    socket.on("getUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("getUsers");
    };
  }, [sender]);

  // Fetch messages for the selected receiver
  useEffect(() => {
    const fetchMessages = async () => {
      if (!receiver) return;
      try {
        const res = await getMessages(sender, receiver);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();

    socket.on("receiveMessage", (data) => {
      if (data.sender === receiver || data.receiver === receiver) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [receiver, sender]);

  // Handle 'Enter' key press to send message
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handleSendMessage();
      }
    };

    const inputElement = document.querySelector(".write-message");
    inputElement?.addEventListener("keypress", handleKeyPress);

    return () => {
      inputElement?.removeEventListener("keypress", handleKeyPress);
    };
  });

  // Send message
  const handleSendMessage = async () => {
    if (message.trim() && receiver && sender) {
      try {
        const res = await sendMessages({ sender, receiver, content: message });
        const newMsg = res.data;
        socket.emit("sendMessage", newMsg);
        setMessages((prev) => [...prev, newMsg]);
        setMessage("");
      } catch (error) {
        toast.error("Error sending message");
      }
    } else {
      toast.error("Please login and select a user to chat.");
    }
  };

  // Filter passengers based on search input
  const filteredPassengers = passengers.filter((chat) =>
    chat.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container2">
      <div className="row2">
        <nav className="menu">
          <ul className="items">
            {[{ icon: "fa-home", action: () => navigate("/") },
            { icon: "fa-user" },
            { icon: "fa-pencil" },
            { icon: "fa-commenting" },
            { icon: "fa-file" },
            { icon: "fa-cog" }]
              .map((item, index) => (
                <li
                  key={index}
                  className={`item ${item.icon === "fa-commenting" ? "item-active" : ""}`}
                  onClick={item.action || (() => { })}
                >
                  <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                </li>
              ))}
          </ul>
        </nav>

        <section className="discussions">
          <div className="discussion search">
            <div className="searchbar">
              <i className="fa fa-search" aria-hidden="true"></i>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredPassengers.map((chat, index) => (
            <button key={index} onClick={() => setReceiver(chat.email)} className="passenger-chat-btn">
              <div className="discussion message-active" style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
                <div
                  className="photo"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1050&q=80)",
                  }}
                >
                  {onlineUsers.includes(chat.email) ? <div className="online"></div> : <div className="offline"></div>}
                </div>
                <div className="desc-contact">
                  <p className="name">{chat.email}</p>
                  <p className="message">Hi</p>
                </div>
                <div className="timer">12:09</div>
              </div>
            </button>
          ))}
        </section>

        <section className="chat">
          <div className="header-chat">
            <i className="icon fa fa-user-o" aria-hidden="true"></i>
            <p className="name">{receiver || "Select a user"}</p>
            <i className="icon clickable fa fa-ellipsis-h right" aria-hidden="true"></i>
          </div>

          <div className="messages-chat">
            {messages.map((msg, index) => (
              <div key={index} className="message text-only">
                <p className={`text ${msg.sender === sender ? "sender-message" : "receiver-message"}`}>
                  {msg.content}
                </p>
                <p className="timestamp">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </p>
              </div>
            ))}
          </div>

          <div className="footer-chat">
            <i className="icon fa fa-smile-o clickable" style={{ fontSize: "25pt" }} aria-hidden="true"></i>
            <input
              type="text"
              className="write-message"
              placeholder="Type your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <i
              className="icon fa fa-paper-plane clickable"
              style={{ fontSize: "20pt" }}
              aria-hidden="true"
              onClick={handleSendMessage}
            ></i>
          </div>
        </section>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Chat;

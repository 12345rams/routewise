import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./Chat.css";
import { fetchPassengers,getMessages, sendMessages} from "../apiService";
import { ToastContainer, toast } from 'react-toastify';
const BASE_URL =import.meta.env.VITE_BASE_URL;
const socket = io(BASE_URL);
const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const sender = localStorage.getItem("username");
  useEffect(() => {
    const fetchMessages = async () => {
      if (!receiver) {
        return;
      }
      try {
        const res = await getMessages(sender,receiver);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
    socket.on("receiveMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  });

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
  const sendMessage = async () => {
    if (message.trim() && receiver&&sender) {
      const newMessage = { sender, receiver, content: message };
      try {
        const message=sendMessages(newMessage);
        socket.emit("sendMessage", message);
        setMessage("");
      } catch (error) {
        toast.error("Error sending message");
      }
    }
    else{
      toast.error("first login");
    }
  };
  const filteredPassengers = passengers.filter((chat) =>
    chat.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container2">
      <div className="row2">
        <nav className="menu">
          <ul className="items">
            {["fa-home", "fa-user", "fa-pencil", "fa-commenting", "fa-file", "fa-cog"].map((icon, index) => (
              <li key={index} className={`item ${icon === "fa-commenting" ? "item-active" : ""}`}>
                <i className={`fa ${icon}`} aria-hidden="true"></i>
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
              <div className="discussion message-active">
                <div
                  className="photo"
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1050&q=80)`,
                  }}
                >
                  <div className="online"></div>
                </div>
                <div className="desc-contact">
                  <p className="name">{chat.email}</p>
                  <p className="message">Hi</p>
                </div>
                <div className="timer">12.09</div>
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
                <p className={`text ${(msg.sender === sender ? "sender-message" : "receiver-message")}`}>{msg.content}</p>
                <p>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
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
              onClick={sendMessage}
            ></i>
          </div>
        </section>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Chat;

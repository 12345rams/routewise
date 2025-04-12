import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import SignIn from "./components/signIn";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Signup from "./components/signup";
import Chat from "./components/Chat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signUp" element={<Signup />} />
        <Route path="/chat" element={<Chat/>}/>
      </Routes>
    </Router>
  );
}

export default App;

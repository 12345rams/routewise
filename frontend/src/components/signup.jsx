import { useState } from "react";
import { registerUser,loginUser } from "../apiService";
import logo2 from "../assets/images/Screenshot (243).png";
import logo from "../assets/images/google-icon-2048x2048-czn3g8x8.png";
import bus from "../assets/images/uri_ifs___M_152c3fc7-bbc8-4388-8938-2702edeb459e.jpg";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./signup.css";
import { useNavigate } from "react-router-dom"; 
const Signup = ({isLoggedIn}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
     const navigate=useNavigate();
    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== repeatPassword) {
            setError("Passwords do not match!");
            return;
        }
        setLoading(true);
        setError("");
        try {
        let data = await registerUser(email, password);
           // alert("Signup successful!");
            const response = await loginUser(email, password);
            if (!response&&data) {
                throw new Error(response.message || "Sign in failed!");
            }
            data=await response.json();
            localStorage.setItem("token",data);
            localStorage.setItem("username",email);
            isLoggedIn=true;
            navigate('/');
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup">
            <img className="logo2" src={logo2} alt="Logo" />
            <div className="outer">
                <div className="signupcontainer">
                    <h2 className="signup-header">Sign up now</h2>
                    <p className="signup-subtext">Create a free account</p>

                    <button className="signup-google">
                        <div className="google-button-content">
                            <img src={logo} alt="Google" className="google-logo" />
                            <div>Sign up with Google</div>
                        </div>
                    </button>
                    <p className="or-text">or</p>
                    <form className="signupform" onSubmit={handleSignup}>
                        <label htmlFor="email">Email address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <label htmlFor="repeatpassword">Repeat password</label>
                        <input
                            type="password"
                            name="repeatpassword"
                            id="repeatpassword"
                            placeholder="Repeat password"
                            required
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                        />

                        {error && <p className="error-text">{error}</p>}

                        <button className="signup-button" type="submit" disabled={loading}>
                            {loading ? "Signing up..." : "Sign up"}
                        </button>

                        <p className="signin-link">
                            Already have an account? <a href="/signIn">Sign in</a>
                        </p>
                    </form>
                </div>

                <div className="imageofroutewisecontainer">
                    <img className="imageofroutewise" src={bus} alt="Bus" />
                </div>
            </div>
        </div>
    );
};

export default Signup;

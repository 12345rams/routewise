import { useState } from "react";
import { useNavigate } from "react-router-dom";  
import logo2 from '../assets/images/Screenshot (243).png';
import logo from '../assets/images/google-icon-2048x2048-czn3g8x8.png';
import bus from "../assets/images/uri_ifs___M_152c3fc7-bbc8-4388-8938-2702edeb459e.jpg";
import { loginUser } from "../apiService";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./signup.css"; 
const SignIn = ({isLoggedIn}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();
    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await loginUser(email, password);
            if (!response) {
                throw new Error(response.message || "Sign in failed!");
            }
            localStorage.setItem("token", response);
            localStorage.setItem("username",email);
            isLoggedIn=false;
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
                    <h2 className="signup-header">Sign in</h2>
                    <p className="signup-subtext">Access your account</p>

                    <button className="signup-google">
                        <div className="google-button-content">
                            <img src={logo} alt="Google" className="google-logo" />
                            <div>Sign in with Google</div>
                        </div>
                    </button>

                    <p className="or-text">or</p>

                    <form className="signupform" onSubmit={handleSignIn}>
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

                        {error && <p className="error-text">{error}</p>}

                        <button className="signup-button" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                        <p className="signin-link">
                            Don't have an account? <a href="/signup">Sign up</a>
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

export default SignIn;

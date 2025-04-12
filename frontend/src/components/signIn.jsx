import { useState } from "react";
import { useNavigate } from "react-router-dom";  
import logo2 from '../assets/images/Screenshot (243).png';
import logo from '../assets/images/google-icon-2048x2048-czn3g8x8.png';
import bus from "../assets/images/uri_ifs___M_152c3fc7-bbc8-4388-8938-2702edeb459e.jpg";
import { loginUser } from "../apiService";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./signup.css"; 

const SignIn = () => {
    let  isLoggedIn=false;
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
            let response = await loginUser(email, password);
            if (!response.ok) {
                throw new Error(response.message || "Sign in failed!");
            }
            response= await response.json();
            localStorage.setItem("token", response.token);
            localStorage.setItem("username", email);
            isLoggedIn = false;
            toast.success("Signin successful!");
            navigate('/');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
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
                            Don't have an account? 
                            <button onClick={()=>{
                                navigate('/signUp');
                            }} >Signin</button>
                        </p>
                    </form>
                </div>

                <div className="imageofroutewisecontainer">
                    <img className="imageofroutewise" src={bus} alt="Bus" />
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default SignIn;

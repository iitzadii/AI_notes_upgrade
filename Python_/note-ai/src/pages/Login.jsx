import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../api/AuthContext";
import "./Auth.css";

function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await api.post("/auth/login", {
                identifier,
                password,
            });

            login(data.token);
            navigate("/notes");

        } catch (err) {
            setError(err.message || "Login failed");
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <h1>Welcome Back</h1>
                <p className="auth-subtitle">
                    Login to continue to your notes
                </p>

                <form onSubmit={handleLogin}>

                    <div className="input-group">
                        <label>Username or Email</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Enter your username or email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <button className="auth-button" type="submit">
                        Login
                    </button>

                </form>

                <div className="auth-switch">
                    Don't have an account?
                    <Link to="/signup"> Create an account</Link>
                </div>

            </div>

        </div>
    );
}

export default Login;
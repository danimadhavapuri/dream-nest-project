import React, { useState } from "react";
import "../styles/Login.scss";
import { setLogin } from "../redux/state";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected here from registration or a protected route
  const successMessage = location.state?.message;
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.token && data?.user) {
        dispatch(
          setLogin({
            user: data.user,
            token: data.token,
          })
        );
        navigate(from, { replace: true });
      } else {
        setErrorMessage(data?.message || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Unable to connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login_content">
        <form className="login_content_form" onSubmit={handleSubmit}>
          {successMessage && (
            <div
              style={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              {errorMessage}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>

        <Link to="/register" style={{ marginTop: "15px", display: "inline-block" }}>
          Don't have an account? Sign Up Here
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
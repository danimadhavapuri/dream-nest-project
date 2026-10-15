import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.scss";
import { API_BASE_URL } from "../services/api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "profileImage" ? files[0] : value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword || formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordMatch) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const registerForm = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          registerForm.append(key, formData[key]);
        }
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        body: registerForm,
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        navigate("/login", {
          state: { message: "Account created successfully! Please log in." },
        });
      } else {
        setErrorMessage(data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage("Unable to connect to the server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        <form className="register_content_form" onSubmit={handleSubmit}>
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
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Password (minimum 6 characters)"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            minLength={6}
            required
          />
          <input
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            required
          />

          {!passwordMatch && (
            <p style={{ color: "#d32f2f", fontSize: "13px", margin: "2px 0" }}>
              Passwords do not match!
            </p>
          )}

          <input
            id="image"
            type="file"
            name="profileImage"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="image" style={{ cursor: "pointer" }}>
            <img src="/assets/addImage.png" alt="Upload avatar" />
            <p>Upload Your Photo</p>
          </label>

          {formData.profileImage && (
            <img
              src={URL.createObjectURL(formData.profileImage)}
              alt="Avatar preview"
              style={{ maxWidth: "80px", borderRadius: "50%", objectFit: "cover" }}
            />
          )}

          <button
            type="submit"
            disabled={!passwordMatch || loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "CREATING ACCOUNT..." : "REGISTER"}
          </button>
        </form>

        <Link to="/login" style={{ marginTop: "15px", display: "inline-block" }}>
          Already have an account? Log In Here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
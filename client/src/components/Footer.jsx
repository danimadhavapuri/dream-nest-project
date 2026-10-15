import "../styles/Footer.scss";
import { LocalPhone, Email } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer_left">
        <Link to="/">
          <img src="/assets/logo.png" alt="Dream Nest" />
        </Link>
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#717171" }}>
          © {new Date().getFullYear()} Dream Nest, Inc. All rights reserved.
        </p>
      </div>

      <div className="footer_center">
        <h3>Useful Links</h3>
        <ul>
          <li>About Us</li>
          <li>Terms and Conditions</li>
          <li>Privacy Policy</li>
          <li>Cancellation & Refund</li>
        </ul>
      </div>

      <div className="footer_right">
        <h3>Contact</h3>
        <div className="footer_right_info">
          <LocalPhone />
          <p>+1 (800) 555-NEST</p>
        </div>
        <div className="footer_right_info">
          <Email />
          <p>support@dreamnest.com</p>
        </div>
        <img src="/assets/payment.png" alt="Accepted payment methods" />
      </div>
    </div>
  );
};

export default Footer;
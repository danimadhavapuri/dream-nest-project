import { IconButton } from "@mui/material";
import { Search, Person, Menu } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/Navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { setLogout } from "../redux/state";
import { getImageUrl } from "../services/api";

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Reset imgError if user changes
  useEffect(() => {
    setImgError(false);
  }, [user]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (search.trim()) {
      navigate(`/properties/search/${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src="/assets/logo.png" alt="Dream Nest" />
      </Link>

      <form className="navbar_search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search destinations, villas, cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton disabled={search.trim() === ""} type="submit">
          <Search sx={{ color: variables.pinkred }} />
        </IconButton>
      </form>

      <div className="navbar_right" ref={dropdownRef}>
        <Link to={user ? "/create-listing" : "/login"} className="host">
          Become A Host
        </Link>

        <button
          className="navbar_right_account"
          onClick={() => setDropdownMenu((prev) => !prev)}
          aria-label="User menu"
        >
          <Menu sx={{ color: variables.darkgrey }} />
          {!user || !user.profileImagePath || imgError ? (
            <Person sx={{ color: variables.darkgrey }} />
          ) : (
            <img
              src={getImageUrl(user.profileImagePath)}
              alt="User avatar"
              onError={() => setImgError(true)}
              style={{
                width: "32px",
                height: "32px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          )}
        </button>

        {dropdownMenu && !user && (
          <div className="navbar_right_accountmenu">
            <Link to="/login" onClick={() => setDropdownMenu(false)}>
              Log In
            </Link>
            <Link to="/register" onClick={() => setDropdownMenu(false)}>
              Sign Up
            </Link>
          </div>
        )}

        {dropdownMenu && user && (
          <div className="navbar_right_accountmenu">
            <Link to={`/${user._id}/trips`} onClick={() => setDropdownMenu(false)}>
              Trip List
            </Link>
            <Link to={`/${user._id}/wishList`} onClick={() => setDropdownMenu(false)}>
              Wish List
            </Link>
            <Link to={`/${user._id}/properties`} onClick={() => setDropdownMenu(false)}>
              Property List
            </Link>
            <Link to={`/${user._id}/reservations`} onClick={() => setDropdownMenu(false)}>
              Reservation List
            </Link>
            <Link to="/create-listing" onClick={() => setDropdownMenu(false)}>
              Become A Host
            </Link>
            <hr style={{ margin: "5px 0", border: "none", borderTop: "1px solid #f0f0f0" }} />
            <Link
              to="/login"
              onClick={() => {
                dispatch(setLogout());
                setDropdownMenu(false);
              }}
              style={{ color: "#e51d54" }}
            >
              Log Out
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

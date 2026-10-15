import "../styles/List.scss";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import { useEffect, useState, useCallback } from "react";
import { setPropertyList } from "../redux/state";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const propertyList = user?.propertyList || [];

  const dispatch = useDispatch();

  const getPropertyList = useCallback(async () => {
    if (!user?._id) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${user._id}/properties`
      );
      const data = await response.json();
      dispatch(setPropertyList(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Fetch all properties failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?._id, dispatch]);

  useEffect(() => {
    getPropertyList();
  }, [getPropertyList]);

  const handleDeleteProperty = async (propertyId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });

      if (response.ok) {
        dispatch(
          setPropertyList(propertyList.filter((prop) => prop._id !== propertyId))
        );
      }
    } catch (err) {
      console.error("Failed to delete property:", err);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Property List</h1>

      {propertyList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#666" }}>
          <h2>You haven't published any properties yet!</h2>
          <p style={{ marginTop: "10px", marginBottom: "20px" }}>
            Share your space with travelers from around the world and start earning today.
          </p>
          <Link
            to="/create-listing"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#f8395a",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Create A Listing
          </Link>
        </div>
      ) : (
        <div className="list">
          {propertyList.map((property) => (
            <ListingCard
              key={property._id}
              listingId={property._id}
              creator={property.creator}
              listingPhotoPaths={property.listingPhotoPaths}
              city={property.city}
              province={property.province}
              country={property.country}
              category={property.category}
              type={property.type}
              price={property.price}
              booking={false}
              onAction={() => handleDeleteProperty(property._id)}
              actionLabel="Delete"
            />
          ))}
        </div>
      )}

      <Footer />
    </>
  );
};

export default PropertyList;
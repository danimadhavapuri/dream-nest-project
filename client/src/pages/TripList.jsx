import { useEffect, useState, useCallback } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setTripList } from "../redux/state";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const userId = user?._id;
  const tripList = user?.tripList || [];

  const dispatch = useDispatch();

  const getTripList = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/trips`);
      const data = await response.json();
      dispatch(setTripList(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Fetch Trip List failed!", err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, dispatch]);

  useEffect(() => {
    getTripList();
  }, [getTripList]);

  const handleCancelTrip = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );
    if (!confirmCancel) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Update local redux state
        dispatch(setTripList(tripList.filter((trip) => trip._id !== bookingId)));
      }
    } catch (err) {
      console.error("Failed to cancel trip:", err);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>

      {tripList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#666" }}>
          <h2>No upcoming trips planned yet!</h2>
          <p style={{ marginTop: "10px", marginBottom: "20px" }}>
            Explore incredible homes, villas, beachfronts, and windmills across the world.
          </p>
          <Link
            to="/"
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
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="list">
          {tripList.map((trip) => {
            const listing = trip.listingId;
            if (!listing) return null;

            return (
              <ListingCard
                key={trip._id}
                listingId={listing._id}
                creator={trip.hostId?._id || trip.hostId}
                listingPhotoPaths={listing.listingPhotoPaths}
                city={listing.city}
                province={listing.province}
                country={listing.country}
                category={listing.category}
                startDate={trip.startDate}
                endDate={trip.endDate}
                totalPrice={trip.totalPrice}
                booking={true}
                onAction={() => handleCancelTrip(trip._id)}
                actionLabel="Cancel Trip"
              />
            );
          })}
        </div>
      )}

      <Footer />
    </>
  );
};

export default TripList;
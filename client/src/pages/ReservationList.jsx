import { useEffect, useState, useCallback } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setReservationList } from "../redux/state";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../services/api";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const userId = user?._id;
  const reservationList = user?.reservationList || [];

  const dispatch = useDispatch();

  const getReservationList = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/reservations`
      );
      const data = await response.json();
      dispatch(setReservationList(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Fetch Reservation List failed!", err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, dispatch]);

  useEffect(() => {
    getReservationList();
  }, [getReservationList]);

  const handleCancelReservation = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this guest's reservation?"
    );
    if (!confirmCancel) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        dispatch(
          setReservationList(
            reservationList.filter((item) => item._id !== bookingId)
          )
        );
      }
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Reservation List</h1>

      {reservationList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#666" }}>
          <h2>No guest reservations yet!</h2>
          <p style={{ marginTop: "10px" }}>
            When guests book one of your properties, you'll see all their booking details and dates here.
          </p>
        </div>
      ) : (
        <div className="list">
          {reservationList.map((item) => {
            const listing = item.listingId;
            if (!listing) return null;

            return (
              <ListingCard
                key={item._id}
                listingId={listing._id}
                creator={item.hostId?._id || item.hostId}
                listingPhotoPaths={listing.listingPhotoPaths}
                city={listing.city}
                province={listing.province}
                country={listing.country}
                category={listing.category}
                startDate={item.startDate}
                endDate={item.endDate}
                totalPrice={item.totalPrice}
                booking={true}
                onAction={() => handleCancelReservation(item._id)}
                actionLabel="Cancel Reservation"
              />
            );
          })}
        </div>
      )}

      <Footer />
    </>
  );
};

export default ReservationList;
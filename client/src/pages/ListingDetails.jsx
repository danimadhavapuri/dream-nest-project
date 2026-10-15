import { useEffect, useState, useCallback } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import { API_BASE_URL, getImageUrl } from "../services/api";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const customerId = user?._id;

  const getListingDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${listingId}`);
      if (!response.ok) {
        throw new Error("Property not found");
      }
      const data = await response.json();
      setListing(data);
    } catch (err) {
      console.error("Fetch Listing Details Failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    getListingDetails();
  }, [getListingDetails]);

  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to next day
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
    if (bookingError) setBookingError("");
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  // Ensure minimum 1 day stay calculation
  const rawDiff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  const dayCount = Math.max(1, rawDiff);

  const isOwner = user && listing?.creator && (user._id === (listing.creator._id || listing.creator));

  /* SUBMIT BOOKING */
  const handleSubmit = async () => {
    if (!user) {
      navigate("/login", {
        state: { message: "Please log in to book this property." },
      });
      return;
    }

    if (isOwner) {
      setBookingError("You cannot book your own property!");
      return;
    }

    setIsSubmitting(true);
    setBookingError("");

    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id || listing.creator,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      };

      const response = await fetch(`${API_BASE_URL}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      } else {
        setBookingError(data?.message || "Failed to complete booking. Please try again.");
      }
    } catch (err) {
      console.error("Submit Booking Failed:", err.message);
      setBookingError("Network error while submitting booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safely extract amenities as a flat array of strings
  const amenitiesList = Array.isArray(listing?.amenities)
    ? listing.amenities
        .flatMap((item) => (typeof item === "string" ? item.split(",") : item))
        .map((item) => (typeof item === "string" ? item.trim() : item))
        .filter(Boolean)
    : [];

  if (loading) {
    return <Loader />;
  }

  if (!listing) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <h2>Listing Not Found</h2>
          <p style={{ marginTop: "10px", color: "#666" }}>
            The property you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "20px",
              padding: "10px 24px",
              backgroundColor: "#f8395a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item, index) => (
            <img
              key={index}
              src={getImageUrl(item)}
              alt={`Property view ${index + 1}`}
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province ? `${listing.province}, ` : ""}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests · {listing.bedroomCount} bedroom(s) ·{" "}
          {listing.bedCount} bed(s) · {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={getImageUrl(listing.creator?.profileImagePath, "/assets/beach_cat.jpg")}
            alt={listing.creator ? `${listing.creator.firstName}'s avatar` : "Host avatar"}
            onError={(e) => {
              e.currentTarget.src = "/assets/beach_cat.jpg";
            }}
            style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
          />
          <h3>
            Hosted by {listing.creator?.firstName || "Host"}{" "}
            {listing.creator?.lastName || ""}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        {listing.highlight && (
          <>
            <h3>{listing.highlight}</h3>
            <p>{listing.highlightDesc}</p>
            <hr />
          </>
        )}

        <div className="booking">
          <div>
            <h2>What this place offers</h2>
            <div className="amenities">
              {amenitiesList.length > 0 ? (
                amenitiesList.map((item, index) => {
                  const facilityMatch = facilities.find(
                    (f) => f.name.toLowerCase() === item.toLowerCase()
                  );
                  return (
                    <div className="facility" key={index}>
                      <div className="facility_icon">
                        {facilityMatch?.icon || "✨"}
                      </div>
                      <p>{item}</p>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "#777" }}>No specific amenities listed.</p>
              )}
            </div>
          </div>

          <div>
            <h2>Select your dates</h2>
            <div className="date-range-calendar">
              <DateRange
                ranges={dateRange}
                onChange={handleSelect}
                minDate={new Date()}
              />
              <h2>
                ${listing.price} × {dayCount} {dayCount > 1 ? "nights" : "night"}
              </h2>

              <h2>Total price: ${listing.price * dayCount}</h2>
              <p>Check-in: {dateRange[0].startDate.toDateString()}</p>
              <p>Check-out: {dateRange[0].endDate.toDateString()}</p>

              {bookingError && (
                <p style={{ color: "#d32f2f", marginTop: "10px", fontWeight: "bold" }}>
                  {bookingError}
                </p>
              )}

              <button
                className="button"
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isOwner}
                style={{
                  opacity: isOwner ? 0.5 : 1,
                  cursor: isOwner ? "not-allowed" : "pointer",
                }}
              >
                {isOwner
                  ? "YOUR PROPERTY"
                  : isSubmitting
                  ? "CONFIRMING..."
                  : "BOOK RESERVATION"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;
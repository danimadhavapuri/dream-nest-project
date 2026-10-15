import { useState, useEffect, useCallback } from "react";
import "../styles/List.scss";
import Navbar from "../components/Navbar";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import Loader from "../components/Loader";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../services/api";

const CategoryPage = () => {
  const [loading, setLoading] = useState(true);
  const { category } = useParams();

  const dispatch = useDispatch();
  const listings = useSelector((state) => state.listings) || [];

  const getFeedListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/properties?category=${encodeURIComponent(category)}`
      );
      const data = await response.json();
      dispatch(setListings({ listings: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error("Fetch Listings Failed:", err.message);
      dispatch(setListings({ listings: [] }));
    } finally {
      setLoading(false);
    }
  }, [category, dispatch]);

  useEffect(() => {
    getFeedListings();
  }, [getFeedListings]);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">{category} Listings</h1>

      {listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#666" }}>
          <h2>No properties found in "{category}"</h2>
          <p style={{ marginTop: "10px", marginBottom: "20px" }}>
            Explore other categories or check back later.
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
            All Categories
          </Link>
        </div>
      ) : (
        <div className="list">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listingId={listing._id}
              creator={listing.creator}
              listingPhotoPaths={listing.listingPhotoPaths}
              city={listing.city}
              province={listing.province}
              country={listing.country}
              category={listing.category}
              type={listing.type}
              price={listing.price}
              booking={false}
            />
          ))}
        </div>
      )}

      <Footer />
    </>
  );
};

export default CategoryPage;
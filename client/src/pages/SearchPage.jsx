import { useParams, Link } from "react-router-dom";
import "../styles/List.scss";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import { useEffect, useState, useCallback } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../services/api";

const SearchPage = () => {
  const [loading, setLoading] = useState(true);
  const { search } = useParams();
  const listings = useSelector((state) => state.listings) || [];

  const dispatch = useDispatch();

  const getSearchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/properties/search/${encodeURIComponent(search)}`
      );
      const data = await response.json();
      dispatch(setListings({ listings: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error("Fetch Search List failed!", err.message);
      dispatch(setListings({ listings: [] }));
    } finally {
      setLoading(false);
    }
  }, [search, dispatch]);

  useEffect(() => {
    getSearchListings();
  }, [getSearchListings]);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Results for "{search}"</h1>

      {listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#666" }}>
          <h2>No results found for "{search}"</h2>
          <p style={{ marginTop: "10px", marginBottom: "20px" }}>
            Try searching for a different city, country (e.g., USA, Canada, France), or category.
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
            Browse All Listings
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

export default SearchPage;
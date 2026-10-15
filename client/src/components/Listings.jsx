import { useEffect, useState, useCallback, useMemo } from "react";
import { categories } from "../data";
import "../styles/Listings.scss";
import ListingCard from "./ListingCard";
import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import { setListings } from "../redux/state";
import { API_BASE_URL } from "../services/api";

const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const rawListings = useSelector((state) => state.listings);
  const listings = useMemo(
    () => (Array.isArray(rawListings) ? rawListings : []),
    [rawListings]
  );

  const getFeedListings = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        selectedCategory !== "All"
          ? `${API_BASE_URL}/properties?category=${encodeURIComponent(selectedCategory)}`
          : `${API_BASE_URL}/properties`;

      const response = await fetch(url);
      const data = await response.json();
      dispatch(setListings({ listings: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error("Fetch Listings Failed", err.message);
      dispatch(setListings({ listings: [] }));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, dispatch]);

  useEffect(() => {
    getFeedListings();
  }, [getFeedListings]);

  // When "All" is selected, display only one representative property card per category
  // (15 distinct cards total, one for each category, in the exact visual order of the category bar)
  // When a specific category is selected, display all 4 listings for that category
  const displayedListings = useMemo(() => {
    if (selectedCategory !== "All") {
      return listings;
    }

    // Map each category (lowercase) to its first found listing
    const catMap = new Map();
    listings.forEach((item) => {
      if (item.category && !catMap.has(item.category.toLowerCase())) {
        catMap.set(item.category.toLowerCase(), item);
      }
    });

    // Order representative cards matching the data.js categories order
    const ordered = [];
    categories.forEach((catObj) => {
      if (catObj.label === "All") return;
      const found = catMap.get(catObj.label.toLowerCase());
      if (found) {
        ordered.push(found);
      }
    });

    // Fallback in case there are categories in DB not in data.js
    catMap.forEach((item, key) => {
      if (!ordered.some((l) => l.category && l.category.toLowerCase() === key)) {
        ordered.push(item);
      }
    });

    return ordered;
  }, [listings, selectedCategory]);

  return (
    <>
      <div className="category-list">
        {categories?.map((category, index) => (
          <div
            className={`category ${category.label === selectedCategory ? "selected" : ""}`}
            key={index}
            onClick={() => setSelectedCategory(category.label)}
          >
            <div className="category_icon">{category.icon}</div>
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : displayedListings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
          <h2>No properties found in "{selectedCategory}"</h2>
          <p style={{ marginTop: "10px" }}>
            Be the first to list a property in this category!
          </p>
        </div>
      ) : (
        <div className="listings">
          {displayedListings.map((listing) => (
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
    </>
  );
};

export default Listings;

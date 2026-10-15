import { useEffect } from "react";
import "../styles/List.scss";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

const WishList = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const rootWishList = useSelector((state) => state.wishList) || [];
  const wishList = Array.isArray(user?.wishList) ? user.wishList : rootWishList;

  useEffect(() => {
    const fetchWishList = async () => {
      if (!user?._id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/users/${user._id}/wishList`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            dispatch(setWishList(data));
          }
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    };

    fetchWishList();
  }, [user?._id, dispatch]);

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>

      {wishList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#666" }}>
          <h2>Your wish list is currently empty</h2>
          <p style={{ marginTop: "10px", marginBottom: "20px" }}>
            As you search, click the heart icon on any property to save your favorites here.
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
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="list">
          {wishList.map((item) => {
            const id = item?._id ? item._id : item;
            return (
              <ListingCard
                key={id}
                listingId={id}
                creator={item?.creator}
                listingPhotoPaths={item?.listingPhotoPaths || []}
                city={item?.city || ""}
                province={item?.province || ""}
                country={item?.country || ""}
                category={item?.category || ""}
                type={item?.type || ""}
                price={item?.price || 0}
                booking={false}
              />
            );
          })}
        </div>
      )}

      <Footer />
    </>
  );
};

export default WishList;
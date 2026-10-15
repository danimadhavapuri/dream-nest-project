import { useState } from "react";
import "../styles/ListingCard.scss";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
  DeleteOutline,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import { API_BASE_URL, getImageUrl } from "../services/api";

const ListingCard = ({
  listingId,
  creator,
  listingPhotoPaths = [],
  city,
  province,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking = false,
  onAction,
  actionLabel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevSlide = (e) => {
    e.stopPropagation();
    if (!listingPhotoPaths || listingPhotoPaths.length === 0) return;
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + listingPhotoPaths.length) % listingPhotoPaths.length
    );
  };

  const goToNextSlide = (e) => {
    e.stopPropagation();
    if (!listingPhotoPaths || listingPhotoPaths.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % listingPhotoPaths.length);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const rootWishList = useSelector((state) => state.wishList) || [];
  const wishList = Array.isArray(user?.wishList) ? user.wishList : rootWishList;

  const isLiked = wishList?.some((item) => {
    const id = item?._id ? item._id.toString() : item?.toString();
    return Boolean(id && listingId && id === listingId.toString());
  });

  const patchWishList = async (e) => {
    e.stopPropagation();
    if (!listingId) return;

    // 1. Instantly compute and apply optimistic state
    const currentList = wishList || [];
    let updatedList;

    if (isLiked) {
      updatedList = currentList.filter((item) => {
        const id = item?._id ? item._id.toString() : item?.toString();
        return id !== listingId?.toString();
      });
    } else {
      const newFavorite = {
        _id: listingId,
        creator,
        listingPhotoPaths,
        city,
        province,
        country,
        category,
        type,
        price,
      };
      updatedList = [...currentList, newFavorite];
    }

    // Immediately update Redux so the heart flips color with zero delay
    dispatch(setWishList(updatedList));

    // 2. If user is logged in, sync with server in the background
    if (user?._id) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/${user._id}/${listingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (response.ok && data?.wishList) {
          dispatch(setWishList(data.wishList));
        }
      } catch (err) {
        console.error("Failed to sync wishlist with backend:", err);
      }
    }
  };

  return (
    <div
      className="listing-card"
      onClick={() => {
        if (listingId) {
          navigate(`/properties/${listingId}`);
        }
      }}
    >
      <div className="slider-container">
        <div
          className="slider"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {listingPhotoPaths && listingPhotoPaths.length > 0 ? (
            listingPhotoPaths.map((photo, index) => (
              <div key={index} className="slide">
                <img
                  src={getImageUrl(photo)}
                  alt={`View ${index + 1} of destination`}
                  loading="lazy"
                />
                {listingPhotoPaths.length > 1 && (
                  <>
                    <div className="prev-button" onClick={goToPrevSlide}>
                      <ArrowBackIosNew sx={{ fontSize: "14px" }} />
                    </div>
                    <div className="next-button" onClick={goToNextSlide}>
                      <ArrowForwardIos sx={{ fontSize: "14px" }} />
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="slide">
              <img src="/assets/lux_cat.jpg" alt="Default destination" />
            </div>
          )}
        </div>
      </div>

      <h3>
        {city || "Unknown City"}, {province ? `${province}, ` : ""}{country || "Worldwide"}
      </h3>
      <p>{category}</p>

      {!booking ? (
        <>
          <p>{type}</p>
          <p>
            <span>${price}</span> per night
          </p>
        </>
      ) : (
        <>
          <p>
            {startDate} - {endDate}
          </p>
          <p>
            <span>${totalPrice}</span> total
          </p>
        </>
      )}

      {/* Wishlist favorite button (only for browsing listings, not bookings) */}
      {!booking && (
        <button
          className="favorite"
          onClick={patchWishList}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isLiked ? (
            <Favorite sx={{ color: "red" }} />
          ) : (
            <Favorite sx={{ color: "white" }} />
          )}
        </button>
      )}

      {/* Delete / Cancel action button if passed from parent */}
      {onAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "20px",
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            fontSize: "12px",
            color: "#d32f2f",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
          title={actionLabel || "Action"}
        >
          <DeleteOutline sx={{ fontSize: "16px", color: "#d32f2f" }} />
          {actionLabel || "Remove"}
        </button>
      )}
    </div>
  );
};

export default ListingCard;

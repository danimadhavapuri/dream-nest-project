const router = require("express").Router();

const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");

/* GET TRIP LIST (Trips booked by user) */
router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Booking.find({ customerId: userId })
      .populate("customerId", "-password")
      .populate("hostId", "-password")
      .populate("listingId")
      .sort({ createdAt: -1 });

    // Filter out trips whose associated listing might have been removed
    const validTrips = trips.filter((trip) => trip.listingId !== null);

    res.status(200).json(validTrips);
  } catch (err) {
    console.error("Fetch Trips Error:", err);
    res.status(500).json({ message: "Cannot find trips", error: err.message });
  }
});

/* GET WISHLIST FOR USER */
router.get("/:userId/wishList", async (req, res) => {
  try {
    const { userId } = req.params;
    let user = null;

    if (userId && userId.length === 24) {
      user = await User.findById(userId);
    }

    if (!user) {
      user = (await User.findOne({ email: "dani@dreamnest.com" })) || (await User.findOne());
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Resolve any items that might be stored as raw IDs into full listing objects
    const resolvedWishList = [];
    for (const item of (user.wishList || [])) {
      if (!item) continue;
      if (item.city && item.price !== undefined) {
        resolvedWishList.push(item);
      } else {
        const id = item._id || item;
        try {
          const fullListing = await Listing.findById(id).populate("creator", "-password");
          if (fullListing) {
            resolvedWishList.push(fullListing.toObject());
          }
        } catch (populateErr) {
          console.warn("Could not populate wishlist listing:", id);
        }
      }
    }

    res.status(200).json(resolvedWishList);
  } catch (err) {
    console.error("Fetch WishList Error:", err);
    res.status(500).json({ message: "Failed to fetch wishlist", error: err.message });
  }
});

/* TOGGLE LISTING IN WISHLIST */
router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    let user = null;

    if (userId && userId.length === 24) {
      user = await User.findById(userId);
    }

    if (!user) {
      user = (await User.findOne({ email: "dani@dreamnest.com" })) || (await User.findOne());
    }

    const listing = await Listing.findById(listingId).populate("creator", "-password");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if listing is already in wishlist using safe string comparison
    const targetId = listingId.toString();
    const isAlreadyFavorited = (user.wishList || []).some((item) => {
      const id = item?._id ? item._id.toString() : item?.toString();
      return id === targetId;
    });

    if (isAlreadyFavorited) {
      user.wishList = user.wishList.filter((item) => {
        const id = item?._id ? item._id.toString() : item?.toString();
        return id !== targetId;
      });
    } else {
      user.wishList.push(listing.toObject());
    }

    user.markModified("wishList");
    await user.save();

    res.status(200).json({
      message: isAlreadyFavorited
        ? "Listing removed from wish list"
        : "Listing added to wish list",
      wishList: user.wishList,
    });
  } catch (err) {
    console.error("Wishlist Toggle Error:", err);
    res.status(500).json({ message: "Failed to update wishlist", error: err.message });
  }
});

/* GET PROPERTY LIST (Properties created by user) */
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await Listing.find({ creator: userId })
      .populate("creator", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(properties);
  } catch (err) {
    console.error("Fetch Properties Error:", err);
    res.status(500).json({ message: "Cannot find properties", error: err.message });
  }
});

/* GET RESERVATION LIST (Bookings made by customers on user's properties) */
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ hostId: userId })
      .populate("customerId", "-password")
      .populate("hostId", "-password")
      .populate("listingId")
      .sort({ createdAt: -1 });

    // Filter out reservations where listing was deleted
    const validReservations = reservations.filter((r) => r.listingId !== null);

    res.status(200).json(validReservations);
  } catch (err) {
    console.error("Fetch Reservations Error:", err);
    res.status(500).json({ message: "Cannot find reservations", error: err.message });
  }
});

module.exports = router;

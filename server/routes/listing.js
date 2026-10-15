const router = require("express").Router();
const multer = require("multer");
const path = require("path");

const Listing = require("../models/Listing");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { verifyToken } = require("../middleware/auth");

/* Multer configuration for listing photo uploads */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max per image
});

/* Helper to normalize file paths across Windows/Linux */
const normalizePath = (filePath) => {
  if (!filePath) return "";
  let clean = filePath.replace(/\\/g, "/");
  if (clean.startsWith("public/")) {
    clean = clean.replace(/^public\//, "");
  }
  if (!clean.startsWith("/")) {
    clean = "/" + clean;
  }
  return clean;
};

/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    const listingPhotos = req.files;

    if (!listingPhotos || listingPhotos.length === 0) {
      return res.status(400).json({ message: "Please upload at least one photo for your listing." });
    }

    const listingPhotoPaths = listingPhotos.map((file) => normalizePath(file.path));

    // Safely parse amenities into a clean Array of strings
    let parsedAmenities = [];
    if (typeof amenities === "string") {
      parsedAmenities = amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
    } else if (Array.isArray(amenities)) {
      parsedAmenities = amenities
        .flatMap((a) => (typeof a === "string" ? a.split(",") : a))
        .map((a) => (typeof a === "string" ? a.trim() : a))
        .filter(Boolean);
    }

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite: aptSuite || "",
      city,
      province,
      country,
      guestCount: Number(guestCount) || 1,
      bedroomCount: Number(bedroomCount) || 1,
      bedCount: Number(bedCount) || 1,
      bathroomCount: Number(bathroomCount) || 1,
      amenities: parsedAmenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price: Number(price) || 0,
    });

    await newListing.save();

    res.status(201).json({
      message: "Listing created successfully!",
      listing: newListing,
    });
  } catch (err) {
    console.error("Create Listing Error:", err);
    res.status(409).json({ message: "Failed to create listing", error: err.message });
  }
});

const escapeRegex = (str) => (str ? str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") : "");

/* GET LISTINGS (Feed & Category filter) */
router.get("/", async (req, res) => {
  const qCategory = req.query.category;

  try {
    let listings;
    if (qCategory && qCategory !== "All") {
      const sanitizedCategory = escapeRegex(qCategory.trim());
      listings = await Listing.find({
        category: { $regex: new RegExp(`^${sanitizedCategory}$`, "i") },
      })
        .populate("creator", "-password")
        .sort({ createdAt: -1 });
    } else {
      listings = await Listing.find()
        .populate("creator", "-password")
        .sort({ createdAt: -1 });
    }

    res.status(200).json(listings);
  } catch (err) {
    console.error("Fetch Listings Error:", err);
    res.status(500).json({ message: "Failed to fetch listings", error: err.message });
  }
});

/* GET LISTINGS BY SEARCH (title, category, city, country, province) */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params;

  try {
    let listings = [];

    if (!search || search === "all") {
      listings = await Listing.find()
        .populate("creator", "-password")
        .sort({ createdAt: -1 });
    } else {
      listings = await Listing.find({
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { province: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } },
        ],
      })
        .populate("creator", "-password")
        .sort({ createdAt: -1 });
    }

    res.status(200).json(listings);
  } catch (err) {
    console.error("Search Listings Error:", err);
    res.status(500).json({ message: "Failed to search listings", error: err.message });
  }
});

/* GET SINGLE LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("creator", "-password");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(listing);
  } catch (err) {
    console.error("Listing Details Error:", err);
    res.status(404).json({ message: "Listing could not be found", error: err.message });
  }
});

/* DELETE LISTING */
router.delete("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const { userId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (userId && listing.creator.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this property." });
    }

    await Listing.findByIdAndDelete(listingId);
    // Also remove bookings related to this listing
    await Booking.deleteMany({ listingId });

    res.status(200).json({ message: "Property deleted successfully!" });
  } catch (err) {
    console.error("Delete Listing Error:", err);
    res.status(500).json({ message: "Failed to delete property", error: err.message });
  }
});

module.exports = router;
import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Listing from "./models/Listing.js";
import Booking from "./models/Booking.js";
// 👉 Import other models (Reservation, WishList, etc.) if you have them

dotenv.config();

const resetDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Clear collections
    const userResult = await User.deleteMany({});
    const listingResult = await Listing.deleteMany({});
    const bookingResult = await Booking.deleteMany({});
    // add more like: await Reservation.deleteMany({});

    console.log(`🗑️ Deleted ${userResult.deletedCount} users.`);
    console.log(`🗑️ Deleted ${listingResult.deletedCount} listings.`);
    console.log(`🗑️ Deleted ${bookingResult.deletedCount} bookings.`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error while resetting DB:", err);
    process.exit(1);
  }
};

resetDB();

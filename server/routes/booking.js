const router = require("express").Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  try {
    const { customerId, hostId, listingId, startDate, endDate, totalPrice } = req.body;

    if (!customerId || !hostId || !listingId || !startDate || !endDate) {
      return res.status(400).json({ message: "Incomplete booking details provided." });
    }

    if (customerId.toString() === hostId.toString()) {
      return res.status(400).json({ message: "You cannot book your own property!" });
    }

    const newBooking = new Booking({
      customerId,
      hostId,
      listingId,
      startDate,
      endDate,
      totalPrice: Number(totalPrice) || 0,
    });

    await newBooking.save();

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("customerId", "-password")
      .populate("hostId", "-password")
      .populate("listingId");

    res.status(201).json({
      message: "Booking confirmed successfully!",
      booking: populatedBooking,
    });
  } catch (err) {
    console.error("Create Booking Error:", err);
    res.status(400).json({ message: "Failed to create new booking", error: err.message });
  }
});

/* CANCEL / DELETE BOOKING */
router.delete("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Check authorization: only the customer who booked or the host can cancel
    if (
      userId &&
      booking.customerId.toString() !== userId &&
      booking.hostId.toString() !== userId
    ) {
      return res.status(403).json({ message: "You are not authorized to cancel this booking." });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ message: "Reservation cancelled successfully." });
  } catch (err) {
    console.error("Cancel Booking Error:", err);
    res.status(500).json({ message: "Failed to cancel reservation", error: err.message });
  }
});

module.exports = router;
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const User = require("../models/User");

/* Multer configuration with safe unique filenames */
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

/* USER REGISTER */
router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists!" });
    }

    // Default profile image if none uploaded, or normalize the uploaded path
    let profileImagePath = "";
    if (req.file) {
      profileImagePath = normalizePath(req.file.path);
    }

    // Hash the password with bcrypt salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new User
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      profileImagePath,
    });

    await newUser.save();

    // Convert to plain object and remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully!",
      user: userResponse,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({
      message: "Registration failed. Please try again later.",
      error: err.message,
    });
  }
});

/* USER LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account does not exist! Please sign up." });
    }

    // Compare password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials! Check your password." });
    }

    // Generate JWT token with 7-day expiration
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "PASSWORDSECRET_DREAMS_NEST_TOP1PCT_2026",
      { expiresIn: "7d" }
    );

    // Safe user object without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful!",
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      message: "Login failed due to a server error.",
      error: err.message,
    });
  }
});

module.exports = router;

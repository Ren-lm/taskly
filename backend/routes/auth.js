// backend/routes/auth.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { authenticateToken } = require("./../utils");

const router = express.Router();

const jwtSecret = "your_jwt_secret"; // Secret key for signing JWT tokens

// User registration route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).send("User already exists");

    // Create a new user and save to the database
    user = new User({ name, email, password });
    await user.save();

    // Generates a JWT token for the new user
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1h",
    });

    // Sends the token and user details in the response
    res
      .status(201)
      .send({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    // Handles any server errors
    res.status(500).send("Server error");
  }
});

// User login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Finds the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");

    // Compares the provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).send("Invalid email or password");

    // Generates a JWT token for the authenticated user
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "365d",
    });

    // Sends the token and user details in the response
    res
      .status(200)
      .send({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Update user details route
router.put("/update", authenticateToken, async (req, res) => {
  const { name, email, password, newPassword, mode } = req.body;
  try {
    // Find the user by their ID (extracted from the authenticated token)
    const tempUser = await User.findOne({ _id: req?.user?.userId });
    if (!tempUser) return res.status(400).send("Invalid email or password");

    // Verify the current password
    const isMatch = await tempUser.comparePassword(password);
    if (!isMatch) return res.status(400).send("Invalid Current Password");

    // Update the user's name and email if the mode is "email"
    if (mode === "email") {
      await User.findOneAndUpdate(
        {
          _id: req?.user?.userId,
        },
        {
          name: name,
          email: email,
        }
      );
      return res.status(200).send({});
    } 
    // Update the user's password if the mode is "password"
    else if (mode === "password") {
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      await User.findOneAndUpdate(
        {
          _id: req?.user?.userId,
        },
        {
          name: name,
          email: email,
          password: hashedNewPassword,
        }
      );
      return res.status(200).send({});
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Get the authenticated user's details route
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // Find the user by their ID (extracted from the authenticated token) and exclude the password field
    const user = await User.findById(req?.user?.userId).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;

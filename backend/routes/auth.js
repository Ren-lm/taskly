// backend/routes/auth.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { authenticateToken } = require("./../utils");

const router = express.Router();

const jwtSecret = "your_jwt_secret";

// User registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).send("User already exists");

    user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1h",
    });
    res
      .status(201)
      .send({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).send("Invalid email or password");

    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "365d",
    });
    res
      .status(200)
      .send({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Update User
router.put("/update", authenticateToken, async (req, res) => {
  const { name, email, password, newPassword, mode } = req.body;
  try {
    const tempUser = await User.findOne({ _id: req?.user?.userId });
    if (!tempUser) return res.status(400).send("Invalid email or password");

    const isMatch = await tempUser.comparePassword(password);
    if (!isMatch) return res.status(400).send("Invalid Current Password");

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
    } else if (mode === "password") {
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

// Get user details
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req?.user?.userId).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;

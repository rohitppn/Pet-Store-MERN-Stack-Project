const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming you have a User model

// Fetch user role by UID
router.get("/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ firebaseUID: uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

const admin = require("firebase-admin");
const User = require("../models/User"); // Make sure you have a User model defined

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  try {
    // Check if token exists in the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .send({ message: "Authentication failed. Token required." });
    }

    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken?.uid;
    if (!uid) {
      return res
        .status(401)
        .send({ message: "Authentication failed. Invalid token." });
    }

    // Find the user by UID and check if they have admin privileges
    const user = await User.findOne({ firebaseUID: uid });
    if (!user || user.role !== "admin") {
      return res.status(403).send({ message: "Access denied. Admins only." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).send({ message: "Internal server error." });
  }
};

module.exports = isAdmin;

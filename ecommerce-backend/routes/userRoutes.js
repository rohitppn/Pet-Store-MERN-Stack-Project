const express = require("express");
const router = express.Router();
const { authenticateFirebaseUser } = require("../middleware/authMiddleware"); // Firebase auth middleware
const {
  createProfile,
  getUserProfile,
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/userController");

// Protect these routes with Firebase authentication
router.post("/", authenticateFirebaseUser, createProfile);
router.get("/:firebaseUID", authenticateFirebaseUser, getUserProfile);
router.post("/cart/add", authenticateFirebaseUser, addToCart);
router.put("/cart/update", authenticateFirebaseUser, updateCartQuantity);
router.delete("/cart/remove", authenticateFirebaseUser, removeFromCart);
router.get("/cart", authenticateFirebaseUser, getCart);
router.post("/wishlist/add", authenticateFirebaseUser, addToWishlist);
router.get("/wishlist", authenticateFirebaseUser, getWishlist);
router.delete("/wishlist/remove", authenticateFirebaseUser, removeFromWishlist);

module.exports = router;

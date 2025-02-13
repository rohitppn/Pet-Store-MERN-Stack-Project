const express = require("express");
const router = express.Router();
const { authenticateFirebaseUser } = require("../middleware/authMiddleware");
const {
  createOrder,
  getUserOrders,
} = require("../controllers/orderController");

// Order Routes
router.post("/add", authenticateFirebaseUser, createOrder);
router.get("/", authenticateFirebaseUser, getUserOrders);

module.exports = router;

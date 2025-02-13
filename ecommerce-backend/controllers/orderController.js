const Order = require("../models/Order");

// ✅ Create a new order
const createOrder = async (req, res) => {
  try {
    const { firebaseUID, items, totalAmount, shippingAddress } = req.body;

    if (!firebaseUID || !items?.length || !totalAmount || !shippingAddress) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const order = new Order({
      firebaseUID,
      items,
      totalAmount,
      shippingAddress,
    });

    await order.save();

    res.status(201).json({ message: "Order created successfully!", order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Error creating order", error: err });
  }
};

// ✅ Fetch orders for the authenticated user
const getUserOrders = async (req, res) => {
  try {
    const firebaseUID = req.user.firebaseUID; // ✅ Get Firebase UID from the authenticated user

    const orders = await Order.find({ firebaseUID });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Error fetching user orders", error: err });
  }
};

module.exports = { createOrder, getUserOrders };

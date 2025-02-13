const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true }, // Store Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: Number, required: true },
  bio: { type: String, default: "" },
  petName: { type: String, default: "" },
  petType: { type: String, default: "" },
  petAge: { type: Number, default: 0 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
      quantity: { type: Number, default: 1 },
    },
  ],
  wishlist: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
    },
  ],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

module.exports = mongoose.model("User", userSchema);

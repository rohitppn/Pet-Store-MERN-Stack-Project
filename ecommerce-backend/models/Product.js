const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: ["../uploads/1737486070131.jpeg"] },
    videos: { type: [String], default: [] },
    shippingCharges: {
      type: Number,
      default: 100,
      min: [0, "Shipping charges cannot be negative"],
    },
    height: { type: Number, default: "4.3" },
    weight: { type: Number, default: "" },
    Feature: { type: String, default: "Healthy" },
    Benefits: { type: String, default: "Sweet" },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    originalPrice: { type: Number, default: 0 },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    offers: { type: String, default: "5% off on UPI" },
    sizes: { type: String, default: "Pack of 1" },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;

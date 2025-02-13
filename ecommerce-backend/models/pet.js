const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    breed: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    color: { type: String, default: "" },
    bodyType: { type: String, default: "" },
    height: { type: String, default: "" },
    weight: { type: String, default: "" },
    distinctFeature: { type: String, default: "" },
    vaccinations: { type: String, default: "" },
    temperament: { type: String, default: "" },
    food: { type: String, default: "" },
    funfact: { type: String, default: "" },
    toys: { type: String, default: "" },
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
    offers: { type: String, default: "" },
    sizes: { type: String, default: "" },
    gender: { type: String, default: "" },
    category: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

const Pet = mongoose.models.Pet || mongoose.model("Pet", petSchema);

module.exports = Pet;

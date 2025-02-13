const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required for the testimonial."],
    },
    content: {
      type: String,
      required: [true, "Content is required for the testimonial."],
      minlength: [10, "Content must be at least 10 characters long."],
      maxlength: [500, "Content cannot exceed 500 characters."],
    },
    image: {
      type: String,
      required: true,
      default: "",
    },
    author: {
      type: String,
      required: [true, "Author is required."],
      index: true,
    },
    rating: {
      type: String,
      required: [true, "Rating is required."],
      default: "2",
    },
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;

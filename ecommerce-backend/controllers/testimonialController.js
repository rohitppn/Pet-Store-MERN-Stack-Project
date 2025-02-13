const Testimonial = require("../models/Testimonial");

// Helper function to handle file uploads (images)
const handleFileUploads = (req) => {
  const image =
    req.files["image"] && req.files["image"].length > 0
      ? req.files["image"][0].location // Get S3 URL
      : "";

  return { image };
};

// Create a new testimonial
const createTestimonial = async (req, res) => {
  try {
    const { name, content, author, rating } = req.body;

    // Handle file upload
    const { image } = handleFileUploads(req);

    if (!name || !content || !image || !author || !rating) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const testimonial = new Testimonial({
      name,
      content,
      image,
      author,
      rating,
    });

    await testimonial.save();
    res
      .status(201)
      .json({ message: "Testimonial created successfully!", testimonial });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating testimonial", error: err });
  }
};

// Fetch all testimonials
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find(); // Fetch all testimonials from the database
    res.status(200).json({ testimonials });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching testimonials", error: err });
  }
};

// Fetch testimonial by ID
const getTestimonialById = async (req, res) => {
  try {
    const testimonialId = req.params.id;
    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json({ testimonial });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching testimonial by ID", error: err });
  }
};

// Update a testimonial by ID
const updateTestimonial = async (req, res) => {
  try {
    const testimonialId = req.params.id; // Get the testimonial ID from the URL
    const { name, content, author, rating } = req.body;

    // Handle image upload (optional)
    const { image } = handleFileUploads(req);

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      testimonialId,
      {
        name,
        content,
        image,
        author,
        rating,
      },
      { new: true } // Return the updated testimonial
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json({
      message: "Testimonial updated successfully",
      testimonial: updatedTestimonial,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating testimonial", error: err });
  }
};

// Delete a testimonial by ID
const deleteTestimonial = async (req, res) => {
  try {
    const testimonialId = req.params.id; // Get the testimonial ID from the URL

    const deletedTestimonial = await Testimonial.findByIdAndDelete(
      testimonialId
    );

    if (!deletedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json({
      message: "Testimonial deleted successfully",
      testimonial: deletedTestimonial,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting testimonial", error: err });
  }
};

module.exports = {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};

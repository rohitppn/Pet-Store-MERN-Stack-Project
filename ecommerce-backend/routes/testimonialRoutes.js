const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/fileUpload");
const {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");

// Testimonial Routes
router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  createTestimonial
);

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ imageUrl: req.file.location });
});

router.get("/", getTestimonials);

router.put(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateTestimonial
);

router.delete("/:id", deleteTestimonial);

module.exports = router;

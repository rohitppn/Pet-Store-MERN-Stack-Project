const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { authenticateFirebaseUser } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/fileUpload");
const { validateObjectId } = require("../middleware/validateObjectId");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Product Routes
router.post(
  "/",
  authenticateFirebaseUser,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images" },
    { name: "videos" },
  ]),
  createProduct
);

router.post(
  "/upload",
  authenticateFirebaseUser,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ imageUrl: req.file.location });
  }
);

router.get("/", getProducts);

router.get("/:id", validateObjectId, async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.put(
  "/:id",
  authenticateFirebaseUser,
  validateObjectId,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images" },
    { name: "videos" },
  ]),
  updateProduct
);

router.delete(
  "/:id",
  authenticateFirebaseUser,
  validateObjectId,
  deleteProduct
);

module.exports = router;

const Product = require("../models/Product");

// Helper function to handle file uploads (images, videos)
const handleFileUploads = (req) => {
  const image =
    req.files["image"] && req.files["image"].length > 0
      ? req.files["image"][0].location // Get S3 URL
      : "";

  const images =
    req.files["images"] && req.files["images"].length > 0
      ? req.files["images"].map((file) => file.location) // Get S3 URLs
      : [];

  const videos =
    req.files["videos"] && req.files["videos"].length > 0
      ? req.files["videos"].map((file) => file.location) // Get S3 URLs
      : [];

  return { image, images, videos };
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      height,
      weight,
      shippingCharges,
      Feature,
      Benefits,
      price,
      originalPrice,
      discount,
      offers,
      sizes,
      category,
    } = req.body;

    // Handle file uploads
    const { image, images, videos } = handleFileUploads(req);

    if (!name || !description || !price || !image || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const product = new Product({
      name,
      description,
      height,
      weight,
      shippingCharges,
      Feature,
      Benefits,
      price,
      originalPrice,
      discount,
      offers,
      sizes,
      image,
      images,
      videos,
      category,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully!", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating product", error: err });
  }
};

// Fetch all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the database
    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products", error: err });
  }
};

// Fetch product by ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching product by ID",
      error: err,
    });
  }
};

// Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id; // Get the product ID from the URL
    const {
      name,
      description,
      height,
      weight,
      shippingCharges,
      Feature,
      Benefits,
      price,
      originalPrice,
      discount,
      offers,
      sizes,
      category,
    } = req.body;

    // Handle file uploads
    const { image, images, videos } = handleFileUploads(req);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        height,
        weight,
        shippingCharges,
        Feature,
        Benefits,
        price,
        originalPrice,
        discount,
        offers,
        sizes,
        image,
        images,
        videos,
        category,
      },
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product", error: err });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id; // Get the product ID from the URL

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product", error: err });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

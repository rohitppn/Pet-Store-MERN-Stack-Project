const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Pet = require("../models/Pet");
const admin = require("firebase-admin");

// Controller to create user profile (Signup)
const createProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, petName, petType, petAge } = req.body;
    const firebaseUID = req.user.uid; // Extracted from Firebase token (middleware)

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        message:
          "Missing required fields: name, email, and phone are mandatory.",
      });
    }

    // Check if profile already exists
    const existingProfile = await User.findOne({ firebaseUID });

    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists." });
    }

    // Create and save the user profile in MongoDB with empty cart and wishlist
    const userProfile = new User({
      firebaseUID,
      name,
      email,
      phone,
      bio,
      petName,
      petType,
      petAge,
      cart: [], // Empty cart initially
      wishlist: [], // Empty wishlist initially
    });

    await userProfile.save();

    res
      .status(201)
      .json({ message: "Profile created successfully!", userProfile });
  } catch (err) {
    console.error("Error creating profile:", err);
    res.status(500).json({ message: "Error creating profile", error: err });
  }
};

// Controller to fetch user profile (Login)
const getUserProfile = async (req, res) => {
  try {
    const firebaseUID = req.user.uid; // Extracted from Firebase token

    // Find user in MongoDB using firebaseUID and populate cart and wishlist
    const user = await User.findOne({ firebaseUID })
      .populate("cart.productId") // Populate product details in cart
      .populate("cart.petId") // Populate pet details in cart
      .populate("wishlist.productId") // Populate product details in wishlist
      .populate("wishlist.petId"); // Populate pet details in wishlist

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    // Handle cases where orders might not exist or be empty
    const orders = user.orders || [];

    // Prepare user profile response
    const userProfile = {
      firebaseUID: user.firebaseUID,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      petName: user.petName,
      petType: user.petType,
      petAge: user.petAge,
      orders: orders, // Ensure orders is always an array, even if empty
      cart: user.cart, // Include cart data
      wishlist: user.wishlist, // Include wishlist data
    };

    // Respond with the user profile including cart and wishlist
    res.status(200).json({
      message: "User  profile retrieved successfully",
      userProfile,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message || err,
    });
  }
};
const addToCart = async (req, res) => {
  try {
    const { productId, petId, quantity } = req.body;
    const firebaseUID = req.user.uid; // Extracted from Firebase token

    // Validate product ID format
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // Validate pet ID format
    if (petId && !mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid pet ID format" });
    }

    // Find product or pet
    let product, pet;
    if (productId) {
      product = await Product.findById(productId);
    }
    if (petId) {
      pet = await Pet.findById(petId);
    }

    // Check if product or pet exists
    if (productId && !product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (petId && !pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Find the user based on firebaseUID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optimistic UI Update: Handle cart modifications
    let updatedCart;
    if (product) {
      const existingProduct = user.cart.find(
        (item) => item.productId && item.productId.equals(product._id)
      );
      if (existingProduct) {
        existingProduct.quantity += quantity || 1;
      } else {
        user.cart.push({ productId: product._id, quantity: quantity || 1 });
      }
    }

    if (pet) {
      const existingPet = user.cart.find(
        (item) => item.petId && item.petId.equals(pet._id)
      );
      if (existingPet) {
        existingPet.quantity += quantity || 1;
      } else {
        user.cart.push({ petId: pet._id, quantity: quantity || 1 });
      }
    }

    // Use `findOneAndUpdate` to update the user and prevent version conflicts
    updatedCart = await User.findOneAndUpdate(
      { firebaseUID }, // Find by firebaseUID
      { cart: user.cart }, // Update the cart field
      { new: true } // Return the updated document
    );

    // Respond with success
    res.status(200).json({
      message: "Item added to cart",
      cart: updatedCart.cart, // Return updated cart data
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to get cart items
const getCart = async (req, res) => {
  const firebaseUID = req.user.uid;

  try {
    const user = await User.findOne({ firebaseUID }).populate(
      "cart.productId",
      "cart.petId"
    ); // Ensure cart items are populated with product data

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(200).json({ message: "Your cart is empty.", cart: [] });
    }

    // Ensure cart items have valid product data
    const populatedCart = user.cart.filter((item) => item.productId != null);

    res.status(200).json({
      status: "success",
      message: "Cart fetched successfully",
      data: { cart: populatedCart },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
};

// Controller to update quantity of product or pet in the cart
const updateCartQuantity = async (req, res) => {
  try {
    const { itemId, action } = req.body; // Extract itemId and action
    if (action !== 1 && action !== -1) {
      return res
        .status(400)
        .json({ message: "Change value must be either +1 or -1" });
    }

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const firebaseUID = req.user.uid;
    const user = await User.findOne({ firebaseUID });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let itemUpdated = false;
    let existingItem;

    // Function to handle both product and pet updates
    const updateItemInCart = async (itemId, action, isProduct) => {
      const item = isProduct
        ? await Product.findById(itemId)
        : await Pet.findById(itemId);
      if (!item) {
        return res
          .status(404)
          .json({ message: isProduct ? "Product not found" : "Pet not found" });
      }

      existingItem = user.cart.find((cartItem) =>
        isProduct
          ? cartItem.productId && cartItem.productId.equals(item._id)
          : cartItem.petId && cartItem.petId.equals(item._id)
      );

      if (existingItem) {
        existingItem.quantity += action;
        if (existingItem.quantity <= 0) {
          user.cart = user.cart.filter((cartItem) =>
            (isProduct ? cartItem.productId : cartItem.petId).equals(item._id)
          );
        }
        itemUpdated = true;
      } else if (action > 0) {
        user.cart.push(
          isProduct
            ? { productId: item._id, quantity: 1 }
            : { petId: item._id, quantity: 1 }
        );
        itemUpdated = true;
      }
    };

    // Check if it's a product or pet and update accordingly
    if (req.body.productId) {
      await updateItemInCart(itemId, action, true); // isProduct = true
    }

    if (req.body.petId) {
      await updateItemInCart(itemId, action, false); // isProduct = false
    }

    // If no item was updated, return an error
    if (!itemUpdated) {
      return res.status(400).json({
        message: "No valid product or pet found in the cart to update",
      });
    }

    // Save updated cart
    await user.save();

    // Respond with success
    res.status(200).json({
      message:
        action > 0 ? "Cart updated successfully" : "Item removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId, petId } = req.body;
    const firebaseUID = req.user.uid; // Extracted from Firebase token

    // Validate product ID format
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // Validate pet ID format
    if (petId && !mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid pet ID format" });
    }

    // Find the user based on firebaseUID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove product from cart if it exists
    if (productId) {
      const productIndex = user.cart.findIndex(
        (item) => item.productId && item.productId.equals(productId)
      );
      if (productIndex === -1) {
        return res.status(404).json({ message: "Product not in cart" });
      }
      user.cart.splice(productIndex, 1); // Remove product from cart
    }

    // Remove pet from cart if it exists
    if (petId) {
      const petIndex = user.cart.findIndex(
        (item) => item.petId && item.petId.equals(petId)
      );
      if (petIndex === -1) {
        return res.status(404).json({ message: "Pet not in cart" });
      }
      user.cart.splice(petIndex, 1); // Remove pet from cart
    }

    // Save updated cart
    await user.save();

    // Respond with success
    res.status(200).json({
      message: "Item removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId, petId, quantity } = req.body; // Get quantity if provided
    const firebaseUID = req.user.uid; // Extracted from Firebase token

    // Validate product ID format
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ message: "Invalid product ID format for wishlist" });
    }

    // Validate pet ID format
    if (petId && !mongoose.Types.ObjectId.isValid(petId)) {
      return res
        .status(400)
        .json({ message: "Invalid pet ID format for wishlist" });
    }

    // Find the user based on firebaseUID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: "User  not found in wishlist" });
    }

    // Find product or pet
    let product, pet;
    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }
    if (petId) {
      pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
    }

    // Add product to wishlist if it exists
    if (product) {
      const existingProduct = user.wishlist.find((item) =>
        item.productId?.equals(product._id)
      );
      if (existingProduct) {
        existingProduct.quantity += quantity || 1; // Update quantity if already exists
      } else {
        user.wishlist.push({ productId: product._id, quantity: quantity || 1 });
      }
    }

    // Add pet to wishlist if it exists
    if (pet) {
      const existingPet = user.wishlist.find((item) =>
        item.petId?.equals(pet._id)
      );
      if (existingPet) {
        existingPet.quantity += quantity || 1; // Update quantity if already exists
      } else {
        user.wishlist.push({ petId: pet._id, quantity: quantity || 1 });
      }
    }

    // Save updated wishlist
    await user.save();

    // Respond with success
    res.status(200).json({
      message: "Item added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to get wishlist items
const getWishlist = async (req, res) => {
  const firebaseUID = req.user.uid;

  try {
    const user = await User.findOne({ firebaseUID })
      .populate("wishlist.productId") // Populate productId references
      .populate("wishlist.petId"); // Populate petId references

    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    if (!user.wishlist || user.wishlist.length === 0) {
      return res.status(200).json({ message: "Your wishlist is empty." });
    }

    // Filter and map wishlist items to return populated data only
    const populatedWishlist = user.wishlist.filter(
      (item) => item.productId != null || item.petId != null
    );

    res.status(200).json({
      status: "success",
      message: "Wishlist fetched successfully",
      data: { wishlist: populatedWishlist },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Error fetching wishlist", error });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId, petId } = req.body;
    const firebaseUID = req.user.uid; // Extracted from Firebase token

    // Validate product ID format
    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // Validate pet ID format
    if (petId && !mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid pet ID format" });
    }

    // Find the user based on firebaseUID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    let removedItems = [];

    // Remove product from wishlist if it exists
    if (productId) {
      const productIndex = user.wishlist.findIndex(
        (item) => item.productId && item.productId.equals(productId)
      );
      if (productIndex !== -1) {
        removedItems.push(user.wishlist[productIndex]);
        user.wishlist.splice(productIndex, 1); // Remove product from wishlist
      }
    }

    // Remove pet from wishlist if it exists
    if (petId) {
      const petIndex = user.wishlist.findIndex(
        (item) => item.petId && item.petId.equals(petId)
      );
      if (petIndex !== -1) {
        removedItems.push(user.wishlist[petIndex]);
        user.wishlist.splice(petIndex, 1); // Remove pet from wishlist
      }
    }

    // Save updated wishlist
    await user.save();

    // Respond with success
    res.status(200).json({
      message: "Items removed from Wishlist",
      removedItems,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createProfile,
  getUserProfile,
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};

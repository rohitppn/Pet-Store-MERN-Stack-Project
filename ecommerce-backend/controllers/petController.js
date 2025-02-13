const Pet = require("../models/pet");

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

// Create a new pet
const createPet = async (req, res) => {
  try {
    const {
      breed,
      description,
      color,
      bodyType,
      height,
      weight,
      distinctFeature,
      vaccinations,
      temperament,
      food,
      funfact,
      toys,
      price,
      originalPrice,
      discount,
      offers,
      sizes,
      gender,
      category,
    } = req.body;

    // Handle file uploads
    const { image, images, videos } = handleFileUploads(req);

    if (!breed || !description || !price || !image || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const pet = new Pet({
      breed,
      description,
      image,
      color,
      bodyType,
      height,
      weight,
      distinctFeature,
      vaccinations,
      temperament,
      food,
      funfact,
      toys,
      price,
      originalPrice,
      discount,
      offers,
      images,
      videos,
      sizes,
      gender,
      category,
    });

    await pet.save();
    res.status(201).json({ message: "Pet created successfully!", pet });
  } catch (err) {
    console.error("error creating pet", err.message);
    res.status(500).json({ message: "Error creating pet", error: err.message });
  }
};

// Fetch all pets
const getPets = async (req, res) => {
  try {
    const pets = await Pet.find(); // Fetch all pets from the database
    res.status(200).json({ pets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pets", error: err });
  }
};

// Fetch pet by ID
const getPetById = async (req, res) => {
  try {
    const petId = req.params.id;
    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.status(200).json({ pet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pet by ID", error: err });
  }
};

// Update a pet by ID
const updatePet = async (req, res) => {
  try {
    const petId = req.params.id; // Get the pet ID from the URL
    const {
      breed,
      description,
      color,
      bodyType,
      height,
      weight,
      distinctFeature,
      vaccinations,
      temperament,
      food,
      funfact,
      toys,
      price,
      originalPrice,
      discount,
      offers,
      sizes,
      gender,
      category,
    } = req.body;

    // Handle file uploads
    const { image, images, videos } = handleFileUploads(req);

    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      {
        breed,
        description,
        image,
        color,
        bodyType,
        height,
        weight,
        distinctFeature,
        vaccinations,
        temperament,
        food,
        funfact,
        toys,
        price,
        originalPrice,
        discount,
        offers,
        images,
        videos,
        sizes,
        gender,
        category,
      },
      { new: true } // Return the updated pet
    );

    if (!updatedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res
      .status(200)
      .json({ message: "Pet updated successfully", pet: updatedPet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating pet", error: err });
  }
};

// Delete a pet by ID
const deletePet = async (req, res) => {
  try {
    const petId = req.params.id; // Get the pet ID from the URL

    const deletedPet = await Pet.findByIdAndDelete(petId);

    if (!deletedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res
      .status(200)
      .json({ message: "Pet deleted successfully", pet: deletedPet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting pet", error: err });
  }
};

module.exports = { createPet, getPets, getPetById, updatePet, deletePet };

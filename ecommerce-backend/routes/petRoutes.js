const express = require("express");
const Pet = require("../models/pet");

const router = express.Router();
const { authenticateFirebaseUser } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/fileUpload");
const { validateObjectId } = require("../middleware/validateObjectId");
const {
  createPet,
  getPets,
  updatePet,
  deletePet,
} = require("../controllers/petController");

// Pet Routes
router.post(
  "/add",
  authenticateFirebaseUser,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images" },
    { name: "videos" },
  ]),

  createPet
);

router.get("/", getPets);

router.get("/:id", validateObjectId, async (req, res) => {
  const petId = req.params.id;
  try {
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json(pet);
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
  updatePet
);

router.delete("/:id", authenticateFirebaseUser, validateObjectId, deletePet);

module.exports = router;

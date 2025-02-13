require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Firebase Admin SDK setup
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./petstore-b720d-firebase-adminsdk-fbsvc-89fa22ae47.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_URI,
});

// Import routes
const petRoutes = require("./routes/petRoutes");
const productRoutes = require("./routes/productRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const orderRoutes = require("./routes/orderRoutes");
const profileRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// CORS Options
const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

app.options("*", cors(corsOptions));

// Routes
app.use("/api/pet", petRoutes);
app.use("/api/product", productRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profile/cart", profileRoutes);
app.use("/api/admin", adminRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// General Error Handler (Catch-all for unhandled routes or errors)
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handling middleware (for catching all errors)
app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : error, // Avoid exposing stack trace in production
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

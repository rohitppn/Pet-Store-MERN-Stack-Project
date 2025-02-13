const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

// AWS S3 Client for SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to determine upload path based on route
const getUploadPath = (req, file) => {
  if (req.baseUrl.includes("products")) {
    return `products/${Date.now()}-${file.originalname}`;
  }
  if (req.baseUrl.includes("testimonials")) {
    return `testimonials/${Date.now()}-${file.originalname}`;
  }
  return `pets/${Date.now()}-${file.originalname}`;
};

// Multer S3 Storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, getUploadPath(req, file));
    },
  }),
});

module.exports = { upload, s3 };

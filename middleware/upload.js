// Import multer for file uploads
const multer = require("multer");

// Import path module for file path operations
const path = require("path");

// Configure storage for uploaded files
const storage = multer.diskStorage({
  // Set destination folder for uploads
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  // Set filename for uploaded files
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "image-" + uniqueSuffix + ext);
  },
});

// Configure file filter to accept only images
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  // Check file extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    // Accept file
    return cb(null, true);
  } else {
    // Reject file
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Configure multer with storage and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: fileFilter,
});

// Export the upload middleware
module.exports = upload;

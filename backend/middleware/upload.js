const multer = require('multer');

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept image files
    } else {
      cb(new Error('Only image files are allowed!'), false); // Reject other file types
    }
  },
});

module.exports = upload;

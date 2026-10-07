const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure upload directory exists
if (!fs.existsSync(config.storage.uploadDir)) {
  fs.mkdirSync(config.storage.uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organize by subfolders if entity specified (e.g., /uploads/documents)
    const targetFolder = path.join(config.storage.uploadDir, 'documents');
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    cb(null, targetFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(sanitizedOriginal)}`);
  }
});

// File filter based on allowed extensions configured in .env
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
  if (config.storage.allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} is not allowed. Allowed types: ${config.storage.allowedFileTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.storage.maxFileSizeMb * 1024 * 1024
  },
  fileFilter
});

module.exports = upload;

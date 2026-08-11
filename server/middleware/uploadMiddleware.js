import multer from "multer";

// Store file in memory buffer for immediate parsing
const storage = multer.memoryStorage();

// Accept only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Only PDF files are supported."), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maximum file size
  },
  fileFilter
}).single("resume");

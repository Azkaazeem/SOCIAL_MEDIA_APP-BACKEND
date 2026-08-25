const express = require("express");
const app = express();
const dotenv = require("dotenv");
const dns = require("dns")

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1'])
dotenv.config();

const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URL is missing in environment variables!");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.log("MongoDB connection error:", err));
}

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS policy violation: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization"
  ]
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions)); // Handle all preflight requests directly

// Static files for images
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Middleware
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("common"));

// File Upload Storage (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name || file.originalname);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully.");
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend server is running successfully!" });
});

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

module.exports = app;
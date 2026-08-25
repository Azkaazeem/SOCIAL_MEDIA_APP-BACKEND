const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

const dns = require("dns")
dns.setServers(['8.8.8.8', '1.1.1.1'])
dotenv.config();


dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("MongoDB connection error:", err));

// Dynamic CORS Configuration (Localhost + All Vercel Deployments)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, curl, mobile apps)
      if (!origin) return callback(null, true);
      
      // Allow specific local origins or any vercel.app deployment preview/production
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
  })
);

// Middleware
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("common"));

// Static files for images
app.use("/images", express.static(path.join(__dirname, "public/images")));

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
  res.send("Backend server is running successfully!");
});

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

module.exports = app;
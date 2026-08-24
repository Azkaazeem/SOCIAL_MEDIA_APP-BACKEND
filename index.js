const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const dns = require('dns');
const { log } = require("console");
dns.setServers(['8.8.8.8', '1.1.1.1'])

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(8800, () => {
      console.log("Database connected");
      console.log("Backend server is running!");
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });

  app.use("/images", express.static(path.join(__dirname, "public/images")));

// middleware 
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://social-media-app-frontend-sand.vercel.app"
  ]
}));
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("common"));

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
  api_key: process.env.CLOUDINARY_API_KEY.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET.trim()
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "social-media-app",
    resource_type: "auto",
  },
});

const upload = multer({ storage });
app.post("/api/upload" , upload.single("file"), (req, res) => {
  try {
    return res.status(200).json({ url: req.file.path });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);


// app.listen(8800 , () => {                 
//     console.log("Backend server is running!");
// }) 
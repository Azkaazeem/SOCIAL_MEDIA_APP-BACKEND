const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
// const cors = require("cors");
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
// app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer(storage);
app.post("/api/upload" , upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded Successfully");
  } catch (err) {
    console.log(err);
    
  }
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);


// app.listen(8800 , () => {                 
//     console.log("Backend server is running!");
// }) 
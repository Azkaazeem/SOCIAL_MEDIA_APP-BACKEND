const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const dns = require('dns');
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

// middleware 
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

// app.listen(8800 , () => {                 
//     console.log("Backend server is running!");
// }) 
const express = require("express");
const app = express();

const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");

// Middlewares
app.use(express.json()); //A body parser
app.use(helmet()); //Protect request header
app.use(morgan("common")); //View all request

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

// Connect to database and listen to a port
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DB connected and server runing on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

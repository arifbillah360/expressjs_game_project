const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
// app.use(express.static(__dirname + "/webpage"));

// My Custom Routes
const AppError = require("./utils/appError");
const userRoutes = require("./routes/userRoutes");
const authController = require("./controllers/authController");
const viewsRoutes = require("./routes/viewsRoutes");
const viewsController = require("./controllers/viewsController");

mongoose
  .connect(
    `mongodb+srv://${process.env.DATABASE}:${process.env.DATABASE_PASS}@cluster0.rrhjcd0.mongodb.net/${process.env.COLLECTION_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`server is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Global Middlewares
// Security HTTP headers
app.use(helmet());

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
// app.use("/", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
// When using form with action and send data with urlencoded
// app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(bodyParser.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross site scripting attacks)
app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     allow duplicate parameters
//     whitelist: ["duration", "ratings"],
//   })
// );

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));

//  -- ROUTES --
// @POST http://localhost:3000/signup

// test route
// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });
app.use("/api", userRoutes);

app.use("/", viewsRoutes);
// app.use("/test", authController.protect, authController.restrictTo("admin"));
// app.get("/", (req, res, next) => {
//   res.status(200).sendFile(path.join(__dirname, "public", "testHtml.html"));
// });

// All not defined routes will be handled here
app.all("*", (req, res, next) => {
  // Calling the next middleware and passing the error during production
  // next(new AppError(`Can not find ${req.originalUrl} on this server!`, 404));
  // Render a 404 page template for the deployment phase
  res.status(404).sendFile(path.join(__dirname, "public", "html", "404.html"));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.message === "User not logged in") {
    return res
      .status(400)
      .sendFile(path.join(__dirname, "public", "html", "userNotLoggedIn.html"));
  }

  if (err.name === "JsonWebTokenError") {
    return (err.name = "Invalid token");
  }
  if (err.name === "TokenExpiredError") {
    return (err.name = "Your token has expired please login again");
  }

  res.status(err.statusCode).json({
    errorHandler: "Global error handler",
    errorName: err.name,
    status: err.status,
    message: err.message,
    // errorStack: err.stack,
  });
});

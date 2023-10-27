const express = require("express");
const multer = require("multer");
const router = express.Router();
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const customEmail = require("./../utils/email");
const AppError = require("./../utils/appError");
// img processing library
const sharp = require("sharp");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFiler = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please uplaod image", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFiler,
});

const uploadUserPhoto = upload.single("photo");

const resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(150, 150)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

// http://localhost:3000/api/updateMyPassword
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

// http://localhost:3000/api/updateMe
router.patch(
  "/updateMe",
  authController.protect,
  uploadUserPhoto,
  resizeUserPhoto,
  userController.updateMe
);

// http://localhost:3000/api/deleteMe
router.delete("/deleteMe", authController.protect, userController.deleteMe);

// http://localhost:3000/api/forgotPassword
router.post("/forgotPassword", authController.forgotPassword);

// http://localhost:3000/api/resetPassword
router.patch("/resetPassword/:token", authController.resetPassword);

// http://localhost:3000/api/signup
router.post("/signup", authController.signup);

// http://localhost:3000/api/login
router.post("/login", authController.login);

// http://localhost:3000/api/logout
router.get("/logout", authController.logout);

module.exports = router;

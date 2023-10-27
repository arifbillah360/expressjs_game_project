const express = require("express");
const router = express.Router();
const viewsController = require("./../controllers/viewsController");
const authController = require("./../controllers/authController");

router.get("/welcome", viewsController.getLoginForm);
router.get("/game", authController.protect, viewsController.gamePage);
router.get("/mypage", authController.protect, viewsController.myPage);
router.get("/myPageData", authController.protect, viewsController.myPageData);

module.exports = router;

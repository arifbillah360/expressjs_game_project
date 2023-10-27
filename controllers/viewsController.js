const path = require("path");

exports.getLoginForm = (req, res, next) => {
  res
    .status(200)
    .sendFile(
      path.join(__dirname, "../", "public", "html", "welcomePage.html")
    );
};

exports.myPage = (req, res, next) => {
  res
    .status(200)
    .sendFile(path.join(__dirname, "../", "public", "html", "mypage.html"));
};

exports.myPageData = (req, res, next) => {
  res.status(200).json({
    user: req.user,
  });
};

exports.gamePage = (req, res, next) => {
  console.log(req.user);
  res
    .status(200)
    .sendFile(
      path.join(__dirname, "../", "public", "html", "gameplayPage.html")
    );
};

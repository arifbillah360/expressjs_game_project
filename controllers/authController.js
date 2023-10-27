const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const Gamedata = require("./../models/userGamedata");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // it can be used only if https if true
    // secure: true,
    // this will make it so that the cookie can not be modify in any way, basically read only
  });

  // Remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
};

// @POST http://localhost:3000/api/signup
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  Gamedata.create({ _id: newUser._id });
  options = {
    emailTo: newUser.email,
    subject: "registration completed",
    text: `Thank you for registering ${newUser.username}`,
  };
  sendEmail(options);
  createAndSendToken(newUser, 201, res);
});

// @POST http://localhost:3000/api/login
exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // 1 - check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  // 2 - check if user exists && password is correct
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3 - if ok send token to the client
  createAndSendToken(user, 200, res);
});

// Logout function
exports.logout = (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

// Protect routes middleware
exports.protect = catchAsync(async (req, res, next) => {
  // 1 - Get token and check if exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("User not logged in", 401));
  }
  // 2 - Verificate the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3 - Check if user still exists
  // freshUser || currentUser = loggedInUser
  const loggedInUser = await User.findById(decoded.id);
  if (!loggedInUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exists anymore",
        401
      )
    );
  }

  // 4 - Check if user changed password after the token was issued
  if (loggedInUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password. Please log in again", 401)
    );
  }

  // Grant access to protected routes for logged in users
  req.user = loggedInUser;
  next();
});

// // Only render pages for loggedin users
// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   if (req.cookies.jwt) {
//     // 1 - Verifi token
//     const decoded = await promisify(jwt.verify)(
//       req.cookies.jwt,
//       process.env.JWT_SECRET
//     );

//     // 2 - Check if user still exists
//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return next();
//     }

//     // 3 - Check if user changed password after token was issued
//     if (currentUser.changedPasswordAfter(decoded.iat)) {
//       return next();
//     }

//     // There is a logged in user
//     req.user = currentUser;
//     next();
//   }
// });

// Routes available based on roles
// authController.restrictTo("admin") <- inside the parenthesis pass all the roles that are allowed to access the route
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("do not have access");
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    console.log("Access granted as admin");
    next();
  };
};

// Reset password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 - Get user based on email
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // 2 - Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3 - Send it back to user`s email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit patch reques with your new password and password confirm to: ${resetURL}.\n If you did not forgot your password please ignore this message.`;
  console.log(resetURL);

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token(valid for 10minutes)",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 - Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 - If token has not expired and there is a user set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // 3 - Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4 - Log the user in, send token to the client
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 - Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2 - Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // 3 - If password is correct update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4 - Log user in, send token
  createAndSendToken(user, 200, res);
});

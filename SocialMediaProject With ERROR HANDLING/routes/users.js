const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const asyncHandler = require('express-async-handler');
const AppError = require('../Handlers/AppError'); // استدعاء AppError

router.get("/", asyncHandler(async (req, res, next) => {

  const users = await User.find();

  if (!users.length) {
    return next(new AppError("No users found", 404));
  }

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users
  });

}));
// Update user
router.put("/:id", asyncHandler(async (req, res, next) => {
  if (req.body.userId !== req.params.id) {
    return next(new AppError("You can update only your account", 403));
  }

  // تشفير الباسورد لو موجود
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  // تحديث بيانات المستخدم
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedUser);
}));



// Delete user
router.delete("/:id", asyncHandler(async (req, res, next) => {
  if (req.body.userId !== req.params.id) {
    return next(new AppError("You can delete only your account", 403));
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json("Account has been deleted");
}));



// Get a user
router.get("/:id", asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json(user);
}));



// Follow user
router.put("/:id/follow", asyncHandler(async (req, res, next) => {
  if (req.body.userId === req.params.id) {
    return next(new AppError("You can't follow yourself", 403));
  }

  const user = await User.findById(req.params.id);
  const currentUser = await User.findById(req.body.userId);

  if (!user) {
    return next(new AppError("User to follow not found", 404));
  }

  if (user.followers.includes(req.body.userId)) {
    return next(new AppError("You already follow this user", 403));
  }

  await user.updateOne({ $push: { followers: req.body.userId } });
  await currentUser.updateOne({ $push: { followings: req.params.id } });

  res.status(200).json("User has been followed");
}));



// Unfollow user
router.put("/:id/unfollow", asyncHandler(async (req, res, next) => {
  if (req.body.userId === req.params.id) {
    return next(new AppError("You can't unfollow yourself", 403));
  }

  const user = await User.findById(req.params.id);
  const currentUser = await User.findById(req.body.userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!user.followers.includes(req.body.userId)) {
    return next(new AppError("You don't follow this user", 403));
  }

  await user.updateOne({ $pull: { followers: req.body.userId } });
  await currentUser.updateOne({ $pull: { followings: req.params.id } });

  res.status(200).json("User has been unfollowed");
}));


module.exports = router;

const User = require("../models/UserModel");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Update a User
router.put("/:id", async (req, res) => {
  try {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      if (!updatedUser) throw new Error("Account Not Updated!!");

      res.status(200).json("Account Updated Successfully!!");
    } else {
      throw new Error("You can update only your account!!");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Delete a User
router.delete("/:id", async (req, res) => {
  try {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      const updatedUser = await User.findByIdAndDelete(req.params.id);
      if (!updatedUser) throw new Error("Invalid User ID!!");

      res.status(200).json("Account Deleted Successfully!!");
    } else {
      throw new Error("You can delete only your Account!!");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Get a User
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      throw new Error("Invalid UserID!");

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) throw new Error("User Does Not Exists!");

    const { password, updatedAt, ...other } = existingUser._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Follow a User
router.put("/:id/follow", async (req, res) => {
  try {
    if (req.body.userId === req.params.id)
      throw new Error("You can follow yourself!");

    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);

    if (user.followers.includes(req.body.userId))
      throw new Error("You're currently following this user!");

    await user.updateOne({ $push: { followers: req.body.userId } });
    await currentUser.updateOne({ $push: { followings: req.params.id } });

    res.status(200).json("User successfully followered!");
  } catch (error) {
    res.status(403).json(error.message);
  }
});

// Unfollow a User
router.put("/:id/unfollow", async (req, res) => {
  try {
    if (req.body.userId === req.params.id)
      throw new Error("You can't unfollow yourself!");

    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);

    if (user.followers.includes(req.body.userId)) {
      await user.updateOne({ $pull: { followers: req.body.userId } });
      await currentUser.updateOne({ $pull: { followings: req.params.id } });

      res.status(200).json("User successfully unfollowed");
    } else {
      throw new Error("You're not following this user!");
    }
  } catch (error) {
    res.status(404).json(error.message);
  }
});

module.exports = router;

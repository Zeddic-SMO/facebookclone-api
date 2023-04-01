const router = require("express").Router();
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

// REGISTER NEW USER
router.post("/register", async (req, res) => {
  try {
    // Destructure Sent Data
    const {
      username,
      email,
      password,
      profilePicture,
      coverPicture,
      followers,
      followings,
      isAdmin,
    } = req.body;

    // Check if User already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (email === existingUser.email || username === existingUser.username)
        throw new Error("User Already Exists!");
    }

    // Generate Hashed Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creating a new User
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture,
      coverPicture,
      followers,
      followings,
      isAdmin,
    });

    // Save and return response
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    // if (!existingUser) return res.status(404).json("Invalid Email/Password");
    // !existingUser && res.status(404).json("Invalid Email/Password");
    if (!existingUser) throw new Error("Invalid Email/Password");

    const validPassword = await bcrypt.compare(password, existingUser.password);
    // if (!validPassword) return res.status(404).json("Invalid Email/Password");
    // !validPassword && res.status(404).json("Invalid Email/Password");
    if (!validPassword) throw new Error("Invalid Email/Password");

    res.status(200).json(existingUser);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;

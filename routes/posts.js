const Posts = require("../models/PostModel");
const User = require("../models/UserModel");
const router = require("express").Router();

// Create a Post
router.post("/", async (req, res) => {
  try {
    const newPost = new Posts(req.body);
    const post = await newPost.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Update a Post
router.put("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json("Post no longer exists!");

    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post Updated!");
    } else {
      throw new Error("You can edit only your post!");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) throw new Error("Post no longer exists!");

    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post Deleted!");
    } else {
      throw new Error("You can delete only your post");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) throw new Error("Post no longer exists!");

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Like/Dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) throw new Error("Post no longer exists!");

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Post has been liked!");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Post has been unliked!");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Set Timeline: All Posts of User's Followings
router.get("/timeline/posts", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const currentUserPosts = await Posts.find({ userId: currentUser._id });

    const followingsPosts = await Promise.all(
      currentUser.followings.map((followingId) => {
        return Posts.find({ userId: followingId });
      })
    );

    res.json(currentUserPosts.concat(...followingsPosts));
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;

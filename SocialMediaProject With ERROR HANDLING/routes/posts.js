const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// Get Timeline Posts 
// يجلب بوستات المستخدم + بوستات الأصدقاء اللي بيتابعهم
router.get("/timeline/all/:userId", async (req, res) => {
  try {
    // تنضيف الـ userId من أي spaces أو newlines
    const userId = req.params.userId.trim();
    
    // 1. ابحث عن المستخدم الحالي
    const currentUser = await User.findById(userId);
    
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. اجلب بوستات المستخدم نفسه
    const userPosts = await Post.find({ userId: currentUser._id });

    // 3. اجلب بوستات كل اللي بيتابعهم (followings)
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );

    // 4. ادمج بوستات المستخدم + بوستات الأصدقاء
    // concat(...friendPosts) بيفرد الـ arrays جوا بعض
    const allPosts = userPosts.concat(...friendPosts);

    // 5. رتب البوستات من الأحدث للأقدم
    allPosts.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(allPosts);

  } catch (err) {
    console.error("Timeline error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      message: err.message 
    });
  }
});

// Create a post
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json({ message: "Post updated successfully" });
    } else {
      res.status(403).json({ error: "You can update only your post" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      res.status(403).json({ error: "You can delete only your post" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like/Dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    if (!post.likes.includes(req.body.userId)) {
      // Like the post
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json({ message: "Post liked" });
    } else {
      // Unlike the post
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json({ message: "Post unliked" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
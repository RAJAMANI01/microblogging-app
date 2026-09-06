const express = require("express");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();


// ==========================
// AUTHENTICATION
// ==========================

function authenticateToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.userId;

    next();

  } catch (error) {

    return res.status(403).json({
      message: "Invalid or expired token"
    });

  }
}


// ==========================
// CREATE POST
// ==========================

router.post("/", authenticateToken, async (req, res) => {

  try {

    const { content } = req.body;

    if (!content || content.trim() === "") {

      return res.status(400).json({
        message: "Post content is required"
      });

    }

    if (content.length > 280) {

      return res.status(400).json({
        message: "Post cannot exceed 280 characters"
      });

    }

    const post = await Post.create({

      content: content.trim(),

      author: req.userId

    });

    const populatedPost =
      await post.populate(
        "author",
        "username"
      );

    res.status(201).json({

      message: "Post created successfully",

      post: populatedPost

    });

  } catch (error) {

    res.status(500).json({

      message: "Failed to create post",

      error: error.message

    });

  }

});


// ==========================
// GET FEED
// ==========================

router.get("/feed", authenticateToken, async (req, res) => {

  try {

    // Find current user
    const currentUser =
      await User.findById(req.userId);

    if (!currentUser) {

      return res.status(404).json({

        message: "User not found"

      });

    }


    // Users that the current user follows
    const followingIds =
      currentUser.following || [];


    // Include the current user's own posts
    const authorIds = [
      req.userId,
      ...followingIds
    ];


    // Find posts
    const posts = await Post.find({

      author: {
        $in: authorIds
      }

    })

      .populate(
        "author",
        "username"
      )

      .sort({
        createdAt: -1
      });


    res.json({

      posts

    });

  } catch (error) {

    console.error(
      "Feed error:",
      error
    );

    res.status(500).json({

      message: "Failed to load feed",

      error: error.message

    });

  }

});


module.exports = router;
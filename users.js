const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

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

// GET ALL USERS
router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } },
      "username email followers following"
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get users",
      error: error.message
    });
  }
});

// FOLLOW USER
router.post("/:id/follow", authenticateToken, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself"
      });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({
        message: "Already following this user"
      });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: `You are now following ${userToFollow.username}`
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to follow user",
      error: error.message
    });
  }
});

// UNFOLLOW USER
router.post("/:id/unfollow", authenticateToken, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    currentUser.following =
      currentUser.following.filter(
        id => id.toString() !== req.params.id
      );

    userToUnfollow.followers =
      userToUnfollow.followers.filter(
        id => id.toString() !== req.userId.toString()
      );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({
      message: `You unfollowed ${userToUnfollow.username}`
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to unfollow user",
      error: error.message
    });
  }
});

module.exports = router;
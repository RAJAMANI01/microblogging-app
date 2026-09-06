const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Microblogging API is running"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

const PORT = 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const server = app.listen(PORT, "127.0.0.1", () => {
      console.log(`Server running at http://127.0.0.1:${PORT}`);
      console.log("Keep this terminal open.");
    });

    server.on("error", (error) => {
      console.error("Server error:", error);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
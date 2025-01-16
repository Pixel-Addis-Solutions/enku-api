import express from "express";
import {
  createPost,
  getScheduledPosts,
  updatePost,
  deletePost,
} from "../../controllers/user/post";
import { authenticateCustomer } from "../../middlewares/authenticate";
 import { createPostLog } from "../../controllers/user/post-log";
const router = express.Router();

// Create Post API
router.post("/createPosts", createPost);

// Get Scheduled Posts API
router.get("/getPosts", getScheduledPosts);
  
// Update Post API
router.put("/update/:id", updatePost);

// Delete Post API
router.delete("/delete/:id",  deletePost);
// Post log route
router.post("/log", createPostLog);
export default router;
  
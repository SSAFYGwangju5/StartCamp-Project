const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/postsController");

const router = express.Router();

router.get("/", asyncHandler(getPosts));
router.get("/:id", asyncHandler(getPostById));
router.post("/", asyncHandler(createPost));
router.put("/:id", asyncHandler(updatePost));
router.delete("/:id", asyncHandler(deletePost));
router.post("/:id/like", asyncHandler(likePost));

module.exports = router;
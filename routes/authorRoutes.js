const express = require("express");
const router = express.Router();

const {
  createAuthor,
  getAllAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/authorController");

const { protect } = require("../middleware/auth");
const {
  validate,
  createAuthorSchema,
  updateAuthorSchema,
} = require("../middleware/validate");

router.get("/", getAllAuthors);
router.get("/:id", getAuthor);

router.post("/", protect, validate(createAuthorSchema), createAuthor);
router.put("/:id", protect, validate(updateAuthorSchema), updateAuthor);
router.delete("/:id", protect, deleteAuthor);

module.exports = router;

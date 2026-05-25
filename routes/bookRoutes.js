const express = require("express");
const router = express.Router();

const {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
} = require("../controllers/bookController");

const { protect } = require("../middleware/auth");
const {
  validate,
  createBookSchema,
  updateBookSchema,
  borrowSchema,
} = require("../middleware/validate");

router.post("/:id/borrow", protect, validate(borrowSchema), borrowBook);
router.post("/:id/return", protect, returnBook);

router.get("/", getAllBooks);
router.get("/:id", getBook);
router.post("/", protect, validate(createBookSchema), createBook);
router.put("/:id", protect, validate(updateBookSchema), updateBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;

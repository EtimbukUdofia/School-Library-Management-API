const express = require("express");
const router = express.Router();

const {
  createStudent,
  getAllStudents,
  getStudent,
} = require("../controllers/studentController");

const { protect } = require("../middleware/auth");
const { validate, createStudentSchema } = require("../middleware/validate");

router.get("/", getAllStudents);
router.get("/:id", getStudent);
router.post("/", protect, validate(createStudentSchema), createStudent);

module.exports = router;

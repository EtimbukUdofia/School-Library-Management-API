const express = require("express");
const router = express.Router();

const {
  createAttendant,
  login,
  getAllAttendants,
} = require("../controllers/attendantController");

const { validate, createAttendantSchema, loginSchema } = require("../middleware/validate");

router.post("/", validate(createAttendantSchema), createAttendant);
router.post("/login", validate(loginSchema), login);

router.get("/", getAllAttendants);

module.exports = router;

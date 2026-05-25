const jwt = require("jsonwebtoken");
const Attendant = require("../models/Attendant");
const AppError = require("../utils/AppError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAttendant = async (req, res, next) => {
  try {
    const attendant = await Attendant.create(req.body);
    const token = signToken(attendant._id);

    attendant.password = undefined;

    res.status(201).json({
      status: "success",
      token,
      data: { attendant },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { staffId, password } = req.body;

    const attendant = await Attendant.findOne({ staffId }).select("+password");
    if (!attendant || !(await attendant.comparePassword(password))) {
      return next(new AppError("Incorrect staffId or password", 401));
    }

    const token = signToken(attendant._id);
    attendant.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      data: { attendant },
    });
  } catch (error) {
    next(error);
  }
};

const getAllAttendants = async (req, res, next) => {
  try {
    const attendants = await Attendant.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: attendants.length,
      data: { attendants },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAttendant, login, getAllAttendants };

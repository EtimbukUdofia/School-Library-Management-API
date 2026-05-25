const Student = require("../models/Student");
const AppError = require("../utils/AppError");

const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      status: "success",
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: students.length,
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};

const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return next(new AppError("Student not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createStudent, getAllStudents, getStudent };

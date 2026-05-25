const Joi = require("joi");
const AppError = require("../utils/AppError");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join("; ");
    return next(new AppError(message, 400));
  }
  next();
};

const createAuthorSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Author name cannot be empty",
    "any.required": "Author name is required",
  }),
  bio: Joi.string().trim().optional().allow(""),
});

const updateAuthorSchema = Joi.object({
  name: Joi.string().trim().optional(),
  bio: Joi.string().trim().optional().allow(""),
}).min(1);

const createBookSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Book title cannot be empty",
    "any.required": "Book title is required",
  }),
  isbn: Joi.string().trim().optional().allow(""),
  authors: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one author ID is required",
      "any.required": "authors field is required",
    }),
  status: Joi.string().valid("IN", "OUT").optional(),
});

const updateBookSchema = Joi.object({
  title: Joi.string().trim().optional(),
  isbn: Joi.string().trim().optional().allow(""),
  authors: Joi.array().items(Joi.string().hex().length(24)).min(1).optional(),
  status: Joi.string().valid("IN", "OUT").optional(),
}).min(1);

const createStudentSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "any.required": "Student name is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Student email is required",
  }),
  studentId: Joi.string().trim().required().messages({
    "any.required": "Student ID is required",
  }),
});

const createAttendantSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "any.required": "Attendant name is required",
  }),
  staffId: Joi.string().trim().required().messages({
    "any.required": "Staff ID is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

const loginSchema = Joi.object({
  staffId: Joi.string().trim().required().messages({
    "any.required": "Staff ID is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const borrowSchema = Joi.object({
  studentId: Joi.string().hex().length(24).required().messages({
    "any.required": "studentId is required",
    "string.length": "studentId must be a valid MongoDB ObjectId (24 hex chars)",
  }),
  attendantId: Joi.string().hex().length(24).required().messages({
    "any.required": "attendantId is required",
    "string.length": "attendantId must be a valid MongoDB ObjectId (24 hex chars)",
  }),
  returnDate: Joi.date().greater("now").required().messages({
    "date.greater": "returnDate must be a future date",
    "any.required": "returnDate is required",
  }),
});

module.exports = {
  validate,
  createAuthorSchema,
  updateAuthorSchema,
  createBookSchema,
  updateBookSchema,
  createStudentSchema,
  createAttendantSchema,
  loginSchema,
  borrowSchema,
};

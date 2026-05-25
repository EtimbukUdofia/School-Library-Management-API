const mongoose = require("mongoose");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Student = require("../models/Student");
const Attendant = require("../models/Attendant");
const AppError = require("../utils/AppError");

const populateBook = (query) =>
  query
    .populate("authors", "name bio")
    .populate("borrowedBy", "name email studentId")
    .populate("issuedBy", "name staffId");

const createBook = async (req, res, next) => {
  try {
    const { authors } = req.body;
    const foundAuthors = await Author.find({ _id: { $in: authors } });
    if (foundAuthors.length !== authors.length) {
      return next(
        new AppError("One or more author IDs are invalid or do not exist.", 400)
      );
    }

    const book = await Book.create(req.body);
    const populated = await populateBook(Book.findById(book._id));

    res.status(201).json({
      status: "success",
      data: { book: populated },
    });
  } catch (error) {
    next(error);
  }
};

const getAllBooks = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");

      const matchingAuthors = await Author.find({ name: searchRegex }).select(
        "_id"
      );
      const authorIds = matchingAuthors.map((a) => a._id);

      filter.$or = [
        { title: searchRegex },
        { authors: { $in: authorIds } },
      ];
    }

    if (req.query.overdue === "true") {
      filter.status = "OUT";
      filter.returnDate = { $lt: new Date() };
    }

    const [books, total] = await Promise.all([
      populateBook(Book.find(filter)).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      results: books.length,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

const getBook = async (req, res, next) => {
  try {
    const book = await populateBook(Book.findById(req.params.id));
    if (!book) {
      return next(new AppError("Book not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    if (req.body.authors) {
      const foundAuthors = await Author.find({
        _id: { $in: req.body.authors },
      });
      if (foundAuthors.length !== req.body.authors.length) {
        return next(
          new AppError("One or more author IDs are invalid or do not exist.", 400)
        );
      }
    }

    const book = await populateBook(
      Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
    );
    if (!book) {
      return next(new AppError("Book not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return next(new AppError("Book not found", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const borrowBook = async (req, res, next) => {
  try {
    const { studentId, attendantId, returnDate } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new AppError("Book not found", 404));
    }

    if (book.status !== "IN") {
      return next(
        new AppError(
          "This book is currently borrowed and not available for borrowing.",
          400
        )
      );
    }

    const [student, attendant] = await Promise.all([
      Student.findById(studentId),
      Attendant.findById(attendantId),
    ]);

    if (!student) {
      return next(new AppError("Student not found", 404));
    }
    if (!attendant) {
      return next(new AppError("Attendant not found", 404));
    }

    book.status = "OUT";
    book.borrowedBy = student._id;
    book.issuedBy = attendant._id;
    book.returnDate = new Date(returnDate);
    await book.save();

    const populated = await populateBook(Book.findById(book._id));

    res.status(200).json({
      status: "success",
      message: `"${book.title}" has been successfully borrowed by ${student.name}.`,
      data: { book: populated },
    });
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new AppError("Book not found", 404));
    }

    if (book.status !== "OUT") {
      return next(
        new AppError("This book is already in the library and has not been borrowed.", 400)
      );
    }

    book.status = "IN";
    book.borrowedBy = null;
    book.issuedBy = null;
    book.returnDate = null;
    await book.save();

    const populated = await populateBook(Book.findById(book._id));

    res.status(200).json({
      status: "success",
      message: `"${book.title}" has been successfully returned.`,
      data: { book: populated },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
};

const express = require("express");
const books = require("../controllers/Book.controller");

const router = express.Router();

router.route("/current-year").get(books.findBooksByCurrentYear);

router.route("/").get(books.getAll).post(books.create);

router.route("/:id").get(books.getById).put(books.update).delete(books.delete);

module.exports = router;

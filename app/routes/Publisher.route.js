const express = require("express");
const publishers = require("../controllers/Publisher.controller");

const router = express.Router();

router.route("/").get(publishers.getAll).post(publishers.create);

router
  .route("/:id")
  .get(publishers.getById)
  .put(publishers.update)
  .delete(publishers.delete);

module.exports = router;

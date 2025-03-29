const express = require("express");
const readers = require("../controllers/Reader.controller");

const router = express.Router();

router.route("/").get(readers.getAll).post(readers.create);
router
  .route("/:id")
  .get(readers.getById)
  .put(readers.update)
  .delete(readers.delete);

router.route("/phone/:id").get(readers.getByPhone);
router.route("/:id/change-state").put(readers.changeState);
module.exports = router;

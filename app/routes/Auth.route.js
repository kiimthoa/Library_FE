const express = require("express");
const auth = require("../controllers/Auth.controller");
const reader = require("../controllers/Reader.controller");

const router = express.Router();

router.post("/register", reader.create);

router.post("/reader-login", auth.readerLogin);
router.post("/staff-login", auth.staffLogin);

module.exports = router;

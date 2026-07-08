const express = require("express");
const {
  listProgress,
  createProgress,
} = require("../controllers/progressController");
const { requireRole } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { progressSchema } = require("../validation/schemas");

const router = express.Router();

router.use(requireRole("client"));
router.get("/", listProgress);
router.post("/", validate(progressSchema), createProgress);

module.exports = router;

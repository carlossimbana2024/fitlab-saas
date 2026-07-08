const express = require("express");
const {
  listSessions,
  createSession,
} = require("../controllers/sessionController");
const { requireRole } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { sessionSchema } = require("../validation/schemas");

const router = express.Router();

router.get("/", listSessions);
router.post("/", requireRole("owner"), validate(sessionSchema), createSession);

module.exports = router;

const express = require("express");
const { chatWithFitlabAI } = require("../controllers/aiController");
const { requireRole } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/chat", requireRole("client"), chatWithFitlabAI);

module.exports = router;
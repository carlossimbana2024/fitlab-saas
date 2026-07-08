const express = require("express");
const {
  listInvitations,
  createInvitation,
} = require("../controllers/invitationController");
const { requireRole } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { invitationSchema } = require("../validation/schemas");

const router = express.Router();

router.use(requireRole("owner"));
router.get("/", listInvitations);
router.post("/", validate(invitationSchema), createInvitation);

module.exports = router;

const express = require("express");
const {
  listMemberships,
  updateMembershipStatus,
} = require("../controllers/membershipController");
const { requireRole } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { membershipStatusSchema } = require("../validation/schemas");

const router = express.Router();

router.use(requireRole("owner"));
router.get("/", listMemberships);
router.patch("/:id", validate(membershipStatusSchema), updateMembershipStatus);

module.exports = router;

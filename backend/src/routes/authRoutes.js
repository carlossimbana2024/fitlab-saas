const express = require("express");
const router = express.Router();

const {
  registerUser,
  getCurrentUser,
  updateProfile,
} = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  invitationParamsSchema,
  registerSchema,
  profileSchema,
} = require("../validation/schemas");
const {
  getPublicInvitation,
} = require("../controllers/invitationController");

router.get(
  "/invitations/:code",
  validate(invitationParamsSchema),
  getPublicInvitation
);
router.post("/register", validate(registerSchema), registerUser);
router.get("/me", authenticate, getCurrentUser);
router.put("/profile", authenticate, validate(profileSchema), updateProfile);

module.exports = router;

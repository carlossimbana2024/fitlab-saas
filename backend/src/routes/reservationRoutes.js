const express = require("express");
const {
  listMyReservations,
  createReservation,
  cancelReservation,
} = require("../controllers/reservationController");
const { requireRole } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { idParams } = require("../validation/schemas");

const router = express.Router();

router.get("/me", requireRole("client"), listMyReservations);
router.post(
  "/sessions/:id",
  requireRole("client"),
  validate(idParams),
  createReservation
);
router.delete(
  "/sessions/:id",
  requireRole("client"),
  validate(idParams),
  cancelReservation
);

module.exports = router;

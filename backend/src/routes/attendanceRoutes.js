const express = require("express");
const {
  listAttendances,
  requestAttendance,
  confirmAttendance,
} = require("../controllers/attendanceController");
const { requireRole } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  idParams,
  confirmAttendanceSchema,
} = require("../validation/schemas");

const router = express.Router();

router.get("/", listAttendances);
router.post(
  "/sessions/:id",
  requireRole("client"),
  validate(idParams),
  requestAttendance
);
router.patch(
  "/:id",
  requireRole("owner"),
  validate(confirmAttendanceSchema),
  confirmAttendance
);

module.exports = router;

const express = require("express");
const {
  listActivities,
  createActivity,
  updateActivity,
} = require("../controllers/activityController");
const { requireRole } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  activitySchema,
  updateActivitySchema,
} = require("../validation/schemas");

const router = express.Router();

router.get("/", listActivities);
router.post("/", requireRole("owner"), validate(activitySchema), createActivity);
router.put(
  "/:id",
  requireRole("owner"),
  validate(updateActivitySchema),
  updateActivity
);

module.exports = router;

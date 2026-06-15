const express = require("express");
const { getMyGym, updateMyGym } = require("../controllers/gymController");
const { requireRole } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { updateGymSchema } = require("../validation/schemas");

const router = express.Router();

router.get("/me", getMyGym);
router.put("/me", requireRole("owner"), validate(updateGymSchema), updateMyGym);

module.exports = router;

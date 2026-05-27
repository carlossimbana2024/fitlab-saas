const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getGyms,
  updateProfile,
} = require("../controllers/authController");

router.get("/gyms", getGyms);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile/:uid", updateProfile);

module.exports = router;
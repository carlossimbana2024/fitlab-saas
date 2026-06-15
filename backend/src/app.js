const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const gymRoutes = require("./routes/gymRoutes");
const activityRoutes = require("./routes/activityRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const progressRoutes = require("./routes/progressRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const {
  authenticate,
  loadUserContext,
} = require("./middlewares/authMiddleware");
const {
  notFound,
  errorHandler,
} = require("./middlewares/errorMiddleware");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("Origen no permitido por CORS");
      error.status = 403;
      return callback(error);
    },
  })
);
app.use(express.json({ limit: "100kb" }));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  authRoutes
);

app.use("/api", authenticate, loadUserContext);
app.use("/api/gyms", gymRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/memberships", membershipRoutes);

app.get("/", (req, res) => {
  res.json({ message: "FitLab backend funcionando" });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;

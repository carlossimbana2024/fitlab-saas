const { admin, db } = require("../config/firebase");

const attendanceId = (sessionId, userId) => `${sessionId}_${userId}`;

const listAttendances = async (req, res, next) => {
  try {
    const snapshot = await db
      .collection("attendances")
      .where("gymId", "==", req.user.gymId)
      .get();

    const attendances = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (item) => req.user.role === "owner" || item.userId === req.user.uid
      );

    return res.json({ attendances });
  } catch (error) {
    return next(error);
  }
};

const requestAttendance = async (req, res, next) => {
  try {
    const { id: sessionId } = req.validated.params;
    const reservationDoc = await db
      .collection("reservations")
      .doc(`${sessionId}_${req.user.uid}`)
      .get();

    if (
      !reservationDoc.exists ||
      reservationDoc.data().gymId !== req.user.gymId ||
      reservationDoc.data().status !== "confirmed"
    ) {
      return res.status(403).json({
        message: "Necesitas una reserva activa para registrar asistencia",
      });
    }

    const startsAt = reservationDoc.data().startsAt.toMillis();
    const earliestCheckIn = startsAt - 4 * 60 * 60 * 1000;
    const latestCheckIn = startsAt + 12 * 60 * 60 * 1000;

    if (Date.now() < earliestCheckIn || Date.now() > latestCheckIn) {
      return res.status(409).json({
        message:
          "La asistencia solo puede registrarse desde 4 horas antes hasta 12 horas después de la sesión",
      });
    }

    const attendanceRef = db
      .collection("attendances")
      .doc(attendanceId(sessionId, req.user.uid));

    const existing = await attendanceRef.get();
    if (existing.exists) {
      return res.status(409).json({
        message: "La asistencia para esta sesión ya fue registrada",
      });
    }

    await attendanceRef.create({
      gymId: req.user.gymId,
      sessionId,
      userId: req.user.uid,
      userName: `${req.user.name} ${req.user.lastName}`.trim(),
      activityName: reservationDoc.data().activityName,
      status: "pending",
      method: "self_service",
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      confirmedAt: null,
      confirmedBy: null,
    });

    return res.status(201).json({
      message: "Asistencia enviada para confirmación",
    });
  } catch (error) {
    return next(error);
  }
};

const confirmAttendance = async (req, res, next) => {
  try {
    const { id } = req.validated.params;
    const attendanceRef = db.collection("attendances").doc(id);
    const attendanceDoc = await attendanceRef.get();

    if (
      !attendanceDoc.exists ||
      attendanceDoc.data().gymId !== req.user.gymId
    ) {
      return res.status(404).json({ message: "Asistencia no encontrada" });
    }

    await attendanceRef.update({
      status: req.validated.body.status,
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      confirmedBy: req.user.uid,
    });

    return res.json({ message: "Asistencia actualizada correctamente" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listAttendances,
  requestAttendance,
  confirmAttendance,
};

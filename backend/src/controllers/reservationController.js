const { admin, db } = require("../config/firebase");

const reservationId = (sessionId, userId) => `${sessionId}_${userId}`;

const listMyReservations = async (req, res, next) => {
  try {
    const snapshot = await db
      .collection("reservations")
      .where("userId", "==", req.user.uid)
      .get();

    const reservations = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.gymId === req.user.gymId);

    return res.json({ reservations });
  } catch (error) {
    return next(error);
  }
};

const createReservation = async (req, res, next) => {
  try {
    const { id: sessionId } = req.validated.params;
    const sessionRef = db.collection("classSessions").doc(sessionId);
    const reservationRef = db
      .collection("reservations")
      .doc(reservationId(sessionId, req.user.uid));

    await db.runTransaction(async (transaction) => {
      const [sessionDoc, existingReservation] = await Promise.all([
        transaction.get(sessionRef),
        transaction.get(reservationRef),
      ]);

      if (
        !sessionDoc.exists ||
        sessionDoc.data().gymId !== req.user.gymId ||
        sessionDoc.data().status !== "scheduled"
      ) {
        const error = new Error("Sesión no encontrada o no disponible");
        error.status = 404;
        throw error;
      }

      if (existingReservation.exists && existingReservation.data().status === "confirmed") {
        const error = new Error("Ya tienes una reserva para esta sesión");
        error.status = 409;
        throw error;
      }

      const session = sessionDoc.data();
      if ((session.reservedCount || 0) >= session.capacity) {
        const error = new Error("La sesión ya no tiene cupos disponibles");
        error.status = 409;
        throw error;
      }

      transaction.set(reservationRef, {
        gymId: req.user.gymId,
        sessionId,
        userId: req.user.uid,
        userName: `${req.user.name} ${req.user.lastName}`.trim(),
        activityName: session.activityName,
        startsAt: session.startsAt,
        status: "confirmed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.update(sessionRef, {
        reservedCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.status(201).json({ message: "Reserva creada correctamente" });
  } catch (error) {
    return next(error);
  }
};

const cancelReservation = async (req, res, next) => {
  try {
    const { id: sessionId } = req.validated.params;
    const sessionRef = db.collection("classSessions").doc(sessionId);
    const reservationRef = db
      .collection("reservations")
      .doc(reservationId(sessionId, req.user.uid));
    const attendanceRef = db
      .collection("attendances")
      .doc(`${sessionId}_${req.user.uid}`);

    await db.runTransaction(async (transaction) => {
      const [reservationDoc, attendanceDoc] = await Promise.all([
        transaction.get(reservationRef),
        transaction.get(attendanceRef),
      ]);

      if (
        !reservationDoc.exists ||
        reservationDoc.data().gymId !== req.user.gymId ||
        reservationDoc.data().status !== "confirmed"
      ) {
        const error = new Error("Reserva activa no encontrada");
        error.status = 404;
        throw error;
      }

      if (attendanceDoc.exists) {
        const error = new Error(
          "No puedes cancelar una reserva con asistencia registrada"
        );
        error.status = 409;
        throw error;
      }

      transaction.update(reservationRef, {
        status: "cancelled",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.update(sessionRef, {
        reservedCount: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listMyReservations,
  createReservation,
  cancelReservation,
};

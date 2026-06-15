const { admin, db } = require("../config/firebase");

const timestampMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value._seconds) return value._seconds * 1000;
  return new Date(value).getTime();
};

const listSessions = async (req, res, next) => {
  try {
    const snapshot = await db
      .collection("classSessions")
      .where("gymId", "==", req.user.gymId)
      .get();

    const sessions = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((session) => timestampMillis(session.startsAt) >= Date.now())
      .sort((a, b) => timestampMillis(a.startsAt) - timestampMillis(b.startsAt));

    return res.json({ sessions });
  } catch (error) {
    return next(error);
  }
};

const createSession = async (req, res, next) => {
  try {
    const data = req.validated.body;
    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);

    if (startsAt <= new Date() || endsAt <= startsAt) {
      return res.status(400).json({
        message: "La sesión debe ser futura y terminar después de iniciar",
      });
    }

    const activityDoc = await db.collection("activities").doc(data.activityId).get();

    if (
      !activityDoc.exists ||
      activityDoc.data().gymId !== req.user.gymId ||
      activityDoc.data().status !== "active"
    ) {
      return res.status(404).json({ message: "Actividad no encontrada o inactiva" });
    }

    const sessionRef = db.collection("classSessions").doc();
    await sessionRef.create({
      gymId: req.user.gymId,
      activityId: activityDoc.id,
      activityName: activityDoc.data().name,
      startsAt: admin.firestore.Timestamp.fromDate(startsAt),
      endsAt: admin.firestore.Timestamp.fromDate(endsAt),
      capacity: data.capacity,
      reservedCount: 0,
      instructor: data.instructor || null,
      location: data.location || null,
      status: "scheduled",
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const created = await sessionRef.get();
    return res.status(201).json({
      message: "Sesión creada correctamente",
      session: { id: created.id, ...created.data() },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listSessions,
  createSession,
};

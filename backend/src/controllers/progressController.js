const { admin, db } = require("../config/firebase");

const listProgress = async (req, res, next) => {
  try {
    const snapshot = await db
      .collection("progressEntries")
      .where("userId", "==", req.user.uid)
      .get();

    const entries = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((entry) => entry.gymId === req.user.gymId)
      .sort((a, b) => b.recordedAt.toMillis() - a.recordedAt.toMillis());

    return res.json({ entries });
  } catch (error) {
    return next(error);
  }
};

const createProgress = async (req, res, next) => {
  try {
    const data = req.validated.body;
    const entryRef = db.collection("progressEntries").doc();

    await entryRef.create({
      gymId: req.user.gymId,
      userId: req.user.uid,
      recordedAt: admin.firestore.Timestamp.fromDate(new Date(data.recordedAt)),
      weight: data.weight || null,
      bodyFat: data.bodyFat || null,
      notes: data.notes || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const created = await entryRef.get();
    return res.status(201).json({
      message: "Progreso registrado correctamente",
      entry: { id: created.id, ...created.data() },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listProgress,
  createProgress,
};

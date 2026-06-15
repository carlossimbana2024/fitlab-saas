const { admin, db } = require("../config/firebase");

const listActivities = async (req, res, next) => {
  try {
    const snapshot = await db
      .collection("activities")
      .where("gymId", "==", req.user.gymId)
      .get();

    const activities = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.json({ activities });
  } catch (error) {
    return next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const data = req.validated.body;
    const activityRef = db.collection("activities").doc();

    await activityRef.create({
      gymId: req.user.gymId,
      name: data.name,
      description: data.description || null,
      status: data.status,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const created = await activityRef.get();
    return res.status(201).json({
      message: "Actividad creada correctamente",
      activity: { id: created.id, ...created.data() },
    });
  } catch (error) {
    return next(error);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.validated.params;
    const activityRef = db.collection("activities").doc(id);
    const activityDoc = await activityRef.get();

    if (!activityDoc.exists || activityDoc.data().gymId !== req.user.gymId) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    const data = req.validated.body;
    await activityRef.update({
      name: data.name,
      description: data.description || null,
      status: data.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await activityRef.get();
    return res.json({
      message: "Actividad actualizada correctamente",
      activity: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listActivities,
  createActivity,
  updateActivity,
};

const { admin, db } = require("../config/firebase");

const getMyGym = async (req, res) => {
  return res.json({
    gym: req.gym,
  });
};

const updateMyGym = async (req, res, next) => {
  try {
    const data = req.validated.body;
    const gymRef = db.collection("gyms").doc(req.user.gymId);

    await gymRef.update({
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updated = await gymRef.get();
    return res.json({
      message: "Gimnasio actualizado correctamente",
      gym: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyGym,
  updateMyGym,
};

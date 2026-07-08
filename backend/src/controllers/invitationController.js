const crypto = require("crypto");
const { admin, db } = require("../config/firebase");

const createCode = () => crypto.randomBytes(5).toString("hex").toUpperCase();

const listInvitations = async (req, res, next) => {
  try {
    const snapshot = await db
      .collection("invitations")
      .where("gymId", "==", req.user.gymId)
      .get();

    const invitations = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((invitation) => invitation.status === "active");

    return res.json({ invitations });
  } catch (error) {
    return next(error);
  }
};

const createInvitation = async (req, res, next) => {
  try {
    const { email, expiresInDays } = req.validated.body;
    const invitationRef = db.collection("invitations").doc();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await invitationRef.create({
      gymId: req.user.gymId,
      code: createCode(),
      email: email ? email.toLowerCase() : null,
      role: "client",
      status: "active",
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      usedAt: null,
      usedBy: null,
    });

    const created = await invitationRef.get();
    return res.status(201).json({
      message: "Invitación creada correctamente",
      invitation: { id: created.id, ...created.data() },
    });
  } catch (error) {
    return next(error);
  }
};

const getPublicInvitation = async (req, res, next) => {
  try {
    const code = req.validated.params.code.toUpperCase();
    const snapshot = await db
      .collection("invitations")
      .where("code", "==", code)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }

    const invitation = snapshot.docs[0].data();
    const expired = invitation.expiresAt.toMillis() <= Date.now();

    if (invitation.status !== "active" || expired) {
      return res.status(410).json({ message: "La invitación ya no está disponible" });
    }

    const gymDoc = await db.collection("gyms").doc(invitation.gymId).get();
    if (!gymDoc.exists || gymDoc.data().status !== "active") {
      return res.status(404).json({ message: "Gimnasio no disponible" });
    }

    return res.json({
      invitation: {
        code,
        gym: {
          id: gymDoc.id,
          name: gymDoc.data().name,
          city: gymDoc.data().city || null,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listInvitations,
  createInvitation,
  getPublicInvitation,
};

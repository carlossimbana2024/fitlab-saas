const { admin, db } = require("../config/firebase");

const listMemberships = async (req, res, next) => {
  try {
    const usersSnapshot = await db
      .collection("users")
      .where("gym_id", "==", req.user.gymId)
      .limit(100)
      .get();

    const clientDocs = usersSnapshot.docs.filter(
      (doc) => doc.data().role === "client"
    );
    const membershipRefs = clientDocs.map((doc) =>
      db.collection("memberships").doc(`${req.user.gymId}_${doc.id}`)
    );
    const membershipDocs =
      membershipRefs.length > 0 ? await db.getAll(...membershipRefs) : [];
    const batch = db.batch();
    let hasMigrations = false;

    membershipDocs.forEach((membershipDoc, index) => {
      if (!membershipDoc.exists) {
        hasMigrations = true;
        batch.create(membershipRefs[index], {
          gymId: req.user.gymId,
          userId: clientDocs[index].id,
          status: "active",
          plan: null,
          startsAt: admin.firestore.FieldValue.serverTimestamp(),
          endsAt: null,
          migratedFromLegacyUser: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    if (hasMigrations) {
      await batch.commit();
    }

    const currentMemberships =
      membershipRefs.length > 0 ? await db.getAll(...membershipRefs) : [];

    return res.json({
      memberships: currentMemberships.map((membershipDoc, index) => ({
        id: membershipDoc.id,
        ...membershipDoc.data(),
        user: clientDocs[index].exists
          ? {
              name: clientDocs[index].data().name,
              lastName: clientDocs[index].data().lastName,
              email: clientDocs[index].data().email,
            }
          : null,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const updateMembershipStatus = async (req, res, next) => {
  try {
    const membershipRef = db
      .collection("memberships")
      .doc(req.validated.params.id);
    const membershipDoc = await membershipRef.get();

    if (
      !membershipDoc.exists ||
      membershipDoc.data().gymId !== req.user.gymId
    ) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    await membershipRef.update({
      status: req.validated.body.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid,
    });

    return res.json({ message: "Membresía actualizada correctamente" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listMemberships,
  updateMembershipStatus,
};

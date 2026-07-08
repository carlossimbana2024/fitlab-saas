const { admin, auth, db } = require("../config/firebase");

const publicUserData = (userDoc) => {
  const data = userDoc.data();

  return {
    ...data,
    uid: userDoc.id,
    role: typeof data.role === "string" ? data.role.trim() : data.role,
    gym_id:
      typeof data.gym_id === "string" ? data.gym_id.trim() : data.gym_id,
  };
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const registerUser = async (req, res) => {
  let createdUser = null;

  try {
    const {
      name,
      lastName,
      email,
      password,
      invitationCode,
      birthDate,
      gender,
    } = req.validated.body;

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(lastName) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(invitationCode)
    ) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener mínimo 6 caracteres",
      });
    }

    const invitationSnapshot = await db
      .collection("invitations")
      .where("code", "==", invitationCode.trim().toUpperCase())
      .limit(1)
      .get();

    if (invitationSnapshot.empty) {
      return res.status(404).json({
        message: "La invitación no existe",
      });
    }

    const invitationRef = invitationSnapshot.docs[0].ref;
    const invitation = invitationSnapshot.docs[0].data();
    const gymDoc = await db.collection("gyms").doc(invitation.gymId).get();

    if (
      invitation.status !== "active" ||
      invitation.expiresAt.toMillis() <= Date.now() ||
      !gymDoc.exists ||
      gymDoc.data().status !== "active"
    ) {
      return res.status(410).json({
        message: "La invitación ya no está disponible",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (invitation.email && invitation.email !== normalizedEmail) {
      return res.status(403).json({
        message: "La invitación pertenece a otro correo electrónico",
      });
    }

    createdUser = await auth.createUser({
      email: normalizedEmail,
      password,
      displayName: `${name.trim()} ${lastName.trim()}`,
      emailVerified: false,
      disabled: false,
    });

    const userRef = db.collection("users").doc(createdUser.uid);
    const membershipRef = db
      .collection("memberships")
      .doc(`${invitation.gymId}_${createdUser.uid}`);

    await db.runTransaction(async (transaction) => {
      const freshInvitation = await transaction.get(invitationRef);
      const invitationData = freshInvitation.data();

      if (
        !freshInvitation.exists ||
        invitationData.status !== "active" ||
        invitationData.expiresAt.toMillis() <= Date.now()
      ) {
        const error = new Error("La invitación ya fue utilizada o expiró");
        error.status = 409;
        throw error;
      }

      transaction.create(userRef, {
        uid: createdUser.uid,
        name: name.trim(),
        lastName: lastName.trim(),
        email: createdUser.email,
        role: "client",
        gym_id: invitation.gymId,
        birthDate: birthDate || null,
        gender: gender || null,
        phone: null,
        weight: null,
        height: null,
        goal: null,
        level: null,
        weeklyFrequency: null,
        injuries: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.create(membershipRef, {
        gymId: invitation.gymId,
        userId: createdUser.uid,
        status: "active",
        plan: null,
        startsAt: admin.firestore.FieldValue.serverTimestamp(),
        endsAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.update(invitationRef, {
        status: "used",
        usedAt: admin.firestore.FieldValue.serverTimestamp(),
        usedBy: createdUser.uid,
      });
    });

    return res.status(201).json({
      message: "Cuenta creada correctamente",
      uid: createdUser.uid,
    });
  } catch (error) {
    if (createdUser) {
      try {
        await auth.deleteUser(createdUser.uid);
      } catch (rollbackError) {
        console.error(
          "No se pudo revertir el usuario de Firebase:",
          rollbackError
        );
      }
    }

    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({
        message: "Ya existe una cuenta con este correo electrónico",
      });
    }

    console.error("Error registrando usuario:", error);
    return res.status(500).json({
      message: "Error registrando usuario",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.auth.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const user = publicUserData(userDoc);
    const gymDoc = user.gym_id
      ? await db.collection("gyms").doc(user.gym_id).get()
      : null;

    return res.json({
      user: {
        ...user,
        gym: gymDoc?.exists
          ? {
              id: gymDoc.id,
              name: gymDoc.data().name,
              city: gymDoc.data().city || null,
            }
          : null,
      },
    });
  } catch {
    return res.status(500).json({
      message: "Error obteniendo el usuario",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      lastName,
      birthDate,
      gender,
      phone,
      weight,
      height,
      goal,
      level,
      weeklyFrequency,
      injuries,
    } = req.validated.body;

    if (!isNonEmptyString(name) || !isNonEmptyString(lastName)) {
      return res.status(400).json({
        message: "Nombre y apellido son obligatorios",
      });
    }

    const userRef = db.collection("users").doc(req.auth.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const updatedData = {
      name: name.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate || null,
      gender: gender || null,
      phone: phone || null,
      weight: weight || null,
      height: height || null,
      goal: goal || null,
      level: level || null,
      weeklyFrequency: weeklyFrequency || null,
      injuries: injuries || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.update(updatedData);

    const updatedDoc = await userRef.get();
    const updatedUser = publicUserData(updatedDoc);
    const gymDoc = updatedUser.gym_id
      ? await db.collection("gyms").doc(updatedUser.gym_id).get()
      : null;

    return res.json({
      message: "Perfil actualizado correctamente",
      user: {
        ...updatedUser,
        gym: gymDoc?.exists
          ? {
              id: gymDoc.id,
              name: gymDoc.data().name,
              city: gymDoc.data().city || null,
            }
          : null,
      },
    });
  } catch {
    return res.status(500).json({
      message: "Error actualizando perfil",
    });
  }
};

module.exports = {
  registerUser,
  getCurrentUser,
  updateProfile,
};

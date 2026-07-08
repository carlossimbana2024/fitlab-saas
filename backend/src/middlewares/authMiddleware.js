const { admin, auth, db } = require("../config/firebase");

const authenticate = async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Token de autenticación requerido",
    });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token, true);

    if (!decodedToken.email_verified) {
      return res.status(403).json({
        message: "Debes verificar tu correo electrónico",
      });
    }

    req.auth = decodedToken;
    return next();
  } catch {
    return res.status(401).json({
      message: "Token de autenticación inválido o expirado",
    });
  }
};

const loadUserContext = async (req, res, next) => {
  try {
    const userDoc = await db.collection("users").doc(req.auth.uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({
        message: "El perfil del usuario no existe",
      });
    }

    const storedUser = userDoc.data();
    const user = {
      ...storedUser,
      role:
        typeof storedUser.role === "string"
          ? storedUser.role.trim()
          : storedUser.role,
      gym_id:
        typeof storedUser.gym_id === "string"
          ? storedUser.gym_id.trim()
          : storedUser.gym_id,
    };

    if (!user.gym_id || !["owner", "client"].includes(user.role)) {
      return res.status(403).json({
        message: "El usuario no tiene un gimnasio o rol válido",
      });
    }

    const gymDoc = await db.collection("gyms").doc(user.gym_id).get();

    if (!gymDoc.exists || gymDoc.data().status !== "active") {
      return res.status(403).json({
        message: "El gimnasio no existe o no está activo",
      });
    }

    req.user = {
      ...user,
      uid: userDoc.id,
      gymId: user.gym_id,
    };
    req.gym = {
      ...gymDoc.data(),
      id: gymDoc.id,
    };

    if (user.role === "client") {
      const membershipRef = db
        .collection("memberships")
        .doc(`${user.gym_id}_${userDoc.id}`);
      let membershipDoc = await membershipRef.get();

      if (!membershipDoc.exists) {
        await membershipRef.create({
          gymId: user.gym_id,
          userId: userDoc.id,
          status: "active",
          plan: null,
          startsAt: admin.firestore.FieldValue.serverTimestamp(),
          endsAt: null,
          migratedFromLegacyUser: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        membershipDoc = await membershipRef.get();
      }

      if (membershipDoc.data().status !== "active") {
        return res.status(403).json({
          message: "Tu membresía no está activa",
        });
      }

      req.membership = {
        id: membershipDoc.id,
        ...membershipDoc.data(),
      };
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: "No tienes permisos para realizar esta acción",
    });
  }

  return next();
};

module.exports = {
  authenticate,
  loadUserContext,
  requireRole,
};

const { db } = require("../config/firebase");

const getGyms = async (req, res) => {
  try {
    const snapshot = await db
      .collection("gyms")
      .where("status", "==", "active")
      .get();

    const gyms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(gyms);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo gimnasios",
      error: error.message,
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { uid, name, lastName, email, role, gym_id, birthDate, gender } =
      req.body;

    if (!uid || !name || !lastName || !email || !role || !gym_id) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
      });
    }

    if (!["owner", "client"].includes(role)) {
      return res.status(400).json({
        message: "Rol inválido",
      });
    }

    const gymDoc = await db.collection("gyms").doc(gym_id).get();

    if (!gymDoc.exists) {
      return res.status(404).json({
        message: "El gimnasio seleccionado no existe",
      });
    }

    await db.collection("users").doc(uid).set({
      uid,
      name,
      lastName,
      email,
      role,
      gym_id,
      birthDate: birthDate || null,
      gender: gender || null,
      phone: null,
      weight: null,
      height: null,
      goal: null,
      level: null,
      weeklyFrequency: null,
      injuries: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Usuario guardado correctamente en Firestore",
      uid,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registrando usuario",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        message: "UID requerido",
      });
    }

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json({
      message: "Login correcto",
      user: userDoc.data(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error login",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { uid } = req.params;

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
    } = req.body;

    if (!uid) {
      return res.status(400).json({
        message: "UID requerido",
      });
    }

    if (!name || !lastName) {
      return res.status(400).json({
        message: "Nombre y apellido son obligatorios",
      });
    }

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const updatedData = {
      name,
      lastName,
      birthDate: birthDate || null,
      gender: gender || null,
      phone: phone || null,
      weight: weight || null,
      height: height || null,
      goal: goal || null,
      level: level || null,
      weeklyFrequency: weeklyFrequency || null,
      injuries: injuries || null,
      updatedAt: new Date(),
    };

    await userRef.update(updatedData);

    const updatedDoc = await userRef.get();

    res.json({
      message: "Perfil actualizado correctamente",
      user: updatedDoc.data(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error actualizando perfil",
      error: error.message,
    });
  }
};

module.exports = {
  getGyms,
  registerUser,
  loginUser,
  updateProfile,
};
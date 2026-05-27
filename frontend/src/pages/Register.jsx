import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import { firebaseAuth } from "../firebase";
import { registerUser, getGyms } from "../api/authApi";

const Register = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    birthDate: "",
    gender: "",
    role: "",
    gym_id: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadGyms = async () => {
      try {
        const data = await getGyms();
        setGyms(data);
    } catch  {
        alert("Error al cargar gimnasios");
      }
    };

    loadGyms();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.role ||
      !form.gym_id
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    if (form.password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        form.email,
        form.password
      );

      await sendEmailVerification(userCredential.user);

      await registerUser({
        uid: userCredential.user.uid,
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        gym_id: form.gym_id,
        birthDate: form.birthDate,
        gender: form.gender,
      });

      alert("Cuenta creada. Revisa tu correo para verificar tu cuenta.");
      navigate("/login");
    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card register-card">
        <h1>
          <span>fit</span>Lab
        </h1>

        <h2>Crea tu cuenta</h2>
        <p>Completa tus datos para comenzar</p>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <input
              name="name"
              placeholder="Nombre"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="lastName"
              placeholder="Apellido"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
          />

          <div className="grid-2">
            <input
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
            />

            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Género</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="">Selecciona tu rol</option>
            <option value="owner">Dueño</option>
            <option value="client">Cliente</option>
          </select>

          <select name="gym_id" value={form.gym_id} onChange={handleChange}>
            <option value="">Selecciona tu gimnasio</option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit">Crear cuenta</button>
        </form>

        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
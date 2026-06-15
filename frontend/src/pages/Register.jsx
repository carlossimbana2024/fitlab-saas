import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "../firebase";
import { getInvitation, registerUser } from "../api/authApi";
import StatusMessage from "../components/StatusMessage";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    invitationCode: searchParams.get("code") || "",
    name: "",
    lastName: "",
    email: "",
    birthDate: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const checkInvitation = async (code = form.invitationCode) => {
    if (!code.trim()) return;

    setCheckingCode(true);
    try {
      const response = await getInvitation(code.trim().toUpperCase());
      setInvitation(response.invitation);
      setForm((current) => ({
        ...current,
        invitationCode: response.invitation.code,
      }));
      setMessage({
        type: "success",
        text: `Invitación válida para ${response.invitation.gym.name}`,
      });
    } catch (error) {
      setInvitation(null);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "El código de invitación no es válido",
      });
    } finally {
      setCheckingCode(false);
    }
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!invitation) {
      setMessage({ type: "error", text: "Valida primero tu invitación" });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    let accountCreated = false;
    setSubmitting(true);

    try {
      await registerUser({
        invitationCode: form.invitationCode,
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        birthDate: form.birthDate,
        gender: form.gender,
      });
      accountCreated = true;

      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        form.email,
        form.password
      );
      await sendEmailVerification(credential.user);
      await signOut(firebaseAuth);

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (error) {
      if (firebaseAuth.currentUser) await signOut(firebaseAuth);

      setMessage({
        type: accountCreated ? "success" : "error",
        text: accountCreated
          ? "Tu cuenta fue creada. Inicia sesión para solicitar otro correo de verificación."
          : error.response?.data?.message ||
            error.message ||
            "No se pudo crear la cuenta",
      });

      if (accountCreated) navigate("/login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card register-card">
        <h1>
          <span>fit</span>Lab
        </h1>
        <h2>Únete a tu gimnasio</h2>
        <p>Necesitas el código enviado por el administrador.</p>
        <StatusMessage message={message} />

        <div className="code-row">
          <input
            name="invitationCode"
            value={form.invitationCode}
            onChange={(e) =>
              setForm({
                ...form,
                invitationCode: e.target.value.toUpperCase(),
              })
            }
            placeholder="Código de invitación"
          />
          <button
            type="button"
            disabled={checkingCode}
            onClick={() => checkInvitation()}
          >
            {checkingCode ? "Validando..." : "Validar"}
          </button>
        </div>

        {invitation && (
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <input
                name="name"
                placeholder="Nombre"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                name="lastName"
                placeholder="Apellido"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />
            <div className="grid-2">
              <input
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Género</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="grid-2">
              <input
                name="password"
                type="password"
                minLength="6"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />
              <input
                name="confirmPassword"
                type="password"
                minLength="6"
                placeholder="Confirmar contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        )}

        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;

import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "../firebase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      alert("Te enviamos un correo para restablecer tu contraseña.");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>
          <span>fit</span>Lab
        </h1>

        <h2>Recuperar contraseña</h2>
        <p>Ingresa tu correo electrónico</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Enviar enlace</button>
        </form>

        <Link to="/login">Volver al login</Link>
      </div>
    </section>
  );
};

export default ForgotPassword;
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ClientDashboard = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    lastName: user?.lastName || "",
    birthDate: user?.birthDate || "",
    gender: user?.gender || "",
    phone: user?.phone || "",
    weight: user?.weight || "",
    height: user?.height || "",
    goal: user?.goal || "",
    level: user?.level || "",
    weeklyFrequency: user?.weeklyFrequency || "",
    injuries: user?.injuries || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!form.name || !form.lastName) {
      alert("Nombre y apellido son obligatorios");
      return;
    }

    try {
      await updateProfile(form);
      alert("Perfil actualizado correctamente");
      setEditing(false);
    } catch (error) {
      alert("Error al actualizar perfil: " + error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      alert("Completa todos los campos de contraseña");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("La nueva contraseña debe tener mínimo 6 caracteres");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Las nuevas contraseñas no coinciden");
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);

      alert("Contraseña actualizada correctamente");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setChangingPassword(false);
    } catch (error) {
      alert("Error al cambiar contraseña: " + error.message);
    }
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <h1>Hola, {user?.name}</h1>
          <p>Bienvenido a tu panel de entrenamiento</p>
        </div>

        <button onClick={logout}>Cerrar sesión</button>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Resumen</h2>
          <p><strong>Nombre:</strong> {user?.name} {user?.lastName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Gimnasio:</strong> {user?.gym_id}</p>
          <p><strong>Teléfono:</strong> {user?.phone || "No registrado"}</p>
        </article>

        <article className="dashboard-card">
          <h2>Mi perfil físico</h2>
          <p><strong>Peso:</strong> {user?.weight ? `${user.weight} kg` : "No registrado"}</p>
          <p><strong>Altura:</strong> {user?.height ? `${user.height} cm` : "No registrado"}</p>
          <p><strong>Objetivo:</strong> {user?.goal || "No registrado"}</p>
          <p><strong>Nivel:</strong> {user?.level || "No registrado"}</p>
          <p><strong>Frecuencia semanal:</strong> {user?.weeklyFrequency || "No registrado"}</p>
          <p><strong>Lesiones:</strong> {user?.injuries || "No registrado"}</p>

          <button onClick={() => setEditing(true)}>
            {user?.weight ? "Actualizar perfil físico" : "Completar perfil físico"}
          </button>
        </article>

        <article className="dashboard-card">
          <h2>Mis clases</h2>
          <p>No tienes clases reservadas todavía.</p>
          <button>Ver clases disponibles</button>
        </article>

        <article className="dashboard-card">
          <h2>Mi progreso</h2>
          <p>Aquí verás tu evolución física y asistencia.</p>
          <button>Ver progreso</button>
        </article>

        <article className="dashboard-card">
          <h2>Configuración de cuenta</h2>
          <p>Actualiza tu información personal, física o cambia tu contraseña.</p>
          <button onClick={() => setEditing(true)}>Editar perfil</button>
          <button onClick={() => setChangingPassword(true)}>
            Cambiar contraseña
          </button>
        </article>
      </section>

      {editing && (
        <section className="profile-modal">
          <div className="profile-form-card">
            <h2>Actualizar perfil</h2>
            <p>Completa o actualiza tu información personal y física.</p>

            <form onSubmit={handleUpdateProfile}>
              <div className="grid-2">
                <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} />
                <input name="lastName" placeholder="Apellido" value={form.lastName} onChange={handleChange} />
              </div>

              <div className="grid-2">
                <input name="birthDate" type="date" value={form.birthDate || ""} onChange={handleChange} />

                <select name="gender" value={form.gender || ""} onChange={handleChange}>
                  <option value="">Género</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <input name="phone" placeholder="Teléfono" value={form.phone || ""} onChange={handleChange} />

              <div className="grid-2">
                <input name="weight" type="number" placeholder="Peso en kg" value={form.weight || ""} onChange={handleChange} />
                <input name="height" type="number" placeholder="Altura en cm" value={form.height || ""} onChange={handleChange} />
              </div>

              <select name="goal" value={form.goal || ""} onChange={handleChange}>
                <option value="">Objetivo principal</option>
                <option value="Bajar grasa">Bajar grasa</option>
                <option value="Ganar masa muscular">Ganar masa muscular</option>
                <option value="Mejorar fuerza">Mejorar fuerza</option>
                <option value="Mejorar resistencia">Mejorar resistencia</option>
                <option value="Salud general">Salud general</option>
              </select>

              <select name="level" value={form.level || ""} onChange={handleChange}>
                <option value="">Nivel de experiencia</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>

              <select name="weeklyFrequency" value={form.weeklyFrequency || ""} onChange={handleChange}>
                <option value="">Frecuencia semanal</option>
                <option value="2 días por semana">2 días por semana</option>
                <option value="3 días por semana">3 días por semana</option>
                <option value="4 días por semana">4 días por semana</option>
                <option value="5 días por semana">5 días por semana</option>
                <option value="6 días por semana">6 días por semana</option>
              </select>

              <textarea
                name="injuries"
                placeholder="Lesiones, molestias o restricciones físicas"
                value={form.injuries || ""}
                onChange={handleChange}
              />

              <div className="form-actions">
                <button type="submit">Guardar cambios</button>
                <button type="button" onClick={() => setEditing(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </section>
      )}

      {changingPassword && (
        <section className="profile-modal">
          <div className="profile-form-card">
            <h2>Cambiar contraseña</h2>
            <p>Por seguridad, ingresa tu contraseña actual.</p>

            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="Contraseña actual"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="Nueva contraseña"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
              />

              <div className="form-actions">
                <button type="submit">Guardar contraseña</button>
                <button type="button" onClick={() => setChangingPassword(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </section>
      )}
    </main>
  );
};

export default ClientDashboard;
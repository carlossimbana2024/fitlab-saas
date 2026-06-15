import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ClientProfile = ({ onMessage }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const errorText = (error) =>
    error.response?.data?.message || error.message || "Ocurrió un error";

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      onMessage({ type: "success", text: "Perfil actualizado correctamente" });
      setEditing(false);
    } catch (error) {
      onMessage({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();

    if (password.newPassword !== password.confirmPassword) {
      onMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    setSaving(true);
    try {
      await changePassword(password.currentPassword, password.newPassword);
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangingPassword(false);
      onMessage({ type: "success", text: "Contraseña actualizada" });
    } catch (error) {
      onMessage({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="dashboard-card dashboard-section">
      <div className="card-heading">
        <div>
          <h2>Perfil y progreso inicial</h2>
          <p>Actualiza tus datos personales y físicos.</p>
        </div>
        <div className="inline-actions">
          <button type="button" onClick={() => setEditing((value) => !value)}>
            {editing ? "Cerrar edición" : "Editar perfil"}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => setChangingPassword((value) => !value)}
          >
            Cambiar contraseña
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={saveProfile}>
          <div className="grid-2">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre"
              required
            />
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder="Apellido"
              required
            />
          </div>
          <div className="grid-2">
            <input
              type="date"
              value={form.birthDate || ""}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
            <input
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Teléfono"
            />
          </div>
          <div className="grid-2">
            <input
              type="number"
              min="20"
              max="400"
              value={form.weight || ""}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              placeholder="Peso en kg"
            />
            <input
              type="number"
              min="80"
              max="250"
              value={form.height || ""}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              placeholder="Altura en cm"
            />
          </div>
          <div className="grid-2">
            <select
              value={form.goal || ""}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            >
              <option value="">Objetivo</option>
              <option value="Bajar grasa">Bajar grasa</option>
              <option value="Ganar masa muscular">Ganar masa muscular</option>
              <option value="Mejorar fuerza">Mejorar fuerza</option>
              <option value="Mejorar resistencia">Mejorar resistencia</option>
              <option value="Salud general">Salud general</option>
            </select>
            <select
              value={form.level || ""}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option value="">Nivel</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>
          <textarea
            value={form.injuries || ""}
            onChange={(e) => setForm({ ...form, injuries: e.target.value })}
            placeholder="Lesiones o restricciones físicas"
          />
          <button disabled={saving}>Guardar perfil</button>
        </form>
      )}

      {changingPassword && (
        <form onSubmit={savePassword}>
          <input
            type="password"
            value={password.currentPassword}
            onChange={(e) =>
              setPassword({ ...password, currentPassword: e.target.value })
            }
            placeholder="Contraseña actual"
            required
          />
          <div className="grid-2">
            <input
              type="password"
              minLength="6"
              value={password.newPassword}
              onChange={(e) =>
                setPassword({ ...password, newPassword: e.target.value })
              }
              placeholder="Nueva contraseña"
              required
            />
            <input
              type="password"
              minLength="6"
              value={password.confirmPassword}
              onChange={(e) =>
                setPassword({ ...password, confirmPassword: e.target.value })
              }
              placeholder="Confirmar contraseña"
              required
            />
          </div>
          <button disabled={saving}>Guardar contraseña</button>
        </form>
      )}
    </article>
  );
};

export default ClientProfile;

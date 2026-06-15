import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createActivity,
  createInvitation,
  createSession,
  getActivities,
  getAttendances,
  getMyGym,
  getInvitations,
  getMemberships,
  getSessions,
  reviewAttendance,
  updateMembershipStatus,
  updateMyGym,
} from "../api/tenantApi";
import DashboardHeader from "../components/DashboardHeader";
import StatusMessage from "../components/StatusMessage";
import { formatDateTime } from "../utils/date";

const emptyActivity = { name: "", description: "", status: "active" };
const emptySession = {
  activityId: "",
  startsAt: "",
  endsAt: "",
  capacity: 20,
  instructor: "",
  location: "",
};

const errorText = (error) =>
  error.response?.data?.message || error.message || "Ocurrió un error";

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const [gym, setGym] = useState(null);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [invitationEmail, setInvitationEmail] = useState("");
  const [activityForm, setActivityForm] = useState(emptyActivity);
  const [sessionForm, setSessionForm] = useState(emptySession);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pendingAttendances = useMemo(
    () => attendances.filter((item) => item.status === "pending"),
    [attendances]
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [
        gymData,
        activityData,
        sessionData,
        attendanceData,
        invitationData,
        membershipData,
      ] =
        await Promise.all([
          getMyGym(),
          getActivities(),
          getSessions(),
          getAttendances(),
          getInvitations(),
          getMemberships(),
        ]);
      setGym(gymData.gym);
      setActivities(activityData.activities);
      setSessions(sessionData.sessions);
      setAttendances(attendanceData.attendances);
      setInvitations(invitationData.invitations);
      setMemberships(membershipData.memberships);
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadDashboard, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const saveGym = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await updateMyGym(gym);
      setGym(response.gym);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  const addActivity = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await createActivity(activityForm);
      setActivities((current) => [...current, response.activity]);
      setActivityForm(emptyActivity);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  const addSession = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await createSession({
        ...sessionForm,
        startsAt: new Date(sessionForm.startsAt).toISOString(),
        endsAt: new Date(sessionForm.endsAt).toISOString(),
      });
      setSessions((current) => [...current, response.session]);
      setSessionForm(emptySession);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  const decideAttendance = async (id, status) => {
    try {
      const response = await reviewAttendance(id, status);
      setAttendances((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item))
      );
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    }
  };

  const addInvitation = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await createInvitation({
        email: invitationEmail,
        expiresInDays: 7,
      });
      setInvitations((current) => [...current, response.invitation]);
      setInvitationEmail("");
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setSaving(false);
    }
  };

  const changeMembership = async (id, status) => {
    try {
      const response = await updateMembershipStatus(id, status);
      setMemberships((current) =>
        current.map((membership) =>
          membership.id === id ? { ...membership, status } : membership
        )
      );
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    }
  };

  return (
    <main className="dashboard-page">
      <DashboardHeader
        title="Panel del gimnasio"
        subtitle={`${user?.name} ${user?.lastName} · ${gym?.name || "Cargando gimnasio"}`}
        onLogout={logout}
      />
      <StatusMessage message={message} />

      {loading ? (
        <p>Cargando panel...</p>
      ) : (
        <section className="dashboard-stack">
          <article className="dashboard-card">
            <h2>Datos del gimnasio</h2>
            <form onSubmit={saveGym}>
              <div className="grid-2">
                <input
                  aria-label="Nombre del gimnasio"
                  value={gym?.name || ""}
                  onChange={(e) => setGym({ ...gym, name: e.target.value })}
                  placeholder="Nombre"
                  required
                />
                <input
                  aria-label="Ciudad"
                  value={gym?.city || ""}
                  onChange={(e) => setGym({ ...gym, city: e.target.value })}
                  placeholder="Ciudad"
                />
              </div>
              <input
                aria-label="Dirección"
                value={gym?.address || ""}
                onChange={(e) => setGym({ ...gym, address: e.target.value })}
                placeholder="Dirección"
              />
              <input
                aria-label="Teléfono"
                value={gym?.phone || ""}
                onChange={(e) => setGym({ ...gym, phone: e.target.value })}
                placeholder="Teléfono"
              />
              <button disabled={saving}>Guardar gimnasio</button>
            </form>
          </article>

          <article className="dashboard-card">
            <h2>Invitar clientes</h2>
            <p>
              El código vence en 7 días y solo puede utilizarse una vez.
              Puedes vincularlo a un correo específico o dejarlo abierto.
            </p>
            <form onSubmit={addInvitation}>
              <div className="code-row">
                <input
                  type="email"
                  value={invitationEmail}
                  onChange={(e) => setInvitationEmail(e.target.value)}
                  placeholder="Correo del cliente (opcional)"
                />
                <button disabled={saving}>Generar código</button>
              </div>
            </form>
            <div className="item-list">
              {invitations.length === 0 && <p>No hay invitaciones activas.</p>}
              {invitations.map((invitation) => (
                <div className="list-item" key={invitation.id}>
                  <div>
                    <strong className="invitation-code">{invitation.code}</strong>
                    <p>{invitation.email || "Disponible para cualquier correo"}</p>
                  </div>
                  <span>Activa</span>
                </div>
              ))}
            </div>
          </article>

          <article className="dashboard-card">
            <h2>Miembros</h2>
            <div className="item-list">
              {memberships.length === 0 && <p>No hay miembros registrados.</p>}
              {memberships.map((membership) => (
                <div className="list-item" key={membership.id}>
                  <div>
                    <strong>
                      {membership.user
                        ? `${membership.user.name} ${membership.user.lastName}`
                        : membership.userId}
                    </strong>
                    <p>{membership.user?.email}</p>
                  </div>
                  <select
                    className="compact-select"
                    value={membership.status}
                    onChange={(e) =>
                      changeMembership(membership.id, e.target.value)
                    }
                  >
                    <option value="active">Activa</option>
                    <option value="paused">Pausada</option>
                    <option value="expired">Expirada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              ))}
            </div>
          </article>

          <div className="dashboard-grid">
            <article className="dashboard-card">
              <h2>Nueva actividad</h2>
              <form onSubmit={addActivity}>
                <input
                  value={activityForm.name}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, name: e.target.value })
                  }
                  placeholder="Ej. Boxeo"
                  required
                />
                <textarea
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descripción"
                />
                <button disabled={saving}>Crear actividad</button>
              </form>
              <div className="item-list">
                {activities.map((activity) => (
                  <div className="list-item" key={activity.id}>
                    <strong>{activity.name}</strong>
                    <span>{activity.status}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-card">
              <h2>Nueva sesión</h2>
              <form onSubmit={addSession}>
                <select
                  value={sessionForm.activityId}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      activityId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Selecciona una actividad</option>
                  {activities
                    .filter((activity) => activity.status === "active")
                    .map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                </select>
                <div className="grid-2">
                  <input
                    type="datetime-local"
                    value={sessionForm.startsAt}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        startsAt: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="datetime-local"
                    value={sessionForm.endsAt}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        endsAt: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={sessionForm.capacity}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        capacity: e.target.value,
                      })
                    }
                    placeholder="Cupos"
                    required
                  />
                  <input
                    value={sessionForm.instructor}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        instructor: e.target.value,
                      })
                    }
                    placeholder="Instructor"
                  />
                </div>
                <input
                  value={sessionForm.location}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="Sala o ubicación"
                />
                <button disabled={saving || activities.length === 0}>
                  Crear sesión
                </button>
              </form>
            </article>
          </div>

          <article className="dashboard-card">
            <h2>Próximas sesiones</h2>
            <div className="item-list">
              {sessions.length === 0 && <p>No hay sesiones programadas.</p>}
              {sessions.map((session) => (
                <div className="list-item" key={session.id}>
                  <div>
                    <strong>{session.activityName}</strong>
                    <p>{formatDateTime(session.startsAt)}</p>
                  </div>
                  <span>
                    {session.reservedCount || 0}/{session.capacity} reservas
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="dashboard-card">
            <h2>Asistencias pendientes</h2>
            <div className="item-list">
              {pendingAttendances.length === 0 && (
                <p>No hay asistencias pendientes.</p>
              )}
              {pendingAttendances.map((attendance) => (
                <div className="list-item" key={attendance.id}>
                  <div>
                    <strong>{attendance.userName}</strong>
                    <p>{attendance.activityName}</p>
                  </div>
                  <div className="inline-actions">
                    <button
                      onClick={() =>
                        decideAttendance(attendance.id, "confirmed")
                      }
                    >
                      Confirmar
                    </button>
                    <button
                      className="button-secondary"
                      onClick={() =>
                        decideAttendance(attendance.id, "rejected")
                      }
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </main>
  );
};

export default OwnerDashboard;

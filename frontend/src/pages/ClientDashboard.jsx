import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  cancelReservation,
  createProgress,
  getAttendances,
  getMyReservations,
  getProgress,
  getSessions,
  requestAttendance,
  reserveSession,
} from "../api/tenantApi";
import DashboardHeader from "../components/DashboardHeader";
import StatusMessage from "../components/StatusMessage";
import ClientProfile from "../components/ClientProfile";
import { formatDateTime } from "../utils/date";

import FitlabAssistant from "../components/FitlabAssistant";

const errorText = (error) =>
  error.response?.data?.message || error.message || "Ocurrió un error";

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [progress, setProgress] = useState([]);
  const [progressForm, setProgressForm] = useState({
    recordedAt: new Date().toISOString().slice(0, 10),
    weight: "",
    bodyFat: "",
    notes: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const activeReservations = useMemo(
    () =>
      new Map(
        reservations
          .filter((item) => item.status === "confirmed")
          .map((item) => [item.sessionId, item])
      ),
    [reservations]
  );

  const attendanceBySession = useMemo(
    () => new Map(attendances.map((item) => [item.sessionId, item])),
    [attendances]
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionData, reservationData, attendanceData, progressData] =
        await Promise.all([
          getSessions(),
          getMyReservations(),
          getAttendances(),
          getProgress(),
        ]);
      setSessions(sessionData.sessions);
      setReservations(reservationData.reservations);
      setAttendances(attendanceData.attendances);
      setProgress(progressData.entries);
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  const addProgress = async (event) => {
    event.preventDefault();
    setBusyId("progress");
    try {
      const response = await createProgress({
        ...progressForm,
        recordedAt: new Date(`${progressForm.recordedAt}T12:00:00`).toISOString(),
        weight: progressForm.weight || undefined,
        bodyFat: progressForm.bodyFat || undefined,
      });
      setProgress((current) => [response.entry, ...current]);
      setProgressForm({
        recordedAt: new Date().toISOString().slice(0, 10),
        weight: "",
        bodyFat: "",
        notes: "",
      });
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadDashboard, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const runAction = async (sessionId, action) => {
    setBusyId(sessionId);
    try {
      const response = await action();
      setMessage({ type: "success", text: response.message });
      await loadDashboard();
    } catch (error) {
      setMessage({ type: "error", text: errorText(error) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="dashboard-page">
      <DashboardHeader
        title={`Hola, ${user?.name}`}
        subtitle={user?.gym?.name || "Tu gimnasio"}
        onLogout={logout}
      />
      <StatusMessage message={message} />

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Mi cuenta</h2>
          <p>
            <strong>Nombre:</strong> {user?.name} {user?.lastName}
          </p>
          <p>
            <strong>Correo:</strong> {user?.email}
          </p>
          <p>
            <strong>Gimnasio:</strong> {user?.gym?.name || "No disponible"}
          </p>
          <p>
            <strong>Objetivo:</strong> {user?.goal || "No registrado"}
          </p>
        </article>

        <article className="dashboard-card">
          <h2>Resumen</h2>
          <p>
            <strong>Reservas activas:</strong> {activeReservations.size}
          </p>
          <p>
            <strong>Asistencias confirmadas:</strong>{" "}
            {attendances.filter((item) => item.status === "confirmed").length}
          </p>
          <p>
            Las asistencias registradas por ti requieren confirmación del
            gimnasio.
          </p>
        </article>
      </section>

      <article className="dashboard-card dashboard-section">
        <h2>Próximas actividades</h2>
        {loading ? (
          <p>Cargando horarios...</p>
        ) : (
          <div className="item-list">
            {sessions.length === 0 && <p>No hay sesiones disponibles.</p>}
            {sessions.map((session) => {
              const reservation = activeReservations.get(session.id);
              const attendance = attendanceBySession.get(session.id);
              const full = (session.reservedCount || 0) >= session.capacity;

              return (
                <div className="list-item session-item" key={session.id}>
                  <div>
                    <strong>{session.activityName}</strong>
                    <p>{formatDateTime(session.startsAt)}</p>
                    <span>
                      {session.location || "Ubicación por confirmar"} ·{" "}
                      {session.reservedCount || 0}/{session.capacity} cupos
                    </span>
                  </div>
                  <div className="inline-actions">
                    {!reservation ? (
                      <button
                        disabled={busyId === session.id || full}
                        onClick={() =>
                          runAction(session.id, () =>
                            reserveSession(session.id)
                          )
                        }
                      >
                        {full ? "Sin cupos" : "Reservar"}
                      </button>
                    ) : (
                      <>
                        {!attendance && (
                          <button
                            disabled={busyId === session.id}
                            onClick={() =>
                              runAction(session.id, () =>
                                requestAttendance(session.id)
                              )
                            }
                          >
                            Registrar asistencia
                          </button>
                        )}
                        {attendance && (
                          <span className={`status-pill ${attendance.status}`}>
                            Asistencia: {attendance.status}
                          </span>
                        )}
                        <button
                          className="button-secondary"
                          disabled={busyId === session.id}
                          onClick={() =>
                            runAction(session.id, () =>
                              cancelReservation(session.id)
                            )
                          }
                        >
                          Cancelar reserva
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>
      <article className="dashboard-card dashboard-section">
        <h2>Mi progreso</h2>
        <form onSubmit={addProgress}>
          <div className="grid-2">
            <input
              type="date"
              value={progressForm.recordedAt}
              onChange={(e) =>
                setProgressForm({
                  ...progressForm,
                  recordedAt: e.target.value,
                })
              }
              required
            />
            <input
              type="number"
              min="20"
              max="400"
              step="0.1"
              value={progressForm.weight}
              onChange={(e) =>
                setProgressForm({ ...progressForm, weight: e.target.value })
              }
              placeholder="Peso en kg"
            />
          </div>
          <input
            type="number"
            min="1"
            max="80"
            step="0.1"
            value={progressForm.bodyFat}
            onChange={(e) =>
              setProgressForm({ ...progressForm, bodyFat: e.target.value })
            }
            placeholder="Porcentaje de grasa (opcional)"
          />
          <textarea
            value={progressForm.notes}
            onChange={(e) =>
              setProgressForm({ ...progressForm, notes: e.target.value })
            }
            placeholder="Observaciones"
          />
          <button disabled={busyId === "progress"}>Registrar progreso</button>
        </form>
        <div className="item-list">
          {progress.slice(0, 5).map((entry) => (
            <div className="list-item" key={entry.id}>
              <strong>{formatDateTime(entry.recordedAt)}</strong>
              <span>
                {entry.weight ? `${entry.weight} kg` : ""}
                {entry.bodyFat ? ` · ${entry.bodyFat}% grasa` : ""}
              </span>
            </div>
          ))}
        </div>
      </article>
      <ClientProfile onMessage={setMessage} />
      <FitlabAssistant />

    </main>
  );
};

export default ClientDashboard;

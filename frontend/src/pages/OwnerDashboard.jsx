import { useAuth } from "../context/AuthContext";

const OwnerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <h1>Panel del Dueño</h1>
          <p>Bienvenido, {user?.name} {user?.lastName}</p>
        </div>

        <button onClick={logout}>Cerrar sesión</button>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Información del administrador</h2>
          <p><strong>Nombre:</strong> {user?.name} {user?.lastName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Rol:</strong> {user?.role}</p>
          <p><strong>Gimnasio:</strong> {user?.gym_id}</p>
        </article>

        <article className="dashboard-card">
          <h2>Gestión del gimnasio</h2>
          <p>Desde esta sección el dueño podrá registrar o editar los datos del gimnasio.</p>
          <button>Editar gimnasio</button>
        </article>

        <article className="dashboard-card">
          <h2>Actividades</h2>
          <p>Crear actividades como Boxeo, Danza, CrossFit o actividades personalizadas.</p>
          <button>Gestionar actividades</button>
        </article>

        <article className="dashboard-card">
          <h2>Asistencias</h2>
          <p>Visualización futura de asistencias y actividades realizadas por clientes.</p>
          <button>Ver asistencias</button>
        </article>
      </section>
    </main>
  );
};

export default OwnerDashboard;
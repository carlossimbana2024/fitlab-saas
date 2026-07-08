const DashboardHeader = ({ title, subtitle, onLogout }) => (
  <section className="dashboard-header">
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    <button type="button" className="button-secondary" onClick={onLogout}>
      Cerrar sesión
    </button>
  </section>
);

export default DashboardHeader;

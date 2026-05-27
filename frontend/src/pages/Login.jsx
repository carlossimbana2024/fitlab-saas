import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
    email: "",
    password: "",
    });

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
    alert("Completa todos los campos");
    return;
    }

    try {
    const user = await login(form.email, form.password);

    if (user.role === "owner") {
        navigate("/owner-dashboard");
    } else {
        navigate("/client-dashboard");
    }
    } catch (error) {
    alert(error.message);
    }
};

    return (
    <section className="auth-page">
        <div className="auth-card">
        <h1>
            <span>fit</span>Lab
        </h1>

        <h2>¡Bienvenido de nuevo!</h2>
        <p>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
            <label>Correo electrónico</label>
            <div className="input-box">
            <Mail size={20} />
            <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            </div>

            <label>Contraseña</label>
            <div className="input-box">
            <Lock size={20} />
            <input
                type="password"
                placeholder="********"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Eye size={20} />
            </div>

            <Link to="/forgot-password" className="link">
            ¿Olvidaste tu contraseña?
            </Link>

            <button type="submit">Iniciar sesión</button>
        </form>

        <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
        </div>
    </section>
    );
};

export default Login;
# FitLab SaaS 

FitLab SaaS es una aplicación web fullstack orientada a la gestión de gimnasios y usuarios fitness.  
El proyecto fue desarrollado utilizando React + Vite para el frontend y Node.js + Express para el backend, integrando Firebase Authentication y Firestore como servicios principales de autenticación y almacenamiento.

---

# Tecnologías utilizadas

## Frontend
- React
- Vite
- React Router DOM
- Context API
- Axios
- Lucide React
- CSS

## Backend
- Node.js
- Express
- Firebase Admin SDK
- Firestore

## Servicios externos
- Firebase Authentication
- Firebase Firestore
- Vercel (Frontend Deploy)
- GitHub

---

# Estructura del proyecto

```bash
fitlab-fullstack/
│
├── frontend/
├── backend/
└── README.md
```

---

# Funcionalidades implementadas

## Autenticación
- Registro de usuarios
- Inicio de sesión
- Verificación de correo electrónico
- Recuperación de contraseña
- Cierre de sesión
- Protección de rutas privadas

## Gestión de usuarios
- Mostrar perfil del usuario
- Actualizar perfil
- Actualizar contraseña
- Persistencia de sesión con localStorage

## Dashboard cliente
- Resumen del usuario
- Perfil físico
- Configuración de cuenta
- Progreso físico
- Base para futuras clases y reservas

## Backend API
- Obtener gimnasios
- Registrar usuarios en Firestore
- Login backend
- Actualización de perfil
- Integración Firebase Admin

---

# Cómo funciona el sistema

El sistema está dividido en dos partes:

## Frontend
Desarrollado en React + Vite.  
Se encarga de:
- mostrar interfaces
- manejar formularios
- consumir la API backend
- gestionar autenticación del usuario

## Backend
Desarrollado en Node.js + Express.  
Se encarga de:
- lógica de negocio
- conexión con Firestore
- validaciones
- rutas API
- control de usuarios

---

# Firebase

Se utilizaron dos servicios principales:

## Firebase Authentication
Gestiona:
- login
- registro
- verificación de correo
- recuperación de contraseña

## Firestore
Almacena:
- usuarios
- gimnasios
- datos físicos
- roles

---

# Comunicación Frontend ↔ Backend

El frontend se conecta al backend usando Axios mediante:

```env
VITE_API_URL=http://localhost:4000/api
```

Ejemplo:

```js
axios.get(`${API_URL}/auth/gyms`)
```

---

# Variables de entorno

## Frontend `.env`

```env
VITE_API_URL=
```

## Backend `.env`

```env
PORT=4000

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

# Seguridad

El proyecto utiliza:
- rutas protegidas
- verificación de email
- validaciones frontend/backend
- Firebase Authentication
- variables de entorno
- `.gitignore` configurado correctamente

Archivos sensibles ignorados:
- `.env`
- `firebase-service-account.json`
- `node_modules`

---

# Instalación local

## 1. Clonar repositorio

```bash
git clone https://github.com/carlossimbana2024/fitlab-saas.git
```

---

## 2. Instalar frontend

```bash
cd frontend
npm install
```

---

## 3. Instalar backend

```bash
cd backend
npm install
```

---

# Ejecutar proyecto

## Backend

```bash
cd backend
npm run dev
```

Servidor:
```txt
http://localhost:4000
```

---

## Frontend

```bash
cd frontend
npm run dev
```

Aplicación:
```txt
http://localhost:5173
```

---

# Deploy

## Frontend
Desplegado en:
- Vercel

## Backend
Preparado para:
- Render
- Railway

---

# Funcionalidades futuras

- Sistema de clases
- Reservas
- Dashboard administrador avanzado
- Estadísticas
- Rutinas personalizadas
- Control de asistencia
- Membresías
- Multi gimnasio
- Pagos SaaS
- Responsive avanzado
- Notificaciones

---

# Autores

Carlos Simbaña  
Carlos Serrano 
Tecnología Superior en Desarrollo de Software  
Escuela Politécnica Nacional

---

# Licencia

Proyecto académico y de portafolio.

# FitLab SaaS

Sistema multitenant para gimnasios construido con React, Express, Firebase
Authentication y Firestore.

## Funcionalidad actual

- Autenticacion con correo verificado y token Firebase validado en backend.
- Roles `owner` y `client` aplicados en frontend y API.
- Registro de clientes mediante invitacion de un solo uso.
- Aislamiento por gimnasio derivado del usuario autenticado.
- Gestion de gimnasio, miembros, actividades y sesiones.
- Reservas con control transaccional de cupos y duplicados.
- Asistencia solicitada por el cliente y confirmada por el administrador.
- Historial de progreso fisico.
- Edicion de perfil y contrasena.

## Estructura

```text
backend/    API Express, Firebase Admin, rutas, controladores y validaciones
frontend/   Aplicacion React/Vite
docs/       Documentacion operativa y seguridad
```

Firestore crea las colecciones al guardar el primer documento:

```text
gyms
users
memberships
invitations
activities
classSessions
reservations
attendances
progressEntries
```

## Configuracion local

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

No guardes claves reales en archivos `.env` versionados. Los `.env` locales
estan ignorados por Git.

## Despliegue

### Frontend en Vercel

Configura el proyecto con:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Variables de produccion:

```env
VITE_API_URL=https://TU-BACKEND.onrender.com/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

El frontend no tiene fallbacks hardcodeados. Si falta una variable `VITE_`, la
app debe fallar para evitar despliegues con configuracion incompleta.

### Backend en Render

Crea un Web Service conectado al mismo repositorio:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Variables:

```env
CORS_ORIGINS=https://TU-FRONTEND.vercel.app
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Render asigna `PORT` automaticamente. Despues de obtener la URL publica del
backend, actualiza `VITE_API_URL` en Vercel y vuelve a desplegar el frontend.

El backend solo admite credenciales Firebase mediante variables de entorno. No
uses `backend/firebase-service-account.json`.

## Seguridad

- La API nunca acepta un UID o `gymId` operativo como fuente de autorizacion.
- El UID se obtiene del ID token Firebase.
- El gimnasio se obtiene de `users/{uid}.gym_id`.
- Las operaciones de dueno verifican rol y pertenencia.
- Las membresias inactivas bloquean operaciones del cliente.
- CORS, rate limiting, validacion Zod y manejador central de errores estan
  habilitados.
- Firestore esta cerrado al acceso directo desde navegadores en
  `firestore.rules`.
- Hay una configuracion base de `pre-commit` con `detect-secrets`.

Consulta [docs/SECURITY.md](docs/SECURITY.md) para rotacion de service accounts,
formato de secretos, restricciones de Firebase y deteccion automatica de
secretos.

## Reglas Firestore

La aplicacion accede a Firestore mediante Firebase Admin en el backend. Las
reglas incluidas bloquean el acceso directo desde navegadores:

```bash
firebase deploy --only firestore:rules
```

## Flujo de usuarios

1. Un dueno existente inicia sesion.
2. Genera una invitacion desde su dashboard.
3. Comparte el codigo con el cliente.
4. El cliente se registra y recibe rol `client`.
5. El sistema crea su perfil y membresia activa.

El onboarding para crear gimnasios y sus primeros duenos se mantiene separado
del registro publico. Hasta implementar facturacion y verificacion comercial,
los primeros duenos deben provisionarse de forma administrativa.

## Scripts

Backend:

```bash
npm run dev
npm start
npm test
```

Frontend:

```bash
npm run dev
npm run lint
npm run build
```

## Proximas etapas

- Onboarding de propietarios y creacion de organizaciones.
- Fotos de progreso mediante Firebase Storage.
- QR firmado para asistencia.
- Pagos y renovacion automatica de membresias.
- Paginacion con cursores para gimnasios con grandes volumenes.
- Pruebas de integracion con Firebase Emulator Suite.

# FitLab SaaS

Sistema multitenant para gimnasios construido con React, Express, Firebase
Authentication y Firestore.

## Funcionalidad actual

- Autenticación con correo verificado y token Firebase validado en backend.
- Roles `owner` y `client` aplicados en frontend y API.
- Registro de clientes mediante invitación de un solo uso.
- Aislamiento por gimnasio derivado del usuario autenticado.
- Gestión de gimnasio, miembros, actividades y sesiones.
- Reservas con control transaccional de cupos y duplicados.
- Asistencia solicitada por el cliente y confirmada por el administrador.
- Historial de progreso físico.
- Edición de perfil y contraseña.

## Colecciones Firestore

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

El esquema completo está en [docs/FIRESTORE_SCHEMA.md](docs/FIRESTORE_SCHEMA.md).

## Configuración

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Despliegue

### Frontend en Vercel

Configura el proyecto con:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Variables de producción:

```env
VITE_API_URL=https://TU-BACKEND.onrender.com/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

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
FIREBASE_PRIVATE_KEY=
```

Render asigna `PORT` automáticamente. Después de obtener la URL pública del
backend, actualiza `VITE_API_URL` en Vercel y vuelve a desplegar el frontend.

El backend admite credenciales Firebase mediante variables de entorno. Para
desarrollo también conserva compatibilidad con
`backend/firebase-service-account.json`.

## Reglas Firestore

La aplicación accede a Firestore mediante Firebase Admin en el backend. Las
reglas incluidas bloquean el acceso directo desde navegadores:

```bash
firebase deploy --only firestore:rules
```

Debes asociar `firestore.rules` al proyecto en `firebase.json` si todavía no
utilizas Firebase CLI.

## Flujo de usuarios

1. Un dueño existente inicia sesión.
2. Genera una invitación desde su dashboard.
3. Comparte el código con el cliente.
4. El cliente se registra y recibe rol `client`.
5. El sistema crea su perfil y membresía activa.

El onboarding para crear gimnasios y sus primeros dueños se mantiene separado
del registro público. Hasta implementar facturación y verificación comercial,
los primeros dueños deben provisionarse de forma administrativa.

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

## Seguridad

- La API nunca acepta un UID o `gymId` operativo como fuente de autorización.
- El UID se obtiene del ID token Firebase.
- El gimnasio se obtiene de `users/{uid}.gym_id`.
- Las operaciones de dueño verifican rol y pertenencia.
- Las membresías inactivas bloquean operaciones del cliente.
- CORS, rate limiting, validación Zod y manejador central de errores están
  habilitados.

## Próximas etapas

- Onboarding de propietarios y creación de organizaciones.
- Fotos de progreso mediante Firebase Storage.
- QR firmado para asistencia.
- Pagos y renovación automática de membresías.
- Paginación con cursores para gimnasios con grandes volúmenes.
- Pruebas de integración con Firebase Emulator Suite.

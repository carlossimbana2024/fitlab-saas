# Seguridad y rotacion de secretos

## Firebase Admin

El backend no debe usar archivos JSON de service account. Configura estos
secretos en Render, GitHub Actions o un secret manager:

```env
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`FIREBASE_PRIVATE_KEY` debe mantener los saltos de linea como `\n` escapados.
No subas `backend/firebase-service-account.json` al repositorio.

## Rotacion si una service account fue expuesta

1. Crea una nueva service account en Google Cloud Console con los permisos
   minimos necesarios.
2. Genera una nueva key y guarda sus valores como secretos del proveedor de
   despliegue.
3. Actualiza Render con `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y
   `FIREBASE_PRIVATE_KEY`.
4. Revoca la key antigua en Google Cloud Console.
5. Despliega backend y prueba autenticacion y operaciones de Firestore.
6. Revisa logs de Render, Firebase Authentication y Firestore.

Si el JSON fue commiteado, purga el historial con `git filter-repo` o BFG desde
un clon mirror, avisa al equipo y haz `push --force-with-lease`. Despues de
purgar, todos deben reclonar o resetear sus ramas.

## Frontend Firebase

Las variables `VITE_FIREBASE_*` son publicas en el bundle, pero deben estar
restringidas:

- En Google Cloud Console, restringe la API key por HTTP referrers a tus dominios
  de Vercel y localhost si lo necesitas para desarrollo.
- En Firebase Authentication, configura solo dominios autorizados reales.
- Mantener `firestore.rules` y reglas de Storage cerradas para acceso directo
  desde el navegador salvo que se implemente una ruta segura.

## Deteccion automatica

Instala y activa pre-commit:

```bash
pip install pre-commit detect-secrets
pre-commit install
detect-secrets scan --baseline .secrets.baseline
pre-commit run --all-files
```

Tambien habilita Secret Scanning y Push Protection en GitHub si el repositorio
lo permite.

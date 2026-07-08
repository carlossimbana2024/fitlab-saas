# Esquema Firestore

Todas las entidades operativas incluyen `gymId`. El backend obtiene ese valor
desde `users/{uid}.gym_id`; nunca desde parámetros enviados por el cliente.

## Colecciones

- `gyms/{gymId}`: `name`, `status`, `city`, `address`, `phone`.
- `users/{userId}`: perfil, `role` y `gym_id`.
- `memberships/{gymId_userId}`: `gymId`, `userId`, `status`, vigencia y plan.
- `invitations/{invitationId}`: código de un solo uso, `gymId`, correo opcional y expiración.
- `activities/{activityId}`: actividad reusable de un gimnasio.
- `classSessions/{sessionId}`: horario concreto, actividad, capacidad y reservas.
- `reservations/{sessionId_userId}`: reserva única por usuario y sesión.
- `attendances/{sessionId_userId}`: asistencia única, inicialmente `pending`.
- `progressEntries/{entryId}`: registro histórico privado del cliente.

## Estados

- Gimnasio: `active`, `inactive`.
- Membresía: `active`, `paused`, `expired`, `cancelled`.
- Actividad: `active`, `inactive`.
- Sesión: `scheduled`, `cancelled`, `completed`.
- Reserva: `confirmed`, `cancelled`.
- Asistencia: `pending`, `confirmed`, `rejected`.
- Invitación: `active`, `used`, `revoked`.

Las colecciones se crean automáticamente al guardar su primer documento.

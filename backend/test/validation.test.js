const test = require("node:test");
const assert = require("node:assert/strict");
const {
  registerSchema,
  sessionSchema,
  progressSchema,
} = require("../src/validation/schemas");

test("el registro exige invitación y no acepta un rol enviado por el cliente", () => {
  const result = registerSchema.safeParse({
    body: {
      invitationCode: "ABCDEF12",
      name: "Ana",
      lastName: "Pérez",
      email: "ana@example.com",
      password: "secret123",
      role: "owner",
    },
  });

  assert.equal(result.success, true);
  assert.equal("role" in result.data.body, false);
});

test("una sesión requiere fechas ISO y capacidad positiva", () => {
  const result = sessionSchema.safeParse({
    body: {
      activityId: "activity-1",
      startsAt: "2027-01-01T10:00:00.000Z",
      endsAt: "2027-01-01T11:00:00.000Z",
      capacity: 20,
    },
  });

  assert.equal(result.success, true);
});

test("el progreso no puede guardarse vacío", () => {
  const result = progressSchema.safeParse({
    body: {
      recordedAt: "2027-01-01T10:00:00.000Z",
      notes: "",
    },
  });

  assert.equal(result.success, false);
});

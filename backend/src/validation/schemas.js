const { z } = require("zod");

const text = (min = 1, max = 120) =>
  z.string().trim().min(min).max(max);

const optionalText = (max = 500) =>
  z.union([z.string().trim().max(max), z.literal(""), z.null()]).optional();

const registerSchema = z.object({
  body: z.object({
    invitationCode: text(6, 20),
    name: text(2, 80),
    lastName: text(2, 80),
    email: z.string().trim().email(),
    password: z.string().min(6).max(128),
    birthDate: optionalText(20),
    gender: z.enum(["male", "female", "other", ""]).optional(),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

const profileSchema = z.object({
  body: z.object({
    name: text(2, 80),
    lastName: text(2, 80),
    birthDate: optionalText(20),
    gender: z.enum(["male", "female", "other", ""]).optional(),
    phone: optionalText(40),
    weight: z.union([z.coerce.number().min(20).max(400), z.literal(""), z.null()]).optional(),
    height: z.union([z.coerce.number().min(80).max(250), z.literal(""), z.null()]).optional(),
    goal: optionalText(120),
    level: optionalText(80),
    weeklyFrequency: optionalText(80),
    injuries: optionalText(1000),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

const idParams = z.object({
  body: z.any().optional(),
  params: z.object({ id: text(1, 150) }),
  query: z.any().optional(),
});

const activityBody = z.object({
  name: text(2, 80),
  description: optionalText(500),
  status: z.enum(["active", "inactive"]).default("active"),
});

const activitySchema = z.object({
  body: activityBody,
  params: z.any().optional(),
  query: z.any().optional(),
});

const updateActivitySchema = z.object({
  body: activityBody,
  params: z.object({ id: text(1, 150) }),
  query: z.any().optional(),
});

const sessionBody = z.object({
  activityId: text(1, 150),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.coerce.number().int().min(1).max(500),
  instructor: optionalText(120),
  location: optionalText(120),
});

const sessionSchema = z.object({
  body: sessionBody,
  params: z.any().optional(),
  query: z.any().optional(),
});

const updateGymSchema = z.object({
  body: z.object({
    name: text(2, 120),
    phone: optionalText(40),
    address: optionalText(240),
    city: optionalText(120),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

const confirmAttendanceSchema = z.object({
  body: z.object({
    status: z.enum(["confirmed", "rejected"]),
  }),
  params: z.object({ id: text(1, 200) }),
  query: z.any().optional(),
});

const invitationSchema = z.object({
  body: z.object({
    email: z.union([z.string().trim().email(), z.literal("")]).optional(),
    expiresInDays: z.coerce.number().int().min(1).max(30).default(7),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

const invitationParamsSchema = z.object({
  body: z.any().optional(),
  params: z.object({ code: text(6, 20) }),
  query: z.any().optional(),
});

const progressSchema = z.object({
  body: z.object({
    recordedAt: z.string().datetime(),
    weight: z.coerce.number().min(20).max(400).optional(),
    bodyFat: z.coerce.number().min(1).max(80).optional(),
    notes: optionalText(1000),
  }).refine((data) => data.weight || data.bodyFat || data.notes, {
    message: "Registra al menos un dato de progreso",
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

const membershipStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "paused", "expired", "cancelled"]),
  }),
  params: z.object({ id: text(1, 200) }),
  query: z.any().optional(),
});

module.exports = {
  registerSchema,
  profileSchema,
  idParams,
  activitySchema,
  updateActivitySchema,
  sessionSchema,
  updateGymSchema,
  confirmAttendanceSchema,
  invitationSchema,
  invitationParamsSchema,
  progressSchema,
  membershipStatusSchema,
};

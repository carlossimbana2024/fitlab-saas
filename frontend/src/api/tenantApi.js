import axios from "axios";
import { firebaseAuth } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const currentUser = firebaseAuth.currentUser;

  if (currentUser) {
    config.headers.Authorization = `Bearer ${await currentUser.getIdToken()}`;
  }

  return config;
});

const data = (response) => response.data;

export const getMyGym = () => api.get("/gyms/me").then(data);
export const updateMyGym = (payload) =>
  api.put("/gyms/me", payload).then(data);

export const getActivities = () => api.get("/activities").then(data);
export const createActivity = (payload) =>
  api.post("/activities", payload).then(data);
export const updateActivity = (id, payload) =>
  api.put(`/activities/${id}`, payload).then(data);

export const getSessions = () => api.get("/sessions").then(data);
export const createSession = (payload) =>
  api.post("/sessions", payload).then(data);

export const getMyReservations = () =>
  api.get("/reservations/me").then(data);
export const reserveSession = (sessionId) =>
  api.post(`/reservations/sessions/${sessionId}`).then(data);
export const cancelReservation = (sessionId) =>
  api.delete(`/reservations/sessions/${sessionId}`).then(data);

export const getAttendances = () => api.get("/attendances").then(data);
export const requestAttendance = (sessionId) =>
  api.post(`/attendances/sessions/${sessionId}`).then(data);
export const reviewAttendance = (attendanceId, status) =>
  api.patch(`/attendances/${attendanceId}`, { status }).then(data);

export const getInvitations = () => api.get("/invitations").then(data);
export const createInvitation = (payload) =>
  api.post("/invitations", payload).then(data);

export const getProgress = () => api.get("/progress").then(data);
export const createProgress = (payload) =>
  api.post("/progress", payload).then(data);

export const getMemberships = () => api.get("/memberships").then(data);
export const updateMembershipStatus = (id, status) =>
  api.patch(`/memberships/${id}`, { status }).then(data);

export const askFitlabAI = (payload) =>
  api.post("/ai/chat", payload).then(data);
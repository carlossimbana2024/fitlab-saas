import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const getGyms = async () => {
  const response = await axios.get(`${API_URL}/auth/gyms`);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};

export const loginBackend = async (uid) => {
  const response = await axios.post(`${API_URL}/auth/login`, { uid });
  return response.data;
};

export const updateUserProfile = async (uid, data) => {
  const response = await axios.put(`${API_URL}/auth/profile/${uid}`, data);
  return response.data;
};
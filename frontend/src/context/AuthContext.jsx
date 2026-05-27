import { createContext, useContext, useState} from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  reload,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { firebaseAuth } from "../firebase";
import { loginBackend, updateUserProfile } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("fitlab_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    const credentials = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    await reload(credentials.user);

    if (!credentials.user.emailVerified) {
      await signOut(firebaseAuth);
      setUser(null);
      localStorage.removeItem("fitlab_user");

      throw new Error("Debes verificar tu correo antes de iniciar sesión.");
    }

    const backendResponse = await loginBackend(credentials.user.uid);

    setUser(backendResponse.user);
    localStorage.setItem("fitlab_user", JSON.stringify(backendResponse.user));

    return backendResponse.user;
  };

  const updateProfile = async (data) => {
    const response = await updateUserProfile(user.uid, data);

    setUser(response.user);
    localStorage.setItem("fitlab_user", JSON.stringify(response.user));

    return response.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const currentUser = firebaseAuth.currentUser;

    if (!currentUser || !currentUser.email) {
      throw new Error("No hay un usuario autenticado.");
    }

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );

    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);

    return true;
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
    localStorage.removeItem("fitlab_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
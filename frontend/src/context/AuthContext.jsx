import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  reload,
  onAuthStateChanged,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { firebaseAuth } from "../firebase";
import { getCurrentUser, updateUserProfile } from "../api/authApi";

const AuthContext = createContext();

const normalizeUser = (user) =>
  user
    ? {
        ...user,
        role: typeof user.role === "string" ? user.role.trim() : user.role,
        gym_id:
          typeof user.gym_id === "string" ? user.gym_id.trim() : user.gym_id,
      }
    : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (firebaseUser) => {
        if (!firebaseUser || !firebaseUser.emailVerified) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const response = await getCurrentUser();
          setUser(normalizeUser(response.user));
        } catch {
          setUser(null);
          await signOut(firebaseAuth);
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const credentials = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    await reload(credentials.user);

    if (!credentials.user.emailVerified) {
      try {
        await sendEmailVerification(credentials.user);
      } catch {
        // Firebase puede limitar reenvíos frecuentes. El inicio de sesión
        // continúa bloqueado aunque no se pueda enviar otro correo.
      }

      await signOut(firebaseAuth);
      setUser(null);

      throw new Error(
        "Debes verificar tu correo antes de iniciar sesión. Te enviamos un nuevo enlace de verificación."
      );
    }

    await credentials.user.getIdToken(true);
    const backendResponse = await getCurrentUser();
    const user = normalizeUser(backendResponse.user);
    setUser(user);

    return user;
  };

  const updateProfile = async (data) => {
    const response = await updateUserProfile(data);
    setUser(normalizeUser(response.user));

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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile as fbUpdateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, db } from "../firebaseConfig";

const AuthContext = createContext(null);

async function buildUserFromFirebase(fbUser) {
  if (!fbUser) return null;
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);
  const profile = snap.exists() ? snap.data() : {};
  return {
    id: fbUser.uid,
    email: fbUser.email,
    username: profile.username || fbUser.displayName || "",
    avatarUri: profile.avatarUri || null,
    createdAt: profile.createdAt || fbUser.metadata?.creationTime || null,
  };
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const user = await buildUserFromFirebase(fbUser);
          const localAvatar = await AsyncStorage.getItem("localAvatarUri");
          setCurrentUser({
            ...user,
            avatarUri: localAvatar || user.avatarUri || null,
          });
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        setCurrentUser(null);
      } finally {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  const users = useMemo(() => (currentUser ? [currentUser] : []), [currentUser]);

  const signup = async ({ username, email, password }) => {
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedUsername = (username || "").trim();
    if (!trimmedEmail || !trimmedUsername || !password) {
      throw new Error("INVALID_DATA");
    }
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      if (trimmedUsername) {
        await fbUpdateProfile(cred.user, { displayName: trimmedUsername });
      }
      const createdAt = Date.now();
      const ref = doc(db, "users", cred.user.uid);
      await setDoc(ref, {
        email: trimmedEmail,
        username: trimmedUsername,
        avatarUri: null,
        createdAt,
      });
      const prefsRef = doc(db, "users", cred.user.uid, "state", "preferences");
      await setDoc(
        prefsRef,
        {
          themeMode: "light",
        },
        { merge: true }
      );
      const user = await buildUserFromFirebase(cred.user);
      setCurrentUser(user);
      return user;
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        throw new Error("EMAIL_IN_USE");
      }
      throw e;
    }
  };

  const login = async ({ email, password }) => {
    const mail = (email || "").trim().toLowerCase();
    const pwd = password || "";
    try {
      const cred = await signInWithEmailAndPassword(auth, mail, pwd);
      const user = await buildUserFromFirebase(cred.user);
      const localAvatar = await AsyncStorage.getItem("localAvatarUri");
      setCurrentUser({
        ...user,
        avatarUri: localAvatar || user.avatarUri || null,
      });
      return user;
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        throw new Error("USER_NOT_FOUND");
      }
      if (e.code === "auth/wrong-password") {
        throw new Error("WRONG_PASSWORD");
      }
      throw e;
    }
  };

  const clearLocalAvatar = async () => {
    await AsyncStorage.removeItem("localAvatarUri");
    try {
      const path = FileSystem.documentDirectory + "profile_avatar.jpg";
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) await FileSystem.deleteAsync(path);
    } catch (e) {}
  };

  const logout = async () => {
    if (!auth.currentUser) {
      await clearLocalAvatar();
      setCurrentUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (e) {}
    await clearLocalAvatar();
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    try {
      await deleteUser(auth.currentUser);
      try {
        await signOut(auth);
      } catch (e) {}
      await clearLocalAvatar();
      setCurrentUser(null);
    } catch (e) {
      if (e.code === "auth/requires-recent-login") {
        throw new Error("REQUIRES_RECENT_LOGIN");
      }
      throw e;
    }
  };

  const updateProfile = async ({ username, avatarUri }) => {
    if (!auth.currentUser || !currentUser) return;

    const updates = {};

    if (typeof username === "string" && username.trim()) {
      updates.username = username.trim();
    }

    if (avatarUri !== undefined && avatarUri !== null) {
      try {
        const filename = "profile_avatar.jpg";
        const localPath = FileSystem.documentDirectory + filename;

        await FileSystem.copyAsync({
          from: avatarUri,
          to: localPath,
        });

        await AsyncStorage.setItem("localAvatarUri", localPath);

        updates.avatarUri = "local";
      } catch (e) {}
    }

    const ref = doc(db, "users", auth.currentUser.uid);

    if (Object.keys(updates).length > 0) {
      await setDoc(ref, updates, { merge: true });
    }

    if (updates.username) {
      await fbUpdateProfile(auth.currentUser, {
        displayName: updates.username,
      });
    }

    const localAvatar = await AsyncStorage.getItem("localAvatarUri");

    setCurrentUser((prev) =>
      prev
        ? {
            ...prev,
            username:
              updates.username !== undefined ? updates.username : prev.username,
            avatarUri:
              avatarUri !== undefined ? localAvatar : prev.avatarUri,
          }
        : prev
    );
  };

  const resetPassword = async (email) => {
    const mail = (email || "").trim().toLowerCase();
    if (!mail) throw new Error("INVALID_EMAIL");
    try {
      await sendPasswordResetEmail(auth, mail);
    } catch (e) {
      if (e.code === "auth/invalid-email" || e.code === "auth/missing-email") {
        throw new Error("INVALID_EMAIL");
      }
      if (e.code === "auth/user-not-found") {
        return;
      }
      throw e;
    }
  };

  const value = {
    users,
    currentUser,
    initializing,
    signup,
    login,
    logout,
    deleteAccount,
    updateProfile,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
};

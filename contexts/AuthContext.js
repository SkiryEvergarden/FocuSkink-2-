import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        const profile = snap.exists() ? snap.data() : {};

        setCurrentUser({
          id: fbUser.uid,
          email: fbUser.email,
          username: profile.username || fbUser.displayName || "",
          avatarUri: profile.avatarUri || null,
          createdAt: profile.createdAt || fbUser.metadata?.creationTime || null,
        });
      } else {
        setCurrentUser(null);
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const users = useMemo(
    () => (currentUser ? [currentUser] : []),
    [currentUser]
  );

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

      const createdAt = new Date().toISOString();
      
      const ref = doc(db, "users", cred.user.uid);

      await setDoc(ref, {
        email: trimmedEmail,
        username: trimmedUsername,
        avatarUri: null,
        createdAt,
      });

      const newUser = {
        id: cred.user.uid,
        email: trimmedEmail,
        username: trimmedUsername,
        avatarUri: null,
        createdAt,
      };

      setCurrentUser(newUser);
      return newUser;
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
      const fbUser = cred.user;

      
      const ref = doc(db, "users", fbUser.uid);
      const snap = await getDoc(ref);
      const profile = snap.exists() ? snap.data() : {};

      const user = {
        id: fbUser.uid,
        email: fbUser.email,
        username: profile.username || fbUser.displayName || "",
        avatarUri: profile.avatarUri || null,
        createdAt: profile.createdAt || fbUser.metadata?.creationTime || null,
      };

      setCurrentUser(user);
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

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    await deleteUser(auth.currentUser);
    setCurrentUser(null);
  };

  const updateProfile = async ({ username, avatarUri }) => {
    if (!auth.currentUser || !currentUser) return;

    const updates = {};
    if (typeof username === "string" && username.trim()) {
      updates.username = username.trim();
    }
    if (avatarUri !== undefined) {
      updates.avatarUri = avatarUri;
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

    setCurrentUser((prev) =>
      prev
        ? {
            ...prev,
            username:
              updates.username !== undefined ? updates.username : prev.username,
            avatarUri:
              updates.avatarUri !== undefined
                ? updates.avatarUri
                : prev.avatarUri,
          }
        : prev
    );
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

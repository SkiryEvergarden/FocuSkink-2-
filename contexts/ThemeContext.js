import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { Appearance } from "react-native";
import { db } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

const LIGHT = "light";
const DARK = "dark";

const lightColors = {
  background: "#f6f6f6",
  backgroundAlt: "#ffffff",
  card: "#ffffff",
  cardElevated: "#ffffff",
  input: "#ededed",
  chipBg: "#E5E7EB",
  badgeBg: "#E5E7EB",
  border: "#e6e6e6",
  softBorder: "#E4E4E4",
  divider: "#E5E7EB",
  navBorder: "#e6e6e6",
  textPrimary: "#0F172A",
  textTitle: "#0F172A",
  textBody: "#4B5563",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  icon: "#0F172A",
  iconActive: "#ff005c",
  accent: "#ff005c",
  accentSoft: "#ffe4ef",
  accentText: "#ffffff",
  danger: "#EF4444",
  success: "#22C55E"
};

const darkColors = {
  background: "#050505",
  backgroundAlt: "#0B0B0B",
  card: "#111111",
  cardElevated: "#111111",
  input: "#171717",
  chipBg: "#262626",
  badgeBg: "#262626",
  border: "#262626",
  softBorder: "#1F1F1F",
  divider: "#262626",
  navBorder: "#262626",
  textPrimary: "#F9FAFB",
  textTitle: "#F9FAFB",
  textBody: "#E5E7EB",
  textSecondary: "#D1D5DB",
  textMuted: "#9CA3AF",
  icon: "#E5E7EB",
  iconActive: "#ff005c",
  accent: "#ff005c",
  accentSoft: "#ff005c33",
  accentText: "#ffffff",
  danger: "#F87171",
  success: "#22C55E"
};

function resolveThemeMode(mode) {
  if (mode === LIGHT || mode === DARK) return mode;
  const sys = Appearance.getColorScheme();
  return sys === "dark" ? DARK : LIGHT;
}

export function ThemeProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  const [mode, setMode] = useState(LIGHT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadLocal() {
      try {
        const saved = await AsyncStorage.getItem("localThemeMode");
        if (!active) return;
        if (saved === LIGHT || saved === DARK) {
          setMode(saved);
        } else {
          const system = resolveThemeMode();
          setMode(system);
          await AsyncStorage.setItem("localThemeMode", system);
        }
      } catch (e) {}
      if (active) setReady(true);
    }
    loadLocal();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!userId || !ready) return;

    const prefsRef = doc(db, "users", userId, "state", "preferences");
    const unsub = onSnapshot(prefsRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const storedMode = data.themeMode || LIGHT;
        setMode(storedMode);
        await AsyncStorage.setItem("localThemeMode", storedMode);
      } else {
        await setDoc(prefsRef, { themeMode: mode }, { merge: true });
        await AsyncStorage.setItem("localThemeMode", mode);
      }
    });

    return () => unsub();
  }, [userId, ready]);

  const saveMode = useCallback(
    async (newMode) => {
      setMode(newMode);
      await AsyncStorage.setItem("localThemeMode", newMode);
      if (!userId) return;
      const prefsRef = doc(db, "users", userId, "state", "preferences");
      await setDoc(prefsRef, { themeMode: newMode }, { merge: true });
    },
    [userId]
  );

  const toggleTheme = useCallback(() => {
    const next = mode === DARK ? LIGHT : DARK;
    saveMode(next);
  }, [mode, saveMode]);

  const effectiveMode = resolveThemeMode(mode);

  const colors = useMemo(
    () => (effectiveMode === DARK ? darkColors : lightColors),
    [effectiveMode]
  );

  const value = useMemo(
    () => ({
      mode: effectiveMode,
      colors,
      setThemeMode: saveMode,
      toggleTheme,
      isDark: effectiveMode === DARK
    }),
    [effectiveMode, colors, saveMode, toggleTheme]
  );

  if (!ready) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}

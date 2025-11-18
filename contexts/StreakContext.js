import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAchievements } from "./AchievementsContext";
import { useAuth } from "./AuthContext";

function startOfDay(dateLike) {
  const d = new Date(dateLike);
  d.setHours(0, 0, 0, 0);
  return d;
}

function yyyymmdd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getWeekStartId(d) {
  const base = new Date(d);
  const dayIdx = base.getDay();
  const sunday = new Date(base);
  sunday.setDate(base.getDate() - dayIdx);
  const id = yyyymmdd(startOfDay(sunday));
  return id;
}

const StreakContext = createContext();

const makeInitialUserState = () => ({
  weekProgress: Array(7).fill(false),
  weekId: getWeekStartId(new Date()),
  streakCount: 0,
  lastCompletionDate: null,
});

export function StreakProvider({ children }) {
  const { registerStreakProgress } = useAchievements();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  const [userState, setUserState] = useState(makeInitialUserState());

  useEffect(() => {
    if (!userId) {
      setUserState(makeInitialUserState());
      return;
    }

    const streakRef = doc(db, "users", userId, "state", "streak");

    const unsub = onSnapshot(streakRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserState({
          ...makeInitialUserState(),
          ...data,
          weekProgress: Array.isArray(data.weekProgress)
            ? data.weekProgress
            : Array(7).fill(false),
        });
      } else {
        const initial = makeInitialUserState();
        setUserState(initial);
        setDoc(streakRef, initial).catch((e) =>
          console.log("Erro ao criar streak inicial:", e)
        );
      }
    });

    return () => unsub();
  }, [userId]);

  const markDailyRead = useCallback(() => {
    const now = startOfDay(new Date());
    const todayStr = yyyymmdd(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yyyymmdd(yesterday);

    const currentWeekId = getWeekStartId(now);

    setUserState((prevState) => {
      let { weekProgress, weekId, streakCount, lastCompletionDate } =
        prevState || makeInitialUserState();

      if (weekId !== currentWeekId) {
        weekId = currentWeekId;
        weekProgress = Array(7).fill(false);
      }

      const weekday = now.getDay();
      const newWeekProgress = [...weekProgress];
      newWeekProgress[weekday] = true;

      let newCount = streakCount;

      if (lastCompletionDate !== todayStr) {
        if (lastCompletionDate === yesterdayStr) {
          newCount = streakCount + 1;
        } else {
          newCount = 1;
        }
      }

      if (registerStreakProgress && newCount !== streakCount) {
        registerStreakProgress(newCount);
      }

      const newState = {
        weekProgress: newWeekProgress,
        weekId,
        streakCount: newCount,
        lastCompletionDate: todayStr,
      };

      if (userId) {
        const streakRef = doc(db, "users", userId, "state", "streak");
        setDoc(streakRef, newState).catch((e) =>
          console.log("Erro ao salvar streak:", e)
        );
      }

      return newState;
    });
  }, [userId, registerStreakProgress]);

  const value = useMemo(
    () => ({
      weekProgress: userState.weekProgress,
      streakCount: userState.streakCount,
      markDailyRead,
    }),
    [userState.weekProgress, userState.streakCount, markDailyRead]
  );

  return (
    <StreakContext.Provider value={value}>{children}</StreakContext.Provider>
  );
}

export { StreakContext };

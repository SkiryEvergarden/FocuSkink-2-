import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

const AchievementsContext = createContext(null);

const ACHIEVEMENTS = [
  {
    id: "ms1",
    type: "streak",
    threshold: 1,
    title: "Primeiro dia de sequência",
    description: "Você manteve uma sequência de 1 dia lendo artigos.",
    image: require("../assets_medalhas/ms1.jpeg"),
  },
  {
    id: "ms2",
    type: "streak",
    threshold: 10,
    title: "10 dias em sequência",
    description: "Você manteve sua sequência por 10 dias seguidos.",
    image: require("../assets_medalhas/ms2.jpeg"),
  },
  {
    id: "ms3",
    type: "streak",
    threshold: 30,
    title: "30 dias em sequência",
    description: "Você manteve sua sequência por 30 dias seguidos.",
    image: require("../assets_medalhas/ms3.jpeg"),
  },
  {
    id: "ms4",
    type: "streak",
    threshold: 50,
    title: "50 dias em sequência",
    description: "Você manteve sua sequência por 50 dias seguidos.",
    image: require("../assets_medalhas/ms4.jpeg"),
  },
  {
    id: "mt1",
    type: "tasks",
    threshold: 1,
    title: "Primeira tarefa concluída",
    description: "Você concluiu sua primeira tarefa no aplicativo.",
    image: require("../assets_medalhas/mt1.jpeg"),
  },
  {
    id: "mt2",
    type: "tasks",
    threshold: 10,
    title: "10 tarefas concluídas",
    description: "Você concluiu 10 tarefas.",
    image: require("../assets_medalhas/mt2.jpeg"),
  },
  {
    id: "mt3",
    type: "tasks",
    threshold: 30,
    title: "30 tarefas concluídas",
    description: "Você concluiu 30 tarefas. Ótimo ritmo!",
    image: require("../assets_medalhas/mt3.jpeg"),
  },
  {
    id: "mt4",
    type: "tasks",
    threshold: 50,
    title: "50 tarefas concluídas",
    description: "Você concluiu 50 tarefas. Produtividade em alta!",
    image: require("../assets_medalhas/mt4.jpeg"),
  },
];

const initialUserState = {
  tasksCompletedTotal: 0,
  highestStreak: 0,
  unlockedIds: [],
  lastUnlockedAchievement: null,
  modalVisible: false,
};

function computeUnlockedAfter(prevUnlockedIds, type, value) {
  if (!value || value <= 0) {
    return { unlockedIds: prevUnlockedIds, newlyUnlocked: null };
  }

  let updated = [...prevUnlockedIds];
  let newlyUnlocked = null;

  ACHIEVEMENTS.forEach((ach) => {
    if (ach.type !== type) return;
    if (value >= ach.threshold && !updated.includes(ach.id)) {
      updated.push(ach.id);
      newlyUnlocked = ach;
    }
  });

  return { unlockedIds: updated, newlyUnlocked };
}

export function AchievementsProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  const [userState, setUserState] = useState(initialUserState);

  useEffect(() => {
    if (!userId) {
      setUserState(initialUserState);
      return;
    }

    const achRef = doc(db, "users", userId, "state", "achievements");

    const unsub = onSnapshot(achRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserState({
          ...initialUserState,
          ...data,
          unlockedIds: Array.isArray(data.unlockedIds)
            ? data.unlockedIds
            : [],
        });
      } else {
        setUserState(initialUserState);
        setDoc(achRef, initialUserState).catch((e) =>
          console.log("Erro ao criar achievements inicial:", e)
        );
      }
    });

    return () => unsub();
  }, [userId]);

  const {
    tasksCompletedTotal,
    highestStreak,
    unlockedIds,
    lastUnlockedAchievement,
    modalVisible,
  } = userState;

  const unlockedAchievements = useMemo(
    () =>
      unlockedIds
        .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
        .filter(Boolean),
    [unlockedIds]
  );

  const lastAchievementsHome = useMemo(() => {
    if (!unlockedAchievements.length) return [];
    const slice = unlockedAchievements.slice(-3);
    return slice.reverse();
  }, [unlockedAchievements]);

  const saveUserState = useCallback(
    (next) => {
      if (userId) {
        const achRef = doc(db, "users", userId, "state", "achievements");
        setDoc(achRef, next).catch((e) =>
          console.log("Erro ao salvar achievements:", e)
        );
      }
    },
    [userId]
  );

  const registerTaskCompleted = useCallback(() => {
    setUserState((prev) => {
      const prevState = prev || initialUserState;
      const nextTasks = prevState.tasksCompletedTotal + 1;

      const { unlockedIds, newlyUnlocked } = computeUnlockedAfter(
        prevState.unlockedIds,
        "tasks",
        nextTasks
      );

      const nextState = {
        ...prevState,
        tasksCompletedTotal: nextTasks,
        unlockedIds,
        lastUnlockedAchievement:
          newlyUnlocked || prevState.lastUnlockedAchievement,
        modalVisible: newlyUnlocked ? true : prevState.modalVisible,
      };

      saveUserState(nextState);
      return nextState;
    });
  }, [saveUserState]);

  const registerStreakProgress = useCallback(
    (currentStreak) => {
      if (!currentStreak || currentStreak <= 0) return;

      setUserState((prev) => {
        const prevState = prev || initialUserState;
        const nextHighest =
          currentStreak > prevState.highestStreak
            ? currentStreak
            : prevState.highestStreak;

        const { unlockedIds, newlyUnlocked } = computeUnlockedAfter(
          prevState.unlockedIds,
          "streak",
          nextHighest
        );

        const nextState = {
          ...prevState,
          highestStreak: nextHighest,
          unlockedIds,
          lastUnlockedAchievement:
            newlyUnlocked || prevState.lastUnlockedAchievement,
          modalVisible: newlyUnlocked ? true : prevState.modalVisible,
        };

        saveUserState(nextState);
        return nextState;
      });
    },
    [saveUserState]
  );

  const closeModal = useCallback(() => {
    setUserState((prev) => {
      const prevState = prev || initialUserState;
      const nextState = { ...prevState, modalVisible: false };
      saveUserState(nextState);
      return nextState;
    });
  }, [saveUserState]);

  const value = {
    tasksCompletedTotal,
    highestStreak,
    unlockedAchievements,
    lastAchievementsHome,
    lastUnlockedAchievement,
    modalVisible,
    closeModal,
    registerTaskCompleted,
    registerStreakProgress,
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) {
    throw new Error(
      "useAchievements deve ser usado dentro de AchievementsProvider"
    );
  }
  return ctx;
}

export { ACHIEVEMENTS };

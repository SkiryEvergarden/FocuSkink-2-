import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

import { useRelatorio } from "./RelatorioContext";
import { useAchievements } from "./AchievementsContext";
import { useAuth } from "./AuthContext";

function parseBRDate(str) {
  if (!str || typeof str !== "string") return null;
  const [dd, mm, yyyy] = str.split("/");
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function taskMatchesDate(t, date) {
  if (t.concluida) return false;

  const criado = t.criadoEm ? new Date(t.criadoEm) : null;
  const due = t.concluirAte ? parseBRDate(t.concluirAte) : null;

  const baseDate = due || criado || date;
  const weekday = baseDate.getDay();
  const monthday = baseDate.getDate();

  if (t.tipo === "diaria") return true;
  if (t.tipo === "semanal") return date.getDay() === weekday;
  if (t.tipo === "mensal") return date.getDate() === monthday;

  if (due) return isSameDay(due, date);

  return false;
}

const TarefasContext = createContext(null);

export const TarefasProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const activeUserId = currentUser?.id || null;

  const { registrarTarefaConcluida } = useRelatorio();
  const { registerTaskCompleted } = useAchievements();

  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    if (!activeUserId) {
      setTarefas([]);
      return;
    }

    const tarefasRef = collection(db, "tarefas");
    const q = query(tarefasRef, where("userId", "==", activeUserId));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setTarefas(lista);
      },
      (err) => console.log("Erro ao ouvir tarefas:", err)
    );

    return () => unsub();
  }, [activeUserId]);

  const addTarefa = useCallback(
    async ({ titulo, concluirAte, descricao, tipo }) => {
      if (!activeUserId) return;

      const nowISO = new Date().toISOString();

      const nova = {
        userId: activeUserId,
        titulo: titulo.trim(),
        concluirAte: concluirAte?.trim() || "",
        descricao: descricao?.trim() || "",
        concluida: false,
        criadoEm: nowISO,
        tipo: tipo || null,
        concluidoEm: null,
      };

      setTarefas((prev) => [...prev, { id: `local-${nowISO}`, ...nova }]);

      try {
        await addDoc(collection(db, "tarefas"), nova);
      } catch (e) {
        console.log("Erro ao criar tarefa no Firestore:", e);
      }
    },
    [activeUserId]
  );

  const concluirTarefa = useCallback(
    async (id) => {
      const t = tarefas.find((x) => x.id === id);
      if (!t || t.concluida) return;

      const concluidoEm = new Date().toISOString();

      setTarefas((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, concluida: true, concluidoEm }
            : task
        )
      );

      try {
        await updateDoc(doc(db, "tarefas", id), {
          concluida: true,
          concluidoEm,
        });

        registrarTarefaConcluida?.();
        registerTaskCompleted?.();
      } catch (e) {
        console.log("Erro ao concluir tarefa:", e);
      }
    },
    [tarefas, registrarTarefaConcluida, registerTaskCompleted]
  );

  const excluirTarefa = useCallback(async (id) => {
    setTarefas((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(db, "tarefas", id));
    } catch (e) {
      console.log("Erro ao apagar tarefa:", e);
    }
  }, []);

  const getByDate = useCallback(
    (date) => {
      const d = startOfDay(date);
      return tarefas.filter((t) => taskMatchesDate(t, d));
    },
    [tarefas]
  );

  const listasClassificadas = useMemo(() => {
    const hoje = startOfDay(new Date());

    const diarias = [];
    const semanais = [];
    const mensaisTemp = [];
    const atrasadas = [];

    for (const t of tarefas) {
      if (t.concluida) continue;

      const due = t.concluirAte ? parseBRDate(t.concluirAte) : null;

      if (due && startOfDay(due) < hoje) atrasadas.push(t);

      if (t.tipo === "diaria") diarias.push(t);
      else if (t.tipo === "semanal") semanais.push(t);
      else if (t.tipo === "mensal") mensaisTemp.push(t);

      if (!t.tipo && due) mensaisTemp.push(t);
    }

    const seen = new Set();
    const mensais = [];

    for (const t of mensaisTemp) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        mensais.push(t);
      }
    }

    return {
      diarias,
      semanais,
      mensais,
      atrasadas,
    };
  }, [tarefas]);

  return (
    <TarefasContext.Provider
      value={{
        tarefas,
        addTarefa,
        concluirTarefa,
        excluirTarefa,
        getByDate,
        listasClassificadas,
      }}
    >
      {children}
    </TarefasContext.Provider>
  );
};

export const useTarefas = () => useContext(TarefasContext);

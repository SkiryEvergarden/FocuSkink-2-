import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { doc, setDoc, onSnapshot, collection, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

import { useRelatorio } from "./RelatorioContext";
import { useAuth } from "./AuthContext";

const initialSessaoState = {
  isRunning: false,
  paused: false,
  metodo: null,
  remainingSec: 0,
  finishedPendingReview: false,
  nomeSessao: "",
  musicaAtiva: false,
  focoAtivo: false,
  tarefaSelecionada: null,
  pomodoro: null,
  deepwork: null,
  startedAtISO: null,
  duracaoAtivaSec: 0,
};

const SessaoContext = createContext(null);

export function SessaoProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  const [sessao, setSessao] = useState(initialSessaoState);
  const [historicoSessoes, setHistoricoSessoes] = useState([]);

  const { registrarSessaoConcluida } = useRelatorio();

  
  useEffect(() => {
    if (!userId) {
      setSessao(initialSessaoState);
      setHistoricoSessoes([]);
      return;
    }

    const sessaoRef = doc(db, "users", userId, "state", "sessao");
    const historicoRef = collection(db, "users", userId, "historicoSessoes");
    const qHist = query(historicoRef, orderBy("inicioEm", "desc"));

    const unsubSessao = onSnapshot(sessaoRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSessao((prev) => ({
          ...initialSessaoState,
          ...prev,
          ...data,
        }));
      } else {
        setDoc(sessaoRef, initialSessaoState).catch((e) =>
          console.log("Erro ao inicializar sessão no Firestore:", e)
        );
        setSessao(initialSessaoState);
      }
    });

    const unsubHist = onSnapshot(qHist, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHistoricoSessoes(list);
    });

    return () => {
      unsubSessao();
      unsubHist();
    };
  }, [userId]);

  const setSessaoForUser = useCallback(
    (update) => {
      setSessao((prev) => {
        const next =
          typeof update === "function" ? update(prev) : update;

        if (userId) {
          const sessaoRef = doc(db, "users", userId, "state", "sessao");
          setDoc(sessaoRef, next).catch((e) =>
            console.log("Erro ao salvar sessão no Firestore:", e)
          );
        }

        return next;
      });
    },
    [userId]
  );

  const resetSessaoForUser = useCallback(() => {
    setSessaoForUser(initialSessaoState);
  }, [setSessaoForUser]);

  const makeId = useCallback(() => Math.random().toString(36).slice(2), []);

  const appendHistorico = useCallback(
    (prev) => {
      const fim = new Date();
      const inicio = prev.startedAtISO ? new Date(prev.startedAtISO) : fim;

      const base = {
        id: prev.id || makeId(),
        nomeSessao: prev.nomeSessao || "",
        metodo: prev.metodo,
        musicaAtiva: !!prev.musicaAtiva,
        focoAtivo: !!prev.focoAtivo,
        tarefaInclusa: !!prev.tarefaSelecionada,
        tipoSessao:
          prev.metodo === "pomodoro"
            ? "Pomodoro"
            : prev.metodo === "deepwork"
            ? "Deepwork"
            : "Sessão",
        inicioEm: prev.startedAtISO || inicio.toISOString(),
        fimEm: fim.toISOString(),
        tempoAtivoSec: Number(prev.duracaoAtivaSec) || 0,
        estudoMin: prev.pomodoro?.estudoMin ?? null,
        descansoMin: prev.pomodoro?.descansoMin ?? null,
        ciclosTotais: prev.pomodoro?.totalCiclos ?? null,
        horas: prev.deepwork?.horas ?? null,
        minutos: prev.deepwork?.minutos ?? null,
      };

      
      if (userId) {
        const historicoRef = collection(db, "users", userId, "historicoSessoes");
        addDoc(historicoRef, base).catch((e) =>
          console.log("Erro ao salvar histórico de sessão:", e)
        );
      }

     
      registrarSessaoConcluida?.();
    },
    [makeId, registrarSessaoConcluida, userId]
  );

  const endCurrentSession = useCallback(
    (prev) => {
      appendHistorico(prev);

      if (prev.tarefaSelecionada) {
        return {
          ...prev,
          isRunning: false,
          paused: false,
          remainingSec: 0,
          metodo: null,
          finishedPendingReview: true,
        };
      }

      return { ...initialSessaoState };
    },
    [appendHistorico]
  );

  const startDeepworkSession = useCallback(
    ({
      horas,
      minutos,
      nomeSessao,
      tarefaSelecionada,
      musicaAtiva,
      focoAtivo,
      musicQueue,
    }) => {
      const h = Math.max(0, Number(horas) || 0);
      const m = Math.max(0, Number(minutos) || 0);
      const totalSecs = h * 3600 + m * 60;

      const autoinferMusica =
        Array.isArray(musicQueue) && musicQueue.length > 0;

      const next = {
        ...initialSessaoState,
        isRunning: true,
        metodo: "deepwork",
        paused: false,
        remainingSec: totalSecs || 1,
        nomeSessao,
        musicaAtiva:
          typeof musicaAtiva === "boolean" ? musicaAtiva : autoinferMusica,
        focoAtivo: !!focoAtivo,
        tarefaSelecionada,
        deepwork: { horas: h, minutos: m, totalSecs },
        startedAtISO: new Date().toISOString(),
        duracaoAtivaSec: 0,
      };

      setSessaoForUser(next);
    },
    [setSessaoForUser]
  );

  const startPomodoroSession = useCallback(
    ({
      estudoMin,
      descansoMin,
      totalCiclos,
      nomeSessao,
      tarefaSelecionada,
      musicaAtiva,
      focoAtivo,
      musicQueue,
    }) => {
      const est = Math.max(1, Number(estudoMin) || 25);
      const des = Math.max(1, Number(descansoMin) || 5);
      const ciclos = Math.max(1, Number(totalCiclos) || 4);

      const autoinferMusica =
        Array.isArray(musicQueue) && musicQueue.length > 0;

      const next = {
        ...initialSessaoState,
        isRunning: true,
        metodo: "pomodoro",
        paused: false,
        remainingSec: est * 60,
        nomeSessao,
        musicaAtiva:
          typeof musicaAtiva === "boolean" ? musicaAtiva : autoinferMusica,
        focoAtivo: !!focoAtivo,
        tarefaSelecionada,
        pomodoro: {
          estudoMin: est,
          descansoMin: des,
          totalCiclos: ciclos,
          cyclesRemaining: ciclos,
          emDescanso: false,
        },
        startedAtISO: new Date().toISOString(),
        duracaoAtivaSec: 0,
      };

      setSessaoForUser(next);
    },
    [setSessaoForUser]
  );

  const pauseResumeSession = useCallback(() => {
    setSessaoForUser((prev) =>
      prev.isRunning ? { ...prev, paused: !prev.paused } : prev
    );
  }, [setSessaoForUser]);

  const finalizeSessionManual = useCallback(() => {
    setSessaoForUser((prev) => endCurrentSession(prev));
  }, [endCurrentSession, setSessaoForUser]);

  const finishReviewAndReset = useCallback(() => {
    resetSessaoForUser();
  }, [resetSessaoForUser]);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (sessao.isRunning && !sessao.paused) {
      intervalRef.current = setInterval(() => {
        setSessaoForUser((prev) => {
          if (!prev.isRunning || prev.paused) return prev;

          const nextRemain = prev.remainingSec - 1;
          const nextActive = (Number(prev.duracaoAtivaSec) || 0) + 1;

          if (nextRemain > 0) {
            return {
              ...prev,
              remainingSec: nextRemain,
              duracaoAtivaSec: nextActive,
            };
          }

          return endCurrentSession({
            ...prev,
            remainingSec: 0,
            duracaoAtivaSec: nextActive,
          });
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessao.isRunning, sessao.paused, endCurrentSession, setSessaoForUser]);

  const value = useMemo(
    () => ({
      sessao,
      historicoSessoes,
      startPomodoroSession,
      startDeepworkSession,
      pauseResumeSession,
      finalizeSessionManual,
      finishReviewAndReset,
    }),
    [
      sessao,
      historicoSessoes,
      startPomodoroSession,
      startDeepworkSession,
      pauseResumeSession,
      finalizeSessionManual,
      finishReviewAndReset,
    ]
  );

  return (
    <SessaoContext.Provider value={value}>{children}</SessaoContext.Provider>
  );
}

export function useSessao() {
  return useContext(SessaoContext);
}

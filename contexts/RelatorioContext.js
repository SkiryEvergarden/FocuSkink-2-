import { collection, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { db } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

const RelatorioContext = createContext(null);

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfWeekSunday = (d) => {
  const date = startOfDay(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return date;
};

const formatISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const parseISO = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d)
    return null;
  return startOfDay(dt);
};

const emptyWeek = (weekStartDate) => ({
  weekStartISO: formatISO(weekStartDate),
  days: Array.from({ length: 7 }, () => ({
    tarefas: 0,
    artigos: 0,
    sessoes: 0,
  })),
});

const DIA_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const formatIntervaloSemana = (weekStart) => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const dd = (d) => String(d.getDate()).padStart(2, "0");
  return `${dd(weekStart)} de ${MONTH_LABELS[weekStart.getMonth()]} até ${dd(
    end
  )} de ${MONTH_LABELS[end.getMonth()]}`;
};

const getWeekNumber = (date) => {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
};

export function RelatorioProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  const [week, setWeek] = useState(null);
  const [relatoriosSalvos, setRelatoriosSalvos] = useState([]);
  const [comparacao, setComparacao] = useState(null);

  useEffect(() => {
    if (!userId) {
      const wk = emptyWeek(startOfWeekSunday(new Date()));
      setWeek(wk);
      return;
    }

    const ref = doc(db, "users", userId, "state", "relatorioSemana");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (!data.weekStartISO || !Array.isArray(data.days)) {
          const wk = emptyWeek(startOfWeekSunday(new Date()));
          setWeek(wk);
          setDoc(ref, wk);
        } else {
          setWeek(data);
        }
      } else {
        const wk = emptyWeek(startOfWeekSunday(new Date()));
        setWeek(wk);
        setDoc(ref, wk);
      }
    });

    return () => unsub();
  }, [userId]);

  const carregarHistorico = useCallback(async () => {
    if (!userId) return;

    const col = collection(db, "users", userId, "relatorios");
    const snap = await getDocs(col);

    const lista = [];
    snap.forEach((doc) => {
      lista.push(doc.data());
    });

    const ordenado = lista.sort(
      (a, b) => new Date(a.weekStartISO) - new Date(b.weekStartISO)
    );

    setRelatoriosSalvos(ordenado);
  }, [userId]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const ensureWeekForToday = useCallback((prevWeek) => {
    const today = new Date();
    const currentWeekStart = startOfWeekSunday(today);
    const currentWeekISO = formatISO(currentWeekStart);
    if (!prevWeek || prevWeek.weekStartISO !== currentWeekISO) {
      return emptyWeek(currentWeekStart);
    }
    return prevWeek;
  }, []);

  const salvarSemanaCompleta = useCallback(
    async (wk) => {
      if (!userId) return;

      const ref = doc(
        db,
        "users",
        userId,
        "relatorios",
        wk.weekStartISO
      );

      await setDoc(ref, wk);
      carregarHistorico();
    },
    [userId, carregarHistorico]
  );

  const registrarEvento = useCallback(
    (tipo) => {
      setWeek((prev) => {
        const base = ensureWeekForToday(prev);
        const today = new Date();
        const dayIndex = today.getDay();

        const newDays = base.days.map((d, idx) =>
          idx === dayIndex ? { ...d, [tipo]: (d[tipo] || 0) + 1 } : d
        );

        const updated = { ...base, days: newDays };

        if (userId) {
          const ref = doc(db, "users", userId, "state", "relatorioSemana");
          setDoc(ref, updated);

          setTimeout(() => {
            salvarSemanaCompleta(updated);
          }, 100);
        }

        return updated;
      });
    },
    [ensureWeekForToday, userId, salvarSemanaCompleta]
  );

  const registrarTarefaConcluida = useCallback(
    () => registrarEvento("tarefas"),
    [registrarEvento]
  );

  const registrarSessaoConcluida = useCallback(
    () => registrarEvento("sessoes"),
    [registrarEvento]
  );

  const registrarArtigoLido = useCallback(
    () => registrarEvento("artigos"),
    [registrarEvento]
  );

  const resumoSemana = useMemo(() => {
    if (!week) return null;

    const weekStart =
      parseISO(week.weekStartISO) || startOfWeekSunday(new Date());

    const dias = week.days.map((d, idx) => {
      const tarefas = d.tarefas || 0;
      const sessoes = d.sessoes || 0;
      const artigos = d.artigos || 0;
      const total = tarefas + sessoes + artigos;

      return {
        label: DIA_LABELS[idx],
        tarefas,
        sessoes,
        artigos,
        total,
      };
    });

    const totalTarefas = dias.reduce((acc, d) => acc + d.tarefas, 0);
    const totalSessoes = dias.reduce((acc, d) => acc + d.sessoes, 0);
    const totalArtigos = dias.reduce((acc, d) => acc + d.artigos, 0);

    const totalAtividades = totalTarefas + totalSessoes + totalArtigos;

    const diaDestaque = dias.reduce(
      (best, d) => (!best || d.total > best.total ? d : best),
      null
    );

    return {
      dias,
      totalAtividades,
      totalTarefas,
      totalSessoes,
      totalArtigos,
      diaDestaque,
      intervaloLabel: formatIntervaloSemana(weekStart),
      semanaNumero: getWeekNumber(weekStart),
      ano: weekStart.getFullYear(),
      monthIndex: weekStart.getMonth(),
      monthLabel: MONTH_LABELS[weekStart.getMonth()],
      weekStartISO: week.weekStartISO,
    };
  }, [week]);

  const gerarComparacao = useCallback(
    (isoA, isoB) => {
      const a = relatoriosSalvos.find((r) => r.weekStartISO === isoA);
      const b = relatoriosSalvos.find((r) => r.weekStartISO === isoB);
      if (!a || !b) return;

      const soma = (week) => {
        return week.days.reduce(
          (acc, d) => {
            acc.tarefas += d.tarefas || 0;
            acc.sessoes += d.sessoes || 0;
            acc.artigos += d.artigos || 0;
            return acc;
          },
          { tarefas: 0, sessoes: 0, artigos: 0 }
        );
      };

      const sa = soma(a);
      const sb = soma(b);

      setComparacao({
        semanaA: isoA,
        semanaB: isoB,
        diff: {
          tarefas: sb.tarefas - sa.tarefas,
          sessoes: sb.sessoes - sa.sessoes,
          artigos: sb.artigos - sa.artigos,
          total:
            (sb.tarefas + sb.sessoes + sb.artigos) -
            (sa.tarefas + sa.sessoes + sa.artigos),
        },
      });
    },
    [relatoriosSalvos]
  );

  return (
    <RelatorioContext.Provider
      value={{
        week,
        resumoSemana,
        relatoriosSalvos,
        comparar: comparacao,
        gerarComparacao,
        registrarTarefaConcluida,
        registrarSessaoConcluida,
        registrarArtigoLido,
      }}
    >
      {children}
    </RelatorioContext.Provider>
  );
}

export function useRelatorio() {
  const ctx = useContext(RelatorioContext);
  if (!ctx) {
    throw new Error("useRelatorio deve ser usado dentro de RelatorioProvider");
  }
  return ctx;
}

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppState,
  Dimensions,
  FlatList,
  Image,
  InteractionManager,
  Modal,
  StyleSheet as RNStyleSheet,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import Svg, { Circle } from "react-native-svg";
import { useSessao } from "../contexts/SessaoContext";
import { useTarefas } from "../contexts/TarefasContext";
import { useAppTheme } from "../contexts/ThemeContext";
import { PLAYLISTS } from "../data/playlist";

const { width } = Dimensions.get("window");

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ],
  monthNamesShort: [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ],
  dayNames: [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ],
  dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

function formatSeconds(total) {
  if (!Number.isFinite(total) || total <= 0) return "--:--";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0
    ? `${String(h).padStart(2, "0")}:${mm}:${ss}`
    : `${mm}:${ss}`;
}
function colorByProgress(p) {
  const clamp = Math.max(0, Math.min(1, p));
  const start = { r: 255, g: 0, b: 92 };
  const end = { r: 83, g: 13, b: 39 };
  const r = Math.round(start.r + (end.r - start.r) * (1 - clamp));
  const g = Math.round(start.g + (end.g - start.g) * (1 - clamp));
  const b = Math.round(start.b + (end.b - start.b) * (1 - clamp));
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function parseDur(str) {
  if (!str) return 0;
  const parts = str.split(":").map((n) => parseInt(n, 10));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const today = () => startOfDay(new Date());
const parseDDMMYYYY = (s) => {
  const [dd, mm, yyyy] = (s || "").split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (
    d.getFullYear() !== yyyy ||
    d.getMonth() !== mm - 1 ||
    d.getDate() !== dd
  )
    return null;
  return startOfDay(d);
};
const formatISO = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

function Chip({ text, highlight, styles, colors }) {
  return (
    <View
      style={[
        styles.chip,
        highlight && { borderColor: colors.accent, borderWidth: 1 },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          highlight && { color: colors.textPrimary },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}
function Checkbox({ checked, styles, colors }) {
  return (
    <View
      style={[
        styles.checkbox,
        checked && {
          backgroundColor: colors.accent,
          borderColor: colors.accent,
        },
      ]}
    >
      {checked ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
    </View>
  );
}
function Toggle({ value, onPress, styles, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.toggle,
        value ? styles.toggleOn : styles.toggleOff,
        !value && { backgroundColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.toggleDot,
          value ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
        ]}
      />
    </TouchableOpacity>
  );
}

function ChipsMetodo({ metodo, setMetodo, styles, colors }) {
  const opts = ["Pomodoro", "Deepwork"];
  return (
    <View style={styles.chipsMetodoRow}>
      {opts.map((m) => {
        const active = metodo === m;
        return (
          <TouchableOpacity
            key={m}
            style={[styles.metodoChip, active && styles.metodoChipActive]}
            onPress={() => setMetodo(m)}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.metodoChipText,
                active && styles.metodoChipTextActive,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CardTarefaSessao({
  item,
  tarefaSel,
  setTarefaSel,
  usarTarefa,
  setUsarTarefa,
  styles,
  colors,
}) {
  const selected = usarTarefa && tarefaSel?.id === item.id;
  return (
    <View style={styles.cardSessao}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Toggle
          value={selected}
          onPress={() => {
            if (selected) {
              setTarefaSel(null);
              setUsarTarefa(false);
            } else {
              setUsarTarefa(true);
              setTarefaSel(item);
            }
          }}
          styles={styles}
          colors={colors}
        />
      </View>

      {!!item.descricao && (
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.descricao}
        </Text>
      )}
      <Text style={styles.cardDue}>Até {item.concluirAte}</Text>
    </View>
  );
}

function PlayerBar({
  track,
  progress,
  onPrev,
  onNext,
  onPlayPause,
  isPlaying,
  onLoop,
  loop,
  styles,
  colors,
}) {
  if (!track) return null;
  const dur = parseDur(track.duracao) || 1;
  const pct = Math.max(0, Math.min(1, progress / dur));
  return (
    <View style={styles.playerWrap}>
      <View style={styles.playerCard}>
        <Image source={track.img} style={styles.playerThumb} />
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text numberOfLines={1} style={styles.playerTitle}>
            {track.nome}
          </Text>
          <View style={styles.playerBarBg}>
            <View style={[styles.playerBarFill, { width: `${pct * 100}%` }]} />
          </View>
        </View>
        <View style={styles.playerControls}>
          <TouchableOpacity onPress={onPrev} style={styles.ctrlBtn}>
            <Ionicons name="play-back" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPlayPause} style={styles.ctrlBtn}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={styles.ctrlBtn}>
            <Ionicons
              name="play-forward"
              size={18}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLoop}
            style={[
              styles.ctrlBtn,
              loop && { backgroundColor: colors.accent },
            ]}
          >
            <Ionicons
              name="repeat"
              size={14}
              color={loop ? "#fff" : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function StepModal({
  title,
  values,
  current,
  setCurrent,
  btnText,
  onBack,
  onNext,
  isCycle = false,
  styles,
  colors,
  isDark,
}) {
  return (
    <View style={styles.fullOverlay}>
      <BlurView
        intensity={60}
        tint={isDark ? "dark" : "light"}
        style={[
          RNStyleSheet.absoluteFill,
          isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
        ]}
      />
      <View style={styles.fullCard}>
        <View style={styles.modalHeaderRow}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>{title}</Text>
        </View>

        <View style={styles.selectorHeaderBox}>
          <View style={styles.inlineBox}>
            <Text style={styles.inlineTxt}>
              {isCycle
                ? `${current} ciclo${current === 1 ? "" : "s"}`
                : `${String(current).padStart(2, "0")}:00 min`}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.textPrimary}
            />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {values.map((v) => (
            <TouchableOpacity
              key={v}
              style={styles.row}
              onPress={() => setCurrent(v)}
              activeOpacity={0.9}
            >
              <Text style={styles.rowTxt}>
                {isCycle
                  ? `${v} ciclo${v === 1 ? "" : "s"}`
                  : `${String(v).padStart(2, "0")}:00 min`}
              </Text>
              <Checkbox checked={current === v} styles={styles} colors={colors} />
            </TouchableOpacity>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>

        <TouchableOpacity
          style={styles.ctaWrap}
          onPress={onNext}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#ff2b6b", "#ff005c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaInner}
          >
            <Text style={styles.ctaTxt}>{btnText}</Text>
            <Ionicons name="chevron-forward" color="#fff" size={18} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TelaTarefas() {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { tarefas, concluirTarefa } = useTarefas();
  const sessaoCtx = useSessao();
  const { sessao } = sessaoCtx;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const [selected, setSelected] = useState("Tarefas");

  const [showConfig, setShowConfig] = useState(false);
  const [showSelTarefa, setShowSelTarefa] = useState(false);

  const [showPomoStudy, setShowPomoStudy] = useState(false);
  const [showPomoRest, setShowPomoRest] = useState(false);
  const [showPomoCycles, setShowPomoCycles] = useState(false);

  const [showDeepDur, setShowDeepDur] = useState(false);

  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showMusics, setShowMusics] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(null);

  const [metodo, setMetodo] = useState("Pomodoro");
  const [nome, setNome] = useState("");
  const [focusMode, setFocusMode] = useState(false);

  const [tarefaSel, setTarefaSel] = useState(null);
  const [usarTarefa, setUsarTarefa] = useState(false);

  const [pEstudo, setPEstudo] = useState(25);
  const [pDescanso, setPDescanso] = useState(5);
  const [pCiclos, setPCiclos] = useState(4);

  const [dHoras, setDHoras] = useState(0);
  const [dMin, setDMin] = useState(25);

  const playlistsData = PLAYLISTS;
  const [plMarcadas, setPlMarcadas] = useState([]);
  const [musSelecionadas, setMusSelecionadas] = useState([]);

  const [sound, setSound] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const statusRef = useRef({});
  const lastSecondRef = useRef(-1);
  const actionLockRef = useRef(false);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.warn("setAudioMode error:", e);
      }
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (st) => {
      if (st !== "active" && sound) {
        try {
          await sound.pauseAsync();
          setPlaying(false);
        } catch (e) {
          console.warn("pauseAsync error:", e);
        }
      }
    });
    return () => sub.remove();
  }, [sound]);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (sound) await sound.unloadAsync();
        } catch (err) {
          console.warn("cleanup unload error:", err);
        }
      })();
    };
  }, [sound]);

  const stopAndClearPlayer = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    try {
      if (sound) await sound.unloadAsync();
    } catch (e) {
      console.warn("stopAndClearPlayer unload error:", e);
    }
    setSound(null);
    setQueue([]);
    setCurrentIndex(0);
    setPlaying(false);
    setLoop(false);
    setProgressSec(0);
    isStoppingRef.current = false;
  }, [sound]);

  useEffect(() => {
    if (!sessao.isRunning) {
      stopAndClearPlayer().catch((err) =>
        console.warn("stopAndClearPlayer effect error:", err)
      );
    }
  }, [sessao.isRunning, stopAndClearPlayer]);

  const onStatus = (st) => {
    statusRef.current = st;
    if (!st.isLoaded) return;
    const sec = Math.floor((st.positionMillis || 0) / 1000);
    if (sec !== lastSecondRef.current) {
      lastSecondRef.current = sec;
      setProgressSec(sec);
    }
    if (st.didJustFinish && !st.isLooping) {
      nextTrack().catch((err) =>
        console.warn("nextTrack on didJustFinish error:", err)
      );
    }
  };

  const lockActions = async (fn) => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      await fn();
    } finally {
      setTimeout(() => (actionLockRef.current = false), 180);
    }
  };

  async function loadAndPlay(i) {
    try {
      const tr = queue[i];
      if (!tr) return;
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (e) {
          console.warn("unload before load error:", e);
        }
      }
      const { sound: s } = await Audio.Sound.createAsync(
        tr.file,
        {
          shouldPlay: true,
          isLooping: loop,
          progressUpdateIntervalMillis: 250,
        },
        onStatus
      );
      setSound(s);
      setPlaying(true);
      setCurrentIndex(i);
      lastSecondRef.current = -1;
      setProgressSec(0);
    } catch (e) {
      console.warn("loadAndPlay error:", e);
      await nextTrack().catch((err) =>
        console.warn("nextTrack (fallback) error:", err)
      );
    }
  }
  async function togglePlay() {
    await lockActions(async () => {
      if (!sound) {
        if (queue.length) await loadAndPlay(currentIndex || 0);
        return;
      }
      const st = statusRef.current;
      if (!st.isLoaded) return;
      if (st.isPlaying) {
        await sound.pauseAsync();
        setPlaying(false);
      } else {
        await sound.playAsync();
        setPlaying(true);
      }
    });
  }
  async function nextTrack() {
    await lockActions(async () => {
      if (!queue.length) return;
      const next = (currentIndex + 1) % queue.length;
      await loadAndPlay(next);
    });
  }
  async function prevTrack() {
    await lockActions(async () => {
      if (!queue.length) return;
      const prev = (currentIndex - 1 + queue.length) % queue.length;
      await loadAndPlay(prev);
    });
  }
  async function toggleLoop() {
    await lockActions(async () => {
      const newVal = !loop;
      setLoop(newVal);
      if (sound) {
        const st = statusRef.current;
        if (st.isLoaded) await sound.setIsLoopingAsync(newVal);
      }
    });
  }

  const trackAtual = queue[currentIndex] || null;

  function montarFila() {
    if (musSelecionadas.length) return musSelecionadas.slice();
    const all = [];
    playlistsData.forEach((pl) => {
      if (plMarcadas.includes(pl.id)) all.push(...pl.tracks);
    });
    return all;
  }

  function abrirCriacao() {
    setShowConfig(true);
  }

  async function iniciarDeep() {
    const fila = montarFila();
    setQueue(fila);
    if (fila.length) await loadAndPlay(0);
    else await stopAndClearPlayer();
    if (sessaoCtx.startDeepworkSession) {
      sessaoCtx.startDeepworkSession({
        horas: dHoras,
        minutos: dMin,
        nomeSessao: nome.slice(0, 100),
        tarefaSelecionada: usarTarefa ? tarefaSel : null,
        focoAtivo: focusMode,
        musicQueue: fila,
      });
    }
    setShowDeepDur(false);
  }
  async function iniciarPomodoro() {
    const fila = montarFila();
    setQueue(fila);
    if (fila.length) await loadAndPlay(0);
    else await stopAndClearPlayer();
    if (sessaoCtx.startPomodoroSession) {
      sessaoCtx.startPomodoroSession({
        estudoMin: pEstudo,
        descansoMin: pDescanso,
        totalCiclos: pCiclos,
        nomeSessao: nome.slice(0, 100),
        tarefaSelecionada: usarTarefa ? tarefaSel : null,
        focoAtivo: focusMode,
        musicQueue: fila,
      });
    }
    setShowPomoCycles(false);
  }
  async function finalizarSessao() {
    if (sessaoCtx.finalizeSessionManual) {
      sessaoCtx.finalizeSessionManual();
    }
    setShowFinishConfirm(false);
    setShowPlaylists(false);
    setShowMusics(false);
    await stopAndClearPlayer();
  }

  function resetCampos() {
    setMetodo("Pomodoro");
    setNome("");
    setFocusMode(false);
    setUsarTarefa(false);
    setTarefaSel(null);
    setPEstudo(25);
    setPDescanso(5);
    setPCiclos(4);
    setDHoras(0);
    setDMin(25);
    setPlMarcadas([]);
    setMusSelecionadas([]);
  }

  const taskReviewVisible = !!(
    sessao.finishedPendingReview && sessao.tarefaSelecionada
  );

  function confirmarTerminouTarefa() {
    if (sessao.tarefaSelecionada && concluirTarefa) {
      concluirTarefa(sessao.tarefaSelecionada.id);
    }
    if (sessaoCtx.finishReviewAndReset) sessaoCtx.finishReviewAndReset();
    InteractionManager.runAfterInteractions(() => {
      resetCampos();
    });
  }
  function naoTerminouTarefa() {
    if (sessaoCtx.finishReviewAndReset) sessaoCtx.finishReviewAndReset();
    InteractionManager.runAfterInteractions(() => {
      resetCampos();
    });
  }

  const SIZE = 200;
  const STROKE = 10;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const segmentoTotal = useMemo(() => {
    if (!sessao.isRunning) return 1;
    if (sessao.metodo === "pomodoro" && sessao.pomodoro) {
      const { estudoMin, descansoMin, emDescanso } = sessao.pomodoro;
      return (emDescanso ? descansoMin : estudoMin) * 60 || 1;
    }
    if (sessao.metodo === "deepwork" && sessao.deepwork)
      return sessao.deepwork.totalSecs || 1;
    return 1;
  }, [sessao]);
  const progress = useMemo(() => {
    if (!sessao.isRunning) return 1;
    return sessao.remainingSec / segmentoTotal;
  }, [sessao.isRunning, sessao.remainingSec, segmentoTotal]);
  const dashOffset = useMemo(() => CIRC * (1 - progress), [CIRC, progress]);
  const arcColor = useMemo(() => colorByProgress(progress), [progress]);
  const tempoFmt = useMemo(
    () => (sessao.isRunning ? formatSeconds(sessao.remainingSec) : "--:--"),
    [sessao.isRunning, sessao.remainingSec]
  );
  const subtituloTimer = useMemo(() => {
    if (!sessao.isRunning) return "";
    if (sessao.metodo === "pomodoro")
      return sessao.pomodoro?.emDescanso ? "Descanso" : "Estudo";
    return "Foco contínuo";
  }, [sessao.isRunning, sessao.metodo, sessao.pomodoro]);

  const chips = useMemo(() => {
    if (!sessao.isRunning) return [];
    if (sessao.metodo === "pomodoro" && sessao.pomodoro) {
      const { estudoMin, descansoMin, emDescanso, cyclesRemaining } =
        sessao.pomodoro;
      return [
        { label: `Estudo: ${estudoMin} min`, highlight: !emDescanso },
        { label: `Descanso: ${descansoMin} min`, highlight: emDescanso },
        {
          label: `${cyclesRemaining} ciclo${
            cyclesRemaining === 1 ? "" : "s"
          }`,
          highlight: false,
        },
      ];
    }
    if (sessao.metodo === "deepwork" && sessao.deepwork) {
      const { horas, minutos } = sessao.deepwork;
      return [{ label: `Sessão: ${horas}h ${minutos}m`, highlight: true }];
    }
    return [];
  }, [sessao]);

  const mostrarNavbar = !sessao.isRunning;

  const [selDateISO, setSelDateISO] = useState(formatISO(today()));
  const tarefasAtivas = useMemo(
    () => tarefas.filter((t) => !t.concluida),
    [tarefas]
  );
  const calendarMarks = useMemo(() => {
    const marks = {};
    tarefasAtivas.forEach((t) => {
      const d = parseDDMMYYYY(t.concluirAte);
      if (!d) return;
      if (d >= today()) {
        const key = formatISO(d);
        marks[key] = {
          ...(marks[key] || {}),
          marked: true,
          dotColor: colors.accent,
        };
      }
    });
    marks[selDateISO] = {
      ...(marks[selDateISO] || {}),
      selected: true,
      selectedColor: colors.accent,
      marked: marks[selDateISO]?.marked || false,
    };
    return marks;
  }, [tarefasAtivas, selDateISO, colors]);

  const tarefasDoDia = useMemo(() => {
    const [y, m, d] = selDateISO.split("-").map(Number);
    const sel = startOfDay(new Date(y, m - 1, d));
    return tarefasAtivas.filter((t) => {
      const dt = parseDDMMYYYY(t.concluirAte);
      return dt && sameDay(dt, sel);
    });
  }, [tarefasAtivas, selDateISO]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets_images/logorosa.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.timerWrapper}>
        <View
          style={{
            width: SIZE,
            height: SIZE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Svg width={SIZE} height={SIZE} style={{ position: "absolute" }}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={colors.border}
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={arcColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>

          <View style={styles.timerCenter}>
            <Text
              style={
                sessao.isRunning ? styles.timerBig : styles.timerBigPlaceholder
              }
            >
              {tempoFmt}
            </Text>
            <Text style={styles.timerSub}>{subtituloTimer}</Text>
          </View>
        </View>

        {!sessao.isRunning ? (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => setShowConfig(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.startTxt}>Iniciar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sessionBtns}>
            <TouchableOpacity
              style={[styles.sessBtn, { backgroundColor: colors.accent }]}
              onPress={() => setShowFinishConfirm(true)}
            >
              <Text style={[styles.sessBtnTxt, { color: "#fff" }]}>
                Finalizar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sessBtn,
                { backgroundColor: isDark ? colors.border : "#e3e3e3" },
              ]}
              onPress={() =>
                sessaoCtx.pauseResumeSession &&
                sessaoCtx.pauseResumeSession()
              }
            >
              <Text style={[styles.sessBtnTxt, { color: colors.textPrimary }]}>
                {sessao.paused ? "Retomar" : "Pausar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {chips.length > 0 && (
        <View style={styles.chipsRow}>
          {chips.map((c, i) => (
            <Chip
              key={i}
              text={c.label}
              highlight={c.highlight}
              styles={styles}
              colors={colors}
            />
          ))}
        </View>
      )}

      {sessao.isRunning && sessao.tarefaSelecionada && (
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {sessao.tarefaSelecionada.titulo}
            </Text>
            <View style={styles.taskPill}>
              <Text style={styles.taskPillTxt}>
                {sessao.tarefaSelecionada.concluirAte || "--/--/--"}
              </Text>
            </View>
          </View>
          {!!sessao.tarefaSelecionada.descricao && (
            <Text style={styles.taskDesc} numberOfLines={4}>
              {sessao.tarefaSelecionada.descricao}
            </Text>
          )}
        </View>
      )}

      {!sessao.isRunning && (
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => navigation.navigate("GerenTarefas")}
          activeOpacity={0.9}
        >
          <Text style={styles.manageTxt}>Gerenciar tarefas</Text>
          <Image
            source={require("../assets_icons/seguir.png")}
            style={styles.manageIcon}
          />
        </TouchableOpacity>
      )}

      {mostrarNavbar && (
        <LinearGradient
          colors={
            isDark
              ? ["rgba(0,0,0,0)", "rgba(0,0,0,1)"]
              : ["rgba(246,246,246,0)", "rgba(246,246,246,0.95)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientWrapper}
          pointerEvents="box-none"
        >
          <BlurView
            intensity={25}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.navbarWrapper,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
            pointerEvents="box-none"
          >
            <View style={styles.navbar}>
              {[
                {
                  name: "Início",
                  icon: require("../assets_icons/inicio_icon.png"),
                  screen: "Inicio",
                },
                {
                  name: "Tarefas",
                  icon: require("../assets_icons/tarefas_icon.png"),
                  screen: "TelaTarefas",
                },
                {
                  name: "Artigos",
                  icon: require("../assets_icons/artigo_icon.png"),
                  screen: "TelaArtigos",
                },
                {
                  name: "Definições",
                  icon: require("../assets_icons/config_icon.png"),
                  screen: "TelaDefinicoes",
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={styles.navItem}
                  onPress={() => {
                    setSelected(item.name);
                    navigation.navigate(item.screen);
                  }}
                >
                  <Image
                    source={item.icon}
                    style={[
                      styles.navIcon,
                      selected === item.name && { tintColor: colors.accent },
                    ]}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.navText,
                      selected === item.name && { color: colors.accent },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </LinearGradient>
      )}

      {sessao.isRunning && trackAtual && (
        <PlayerBar
          track={trackAtual}
          progress={progressSec}
          isPlaying={playing}
          onPrev={prevTrack}
          onNext={nextTrack}
          onPlayPause={togglePlay}
          onLoop={toggleLoop}
          loop={loop}
          styles={styles}
          colors={colors}
        />
      )}

      <Modal transparent visible={showConfig} animationType="fade">
        <View style={styles.fullOverlay}>
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={[
              RNStyleSheet.absoluteFill,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
          <View style={styles.fullCard}>
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity
                onPress={() => setShowConfig(false)}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <Text style={styles.modalHeaderTitle}>Iniciar uma sessão</Text>
                <TouchableOpacity
                  onPress={() => setShowSessionInfo(true)}
                  style={{ marginLeft: 10 }}
                  activeOpacity={0.9}
                >
                  <Image
                    source={require("../assets_images/iconfoco.png")}
                    style={{
                      width: 28,
                      height: 28,
                      tintColor: colors.textPrimary,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.modalIntroText}>
              Aqui você pode criar e configurar uma sessão para cronometrar e
              organizar melhor sua rotina.
            </Text>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelGroup}>Método de estudo</Text>
                <ChipsMetodo
                  metodo={metodo}
                  setMetodo={setMetodo}
                  styles={styles}
                  colors={colors}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelGroup}>Nome da sessão</Text>
                <View style={styles.valueBoxFull}>
                  <TextInput
                    style={styles.input}
                    value={nome}
                    maxLength={100}
                    onChangeText={setNome}
                    placeholder="Minha sessão..."
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelGroup}>Tarefa</Text>
                <TouchableOpacity
                  style={styles.valueBoxFull}
                  onPress={() => setShowSelTarefa(true)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.valueTxt} numberOfLines={1}>
                    {usarTarefa && tarefaSel ? tarefaSel.titulo : "Nenhuma"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelGroup}>Música</Text>
                <TouchableOpacity
                  style={styles.valueBoxFull}
                  onPress={() => setShowPlaylists(true)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.valueTxt} numberOfLines={1}>
                    {musSelecionadas.length > 0
                      ? `${musSelecionadas.length} música(s)`
                      : plMarcadas.length > 0
                      ? `${plMarcadas.length} playlist(s)`
                      : "Nenhuma"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.fieldGroupRow}>
                <Text style={styles.fieldLabelGroup}>Modo foco:</Text>
                <Toggle
                  value={focusMode}
                  onPress={() => setFocusMode((p) => !p)}
                  styles={styles}
                  colors={colors}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.ctaWrap}
              onPress={() => {
                if (metodo === "Deepwork") setShowDeepDur(true);
                else setShowPomoStudy(true);
                setShowConfig(false);
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#ff2b6b", "#ff005c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaInner}
              >
                <Text style={styles.ctaTxt}>Continuar</Text>
                <Ionicons name="chevron-forward" color="#fff" size={18} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showSelTarefa} animationType="fade">
        <View style={styles.fullOverlay}>
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={[
              RNStyleSheet.absoluteFill,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
          <View style={styles.fullCard}>
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity
                onPress={() => setShowSelTarefa(false)}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Selecionar tarefa</Text>
            </View>

            <View style={styles.selectorHeaderBox}>
              <Text style={styles.selectorHeaderTxt}>Sessão com tarefa</Text>
              <Toggle
                value={usarTarefa}
                onPress={() => {
                  const next = !usarTarefa;
                  setUsarTarefa(next);
                  if (!next) setTarefaSel(null);
                }}
                styles={styles}
                colors={colors}
              />
            </View>

            {usarTarefa ? (
              <>
                <View style={styles.calendarCard}>
                  <Calendar
                    monthFormat={"MMMM yyyy"}
                    onDayPress={(day) => setSelDateISO(day.dateString)}
                    markedDates={calendarMarks}
                    hideExtraDays={false}
                    enableSwipeMonths
                    theme={{
                      backgroundColor: colors.card,
                      calendarBackground: colors.card,
                      dayTextColor: colors.textPrimary,
                      monthTextColor: colors.textPrimary,
                      textDisabledColor: colors.textSecondary,
                      arrowColor: colors.accent,
                      todayTextColor: colors.accent,
                      textSectionTitleColor: colors.textSecondary,
                      selectedDayBackgroundColor: colors.accent,
                      selectedDayTextColor: "#ffffff",
                    }}
                  />
                </View>

                <FlatList
                  data={tarefasDoDia}
                  keyExtractor={(i) => i.id}
                  renderItem={({ item }) => (
                    <CardTarefaSessao
                      item={item}
                      tarefaSel={tarefaSel}
                      setTarefaSel={setTarefaSel}
                      usarTarefa={usarTarefa}
                      setUsarTarefa={setUsarTarefa}
                      styles={styles}
                      colors={colors}
                    />
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyText}>
                        Nenhuma tarefa para este dia.
                      </Text>
                    </View>
                  }
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 110,
                  }}
                  showsVerticalScrollIndicator={false}
                />
              </>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  Tarefas desativadas para esta sessão.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.ctaWrap}
              onPress={() => setShowSelTarefa(false)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#ff2b6b", "#ff005c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaInner}
              >
                <Text style={styles.ctaTxt}>Selecionar</Text>
                <Ionicons name="chevron-forward" color="#fff" size={18} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showPlaylists} animationType="fade">
        <View style={styles.fullOverlay}>
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={[
              RNStyleSheet.absoluteFill,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
          <View style={styles.fullCard}>
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity
                onPress={() => setShowPlaylists(false)}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Selecionar playlist</Text>
            </View>

            <View style={styles.selectorHeaderBox}>
              <Text style={styles.selectorHeaderTxt}>Playlists disponíveis</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textPrimary}
              />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {playlistsData.map((pl) => {
                const allIn =
                  pl.tracks.length > 0 &&
                  pl.tracks.every((tk) =>
                    musSelecionadas.find((m) => m.id === tk.id)
                  );
                const checked = plMarcadas.includes(pl.id) || allIn;

                return (
                  <View key={pl.id} style={{ marginBottom: 12 }}>
                    <View style={styles.plRow}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={{ flexDirection: "row", flex: 1 }}
                        onPress={() => {
                          setPlaylistOpen(pl);
                          setShowMusics(true);
                          requestAnimationFrame(() => setShowPlaylists(false));
                        }}
                      >
                        <Image source={pl.img} style={styles.plThumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.plTitle} numberOfLines={1}>
                            {pl.nome}
                          </Text>
                          <Text style={styles.plCat}>{pl.categoria}</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setPlMarcadas((prev) => {
                            const isMarked = prev.includes(pl.id);
                            if (isMarked) {
                              setMusSelecionadas((musPrev) =>
                                musPrev.filter(
                                  (m) =>
                                    !pl.tracks.find((t) => t.id === m.id)
                                )
                              );
                              return prev.filter((id) => id !== pl.id);
                            } else {
                              setMusSelecionadas((musPrev) => {
                                const all = [...musPrev];
                                pl.tracks.forEach((tk) => {
                                  if (!all.find((m) => m.id === tk.id))
                                    all.push(tk);
                                });
                                return all;
                              });
                              return [...prev, pl.id];
                            }
                          });
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          styles={styles}
                          colors={colors}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity
              style={styles.ctaWrap}
              onPress={() => setShowPlaylists(false)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#ff2b6b", "#ff005c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaInner}
              >
                <Text style={styles.ctaTxt}>Selecionar</Text>
                <Ionicons name="chevron-forward" color="#fff" size={18} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showMusics} animationType="fade">
        <View style={styles.fullOverlay}>
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={[
              RNStyleSheet.absoluteFill,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
          <View style={styles.fullCard}>
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity
                onPress={() => {
                  setShowPlaylists(true);
                  requestAnimationFrame(() => setShowMusics(false));
                }}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHeaderTitle}>Selecionar música</Text>

            <View style={styles.selectorHeaderBox}>
              <Text style={styles.selectorHeaderTxt}>
                {playlistOpen ? playlistOpen.nome : "Playlist"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textPrimary}
              />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {playlistOpen?.tracks.map((tk) => {
                const checked = !!musSelecionadas.find((m) => m.id === tk.id);
                return (
                  <View key={tk.id} style={{ marginBottom: 12 }}>
                    <View style={styles.plRow}>
                      <View style={{ flexDirection: "row", flex: 1 }}>
                        <Image source={tk.img} style={styles.plThumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.plTitle} numberOfLines={1}>
                            {tk.nome}
                          </Text>
                          <Text style={styles.plCat}>{tk.categoria}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setMusSelecionadas((prev) => {
                            const exists = prev.find((m) => m.id === tk.id);
                            let next = exists
                              ? prev.filter((m) => m.id !== tk.id)
                              : [...prev, tk];

                            if (playlistOpen) {
                              const allIn = playlistOpen.tracks.every((t) =>
                                next.find((m) => m.id === t.id)
                              );
                              setPlMarcadas((p) => {
                                const has = p.includes(playlistOpen.id);
                                if (allIn && !has) return [...p, playlistOpen.id];
                                if (!allIn && has)
                                  return p.filter(
                                    (id) => id !== playlistOpen.id
                                  );
                                return p;
                              });
                            }
                            return next;
                          });
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          styles={styles}
                          colors={colors}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 100 }} />
            </ScrollView>

            <TouchableOpacity
              style={styles.ctaWrap}
              onPress={() => {
                setShowPlaylists(true);
                requestAnimationFrame(() => setShowMusics(false));
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#ff2b6b", "#ff005c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaInner}
              >
                <Text style={styles.ctaTxt}>Selecionar</Text>
                <Ionicons name="chevron-forward" color="#fff" size={18} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showPomoStudy} animationType="fade">
        <StepModal
          title="Tempo de estudo"
          values={[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]}
          current={pEstudo}
          setCurrent={setPEstudo}
          btnText="Avançar"
          onBack={() => {
            setShowPomoStudy(false);
            setShowConfig(true);
          }}
          onNext={() => {
            setShowPomoStudy(false);
            setShowPomoRest(true);
          }}
          styles={styles}
          colors={colors}
          isDark={isDark}
        />
      </Modal>

      <Modal transparent visible={showPomoRest} animationType="fade">
        <StepModal
          title="Tempo de descanso"
          values={[5, 10, 15, 20, 25, 30]}
          current={pDescanso}
          setCurrent={setPDescanso}
          btnText="Avançar"
          onBack={() => {
            setShowPomoRest(false);
            setShowPomoStudy(true);
          }}
          onNext={() => {
            setShowPomoRest(false);
            setShowPomoCycles(true);
          }}
          styles={styles}
          colors={colors}
          isDark={isDark}
        />
      </Modal>

      <Modal transparent visible={showPomoCycles} animationType="fade">
        <StepModal
          title="Quantidade de ciclos"
          values={[1, 2, 3, 4, 5, 6]}
          current={pCiclos}
          setCurrent={setPCiclos}
          btnText="Iniciar sessão"
          isCycle
          onBack={() => {
            setShowPomoCycles(false);
            setShowPomoRest(true);
          }}
          onNext={iniciarPomodoro}
          styles={styles}
          colors={colors}
          isDark={isDark}
        />
      </Modal>

      <Modal transparent visible={showDeepDur} animationType="fade">
        <View style={styles.fullOverlay}>
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={[
              RNStyleSheet.absoluteFill,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
          <View style={styles.fullCard}>
            <View style={styles.modalHeaderRow}>
              <TouchableOpacity
                onPress={() => {
                  setShowDeepDur(false);
                  setShowConfig(true);
                }}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Duração da sessão</Text>
            </View>

            <Text style={[styles.fieldLabelGroup, { marginTop: 6 }]}>
              Horas
            </Text>
            <View style={styles.selectorHeaderBox}>
              <Text style={styles.selectorHeaderTxt}>{dHoras}h</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textPrimary}
              />
            </View>
            <ScrollView
              style={{ maxHeight: 160, marginBottom: 6 }}
              showsVerticalScrollIndicator={false}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((h) => (
                <TouchableOpacity
                  key={h}
                  style={styles.row}
                  onPress={() => setDHoras(h)}
                >
                  <Text style={styles.rowTxt}>{h}h</Text>
                  <Checkbox
                    checked={dHoras === h}
                    styles={styles}
                    colors={colors}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabelGroup}>Minutos</Text>
            <View style={styles.selectorHeaderBox}>
              <Text style={styles.selectorHeaderTxt}>{dMin}m</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textPrimary}
              />
            </View>
            <ScrollView
              style={{ maxHeight: 220, marginBottom: 6 }}
              showsVerticalScrollIndicator={false}
            >
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.row}
                  onPress={() => setDMin(m)}
                >
                  <Text style={styles.rowTxt}>{m}m</Text>
                  <Checkbox
                    checked={dMin === m}
                    styles={styles}
                    colors={colors}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              style={styles.ctaWrap}
              onPress={iniciarDeep}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#ff2b6b", "#ff005c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaInner}
              >
                <Text style={styles.ctaTxt}>Começar a sessão</Text>
                <Ionicons name="chevron-forward" color="#fff" size={18} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showSessionInfo} animationType="fade">
        <View style={styles.infoOverlay}>
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={[
              RNStyleSheet.absoluteFill,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Como funciona a sessão?</Text>

            <ScrollView
              style={{ maxHeight: 320, marginTop: 6, marginBottom: 14 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.infoText}>
                Na tela &quot;Iniciar uma sessão&quot; você define como o
                cronômetro vai funcionar.
                {"\n\n"}
                • <Text style={{ fontWeight: "600" }}>Método de estudo</Text>
                {"\n"}  - <Text style={{ fontWeight: "600" }}>Pomodoro</Text>:
                ciclos com períodos de estudo e pequenos intervalos. Você escolhe
                o tempo de estudo, de descanso e quantos ciclos quer fazer.
                {"\n"}  - <Text style={{ fontWeight: "600" }}>Deepwork</Text>:
                um bloco contínuo de foco, sem pausas programadas. Você define
                quantas horas e minutos a sessão terá.
                {"\n\n"}
                • <Text style={{ fontWeight: "600" }}>Nome da sessão</Text>:
                ajuda a lembrar qual é o objetivo daquela sessão (ex.: &quot;Estudar
                Matemática&quot;, &quot;Projeto TCC&quot;).
                {"\n\n"}
                • <Text style={{ fontWeight: "600" }}>Tarefa</Text> (opcional):
                você pode vincular a sessão a uma tarefa criada na tela de
                tarefas, para acompanhar melhor o que está fazendo.
                {"\n\n"}
                • <Text style={{ fontWeight: "600" }}>Música</Text> (opcional):
                escolha playlists ou músicas para tocar enquanto estuda ou
                trabalha.
                {"\n\n"}
                • <Text style={{ fontWeight: "600" }}>Modo foco</Text>: quando
                ativado, ele bloqueia as notificações do celular durante a
                sessão. Ao finalizar ou interromper a sessão, tudo volta ao
                normal.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setShowSessionInfo(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.infoButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showFinishConfirm} animationType="fade">
        <View style={styles.centerOverlay}>
          <BlurView
            intensity={90}
            tint={isDark ? "dark" : "light"}
            style={[
              RNStyleSheet.absoluteFill,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              Você deseja finalizar a sessão?
            </Text>
            <Text style={styles.confirmSub}>
              Essa confirmação ajuda a manter seu progresso atualizado e os
              relatórios mais precisos.
            </Text>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
              onPress={finalizarSessao}
            >
              <Text style={[styles.confirmTxt, { color: "#fff" }]}>
                Sim, desejo finalizar
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: isDark ? colors.border : "#e3e3e3" },
              ]}
              onPress={() => setShowFinishConfirm(false)}
            >
              <Text style={[styles.confirmTxt, { color: colors.textPrimary }]}>
                Não desejo finalizar
              </Text>
              <Ionicons
                name="close"
                size={16}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={taskReviewVisible} animationType="fade">
        <View style={styles.centerOverlay}>
          <BlurView
            intensity={90}
            tint={isDark ? "dark" : "light"}
            style={[
              RNStyleSheet.absoluteFill,
              isDark && { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
          <View style={styles.confirmBox}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => {
                  if (sessaoCtx.finishReviewAndReset)
                    sessaoCtx.finishReviewAndReset();
                  InteractionManager.runAfterInteractions(() => {
                    resetCampos();
                  });
                }}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmTitle}>
              Você conseguiu terminar a tarefa?
            </Text>
            <Text style={styles.confirmSub}>
              Essa confirmação ajuda a manter seu progresso atualizado e os
              relatórios mais precisos.
            </Text>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
              onPress={confirmarTerminouTarefa}
            >
              <Text style={[styles.confirmTxt, { color: "#fff" }]}>
                Eu terminei
              </Text>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: isDark ? colors.border : "#e3e3e3" },
              ]}
              onPress={naoTerminouTarefa}
            >
              <Text style={[styles.confirmTxt, { color: colors.textPrimary }]}>
                Eu não terminei
              </Text>
              <Ionicons
                name="close"
                size={16}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "flex-start",
    },

    header: {
      width: "100%",
      marginTop: 25,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    logo: { width: 170, height: 75, resizeMode: "contain" },

    timerWrapper: {
      marginTop: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    timerCenter: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    timerBig: {
      fontSize: 32,
      color: colors.textPrimary,
      fontFamily: "Inter_600SemiBold",
    },
    timerBigPlaceholder: {
      fontSize: 32,
      color: colors.textSecondary,
      fontFamily: "Inter_600SemiBold",
    },
    timerSub: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: "Inter_400Regular",
      marginTop: 6,
    },

    startBtn: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 10,
      marginTop: 20,
    },
    startTxt: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },

    sessionBtns: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    sessBtn: {
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 20,
      minWidth: 110,
      alignItems: "center",
      marginHorizontal: 5,
    },
    sessBtnTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 20,
      paddingHorizontal: 20,
    },
    chip: {
      backgroundColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginHorizontal: 4,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
    },

    chipsMetodoRow: { flexDirection: "row", gap: 8 },
    metodoChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    metodoChipActive: { borderColor: colors.accent, backgroundColor: colors.card },
    metodoChipText: {
      color: colors.textSecondary,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    metodoChipTextActive: {
      color: colors.accent,
      fontFamily: "Inter_600SemiBold",
    },

    taskCard: {
      width: "90%",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    taskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    taskTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      maxWidth: "70%",
    },
    taskPill: {
      backgroundColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    taskPillTxt: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Inter_400Regular",
    },
    taskDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      lineHeight: 18,
    },

    manageBtn: {
      marginTop: 30,
      width: "85%",
      backgroundColor: isDark ? colors.card : colors.border,
      padding: 16,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    manageTxt: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "Inter_500Medium",
    },
    manageIcon: {
      width: 22,
      height: 22,
      tintColor: colors.textPrimary,
    },

    gradientWrapper: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 200,
    },
    navbarWrapper: {
      position: "absolute",
      bottom: 50,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    navbar: {
      backgroundColor: colors.card,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
    navIcon: {
      width: 28,
      height: 28,
      tintColor: colors.textPrimary,
      marginBottom: 6,
    },
    navText: {
      fontSize: 13,
      color: colors.textPrimary,
      fontFamily: "Inter_400Regular",
    },

    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.textPrimary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
    },

    toggle: {
      width: 42,
      height: 24,
      borderRadius: 12,
      padding: 3,
      justifyContent: "center",
    },
    toggleOn: { backgroundColor: colors.accent },
    toggleOff: { backgroundColor: colors.border },
    toggleDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#fff",
    },

    fullOverlay: {
      ...RNStyleSheet.absoluteFillObject,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: 0,
    },
    fullCard: {
      flex: 1,
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: 0,
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      borderTopWidth: 1,
      borderColor: colors.border,
    },

    modalHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    modalHeaderTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },

    modalIntroText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      lineHeight: 18,
      marginBottom: 20,
    },

    fieldGroup: { marginBottom: 18 },
    fieldLabelGroup: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      marginBottom: 8,
    },
    valueBoxFull: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 12,
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
    },

    fieldGroupRow: {
      marginBottom: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    valueTxt: {
      color: colors.textPrimary,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      maxWidth: "85%",
    },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      paddingVertical: 0,
    },

    selectorHeaderBox: {
      borderColor: colors.accent,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
    },
    selectorHeaderTxt: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: "Inter_500Medium",
    },

    inlineBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    inlineTxt: {
      color: colors.textPrimary,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowTxt: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      maxWidth: "80%",
    },

    ctaWrap: {
      marginTop: 8,
      marginBottom: 32,
    },
    ctaInner: {
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    ctaTxt: {
      color: "#fff",
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      marginRight: 6,
    },

    infoOverlay: {
      ...RNStyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 22,
    },
    infoCard: {
      width: "92%",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 4,
    },
    infoText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "Inter_400Regular",
    },
    infoButton: {
      marginTop: 4,
      borderRadius: 10,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    infoButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },

    centerOverlay: {
      ...RNStyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 22,
    },
    confirmBox: {
      width: "90%",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    confirmTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 8,
    },
    confirmSub: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      lineHeight: 18,
      marginBottom: 16,
    },
    confirmBtn: {
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    confirmTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

    cardSessao: {
      backgroundColor: isDark ? colors.card : "#ededed",
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? colors.border : "#cfcfcf",
    },
    cardTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      maxWidth: "70%",
    },
    cardDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      marginTop: 10,
    },
    cardDue: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      marginTop: 8,
    },

    plRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    plThumb: { width: 44, height: 44, borderRadius: 8, marginRight: 10 },
    plTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    plCat: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },

    playerWrap: {
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 90,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    playerCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    playerThumb: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
    playerTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      marginBottom: 6,
    },
    playerBarBg: {
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    playerBarFill: { height: 3, backgroundColor: colors.accent },
    playerControls: {
      flexDirection: "row",
      backgroundColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 6,
      marginLeft: 8,
    },
    ctrlBtn: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 4,
      marginHorizontal: 3,
    },

    calendarCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 10,
      marginHorizontal: 16,
      marginTop: 6,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyBox: {
      backgroundColor: isDark ? colors.card : "#ededed",
      borderRadius: 12,
      padding: 18,
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      color: colors.textSecondary,
      fontFamily: "Inter_400Regular",
    },
  });

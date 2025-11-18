import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import arrowIcon from "../../assets_icons/arrow_icon.png";
import { ArticleContext } from "../../contexts/ArticleContext";
import { useAppTheme } from "../../contexts/ThemeContext";

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
    "dezembro"
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
    "dez"
  ],
  dayNames: [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado"
  ],
  dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]
};
LocaleConfig.defaultLocale = "pt-br";

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const formatISO = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const todayISO = formatISO(startOfDay(new Date()));
const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

SplashScreen.preventAutoHideAsync();

export default function HistoricoArtigo() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  const articleCtx = useContext(ArticleContext) || {};
  const { readArticles = [], allArticles = [] } = articleCtx;

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold
  });

  const [selectedISO, setSelectedISO] = useState(todayISO);
  const [openDesc, setOpenDesc] = useState(null);

  const calendarMarks = useMemo(() => {
    const marks = {};
    (readArticles || []).forEach((r) => {
      if (!r?.lidoEmISO) return;
      const d = startOfDay(new Date(r.lidoEmISO));
      const key = formatISO(d);
      marks[key] = {
        ...(marks[key] || {}),
        marked: true,
        dotColor: colors.accent
      };
    });

    marks[selectedISO] = {
      ...(marks[selectedISO] || {}),
      selected: true,
      selectedColor: colors.accent,
      marked: marks[selectedISO]?.marked || false
    };

    return marks;
  }, [readArticles, selectedISO, colors]);

  const artigosDoDia = useMemo(() => {
    const [y, m, d] = selectedISO.split("-").map(Number);
    const sel = startOfDay(new Date(y, m - 1, d));

    return (readArticles || [])
      .filter((r) => r?.lidoEmISO && sameDay(new Date(r.lidoEmISO), sel))
      .sort((a, b) => new Date(b.lidoEmISO) - new Date(a.lidoEmISO));
  }, [readArticles, selectedISO]);

  const descricaoById = (id) => {
    const a = (allArticles || []).find((x) => x?.id === id);
    return (
      a?.descricaoCurta ||
      a?.sinopseCard ||
      "Sem descrição disponível para este artigo."
    );
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={arrowIcon}
            style={[styles.backIcon, { tintColor: colors.icon }]}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Histórico de artigos
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: colors.input,
              borderColor: colors.border
            }
          ]}
        >
          <Calendar
            monthFormat={"MMMM yyyy"}
            onDayPress={(day) => setSelectedISO(day.dateString)}
            markedDates={calendarMarks}
            enableSwipeMonths
            hideExtraDays={false}
            theme={{
              backgroundColor: colors.input,
              calendarBackground: colors.input,
              dayTextColor: colors.textPrimary,
              monthTextColor: colors.textPrimary,
              textDisabledColor: colors.textMuted,
              arrowColor: colors.accent,
              todayTextColor: colors.accent,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.accent,
              selectedDayTextColor: colors.accentText
            }}
          />
        </View>

        {artigosDoDia.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Nenhuma leitura neste dia.
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textBody }]}>
              Finalize um artigo para ele aparecer aqui.
            </Text>
          </View>
        ) : (
          artigosDoDia.map((a) => (
            <TouchableOpacity
              key={`${a.articleId}_${a.lidoEmISO}`}
              activeOpacity={0.9}
              onPress={() =>
                setOpenDesc({
                  titulo: a.titulo || "Artigo",
                  descricao: descricaoById(a.articleId)
                })
              }
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }
                ]}
              >
                {!!a.imagem && (
                  <Image
                    source={a.imagem}
                    style={styles.cardImage}
                  />
                )}

                <View style={styles.cardHeaderRow}>
                  <Text
                    numberOfLines={2}
                    style={[styles.cardTitle, { color: colors.textPrimary }]}
                  >
                    {a.titulo || "Artigo sem título"}
                  </Text>

                  {!!a.categoria && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.chipBg }
                      ]}
                    >
                      <Text
                        style={[styles.badgeText, { color: colors.textBody }]}
                      >
                        {a.categoria}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[styles.cardInfo, { color: colors.textSecondary }]}
                >
                  Lido em{" "}
                  {a.lidoEmISO
                    ? new Date(a.lidoEmISO).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "-"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        transparent
        visible={!!openDesc}
        animationType="fade"
        onRequestClose={() => setOpenDesc(null)}
      >
        <View
          style={[
            styles.detailOverlay,
            { backgroundColor: colors.overlay }
          ]}
        >
          <View
            style={[
              styles.detailBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border
              }
            ]}
          >
            <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>
              {openDesc?.titulo || "Artigo"}
            </Text>

            <Text style={[styles.detailDesc, { color: colors.textBody }]}>
              {openDesc?.descricao || "Sem descrição."}
            </Text>

            <TouchableOpacity onPress={() => setOpenDesc(null)}>
              <Text style={[styles.detailClose, { color: colors.accent }]}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  backIcon: {
    width: 36,
    height: 36,
    marginRight: 10
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold"
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  calendarCard: {
    borderRadius: 16,
    padding: 10,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1
  },
  emptyBox: {
    borderRadius: 14,
    padding: 20,
    marginTop: 10,
    borderWidth: 1
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    marginBottom: 6
  },
  emptyDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 20
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1
  },
  cardImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "flex-start"
  },
  cardTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    maxWidth: "70%"
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  badgeText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11
  },
  cardInfo: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12
  },
  detailOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  detailBox: {
    borderRadius: 16,
    padding: 20,
    width: "100%",
    borderWidth: 1
  },
  detailTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: 10
  },
  detailDesc: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 12,
    lineHeight: 20
  },
  detailClose: {
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginTop: 4,
    fontSize: 15
  }
});

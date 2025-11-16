import React, {
  useContext,
  useMemo,
  useState,
  useEffect
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold
} from "@expo-google-fonts/poppins";
import { Calendar } from "react-native-calendars";
import * as SplashScreen from "expo-splash-screen";

import arrowIcon from "../../assets_icons/arrow_icon.png";
import { ArticleContext } from "../../contexts/ArticleContext";

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
const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
const todayISO = formatISO(startOfDay(new Date()));

SplashScreen.preventAutoHideAsync();

export default function HistoricoArtigo() {
  const navigation = useNavigation();
  const { readArticles = [], allArticles = [] } = useContext(ArticleContext);

  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });

  const [selectedISO, setSelectedISO] = useState(todayISO);

  const calendarMarks = useMemo(() => {
    const marks = {};
    (readArticles || []).forEach((r) => {
      if (!r?.lidoEmISO) return;
      const d = startOfDay(new Date(r.lidoEmISO));
      const key = formatISO(d);
      marks[key] = { ...(marks[key] || {}), marked: true, dotColor: "#ff005c" };
    });
    marks[selectedISO] = {
      ...(marks[selectedISO] || {}),
      selected: true,
      selectedColor: "#ff005c",
      marked: marks[selectedISO]?.marked || false
    };
    return marks;
  }, [readArticles, selectedISO]);

  const artigosDoDia = useMemo(() => {
    const [y, m, d] = selectedISO.split("-").map(Number);
    const sel = startOfDay(new Date(y, m - 1, d));
    return (readArticles || [])
      .filter((r) => r?.lidoEmISO && sameDay(new Date(r.lidoEmISO), sel))
      .sort(
        (a, b) =>
          new Date(b.lidoEmISO).getTime() - new Date(a.lidoEmISO).getTime()
      );
  }, [readArticles, selectedISO]);

  const [openDesc, setOpenDesc] = useState(null);

  function getDescricaoByArticleId(articleId) {
    const a = (allArticles || []).find((x) => x?.id === articleId);
    return (
      a?.descricaoCurta ||
      a?.sinopseCard ||
      "Sem descrição disponível para este artigo."
    );
  }

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={arrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de artigos</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.calendarCard}>
          <Calendar
            monthFormat={"MMMM yyyy"}
            onDayPress={(day) => setSelectedISO(day.dateString)}
            markedDates={calendarMarks}
            hideExtraDays={false}
            enableSwipeMonths
            theme={{
              backgroundColor: "#e4e4e4",
              calendarBackground: "#e4e4e4",
              dayTextColor: "#0F172A",
              monthTextColor: "#0F172A",
              textDisabledColor: "#9CA3AF",
              arrowColor: "#ff005c",
              todayTextColor: "#ff005c",
              textSectionTitleColor: "#6B7280",
              selectedDayBackgroundColor: "#ff005c",
              selectedDayTextColor: "#ffffff"
            }}
          />
        </View>

        {artigosDoDia.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhuma leitura neste dia.</Text>
            <Text style={styles.emptyDesc}>
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
                  descricao: getDescricaoByArticleId(a.articleId)
                })
              }
            >
              <View style={styles.card}>
                {!!a.imagem && (
                  <Image source={a.imagem} style={styles.cardImage} />
                )}

                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {a.titulo || "Artigo sem título"}
                  </Text>

                  {!!a.categoria && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{a.categoria}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cardInfo}>
                  Lido em{" "}
                  {new Date(a.lidoEmISO).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal
        transparent
        visible={!!openDesc}
        animationType="fade"
        onRequestClose={() => setOpenDesc(null)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>
              {openDesc?.titulo || "Artigo"}
            </Text>
            <Text style={styles.detailDesc}>
              {openDesc?.descricao || "Sem descrição."}
            </Text>
            <TouchableOpacity onPress={() => setOpenDesc(null)}>
              <Text style={styles.detailClose}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6"
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
    tintColor: "#0F172A",
    marginRight: 10
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A"
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },

  calendarCard: {
    backgroundColor: "#e4e4e4",
    borderRadius: 16,
    padding: 10,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },

  emptyBox: {
    backgroundColor: "#ededed",
    borderRadius: 14,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 6
  },
  emptyDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20
  },

  card: {
    backgroundColor: "#ededed",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#cfcfcf"
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
    color: "#0F172A",
    maxWidth: "70%"
  },
  badge: {
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  badgeText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#374151"
  },
  cardInfo: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#6B7280"
  },

  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  detailBox: {
    backgroundColor: "#ededed",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  detailTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: 10
  },
  detailDesc: {
    color: "#374151",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 12,
    lineHeight: 20
  },
  detailClose: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginTop: 4,
    fontSize: 15
  }
});

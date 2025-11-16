import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Inter_400Regular } from "@expo-google-fonts/inter";

import iconsearch from "../assets_icons/iconsearch.png";
import iconfavorite from "../assets_icons/icon_favorite.png";
import iconinicio from "../assets_icons/inicio_icon.png";
import icontarefas from "../assets_icons/tarefas_icon.png";
import iconartigo from "../assets_icons/artigo_icon.png";
import iconconfig from "../assets_icons/config_icon.png";
import iconarrow from "../assets_icons/arrow_icon.png";
import arrow2 from "../assets_icons/arrow2_icon.png";
import kebab from "../assets_icons/kebab.png";

import { ArticleContext } from "../contexts/ArticleContext";
import { StreakContext } from "../contexts/StreakContext";
import { ARTIGO_RECOMENDADO, SECTIONS } from "../data/articles";

const { width } = Dimensions.get("window");
const CARD_SMALL_W = Math.min(200, width * 0.55);
const CARD_SMALL_H = 280;

function getArticleId(a) {
  return (
    a.id ||
    `${(a.tituloCard || a.tituloFull || "art")
      .toLowerCase()
      .replace(/\s+/g, "_")}_${a.year || "0"}`
  );
}

export default function TelaArtigos() {
  const navigation = useNavigation();

  const { registerArticles, toggleFavorite, isFavorite, markArticleRead } =
    useContext(ArticleContext);

  const { markDailyRead } = useContext(StreakContext);

  const [detailOpen, setDetailOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [fontSize, setFontSize] = useState(12);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Inter_400Regular,
  });

  useEffect(() => {
    const allArticles = [
      ARTIGO_RECOMENDADO,
      ...SECTIONS.flatMap((sec) => sec.artigos),
    ].map((a) => ({
      ...a,
      id: getArticleId(a),
      qtdPaginas: a.pagesCount || 1,
      dataPublicacao: a.publishedAt || a.year || "",
      tema: a.tema || "",
    }));

    if (registerArticles) {
      registerArticles(allArticles);
    }
  }, [registerArticles]);

  const pagesArr = useMemo(() => {
    const corpo = currentArticle?.corpo || "";
    const paragraphs = corpo
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const chunk = 3;
    const out = [];
    for (let i = 0; i < paragraphs.length; i += chunk) {
      out.push(paragraphs.slice(i, i + chunk));
    }
    return out.length ? out : [[]];
  }, [currentArticle]);

  const totalPages = pagesArr.length || 1;

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;

    return SECTIONS.map((sec) => ({
      ...sec,
      artigos: sec.artigos.filter((a) => {
        const haystack =
          (a.tituloCard || "") +
          " " +
          (a.tituloFull || "") +
          " " +
          (a.sinopseCard || "") +
          " " +
          (a.descricaoCurta || "");
        return haystack.toLowerCase().includes(q);
      }),
    })).filter((sec) => sec.artigos.length > 0);
  }, [query]);

  const showRecommended = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const haystack =
      (ARTIGO_RECOMENDADO.tituloCard || "") +
      " " +
      (ARTIGO_RECOMENDADO.tituloFull || "") +
      " " +
      (ARTIGO_RECOMENDADO.sinopseCard || "") +
      " " +
      (ARTIGO_RECOMENDADO.descricaoCurta || "");
    return haystack.toLowerCase().includes(q);
  }, [query]);

  const noResults = useMemo(
    () => !showRecommended && filteredSections.length === 0,
    [showRecommended, filteredSections]
  );

  const openDetailFor = (article) => {
    setCurrentArticle(article);
    setDetailOpen(true);
  };

  const handleFinishReading = () => {
    if (markDailyRead) markDailyRead();
    if (currentArticle && markArticleRead) markArticleRead(currentArticle);
    setReaderOpen(false);
    navigation.navigate("TelaArtigos");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 260 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Image source={iconsearch} style={styles.searchIcon} />
            <TextInput
              placeholder="Procurar por artigos..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.topFavorite}
            onPress={() => navigation.navigate("Favoritos")}
          >
            <Image source={iconfavorite} style={styles.topFavoriteIcon} />
          </TouchableOpacity>
        </View>

        {showRecommended && (
          <>
            <Text style={styles.sectionTitle}>Artigo recomendado</Text>
            <View style={styles.cardMain}>
              <Image
                source={ARTIGO_RECOMENDADO.imagem}
                style={styles.cardMainImage}
              />
              <Text style={styles.cardMainTitle} numberOfLines={1}>
                {ARTIGO_RECOMENDADO.tituloCard}
              </Text>
              <Text style={styles.cardMainDesc} numberOfLines={3}>
                {ARTIGO_RECOMENDADO.sinopseCard}
              </Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.readButton}
                  onPress={() => openDetailFor(ARTIGO_RECOMENDADO)}
                >
                  <Text style={styles.readButtonText}>Ler agora</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {filteredSections.map((sec) => (
          <View key={sec.titulo} style={{ marginTop: 8 }}>
            <Text style={styles.sectionTitle}>
              Artigos sobre {sec.titulo.toLowerCase()}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {sec.artigos.map((a) => (
                <View key={getArticleId(a)} style={styles.cardSmall}>
                  <Image source={a.imagem} style={styles.cardSmallImage} />
                  <Text style={styles.cardSmallTitle} numberOfLines={1}>
                    {a.tituloCard}
                  </Text>
                  <Text style={styles.cardSmallDesc} numberOfLines={2}>
                    {a.sinopseCard}
                  </Text>
                  <TouchableOpacity
                    style={styles.smallReadBtn}
                    onPress={() => openDetailFor(a)}
                  >
                    <Text style={styles.smallReadText}>Ler agora</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}

        {noResults && (
          <View style={styles.noResultBox}>
            <Text style={styles.noResultTitle}>Nenhum artigo encontrado</Text>
            <Text style={styles.noResultDesc}>
              Tente outra palavra-chave.
            </Text>
          </View>
        )}
      </ScrollView>

      <LinearGradient
        colors={["rgba(246,246,246,0)", "rgba(246,246,246,0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientWrapper}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={25}
          tint="light"
          style={styles.navbarWrapper}
          pointerEvents="box-none"
        >
          <View style={styles.navbar}>
            {[
              { name: "Início", icon: iconinicio, screen: "Inicio" },
              { name: "Tarefas", icon: icontarefas, screen: "TelaTarefas" },
              { name: "Artigos", icon: iconartigo, screen: "TelaArtigos" },
              {
                name: "Definições",
                icon: iconconfig,
                screen: "TelaDefinicoes",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.navItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Image
                  source={item.icon}
                  style={
                    item.name === "Artigos"
                      ? [styles.navIcon, { tintColor: "#ff005c" }]
                      : styles.navIcon
                  }
                  resizeMode="contain"
                />
                <Text
                  style={
                    item.name === "Artigos"
                      ? [styles.navText, { color: "#ff005c" }]
                      : styles.navText
                  }
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </LinearGradient>

      <Modal
        transparent
        visible={detailOpen && !!currentArticle}
        animationType="fade"
        onRequestClose={() => setDetailOpen(false)}
      >
        {currentArticle && (
          <BlurView intensity={60} tint="light" style={styles.blurFill}>
            <View style={styles.detailModalCard}>
              <TouchableOpacity
                style={styles.detailBack}
                onPress={() => setDetailOpen(false)}
              >
                <Image source={arrow2} style={styles.detailBackIcon} />
              </TouchableOpacity>

              <Image
                source={currentArticle.imagem}
                style={styles.detailImage}
              />

              <Text style={styles.detailTitle}>
                {currentArticle.tituloFull}
              </Text>

              <View style={styles.chipsRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    {currentArticle.pagesCount || 1}{" "}
                    {(currentArticle.pagesCount || 1) === 1
                      ? "página"
                      : "páginas"}
                  </Text>
                </View>

                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    {(currentArticle.pagesCount || 1) * 2} min
                  </Text>
                </View>

                {!!currentArticle.year && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{currentArticle.year}</Text>
                  </View>
                )}
              </View>

              {!!currentArticle.descricaoCurta && (
                <Text style={styles.detailDesc}>
                  {currentArticle.descricaoCurta}
                </Text>
              )}

              <View style={styles.detailFooter}>
                <TouchableOpacity
                  style={styles.readBigBtn}
                  onPress={() => {
                    setDetailOpen(false);
                    setPage(0);
                    setReaderOpen(true);
                  }}
                >
                  <LinearGradient
                    colors={["#ff2b6b", "#ff005c"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.readBigBtnInner}
                  >
                    <Text style={styles.readBigBtnText}>Começar leitura</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.starButton}
                  onPress={() => {
                    const id = getArticleId(currentArticle);
                    if (toggleFavorite) toggleFavorite(id);
                  }}
                >
                  <Image
                    source={iconfavorite}
                    style={[
                      styles.starIcon,
                      {
                        tintColor:
                          isFavorite && isFavorite(getArticleId(currentArticle))
                            ? "#FFD700"
                            : "#0F172A",
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        )}
      </Modal>

      <Modal
        transparent={false}
        visible={readerOpen && !!currentArticle}
        animationType="fade"
        onRequestClose={() => setReaderOpen(false)}
      >
        {currentArticle && (
          <View style={styles.readerRoot}>
            <View style={styles.readerHeader}>
              <TouchableOpacity
                style={styles.readerBackBtn}
                onPress={() => setReaderOpen(false)}
              >
                <Image source={iconarrow} style={styles.readerBackIcon} />
              </TouchableOpacity>

              <Text style={styles.readerHeaderTitle} numberOfLines={1}>
                {currentArticle.tituloFull}
              </Text>

              <TouchableOpacity
                onPress={() => setSettingsOpen(true)}
                style={styles.kebabBtn}
              >
                <Image source={kebab} style={styles.kebabIcon} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.readerScroll}
              contentContainerStyle={{ paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.readerPage}>
                {pagesArr[page]?.map((p, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.readerParagraph,
                      {
                        fontSize,
                        lineHeight: Math.round(fontSize * 1.7),
                      },
                    ]}
                  >
                    {p}
                  </Text>
                ))}
              </View>
            </ScrollView>

            <View style={styles.readerFooter}>
              <TouchableOpacity
                style={styles.pageNav}
                onPress={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <Text style={styles.pageNavText}>{"<"}</Text>
              </TouchableOpacity>

              <View style={styles.pageCounter}>
                <Text style={styles.pageCounterText}>
                  {page + 1}/{totalPages}
                </Text>
              </View>

              {page === totalPages - 1 ? (
                <TouchableOpacity
                  style={styles.finishBtn}
                  onPress={handleFinishReading}
                >
                  <Text style={styles.finishBtnText}>Finalizar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.pageNav}
                  onPress={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                >
                  <Text style={styles.pageNavText}>{">"}</Text>
                </TouchableOpacity>
              )}
            </View>

            {settingsOpen && (
              <View style={styles.settingsOverlay}>
                <View style={styles.settingsCard}>
                  <View
                    style={{ alignItems: "flex-end", marginBottom: 8 }}
                  >
                    <View style={styles.percentBadge}>
                      <Text style={styles.percentText}>
                        {Math.round((fontSize / 12) * 100)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.settingsRow}>
                    <Text style={styles.settingsLabel}>
                      Tamanho da fonte:
                    </Text>
                    <View style={styles.fontButtons}>
                      <TouchableOpacity
                        style={styles.fontBtn}
                        onPress={() =>
                          setFontSize((s) => Math.max(10, s - 1))
                        }
                      >
                        <Text style={styles.fontBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.fontSizeValue}>{fontSize}</Text>
                      <TouchableOpacity
                        style={styles.fontBtn}
                        onPress={() =>
                          setFontSize((s) => Math.min(22, s + 1))
                        }
                      >
                        <Text style={styles.fontBtnText}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.settingsClose}
                    onPress={() => setSettingsOpen(false)}
                  >
                    <Text style={styles.settingsCloseText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarWrapper: {
    marginTop: 30,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchBar: {
    flex: 0.85,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  searchIcon: { width: 20, height: 20, tintColor: "#9CA3AF", marginRight: 10 },
  searchInput: {
    color: "#0F172A",
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
  topFavorite: {
    width: 40,
    height: 40,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  topFavoriteIcon: { width: 24, height: 24, tintColor: "#0F172A" },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 20,
  },
  cardMain: {
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  cardMainImage: {
    width: "100%",
    height: (width - 40) * 0.45,
    borderRadius: 10,
    marginBottom: 14,
  },
  cardMainTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    marginBottom: 6,
  },
  cardMainDesc: {
    color: "#4B5563",
    fontSize: 14,
    marginBottom: 14,
    fontFamily: "Poppins_400Regular",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  readButton: {
    backgroundColor: "#ff005c",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "flex-end",
  },
  readButtonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
  },
  cardSmall: {
    width: CARD_SMALL_W,
    height: CARD_SMALL_H,
    backgroundColor: "#E0E0E0",
    borderRadius: 14,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  cardSmallImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardSmallTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    marginBottom: 4,
  },
  cardSmallDesc: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10,
  },
  smallReadBtn: {
    marginTop: "auto",
    backgroundColor: "#D0D0D0",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  smallReadText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
  },
  noResultBox: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  noResultTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    marginBottom: 6,
  },
  noResultDesc: {
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 20,
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
  },
  navbar: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  navIcon: { width: 28, height: 28, tintColor: "#0F172A", marginBottom: 6 },
  navText: {
    fontSize: 13,
    color: "#0F172A",
    fontFamily: "Inter_400Regular",
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalCard: {
    width: "88%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  detailBack: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ff005c",
    alignItems: "center",
    justifyContent: "center",
  },
  detailBackIcon: { width: 18, height: 18, tintColor: "#fff" },
  detailImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  detailTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#e6e6e6",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 6,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    color: "#374151",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Poppins_400Regular",
  },
  detailDesc: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 16,
  },
  detailFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readBigBtn: { flex: 1, marginRight: 12 },
  readBigBtnInner: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  readBigBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
  starButton: {
    width: 44,
    height: 44,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  starIcon: { width: 20, height: 20 },
  readerRoot: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  readerBackBtn: {
    position: "absolute",
    left: 20,
    top: 50,
  },
  readerBackIcon: {
    width: 36,
    height: 36,
    tintColor: "#0F172A",
  },
  readerHeaderTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
    maxWidth: width * 0.6,
    textAlign: "center",
  },
  kebabBtn: {
    position: "absolute",
    right: 20,
    top: 50,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  kebabIcon: { width: 16, height: 16, tintColor: "#0F172A" },
  readerScroll: { flex: 1, paddingHorizontal: 20 },
  readerPage: { marginTop: 10 },
  readerParagraph: {
    color: "#111827",
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    marginBottom: 14,
  },
  readerFooter: {
    position: "absolute",
    bottom: 34,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  pageNav: {
    width: 46,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  pageNavText: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
  },
  pageCounter: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#e6e6e6",
  },
  pageCounterText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
  },
  finishBtn: {
    backgroundColor: "#ff005c",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  finishBtnText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
  },
  settingsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  settingsCard: {
    width: "86%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  percentBadge: {
    backgroundColor: "#e6e6e6",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  percentText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 10,
  },
  settingsLabel: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
  },
  fontButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  fontBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  fontBtnText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
  },
  fontSizeValue: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    marginHorizontal: 12,
  },
  settingsClose: {
    marginTop: 8,
    backgroundColor: "#e3e3e3",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
  settingsCloseText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
  },
});

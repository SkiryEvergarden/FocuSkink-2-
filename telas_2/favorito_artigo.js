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
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  TextInput
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import { ArticleContext } from "../contexts/ArticleContext";
import { StreakContext } from "../contexts/StreakContext";
import iconsearch from "../assets_icons/iconsearch.png";
import iconfavorite from "../assets_icons/icon_favorite.png";
import arrow2 from "../assets_icons/arrow2_icon.png";
import arrowMain from "../assets_icons/arrow_icon.png";
import kebab from "../assets_icons/kebab.png";

const { width } = Dimensions.get("window");

SplashScreen.preventAutoHideAsync();

export default function FavoritoArtigo() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold
  });

  const articleCtx = useContext(ArticleContext) || {};
  const {
    getFavoriteArticles = () => [],
    toggleFavorite = () => {},
    isFavorite = () => false,
    favorites = []
  } = articleCtx;

  const { markDailyRead = () => {} } =
    useContext(StreakContext) || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [currentArticle, setCurrentArticle] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [page, setPage] = useState(0);

  const favs = useMemo(
    () => getFavoriteArticles(),
    [getFavoriteArticles]
  );

  const filteredFavorites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return favs;
    return favs.filter((a) => {
      const txt =
        (a.tituloFull || "") +
        " " +
        (a.tituloCard || "") +
        " " +
        (a.sinopseCard || "") +
        " " +
        (a.descricaoCurta || "");
      return txt.toLowerCase().includes(q);
    });
  }, [favs, searchQuery]);

  const pages = useMemo(() => {
    const corpo = currentArticle?.corpo || "";
    const partes = corpo
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const chunk = 3;
    const out = [];
    for (let i = 0; i < partes.length; i += chunk) {
      out.push(partes.slice(i, i + chunk));
    }
    return out.length ? out : [[]];
  }, [currentArticle]);

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 150);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: "#fff" }} />;

  const totalPages = pages.length;
  const pagesCount = currentArticle?.pagesCount || 1;
  const durationMin = pagesCount * 2;
  const year = currentArticle?.year || "";

  const startReading = (a) => {
    setCurrentArticle(a);
    setDetailOpen(false);
    setPage(0);
    setReaderOpen(true);
  };

  const handleFinish = () => {
    markDailyRead();
    setReaderOpen(false);
  };

  const FavoriteRow = ({ article }) => {
    const articlePages = article.pagesCount || article.qtdPaginas || 1;
    const articleDuration = articlePages * 2;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.favRow}
        onPress={() => {
          setCurrentArticle(article);
          setDetailOpen(true);
        }}
      >
        <View style={styles.favThumbBox}>
          {article.imagem ? (
            <Image
              source={article.imagem}
              style={styles.favThumb}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[styles.favThumb, { backgroundColor: "#e4e4e4" }]}
            />
          )}
        </View>

        <View style={styles.favInfoBox}>
          <Text style={styles.favTitle} numberOfLines={2}>
            {article.tituloCard}
          </Text>

          {!!article.tema && (
            <Text style={styles.favTema} numberOfLines={1}>
              {article.tema}
            </Text>
          )}

          <Text style={styles.favMeta} numberOfLines={1}>
            {articlePages} pág • {articleDuration} min
            {!!article.publishedAt &&
              ` • ${article.publishedAt}`}
          </Text>

          <Text style={styles.favSinopse} numberOfLines={2}>
            {article.sinopseCard}
          </Text>

          <View style={styles.favBottomRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => startReading(article)}
              style={styles.favReadBtn}
            >
              <LinearGradient
                colors={["#ff2b6b", "#ff005c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.favReadBtnInner}
              >
                <Text style={styles.favReadText}>Ler agora</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.favStarBtn}
              onPress={() => toggleFavorite(article.id)}
            >
              <Image
                source={iconfavorite}
                style={[
                  styles.favStarIcon,
                  {
                    tintColor: isFavorite(article.id)
                      ? "#FFD700"
                      : "#ff005c"
                  }
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topHeaderArea}>
          <TouchableOpacity
            style={styles.backToArticlesBtn}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={arrowMain}
              style={styles.backToArticlesIcon}
            />
          </TouchableOpacity>

          <View style={styles.searchBarWrapper}>
            <View style={styles.searchBar}>
              <Image
                source={iconsearch}
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Pesquisar nos favoritos..."
                placeholderTextColor="#6B7280"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.topFavoriteStatic}>
              <Image
                source={iconfavorite}
                style={[
                  styles.topFavoriteIcon,
                  { tintColor: "#FFD700" }
                ]}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.screenTitle}>Favoritos</Text>
          <Text style={styles.screenSubtitle}>
            Seus artigos salvos para ler depois
          </Text>
        </View>

        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          extraData={{
            favIds: favorites,
            len: filteredFavorites.length,
            q: searchQuery
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Nenhum artigo favoritado.
              </Text>
              <Text style={styles.emptyText2}>
                Você pode favoritar artigos tocando na estrela.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <FavoriteRow article={item} />
          )}
        />
      </ScrollView>

      <Modal
        transparent
        visible={detailOpen && !!currentArticle}
        animationType="fade"
        onRequestClose={() => setDetailOpen(false)}
      >
        {!!currentArticle && (
          <BlurView
            intensity={80}
            tint="light"
            style={styles.blurFill}
          >
            <View style={styles.detailModalCard}>
              <TouchableOpacity
                style={styles.detailBack}
                onPress={() => setDetailOpen(false)}
              >
                <Image
                  source={arrow2}
                  style={styles.detailBackIcon}
                />
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
                    {pagesCount}{" "}
                    {pagesCount === 1 ? "página" : "páginas"}
                  </Text>
                </View>

                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    {durationMin} min
                  </Text>
                </View>

                {!!year && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {year}
                    </Text>
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
                  onPress={() =>
                    startReading(currentArticle)
                  }
                >
                  <LinearGradient
                    colors={["#ff2b6b", "#ff005c"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.readBigBtnInner}
                  >
                    <Text style={styles.readBigBtnText}>
                      Começar leitura
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.starButton}
                  onPress={() =>
                    toggleFavorite(currentArticle.id)
                  }
                >
                  <Image
                    source={iconfavorite}
                    style={[
                      styles.starIcon,
                      {
                        tintColor: isFavorite(
                          currentArticle.id
                        )
                          ? "#FFD700"
                          : "#ff005c"
                      }
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        )}
      </Modal>

      <Modal
        visible={readerOpen && !!currentArticle}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setReaderOpen(false)}
      >
        {!!currentArticle && (
          <View style={styles.readerRoot}>
            <View style={styles.readerHeader}>
              <TouchableOpacity
                style={styles.readerBack}
                onPress={() => setReaderOpen(false)}
              >
                <Image
                  source={arrowMain}
                  style={styles.readerBackIcon}
                />
              </TouchableOpacity>

              <Text style={styles.readerTitle} numberOfLines={1}>
                {currentArticle.tituloFull}
              </Text>

              <TouchableOpacity
                style={styles.kebabBtn}
                onPress={() => setSettingsOpen(true)}
              >
                <Image
                  source={kebab}
                  style={styles.kebabIcon}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.readerScroll}
              contentContainerStyle={{ paddingBottom: 140 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.readerPage}>
                {pages[page]?.map((p, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.readerParagraph,
                      {
                        fontSize,
                        lineHeight: Math.round(
                          fontSize * 1.7
                        )
                      }
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
                disabled={page === 0}
                onPress={() =>
                  setPage((old) => Math.max(0, old - 1))
                }
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
                  onPress={handleFinish}
                >
                  <Text style={styles.finishBtnText}>
                    Finalizar
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.pageNav}
                  onPress={() =>
                    setPage((old) =>
                      Math.min(
                        totalPages - 1,
                        old + 1
                      )
                    )
                  }
                >
                  <Text style={styles.pageNavText}>
                    {">"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {settingsOpen && (
              <View style={styles.settingsOverlay}>
                <View style={styles.settingsCard}>
                  <Text style={styles.settingsHeaderText}>
                    Tamanho da fonte
                  </Text>

                  <View style={styles.fontRow}>
                    <TouchableOpacity
                      style={styles.fontBtn}
                      onPress={() =>
                        setFontSize((s) =>
                          Math.max(10, s - 1)
                        )
                      }
                    >
                      <Text style={styles.fontBtnText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.fontSizeValue}>
                      {fontSize}
                    </Text>

                    <TouchableOpacity
                      style={styles.fontBtn}
                      onPress={() =>
                        setFontSize((s) =>
                          Math.min(22, s + 1)
                        )
                      }
                    >
                      <Text style={styles.fontBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.settingsClose}
                    onPress={() =>
                      setSettingsOpen(false)
                    }
                  >
                    <Text style={styles.settingsCloseText}>
                      Fechar
                    </Text>
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
  topHeaderArea: {
    paddingTop: 50,
    paddingHorizontal: 20
  },
  backToArticlesBtn: {
    width: 36,
    height: 36,
    marginBottom: 16
  },
  backToArticlesIcon: {
    width: 36,
    height: 36,
    tintColor: "#0F172A"
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#ededed",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#6B7280",
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    color: "#0F172A",
    fontFamily: "Poppins_400Regular",
    fontSize: 13
  },
  topFavoriteStatic: {
    width: 44,
    height: 44,
    backgroundColor: "#ededed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  topFavoriteIcon: {
    width: 24,
    height: 24
  },
  screenTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    marginTop: 20
  },
  screenSubtitle: {
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20
  },
  emptyBox: {
    backgroundColor: "#ededed",
    borderRadius: 14,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  emptyText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    marginBottom: 4
  },
  emptyText2: {
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 20
  },
  favRow: {
    flexDirection: "row",
    backgroundColor: "#ededed",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#cfcfcf"
  },
  favThumbBox: {
    width: 90,
    height: 90,
    backgroundColor: "#e4e4e4",
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 12
  },
  favThumb: {
    width: "100%",
    height: "100%",
    borderRadius: 10
  },
  favInfoBox: {
    flex: 1,
    justifyContent: "flex-start"
  },
  favTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    marginBottom: 4
  },
  favTema: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
    fontSize: 11,
    marginBottom: 4
  },
  favMeta: {
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    marginBottom: 8
  },
  favSinopse: {
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10
  },
  favBottomRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  favReadBtn: {
    flexShrink: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10
  },
  favReadBtnInner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  favReadText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 13
  },
  favStarBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  favStarIcon: {
    width: 18,
    height: 18
  },
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  detailModalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6"
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
    justifyContent: "center"
  },
  detailBackIcon: {
    width: 18,
    height: 18,
    tintColor: "#fff"
  },
  detailImage: {
    width: "100%",
    height: width * 0.45,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#e4e4e4",
    marginTop: 4
  },
  detailTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    marginBottom: 8
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 10
  },
  chip: {
    backgroundColor: "#ededed",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 6,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center"
  },
  chipText: {
    color: "#374151",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Poppins_400Regular"
  },
  detailDesc: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 12,
    lineHeight: 20
  },
  detailFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  readBigBtn: {
    alignSelf: "stretch",
    marginTop: 6,
    borderRadius: 12,
    overflow: "hidden",
    flex: 1,
    marginRight: 10
  },
  readBigBtnInner: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  readBigBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins_700Bold"
  },
  starButton: {
    width: 44,
    height: 44,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  starIcon: {
    width: 20,
    height: 20
  },
  readerRoot: {
    flex: 1,
    backgroundColor: "#f6f6f6"
  },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 10
  },
  readerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  readerBackIcon: {
    width: 36,
    height: 36,
    tintColor: "#0F172A"
  },
  readerTitle: {
    flex: 1,
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10
  },
  kebabBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  kebabIcon: {
    width: 16,
    height: 16,
    tintColor: "#0F172A"
  },
  readerScroll: {
    flex: 1,
    paddingHorizontal: 24
  },
  readerPage: {
    marginTop: 20
  },
  readerParagraph: {
    color: "#111827",
    fontFamily: "Poppins_400Regular",
    marginBottom: 16
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
    borderColor: "#e6e6e6"
  },
  pageNav: {
    width: 46,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d4d4d4"
  },
  pageNavText: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
    fontSize: 16
  },
  pageCounter: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#ededed",
    borderWidth: 1,
    borderColor: "#d4d4d4"
  },
  pageCounterText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 12
  },
  finishBtn: {
    backgroundColor: "#ff005c",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  finishBtnText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 14
  },
  settingsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)"
  },
  settingsCard: {
    width: "86%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  settingsHeaderText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    marginBottom: 12
  },
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  fontBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ededed",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d4d4d4"
  },
  fontBtnText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 16
  },
  fontSizeValue: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    marginHorizontal: 12,
    fontSize: 14
  },
  settingsClose: {
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 8
  },
  settingsCloseText: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 14
  }
});

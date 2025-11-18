import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import {
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import arrow2 from "../assets_icons/arrow2_icon.png";
import arrowMain from "../assets_icons/arrow_icon.png";
import iconfavorite from "../assets_icons/icon_favorite.png";
import iconsearch from "../assets_icons/iconsearch.png";
import kebab from "../assets_icons/kebab.png";
import { ArticleContext } from "../contexts/ArticleContext";
import { StreakContext } from "../contexts/StreakContext";
import { useAppTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");

SplashScreen.preventAutoHideAsync();

export default function FavoritoArtigo() {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();

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

  const blurTint = isDark ? "dark" : "light";
  const blurIntensity = isDark ? 90 : 70;

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

  if (!fontsLoaded)
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;

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
        style={[
          styles.favRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.border
          }
        ]}
        onPress={() => {
          setCurrentArticle(article);
          setDetailOpen(true);
        }}
      >
        <View
          style={[
            styles.favThumbBox,
            { backgroundColor: colors.cardElevated }
          ]}
        >
          {article.imagem ? (
            <Image
              source={article.imagem}
              style={styles.favThumb}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.favThumb,
                { backgroundColor: colors.softBorder }
              ]}
            />
          )}
        </View>

        <View style={styles.favInfoBox}>
          <Text
            style={[
              styles.favTitle,
              { color: colors.textTitle }
            ]}
            numberOfLines={2}
          >
            {article.tituloCard}
          </Text>

          {!!article.tema && (
            <Text
              style={[
                styles.favTema,
                { color: colors.accent }
              ]}
              numberOfLines={1}
            >
              {article.tema}
            </Text>
          )}

          <Text
            style={[
              styles.favMeta,
              { color: colors.textSecondary }
            ]}
            numberOfLines={1}
          >
            {articlePages} pág • {articleDuration} min
            {!!article.publishedAt && ` • ${article.publishedAt}`}
          </Text>

          <Text
            style={[
              styles.favSinopse,
              { color: colors.textBody }
            ]}
            numberOfLines={2}
          >
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
              style={[
                styles.favStarBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }
              ]}
              onPress={() => toggleFavorite(article.id)}
            >
              <Image
                source={iconfavorite}
                style={[
                  styles.favStarIcon,
                  {
                    tintColor: isFavorite(article.id)
                      ? "#FFD700"
                      : colors.accent
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
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background
      }}
    >
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
              style={[
                styles.backToArticlesIcon,
                { tintColor: colors.icon }
              ]}
            />
          </TouchableOpacity>

          <View style={styles.searchBarWrapper}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border
                }
              ]}
            >
              <Image
                source={iconsearch}
                style={[
                  styles.searchIcon,
                  { tintColor: colors.textMuted }
                ]}
              />
              <TextInput
                placeholder="Pesquisar nos favoritos..."
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.searchInput,
                  { color: colors.textPrimary }
                ]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View
              style={[
                styles.topFavoriteStatic,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border
                }
              ]}
            >
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

          <Text
            style={[
              styles.screenTitle,
              { color: colors.textTitle }
            ]}
          >
            Favoritos
          </Text>

          <Text
            style={[
              styles.screenSubtitle,
              { color: colors.textSecondary }
            ]}
          >
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
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }
              ]}
            >
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.textTitle }
                ]}
              >
                Nenhum artigo favoritado.
              </Text>

              <Text
                style={[
                  styles.emptyText2,
                  { color: colors.textBody }
                ]}
              >
                Você pode favoritar artigos tocando na estrela.
              </Text>
            </View>
          }
          renderItem={({ item }) => <FavoriteRow article={item} />}
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
            intensity={blurIntensity}
            tint={blurTint}
            style={styles.blurFill}
          >
            <View
              style={[
                styles.detailModalCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.detailBack,
                  { backgroundColor: colors.accent }
                ]}
                onPress={() => setDetailOpen(false)}
              >
                <Image
                  source={arrow2}
                  style={styles.detailBackIcon}
                />
              </TouchableOpacity>

              <Image
                source={currentArticle.imagem}
                style={[
                  styles.detailImage,
                  { backgroundColor: colors.input }
                ]}
              />

              <Text
                style={[
                  styles.detailTitle,
                  { color: colors.textTitle }
                ]}
              >
                {currentArticle.tituloFull}
              </Text>

              <View style={styles.chipsRow}>
                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.chipBg
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.textBody }
                    ]}
                  >
                    {pagesCount}{" "}
                    {pagesCount === 1 ? "página" : "páginas"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.chipBg
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.textBody }
                    ]}
                  >
                    {durationMin} min
                  </Text>
                </View>

                {!!year && (
                  <View
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.chipBg
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.textBody }
                      ]}
                    >
                      {year}
                    </Text>
                  </View>
                )}
              </View>

              {!!currentArticle.descricaoCurta && (
                <Text
                  style={[
                    styles.detailDesc,
                    { color: colors.textBody }
                  ]}
                >
                  {currentArticle.descricaoCurta}
                </Text>
              )}

              <View style={styles.detailFooter}>
                <TouchableOpacity
                  style={styles.readBigBtn}
                  onPress={() => startReading(currentArticle)}
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
                  style={[
                    styles.starButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border
                    }
                  ]}
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
                          : colors.accent
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
          <View
            style={[
              styles.readerRoot,
              { backgroundColor: colors.background }
            ]}
          >
            <View style={styles.readerHeader}>
              <TouchableOpacity
                style={styles.readerBack}
                onPress={() => setReaderOpen(false)}
              >
                <Image
                  source={arrowMain}
                  style={[
                    styles.readerBackIcon,
                    { tintColor: colors.icon }
                  ]}
                />
              </TouchableOpacity>

              <Text
                style={[
                  styles.readerTitle,
                  { color: colors.textTitle }
                ]}
                numberOfLines={1}
              >
                {currentArticle.tituloFull}
              </Text>

              <TouchableOpacity
                style={[
                  styles.kebabBtn,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setSettingsOpen(true)}
              >
                <Image
                  source={kebab}
                  style={[
                    styles.kebabIcon,
                    { tintColor: colors.icon }
                  ]}
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
                        color: colors.textPrimary,
                        fontSize,
                        lineHeight: Math.round(fontSize * 1.7)
                      }
                    ]}
                  >
                    {p}
                  </Text>
                ))}
              </View>
            </ScrollView>

            <View
              style={[
                styles.readerFooter,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.pageNav,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.softBorder
                  }
                ]}
                disabled={page === 0}
                onPress={() =>
                  setPage((old) => Math.max(0, old - 1))
                }
              >
                <Text
                  style={[
                    styles.pageNavText,
                    { color: colors.accent }
                  ]}
                >
                  {"<"}
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.pageCounter,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.softBorder
                  }
                ]}
              >
                <Text
                  style={[
                    styles.pageCounterText,
                    { color: colors.textPrimary }
                  ]}
                >
                  {page + 1}/{totalPages}
                </Text>
              </View>

              {page === totalPages - 1 ? (
                <TouchableOpacity
                  style={[
                    styles.finishBtn,
                    { backgroundColor: colors.accent }
                  ]}
                  onPress={handleFinish}
                >
                  <Text style={styles.finishBtnText}>
                    Finalizar
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.pageNav,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.softBorder
                    }
                  ]}
                  onPress={() =>
                    setPage((old) =>
                      Math.min(totalPages - 1, old + 1)
                    )
                  }
                >
                  <Text
                    style={[
                      styles.pageNavText,
                      { color: colors.accent }
                    ]}
                  >
                    {">"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {settingsOpen && (
              <View
                style={[
                  styles.settingsOverlay,
                  { backgroundColor: colors.overlay }
                ]}
              >
                <View
                  style={[
                    styles.settingsCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.settingsHeaderText,
                      { color: colors.textTitle }
                    ]}
                  >
                    Tamanho da fonte
                  </Text>

                  <View style={styles.fontRow}>
                    <TouchableOpacity
                      style={[
                        styles.fontBtn,
                        {
                          backgroundColor: colors.input,
                          borderColor: colors.softBorder
                        }
                      ]}
                      onPress={() =>
                        setFontSize((s) => Math.max(10, s - 1))
                      }
                    >
                      <Text
                        style={[
                          styles.fontBtnText,
                          { color: colors.textTitle }
                        ]}
                      >
                        -
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.fontSizeValue,
                        { color: colors.textPrimary }
                      ]}
                    >
                      {fontSize}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.fontBtn,
                        {
                          backgroundColor: colors.input,
                          borderColor: colors.softBorder
                        }
                      ]}
                      onPress={() =>
                        setFontSize((s) => Math.min(22, s + 1))
                      }
                    >
                      <Text
                        style={[
                          styles.fontBtnText,
                          { color: colors.textTitle }
                        ]}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.settingsClose,
                      { backgroundColor: colors.softBorder }
                    ]}
                    onPress={() => setSettingsOpen(false)}
                  >
                    <Text
                      style={[
                        styles.settingsCloseText,
                        { color: colors.textTitle }
                      ]}
                    >
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
    height: 36
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  searchBar: {
    flex: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 13
  },
  topFavoriteStatic: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1
  },
  topFavoriteIcon: {
    width: 24,
    height: 24
  },
  screenTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    marginTop: 20
  },
  screenSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20
  },
  emptyBox: {
    borderRadius: 14,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1
  },
  emptyText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    marginBottom: 4
  },
  emptyText2: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 20
  },
  favRow: {
    flexDirection: "row",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1
  },
  favThumbBox: {
    width: 90,
    height: 90,
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
    flex: 1
  },
  favTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    marginBottom: 4
  },
  favTema: {
    fontFamily: "Poppins_700Bold",
    fontSize: 11,
    marginBottom: 4
  },
  favMeta: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    marginBottom: 8
  },
  favSinopse: {
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
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
    borderRadius: 18,
    padding: 16,
    borderWidth: 1
  },
  detailBack: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginTop: 4
  },
  detailTitle: {
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
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 6
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Poppins_400Regular"
  },
  detailDesc: {
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
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  starIcon: {
    width: 20,
    height: 20
  },
  readerRoot: {
    flex: 1
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
    height: 36
  },
  readerTitle: {
    flex: 1,
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10
  },
  kebabBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  kebabIcon: {
    width: 16,
    height: 16
  },
  readerScroll: {
    flex: 1,
    paddingHorizontal: 24
  },
  readerPage: {
    marginTop: 20
  },
  readerParagraph: {
    fontFamily: "Poppins_400Regular",
    marginBottom: 16
  },
  readerFooter: {
    position: "absolute",
    bottom: 34,
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  pageNav: {
    width: 46,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  pageNavText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16
  },
  pageCounter: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  pageCounterText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12
  },
  finishBtn: {
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
    alignItems: "center"
  },
  settingsCard: {
    width: "86%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1
  },
  settingsHeaderText: {
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  fontBtnText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16
  },
  fontSizeValue: {
    fontFamily: "Poppins_700Bold",
    marginHorizontal: 12,
    fontSize: 14
  },
  settingsClose: {
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 8
  },
  settingsCloseText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14
  }
});

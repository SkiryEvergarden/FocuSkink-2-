import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

import { useRelatorio } from "./RelatorioContext";
import { useAuth } from "./AuthContext";

export const ArticleContext = createContext({
  allArticles: [],
  favorites: [],
  registerArticles: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  getFavoriteArticles: () => [],
  readArticles: [],
  markArticleRead: () => {},
});

export const ArticleProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  const [allArticles, setAllArticles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [readArticles, setReadArticles] = useState([]);

  const { registrarArtigoLido } = useRelatorio();

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setReadArticles([]);
      return;
    }

    const metaRef = doc(db, "users", userId, "state", "articlesMeta");

    const unsub = onSnapshot(metaRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setFavorites(
          Array.isArray(data.favorites) ? data.favorites : []
        );
        setReadArticles(
          Array.isArray(data.readArticles) ? data.readArticles : []
        );
      } else {
        const initial = { favorites: [], readArticles: [] };
        setFavorites([]);
        setReadArticles([]);
        setDoc(metaRef, initial).catch((e) =>
          console.log("Erro ao criar meta de artigos:", e)
        );
      }
    });

    return () => unsub();
  }, [userId]);

  const saveMeta = useCallback(
    (nextFavorites, nextRead) => {
      if (!userId) return;
      const metaRef = doc(db, "users", userId, "state", "articlesMeta");
      setDoc(metaRef, {
        favorites: nextFavorites,
        readArticles: nextRead,
      }).catch((e) => console.log("Erro ao salvar meta de artigos:", e));
    },
    [userId]
  );

  const registerArticles = useCallback((articlesArray) => {
    const safe = Array.isArray(articlesArray) ? articlesArray : [];
    setAllArticles((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return safe;
      const mapIds = new Set(prev.map((a) => a?.id).filter(Boolean));
      const merged = [...prev];
      safe.forEach((a) => {
        if (a && a.id && !mapIds.has(a.id)) {
          merged.push(a);
          mapIds.add(a.id);
        }
      });
      return merged;
    });
  }, []);

  const toggleFavorite = useCallback(
    (id) => {
      if (!id) return;
      setFavorites((prevFav) => {
        const next = prevFav.includes(id)
          ? prevFav.filter((x) => x !== id)
          : [id, ...prevFav];

        saveMeta(next, readArticles);
        return next;
      });
    },
    [saveMeta, readArticles]
  );

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites]
  );

  const getFavoriteArticles = useCallback(() => {
    if (!Array.isArray(allArticles) || allArticles.length === 0) return [];
    if (!Array.isArray(favorites) || favorites.length === 0) return [];
    const favoriteSet = new Set(favorites);
    return allArticles.filter((a) => a && favoriteSet.has(a.id));
  }, [allArticles, favorites]);

  const markArticleRead = useCallback(
    (articleObj) => {
      if (!articleObj) return;

      const baseId =
        articleObj.id ||
        `${(articleObj.tituloCard || articleObj.tituloFull || "artigo")
          .toLowerCase()
          .replace(/\s+/g, "_")}_${articleObj.year || "0"}`;

      const registro = {
        articleId: baseId,
        titulo:
          articleObj.tituloFull ||
          articleObj.tituloCard ||
          "Artigo sem título",
        categoria: articleObj.tema || "",
        imagem: articleObj.imagem || null,
        lidoEmISO: new Date().toISOString(),
      };

      setReadArticles((prevList) => {
        const next = [registro, ...prevList];
        saveMeta(favorites, next);
        return next;
      });

      try {
        registrarArtigoLido();
      } catch (e) {
        console.warn("Erro ao registrar artigo lido no relatório:", e);
      }
    },
    [favorites, registrarArtigoLido, saveMeta]
  );

  const value = useMemo(
    () => ({
      allArticles,
      favorites,
      registerArticles,
      toggleFavorite,
      isFavorite,
      getFavoriteArticles,
      readArticles,
      markArticleRead,
    }),
    [
      allArticles,
      favorites,
      registerArticles,
      toggleFavorite,
      isFavorite,
      getFavoriteArticles,
      readArticles,
      markArticleRead,
    ]
  );

  return (
    <ArticleContext.Provider value={value}>
      {children}
    </ArticleContext.Provider>
  );
};

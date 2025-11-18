import { useCallback, useEffect, useRef } from "react";
import { BackHandler, Platform, ToastAndroid, View } from "react-native";
import Rotas from "./Routes/Rotas";

import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";

import * as SplashScreen from "expo-splash-screen";

import { AchievementsProvider } from "./contexts/AchievementsContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RelatorioProvider } from "./contexts/RelatorioContext";
import { SessaoProvider } from "./contexts/SessaoContext";
import { StreakProvider } from "./contexts/StreakContext";
import { TarefasProvider } from "./contexts/TarefasContext";
import { ThemeProvider } from "./contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const lastBackPressRef = useRef(0);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      const now = Date.now();

      if (lastBackPressRef.current && now - lastBackPressRef.current < 1500) {
        BackHandler.exitApp();
        return true; 
      }

    
      lastBackPressRef.current = now;
      ToastAndroid.show("Pressione novamente para sair", ToastAndroid.SHORT);
      return true;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => sub.remove();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <AchievementsProvider>
          <RelatorioProvider>
            <TarefasProvider>
              <ArticleProvider>
                <StreakProvider>
                  <SessaoProvider>
                    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                      <Rotas />
                    </View>
                  </SessaoProvider>
                </StreakProvider>
              </ArticleProvider>
            </TarefasProvider>
          </RelatorioProvider>
        </AchievementsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

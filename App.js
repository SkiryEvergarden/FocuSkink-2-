import React, { useCallback } from "react";
import { View } from "react-native";
import Rotas from "./Routes/Rotas";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import * as SplashScreen from "expo-splash-screen";

import { TarefasProvider } from "./contexts/TarefasContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { StreakProvider } from "./contexts/StreakContext";
import { SessaoProvider } from "./contexts/SessaoContext";
import { RelatorioProvider } from "./contexts/RelatorioContext";
import { AchievementsProvider } from "./contexts/AchievementsContext";
import { AuthProvider } from "./contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

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
    </AuthProvider>
  );
}

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";
import { BackHandler, Platform } from "react-native";

import TelaCadastro from "../telas/tela_cadastro";
import TelaCarregamentoInicio from "../telas/tela_carregamento_inicio";
import TelaIntroducao from "../telas/tela_introducao";
import TelaLogin from "../telas/tela_login";
import TelaRedefinirSenha from "../telas/tela_redefinir_senha";
import TelaTermos from "../telas/tela_termos";

import { ThemeProvider } from "../contexts/ThemeContext";
import Rotas2 from "./Rotas_2";

const Stack = createNativeStackNavigator();

export default function Rotas() {
  const lastPress = useRef(0);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      const now = Date.now();

      if (now - lastPress.current < 1500) {
        BackHandler.exitApp();
        return true;
      }

      lastPress.current = now;

      return true;
    });

    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Carregamento" component={TelaCarregamentoInicio} />
        <Stack.Screen name="Introducao" component={TelaIntroducao} />
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        <Stack.Screen name="RedefinirSenha" component={TelaRedefinirSenha} />
        <Stack.Screen name="Termos" component={TelaTermos} />
        <Stack.Screen
          name="App"
          children={() => (
            <ThemeProvider>
              <Rotas2 />
            </ThemeProvider>
          )}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TelaCarregamentoInicio from "../telas/tela_carregamento_inicio";
import TelaLogin from "../telas/tela_login";
import TelaCadastro from "../telas/tela_cadastro";
import TelaTermos from "../telas/tela_termos";
import TelaRedefinirSenha from "../telas/tela_redefinir_senha";
import TelaIntroducao from "../telas/tela_introducao";

import Rotas2 from "./Rotas_2";

const Stack = createNativeStackNavigator();

export default function Rotas() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Carregamento" component={TelaCarregamentoInicio} />
        <Stack.Screen name="Introducao" component={TelaIntroducao} />
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        <Stack.Screen name="RedefinirSenha" component={TelaRedefinirSenha} />
        <Stack.Screen name="Termos" component={TelaTermos} />
        <Stack.Screen name="App" component={Rotas2} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

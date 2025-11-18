import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TelaInicio from "../telas_2/tela_inicio";
import RelatorioInicio from "../telas_2/relatorio_inicio";
import RelatorioNormal from "../telas_2/relatorio_normal";
import RelatorioComparar from "../telas_2/relatorio_comparar";
import TelaDefinicoes from "../telas_2/telas_config/tela_configuracoes";
import TelaTarefas from "../telas_2/tela_tarefas";
import TelaArtigos from "../telas_2/tela_artigos";
import TelaAdmConta from "../telas_2/telas_config/tela_admconta";
import TelaContato from "../telas_2/telas_config/tela_contato";
import TelaEditarPerfil from "../telas_2/telas_config/tela_editar_perfil";
import TelaFeedback from "../telas_2/telas_config/tela_feedback";
import TelaServicos from "../telas_2/telas_config/tela_servicos";
import TelaSobreNos from "../telas_2/telas_config/tela_sobrenos";
import TelaHistorico from "../telas_2/telas_config/tela_hist";
import TelaGerenTarefas from "../telas_2/tela_geren_tarefas";
import TelaFavorito from "../telas_2/favorito_artigo";
import HistoricoSessao from "../telas_2/telas_config/historico_sessao";
import HistoricoTarefa from "../telas_2/telas_config/historico_tarefa";
import HistoricoArtigo from "../telas_2/telas_config/historico_artigo";
import TermosDois from "../telas_2/telas_config/termos2";

const Stack = createNativeStackNavigator();

export default function Rotas2() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Inicio" component={TelaInicio} />
      <Stack.Screen name="RelatorioInicio" component={RelatorioInicio} />
      <Stack.Screen name="RelatorioNormal" component={RelatorioNormal} />
      <Stack.Screen name="RelatorioComparar" component={RelatorioComparar} />
      <Stack.Screen name="TelaDefinicoes" component={TelaDefinicoes} />
      <Stack.Screen name="TelaTarefas" component={TelaTarefas} />
      <Stack.Screen name="TelaArtigos" component={TelaArtigos} />
      <Stack.Screen name="AdmConta" component={TelaAdmConta} />
      <Stack.Screen name="Contato" component={TelaContato} />
      <Stack.Screen name="EditarPerfil" component={TelaEditarPerfil} />
      <Stack.Screen name="Feedback" component={TelaFeedback} />
      <Stack.Screen name="Servicos" component={TelaServicos} />
      <Stack.Screen name="SobreNos" component={TelaSobreNos} />
      <Stack.Screen name="Historico" component={TelaHistorico} />
      <Stack.Screen name="GerenTarefas" component={TelaGerenTarefas} />
      <Stack.Screen name="Favoritos" component={TelaFavorito} />
      <Stack.Screen name="HistoricoSessao" component={HistoricoSessao} />
      <Stack.Screen name="HistoricoTarefa" component={HistoricoTarefa} />
      <Stack.Screen name="HistoricoArtigo" component={HistoricoArtigo} />
      <Stack.Screen name="TermosDois" component={TermosDois} />
    </Stack.Navigator>
  );
}
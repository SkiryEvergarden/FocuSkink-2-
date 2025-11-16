import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import arrowIcon from "../../assets_icons/arrow_icon.png";

export default function TelaSobreNos() {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={arrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre Nós</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.titulo}>Quem Somos?</Text>
        <Text style={styles.texto}>
          A equipe FocuSkirk é composta por três integrantes: Alvaro Pires
          Matheus, Francisco de Assis Ferreira da Silva e João Henrique Alves
          de Sousa.
        </Text>

        <Text style={styles.subtitulo}>Nosso Objetivo</Text>
        <Text style={styles.texto}>
          Desenvolver um aplicativo mobile inteligente e acessível que atenda às
          necessidades de estudantes e profissionais que atuam em regime remoto
          ou híbrido, oferecendo ferramentas que incentivem a concentração, a
          organização pessoal e o equilíbrio entre produtividade e bem-estar.
          {"\n\n"}
          O Focuskink busca combater a procrastinação e o excesso de distrações
          digitais por meio de métodos como a Técnica Pomodoro, bloqueio de
          notificações, lembretes personalizados e trilhas sonoras voltadas ao
          foco, tudo dentro de uma interface intuitiva, amigável e
          personalizável.
        </Text>

        <Text style={styles.subtitulo}>Nossa Visão</Text>
        <Text style={styles.texto}>
          Ser reconhecido nacional e internacionalmente como referência em
          soluções tecnológicas voltadas à produtividade e ao foco em ambientes
          remotos, especialmente entre jovens, estudantes, profissionais
          autônomos e equipes em home office.
          {"\n\n"}
          Almejamos impactar positivamente a vida de milhões de pessoas,
          incentivando a autonomia, a gestão eficiente do tempo e a saúde mental
          no uso cotidiano da tecnologia. A longo prazo, queremos expandir
          nossas funcionalidades com base em inteligência artificial, integração
          com outras plataformas e análises personalizadas.
        </Text>

        <Text style={styles.subtitulo}>Nossa Missão</Text>
        <Text style={styles.texto}>
          Transformar a relação das pessoas com o tempo e a tecnologia,
          promovendo hábitos saudáveis de trabalho e estudo por meio de um
          aplicativo confiável, seguro e eficiente.
          {"\n\n"}
          O Focuskink oferece recursos modernos de apoio à produtividade,
          desenvolvidos com base em pesquisas e boas práticas, respeitando
          sempre a privacidade dos usuários e promovendo a inclusão digital.
        </Text>

        <Text style={styles.subtitulo}>Nosso Projeto</Text>
        <Text style={styles.texto}>
          O Focuskink é um aplicativo mobile desenvolvido para melhorar a
          produtividade e o bem-estar de estudantes, profissionais e qualquer
          pessoa que enfrente dificuldades para manter o foco em ambientes de
          trabalho ou estudo remoto. Combina métodos comprovados de gestão do
          tempo, como a Técnica Pomodoro, com ferramentas modernas como bloqueio
          de notificações, lembretes personalizados, sons ambientes para
          concentração e uma interface motivadora.
          {"\n\n"}
          A proposta surgiu a partir de experiências pessoais do grupo durante o
          ensino remoto e home office, percebendo que faltava uma solução
          completa, segura e pensada especialmente para o público brasileiro.
        </Text>

        <Text style={styles.subtitulo}>Por que um lagarto como símbolo?</Text>
        <Text style={styles.texto}>
          O lagarto foi escolhido como símbolo do Focuskink por representar
          foco, adaptação e resiliência — qualidades essenciais para quem busca
          mais produtividade. Ele simboliza a capacidade de se concentrar, agir
          no momento certo e se recuperar após distrações, refletindo a proposta
          do app de ajudar o usuário a manter o equilíbrio e retomar o controle
          da rotina.
        </Text>

        <View style={{ height: 30 }} />

        <TouchableOpacity
          style={styles.botaoContinuar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoBotao}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    width: 36,
    height: 36,
    tintColor: "#0F172A",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
    marginBottom: 14,
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
    marginTop: 22,
    marginBottom: 8,
  },
  texto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#4B5563",
    lineHeight: 22,
  },
  botaoContinuar: {
    backgroundColor: "#ff005c",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  textoBotao: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});

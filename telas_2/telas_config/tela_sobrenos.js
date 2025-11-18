import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";

import arrowIcon from "../../assets_icons/arrow_icon.png";

export default function TelaSobreNos() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={arrowIcon}
            style={[styles.backIcon, { tintColor: colors.icon }]}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Sobre Nós
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.titulo, { color: colors.textPrimary }]}>
          Quem Somos?
        </Text>
        <Text style={[styles.texto, { color: colors.textBody }]}>
          A equipe FocuSkirk é composta por três integrantes: Alvaro Pires
          Matheus, Francisco de Assis Ferreira da Silva e João Henrique Alves
          de Sousa.
        </Text>

        <Text style={[styles.subtitulo, { color: colors.textPrimary }]}>
          Nosso Objetivo
        </Text>
        <Text style={[styles.texto, { color: colors.textBody }]}>
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

        <Text style={[styles.subtitulo, { color: colors.textPrimary }]}>
          Nossa Visão
        </Text>
        <Text style={[styles.texto, { color: colors.textBody }]}>
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

        <Text style={[styles.subtitulo, { color: colors.textPrimary }]}>
          Nossa Missão
        </Text>
        <Text style={[styles.texto, { color: colors.textBody }]}>
          Transformar a relação das pessoas com o tempo e a tecnologia,
          promovendo hábitos saudáveis de trabalho e estudo por meio de um
          aplicativo confiável, seguro e eficiente.
          {"\n\n"}
          O Focuskink oferece recursos modernos de apoio à produtividade,
          desenvolvidos com base em pesquisas e boas práticas, respeitando
          sempre a privacidade dos usuários e promovendo a inclusão digital.
        </Text>

        <Text style={[styles.subtitulo, { color: colors.textPrimary }]}>
          Nosso Projeto
        </Text>
        <Text style={[styles.texto, { color: colors.textBody }]}>
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

        <Text style={[styles.subtitulo, { color: colors.textPrimary }]}>
          Por que um lagarto como símbolo?
        </Text>
        <Text style={[styles.texto, { color: colors.textBody }]}>
          O lagarto foi escolhido como símbolo do Focuskink por representar
          foco, adaptação e resiliência — qualidades essenciais para quem busca
          mais produtividade. Ele simboliza a capacidade de se concentrar, agir
          no momento certo e se recuperar após distrações, refletindo a proposta
          do app de ajudar o usuário a manter o equilíbrio e retomar o controle
          da rotina.
        </Text>

        <View style={{ height: 30 }} />

        <TouchableOpacity
          style={[
            styles.botaoContinuar,
            { backgroundColor: colors.accent },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.textoBotao, { color: colors.accentText }]}>
            Voltar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: 14,
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    marginTop: 22,
    marginBottom: 8,
  },
  texto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
  },
  botaoContinuar: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  textoBotao: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});

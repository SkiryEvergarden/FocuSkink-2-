import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TelaTermos() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require("../assets_icons/arrow_icon.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos do Aplicativo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.titulo}>Bem-vindo à nossa comunidade</Text>
        <Text style={styles.texto}>
          A sua privacidade é muito importante para nós. Por isso, criamos este documento para explicar
          de forma clara e transparente como coletamos, usamos e protegemos seus dados aqui na FocuSkink.
        </Text>

        <Text style={styles.subtitulo}>Coleta de Dados</Text>
        <Text style={styles.texto}>
          Quando você usa nosso aplicativo, nós podemos coletar:
          {"\n\n"}• Informações de cadastro: nome, e-mail, foto de perfil e localização (opcional).
          {"\n"}• Dados de uso: interações com posts, curtidas, comentários e favoritos.
          {"\n"}• Informações sobre suas plantas: fotos, descrições, espécies e cuidados cadastrados.
          {"\n"}• Dados técnicos: tipo de dispositivo, sistema operacional e endereço IP.
        </Text>

        <Text style={styles.subtitulo}>Como usamos seus dados</Text>
        <Text style={styles.texto}>
          Utilizamos seus dados para:
          {"\n\n"}• Oferecer uma experiência personalizada, com recomendações de plantas, amigos e conteúdos.
          {"\n"}• Melhorar nossa plataforma, corrigindo erros e desenvolvendo novas funcionalidades.
          {"\n"}• Enviar notificações sobre interações, novidades e atualizações (você pode desativar quando quiser).
          {"\n"}• Garantir a segurança da comunidade e combater práticas abusivas.
        </Text>

        <Text style={styles.subtitulo}>Compartilhamento de Dados</Text>
        <Text style={styles.texto}>
          Seus dados são privados e protegidos. Compartilhamos informações apenas quando:
          {"\n\n"}• Você escolhe tornar um post ou perfil público.
          {"\n"}• É necessário para cumprir obrigações legais.
          {"\n"}• Utilizamos serviços parceiros para hospedagem, segurança e melhorias (todos seguem padrões de proteção de dados).
        </Text>

        <Text style={styles.subtitulo}>Seus Direitos</Text>
        <Text style={styles.texto}>
          Você pode, a qualquer momento:
          {"\n\n"}• Editar ou excluir suas informações.
          {"\n"}• Solicitar uma cópia dos dados que temos sobre você.
          {"\n"}• Solicitar a exclusão total da sua conta e dos seus dados.
        </Text>

        <Text style={styles.subtitulo}>Segurança</Text>
        <Text style={styles.texto}>
          Adotamos medidas técnicas e administrativas para proteger seus dados, incluindo criptografia,
          controle de acesso e monitoramento de segurança.
        </Text>

        <Text style={styles.subtitulo}>Atualizações</Text>
        <Text style={styles.texto}>
          Este termo pode ser atualizado periodicamente. Sempre que isso acontecer, vamos avisar por aqui
          ou por e-mail.
        </Text>

        <Text style={styles.subtitulo}>Fale Conosco</Text>
        <Text style={styles.texto}>
          Se tiver qualquer dúvida, fale com nosso time pelo:
          {"\n\n"}e-mail: privacidade@focuskink.com.br
          {"\n\n"}Ao continuar, você concorda com nossos Termos de Privacidade e uso de dados.
        </Text>

        <View style={{ height: 30 }} />

        <TouchableOpacity style={styles.botaoContinuar} onPress={() => navigation.goBack()}>
          <Text style={styles.textoBotao}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
  },
  backIcon: {
    width: 36,
    height: 36,
    tintColor: "#1F1F1F",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#1F1F1F",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },
  titulo: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#1F1F1F",
    marginBottom: 14,
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#1F1F1F",
    marginTop: 22,
    marginBottom: 8,
  },
  texto: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#6F6F6F",
    lineHeight: 22,
  },
  botaoContinuar: {
    backgroundColor: "#FF0F7B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#E10D6F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginTop: 20,
    elevation: 3,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});

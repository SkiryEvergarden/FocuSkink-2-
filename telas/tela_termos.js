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

export default function TelaTermos() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../assets_icons/arrow_icon.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos do Aplicativo</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.titulo}>TERMOS DE USO</Text>

        <Text style={styles.subtitulo}>1.1. Introdução</Text>
        <Text style={styles.texto}>
          Os presentes Termos de Uso têm como finalidade estabelecer as
          condições gerais que regem a utilização do aplicativo FocuSkink, uma
          plataforma digital voltada ao aprimoramento da concentração, foco e
          produtividade pessoal. O FocuSkink foi desenvolvido com o propósito de
          oferecer ao usuário uma experiência tecnológica completa e segura,
          unindo recursos de automação de tarefas, técnicas de foco e
          acompanhamento de desempenho.
          {"\n\n"}
          Ao acessar, instalar ou utilizar o aplicativo, o usuário reconhece ter
          lido integralmente este documento, compreendido todas as cláusulas e,
          ao prosseguir com o uso, declara estar de acordo com as disposições
          aqui contidas. Tal aceitação representa um contrato eletrônico entre o
          usuário e os desenvolvedores, cujas obrigações devem ser cumpridas em
          conformidade com a legislação vigente.
          {"\n\n"}
          Caso o usuário não concorde, no todo ou em parte, com quaisquer dos
          termos descritos, recomenda-se que cesse imediatamente o uso do
          aplicativo. O FocuSkink reserva-se o direito de atualizar, modificar
          ou complementar estes Termos sempre que necessário, buscando manter
          total transparência e assegurar a conformidade com as normas legais e
          técnicas aplicáveis.
        </Text>

        <Text style={styles.subtitulo}>1.2. Uso do Serviço</Text>
        <Text style={styles.texto}>
          O FocuSkink constitui um aplicativo digital moderno que disponibiliza
          ferramentas destinadas à gestão de tempo, aumento da produtividade e
          fortalecimento da disciplina pessoal. Através de suas
          funcionalidades, como organização de tarefas, controle de metas,
          técnicas de concentração e relatórios de desempenho, o usuário poderá
          estruturar suas rotinas de forma mais equilibrada e eficaz.
          {"\n\n"}
          A utilização do serviço é estritamente pessoal e não transferível. O
          usuário compromete-se a fazer uso do aplicativo de modo ético,
          responsável e de acordo com a finalidade para a qual foi criado.
          Qualquer tentativa de uso indevido, como manipulação do sistema,
          exploração comercial não autorizada ou prática de atividades ilícitas,
          será considerada uma violação direta destes Termos e poderá acarretar
          sanções legais e suspensão imediata da conta. Além disso, o FocuSkink
          atua em conformidade com os princípios de acessibilidade, segurança da
          informação e privacidade de dados, garantindo que a experiência do
          usuário seja segura, eficiente e transparente durante todo o uso do
          aplicativo.
        </Text>

        <Text style={styles.subtitulo}>1.2.1. Cadastro e Conta</Text>
        <Text style={styles.texto}>
          Para ter acesso às funcionalidades completas do FocuSkink, o usuário
          deverá criar uma conta pessoal e intransferível. O cadastro exige o
          fornecimento de informações essenciais, como nome completo, endereço
          de e-mail válido e a criação de uma senha de acesso. O usuário declara
          que todas as informações fornecidas são verdadeiras, completas e
          atualizadas. Caso haja alterações, é de sua responsabilidade manter o
          cadastro sempre atualizado para garantir o correto funcionamento do
          aplicativo e a segurança da conta.
        </Text>

        <Text style={styles.subtitulo}>1.2.2. Propriedade e licença de Uso</Text>
        <Text style={styles.texto}>
          O usuário recebe uma licença limitada, não exclusiva, revogável e
          intransferível para utilizar o FocuSkink apenas para fins pessoais, de
          acordo com as condições aqui descritas. Todos os direitos de
          propriedade intelectual, incluindo o design, interface, código-fonte,
          ícones, logotipos, banco de dados e demais elementos do aplicativo,
          pertencem exclusivamente à equipe desenvolvedora. É expressamente
          proibida a reprodução, modificação, distribuição ou comercialização
          parcial ou total do conteúdo sem autorização prévia e por escrito.
        </Text>

        <Text style={styles.subtitulo}>1.2.3. Proibição de Uso Indevido</Text>
        <Text style={styles.texto}>
          O usuário compromete-se a não utilizar o FocuSkink para atividades
          ilícitas, abusivas ou que possam prejudicar outros usuários ou o
          sistema do aplicativo. São consideradas violações graves:
          {"\n\n"}
          Envio, publicação ou propagação de conteúdo ofensivo, ilegal ou
          discriminatório;
          {"\n"}
          Tentativas de acesso não autorizado, modificação ou danos aos sistemas
          operacionais e servidores do aplicativo;
          {"\n"}
          Coleta, compartilhamento ou divulgação de dados pessoais de outros
          usuários sem consentimento;
          {"\n"}
          Uso de automações, bots, engenharia reversa ou qualquer outro método
          para manipular o funcionamento do FocuSkink.
          {"\n\n"}
          O descumprimento dessas proibições poderá resultar em suspensão
          imediata da conta e em medidas legais cabíveis.
        </Text>

        <Text style={styles.subtitulo}>1.3. Privacidade e Proteção de Dados</Text>
        <Text style={styles.texto}>
          O uso do aplicativo está sujeito à Política de Segurança e Privacidade
          do FocuSkink, documento que estabelece como as informações pessoais
          são coletadas, armazenadas e protegidas. Ao se cadastrar e utilizar o
          aplicativo, o usuário consente com o tratamento de seus dados conforme
          descrito nessa política, em total conformidade com a Lei Geral de
          Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD). O FocuSkink
          compromete-se a aplicar medidas técnicas e administrativas adequadas
          para garantir a confidencialidade e integridade dos dados, utilizando
          criptografia, controle de acesso e práticas seguras de armazenamento.
        </Text>

        <Text style={styles.subtitulo}>1.4. Responsabilidades do Usuário</Text>
        <Text style={styles.texto}>
          Compete ao usuário:
          {"\n\n"}
          Manter a confidencialidade de suas credenciais de login e senha;
          {"\n"}
          Evitar o compartilhamento da conta com terceiros não autorizados;
          {"\n"}
          Fornecer informações corretas e atualizadas em seu perfil;
          {"\n"}
          Utilizar o aplicativo de maneira ética, sem prejudicar sua própria
          segurança ou a de outros usuários.
          {"\n\n"}
          O usuário reconhece que qualquer atividade realizada em sua conta é de
          sua exclusiva responsabilidade e que o uso indevido pode resultar em
          suspensão temporária ou exclusão definitiva da conta.
        </Text>

        <Text style={styles.subtitulo}>1.5. Limitação de Responsabilidade</Text>
        <Text style={styles.texto}>
          O FocuSkink não se responsabiliza por danos diretos ou indiretos
          decorrentes do uso ou impossibilidade de uso do aplicativo, incluindo
          perda de dados, falhas de conexão, interrupções de serviço ou
          eventuais erros de sistema.
          {"\n\n"}
          Apesar da constante manutenção e aprimoramento, não é possível
          garantir disponibilidade ininterrupta do aplicativo. O FocuSkink adota
          boas práticas de segurança da informação, alinhadas às normas ISO/IEC
          27001 e 27701, mas não se responsabiliza por eventos alheios ao seu
          controle, como falhas de rede, mau uso do dispositivo ou negligência
          do usuário.
        </Text>

        <Text style={styles.subtitulo}>1.6. Alterações nos Termos de Uso</Text>
        <Text style={styles.texto}>
          O FocuSkink reserva-se o direito de alterar, a qualquer momento, os
          presentes Termos, a fim de adequar-se a novas legislações, atualizações
          tecnológicas ou melhorias de serviço. Em caso de modificações
          significativas, os usuários serão previamente notificados por e-mail
          ou dentro do próprio aplicativo. A continuidade do uso do FocuSkink
          após a divulgação das mudanças será considerada como aceitação das
          novas condições.
        </Text>

        <Text style={styles.subtitulo}>1.7. Troca e Recuperação de Senha</Text>
        <Text style={styles.texto}>
          O usuário é responsável por manter a segurança de sua conta. Caso
          esqueça a senha, poderá realizar a redefinição por meio do e-mail
          cadastrado, seguindo as instruções automáticas que são enviadas pelo
          sistema do aplicativo. Por motivos de segurança do usuário, as senhas
          atualizadas devem conter letras maiúsculas, minúsculas, números e
          caracteres especiais, além disso, a redefinição só ficará ativa
          durante 30 minutos, após esse prazo ela irá expirar. O FocuSkink nunca
          irá solicitar senha por e-mail, mensagem ou ligação, em caso de
          suspeita de invasão, o usuário deve alterar imediatamente sua senha e
          contatar o suporte técnico.
        </Text>

        <Text style={styles.subtitulo}>1.8. Encerramento e Suspensão de Conta</Text>
        <Text style={styles.texto}>
          O FocuSkink poderá suspender, restringir ou encerrar o acesso de
          qualquer usuário que viole as disposições destes Termos, pratique
          atividades suspeitas ou cause danos à plataforma. O usuário também
          pode encerrar sua conta a qualquer momento, seguindo as instruções
          disponíveis na área de configurações do aplicativo. Após o
          encerramento, os dados pessoais serão excluídos de forma segura,
          conforme previsto na LGPD e na Política de Segurança.
        </Text>

        <Text style={styles.subtitulo}>1.9. Pagamento do Plano Essencial</Text>
        <Text style={styles.texto}>
          O FocuSkink oferece um plano pago que concede acesso a funcionalidades
          premium, como relatórios avançados, listas ilimitadas e sons
          exclusivos para focos. O pagamento do Plano Essencial poderá ser
          realizado de maneira segura por meio de plataformas conhecidas (Como o
          Google Play, Apple Pay ou cartões de crédito), com processamento
          criptografado. Nenhum dado bancário é armazenado diretamente pelo
          aplicativo. O usuário poderá cancelar seu plano a qualquer momento que
          desejar, respeitando as políticas de cada loja de aplicativos. Os
          valores pagos não são reembolsáveis após o início do período
          contratado, salvo em casos de falhas técnicas comprovadas.
        </Text>

        <Text style={styles.subtitulo}>1.10. Política de Atualizações</Text>
        <Text style={styles.texto}>
          Com o compromisso de constante evolução, o FocuSkink realiza
          atualizações automáticas que visam aprimorar a segurança, corrigir
          eventuais falhas e incluir novas funcionalidades. Essas atualizações
          podem ocorrer de forma periódica, sem necessidade de ação do usuário,
          e são indispensáveis para garantir a estabilidade e a compatibilidade
          com os sistemas operacionais mais recentes. O uso contínuo do
          aplicativo após as atualizações implica na aceitação das novas versões
          dos Termos de Uso e demais políticas. Quando as alterações forem
          significativas, o usuário será notificado previamente, podendo optar
          por aceitar as mudanças ou encerrar o uso da plataforma.
        </Text>

        <Text style={styles.subtitulo}>1.11. Suporte e Contato</Text>
        <Text style={styles.texto}>
          O FocuSkink disponibiliza suporte técnico oficial por meio de canais
          diretos no aplicativo e por e-mail institucional, com tempo médio de
          resposta de até 72 horas úteis. O suporte destina-se a esclarecer
          dúvidas sobre funcionalidades, planos e pagamentos, bem como receber
          solicitações de exclusão de conta, relatórios de incidentes de
          segurança e sugestões de melhoria. A equipe do FocuSkink reforça seu
          compromisso com a transparência, a ética e o respeito ao usuário,
          assegurando atendimento sigiloso, responsável e humanizado em todas as
          interações.
        </Text>

        <View style={{ height: 30 }} />

        <TouchableOpacity
          style={styles.botaoContinuar}
          onPress={() => navigation.goBack()}
        >
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
    fontWeight: "700",
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
    fontWeight: "700",
    color: "#1F1F1F",
    marginBottom: 14,
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1F1F",
    marginTop: 22,
    marginBottom: 8,
  },
  texto: {
    fontSize: 14,
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
    fontWeight: "700",
  },
});

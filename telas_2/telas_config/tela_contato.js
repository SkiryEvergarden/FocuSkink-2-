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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";

import arrowIcon from "../../assets_icons/arrow_icon.png";

export default function TelaContato() {
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image
              source={arrowIcon}
              style={[styles.backIcon, { tintColor: colors.icon }]}
            />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Contatos
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Entre em contato com nossa equipe pelos canais abaixo sempre que
          precisar de suporte ou tiver alguma sugestão.
        </Text>

        <Text style={[styles.label, { color: colors.textPrimary }]}>E-mail</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary },
          ]}
          value="focuskink.12@email.com"
          editable={false}
        />

        <Text style={[styles.label, { color: colors.textPrimary }]}>Telefone</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary },
          ]}
          value="+55 11 94599-3719"
          editable={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 28,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 20,
    borderWidth: 1,
  },
});

import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useAppTheme } from "../contexts/ThemeContext";

export default function Tela_carregamento_inicio({ navigation }) {
  const videoRef = useRef(null);
  const { currentUser, initializing } = useAuth();
  const { isDark } = useAppTheme();

  const videoSource = isDark
    ? require("../assets_videos/focusanimation_b.mp4")
    : require("../assets_videos/focuslalalala.mp4");

  useEffect(() => {
    if (!initializing) {
      const timer = setTimeout(() => {
        if (currentUser) {
          navigation.replace("App");
        } else {
          navigation.replace("Introducao");
        }
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [initializing, currentUser, navigation]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#141414" : "#ffffff" }
      ]}
    >
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        isMuted
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  video: {
    width,
    height: height * 0.62
  }
});

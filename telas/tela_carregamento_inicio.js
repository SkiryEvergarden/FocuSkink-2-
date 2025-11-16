import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useAuth } from "../contexts/AuthContext";

export default function Tela_carregamento_inicio({ navigation }) {
  const videoRef = useRef(null);
  const { currentUser, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) {
      
      const timer = setTimeout(() => {
        if (currentUser) {
          navigation.replace("App"); 
        } else {
          navigation.replace("Introducao"); 
        }
      }, 3200); 

      return () => clearTimeout(timer);
    }
  }, [initializing, currentUser]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require("../assets_videos/focuslalalala.mp4")}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        isMuted
        rate={0.9}
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width,
    height: height * 0.62,
  },
});

import React from 'react'
import { Dimensions } from 'react-native';
import { Image, Text, View, StyleSheet } from 'react-native';

const SplashScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const iframeWidth = Math.min(screenWidth - 12, 445);

  return (
    <View style={[styles.container, { width: iframeWidth, height: "100%" }]}>
        <Image
            style={styles.image}
            source={{
            uri: 'https://walletchat-pfp-storage.sgp1.digitaloceanspaces.com/wc_logo.png',
            }}
        />
        <Text style={styles.text}>
            WalletChat
        </Text>
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignSelf: "center",
      top: "8%",
      height: "83%",
      borderRadius: 16,
      alignItems: 'center',
      backgroundColor: "#091B18"
    },
    image: {
        height: 50,
        width: 50,
        marginBottom: 10
    },
    text: {
        fontSize: 40,
        fontWeight: "600",
        lineHeight: 51,
        color: "#FFFFFF"
    }
});
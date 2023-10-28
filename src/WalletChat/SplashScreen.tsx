import React from 'react'
import { Dimensions } from 'react-native';
import { Image, Text, View, StyleSheet } from 'react-native';

const SplashScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  let wrapperHeight = 580;

  if (screenWidth < 768) {
    wrapperHeight = 800; 
  }
  const iframeWidth = Math.min(screenWidth - 12, 445);

  return (
    <View style={styles.container}>
      <View style={[styles.wrapper, { width: iframeWidth, height: wrapperHeight }]}>
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
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignSelf: "center",
    top: "8%",
    height: "83%"
  },
  wrapper: {
    justifyContent: 'center',
    alignSelf: "center",
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
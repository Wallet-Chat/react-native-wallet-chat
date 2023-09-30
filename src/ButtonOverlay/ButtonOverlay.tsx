import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';

export function ButtonOverlay({
  notiVal,
  showNoti,
  isOpen,
  clickHandler,
}: {
  notiVal: number;
  showNoti: boolean;
  isOpen: boolean;
  clickHandler: (e: any) => void;
}) {

  return (
    <View
      style={[
        styles.popupButton__container,
        isOpen && styles.popupButton__containerOpen,
      ]}
    >
      
      <TouchableOpacity
        onPress={(e: any) => {
          clickHandler(e);
        }}
        style={[
          styles.icon,
          !isOpen ? styles.activeIcon : styles.inactiveIcon,
        ]}
      >
        <View
          style={[
            styles.icon,
            !isOpen ? styles.activeIcon : styles.inactiveIcon,
          ]}
        >
          <Image
            style={styles.popupButton}
            source={{
              uri: 'https://walletchat-pfp-storage.sgp1.digitaloceanspaces.com/wc_logo.png',
            }}
          />
        </View>
         <View
          style={[
            styles.icon,
            isOpen ? styles.activeIcon : styles.inactiveIcon,
          ]}
        />
      </TouchableOpacity>

      {showNoti && (
        <>
          <View style={styles.notifPing} />
          <View style={styles.notif}>
            <Text style={styles.notifText}>{notiVal}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  popupButton__container: {
    position: 'relative',
    marginTop: 3,
    height: 48, // You can adjust this value as needed
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  popupButton__containerOpen: {
    right: 6,
    marginTop: 0,
    transform: [{ translateY: 0 }],
  },
  popupButton: {
    top: 0,
    right: 0,
    width: 40, // You can adjust this value as needed
    height: 40, // You can adjust this value as needed
    borderRadius: 20, // half of width and height to make it round
    overflow: 'hidden',
  },
  icon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  inactiveIcon: {
    position: 'absolute',
    opacity: 0,
    transform: [{ rotate: '30deg' }, { scale: 0 }],
  },
  activeIcon: {
    position: 'absolute',
    opacity: 1,
    transform: [{ rotate: '0deg' }],
  },
  ring: {
    position: 'absolute',
    width: 40, // You can adjust this value as needed
    height: 40, // You can adjust this value as needed
    right: 0,
    borderRadius: 20, // half of width and height to make it round
    backgroundColor: '#718096',
    opacity: 0.75,
  },
  notifPing: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    left: 40,
    backgroundColor: '#f56565',
    borderRadius: 12,
  },
  notif: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#f56565',
    width: 20,
    height: 20,
    left: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});

export default ButtonOverlay;

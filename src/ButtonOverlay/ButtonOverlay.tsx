import { WalletChatContext } from '../context';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getClickedNfts() {
  try {
    const clickedNfts = await AsyncStorage.getItem('clickedNfts');
    return clickedNfts ? Array.from(new Set(JSON.parse(clickedNfts))) : [];
  } catch (error) {
    return [];
  }
}

async function setClickedNfts(foundNft: any) {
  try {
    const clickedNfts = await getClickedNfts();
    const newClickedNfts = [...clickedNfts, foundNft];
    await AsyncStorage.setItem('clickedNfts', JSON.stringify(newClickedNfts));
  } catch (error) {
    return null;
  }
}

export interface ButtonOverlayProps {
  notiVal: number;
  showNoti: boolean;
  isOpen: boolean;
  clickHandler: () => void;
}

export function ButtonOverlay({
  notiVal,
  showNoti,
  isOpen,
  clickHandler,
}: ButtonOverlayProps) {
  const [isRinging, setIsRinging] = useState(false);
  const widgetContext = React.useContext(WalletChatContext);

  useEffect(() => {
    async function fetchData() {
      const clickedNfts = await getClickedNfts();
      const widgetState = widgetContext?.widgetState;
      const foundNft = widgetState?.foundNft;
      const foundNftId = foundNft && JSON.parse(foundNft).itemId;
      const shouldRing =
        !isOpen &&
        (foundNft ? !clickedNfts.includes(foundNft) && Boolean(foundNftId) : false);

      setIsRinging(shouldRing);

      if (shouldRing) {
        const animationInterval = setInterval(() => {
          setIsRinging((prev) => !prev);
        }, 1000);

        return () => {
          clearInterval(animationInterval);
        };
      }
    }

    fetchData();
  }, [isOpen]);

  const handlePress = async () => {
    setIsRinging(false);
    const widgetState = widgetContext?.widgetState;
    const foundNft = widgetState?.foundNft;

    if (foundNft) {
      await setClickedNfts(foundNft);
    }

    clickHandler();
  };

  return (
    <View
      style={[
        styles.popupButton__container,
        isOpen && styles.popupButton__containerOpen,
      ]}
    >
      {isRinging && (
        <View
          style={[
            styles.ring,
            {
              opacity: isRinging ? 0.75 : 0,
              transform: [
                {
                  scale: isRinging ? 1.2 : 1,
                },
              ],
            },
          ]}
        />
      )}

      <TouchableOpacity onPress={handlePress}>
        <View
          style={[
            styles.icon,
            !isOpen ? styles.activeIcon : styles.inactiveIcon,
          ]}
        >
          <Image
            style={styles.popupButton}
            source={{
              uri: 'https://walletchat-pfp-storage.sgp1.digitaloceanspaces.com/wc_logo.svg',
            }}
          />
        </View>
        <View
          style={[
            styles.icon,
            isOpen ? styles.activeIcon : styles.inactiveIcon,
          ]}
        >
          {/* SVG component here */}
        </View>
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
    position: 'absolute',
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
    marginLeft: 60,
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
    // Implement animation logic here
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

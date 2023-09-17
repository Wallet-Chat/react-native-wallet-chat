import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text, Animated, type ViewStyle } from 'react-native';
import { WalletChatContext } from '../context';

function getClickedNfts() {
  try {
    const clickedNfts =
      (typeof localStorage !== 'undefined' &&
        localStorage.getItem('clickedNfts')) ||
      '';

    return clickedNfts ? Array.from(new Set(JSON.parse(clickedNfts))) : [];
  } catch (error: any) {
    return [];
  }
}

function setClickedNfts(foundNft: string) {
  try {
    const clickedNfts = getClickedNfts();
    const newClickedNfts = [...clickedNfts, foundNft];

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('clickedNfts', JSON.stringify(newClickedNfts));
    }
  } catch (error: any) {
    return null;
  }
}

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
  const clickedNfts = getClickedNfts();
  const widgetContext = React.useContext(WalletChatContext);
  const widgetState = widgetContext?.widgetState;
  const foundNft = widgetState?.foundNft;
  const foundNftId = foundNft && JSON.parse(foundNft).itemId;
  const shouldRing =
    !isOpen &&
    (foundNft ? !clickedNfts.includes(foundNft) && Boolean(foundNftId) : false);

  const [isRinging, setIsRinging] = React.useState(shouldRing);
  const pingAnimation = new Animated.Value(0);

  React.useEffect(() => {
    setIsRinging(shouldRing);

    if (shouldRing) {
      // Start the animation when isRinging becomes true
      const animationInterval = Animated.loop(
        Animated.sequence([
          Animated.timing(pingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );

      animationInterval.start();

      return () => {
        animationInterval.stop(); // Clean up the interval when the component unmounts
      };
    }
  }, [shouldRing]);

  // Define the ping style with animated values
  // Define the ping style with animated values
const pingStyle: Animated.WithAnimatedObject<ViewStyle> = {
  position: 'absolute', // Make sure 'position' is set to 'absolute'
  top: -8,
  right: -8,
  width: 24,
  height: 24,
  left: 40,
  backgroundColor: '#f56565',
  borderRadius: 12,
  transform: [
    {
      scale: pingAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2],
      }),
    },
  ],
  opacity: pingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.75],
  }),
};

  return (
    <View
      style={[
        styles.popupButton__container,
        isOpen && styles.popupButton__containerOpen,
      ]}
    >
      {isRinging && <Animated.View style={[styles.ring, pingStyle]} />}

      <TouchableOpacity
        onPress={(e: any) => {
          setIsRinging(false);
          if (foundNft) {
            setClickedNfts(foundNft);
          }
          clickHandler(e);
        }}
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
              uri: 'https://walletchat-pfp-storage.sgp1.digitaloceanspaces.com/wc_logo.svg',
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

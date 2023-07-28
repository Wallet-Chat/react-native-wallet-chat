import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet } from 'react-native';
import { WalletChatContext } from '../context';
import { Text } from 'react-native';

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

  React.useEffect(() => {
    setIsRinging(shouldRing);

    if (shouldRing) {
      // Start the animation when isRinging becomes true
      const animationInterval = setInterval(() => {
        setIsRinging((prev) => !prev); // Toggle the isRinging state to create the animation effect
      }, 1000);

      return () => {
        clearInterval(animationInterval); // Clean up the interval when the component unmounts
      };
    }
  }, [shouldRing]);

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
            alt="WalletChat"
            source={{
              uri: 'https://uploads-ssl.webflow.com/62d761bae8bf2da003f57b06/62d761bae8bf2dea68f57b52_walletchat%20logo.png',
            }}
          />
        </View>
        <View
          style={[
            styles.icon,
            isOpen ? styles.activeIcon : styles.inactiveIcon,
          ]}
        >
          <svg
            focusable='false'
            viewBox='0 0 16 14'
            width='28'
            height='25'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M.116 4.884l1.768-1.768L8 9.232l6.116-6.116 1.768 1.768L8 12.768.116 4.884z'
            />
          </svg>
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
    backgroundColor: '#000',
  },
  icon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    marginLeft: 60,
    marginTop: 10,
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
    backgroundColor: '#f56565',
    borderRadius: 12,
    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  },
  notif: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#f56565',
    width: 20,
    height: 20,
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

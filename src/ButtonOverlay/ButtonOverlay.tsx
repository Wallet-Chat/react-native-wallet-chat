import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { WalletChatContext } from '../context';
import { Text } from 'react-native';
import { SvgXml } from 'react-native-svg';

const xml = `
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
  width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
  preserveAspectRatio="xMidYMid meet">

  <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
  fill="#000000" stroke="none">
  <path d="M2388 4989 c-557 -38 -1090 -274 -1512 -669 -173 -162 -370 -427
  -483 -650 -277 -545 -340 -1152 -182 -1750 122 -461 393 -890 764 -1208 613
  -526 1433 -710 2225 -501 461 122 890 393 1208 764 526 613 710 1433 501 2225
  -122 461 -393 890 -764 1208 -402 345 -896 545 -1435 582 -158 11 -153 11
  -322 -1z m949 -1044 c60 -25 102 -63 130 -118 26 -51 27 -57 31 -269 l4 -218
  48 0 c96 0 180 -49 225 -132 27 -49 30 -63 33 -173 3 -69 -1 -141 -7 -171 -15
  -67 -58 -125 -116 -159 l-45 -27 20 -28 c44 -62 50 -101 50 -331 l0 -219 34
  -14 c64 -27 68 -44 64 -349 -3 -257 -4 -274 -25 -312 -25 -47 -74 -95 -123
  -121 -33 -18 -79 -19 -1050 -19 l-1015 0 -60 24 c-84 34 -192 142 -226 226
  l-24 60 -3 990 c-2 714 0 1007 8 1050 28 141 127 256 263 306 49 17 99 18 900
  19 739 0 852 -2 884 -15z"/>
  <path d="M1618 3766 c-56 -20 -85 -42 -115 -87 -35 -53 -43 -140 -18 -204 19
  -52 82 -111 134 -125 23 -6 348 -10 864 -10 l827 0 0 200 c0 187 -1 201 -20
  220 -20 20 -33 20 -827 20 -648 -1 -815 -4 -845 -14z"/>
  <path d="M3502 3013 l3 -138 27 -13 c29 -13 63 -4 80 22 4 6 8 61 8 123 0 131
  -6 143 -76 143 l-45 0 3 -137z"/>
  <path d="M2365 2905 c-341 -74 -566 -380 -501 -683 24 -115 69 -195 161 -288
  88 -89 168 -136 295 -176 82 -25 154 -27 590 -18 113 3 222 1 243 -3 l38 -8
  -8 38 c-10 49 -10 286 1 473 10 171 2 226 -51 332 -56 112 -162 213 -283 271
  -52 25 -127 52 -167 61 -86 19 -234 20 -318 1z"/>
  </g>
  </svg>
`

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
          <SvgXml xml={xml} style={styles.popupButton}/>
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
    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
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

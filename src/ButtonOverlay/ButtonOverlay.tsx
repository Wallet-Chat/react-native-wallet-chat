import React from 'react';
import { Text } from 'react-native';
import { TouchableOpacity, Image, View } from 'react-native';
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

export default function ButtonOverlay({
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
  }, [shouldRing]);

  return (
    <View
    //   className={classnames(styles.popupButton__container, {
    //     [styles['popupButton__container--open']]: isOpen,
    //   })}
    >
      {isRinging && (
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: 'gray',
          }}
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
        <Image
          alt="WalletChat"
          source={{
            uri: 'https://uploads-ssl.webflow.com/62d761bae8bf2da003f57b06/62d761bae8bf2dea68f57b52_walletchat%20logo.png',
          }}
          style={{ height: '90%' }}
        />
      </TouchableOpacity>

      {showNoti && (
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'ff477e',
            width: 7,
            height: 7,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
            }}
          >
            {notiVal}
          </Text>
        </View>
      )}
    </View>
  );
}

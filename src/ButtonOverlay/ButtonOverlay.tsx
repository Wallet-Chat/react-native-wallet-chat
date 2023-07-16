import React from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import { WalletChatContext } from '../context';
import styles from './ButtonOverlay.module.css'
import classNames from 'classnames';

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
      className={classNames(styles.popupButton__container, {
        [styles['popupButton__container--open']]: isOpen,
      })}
    >
      {isRinging && (
        <span
          className={isRinging ? styles.ring : undefined}
          style={{ boxShadow: 'none' }}
        />
      )}

      <TouchableOpacity
        className={styles.popupButton}
        onPress={(e: any) => {
          setIsRinging(false);
          if (foundNft) {
            setClickedNfts(foundNft);
          }
          clickHandler(e);
        }}
      >
        <View
          className={classNames(styles.icon, {
            [styles.activeIcon]: !isOpen,
            [styles.inactiveIcon]: isOpen,
          })}
        >
          <Image
            alt="WalletChat"
            source={{
              uri: 'https://uploads-ssl.webflow.com/62d761bae8bf2da003f57b06/62d761bae8bf2dea68f57b52_walletchat%20logo.png',
            }}
            style={{ height: '90%' }}
          />
        </View>
        <View
          className={classNames(styles.icon, {
            [styles.activeIcon]: isOpen,
            [styles.inactiveIcon]: !isOpen,
          })}
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
          <span className={classNames(styles.notif, styles.pinging)} />
          <span className={styles.notif}>{notiVal}</span>
        </>
      )}
    </View>
  );
}
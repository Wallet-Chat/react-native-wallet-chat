import { Platform, View, StyleSheet, Modal, Dimensions, DeviceEventEmitter } from 'react-native';
import React from 'react';
import type {
  API,
  AppAPI,
  ConnectedWallet,
  MessagedWallet,
  SignedMessageData,
} from '../types';
import { WalletChatContext } from '../context';
import { randomStringForEntropy } from '@stablelib/random';
import { parseNftFromUrl } from '../utils';
//import { ethers } from 'ethers';
import { WebView } from 'react-native-webview';
import { ButtonOverlay } from '../ButtonOverlay';
import { TouchableOpacity } from 'react-native';

let URL = 'https://gooddollar.walletchat.fun';

const iframeId = 'wallet-chat-widget'

function postMessage(data: API) {
  if(Platform.OS === "web"){
    if (typeof document === 'undefined') return;

    const iframeElement = document?.getElementById(iframeId) as HTMLIFrameElement;

    iframeElement?.contentWindow?.postMessage(data, '*');
  } else {
    //send postMessage to WebView url (react-native)
    //handled case by case
  }
}

export default function WalletChatWidget({
  connectedWallet,
  signedMessageData,
  requestSignature,
}: {
  connectedWallet?: ConnectedWallet;
  signedMessageData?: SignedMessageData;
  requestSignature?: boolean;
}) {
  const [url, setUrl] = React.useState(URL);

  //const previousUrlSent = React.useRef('');
  const nftInfoForContract = React.useRef<
    null | (ReturnType<typeof parseNftFromUrl> & { ownerAddress?: string })
  >(null);
  const connectedWalletRef = React.useRef(connectedWallet);
  const didSendOrigin = React.useRef(0);
  const webViewRef = React.useRef<WebView | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const iframeWidth = Math.min(screenWidth - 12, 445); // Max width of 445

  // this is used for receive message effect without triggering the effect
  const widgetOpen = React.useRef(false);

  const widgetContext = React.useContext(WalletChatContext);
  const { widgetState, setWidgetState } = widgetContext || {};
  const { ownerAddress } = widgetState || {};

  const [isOpen, setIsOpen] = React.useState(widgetOpen.current);
  const [numUnread, setNumUnread] = React.useState(0);
  const prevMessageSignature = React.useRef('');
  const [signedMessageDataLocal, setSignedMessageDataLocal] =
    React.useState<SignedMessageData>({
      signature: '',
      msgToSign: '',
      account: '',
      walletName: '',
      chainId: 1,
      provider: '',
    });

  async function trySignIn(wallet?: MessagedWallet) {
    signMessagePrompt();
    if (wallet) {
      wallet.provider = '';
    } //maybe a better way, but don't need this (and can't send this down)
    //postMessage({ target: 'sign_in', data: wallet || null });
    //console.log("connectedWallet: ", connectedWallet)
  }

  async function signMessagePrompt() {
    const signer = await connectedWallet?.provider.getSigner();
    console.log("signMessagePrompt (connectedWallet, signer, provider): ", connectedWallet, signer, connectedWallet?.provider);

    const domain = "gooddollar.walletchat.fun";
    const origin = "https://gooddollar.walletchat.fun"
    const statement =
      'You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.';

    const issuedAt = new Date().toISOString();
    const header = `${domain} wants you to sign in with your Ethereum account:`;
    const account = connectedWallet?.account;
    const uriField = `URI: ${origin}`;
    let prefix = [header, account].join('\n');
    const versionField = `Version: 1`;
    const nonce = randomStringForEntropy(96);
    const chainField = `Chain ID: ` + connectedWallet?.chainId || '1';
    const nonceField = `Nonce: ${nonce}`;
    const suffixArray = [uriField, versionField, chainField, nonceField];
    suffixArray.push(`Issued At: ${issuedAt}`);
    const suffix = suffixArray.join('\n');
    prefix = [prefix, statement].join('\n\n');
    if (statement) {
      prefix += '\n';
    }
    const messagePlainText = [prefix, suffix].join('\n');

    await signer
      .signMessage(messagePlainText)
      .then((signature: any) => {
        let localMsgData: SignedMessageData;
        localMsgData = {
          msgToSign: messagePlainText,
          signature: signature,
          walletName: connectedWallet?.walletName,
          account: connectedWallet?.account,
          chainId: connectedWallet?.chainId,
          provider: '',
        };
        setSignedMessageDataLocal(localMsgData);
        console.log('Signature Set, localMsgData: ', localMsgData);
      })
      .catch((error: any) => {
        console.error('🚨[Signature]:', error);
      });
  }

  const sendReactNativePostMessage = async () => {
    const postMessageStr = JSON.stringify({ target: 'signed_message', data: signedMessageDataLocal })
    webViewRef?.current?.injectJavaScript(`
        window.postMessage(${postMessageStr}, window.origin);
      `);
      true;
  }

  const clickHandler = () => {
    if(setWidgetState){
      setWidgetState('ownerAddress', {
        address: undefined,
        lastRequest: Date.now().toString(),
      })
    }
    setIsOpen((prev) => {
      const wasOpen = Boolean(prev);
      
      if (nftInfoForContract.current && !wasOpen) {
        postMessage({
          target: 'nft_info',
          data: { ...nftInfoForContract.current, redirect: true },
        });
      }

      nftInfoForContract.current = null;
      widgetOpen.current = !wasOpen;
      return !wasOpen;
    });
  };

  const doSignIn = React.useCallback(() => {
    if (connectedWallet && (isOpen || requestSignature)) {
      trySignIn({ ...connectedWallet, requestSignature });
    }
  }, [connectedWallet, isOpen, requestSignature]);

  React.useEffect(() => {
    doSignIn();
  }, [doSignIn]);

  React.useEffect(() => {
    console.log('ownerAddress changed: ', ownerAddress);

    if (!ownerAddress?.address) return;
    const address = ownerAddress.address;

    console.log('ownerAddress SENT POSTMESSAGE: ', ownerAddress);
    // otherwise send to regular DM page
    postMessage({ target: 'nft_info', data: { ownerAddress: address } });

    setIsOpen(true);
  }, [ownerAddress]);

  React.useEffect(() => {
    console.log('---signed_message entry ---', signedMessageData);
    if (!signedMessageData?.signature) return;
    if (signedMessageData.signature == prevMessageSignature.current) return;

    prevMessageSignature.current = signedMessageData.signature;

    console.log('---signed_message ---', signedMessageData);
    //TODO: we need a way to not send this over and over if same data
    postMessage({ target: 'signed_message', data: signedMessageData });

    //not forcing this to be open until we can prevent the previous line from happening over and over
    //setIsOpen(true)
  }, [signedMessageData]);

  React.useEffect(() => {
    console.log('---signed_message entry LOCAL ---', signedMessageDataLocal);
    if (!signedMessageDataLocal?.signature) return;

    prevMessageSignature.current = signedMessageDataLocal.signature;

    console.log('---signed_message LOCAL ---', signedMessageDataLocal);
    //TODO: we need a way to not send this over and over if same data

    if(Platform.OS === "web"){
      postMessage({ target: 'signed_message', data: signedMessageDataLocal });
    } else {
      console.log('---signed_message calling react-native postMessage from webViewRef:  ---', webViewRef)
      webViewRef?.current?.injectJavaScript(`
        window.postMessage({ target: 'signed_message', data: ${signedMessageDataLocal} }, '*');
      `);
      console.log('---signed_message after calling react-native postMessage from webViewRef:  ---')
    }

    //not forcing this to be open until we can prevent the previous line from happening over and over
    //setIsOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedMessageDataLocal]);

  const handleNavigationStateChange = (navState: any) => {
    // Check if the URL has changed
    if (navState.url !== url) {
      setUrl(navState.url);
    }
  };

  React.useEffect(() => {
    console.log('updated connectedWallet:  ', connectedWallet);
    connectedWalletRef.current = connectedWallet;
  }, [connectedWallet]);

  React.useEffect(() => {
    const handleMsg = (e: any) => {
      const data = e.data as AppAPI;

      if (didSendOrigin.current < 100) {
        postMessage({
          target: 'origin',
          data: {
            domain: "gooddollar.walletchat.fun",
            origin: "https://gooddollar.walletchat.fun",
          },
        });
        didSendOrigin.current++;
      }

      if (
        data.target === 'url_env' &&
        data.data !== URL
        // !import.meta.url.VITE_REACT_APP_APP_URL
      ) {
        //console.log("Widget Setting iFrame URL: ", data.data)
        setUrl(data.data);
      }

      if (data.target === 'unread_cnt') {
        setNumUnread(data.data);
      }

      if (data.target === 'close_widget') {
        clickHandler();
      }

      if (data.target === 'do_parent_sign_in') {
        signMessagePrompt();
      }

      if (data.target === 'goodwallet_is_awake'){
        console.log("got message : goodwallet_is_awake")
        postMessage({ target: 'nft_info', data: { ownerAddress: ownerAddress?.address } });
      }

      if (data.target === 'is_signed_in' && !data.data) {
        // if the user is not signed in, still send the data needed to enable log in
        doSignIn();
      }
    };

    if(Platform.OS === "web"){
      window.addEventListener('message', handleMsg);
  
      return () => window.removeEventListener('message', handleMsg);
    } else {
      const eventListener = DeviceEventEmitter.addListener('message', handleMsg);

      return () => eventListener.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doSignIn]);

  // const runFirst = `
  //     document.body.style.backgroundColor = 'red';
  //     setTimeout(function() { window.alert('hi') }, 2000);
  //     webViewRef?.current?.injectJavaScript(
  //       window.postMessage("KEVIN FIRST!!!!", window.origin);
  //     );
  //     true; // note: this is required, or you'll sometimes get silent failures
  //   `;
  return (
      <View
        style={{
          ...styles.widgetChatWidgetContainer,
          ...(isOpen && styles.widgetChatWidgetContainerOpen),
        }}
      >
      {Platform.OS === 'web' && isOpen && (
        <Modal
          visible={isOpen}
          transparent={true}
          animationType='slide'
          style={styles.modalContainer}
        >
          <View style={styles.modalContent} >
            <iframe
              title='WalletChat'
              name='WalletChat'
              id={iframeId}
              src={url}
              //@ts-ignore
              style={{
                ...styles.widgetChatWidget,
                ...(isOpen ? styles.widgetIsOpen : styles.widgetIsClosed),
                width: iframeWidth,
                height: "100%"
              }}
              height={560}
              width={445}
            />
          </View>
        </Modal>
      )}

      {Platform.OS != 'web' && isOpen && (
        <Modal
          visible={isOpen}
          transparent={true}
          animationType='slide'
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              source={{ uri: url }}
              id={iframeId}
              onNavigationStateChange={handleNavigationStateChange}
              style={{
                ...styles.widgetChatWidget,
                ...(isOpen ? styles.widgetIsOpen : styles.widgetIsClosed),
                width: iframeWidth,
                height: '100%',
              }}
              //injectedJavaScript={runFirst}
              onLoadEnd={sendReactNativePostMessage}
              //onMessage={(event) => {console.log("onMessage: ", event)}}
            />
          </View>
        </Modal>
      )}

      <TouchableOpacity style={{alignItems: "center", marginTop: 20, left: 15, top: 3,  borderRadius: 21, justifyContent: 'center', height: 42, width: 42 }} onPress={() => {
        console.warn("from the package")
        setIsOpen(true)
        }
        } >
        <ButtonOverlay
          notiVal={numUnread}
          showNoti={numUnread > 0}
          isOpen={isOpen}
          clickHandler={clickHandler}
        />
      </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  widgetChatWidgetContainer: {
    position: 'absolute',
    bottom: 2,
    right: 6,
    zIndex: 1000,
    // Android-specific shadow
    elevation: 4,
    // iOS-specific shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  widgetChatWidgetContainerOpen: {
    bottom: 0,
    right: 0,
  },
  widgetChatWidget: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  widgetIsOpen: {
    transform: [{ translateX: -4 }, { translateY: -2 }],
  },
  widgetIsClosed: {
    height: 0,
    width: 0,
    minHeight: 0,
    minWidth: 0,
  },
  modalContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  modalContent: {
    top: "8%",
    height: "83%",
    borderRadius: 16,
    alignSelf: "center",
    overflow: 'hidden',
  },
});

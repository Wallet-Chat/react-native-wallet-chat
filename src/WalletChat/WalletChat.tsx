import { Platform, View } from 'react-native';
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
import { ethers } from 'ethers';
import WebView from 'react-native-webview';
import ButtonOverlay from '../Button/Button';

let URL = 'https://gooddollar.walletchat.fun';

const iframeId = 'wallet-chat-widget';

function postMessage(data: API) {
  if (typeof document === 'undefined') return;

  const iframeElement = document?.getElementById(iframeId) as HTMLIFrameElement;

  iframeElement?.contentWindow?.postMessage(data, '*');
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

  const previousUrlSent = React.useRef('');
  const nftInfoForContract = React.useRef<
    null | (ReturnType<typeof parseNftFromUrl> & { ownerAddress?: string })
  >(null);
  const connectedWalletRef = React.useRef(connectedWallet);
  const didSendOrigin = React.useRef(0);

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
    if (wallet) {
      wallet.provider = '';
    } //maybe a better way, but don't need this (and can't send this down)
    postMessage({ target: 'sign_in', data: wallet || null });
    //console.log("connectedWallet: ", connectedWallet)
  }

  async function signMessagePrompt() {
    const ethersProvider = new ethers.providers.Web3Provider(
      connectedWallet?.provider
    );
    const signer = await ethersProvider.getSigner();
    console.log('signMessagePrompt: ', connectedWallet, signer);

    const domain = window.location.host;
    const origin = window.location.protocol + '//' + domain;
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

    signer
      .signMessage(messagePlainText)
      .then((signature) => {
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
      .catch((error) => {
        console.error('🚨[Signature]:', error);
      });
  }

  const clickHandler = () => {
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
    if (!ownerAddress?.address) return;
    const address = ownerAddress.address;

    const nftInfo = parseNftFromUrl(window.location.href);
    if (nftInfo.network) {
      nftInfoForContract.current = {
        ...nftInfo,
        ownerAddress: address,
      };
    }

    // if was able to retrieve the NFT info for the page -- send to that DM page
    if (nftInfoForContract.current) {
      postMessage({
        target: 'nft_info',
        data: { ...nftInfoForContract.current, redirect: true },
      });
    } else {
      // otherwise send to regular DM page
      postMessage({ target: 'nft_info', data: { ownerAddress: address } });
    }

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
    console.log('---signed_message entry LOCAL ---', signedMessageData);
    if (!signedMessageDataLocal?.signature) return;

    prevMessageSignature.current = signedMessageDataLocal.signature;

    console.log('---signed_message LOCAL ---', signedMessageData);
    //TODO: we need a way to not send this over and over if same data
    postMessage({ target: 'signed_message', data: signedMessageDataLocal });

    //not forcing this to be open until we can prevent the previous line from happening over and over
    //setIsOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedMessageDataLocal]);

  React.useEffect(() => {
    const sendContractInfo = () => {
      if (window.location.href === previousUrlSent.current) return;

      previousUrlSent.current = window.location.href;

      const nftInfo = parseNftFromUrl(window.location.href);

      if (setWidgetState) setWidgetState('foundNft', JSON.stringify(nftInfo));

      if (nftInfo.network) {
        nftInfoForContract.current = nftInfo;
      }

      postMessage({ target: 'nft_info', data: nftInfo });
    };

    const observer = new MutationObserver(sendContractInfo);
    const config = { subtree: true, childList: true };

    sendContractInfo();

    observer.observe(document, config);
    return () => observer.disconnect();
  }, [setWidgetState]);

  React.useEffect(() => {
    connectedWalletRef.current = connectedWallet;
  }, [connectedWallet]);

  React.useEffect(() => {
    const handleMsg = (e: any) => {
      const data = e.data as AppAPI;

      if (didSendOrigin.current < 100) {
        postMessage({
          target: 'origin',
          data: {
            domain: window.location.host,
            origin: window.location.protocol + window.location.host,
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

      if (data.target === 'is_signed_in' && !data.data) {
        // if the user is not signed in, still send the data needed to enable log in
        doSignIn();
      }
    };

    window.addEventListener('message', handleMsg);

    return () => window.removeEventListener('message', handleMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doSignIn]);

  return (
    <View>
      {Platform.OS === "web" && isOpen && (
        <iframe src={url} height={'100%'} width={'100%'} />
      )}
      
      {Platform.OS !== "web" && isOpen && (
        <WebView id={iframeId} source={{ uri: url }} style={{ flex: 1 }} />
      )}
    
      <ButtonOverlay
        notiVal={numUnread}
        showNoti={numUnread > 0}
        isOpen={isOpen}
        clickHandler={clickHandler}
      />
    </View>
  );
}
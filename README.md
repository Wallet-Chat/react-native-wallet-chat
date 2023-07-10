# react-native-wallet-chat

Wallet Chat React Native Component Library

## Installation

```sh
npm install react-native-wallet-chat
```

## Usage

Add in your App.js 

```js
import WalletChatProvider from 'react-native-wallet-chat';

// ...

export const App = () => {
  return (
      <WalletChatProvider />
  )
}
```
Add in any component

```js
import WalletChatWidget from 'react-native-wallet-chat';

// ...
export const DashBoard = () => {
  return (
      <WalletChatWidget
            connectedWallet={
              address && activeConnector && chainId
                ? {
                    walletName: activeConnector?.name,
                    account: address,
                    chainId: chainId,
                    provider: provider
                  }
                : undefined
            }
      />
  )
}
```
## PS:

Package still under active development

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

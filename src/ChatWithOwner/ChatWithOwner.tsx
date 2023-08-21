import React from 'react'
import { WalletChatContext } from '../context'
import { Text } from 'react-native'

const ButtonWrapper = ({
  onPress,
  children,
}: {
  onPress: () => void
  children: any
}) => (
  <button type='button' onClick={onPress}>
    {children}
  </button>
)

const ChatWithOwner = ({
  ownerAddress,
  render,
}: {
  ownerAddress: string
  render: undefined | React.ReactElement
}) => {
  const wcContext = React.useContext(WalletChatContext)
  const setWidgetState = wcContext?.setWidgetState

  const WrapperEl = render
    ? ({ onPress, children }: { onPress: () => void; children: any }) =>
        React.cloneElement(render, { onPress }, children)
    : ButtonWrapper

  if (!wcContext) {
    console.error(
      'WalletChat: ChatWithOwner component must be rendered within a WalletChatProvider'
    )
    return null
  }

  return (
    <WrapperEl
      onPress={() =>
        setWidgetState &&
        setWidgetState('ownerAddress', {
          address: ownerAddress,
          lastRequest: Date.now().toString(),
        })
      }
    >
      {!render && (
        <>
          <div
            style={{
              backgroundImage:
                'url(https://uploads-ssl.webflow.com/62d761bae8bf2da003f57b06/62d761bae8bf2dea68f57b52_walletchat%20logo.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              width: '25px',
              height: '25px',
            }}
          />
          <Text>Chat With Owner</Text>
        </>
      )}
    </WrapperEl>
  )
}

export default ChatWithOwner
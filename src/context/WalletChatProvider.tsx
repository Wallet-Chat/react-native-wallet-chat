import React from 'react';
import {
  WalletChatContext,
  type WidgetState,
  type WidgetStateSetter,
} from './WalletChatContext';

export function WalletChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [widgetState, setWidgetState] = React.useState<
    undefined | WidgetState
  >();

  const widgetStateSetter: WidgetStateSetter = React.useCallback(
    (key, value) =>
      setWidgetState((prevState) => ({ ...(prevState || {}), [key]: value })),
    []
  );

  const providerValue = React.useMemo(
    () => ({
      widgetState: widgetState || null,
      setWidgetState: widgetStateSetter,
    }),
    [widgetState, widgetStateSetter]
  );

  return (
      <WalletChatContext.Provider value={providerValue}>
          {children}
      </WalletChatContext.Provider>
  );
}

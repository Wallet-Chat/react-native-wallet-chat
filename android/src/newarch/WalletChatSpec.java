package com.walletchat;

import com.facebook.react.bridge.ReactApplicationContext;

abstract class WalletChatSpec extends NativeWalletChatSpec {
  WalletChatSpec(ReactApplicationContext context) {
    super(context);
  }
}

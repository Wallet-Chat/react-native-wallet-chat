#ifdef __cplusplus
#import "react-native-wallet-chat.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNWalletChatSpec.h"

@interface WalletChat : NSObject <NativeWalletChatSpec>
#else
#import <React/RCTBridgeModule.h>

@interface WalletChat : NSObject <RCTBridgeModule>
#endif

@end

#include <jni.h>
#include "react-native-wallet-chat.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_walletchat_WalletChatModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return walletchat::multiply(a, b);
}

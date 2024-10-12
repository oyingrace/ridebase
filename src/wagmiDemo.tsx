
polyfillForWagmi();

import { useMemo } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Section from "./components/section";
import {
  createConnectorFromWallet,
  Wallets,
} from "@mobile-wallet-protocol/wagmi-connectors";
import * as Linking from "expo-linking";
import {
  http,
  createConfig,
  useAccount,
  useConnect,
  useSignMessage,
  useDisconnect,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useCapabilities } from "wagmi/experimental";
import { useNavigation } from "@react-navigation/native";


const PREFIX_URL = Linking.createURL("/");

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    createConnectorFromWallet({
      metadata: {
        appName: "RideBase",
        appDeeplinkUrl: PREFIX_URL,
      },
      wallet: Wallets.CoinbaseSmartWallet,
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

type WagmiDemoProps = {
  setBookingSuccess: (success: boolean) => void;
};

export default function WagmiDemo( { setBookingSuccess }: WagmiDemoProps) {
  const insets = useSafeAreaInsets();
  const { address } = useAccount();

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    data: signMessageHash,
    error: signMessageError,
    signMessage,
    reset,
  } = useSignMessage();

  const { data: capabilities, error: capabilitiesError } = useCapabilities();
  const navigation = useNavigation(); 

  const handleSignMessage = async () => {
    try {
      await signMessage({ message: "Book ride" });
      // Set booking success to true when sign message is successful
      setBookingSuccess(true); // Pass success to parent (PaymentScreen or Home)
    } catch (error) {
      console.error("Sign message failed", error);
    }
  };

  
  

  return (
    <ScrollView>
      <Section
        key={`connect`}
        title=""
        buttonLabel={address ? "Book Ride" : "Connect"}
        onPress={() => {
          if (!address) {
            connect({ connector: connectors[0] });
          } else {
            
            handleSignMessage();
          }
        }}
      />

{address && (
        <>
          <Section
            key="useDisconnect"
            title=""
            buttonLabel="Disconnect"
            onPress={() => {
              disconnect({ connector: connectors[0] });
            }}
          />

      
        </>
      )}
     
    </ScrollView>
  );
}


function polyfillForWagmi() {
  const noop = (() => {}) as any;

  window.addEventListener = noop;
  window.dispatchEvent = noop;
  window.removeEventListener = noop;
  window.CustomEvent = function CustomEvent() {
    return {};
  } as any;
}



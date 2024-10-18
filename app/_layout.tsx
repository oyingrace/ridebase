import { LinkingOptions} from '@react-navigation/native';
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { LogBox } from "react-native";
import "@/src/polyfill";

import { tokenCache } from "@/lib/auth";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { handleResponse } from "@mobile-wallet-protocol/client";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WagmiDemo, { config } from "@/src/wagmiDemo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const publishableKey = "process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY";

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env",
  );
}

LogBox.ignoreLogs([
  "Clerk:", 
  "MapViewDirections Error", 
  "No route data found from driver to user",
  "No route data found from user to destination",
  "openrouteservice",
  "Error storing ride details:",
  "Error fetching location data"
]);

export default function RootLayout() {
  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    // Check if the app has finished loading
    if (loaded) {
      SplashScreen.hideAsync();
    }
  
    // Set up the deep link listener
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("incoming deeplink:", url);
      try {
        handleResponse(url);
      } catch (err) {
        console.error(err);
      }
    });
  
    // Cleanup the subscription when the component unmounts
    return () => subscription.remove();
  }, [loaded]); // Depend on 'loaded' to handle the splash screen logic
  

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}> 
            <ClerkLoaded>
            <SafeAreaProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(root)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              </SafeAreaProvider>
              </ClerkLoaded>
         </QueryClientProvider>
        </WagmiProvider> 
    </ClerkProvider>
  
  );
}

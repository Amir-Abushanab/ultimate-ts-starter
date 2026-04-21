import "@/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { initAnalytics } from "@/lib/analytics";
import { queryClient } from "@/utils/orpc";

initAnalytics();

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

const StackLayout = () => (
  <Stack screenOptions={{}}>
    <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    <Stack.Screen
      name="modal"
      options={{ presentation: "modal", title: "Modal" }}
    />
  </Stack>
);

const Layout = () => (
  <QueryClientProvider client={queryClient}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HeroUINativeProvider>
            <StackLayout />
          </HeroUINativeProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  </QueryClientProvider>
);

export default Layout;

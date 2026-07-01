import { Icon } from "@expo/ui";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Card, Chip, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AppBottomSheet } from "@/components/app-bottom-sheet";
import { AppButton } from "@/components/app-button";
import { AppCard } from "@/components/app-card";
import { AppCheckbox } from "@/components/app-checkbox";
import { AppCollapsible } from "@/components/app-collapsible";
import { AppFieldGroup } from "@/components/app-field-group";
import { AppIcon } from "@/components/app-icon";
import { AppList } from "@/components/app-list";
import { AppListItem } from "@/components/app-list-item";
import { AppPicker } from "@/components/app-picker";
import { AppRow } from "@/components/app-row";
import { AppScrollView } from "@/components/app-scroll-view";
import { AppSlider } from "@/components/app-slider";
import { AppSpacer } from "@/components/app-spacer";
import { AppSwitch } from "@/components/app-switch";
import { AppText } from "@/components/app-text";
import { AppTextField } from "@/components/app-text-field";
import { AuthForm } from "@/components/auth-form";
import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

const PLAN_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Team", value: "team" },
] as const;

type Plan = (typeof PLAN_OPTIONS)[number]["value"];

// Cross-platform icon names. The literal `Icon.select` call is what the Expo
// Babel plugin rewrites into a per-platform require, so it lives at the call
// site (here) rather than behind an <AppIcon> re-export.
const STAR_ICON = Icon.select({
  android: import("@expo/material-symbols/star.xml"),
  ios: "star.fill",
});

const BOLT_ICON = Icon.select({
  android: import("@expo/material-symbols/bolt.xml"),
  ios: "bolt.fill",
});

const PERSON_ICON = Icon.select({
  android: import("@expo/material-symbols/person.xml"),
  ios: "person.fill",
});

const NativeShowcase = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  return (
    <>
      <View className="mt-6">
        <AppCard>
          <AppText variant="title">Native Layout (@expo/ui)</AppText>
          <AppRow alignment="center">
            <AppIcon name={STAR_ICON} />
            <AppText>Starter</AppText>
            <AppSpacer flexible />
            <AppText variant="muted">v1</AppText>
          </AppRow>
          <AppCollapsible
            isOpen={detailsOpen}
            label="Details"
            onOpenChange={setDetailsOpen}
          >
            <AppText variant="muted">
              Collapsible content rendered natively by @expo/ui.
            </AppText>
          </AppCollapsible>
          <AppScrollView direction="horizontal">
            <AppRow spacing={8}>
              <AppText variant="muted">iOS</AppText>
              <AppText variant="muted">Android</AppText>
              <AppText variant="muted">Web</AppText>
            </AppRow>
          </AppScrollView>
          <AppButton
            label="Open sheet"
            onPress={() => {
              setSheetOpen(true);
            }}
            variant="secondary"
          />
          <AppBottomSheet
            isPresented={sheetOpen}
            snapPoints={["half"]}
            onDismiss={() => {
              setSheetOpen(false);
            }}
          >
            <AppText variant="title">Bottom sheet</AppText>
            <AppText variant="muted">
              A native modal presented by @expo/ui.
            </AppText>
            <AppButton
              label="Close"
              onPress={() => {
                setSheetOpen(false);
              }}
              variant="primary"
            />
          </AppBottomSheet>
        </AppCard>
      </View>

      <View className="mt-6">
        <AppCard>
          <AppText variant="title">Native List (@expo/ui)</AppText>
          <AppList>
            <AppListItem
              leading={<AppIcon name={STAR_ICON} />}
              supportingText="Tap to rate"
            >
              <AppText>Favorites</AppText>
            </AppListItem>
            <AppListItem
              leading={<AppIcon name={BOLT_ICON} />}
              supportingText="Fast refresh"
            >
              <AppText>Performance</AppText>
            </AppListItem>
            <AppListItem
              leading={<AppIcon name={PERSON_ICON} />}
              supportingText="Manage account"
            >
              <AppText>Account</AppText>
            </AppListItem>
          </AppList>
          <AppFieldGroup
            sections={[
              {
                children: (
                  <AppRow alignment="center">
                    <AppText>Notifications</AppText>
                    <AppSpacer flexible />
                    <AppSwitch
                      value={pushEnabled}
                      onValueChange={setPushEnabled}
                    />
                  </AppRow>
                ),
                key: "prefs",
                title: "Preferences",
              },
            ]}
          />
        </AppCard>
      </View>
    </>
  );
};

const Home = () => {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const privateData = useQuery(orpc.privateData.queryOptions());
  const isConnected = healthCheck?.data === "OK";
  const isLoading = healthCheck?.isLoading;
  const { data: session } = authClient.useSession();
  const [typed, setTyped] = useState("");
  const [notify, setNotify] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [plan, setPlan] = useState<Plan>("free");

  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");
  const _foregroundColor = useThemeColor("foreground");

  const tap = () => {
    void Haptics.selectionAsync();
  };

  return (
    <Container className="p-6">
      <View className="py-4 mb-6">
        <Text className="text-4xl font-bold text-foreground mb-2">
          ULTIMATE TS STARTER
        </Text>
      </View>

      {session?.user ? (
        <Card variant="secondary" className="mb-6 p-4">
          <Text className="text-foreground text-base mb-2">
            Welcome, <Text className="font-medium">{session.user.name}</Text>
          </Text>
          <Text className="text-muted text-sm mb-4">{session.user.email}</Text>
          <Pressable
            className="bg-danger py-3 px-4 rounded-lg self-start active:opacity-70"
            onPress={() => {
              void authClient.signOut();
              void queryClient.invalidateQueries();
            }}
          >
            <Text className="text-foreground font-medium">Sign Out</Text>
          </Pressable>
        </Card>
      ) : null}

      <Card variant="secondary" className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Card.Title>System Status</Card.Title>
          <Chip
            variant="secondary"
            color={isConnected ? "success" : "danger"}
            size="sm"
          >
            <Chip.Label>{isConnected ? "LIVE" : "OFFLINE"}</Chip.Label>
          </Chip>
        </View>

        <Card className="p-4">
          <View className="flex-row items-center">
            <View
              className={`w-3 h-3 rounded-full mr-3 ${isConnected ? "bg-success" : "bg-muted"}`}
            />
            <View className="flex-1">
              <Text className="text-foreground font-medium mb-1">
                ORPC Backend
              </Text>
              <Card.Description>
                {isLoading && "Checking connection..."}
                {!isLoading &&
                  (isConnected ? "Connected to API" : "API Disconnected")}
              </Card.Description>
            </View>
            {isLoading && (
              <Ionicons name="hourglass-outline" size={20} color={mutedColor} />
            )}
            {!isLoading && isConnected && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={successColor}
              />
            )}
            {!isLoading && !isConnected && (
              <Ionicons name="close-circle" size={20} color={dangerColor} />
            )}
          </View>
        </Card>
      </Card>

      <Card variant="secondary" className="mt-6 p-4">
        <Card.Title className="mb-3">Private Data</Card.Title>
        <Card.Description>{privateData.data?.message}</Card.Description>
      </Card>

      <View className="mt-6">
        <AppCard>
          <AppText variant="title">Native UI (@expo/ui)</AppText>
          <AppButton label="Primary" onPress={tap} variant="primary" />
          <AppButton label="Secondary" onPress={tap} variant="secondary" />
          <AppButton label="Destructive" onPress={tap} variant="destructive" />
          <AppTextField
            placeholder="Native text field…"
            onChangeText={setTyped}
          />
          {typed.length > 0 ? (
            <AppText variant="muted">{`You typed: ${typed}`}</AppText>
          ) : null}
        </AppCard>
      </View>

      <View className="mt-6">
        <AppCard>
          <AppText variant="title">Native Controls (@expo/ui)</AppText>
          <AppSwitch
            label="Notifications"
            value={notify}
            onValueChange={setNotify}
          />
          <AppCheckbox
            label="Accept terms"
            value={accepted}
            onValueChange={setAccepted}
          />
          <AppText variant="muted">{`Volume: ${volume}`}</AppText>
          <AppSlider
            max={100}
            min={0}
            step={1}
            value={volume}
            onValueChange={setVolume}
          />
          <AppPicker
            options={PLAN_OPTIONS}
            selectedValue={plan}
            onValueChange={setPlan}
          />
          <AppText variant="muted">{`Plan: ${plan}`}</AppText>
        </AppCard>
      </View>

      <NativeShowcase />

      {!session?.user && <AuthForm />}
    </Container>
  );
};

export default Home;

import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  Platform,
  Alert,
  Clipboard,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from 'expo-constants';

type NotificationData = {
  title?: string;
  body?: string;
  data?: Record<string, any>;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token;

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    
    // if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for push notifications!");
        return;
      }

      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Expo Push Token:", token);
    // } else {
    //   Alert.alert("Must use a physical device for push notifications.");
    // }

    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    Alert.alert("Error registering token", error);
  }
}

async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title || "Test Notification",
    body: body || "This is a test notification!",
    data: { additionalData: "Some data here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<NotificationData | null>(
    null
  );
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification({
          title: notification.request.content.title || "",
          body: notification.request.content.body || "",
          data: notification.request.content.data || "",
        });
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const notificationHandler = async () => {
    if (expoPushToken) {
      await sendPushNotification(expoPushToken, title, body);
    } else {
      Alert.alert("Push token not available!");
    }
  };

  const copyToClipboard = () => {
    if (expoPushToken) {
      Clipboard.setString(expoPushToken);
      Alert.alert("Copied to clipboard", expoPushToken);
    } else {
      Alert.alert("No token available to copy");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.token}>
        <Text>Your Expo Push Token (press to copy):</Text>

        <TouchableOpacity
          onPress={copyToClipboard}
          style={styles.tokenContainer}
        >
          <Text style={styles.tokenText}>
            {expoPushToken || "Token not available"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter Notification Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Enter Notification Body"
          value={body}
          onChangeText={setBody}
          style={styles.input}
        />
      </View>

      <View style={styles.notificationContainer}>
        <Text>Notification Title: {notification?.title}</Text>
        <Text>Notification Body: {notification?.body}</Text>
        {/* <Text>
          Notification Data:{" "}
          {notification
            ? JSON.stringify(notification.data)
            : "No notification data"}
        </Text> */}
      </View>

      <Button title="Send Test Notification" onPress={notificationHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    gap: 30,
  },
  token: {
    gap: 10,
  },
  tokenContainer: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  tokenText: {
    fontSize: 12,
    color: "black",
  },
  inputContainer: {
    gap: 10,
    width: "90%",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "80%",
    padding: 8,
    marginBottom: 10,
  },
  notificationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
});

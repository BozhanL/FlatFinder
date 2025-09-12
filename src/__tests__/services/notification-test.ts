import {
  backgroundEvent,
  deregisterToken,
  foregroundEvent,
  NO_PUSH_PATH,
  onMessageReceived,
} from "@/services/notification";
import notifee, { AndroidCategory, EventType } from "@notifee/react-native";
import { deleteDoc, doc } from "@react-native-firebase/firestore";
import { router, useNavigationContainerRef } from "expo-router";

jest.mock("@react-native-firebase/firestore", () => {
  const orig = jest.requireActual("@react-native-firebase/firestore");
  return {
    ...orig,
    doc: jest.fn((...args) => {
      return { id: "jestDocId", ...args };
    }),
    getDoc: jest.fn(),
    getFirestore: jest.fn(() => {
      return "db";
    }),
    collection: jest.fn((...args) => {
      return { id: "jestCollectionId", ...args };
    }),
    serverTimestamp: jest.fn(() => {
      return orig.Timestamp.fromMillis(0);
    }),
    deleteDoc: jest.fn(),
  };
});

jest.mock("@react-native-firebase/messaging", () => {
  const orig = jest.requireActual("@react-native-firebase/messaging");
  return {
    ...orig,
    getMessaging: jest.fn(() => "getMessaging"),
    getToken: jest.fn(() => "getToken"),
  };
});

jest.mock("expo-router", () => {
  const orig = jest.requireActual("expo-router");
  return {
    ...orig,
    router: {},
    useNavigationContainerRef: jest.fn(),
  };
});

describe("@/services/message.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Test deregisterToken()", async () => {
    await deregisterToken();

    expect(doc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledWith("db", "notifications", "getToken");
    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(deleteDoc).toHaveBeenCalledWith(
      doc("db", "notifications", "getToken"),
    );
  });

  test("Test onMessageReceived()", async () => {
    const data = {
      notifee:
        '{"title":"New Match","body":"You have a new match!","android":{"channelId":"messages","category":"msg","pressAction":{"id":"default","launchActivity":"default"}}}',
    };
    const me = {
      from: "245824951682",
      messageId: "0:1757645156537126%b6208b6cf9fd7ecd",
      originalPriority: 2,
      priority: 2,
      sentTime: 1757645156528,
      ttl: 2419200,
      fcmOptions: {},
    };

    // Test with currentPathname in NO_PUSH_PATH
    await onMessageReceived(me, NO_PUSH_PATH[0]);
    expect(notifee.displayNotification).toHaveBeenCalledTimes(0);
    (notifee.displayNotification as jest.Mock).mockClear();

    // Test with currentPathname not in NO_PUSH_PATH but no notifee data
    await onMessageReceived(me, "/");
    expect(notifee.displayNotification).toHaveBeenCalledTimes(0);
    (notifee.displayNotification as jest.Mock).mockClear();

    // Test with currentPathname not in NO_PUSH_PATH with notifee data
    await onMessageReceived({ ...me, data }, "/");
    expect(notifee.displayNotification).toHaveBeenCalledTimes(1);
    (notifee.displayNotification as jest.Mock).mockClear();

    // Test without currentPathname not in NO_PUSH_PATH with notifee data
    await onMessageReceived({ ...me, data });
    expect(notifee.displayNotification).toHaveBeenCalledTimes(1);
    (notifee.displayNotification as jest.Mock).mockClear();
  });

  test("Test foregroundEvent()", async () => {
    const push = jest.fn();
    router.push = push;

    const detail = {
      notification: {
        android: {
          asForegroundService: false,
          autoCancel: true,
          badgeIconType: 2,
          category: AndroidCategory.MESSAGE,
          channelId: "messages",
          chronometerDirection: "up" as "up",
          circularLargeIcon: false,
          colorized: false,
          defaults: [-1],
          groupAlertBehavior: 0,
          groupSummary: false,
          importance: 3,
          lightUpScreen: false,
          localOnly: false,
          loopSound: false,
          ongoing: false,
          onlyAlertOnce: false,
          pressAction: { id: "default", launchActivity: "default" },
          showChronometer: false,
          showTimestamp: false,
          smallIcon: "ic_launcher",
          visibility: 0,
        },
        body: "You have a new match!",
        data: {},
        id: "GgHGzcfTgV70md8tjV2R",
        title: "New Match",
      },
    };

    // Test EventType other than PRESS
    foregroundEvent({ type: EventType.DELIVERED, detail });
    expect(push).toHaveBeenCalledTimes(0);
    push.mockClear();

    // Test PRESS EventType
    foregroundEvent({ type: EventType.PRESS, detail });
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/message");
    push.mockClear();

    // Test with gid, gname, uid in data
    detail.notification.data = { gid: "gid", gname: "gname", uid: "uid" };
    foregroundEvent({ type: EventType.PRESS, detail });
    expect(push).toHaveBeenCalledTimes(2);
    expect(push).toHaveBeenCalledWith("/message");
    expect(push).toHaveBeenCalledWith({
      pathname: "/chat",
      params: { gid: "gid", uid: "uid", gname: "gname" },
    });
    push.mockClear();
  });

  test("Test backgroundEvent()", async () => {
    const isReady = jest.fn(() => true);
    (useNavigationContainerRef as jest.Mock).mockImplementation(() => {
      return { isReady };
    });

    const push = jest.fn();
    router.push = push;

    const detail = {
      notification: {
        android: {
          asForegroundService: false,
          autoCancel: true,
          badgeIconType: 2,
          category: AndroidCategory.MESSAGE,
          channelId: "messages",
          chronometerDirection: "up" as "up",
          circularLargeIcon: false,
          colorized: false,
          defaults: [-1],
          groupAlertBehavior: 0,
          groupSummary: false,
          importance: 3,
          lightUpScreen: false,
          localOnly: false,
          loopSound: false,
          ongoing: false,
          onlyAlertOnce: false,
          pressAction: { id: "default", launchActivity: "default" },
          showChronometer: false,
          showTimestamp: false,
          smallIcon: "ic_launcher",
          visibility: 0,
        },
        body: "You have a new match!",
        data: {},
        id: "GgHGzcfTgV70md8tjV2R",
        title: "New Match",
      },
    };

    // Test EventType other than PRESS
    await backgroundEvent({ type: EventType.DELIVERED, detail });
    expect(push).toHaveBeenCalledTimes(0);
    push.mockClear();

    // Test PRESS EventType
    await backgroundEvent({ type: EventType.PRESS, detail });
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/message");
    push.mockClear();

    // Test with gid, gname, uid in data
    detail.notification.data = { gid: "gid", gname: "gname", uid: "uid" };
    await backgroundEvent({ type: EventType.PRESS, detail });
    expect(push).toHaveBeenCalledTimes(2);
    expect(push).toHaveBeenCalledWith("/message");
    expect(push).toHaveBeenCalledWith({
      pathname: "/chat",
      params: { gid: "gid", uid: "uid", gname: "gname" },
    });
    push.mockClear();

    // Test when ref.isReady() is false
    isReady.mockImplementation(() => false);
    await backgroundEvent({ type: EventType.DELIVERED, detail });
    expect(push).toHaveBeenCalledTimes(0);
    push.mockClear();
  });
});

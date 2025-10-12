import {
  createGroup,
  markMessagesAsReceived,
  sendMessage,
} from "@/services/message";
import {
  doc,
  getFirestore,
  runTransaction,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";

jest.mock("@react-native-firebase/firestore", () => {
  const orig = jest.requireActual("@react-native-firebase/firestore");
  return {
    ...orig,
    doc: jest.fn((...args) => {
      return { id: "jestDocId", args };
    }),
    getDoc: jest.fn(),
    getFirestore: jest.fn(() => {
      return "db";
    }),
    collection: jest.fn((...args) => {
      return { id: "jestCollectionId", args };
    }),
    serverTimestamp: jest.fn(() => {
      return orig.Timestamp.fromMillis(0);
    }),
    runTransaction: jest.fn(),
    updateDoc: jest.fn(),
  };
});

describe("@/services/message.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Test createGroup", async () => {
    const set = jest.fn();
    (runTransaction as jest.Mock).mockImplementationOnce(
      (_db, updateFunction) => {
        const mockTransaction = {
          set: set,
        };
        return updateFunction(mockTransaction);
      },
    );

    const docs = await createGroup(["uid1", "uid2"]);

    expect(docs).toBe("jestDocId");
    expect(getFirestore).toHaveBeenCalled();
    expect(doc).toHaveBeenCalledWith({
      args: ["db", "groups"],
      id: "jestCollectionId",
    });
    expect(set).toHaveBeenCalledWith(
      (doc as jest.Mock).mock.results[0]?.value,
      {
        id: "jestDocId",
        lastSender: null,
        lastTimestamp: Timestamp.fromMillis(0),
        members: ["uid1", "uid2"],
        name: null,
        lastMessage: null,
        lastNotified: Timestamp.fromMillis(0),
      },
    );
  });

  test("Test sendMessage", async () => {
    const set = jest.fn();
    const update = jest.fn();
    (runTransaction as jest.Mock).mockImplementationOnce(
      (_db, updateFunction) => {
        const mockTransaction = {
          set: set,
          update: update,
        };
        return updateFunction(mockTransaction);
      },
    );

    await sendMessage(
      {
        text: "test",
        user: { _id: "uid" },
        _id: "mid",
        createdAt: 0,
      },
      "gid",
    );

    expect(getFirestore).toHaveBeenCalled();
    expect(doc).toHaveBeenCalledWith({
      args: ["db", "messages", "gid", "messages"],
      id: "jestCollectionId",
    });
    expect(set).toHaveBeenCalledWith(
      (doc as jest.Mock).mock.results[1]?.value,
      {
        id: "jestDocId",
        message: "test",
        sender: "uid",
        received: null,
        timestamp: Timestamp.fromMillis(0),
      },
    );
  });

  test("Test markMessagesAsReceived", async () => {
    await markMessagesAsReceived("gid", "mid");

    expect(getFirestore).toHaveBeenCalled();
    expect(doc).toHaveBeenCalledWith(
      "db",
      "messages",
      "gid",
      "messages",
      "mid",
    );
    expect(updateDoc).toHaveBeenCalledWith(
      (doc as jest.Mock).mock.results[0]?.value,
      { received: Timestamp.fromMillis(0) },
    );
  });
});

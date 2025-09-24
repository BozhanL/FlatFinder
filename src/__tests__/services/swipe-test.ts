// @ts-nocheck
// IMPROVE: Enable ts check @G2CCC
// Mock dependencies BEFORE importing the SUT
// Import SUT after mocks
import * as swipeSvc from "@/services/swipe";
import { pickAvatarFor } from "@/utils/avatar";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "@react-native-firebase/firestore";

jest.mock("@react-native-firebase/app", () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock("@react-native-firebase/firestore", () => {
  // Create stable function refs so we can assert on them later
  const getFirestore = jest.fn(() => ({}));
  const collection = jest.fn(() => ({ __type: "collection" }));
  const doc = jest.fn(() => ({ __type: "doc", path: "mock/doc/path" }));

  const where = jest.fn((...args) => ({ __type: "where", args }));
  const orderBy = jest.fn((...args) => ({ __type: "orderBy", args }));
  const limit = jest.fn((n) => ({ __type: "limit", n }));

  const query = jest.fn((...parts) => ({ __type: "query", parts }));

  const getDocs = jest.fn(async (_q) => ({ docs: [] }));
  const getDoc = jest.fn(async (_ref) => ({ exists: () => false }));
  const setDoc = jest.fn(async () => {});
  const serverTimestamp = jest.fn(() => ({ __server_ts: true }));

  return {
    getFirestore,
    collection,
    doc,
    where,
    orderBy,
    limit,
    query,
    getDocs,
    getDoc,
    setDoc,
    serverTimestamp,
    // types export is irrelevant for tests; keep minimal
    FirebaseFirestoreTypes: {},
  };
});

jest.mock("@/utils/avatar", () => ({
  pickAvatarFor: jest.fn((id: string) => ({ uri: `mock-avatar://${id}` })),
}));

jest.mock("@/services/message", () => ({
  createGroup: jest.fn(async () => {}),
}));

const collectionMock = collection as jest.Mock;
const docMock = doc as jest.Mock;
const whereMock = where as jest.Mock;
const orderByMock = orderBy as jest.Mock;
const limitMock = limit as jest.Mock;
const queryMock = query as jest.Mock;
const getDocsMock = getDocs as jest.Mock;
const setDocMock = setDoc as jest.Mock;
const serverTimestampMock = serverTimestamp as jest.Mock;
const pickAvatarForMock = pickAvatarFor as jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
});

describe("fetchSwipedSet", () => {
  it("queries swipes subcollection and returns a Set of ids", async () => {
    // Arrange: fake docs
    getDocsMock.mockResolvedValueOnce({
      docs: [{ id: "u2" }, { id: "u3" }],
    });

    // Act
    const set = await swipeSvc.fetchSwipedSet("me");

    // Assert
    expect(collectionMock).toHaveBeenCalledWith(
      expect.anything(),
      "users",
      "me",
      "swipes",
    );
    // called with orderBy('createdAt','desc') and limit(500)
    expect(orderByMock).toHaveBeenCalledWith("createdAt", "desc");
    expect(limitMock).toHaveBeenCalledWith(500);
    expect(queryMock).toHaveBeenCalled();

    expect(set).toBeInstanceOf(Set);
    expect(set.has("u2")).toBe(true);
    expect(set.has("u3")).toBe(true);
  });
});

describe("loadCandidates", () => {
  it("builds constraints (area + budget), sorts and limits, filters self & swiped", async () => {
    getDocsMock
      .mockResolvedValueOnce({
        docs: [{ id: "u_swiped" }],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: "me",
            data: () => ({
              name: "Self",
              age: 99,
              budget: 100,
              location: "CBD",
              tags: ["x"],
            }),
          },
          {
            id: "u_swiped",
            data: () => ({
              name: "Old",
              budget: 150,
              location: "CBD",
              tags: [],
            }),
          },
          {
            id: "u_ok1",
            data: () => ({
              name: "Ok1",
              age: 21,
              budget: 300,
              location: "CBD",
              tags: ["cat"],
            }),
          },
          {
            id: "u_ok2",
            data: () => ({
              name: "Ok2",
              budget: 200,
              location: "CBD",
              tags: [],
              avatarUrl: "https://cdn/ava.png",
            }),
          },
        ],
      });

    const res = await swipeSvc.loadCandidates("me", {
      area: "CBD",
      maxBudget: 500,
      limit: 30,
    });

    // Constraints built
    expect(whereMock).toHaveBeenCalledWith("location", "==", "CBD");
    expect(whereMock).toHaveBeenCalledWith("budget", "<=", 500);
    expect(orderByMock).toHaveBeenCalledWith("budget", "asc");
    expect(orderByMock).toHaveBeenCalledWith("lastActiveAt", "desc");
    expect(limitMock).toHaveBeenCalledWith(30);
    expect(queryMock).toHaveBeenCalled();

    // Filtered items
    const ids = res.map((x) => x.id);
    expect(ids).toEqual(["u_ok1", "u_ok2"]);

    // Avatar fallback for u_ok1 uses pickAvatarFor
    expect(pickAvatarForMock).toHaveBeenCalledWith("u_ok1");
    // u_ok2 keeps avatarUrl
    expect(res.find((x) => x.id === "u_ok2")?.avatar).toEqual({
      uri: "https://cdn/ava.png",
    });
  });

  it("works when maxBudget is null/undefined (no budget constraint)", async () => {
    getDocsMock.mockResolvedValueOnce({ docs: [] }).mockResolvedValueOnce({
      docs: [{ id: "a", data: () => ({ name: "A", location: "CBD" }) }],
    });

    const res = await swipeSvc.loadCandidates("me", {
      area: "CBD",
      maxBudget: null,
      limit: 10,
    });

    // budget constraints should not be added
    expect(whereMock).toHaveBeenCalledWith("location", "==", "CBD");
    expect(whereMock).not.toHaveBeenCalledWith(
      "budget",
      "<=",
      expect.anything(),
    );
    expect(orderByMock).not.toHaveBeenCalledWith("budget", "asc");
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe("a");
  });
});

describe("swipe", () => {
  it("writes dir and createdAt to user swipes doc", async () => {
    serverTimestampMock.mockReturnValueOnce({ __server_ts: true });

    await swipeSvc.swipe("me", "target", "like");

    expect(docMock).toHaveBeenCalledWith(
      expect.anything(),
      "users",
      "me",
      "swipes",
      "target",
    );
    expect(setDocMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ dir: "like", createdAt: expect.anything() }),
      { merge: true },
    );
  });
});

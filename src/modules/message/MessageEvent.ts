import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
  Unsubscribe,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "@react-native-firebase/firestore";
import { Dispatch, SetStateAction } from "react";
import { Group } from "./Group";
import { Message } from "./Message";
import { MessageStatus } from "./MessageStatus";

export class MessageEvent {
  public static readonly db = getFirestore();

  public static readonly groupsRef = collection(this.db, "groups");
  public static readonly messagesRef = collection(this.db, "messages");
  public static readonly messageTestUserRef = collection(
    this.db,
    "message_test_user",
  );

  public unsubscribe: Map<string, Unsubscribe> = new Map();
  public subscription: Dispatch<SetStateAction<MessageStatus>> = () => {};
  public message: MessageStatus = new MessageStatus();
  public id: string;
  public ready: Dispatch<SetStateAction<boolean>> = () => {};

  constructor(id: string, ready: Dispatch<SetStateAction<boolean>>) {
    this.id = id;
    this.ready = ready;
    this.unsubscribe.set("group", this.manageGroup());
  }

  manageGroup(): Unsubscribe {
    return onSnapshot(
      query(
        MessageEvent.groupsRef,
        where("members", "array-contains", this.id),
      ),
      async (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          switch (change.type) {
            case "added": {
              const data = change.doc.data() as {
                name: string | null;
                members: string[];
              };

              if (data.name === null) {
                const other = data.members.find((m) => m !== this.id);

                if (other) {
                  data.name =
                    (
                      await getDoc<{ name: string }>(
                        doc(MessageEvent.messageTestUserRef, other),
                      )
                    ).data()?.name || null;
                }
              }

              const n = new Group(change.doc.id, data.name || "", data.members);
              console.log(n);
              this.unsubscribe.set(`Group:${n.id}`, this.manageMessage(n.id));

              this.subscription((prev) => {
                prev = new MessageStatus(prev);
                prev.addGroup(n);
                return prev;
              });

              break;
            }
            case "modified": {
              const data = change.doc.data() as {
                name: string;
                members: string[];
              };

              this.subscription((prev) => {
                prev = new MessageStatus(prev);

                const group = prev.getGroup(change.doc.id);
                if (group) {
                  group.name = data.name;
                  group.members = data.members;
                }

                return prev;
              });
              break;
            }
            case "removed": {
              this.subscription((prev) => {
                prev = new MessageStatus(prev);
                prev.removeGroup(change.doc.id);
                this.unsubscribe.delete(`Group:${change.doc.id}`);
                return prev;
              });
              break;
            }
          }
        });

        this.ready(true);
      },
    );
  }

  manageMessage(groupId: string): Unsubscribe {
    return onSnapshot(
      query(MessageEvent.messagesRef, where("group", "==", groupId)),
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        snapshot.docChanges().forEach((change) => {
          switch (change.type) {
            case "added": {
              this.subscription((prev) => {
                prev = new MessageStatus(prev);

                const data = change.doc.data() as {
                  group: string;
                  message: string;
                  sender: string;
                  timestamp: Date;
                };

                prev.addMessages(
                  new Message(
                    change.doc.id,
                    data.group,
                    data.sender,
                    data.message,
                    data.timestamp,
                  ),
                );
                return prev;
              });
              break;
            }
            case "modified": {
              this.subscription((prev) => {
                prev = new MessageStatus(prev);

                const data = change.doc.data() as {
                  group: string;
                  message: string;
                  sender: string;
                  timestamp: Date;
                };

                const message = prev.getMessage(change.doc.id);
                if (message) {
                  message.group = data.group;
                  message.sender = data.sender;
                  message.message = data.message;
                  message.timestamp = data.timestamp;
                }
                return prev;
              });
              break;
            }
            case "removed": {
              this.subscription((prev) => {
                prev = new MessageStatus(prev);
                prev.removeMessage(change.doc.id);
                return prev;
              });
              break;
            }
          }
        });
      },
    );
  }

  async manageUser() {
    const groupsWithOther = this.message
      .getGroups()
      .filter((g) => g.name === "")
      .map((g): [Group, string | undefined] => [
        g,
        g.members.find((m) => m !== this.id),
      ])
      .filter(
        (tuple): tuple is [Group, string] => typeof tuple[1] === "string",
      );

    for (const [group, other] of groupsWithOther) {
      const data = (
        await getDoc(doc(MessageEvent.messageTestUserRef, other))
      ).data() as { name: string } | undefined;

      if (data?.name) {
        const g = this.message.getGroup(group.id);
        if (g) {
          g.name = data.name;
          this.message.addGroup(g);
        }
      }
    }
  }

  destroy() {
    this.unsubscribe.forEach((fn) => fn());
  }

  setMessage(message: MessageStatus) {
    this.message = message;
  }

  subscribe(callback: Dispatch<SetStateAction<MessageStatus>>) {
    this.subscription = callback;
  }
}

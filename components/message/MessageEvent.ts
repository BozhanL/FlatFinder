import { getApp } from "@react-native-firebase/app";
import {
  getDatabase,
  onValue,
  ref,
  Unsubscribe,
} from "@react-native-firebase/database";
import { Dispatch, SetStateAction } from "react";
import { Group } from "./Group";
import { Message } from "./Message";
import { MessageStatus } from "./MessageStatus";
import { User } from "./User";

export class MessageEvent {
  public unsubscribe: Unsubscribe[] = [];
  public subscription: Dispatch<SetStateAction<MessageStatus>> = () => {};

  constructor(public id: string) {
    this.id = id;
    const db = getDatabase(
      getApp(),
      "https://flatfinder-5b5c8-default-rtdb.asia-southeast1.firebasedatabase.app/",
    );

    const f1 = onValue(ref(db, `/users`), (snap) => {
      const currentUsers: User[] = [];

      snap.forEach((child) => {
        const id = child.key;
        if (!id) return undefined;
        const name = child.child("name").val() as string;

        const user = new User(id, name);
        currentUsers.push(user);

        return undefined;
      });

      this.subscription((prev) => {
        prev = new MessageStatus(prev);
        prev.clearUsers();
        prev.addUsers(...currentUsers);
        return prev;
      });
    });

    const f2 = onValue(ref(db, "/groups"), (snap) => {
      const currentGroups: Group[] = [];

      snap.forEach((g) => {
        const id = g.key;
        if (!id) return undefined;
        const name = g.child("name").val() as string | null;
        const memberUids = g.child("members").val() as string[];

        const group = new Group(id, name, memberUids);
        currentGroups.push(group);
      });

      this.subscription((prev) => {
        prev = new MessageStatus(prev);
        prev.clearGroups();
        prev.addGroups(...currentGroups);
        return prev;
      });
    });

    const f3 = onValue(ref(db, "/messages"), (snap) => {
      const currentMessages: Message[] = [];

      snap.forEach((g) => {
        const groupId = g.key;
        if (!groupId) return undefined;
        g.forEach((m) => {
          const id = m.key;
          if (!id) return undefined;
          const uid = m.child("uid").val() as string;
          const message = m.child("message").val() as string;
          const rawTimestamp = m.child("timestamp").val();
          const timestamp =
            rawTimestamp instanceof Date
              ? rawTimestamp
              : new Date(
                  rawTimestamp
                    ? typeof rawTimestamp === "number"
                      ? rawTimestamp
                      : String(rawTimestamp)
                    : 0,
                );

          const msg = new Message(groupId, id, uid, message, timestamp);
          currentMessages.push(msg);
        });
      });

      this.subscription((prev) => {
        prev = new MessageStatus(prev);
        prev.clearMessages();
        prev.addMessages(...currentMessages);
        return prev;
      });
    });

    this.unsubscribe.push(f1);
    this.unsubscribe.push(f2);
    this.unsubscribe.push(f3);
  }

  destroy() {
    this.unsubscribe.forEach((fn) => fn());
  }

  subscribe(callback: Dispatch<SetStateAction<MessageStatus>>) {
    this.subscription = callback;
  }
}

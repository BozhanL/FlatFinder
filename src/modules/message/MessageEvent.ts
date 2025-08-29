import { Unsubscribe } from "@react-native-firebase/database";
import { Dispatch, SetStateAction } from "react";
import { MessageStatus } from "./MessageStatus";

export class MessageEvent {
  public unsubscribe: Unsubscribe[] = [];
  public subscription: Dispatch<SetStateAction<MessageStatus>> = () => {};

  constructor(public id: string) {
    this.id = id;
  }

  destroy() {
    this.unsubscribe.forEach((fn) => fn());
  }

  subscribe(callback: Dispatch<SetStateAction<MessageStatus>>) {
    this.subscription = callback;
  }
}

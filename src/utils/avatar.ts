import type { ImageRequireSource } from "react-native";

const DEFAULT_AVATAR: ImageRequireSource = require("assets/images/dummy1.png");

const AVATARS: ImageRequireSource[] = [
  require("assets/images/dummy1.png"),
  require("assets/images/dummy2.png"),
  require("assets/images/dummy3.png"),
  require("assets/images/dummy4.png"),
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickAvatarFor(uid: string): ImageRequireSource {
  return AVATARS[hash(uid) % AVATARS.length] ?? DEFAULT_AVATAR;
}

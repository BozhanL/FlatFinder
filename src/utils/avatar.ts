/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import type { ImageRequireSource } from "react-native";

const DEFAULT_AVATAR =
  require("assets/images/dummy1.png") as ImageRequireSource;

export const AVATARS = [
  require("assets/images/dummy1.png") as ImageRequireSource,
  require("assets/images/dummy2.png") as ImageRequireSource,
  require("assets/images/dummy3.png") as ImageRequireSource,
  require("assets/images/dummy4.png") as ImageRequireSource,
] as const satisfies readonly ImageRequireSource[];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickAvatarFor(uid: string): ImageRequireSource {
  const idx = hash(uid) % AVATARS.length;
  return AVATARS[idx] ?? DEFAULT_AVATAR;
}

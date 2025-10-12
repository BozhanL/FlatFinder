/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
export const AVATARS = [
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

// IMPROVE: Use ImageRequireSource as return type @G2CCC
export function pickAvatarFor(uid: string): number {
  return AVATARS[hash(uid) % AVATARS.length];
}

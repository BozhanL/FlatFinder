// https://github.com/invertase/react-native-firebase/blob/main/jest.setup.ts
import { jest } from "@jest/globals";

// Avoid log pollution with emulator URL remap messages during testing
// eslint-disable-next-line no-console
const logOrig = console.log;
const logWithRemapMessageRemoved = (
  message?: any,
  ...optionalParams: any[]
): void => {
  if (
    // Make sure it is a string before attempting to filter it out
    (typeof message !== "string" && !(message instanceof String)) ||
    !message.includes("android_bypass_emulator_url_remap")
  ) {
    logOrig(message, ...optionalParams);
  }
};
// eslint-disable-next-line no-console
console.log = logWithRemapMessageRemoved;

jest.mock("@react-native-firebase/auth", () => {
  return {
    getAuth: () => ({}),
    onAuthStateChanged: (_auth: any, handler: (u: any) => void) => {
      setTimeout(() => handler(null), 0);
      return jest.fn();
    },
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
    signOut: jest.fn(() => Promise.resolve()),
  };
});

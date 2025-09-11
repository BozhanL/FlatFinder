import "expo-router/entry";
import { backgroundMessageHandler } from "./services/notification";

// https://github.com/expo/expo/issues/29757#issuecomment-2264715009
backgroundMessageHandler();

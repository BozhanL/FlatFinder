import { initializeApp } from "@react-native-firebase/app";
import { Platform } from "react-native";
import { backgroundMessageHandler } from "./services/notification";

// https://github.com/expo/expo/issues/29757#issuecomment-2264715009
backgroundMessageHandler();

if (Platform.OS === "web") {
  const firebaseConfig = {
    apiKey: "AIzaSyCQ-uqsWqjm2GL9OazJS-sBBIu5_oES_zM",
    authDomain: "flatfinder-5b5c8.firebaseapp.com",
    databaseURL:
      "https://flatfinder-5b5c8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "flatfinder-5b5c8",
    storageBucket: "flatfinder-5b5c8.firebasestorage.app",
    messagingSenderId: "245824951682",
    appId: "1:245824951682:web:793a4dda12802980ba6b9b",
    measurementId: "G-5XEP9G2HN9",
  };

  initializeApp(firebaseConfig);
}

import "expo-router/entry";

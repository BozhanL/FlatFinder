/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import type { ImageSourcePropType } from "react-native";
import type { Timestamp } from "@react-native-firebase/firestore";

export type Flatmate = {
  id: string;
  name: string;
  dob?: Timestamp | null;
  bio?: string;
  avatar?: ImageSourcePropType;
  budget?: number | null;
  location?: string | { area?: string } | null;
  tags?: string[];
};

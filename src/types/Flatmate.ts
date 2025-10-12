/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import type { ImageSourcePropType } from "react-native";
import type { Timestamp } from "@react-native-firebase/firestore";

export type Flatmate = {
  id: string;
  name: string;
  // IMPROVE: TODO: Change to DOB by @G2CCC in sprint two
  // https://github.com/BozhanL/FlatFinder/pull/29/files#r2375268571
  dob?: Timestamp | null;
  bio?: string;
  avatar?: ImageSourcePropType;
  budget?: number | null;
  location?: string | { area?: string } | null;
  tags?: string[];
};

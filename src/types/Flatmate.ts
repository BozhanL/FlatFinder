/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.
import type { ImageSourcePropType } from "react-native";

export type Flatmate = {
  id: string;
  name: string;
  // IMPROVE: TODO: Change to DOB by @G2CCC in sprint two
  // https://github.com/BozhanL/FlatFinder/pull/29/files#r2375268571
  age: number;
  bio: string;
  avatar?: ImageSourcePropType;
  budget?: number;
  location?: string | { area?: string };
  tags?: string[];
};

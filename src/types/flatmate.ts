import type { ImageSourcePropType } from "react-native";

export type Flatmate = {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar?: ImageSourcePropType;
  budget?: number;
  location?: string | { area?: string };
  tags?: string[];
};

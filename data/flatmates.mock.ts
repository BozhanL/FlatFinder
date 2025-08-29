// mock data for development, will use Firebase data later
import { Flatmate } from "@/types/flatmate";
import { GeoPoint } from "firebase/firestore";

export const FLATMATES: Flatmate [] = [
    {
    id: "1",
    name: "Alice Johnson",
    age: 24,
    bio: "Loves the beach and yoga. Looking for flatmates who enjoy cooking together.",
    avatar: require("../assets/images/dummy1.png"),
    budget: 250,
    location: {
      geo: new GeoPoint(-36.7916, 174.7756),
      area: "Takapuna",
      placeId: "ChIJf0Cvt9ZHDW0RHL6XZ3c4whE",
    },
    tags: ["yoga", "cooking", "student"],
  },
  {
    id: "2",
    name: "Ben Carter",
    age: 27,
    bio: "Software developer, into gaming and music. Quiet but sociable.",
    avatar: require("../assets/images/dummy2.png"),
    budget: 320,
    location: {
      geo: new GeoPoint(-36.8406, 174.7756),
      area: "Parnell",
      placeId: "ChIJsYw0kdhHDW0RITz8Ggf0v_c",
    },
    tags: ["gaming", "music", "developer"],
  },
  {
    id: "3",
    name: "Chloe Smith",
    age: 22,
    bio: "AUT student, enjoys painting and swimming. Prefers quiet spaces.",
    avatar: require("../assets/images/dummy3.png"),
    budget: 280,
    location: {
      geo: new GeoPoint(-36.7383, 174.7656),
      area: "Castor Bay",
      placeId: "ChIJWb6cYZ9HDW0Rfg0u5tNv3Uc",
    },
    tags: ["student", "art", "swimming"],
  },
  {
    id: "4",
    name: "Daniel Lee",
    age: 30,
    bio: "Works in finance, likes running and coffee. Usually out during weekdays.",
    avatar: require("../assets/images/dummy4.png"),
    budget: 400,
    location: {
      geo: new GeoPoint(-36.8667, 174.7667),
      area: "Auckland CBD",
      placeId: "ChIJ--acWvtHDW0RF5miQ2HvAAU",
    },
    tags: ["finance", "running", "coffee"],
  },
]
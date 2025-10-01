import type { Flatmate } from "@/types/Flatmate";
import { AntDesign } from "@expo/vector-icons";
import type { JSX } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SwipeCard from "./SwipeCard";

const { width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_W * 0.25;
const ROTATE = 15; // degrees

export type Props = {
  data: Flatmate[];
  onLike?: (user: Flatmate) => Promise<void>;
  onPass?: (user: Flatmate) => Promise<void>;
};

export default function SwipeDeck({
  data,
  onLike,
  onPass,
}: Props): JSX.Element {
  const top = data[0];
  const next = data[1];

  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const commitSwipe = (dir: 1 | -1): void => {
    if (!top) {
      return;
    } else if (dir === 1) {
      void onLike?.(top);
    } else {
      void onPass?.(top);
    }
    // reset & next card
    translateX.set(0);
    translateY.set(0);
  };

  const gesture = Gesture.Pan()
    .onChange((e) => {
      translateX.set(e.translationX);
      translateY.set(e.translationY);
    })
    .onEnd(() => {
      if (Math.abs(translateX.get()) > SWIPE_THRESHOLD) {
        const dir: 1 | -1 = translateX.get() > 0 ? 1 : -1;
        translateX.set(
          withTiming(dir * SCREEN_W * 1.2, { duration: 180 }, () => {
            runOnJS(commitSwipe)(dir);
          }),
        );
      } else {
        translateX.set(withSpring(0));
        translateY.set(withSpring(0));
      }
    });

  const fling = (dir: 1 | -1): void => {
    if (!top) return;
    translateX.set(
      withTiming(dir * SCREEN_W * 1.2, { duration: 180 }, () => {
        runOnJS(commitSwipe)(dir);
      }),
    );
  };

  //like animate
  const likeBadgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.get(), [0, SWIPE_THRESHOLD], [0, 1]);
    return { opacity };
  });

  //unlike animate
  const nopeBadgeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.get(),
      [0, -SWIPE_THRESHOLD],
      [0, 1],
    );
    return { opacity };
  });

  const nextStyle = useAnimatedStyle(() => {
    // For the next card at the back
    const scale = interpolate(
      Math.abs(translateX.get()),
      [0, SWIPE_THRESHOLD],
      [0.95, 1],
    );
    return { transform: [{ scale }] };
  });

  const topStyle = useAnimatedStyle(() => {
    const rotate = (translateX.get() / SCREEN_W) * ROTATE;
    return {
      transform: [
        { translateX: translateX.get() },
        { translateY: translateY.get() },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  if (!top) {
    return (
      <View style={styles.center}>
        <Text>Looking for more...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* next card */}
        {next && (
          <Animated.View
            style={[StyleSheet.absoluteFill, { padding: 16 }, nextStyle]}
          >
            <SwipeCard item={next} />
          </Animated.View>
        )}

        {/* top card */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[StyleSheet.absoluteFill, { padding: 16 }, topStyle]}
          >
            <SwipeCard item={top} />

            {/* LIKE / NOPE tag */}
            <Animated.View
              style={[
                styles.badge,
                { left: 28, top: 40, borderColor: "#1DB954" },
                likeBadgeStyle,
              ]}
            >
              <Text style={[styles.badgeText, { color: "#1DB954" }]}>LIKE</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.badge,
                { right: 28, top: 40, borderColor: "#FF3B30" },
                nopeBadgeStyle,
              ]}
            >
              <Text style={[styles.badgeText, { color: "#FF3B30" }]}>NOPE</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Buttons at the bottom */}
      <View
        // IMPROVE: use other value for paddingBottom
        style={[styles.fabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          // IMPROVE: Use enum instead of number @G2CCC
          onPress={() => {
            fling(-1);
          }}
          activeOpacity={0.9}
          style={[styles.fab, styles.nopeFab]}
        >
          <AntDesign name="close" size={28} color="#d17878ff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            fling(1);
          }}
          activeOpacity={0.9}
          style={[styles.fab, styles.likeFab]}
        >
          <AntDesign name="heart" size={26} color="#73d196ff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderRadius: 8,
    transform: [{ rotate: "-15deg" }],
    backgroundColor: "transparent",
  },
  badgeText: { fontSize: 20, fontWeight: "800", letterSpacing: 2 },

  fabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    paddingHorizontal: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  likeFab: {
    borderWidth: 2,
    backgroundColor: "#DCFCE7",
    borderColor: "#DCFCE7",
  },
  nopeFab: {
    borderWidth: 2,
    backgroundColor: "#FEE2E2",
    borderColor: "#FEE2E2",
  },
});

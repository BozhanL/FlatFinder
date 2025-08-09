import { useRef, useState } from "react";
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = 0.25 * width;
const SWIPE_OUT_DURATION = 250;

const SAMPLE_CARDS = [
    {
        id: "1",
        name: "Ava, 26",
        bio: "Loves coffee, dogs and weekend hikes.",
        uri: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800&h=1200&fit=crop",
    },
    {
        id: "2",
        name: "Liam, 28",
        bio: "Photographer. Sushi enthusiast.",
        uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop",
    },
    {
        id: "3",
        name: "Maya, 24",
        bio: "Designer. Plant parent.",
        uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop",
    },
];

export default function TinderSwipePrototype() {
    const [cards, setCards] = useState(SAMPLE_CARDS);
    const position = useRef(new Animated.ValueXY()).current;
    const currentIndex = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    forceSwipe("right");
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    forceSwipe("left");
                } else {
                    resetPosition();
                }
            },
        }),
    ).current;

    const forceSwipe = (direction) => {
        const x = direction === "right" ? width : -width;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: false,
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = (direction) => {
        const swipedCard = cards[currentIndex.current];
        // Here you can call backend / analytics with swipe result
        // console.log('Swiped', direction, 'on', swipedCard.id);

        currentIndex.current += 1;
        setCards((prev) => prev.slice(1));
        position.setValue({ x: 0, y: 0 });
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
        }).start();
    };

    const getCardStyle = () => {
        const rotate = position.x.interpolate({
            inputRange: [-width * 1.5, 0, width * 1.5],
            outputRange: ["-30deg", "0deg", "30deg"],
            extrapolate: "clamp",
        });

        return {
            ...position.getLayout(),
            transform: [{ rotate }],
        };
    };

    const renderCards = () => {
        if (!cards.length) {
            return (
                <View style={styles.noMoreCards}>
                    <Text style={styles.noMoreText}>No more cards</Text>
                </View>
            );
        }

        return cards
            .map((card, i) => {
                if (i === 0) {
                    return (
                        <Animated.View
                            key={card.id}
                            style={[styles.cardStyle, getCardStyle()]}
                            {...panResponder.panHandlers}
                        >
                            <Image source={{ uri: card.uri }} style={styles.image} />
                            <View style={styles.cardFooter}>
                                <Text style={styles.name}>{card.name}</Text>
                                <Text style={styles.bio}>{card.bio}</Text>
                            </View>

                            <Animated.View
                                style={[
                                    styles.likeBox,
                                    {
                                        opacity: position.x.interpolate({
                                            inputRange: [0, 120],
                                            outputRange: [0, 1],
                                            extrapolate: "clamp",
                                        }),
                                    },
                                ]}
                            >
                                <Text style={styles.likeText}>LIKE</Text>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.nopeBox,
                                    {
                                        opacity: position.x.interpolate({
                                            inputRange: [-120, 0],
                                            outputRange: [1, 0],
                                            extrapolate: "clamp",
                                        }),
                                    },
                                ]}
                            >
                                <Text style={styles.nopeText}>NOPE</Text>
                            </Animated.View>
                        </Animated.View>
                    );
                }

                // stack the next cards slightly beneath
                return (
                    <Animated.View key={card.id} style={[styles.cardStyle, { top: 10 * i, zIndex: -i }]}>
                        <Image source={{ uri: card.uri }} style={styles.image} />
                        <View style={styles.cardFooter}>
                            <Text style={styles.name}>{card.name}</Text>
                            <Text style={styles.bio}>{card.bio}</Text>
                        </View>
                    </Animated.View>
                );
            })
            .reverse();
    };

    // quick programmatic swipe buttons (optional)
    const programmaticSwipe = (dir) => {
        forceSwipe(dir);
    };

    return (
        <View style={styles.container}>
            <View style={styles.deck}>{renderCards()}</View>

            <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.smallBtn} onPress={() => programmaticSwipe("left")}>
                    <Text style={styles.btnText}>Nope</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, styles.green]} onPress={() => programmaticSwipe("right")}>
                    <Text style={styles.btnText}>Like</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f7f7",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 40,
    },
    deck: {
        width: width * 0.9,
        height: height * 0.68,
    },
    cardStyle: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "78%",
    },
    cardFooter: {
        padding: 12,
    },
    name: {
        fontSize: 22,
        fontWeight: "700",
    },
    bio: {
        marginTop: 6,
        fontSize: 14,
        color: "#555",
    },
    likeBox: {
        position: "absolute",
        top: 30,
        left: 20,
        padding: 8,
        borderWidth: 3,
        borderColor: "#2ecc71",
        borderRadius: 4,
        transform: [{ rotate: "-20deg" }],
    },
    likeText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#2ecc71",
    },
    nopeBox: {
        position: "absolute",
        top: 30,
        right: 20,
        padding: 8,
        borderWidth: 3,
        borderColor: "#e74c3c",
        borderRadius: 4,
        transform: [{ rotate: "20deg" }],
    },
    nopeText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#e74c3c",
    },
    buttonsRow: {
        flexDirection: "row",
        marginTop: 20,
        width: "80%",
        justifyContent: "space-around",
    },
    smallBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#ddd",
    },
    green: {
        backgroundColor: "#a2e4b8",
    },
    btnText: {
        fontWeight: "700",
    },
    noMoreCards: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    noMoreText: {
        fontSize: 20,
        color: "#444",
    },
});

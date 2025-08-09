import React from "react";
import { View } from "react-native";
import TinderSwipePrototype from "./TinderSwipePrototype.jsx";

export default function Index() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <TinderSwipePrototype />
        </View>
    );
}

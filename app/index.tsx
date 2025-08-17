import database from "@react-native-firebase/database";
import React from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

// Define interface for message type
interface Message {
    [key: string]: any;
}

export default function Index() {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [text, setText] = React.useState<string>("");

    React.useEffect(() => {
        const reference = database().ref("/chats/one/messages");

        reference.on("child_added", (snapshot) => {
            const message = snapshot.val();
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Clean up listener on unmount
        return () => reference.off("child_added");
    }, []);

    const sendMessage = () => {
        const reference = database().ref("/chats/one/messages");
        reference.push({ message: text, sender: "Phone Test" });
        setText("");
    };

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <ScrollView style={styles.container}>
                <Text>{messages.map((msg) => msg.message).join("\n")}</Text>
            </ScrollView>
            <TextInput
                style={styles.input}
                placeholder="Type here to translate!"
                onChangeText={(newText) => setText(newText)}
                defaultValue={text}
            />
            <Button onPress={sendMessage} title="Send message" />
        </View>
    );
}
const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "blue", // Sets the border color to blue
        padding: 10,
    },
    container: {
        flexGrow: 0,
    },
});

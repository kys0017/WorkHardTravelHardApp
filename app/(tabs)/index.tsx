import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  TextInputProps,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/colors";
import { useState } from "react";

export default function HomeScreen() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState<{
    [key: string]: { text: string; work: boolean };
  }>({});

  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  const onChangeText: TextInputProps["onChangeText"] = (payload) => {
    setText(payload);
  };

  const addToDo = () => {
    if (text === "") {
      return;
    }
    // save to do
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, work: working },
    };
    setToDos(newToDos);
    setText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        placeholderTextColor="grey"
        style={styles.input}
        value={text}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) => (
          <View style={styles.toDo} key={key}>
            <Text style={styles.toDoText}>{toDos[key].text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

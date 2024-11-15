import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/colors';
import { useEffect, useState } from 'react';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Todos = {
  [key: string]: {
    text: string;
    tempText?: string;
    working?: boolean;
    done?: boolean;
    modifying?: boolean;
  };
};

const WORKING_MODE = '@working';
const STORAGE_KEY = '@toDos';

export default function HomeScreen() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState<Todos>({});

  useEffect(() => {
    loadToWorkingMode();
    loadToDos();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(WORKING_MODE, JSON.stringify(working));
  }, [working]);

  const travel = async () => {
    setWorking(false);
  };

  const work = async () => {
    setWorking(true);
  };

  const loadToWorkingMode = async () => {
    try {
      const s = await AsyncStorage.getItem(WORKING_MODE);
      if (!!s) {
        setWorking(s === 'true');
      }
    } catch (e) {}
  };

  const onChangeText: TextInputProps['onChangeText'] = (payload) => {
    setText(payload);
  };

  const saveToDos = async (toSave: Todos) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s || ''));
    } catch (e) {}
  };

  const addToDo = async () => {
    if (text === '') {
      return;
    }
    // save to do
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };

  const completeToDo = (key: string) => {
    setToDos((prevTodos) => {
      const newToDos = {
        ...prevTodos,
        [key]: { ...prevTodos[key], done: !prevTodos[key].done },
      };
      saveToDos(newToDos);

      return newToDos;
    });
  };

  // modifying 이면 save, modifying false 로 수정.
  // !modifying 이면 text input 으로 변경
  const modifyTodo = (key: string) => {
    if (toDos[key].modifying) {
      confirmToUpdateToDoText(key);
    } else {
      changeToModifying(key);
    }
  };

  const confirmToUpdateToDoText = (key: string) => {
    if (!toDos[key].modifying) return;

    Alert.alert('Update To Do?', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: "I'm Sure",
        style: 'destructive',
        onPress: () => {
          setToDos((prevTodos) => {
            const newToDos = {
              ...prevTodos,
              [key]: {
                ...prevTodos[key],
                text: !!prevTodos[key].tempText
                  ? (prevTodos[key].tempText ?? '')
                  : prevTodos[key].text,
                modifying: false,
              },
            };
            saveToDos(newToDos);

            return newToDos;
          });
        },
      },
    ]);
  };

  const changeToModifying = (key: string) => {
    setToDos((prevTodos) => ({
      ...prevTodos,
      [key]: { ...prevTodos[key], modifying: !prevTodos[key].modifying },
    }));
  };

  const onChangeToDoText = (key: string, text: string) => {
    setToDos((prevTodos) => ({
      ...prevTodos,
      [key]: { ...prevTodos[key], tempText: text },
    }));
  };

  const onPressOutToDo = (key: string) => {
    if (toDos[key].modifying) changeToModifying(key);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? 'white' : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? 'white' : theme.grey,
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
        placeholder={working ? 'Add a To Do' : 'Where do you want to go?'}
        placeholderTextColor="grey"
        style={styles.input}
        value={text}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <Pressable
              style={styles.toDo}
              key={key}
              onPressOut={() => onPressOutToDo(key)}
            >
              {toDos[key].modifying ? (
                <TextInput
                  defaultValue={toDos[key].text}
                  onChangeText={(text) => onChangeToDoText(key, text)}
                  value={toDos[key].tempText}
                  style={{
                    backgroundColor: 'white',
                    flex: 1,
                    borderRadius: 10,
                    padding: 10,
                  }}
                />
              ) : (
                <Text
                  style={{
                    ...styles.toDoText,
                    ...(toDos[key].done && {
                      textDecorationLine: 'line-through',
                      color: 'gray',
                    }),
                  }}
                >
                  {toDos[key].text}
                </Text>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <TouchableOpacity onPress={() => modifyTodo(key)}>
                  <FontAwesome6 name="eraser" size={20} color={theme.toDoBg} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => completeToDo(key)}>
                  {toDos[key].done ? (
                    <MaterialIcons
                      name="check-box"
                      size={22}
                      color={theme.toDoBg}
                    />
                  ) : (
                    <MaterialIcons
                      name="check-box-outline-blank"
                      size={22}
                      color={theme.toDoBg}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          ) : null,
        )}
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  toDoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

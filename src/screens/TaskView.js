// Frontend code: TaskView.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { AntDesign, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

// Formats a date string into a more readable format

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const taskYear = date.getFullYear();

  if (taskYear === currentYear) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}/${taskYear
      .toString()
      .slice(-2)}`;
  }
};

const TaskView = ({ route, navigation }) => {
  const { listId, listName } = route.params;
  const [tasks, setTasks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0); // Used to reset the timer
  const [selectedTime, setSelectedTime] = useState(1500); // Default to 25 minutes (1500 seconds)
  const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

    // Fetches tasks from the server for the specified list
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/tasks`, {
        params: { listId },
      });
      const validTasks = response.data.filter((task) => task && task._id); // Ensure all tasks have _id
      setTasks(validTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

    // Deletes a task by its ID
  const deleteTask = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/tasks/${listId}/${id}`
      );
      console.log("Task deleted successfully", response.data);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error.message);
      Alert.alert(
        "Error",
        `Could not delete task. Please try again later. ${error.message}`
      );
    }
  };

    // Toggles the completion status of a task by its ID
  const toggleCompleteTask = async (id) => {
    try {
      const task = tasks.find((task) => task._id === id);
      if (!task) return;

      const updatedTask = {
        ...task,
        completed: !task.completed,
        name: task.name || "", // Ensure name is not undefined
        dueDate: task.dueDate || new Date(), // Ensure due date is not undefined
        category: task.category, // Ensure category is not lost
        important: task.important || false, // Preserve the important field
      };

      const response = await axios.put(
        `http://localhost:3000/tasks/${listId}/${id}`,
        updatedTask
      );
      const updatedTasks = tasks.map((task) =>
        task._id === id ? response.data : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

    // Handles the selection of a timer duration
  const handleTimeSelect = (itemValue) => {
    if (itemValue === "custom") {
      setIsCustomTime(true);
    } else {
      setIsCustomTime(false);
      setSelectedTime(itemValue);
      setIsTimerModalVisible(false); // Automatically close modal when a time is selected
    }
  };

    // Sets a custom time for the timer
  const handleCustomTimeSet = () => {
    if (!customTime || isNaN(customTime)) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid number for the custom time."
      );
      return;
    }

    const timeInSeconds = parseInt(customTime) * 60; // Convert minutes to seconds
    setSelectedTime(timeInSeconds);
    setIsCustomTime(false);
    setIsTimerModalVisible(false);
  };
  
    // Renders the right swipe action (delete button) for each task
  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        deleteTask(id);
      }}
    >
      <MaterialIcons name="delete" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>{listName}</Text>

        <View style={styles.timerContainer}>
          <CountdownCircleTimer
            key={key}
            isPlaying={isPlaying}
            duration={selectedTime}
            colors={["#22A39F", "#F4D160", "#EE4E4E"]}
            colorsTime={[selectedTime, selectedTime / 2, selectedTime / 4]}
            onComplete={() => ({ shouldRepeat: false })}
          >
            {({ remainingTime }) => (
              <Text style={styles.timerText}>
                {`${Math.floor(remainingTime / 60)}:${(
                  "0" +
                  (remainingTime % 60)
                ).slice(-2)}`}
              </Text>
            )}
          </CountdownCircleTimer>
          <View style={styles.timerControls}>
            <TouchableOpacity onPress={() => setIsPlaying((prev) => !prev)}>
              <MaterialIcons
                name={isPlaying ? "pause" : "play-arrow"}
                size={32}
                color="#EEEEEE"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setKey((prevKey) => prevKey + 1);
                setIsPlaying(false);
              }}
            >
              <MaterialIcons name="stop" size={32} color="#EE4E4E" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsTimerModalVisible(true)}>
              <MaterialIcons name="timer" size={32} color="#22A39F" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item._id)}>
              <TaskItem
                navigation={navigation}
                item={item}
                listId={listId}
                fetchTasks={fetchTasks}
                toggleCompleteTask={toggleCompleteTask}
                formatDate={formatDate}
              />
            </Swipeable>
          )}
          keyExtractor={(item) => item._id.toString()}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("TaskDetails", {
              task: null,
              listId,
              fetchTasks,
            })
          }
        >
          <AntDesign name="pluscircle" size={50} color="#22A39F" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isTimerModalVisible}
          onRequestClose={() => setIsTimerModalVisible(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => setIsTimerModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Select Timer Duration</Text>
                  <Picker
                    selectedValue={isCustomTime ? "custom" : selectedTime}
                    style={styles.picker}
                    onValueChange={handleTimeSelect}
                  >
                    <Picker.Item label="5 minutes" value={300} />
                    <Picker.Item label="10 minutes" value={600} />
                    <Picker.Item label="15 minutes" value={900} />
                    <Picker.Item label="20 minutes" value={1200} />
                    <Picker.Item label="25 minutes" value={1500} />
                    <Picker.Item label="30 minutes" value={1800} />
                    <Picker.Item label="45 minutes" value={2700} />
                    <Picker.Item label="60 minutes" value={3600} />
                    <Picker.Item label="Custom" value="custom" />
                  </Picker>
                  {isCustomTime && (
                    <>
                      <TextInput
                        style={styles.customTimeInput}
                        placeholder="Enter custom time in minutes"
                        placeholderTextColor="#888888"
                        keyboardType="numeric"
                        value={customTime}
                        onChangeText={setCustomTime}
                        selectionColor="#007AFF"
                        caretColor="#007AFF"
                        autoFocus={true}
                      />
                      <TouchableOpacity
                        style={styles.customTimeSetButton}
                        onPress={handleCustomTimeSet}
                      >
                        <Text style={styles.customTimeSetButtonText}>
                          Set Custom Time
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

export function TaskItem({
  navigation,
  item,
  listId,
  fetchTasks,
  toggleCompleteTask,
  formatDate,
}) {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("TaskDetails", {
          task: item,
          listId,
          fetchTasks,
        })
      }
    >
      <View style={styles.taskContainer}>
        <TouchableOpacity onPress={() => toggleCompleteTask(item._id)}>
          <MaterialIcons
            name={item.completed ? "check-circle" : "radio-button-unchecked"}
            size={24}
            color={item.completed ? "#22A39F" : "#222831"}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.task, item.completed && styles.completedTask]}>
            {item.name}
          </Text>
          {item.files && item.files.length > 0 && (
            <View style={styles.attachmentContainer}>
              <MaterialIcons name="attach-file" size={20} color="#222831" />
              <Text style={styles.attachmentCount}>{item.files.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.rightContainer}>
          <View style={styles.dueDateContainer}>
            <MaterialIcons
              name="calendar-today"
              size={18}
              color={
                item.dueDate && new Date(item.dueDate) < new Date()
                  ? "red"
                  : "#222831"
              }
            />
            <Text
              style={[
                styles.dueDate,
                item.dueDate &&
                  new Date(item.dueDate) < new Date() &&
                  styles.overdue,
              ]}
            >
              {item.dueDate ? formatDate(item.dueDate) : ""}
            </Text>
            {item.dueDate && new Date(item.dueDate) < new Date() && (
              <MaterialIcons name="error" size={18} color="red" />
            )}
            {item.important && (
              <FontAwesome
                name="star"
                size={18}
                color="#FFD700"
                style={styles.importantIcon}
              />
            )}
          </View>
          {item.category && (
            <View
              style={[
                styles.categoryOrb,
                { backgroundColor: item.category.color },
              ]}
            >
              <Text style={styles.categoryOrbText}>{item.category.name}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#31363F",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FFFFFF",
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    borderRadius: 5,
  },
  task: {
    fontSize: 20,
    color: "#222831",
    marginLeft: 10,
    flex: 1, // Ensure task name takes up available space
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#AAAAAA",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  deleteButton: {
    backgroundColor: "#EE4E4E",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "100%",
    borderRadius: 5,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 10,
  },
  dueDateContainer: {
    flexDirection: "row", // Arrange items in a row
    alignItems: "center", // Align items in the center vertically
  },
  dueDate: {
    fontSize: 16,
    color: "#222831",
    marginLeft: 5, // Add some spacing between the icon and the text
  },
  overdue: {
    color: "red",
  },
  importantIcon: {
    marginLeft: 5, // Add space between the due date and star icon
  },
  filePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  fileName: {
    fontSize: 14,
    color: "#AAAAAA",
    marginVertical: 10,
  },
  attachmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  attachmentCount: {
    fontSize: 14,
    color: "#222831",
    marginLeft: 5,
  },
  rightContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  categoryOrb: {
    width: 150,
    height: 25,
    borderRadius: 12,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryOrbText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#EEEEEE",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222831",
  },
  picker: {
    width: "100%",
    height: 150, // Adjust height to fit the content better
    marginBottom: 20, // Add space between picker and custom input
  },
  customTimeInput: {
    borderWidth: 1,
    borderColor: "#007AFF", // Noticeable blue border color
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: "#222831",
    width: "100%",
    backgroundColor: "#FFFFFF", // Solid white background for visibility
  },
  customTimeSetButton: {
    backgroundColor: "#22A39F", // Teal background
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  customTimeSetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});

export default TaskView;

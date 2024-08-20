// Frontend code: ImportantScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import axios from "axios";
import { useUser } from "../hooks/useUser";
import AsyncStorage from "@react-native-async-storage/async-storage";


const ImportantScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]); // This is tne state to store the list of important tasks
  const user = useUser(); // Custom hook to get the current user data

  // Fetch important tasks when the component mounts
  useEffect(() => {
    fetchImportantTasks();
  }, []);

  // Function to fetch important tasks from the server
  const fetchImportantTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Get the auth token from storage
      const response = await axios.get(
        `http://localhost:3000/tasks/important`,
        {
          headers: {
            "x-auth-token": token, 
          },
        }
      );
      console.log("Important tasks fetched:", response.data);
      setTasks(response.data); // Update tasks state with the fetched data
    } catch (error) {
      console.error("Error fetching important tasks:", error);
      Alert.alert(
        "Error",
        "Unable to fetch tasks. Please check your connection."
      ); // Show an alert if there's an error
    }
  };

  // Function to toggle a task's completion status
  const toggleCompleteTask = async (task) => {
    try {
      if (!task.listId || !task._id) {
        console.error("Task ID or listId is missing for task:", task);
        Alert.alert("Error", "Task ID or List ID is missing.");
        return;
      }

      const updatedTask = {
        ...task,
        completed: !task.completed, // Toggle the completed status
      };
      console.log("Updating task:", updatedTask);

      // Sends the updated task data to the server
      const response = await axios.put(
        `http://localhost:3000/tasks/${task.listId}/${task._id}`,
        updatedTask
      );
      console.log("Task updated successfully:", response.data);

      fetchImportantTasks(); // Refresh the tasks list after updating
    } catch (error) {
      console.error(
        "Error updating task:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Unable to update the task. Please try again."); // Show an alert if there's an error
    }
  };

  // Function to render the right swipe action delete button for each task
  const renderRightActions = (id, listId) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteTask(id, listId)} // Call the delete function when pressed
    >
      <MaterialIcons name="delete" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  // Function to delete a task
  const deleteTask = async (id, listId) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${listId}/${id}`);
      fetchImportantTasks(); // Refresh the tasks list after deletion
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", "Unable to delete the task. Please try again."); // Show an alert if there's an error
    }
  };

  // Function to format the due date of a task
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const currentYear = new Date().getFullYear();
    const taskYear = date.getFullYear();

    // If the task is due this year then show just the month/day otherwise include the year
    if (taskYear === currentYear) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}/${taskYear
        .toString()
        .slice(-2)}`;
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/important-bkg.jpeg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Important</Text>
        {/* FlatList to display important tasks */}
        <FlatList
          data={tasks} 
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() =>
                renderRightActions(item._id, item.listId) // Swipable implemented for deleting a task
              }
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("TaskDetails", {
                    task: item,
                    listId: item.listId,
                    fetchTasks: fetchImportantTasks, // Passes the fetch function to refresh tasks after editing
                  })
                }
              >
                <View style={styles.taskContainer}>
                  {/* Checkbox to toggle task completion */}
                  <TouchableOpacity onPress={() => toggleCompleteTask(item)}>
                    <MaterialIcons
                      name={
                        item.completed
                          ? "check-circle"
                          : "radio-button-unchecked"
                      }
                      size={24}
                      color={item.completed ? "#22A39F" : "#222831"}
                    />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    {/* Implements task name with a strikethrough if completed */}
                    <Text
                      style={[
                        styles.task,
                        item.completed && styles.completedTask,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {/* This showsa paperclip or  attachment icon and count if there are attachments */}
                    {item.files && item.files.length > 0 && (
                      <View style={styles.attachmentContainer}>
                        <MaterialIcons
                          name="attach-file"
                          size={20}
                          color="#222831"
                        />
                        <Text style={styles.attachmentCount}>
                          {item.files.length}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.rightContainer}>
                    {/* Displays due date and star icon if the task is important */}
                    <View style={styles.dueDateContainer}>
                      <MaterialIcons
                        name="calendar-today"
                        size={18}
                        color={
                          item.dueDate && new Date(item.dueDate) < new Date()
                            ? "red"
                            : new Date(item.dueDate).toDateString() ===
                              new Date().toDateString()
                            ? "#F4D160"
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
                      {item.important && (
                        <FontAwesome
                          name="star"
                          size={18}
                          color="#FFD700"
                          style={styles.importantIcon}
                        />
                      )}
                    </View>
                    {/* This shows category orb if the task has a category */}
                    {item.category && (
                      <View
                        style={[
                          styles.categoryOrb,
                          { backgroundColor: item.category.color },
                        ]}
                      >
                        <Text style={styles.categoryOrbText}>
                          {item.category.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
          keyExtractor={(item) => item._id.toString()} // Unique key for each task item
        />
      </View>
    </ImageBackground>
  );
};

// Styles for the Important screen components
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", 
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
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
    flex: 1,
  },
  completedTask: {
    textDecorationLine: "line-through", 
    color: "#AAAAAA",
  },
  deleteButton: {
    backgroundColor: "#EE4E4E",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "100%",
    borderRadius: 5,
  },
  dueDateContainer: {
    flexDirection: "row", 
    alignItems: "center",
  },
  dueDate: {
    fontSize: 16,
    color: "#222831",
    marginLeft: 5, 
  },
  overdue: {
    color: "red", 
  },
  importantIcon: {
    marginLeft: 5, 
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
    alignItems: "flex-end", // Align content to the right
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
});

export default ImportantScreen;

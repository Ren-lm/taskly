// Frontend code: MyDayScreen.js

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
import { MaterialIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import axios from "axios";
import { useUser } from "../hooks/useUser";
import AsyncStorage from "@react-native-async-storage/async-storage";

// MyDayScreen component responsible for displaying tasks due today
const MyDayScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]); // State to store tasks due today
  const user = useUser(); // Gets user data using the custom useUser hook

  // Fetches tasks due today when the component mounts
  useEffect(() => {
    fetchTasksDueToday();
  }, []);

  // Function to fetch tasks due today from the server
  const fetchTasksDueToday = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Get the auth token from storage
      const response = await axios.get(`http://localhost:3000/tasks/today`, {
        headers: {
          "x-auth-token": token, // Attach the token to the request headers
        },
      });
      setTasks(response.data); // Updates the tasks state with fetched data
    } catch (error) {
      console.error("Error fetching tasks due today:", error);
      Alert.alert(
        "Error",
        "Unable to fetch tasks. Please check your connection."
      ); // Show an alert if there's an error fetching tasks
    }
  };

  // Function to toggle the completion status of a task
  const toggleCompleteTask = async (task) => {
    try {
      const updatedTask = {
        ...task,
        completed: !task.completed, // Toggle the completed status
      };
      await axios.put(
        `http://localhost:3000/tasks/${task.listId}/${task._id}`,
        updatedTask
      );
      fetchTasksDueToday(); 
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Unable to update the task. Please try again."); 
    }
  };

  // Function to render the right swipe action (delete button) for each task
  const renderRightActions = (id, listId) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteTask(id, listId)} // Delete task when pressed
    >
      <MaterialIcons name="delete" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  // Function to delete a task
  const deleteTask = async (id, listId) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${listId}/${id}`);
      fetchTasksDueToday(); // Re-fetch tasks to reflect the deletion
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", "Unable to delete the task. Please try again."); 
    }
  };

  // Function to format the task due date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const currentYear = new Date().getFullYear();
    const taskYear = date.getFullYear();

    // If the task is due this year, show just the month/day, otherwise include the year
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
      source={require("../../assets/may-day.png")} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>My Day</Text>
        {/* FlatList to display tasks due today */}
        <FlatList
          data={tasks} // Data source for the list
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() =>
                renderRightActions(item._id, item.listId) // Swipe action for deleting a task
              }
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("TaskDetails", {
                    task: item,
                    listId: item.listId,
                    fetchTasks: fetchTasksDueToday, // passes the fetch function to refresh tasks after editing
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
                      color={item.completed ? "#22A39F" : "#222831"} // Green if completed, dark if not
                    />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    {/* Shows the task name with a strikethrough if completed */}
                    <Text
                      style={[
                        styles.task,
                        item.completed && styles.completedTask,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {/* Shows attachment icon and count if there are attachments */}
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
                    {/* Displays due date and warning if the task is overdue */}
                    <View style={styles.dueDateContainer}>
                      <MaterialIcons
                        name="calendar-today"
                        size={18}
                        color={
                          item.dueDate && new Date(item.dueDate) < new Date()
                            ? "red" // Red for overdue tasks
                            : new Date(item.dueDate).toDateString() ===
                              new Date().toDateString()
                            ? "#F4D160" // Yellow for tasks due today
                            : "#222831" // Default dark color for upcoming tasks
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
                        {item.dueDate ? formatDate(item.dueDate) : ""} {/* Format and display due date */}
                      </Text>
                      {item.dueDate && new Date(item.dueDate) < new Date() && (
                        <MaterialIcons name="error" size={18} color="red" /> // Error icon for overdue tasks
                      )}
                    </View>
                    {/* Show category orb if the task has a category */}
                    {item.category && (
                      <View
                        style={[
                          styles.categoryOrb,
                          { backgroundColor: item.category.color }, // Category color for the orb
                        ]}
                      >
                        <Text style={styles.categoryOrbText}>
                          {item.category.name} {/* Display the category name */}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
          keyExtractor={(item) => item._id.toString()} 
        />
      </View>
    </ImageBackground>
  );
};


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
});

export default MyDayScreen;

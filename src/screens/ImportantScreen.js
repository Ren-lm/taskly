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
import { MaterialIcons, FontAwesome } from "react-native-vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import axios from "axios";
import { useUser } from "../hooks/useUser";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ImportantScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const user = useUser();

  useEffect(() => {
    fetchImportantTasks();
  }, []);

  const fetchImportantTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/tasks/important`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      console.log("Important tasks fetched:", response.data);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching important tasks:", error);
      Alert.alert(
        "Error",
        "Unable to fetch tasks. Please check your connection."
      );
    }
  };

  const toggleCompleteTask = async (task) => {
    try {
      if (!task.listId || !task._id) {
        console.error("Task ID or listId is missing for task:", task);
        Alert.alert("Error", "Task ID or List ID is missing.");
        return;
      }

      const updatedTask = {
        ...task,
        completed: !task.completed,
      };
      console.log("Updating task:", updatedTask);

      const response = await axios.put(
        `http://localhost:3000/tasks/${task.listId}/${task._id}`,
        updatedTask
      );
      console.log("Task updated successfully:", response.data);

      fetchImportantTasks();
    } catch (error) {
      console.error(
        "Error updating task:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Unable to update the task. Please try again.");
    }
  };

  const renderRightActions = (id, listId) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteTask(id, listId)}
    >
      <MaterialIcons name="delete" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  const deleteTask = async (id, listId) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${listId}/${id}`);
      fetchImportantTasks(); // Re-fetch tasks to reflect deletion
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", "Unable to delete the task. Please try again.");
    }
  };

  const formatDate = (dateString) => {
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

  return (
    <ImageBackground
      source={require("../../assets/important-bkg.jpeg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Important</Text>
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() =>
                renderRightActions(item._id, item.listId)
              }
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("TaskDetails", {
                    task: item,
                    listId: item.listId,
                    fetchTasks: fetchImportantTasks,
                  })
                }
              >
                <View style={styles.taskContainer}>
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
                    <Text
                      style={[
                        styles.task,
                        item.completed && styles.completedTask,
                      ]}
                    >
                      {item.name}
                    </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // to make the content more readable over the image
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
    flex: 1, // Ensure task name takes up available space
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
    marginLeft: 5, // Space between due date and star icon
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

export default ImportantScreen;

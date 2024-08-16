// Frontend code: TaskDetails.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { MaterialIcons, AntDesign, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Linking from "expo-linking";
import axios from "axios";

// Predefined color options for categories and then users can add more later through UI
const predefinedColors = [
  { name: "Red", value: "#FF0000" },
  { name: "Green", value: "#00FF00" },
  { name: "Blue", value: "#0000FF" },
];

const TaskDetails = ({ route, navigation }) => {
  const { task, listId, fetchTasks } = route.params; // Gets task details and fetchTasks function from route params
  const [taskName, setTaskName] = useState(task ? task.name : ""); // State to store the task name
  const [description, setDescription] = useState(task ? task.description : ""); // State to store the task description
  const [selectedDate, setSelectedDate] = useState(
    task ? new Date(task.dueDate) : new Date()
  ); // State to store the selected due date
  const [attachedFiles, setAttachedFiles] = useState(
    task && task.files ? task.files : []
  ); // State to store attached files
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false); // State to control date picker visibility
  const [categories, setCategories] = useState([]); // State to store categories
  const [selectedCategory, setSelectedCategory] = useState(
    task ? task.category : null
  ); // State to store the selected category
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false); // State to control category modal visibility
  const [newCategoryName, setNewCategoryName] = useState(""); // State to store the new category name
  const [newCategoryColor, setNewCategoryColor] = useState(""); // State to store the new category color
  const [isEditMode, setIsEditMode] = useState(false); // State to track whether we're editing an existing category
  const [categoryToEdit, setCategoryToEdit] = useState(null); // State to store the category being edited

  // Fetch categories when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Update selected category if the task's category changes
  useEffect(() => {
    if (task && task.category) {
      setSelectedCategory(task.category);
    }
  }, [task]);

  // Function to fetch categories from the server
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/categories");
      setCategories(response.data); // Update the categories state with fetched data
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Function to add the task to Google Calendar
  const addToCalendar = async () => {
    try {
      const response = await axios.post("http://localhost:3000/create-event", {
        summary: taskName,
        description,
        location: "Online",
        startDateTime: selectedDate.toISOString(),
        endDateTime: new Date(
          selectedDate.getTime() + 60 * 60 * 1000
        ).toISOString(), 
      });
      console.log("Event URL:", response.data.eventUrl);
      Alert.alert("Success", "Event added to Google Calendar"); // success alert
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
      Alert.alert(
        "Error",
        "Could not add event to Google Calendar. Please try again later."
      ); // error alert
    }
  };

  // Function to add a new category
  const addCategory = async () => {
    if (!newCategoryName || !newCategoryColor) {
      Alert.alert(
        "Validation Error",
        "Both name and color of the category are required"
      ); //  validation error if inputs are missing
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/categories", {
        name: newCategoryName,
        color: newCategoryColor,
      });
      // updates catgory state with new category, clears input fields and closes category modal 
      setCategories([...categories, response.data]); 
      setNewCategoryName(""); 
      setNewCategoryColor("");
      setIsCategoryModalVisible(false); 
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Function to edit an existing category
  const editCategory = async () => {
    if (!categoryToEdit || !newCategoryName || !newCategoryColor) {
      Alert.alert(
        "Validation Error",
        "Both name and color of the category are required"
      ); // validation error if inputs are missing
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:3000/categories/${categoryToEdit._id}`,
        {
          name: newCategoryName,
          color: newCategoryColor,
        }
      );
      setCategories(
        categories.map((cat) =>
          cat._id === categoryToEdit._id ? response.data : cat
        )
      ); // This uppdates categories state with the edited category, clears input fields, exits edit mode and closes the modal
      setNewCategoryName("");
      setNewCategoryColor("");
      setCategoryToEdit(null); 
      setIsEditMode(false); 
      setIsCategoryModalVisible(false); 
    } catch (error) {
      console.error("Error editing category:", error);
    }
  };

  // Function to delete a category
  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/categories/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id)); // Removes deleted category 
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Function to open the modal for editing a category
  const openEditCategoryModal = (category) => {
    setCategoryToEdit(category); // Set the category to be edited
    setNewCategoryName(category.name); // Pre-fill the category name
    setNewCategoryColor(category.color); // Pre-fill the category color
    setIsEditMode(true); 
    setIsCategoryModalVisible(true); 
  };

  // Function to save the task, either create a new task or update an existing one
  const saveTask = async () => {
    if (!taskName) {
      Alert.alert("Validation Error", "Task name is required"); 
      return;
    }

    try {
      if (task) {
        const updatedTask = {
          ...task,
          name: taskName,
          description,
          dueDate: selectedDate,
          files: attachedFiles,
          category: selectedCategory,
          important: task.important || false, // Maintains the important field
        };
        await axios.put(
          `http://localhost:3000/tasks/${listId}/${task._id}`,
          updatedTask
        ); // Update the task on the server
      } else {
        const newTask = {
          name: taskName,
          description,
          dueDate: selectedDate,
          completed: false,
          files: attachedFiles,
          category: selectedCategory,
          important: false,
        };
        await axios.post(`http://localhost:3000/tasks`, {
          listId,
          task: newTask,
        }); // Create a new task on the server
      }

      fetchTasks(); // Re-fetch the tasks to update the UI
      navigation.goBack();
    } catch (error) {
      console.error("Error saving task:", error);
      Alert.alert("Error", "Could not save task. Please try again later."); 
    }
  };

  // Function to handle file picker action
  const handleFilePicker = async () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Photo Library", "Camera", "Files"],
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          await handleImagePicker("library"); // Open photo library
        } else if (buttonIndex === 2) {
          await handleImagePicker("camera"); // Open camera
        } else if (buttonIndex === 3) {
          await pickDocument(); // Open file picker
        }
      }
    );
  };

  // Function to handle image selection from camera or library
  const handleImagePicker = async (source) => {
    try {
      let result;
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          base64: true,
        }); // Launches devices camera
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          base64: true,
        }); // Open image library
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append("file", {
          uri: asset.uri,
          name: asset.uri.split("/").pop(),
          type: asset.type,
        });

        const response = await axios.post(
          "http://localhost:3000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setAttachedFiles([...attachedFiles, response.data]); // Add the selected file to the attached files state
      } else {
        console.error("Image picker error: ", result);
        Alert.alert("Error", "Could not select the image. Please try again."); // Shows an error alert incase image selection fails
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while selecting the image. Please try again."
      ); // Show error alert if an error occurs during image selection
    }
  };

  // Function to pick a document
  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({});

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        const formData = new FormData();
        formData.append("file", {
          uri: asset.uri,
          name: asset.uri.split("/").pop(),
          type: asset.mimeType,
        });

        const response = await axios.post(
          "http://localhost:3000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setAttachedFiles([...attachedFiles, response.data]); 
        console.error("Image picker error: ", result);
        Alert.alert(
          "Error",
          "Could not select the document. Please try again."
        ); // error alert
      }
    } catch (error) {
      console.error("Error selecting document:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while selecting the document. Please try again."
      ); // error alert
    }
  };

  // Function to handle file opening
  const handleFileOpen = async (uri) => {
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL(uri);
      } else {
        const cUri = await FileSystem.getContentUriAsync(uri);
        IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: cUri,
          flags: 1,
        }); 
      }
    } catch (err) {
      console.error("Failed to open file:", err);
      Alert.alert("Error", "Could not open file. Please try again later."); 
    }
  };

  // Function to remove a file from the attached files list
  const handleFileRemove = (index) => {
    const updatedFiles = [...attachedFiles];
    updatedFiles.splice(index, 1); 
    setAttachedFiles(updatedFiles);
  };

  // Function to add the task to "My Day"
  const addToMyDay = async () => {
    if (!task || !task._id) {
      Alert.alert("Error", "Task not found. Please try again."); 
      return;
    }

    try {
      const updatedTask = {
        ...task,
        dueDate: new Date(), // Set due date to today
      };
      await axios.put(
        `http://localhost:3000/tasks/${listId}/${task._id}`,
        updatedTask
      );
      Alert.alert("Success", "Task added to My Day"); // success alert
      fetchTasks(); 
      navigation.goBack();
    } catch (error) {
      console.error("Error adding task to My Day:", error);
      Alert.alert(
        "Error",
        "Could not add task to My Day. Please try again later."
      ); 
    }
  };

  // Function to mark a task as important
  const markAsImportant = async () => {
    if (!task || !task._id) {
      Alert.alert("Error", "Task not found. Please try again."); 
      return;
    }
    try {
      const updatedTask = {
        ...task,
        important: !task?.important, // Toggle the important status
      };
      await axios.put(
        `http://localhost:3000/tasks/${listId}/${task._id}`,
        updatedTask
      );
      Alert.alert(
        "Success",
        !task.important
          ? "Task marked as important"
          : "Task removed from important"
      ); // Show success alert based on the updated important status
      fetchTasks();
      navigation.goBack(); 
    } catch (error) {
      console.error("Error marking task as important:", error);
      Alert.alert(
        "Error",
        "Could not mark task as important. Please try again later."
      ); // Shows error alert if the task couldn't be marked as important
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.paddingContainer}>
        <TextInput
          style={styles.taskNameInput}
          placeholder="Task name"
          value={taskName}
          onChangeText={setTaskName} // Update the task name state on input change
        />
        <View style={styles.separator} />

        {/* add the task to Google Calendar */}
        <TouchableOpacity
          style={styles.optionContainer}
          onPress={addToCalendar}
        >
          <AntDesign name="calendar" size={24} color="#007AFF" />
          <Text style={styles.addStep}>Add to Calendar</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        {/* add the task to "My Day" */}
        <TouchableOpacity style={styles.optionContainer} onPress={addToMyDay}>
          <FontAwesome name="sun-o" size={24} color="#666666" />
          <Text style={styles.option}>Add to My Day</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        {/* mark the task as important */}
        <TouchableOpacity
          style={styles.optionContainer}
          onPress={markAsImportant}
        >
          <FontAwesome name="star" size={24} color="#FFD700" />
          <Text style={styles.option}>
            {!task?.important ? "Mark as Important" : "Remove as Important"}
          </Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.optionContainer}>
          <MaterialIcons name="notifications-none" size={24} color="#666666" />
          <Text style={styles.option}>Remind Me</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        {/*add a due date to the task */}
        <TouchableOpacity
          style={styles.optionContainer}
          onPress={() => setIsDatePickerVisible(true)}
        >
          <MaterialIcons name="calendar-today" size={24} color="#666666" />
          <Text style={styles.option}>Add Due Date</Text>
        </TouchableOpacity>
        {isDatePickerVisible && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setIsDatePickerVisible(false);
              if (date) setSelectedDate(date); // Update the selected date state
            }}
          />
        )}
        {selectedDate && (
          <Text style={styles.selectedDate}>{selectedDate.toDateString()}</Text> // Display the selected date
        )}
        <View style={styles.separator} />

        {/* Category selection  */}
        <View style={styles.optionContainer}>
          <Text style={styles.option}>Category</Text>
          <TouchableOpacity
            style={styles.categoryPickerButton}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <Text style={styles.categoryPickerButtonText}>
              {selectedCategory ? selectedCategory.name : "Select Category"}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={24}
              color="#666666"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        {/* Displays the selected category */}
        {selectedCategory && (
          <View
            style={[
              styles.categoryOrb,
              { backgroundColor: selectedCategory.color },
            ]}
          >
            <Text style={styles.categoryOrbText}>{selectedCategory.name}</Text>
          </View>
        )}

        {/* adds a file to the task */}
        <TouchableOpacity
          style={styles.optionContainer}
          onPress={handleFilePicker}
        >
          <MaterialIcons name="attach-file" size={24} color="#666666" />
          <Text style={styles.option}>Add File</Text>
        </TouchableOpacity>

        {/* Display the list of attached files */}
        {attachedFiles.map((file, index) => (
          <View key={index} style={styles.filePreviewContainer}>
            {file.type && file.type.startsWith("image") ? (
              <MaterialIcons name="image" size={20} color="#222831" />
            ) : (
              <MaterialIcons
                name="insert-drive-file"
                size={20}
                color="#222831"
              />
            )}
            <TouchableOpacity onPress={() => handleFileOpen(file.uri)}>
              <Text style={styles.fileName}>{file.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFileRemove(index)}>
              <MaterialIcons name="delete" size={20} color="#EE4E4E" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.separator} />

        <TextInput
          style={styles.addNote}
          placeholder="Add Note"
          value={description}
          onChangeText={setDescription} // Update the description state on input change
          multiline
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
        <Text style={styles.saveButtonText}>
          {task ? "Update Task" : "Save Task"} {/* Button text changes based on whether the task is being updated or created */}
        </Text>
      </TouchableOpacity>

      {/* Modal for selecting or adding a category */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select or Add Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.categoryItem}>
                  <TouchableOpacity
                    style={styles.categoryOption}
                    onPress={() => {
                      setSelectedCategory(item); // Set the selected category
                      setIsCategoryModalVisible(false); 
                    }}
                  >
                    <View
                      style={[styles.colorBox, { backgroundColor: item.color }]}
                    />
                    <Text style={styles.categoryOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      onPress={() => openEditCategoryModal(item)}
                    >
                      <MaterialIcons name="edit" size={24} color="#000000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteCategory(item._id)}>
                      <MaterialIcons name="delete" size={24} color="#EE4E4E" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            <Text style={styles.modalSubtitle}>
              {isEditMode ? "Edit" : "Add"} Category {/* The text will changes based on mode */}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName} // Update category name input
            />
            <FlatList
              data={predefinedColors}
              horizontal
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.colorOption, { backgroundColor: item.value }]}
                  onPress={() => setNewCategoryColor(item.value)} // Updates category color input
                >
                  {newCategoryColor === item.value && (
                    <MaterialIcons name="check" size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TextInput
              style={styles.input}
              placeholder="Or Enter Custom Color (e.g., #FF0000)"
              value={newCategoryColor}
              onChangeText={setNewCategoryColor} // Updates custom color input
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={isEditMode ? editCategory : addCategory} // Either edit or add a category based on mode
            >
              <Text style={styles.saveButtonText}>
                {isEditMode ? "Update Category" : "Add Category"} {/* Button text changes based on mode */}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsCategoryModalVisible(false)} 
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  paddingContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  taskNameInput: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
    paddingHorizontal: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addStep: {
    fontSize: 18,
    color: "#007AFF",
    marginLeft: 10,
  },
  option: {
    fontSize: 18,
    color: "#666666",
    marginLeft: 10,
  },
  selectedDate: {
    fontSize: 16,
    color: "#222831",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  addNote: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: "#222831",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  filePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  fileName: {
    fontSize: 14,
    color: "#222831",
    marginLeft: 5,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#dddddd",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#000000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: "#222831",
    marginBottom: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: "#EEEEEE",
    flex: 1,
    justifyContent: "space-between",
  },
  categoryPickerButtonText: {
    fontSize: 16,
    color: "#222831",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#EEEEEE",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#222831",
    fontSize: 16,
  },
  categoryOrb: {
    marginTop: 5,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  categoryOrbText: {
    fontSize: 14,
    color: "#FFFFFF", 
  },
});

export default TaskDetails;

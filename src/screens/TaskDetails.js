//Frontend code: TaskDetails.js

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Modal, FlatList, Platform, ActionSheetIOS
} from 'react-native';
import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import axios from 'axios';

const predefinedColors = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Blue', value: '#0000FF' },
];

const TaskDetails = ({ route, navigation }) => {
  const { task, listId, fetchTasks } = route.params;
  const [taskName, setTaskName] = useState(task ? task.name : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [selectedDate, setSelectedDate] = useState(task ? new Date(task.dueDate) : new Date());
  const [attachedFiles, setAttachedFiles] = useState(task && task.files ? task.files : []);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(task ? task.category : null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (task && task.category) {
      setSelectedCategory(task.category);
    }
  }, [task]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName || !newCategoryColor) {
      Alert.alert('Validation Error', 'Both name and color of the category are required');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/categories', {
        name: newCategoryName,
        color: newCategoryColor,
      });
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setNewCategoryColor('');
      setIsCategoryModalVisible(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const editCategory = async () => {
    if (!categoryToEdit || !newCategoryName || !newCategoryColor) {
      Alert.alert('Validation Error', 'Both name and color of the category are required');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:3000/categories/${categoryToEdit._id}`, {
        name: newCategoryName,
        color: newCategoryColor,
      });
      setCategories(categories.map(cat => (cat._id === categoryToEdit._id ? response.data : cat)));
      setNewCategoryName('');
      setNewCategoryColor('');
      setCategoryToEdit(null);
      setIsEditMode(false);
      setIsCategoryModalVisible(false);
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/categories/${id}`);
      setCategories(categories.filter(cat => cat._id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const openEditCategoryModal = (category) => {
    setCategoryToEdit(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setIsEditMode(true);
    setIsCategoryModalVisible(true);
  };


  const saveTask = async () => {
    if (!taskName) {
      Alert.alert('Validation Error', 'Task name is required');
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
          important: task.important || false, // Maintain important field
        };
        await axios.put(`http://localhost:3000/tasks/${listId}/${task._id}`, updatedTask);
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
        await axios.post(`http://localhost:3000/tasks`, { listId, task: newTask });
      }
  
      fetchTasks();
      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Could not save task. Please try again later.');
    }
  };
  

  const handleFilePicker = async () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Photo Library', 'Camera', 'Files'],
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          await handleImagePicker('library');
        } else if (buttonIndex === 2) {
          await handleImagePicker('camera');
        } else if (buttonIndex === 3) {
          await pickDocument();
        }
      }
    );
  };

  const handleImagePicker = async (source) => {
    try {
      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: asset.uri.split('/').pop(),
          type: asset.type,
        });

        const response = await axios.post('http://localhost:3000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setAttachedFiles([...attachedFiles, response.data]);
      } else {
        console.error('Image picker error: ', result);
        Alert.alert('Error', 'Could not select the image. Please try again.');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'An unexpected error occurred while selecting the image. Please try again.');
    }
  };

  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({});
      if (result.type === 'success') {
        const formData = new FormData();
        formData.append('file', {
          uri: result.uri,
          name: result.name,
          type: result.mimeType,
        });

        const response = await axios.post('http://localhost:3000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setAttachedFiles([...attachedFiles, response.data]);
      } else {
        console.error('Document picker error: ', result);
        Alert.alert('Error', 'Could not select the document. Please try again.');
      }
    } catch (error) {
      console.error('Error selecting document:', error);
      Alert.alert('Error', 'An unexpected error occurred while selecting the document. Please try again.');
    }
  };

  const handleFileOpen = async (uri) => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL(uri);
      } else {
        const cUri = await FileSystem.getContentUriAsync(uri);
        IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: cUri,
          flags: 1,
        });
      }
    } catch (err) {
      console.error('Failed to open file:', err);
      Alert.alert('Error', 'Could not open file. Please try again later.');
    }
  };

  const handleFileRemove = (index) => {
    const updatedFiles = [...attachedFiles];
    updatedFiles.splice(index, 1);
    setAttachedFiles(updatedFiles);
  };

  const addToMyDay = async () => {
    if (!task || !task._id) {
      Alert.alert('Error', 'Task not found. Please try again.');
      return;
    }
  
    try {
      const updatedTask = {
        ...task,
        dueDate: new Date(), // Set due date to today
      };
      await axios.put(`http://localhost:3000/tasks/${listId}/${task._id}`, updatedTask);
      Alert.alert('Success', 'Task added to My Day');
      fetchTasks(); // Refetch the tasks to ensure the UI is updated
      navigation.goBack(); // Navigate back after ensuring the task is updated
    } catch (error) {
      console.error('Error adding task to My Day:', error);
      Alert.alert('Error', 'Could not add task to My Day. Please try again later.');
    }
  };

  // Function to mark task as important
  const markAsImportant = async () => {
    if (!task || !task._id) {
      Alert.alert('Error', 'Task not found. Please try again.');
      return;
    }
  
    try {
      const updatedTask = {
        ...task,
        important: true, // Set the task as important
      };
      await axios.put(`http://localhost:3000/tasks/${listId}/${task._id}`, updatedTask);
      Alert.alert('Success', 'Task marked as important');
      fetchTasks(); // Refetch the tasks to ensure the UI is updated
      navigation.goBack(); // Navigate back after ensuring the task is updated
    } catch (error) {
      console.error('Error marking task as important:', error);
      Alert.alert('Error', 'Could not mark task as important. Please try again later.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.paddingContainer}>
        <TextInput
          style={styles.taskNameInput}
          placeholder="Task name"
          value={taskName}
          onChangeText={setTaskName}
        />
        <View style={styles.separator} />

        <TouchableOpacity style={styles.optionContainer}>
          <AntDesign name="plus" size={24} color="#007AFF" />
          <Text style={styles.addStep}>Add Step</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.optionContainer} onPress={addToMyDay}>
          <FontAwesome name="sun-o" size={24} color="#666666" />
          <Text style={styles.option}>Add to My Day</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.optionContainer} onPress={markAsImportant}>
          <FontAwesome name="star" size={24} color="#FFD700" />
          <Text style={styles.option}>Mark as Important</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.optionContainer}>
          <MaterialIcons name="notifications-none" size={24} color="#666666" />
          <Text style={styles.option}>Remind Me</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.optionContainer} onPress={() => setIsDatePickerVisible(true)}>
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
              if (date) setSelectedDate(date);
            }}
          />
        )}
        {selectedDate && (
          <Text style={styles.selectedDate}>{selectedDate.toDateString()}</Text>
        )}
        <View style={styles.separator} />

        <View style={styles.optionContainer}>
          <Text style={styles.option}>Category</Text>
          <TouchableOpacity style={styles.categoryPickerButton} onPress={() => setIsCategoryModalVisible(true)}>
            <Text style={styles.categoryPickerButtonText}>
              {selectedCategory ? selectedCategory.name : 'Select Category'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />

        {selectedCategory && (
          <View style={[styles.categoryOrb, { backgroundColor: selectedCategory.color }]}>
            <Text style={styles.categoryOrbText}>{selectedCategory.name}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.optionContainer} onPress={handleFilePicker}>
          <MaterialIcons name="attach-file" size={24} color="#666666" />
          <Text style={styles.option}>Add File</Text>
        </TouchableOpacity>
        {attachedFiles.map((file, index) => (
          <View key={index} style={styles.filePreviewContainer}>
            {file.type && file.type.startsWith('image') ? (
              <MaterialIcons name="image" size={20} color="#222831" />
            ) : (
              <MaterialIcons name="insert-drive-file" size={20} color="#222831" />
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
          onChangeText={setDescription}
          multiline
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
        <Text style={styles.saveButtonText}>{task ? 'Update Task' : 'Save Task'}</Text>
      </TouchableOpacity>

      <Modal visible={isCategoryModalVisible} transparent={true} animationType="slide">
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
                      setSelectedCategory(item);
                      setIsCategoryModalVisible(false);
                    }}
                  >
                    <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                    <Text style={styles.categoryOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => openEditCategoryModal(item)}>
                      <MaterialIcons name="edit" size={24} color="#000000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteCategory(item._id)}>
                      <MaterialIcons name="delete" size={24} color="#EE4E4E" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            <Text style={styles.modalSubtitle}>{isEditMode ? 'Edit' : 'Add'} Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <FlatList
              data={predefinedColors}
              horizontal
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.colorOption, { backgroundColor: item.value }]}
                  onPress={() => setNewCategoryColor(item.value)}
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
              onChangeText={setNewCategoryColor}
            />
            <TouchableOpacity style={styles.saveButton} onPress={isEditMode ? editCategory : addCategory}>
              <Text style={styles.saveButtonText}>{isEditMode ? 'Update Category' : 'Add Category'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCategoryModalVisible(false)}>
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
    backgroundColor: '#FFFFFF',
  },
  paddingContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  taskNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
    paddingHorizontal: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addStep: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 10,
  },
  option: {
    fontSize: 18,
    color: '#666666',
    marginLeft: 10,
  },
  selectedDate: {
    fontSize: 16,
    color: '#222831',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  addNote: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#222831',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  filePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  fileName: {
    fontSize: 14,
    color: '#222831',
    marginLeft: 5,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#222831',
    marginBottom: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#EEEEEE',
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryPickerButtonText: {
    fontSize: 16,
    color: '#222831',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#EEEEEE',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#222831',
    fontSize: 16,
  },
  categoryOrb: {
    marginTop: 5,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center', // Center align the orb
  },
  categoryOrbText: {
    fontSize: 14,
    color: '#FFFFFF', // Text color for the orb
  },
});

export default TaskDetails;

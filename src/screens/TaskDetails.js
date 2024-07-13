// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
// import { MaterialIcons } from '@expo/vector-icons';
// import { Linking } from 'react-native';
// import axios from 'axios';

// const TaskDetails = ({ route, navigation }) => {
//   const { task, listId, fetchTasks } = route.params;
//   const [taskName, setTaskName] = useState(task ? task.name : '');
//   const [description, setDescription] = useState(task ? task.description : '');
//   const [selectedDate, setSelectedDate] = useState(task ? new Date(task.dueDate) : new Date());
//   const [attachedFiles, setAttachedFiles] = useState(task ? task.attachedFiles : []);
//   const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

//   const handleDateChange = (event, date) => {
//     setIsDatePickerVisible(false);
//     if (date) {
//       setSelectedDate(date);
//     }
//   };

//   const handleFilePicker = async () => {
//     let result = await DocumentPicker.getDocumentAsync({});
//     if (result.type === 'success') {
//       const base64 = await convertFileToBase64(result.uri);
//       setAttachedFiles([...attachedFiles, { uri: result.uri, name: result.name, type: result.mimeType, base64 }]);
//     }
//   };

//   const handleImagePicker = async (source) => {
//     let result;
//     if (source === 'camera') {
//       result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.All,
//         base64: true,
//       });
//     } else {
//       result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.All,
//         base64: true,
//       });
//     }

//     if (!result.canceled) {
//       setAttachedFiles([...attachedFiles, { uri: result.uri, name: result.uri.split('/').pop(), type: result.type, base64: result.base64 }]);
//     }
//   };

//   const convertFileToBase64 = async (uri) => {
//     const response = await fetch(uri);
//     const blob = await response.blob();
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         resolve(reader.result.split(',')[1]);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   };

//   const saveTask = async () => {
//     const taskData = {
//       name: taskName,
//       description,
//       dueDate: selectedDate,
//       completed: task ? task.completed : false,
//       attachedFiles,
//     };
//     try {
//       if (task) {
//         await axios.put(`http://localhost:3000/tasks/${listId}/${task._id}`, taskData);
//       } else {
//         await axios.post(`http://localhost:3000/tasks`, { listId, task: taskData });
//       }
//       fetchTasks();
//       navigation.goBack();
//     } catch (error) {
//       console.error('Error saving task:', error);
//       Alert.alert('Error', 'An error occurred while saving the task');
//     }
//   };

//   const handleFileOpen = async (file) => {
//     try {
//       const supported = await Linking.canOpenURL(file.uri);
//       if (supported) {
//         await Linking.openURL(file.uri);
//       } else {
//         Alert.alert("Error", "Unable to open file");
//       }
//     } catch (error) {
//       console.error('Error opening file:', error);
//       Alert.alert("Error", "An error occurred while trying to open the file");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Task name"
//         value={taskName}
//         onChangeText={setTaskName}
//         placeholderTextColor="#31363F"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Task Description"
//         value={description}
//         onChangeText={setDescription}
//         placeholderTextColor="#31363F"
//       />
//       <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
//         <Text style={styles.dateButton}>Add Due Date</Text>
//       </TouchableOpacity>
//       {isDatePickerVisible && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display="default"
//           onChange={handleDateChange}
//         />
//       )}
//       {selectedDate && (
//         <Text style={styles.selectedDate}>{selectedDate.toDateString()}</Text>
//       )}
//       <TouchableOpacity onPress={handleFilePicker}>
//         <Text style={styles.dateButton}>Attach File</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => handleImagePicker('library')}>
//         <Text style={styles.dateButton}>Photo Library</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => handleImagePicker('camera')}>
//         <Text style={styles.dateButton}>Camera</Text>
//       </TouchableOpacity>
//       {attachedFiles.length > 0 && (
//         <FlatList
//           data={attachedFiles}
//           keyExtractor={(item) => item.uri}
//           renderItem={({ item }) => (
//             <TouchableOpacity onPress={() => handleFileOpen(item)}>
//               <View style={styles.filePreviewContainer}>
//                 <MaterialIcons name={item.type.startsWith('image/') ? "image" : "insert-drive-file"} size={20} color="#222831" />
//                 <Text style={styles.fileName}>{item.name}</Text>
//               </View>
//             </TouchableOpacity>
//           )}
//         />
//       )}
//       <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
//         <Text style={styles.saveButtonText}>Save Task</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#31363F',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#222831',
//     borderRadius: 5,
//     padding: 10,
//     paddingLeft: 8,
//     backgroundColor: '#FFFFFF',
//     color: '#222831',
//     marginBottom: 20,
//   },
//   dateButton: {
//     fontSize: 18,
//     color: '#22A39F',
//     marginVertical: 10,
//   },
//   selectedDate: {
//     fontSize: 16,
//     color: '#222831',
//     marginTop: 10,
//   },
//   saveButton: {
//     backgroundColor: '#22A39F',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   saveButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//   },
//   filePreviewContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   fileName: {
//     fontSize: 14,
//     color: '#AAAAAA',
//     marginLeft: 10,
//   },
// });

// export default TaskDetails;

// ------
// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActionSheetIOS } from 'react-native';
// import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import * as FileSystem from 'expo-file-system';
// import * as IntentLauncher from 'expo-intent-launcher';
// import axios from 'axios';

// const TaskDetails = ({ route, navigation }) => {
//   const { task, listId } = route.params;
//   const fetchTasks = route.params.fetchTasks;

//   const [taskName, setTaskName] = useState(task ? task.name : '');
//   const [description, setDescription] = useState(task ? task.description : '');
//   const [selectedDate, setSelectedDate] = useState(task ? new Date(task.dueDate) : new Date());
//   const [attachedFiles, setAttachedFiles] = useState(task && task.files ? task.files : []);
//   const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

//   const saveTask = async () => {
//     if (!taskName) {
//       Alert.alert('Validation Error', 'Task name is required');
//       return;
//     }

//     try {
//       if (task) {
//         const updatedTask = {
//           ...task,
//           name: taskName,
//           description,
//           dueDate: selectedDate,
//           files: attachedFiles,
//         };
//         await axios.put(`http://localhost:3000/tasks/${listId}/${task._id}`, updatedTask);
//       } else {
//         const newTask = {
//           name: taskName,
//           description,
//           dueDate: selectedDate,
//           completed: false,
//           files: attachedFiles,
//         };
//         await axios.post(`http://localhost:3000/tasks`, { listId, task: newTask });
//       }

//       fetchTasks();
//       navigation.goBack();
//     } catch (error) {
//       console.error('Error saving task:', error);
//       Alert.alert('Error', 'Could not save task. Please try again later.');
//     }
//   };

//   const handleFilePicker = async () => {
//     ActionSheetIOS.showActionSheetWithOptions(
//       {
//         options: ['Cancel', 'Photo Library', 'Camera', 'Files'],
//         cancelButtonIndex: 0,
//       },
//       async (buttonIndex) => {
//         if (buttonIndex === 1) {
//           await handleImagePicker('library');
//         } else if (buttonIndex === 2) {
//           await handleImagePicker('camera');
//         } else if (buttonIndex === 3) {
//           await pickDocument();
//         }
//       }
//     );
//   };

//   const handleImagePicker = async (source) => {
//     let result;
//     if (source === 'camera') {
//       result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.All,
//         base64: true,
//       });
//     } else {
//       result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.All,
//         base64: true,
//       });
//     }

//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       const asset = result.assets[0];
//       setAttachedFiles([...attachedFiles, { uri: asset.uri, name: asset.uri.split('/').pop(), type: asset.type }]);
//     } else {
//       console.error('Image picker error: ', result);
//       Alert.alert('Error', 'Could not select the image. Please try again.');
//     }
//   };

//   const pickDocument = async () => {
//     let result = await DocumentPicker.getDocumentAsync({});
//     if (result.type === 'success') {
//       setAttachedFiles([...attachedFiles, { uri: result.uri, name: result.name, type: result.mimeType }]);
//     } else {
//       console.error('Document picker error: ', result);
//       Alert.alert('Error', 'Could not select the document. Please try again.');
//     }
//   };

//   const handleFileOpen = async (uri) => {
//     try {
//       const cUri = await FileSystem.getContentUriAsync(uri);
//       IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
//         data: cUri,
//         flags: 1,
//       });
//     } catch (err) {
//       console.error('Failed to open file:', err);
//       Alert.alert('Error', 'Could not open file. Please try again later.');
//     }
//   };

//   const handleFileRemove = (index) => {
//     const updatedFiles = [...attachedFiles];
//     updatedFiles.splice(index, 1);
//     setAttachedFiles(updatedFiles);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.paddingContainer}>
//         <TextInput
//           style={styles.taskNameInput}
//           placeholder="Task name"
//           value={taskName}
//           onChangeText={setTaskName}
//         />
//         <View style={styles.separator} />

//         <TouchableOpacity style={styles.optionContainer}>
//           <AntDesign name="plus" size={24} color="#007AFF" />
//           <Text style={styles.addStep}>Add Step</Text>
//         </TouchableOpacity>
//         <View style={styles.separator} />

//         <TouchableOpacity style={styles.optionContainer}>
//           <FontAwesome name="sun-o" size={24} color="#666666" />
//           <Text style={styles.option}>Add to My Day</Text>
//         </TouchableOpacity>
//         <View style={styles.separator} />

//         <TouchableOpacity style={styles.optionContainer}>
//           <MaterialIcons name="notifications-none" size={24} color="#666666" />
//           <Text style={styles.option}>Remind Me</Text>
//         </TouchableOpacity>
//         <View style={styles.separator} />

//         <TouchableOpacity style={styles.optionContainer} onPress={() => setIsDatePickerVisible(true)}>
//           <MaterialIcons name="calendar-today" size={24} color="#666666" />
//           <Text style={styles.option}>Add Due Date</Text>
//         </TouchableOpacity>
//         {isDatePickerVisible && (
//           <DateTimePicker
//             value={selectedDate}
//             mode="date"
//             display="default"
//             onChange={(event, date) => {
//               setIsDatePickerVisible(false);
//               if (date) setSelectedDate(date);
//             }}
//           />
//         )}
//         {selectedDate && (
//           <Text style={styles.selectedDate}>{selectedDate.toDateString()}</Text>
//         )}
//         <View style={styles.separator} />

//         <TouchableOpacity style={styles.optionContainer} onPress={handleFilePicker}>
//           <MaterialIcons name="attach-file" size={24} color="#666666" />
//           <Text style={styles.option}>Add File</Text>
//         </TouchableOpacity>
//         {attachedFiles.map((file, index) => (
//           <View key={index} style={styles.filePreviewContainer}>
//             {file.type && file.type.startsWith('image') ? (
//               <MaterialIcons name="image" size={20} color="#222831" />
//             ) : (
//               <MaterialIcons name="insert-drive-file" size={20} color="#222831" />
//             )}
//             <TouchableOpacity onPress={() => handleFileOpen(file.uri)}>
//               <Text style={styles.fileName}>{file.name}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => handleFileRemove(index)}>
//               <MaterialIcons name="delete" size={20} color="#EE4E4E" />
//             </TouchableOpacity>
//           </View>
//         ))}
//         <View style={styles.separator} />

//         <TextInput
//           style={styles.addNote}
//           placeholder="Add Note"
//           value={description}
//           onChangeText={setDescription}
//           multiline
//         />
//       </View>
//       <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
//         <Text style={styles.saveButtonText}>{task ? 'Update Task' : 'Save Task'}</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   paddingContainer: {
//     paddingTop: 20,
//     paddingBottom: 20,
//   },
//   taskNameInput: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#000000',
//     paddingHorizontal: 20,
//   },
//   optionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   addStep: {
//     fontSize: 18,
//     color: '#007AFF',
//     marginLeft: 10,
//   },
//   option: {
//     fontSize: 18,
//     color: '#666666',
//     marginLeft: 10,
//   },
//   selectedDate: {
//     fontSize: 16,
//     color: '#222831',
//     marginBottom: 20,
//     paddingHorizontal: 20,
//   },
//   addNote: {
//     borderWidth: 1,
//     borderColor: '#dddddd',
//     borderRadius: 5,
//     padding: 10,
//     fontSize: 16,
//     color: '#222831',
//     marginBottom: 20,
//     paddingHorizontal: 20,
//   },
//   filePreviewContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//     marginBottom: 20,
//     paddingHorizontal: 20,
//   },
//   fileName: {
//     fontSize: 14,
//     color: '#222831',
//     marginLeft: 5,
//     flex: 1,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: '#dddddd',
//     marginHorizontal: 20,
//     marginVertical: 10,
//   },
//   saveButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginBottom: 20,
//     marginHorizontal: 20,
//   },
//   saveButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//   },
// });

// export default TaskDetails;


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActionSheetIOS, Platform } from 'react-native';
import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import axios from 'axios';

const TaskDetails = ({ route, navigation }) => {
  const { task, listId } = route.params;
  const fetchTasks = route.params.fetchTasks;

  const [taskName, setTaskName] = useState(task ? task.name : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [selectedDate, setSelectedDate] = useState(task ? new Date(task.dueDate) : new Date());
  const [attachedFiles, setAttachedFiles] = useState(task && task.files ? task.files : []);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

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
        };
        await axios.put(`http://localhost:3000/tasks/${listId}/${task._id}`, updatedTask);
      } else {
        const newTask = {
          name: taskName,
          description,
          dueDate: selectedDate,
          completed: false,
          files: attachedFiles,
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
      setAttachedFiles([...attachedFiles, { uri: asset.uri, name: asset.uri.split('/').pop(), type: asset.type }]);
    } else {
      console.error('Image picker error: ', result);
      Alert.alert('Error', 'Could not select the image. Please try again.');
    }
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      setAttachedFiles([...attachedFiles, { uri: result.uri, name: result.name, type: result.mimeType }]);
    } else {
      console.error('Document picker error: ', result);
      Alert.alert('Error', 'Could not select the document. Please try again.');
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

        <TouchableOpacity style={styles.optionContainer}>
          <FontAwesome name="sun-o" size={24} color="#666666" />
          <Text style={styles.option}>Add to My Day</Text>
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
});

export default TaskDetails;

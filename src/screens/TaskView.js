// Frontend Code: TaskView.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const TaskView = ({ route, navigation }) => {
  const { listId, listName } = route.params;
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0); // Used to reset the timer
  const [selectedTime, setSelectedTime] = useState(1500); // Default to 25 minutes (1500 seconds)
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [currentTask, setCurrentTask] = useState(null); // Track the current task for editing

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/tasks`, { params: { listId } });
      const validTasks = response.data.filter(task => task && task._id); // Ensure all tasks have _id
      setTasks(validTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addNewTask = async () => {
    if (taskName) {
      try {
        const response = await axios.post(`http://localhost:3000/tasks`, { listId, task: { name: taskName, description, dueDate: selectedDate, completed: false, file: selectedFile ? selectedFile.uri : '' } });
        setTasks([...tasks, response.data]);
        setTaskName('');
        setDescription('');
        setSelectedDate(new Date());
        setSelectedFile(null);
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3000/tasks/${listId}/${id}`);
      console.log('Task deleted successfully', response.data);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Could not delete task. Please try again later.');
    }
  };

  const toggleCompleteTask = async (id) => {
    try {
      const task = tasks.find(task => task._id === id);
      if (!task) return;

      const updatedTask = {
        ...task,
        completed: !task.completed,
        name: task.name || '', // Ensure name is not undefined
        dueDate: task.dueDate || new Date() // Ensure due date is not undefined
      };

      const response = await axios.put(`http://localhost:3000/tasks/${listId}/${id}`, updatedTask);
      setTasks(tasks.map(task => (task._id === id ? response.data : task)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(id)}>
      <MaterialIcons name="delete" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  const handleDateChange = (event, date) => {
    setIsDatePickerVisible(false);
    if (date) {
      setSelectedDate(date);
      setIsReminderSet(true);
    }
  };

  const handleFilePicker = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      setSelectedFile(result);
    }
  };

  const handleTimeSelect = (itemValue) => {
    if (itemValue === 'custom') {
      setIsCustomTime(true);
    } else {
      setIsCustomTime(false);
      setSelectedTime(itemValue);
    }
  };

  const handleCustomTimeSet = () => {
    const timeInSeconds = parseInt(customTime) * 60;
    if (!isNaN(timeInSeconds) && timeInSeconds > 0) {
      setSelectedTime(timeInSeconds);
      setIsTimerModalVisible(false);
    }
  };

  const openTaskDetails = (task) => {
    setCurrentTask(task);
    setTaskName(task.name);
    setDescription(task.description);
    setSelectedDate(new Date(task.dueDate));
    setSelectedFile(task.file ? { uri: task.file } : null);
    setIsModalVisible(true);
  };

  const updateTaskDetails = async () => {
    if (currentTask) {
      try {
        console.log('Updating task with ID:', currentTask._id, 'in list with ID:', listId); // Debugging log
        const updatedTask = {
          ...currentTask,
          name: taskName,
          description,
          dueDate: selectedDate,
          file: selectedFile ? selectedFile.uri : '',
        };
        const response = await axios.put(`http://localhost:3000/tasks/${listId}/${currentTask._id}`, updatedTask);
        setTasks(tasks.map(task => (task._id === currentTask._id ? response.data : task)));
        setIsModalVisible(false);
        setCurrentTask(null);
      } catch (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error', 'Could not update task. Please try again later.');
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>{listName}</Text>

        <View style={styles.timerContainer}>
          <CountdownCircleTimer
            key={key}
            isPlaying={isPlaying}
            duration={selectedTime}
            colors={['#22A39F', '#F4D160', '#EE4E4E']}
            colorsTime={[selectedTime, selectedTime / 2, selectedTime / 4]}
            onComplete={() => ({ shouldRepeat: false })}
          >
            {({ remainingTime }) => (
              <Text style={styles.timerText}>
                {`${Math.floor(remainingTime / 60)}:${('0' + (remainingTime % 60)).slice(-2)}`}
              </Text>
            )}
          </CountdownCircleTimer>
          <View style={styles.timerControls}>
            <TouchableOpacity onPress={() => setIsPlaying(prev => !prev)}>
              <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={32} color="#EEEEEE" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setKey(prevKey => prevKey + 1); setIsPlaying(false); }}>
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
              <TouchableOpacity onPress={() => openTaskDetails(item)}>
                <View style={styles.taskContainer}>
                  <TouchableOpacity onPress={() => toggleCompleteTask(item._id)}>
                    <MaterialIcons name={item.completed ? "check-circle" : "radio-button-unchecked"} size={24} color={item.completed ? "#22A39F" : "#222831"} />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.task, item.completed && styles.completedTask]}>{item.name}</Text>
                  </View>
                  <View style={styles.dueDateContainer}>
                    <MaterialIcons name="calendar-today" size={18} color={item.dueDate && new Date(item.dueDate) < new Date() ? "red" : "#222831"} />
                    <Text style={[styles.dueDate, item.dueDate && new Date(item.dueDate) < new Date() && styles.overdue]}>
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : ''}
                    </Text>
                    {item.dueDate && new Date(item.dueDate) < new Date() && (
                      <MaterialIcons name="error" size={18} color="red" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
          keyExtractor={item => item._id.toString()}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => {
          setCurrentTask(null);
          setTaskName('');
          setDescription('');
          setSelectedDate(new Date());
          setSelectedFile(null);
          setIsModalVisible(true);
        }}>
          <AntDesign name="pluscircle" size={50} color="#22A39F" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <TextInput
                    style={styles.input}
                    placeholder="Task name"
                    value={taskName}
                    onChangeText={setTaskName}
                    placeholderTextColor="#31363F"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Task Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor="#31363F"
                  />
                  <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
                    <Text style={styles.dateButton}>Add Due Date</Text>
                  </TouchableOpacity>
                  {isDatePickerVisible && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                  <TouchableOpacity onPress={handleFilePicker}>
                    <Text style={styles.dateButton}>Attach File</Text>
                  </TouchableOpacity>
                  {selectedFile && <Text style={styles.fileName}>{selectedFile.name}</Text>}
                  <TouchableOpacity style={styles.saveButton} onPress={currentTask ? updateTaskDetails : addNewTask}>
                    <Text style={styles.saveButtonText}>{currentTask ? 'Update Task' : 'Save Task'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isTimerModalVisible}
          onRequestClose={() => setIsTimerModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsTimerModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Timer Duration</Text>
                  <Picker
                    selectedValue={isCustomTime ? 'custom' : selectedTime}
                    style={styles.picker}
                    onValueChange={handleTimeSelect}
                  >
                    <Picker.Item label="5 minutes" value={300} />
                    <Picker.Item label="10 minutes" value={600} />
                    <Picker.Item label="15 minutes" value={900} />
                    <Picker.Item label="20 minutes" value={1200} />
                    <Picker.Item label="25 minutes" value={1500} />
                    <Picker.Item label="Custom" value="custom" />
                  </Picker>
                  {isCustomTime && (
                    <TextInput
                      style={styles.input}
                      placeholder="Enter custom time in minutes"
                      value={customTime}
                      onChangeText={setCustomTime}
                      placeholderTextColor="#31363F"
                      keyboardType="numeric"
                    />
                  )}
                  <TouchableOpacity style={styles.saveButton} onPress={handleCustomTimeSet}>
                    <Text style={styles.saveButtonText}>Set Timer</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#31363F',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 5,
  },
  task: {
    fontSize: 18,
    color: '#222831',
    marginLeft: 10,
    flex: 1, // Ensure task name takes up available space
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#AAAAAA',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  deleteButton: {
    backgroundColor: '#EE4E4E',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#EEEEEE',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#222831',
    borderRadius: 5,
    padding: 10,
    paddingLeft: 8,
    backgroundColor: '#FFFFFF',
    color: '#222831',
  },
  saveButton: {
    backgroundColor: '#22A39F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 10,
  },
  dateButton: {
    fontSize: 18,
    color: '#22A39F',
    marginVertical: 10,
  },
  fileName: {
    fontSize: 14,
    color: '#AAAAAA',
    marginVertical: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#31363F',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#31363F',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Align to the end (right side)
  },
  dueDate: {
    fontSize: 16,
    color: '#222831',
    marginLeft: 5,
  },
  overdue: {
    color: 'red',
  },
});

export default TaskView;

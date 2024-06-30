// Frontend Code: AccountScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const API_URL = 'http://localhost:3000';

const AccountScreen = ({ navigation }) => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch(`${API_URL}/lists`);
      const fetchedLists = await response.json();
      setLists(fetchedLists);
      console.log('Fetched lists:', fetchedLists);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const addNewList = async () => {
    if (listName) {
      try {
        const response = await fetch(`${API_URL}/lists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: listName, tasks: [] }),
        });
        await response.json();
        fetchLists();
        setListName('');
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error adding list:', error);
      }
    }
  };

  const deleteExistingList = async (id) => {
    try {
      await fetch(`${API_URL}/lists/${id}`, {
        method: 'DELETE',
      });
      fetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExistingList(id)}>
      <MaterialIcons name="delete" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.profileName}>Mary Park</Text>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="setting" size={24} color="#222831" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>My Day</Text>
        <Text style={styles.sectionTitle}>Important</Text>
        
        <Text style={styles.title}>My Lists</Text>
        <FlatList
          data={lists}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item._id)}>
              <TouchableOpacity onPress={() => navigation.navigate('TaskView', { listId: item._id, listName: item.name })}>
                <Text style={styles.listItem}>{item.name}</Text>
              </TouchableOpacity>
            </Swipeable>
          )}
          keyExtractor={item => item._id}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
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
                    placeholder="New list name"
                    value={listName}
                    onChangeText={setListName}
                    placeholderTextColor="#31363F"
                  />
                  <TouchableOpacity style={styles.saveButton} onPress={addNewList}>
                    <Text style={styles.saveButtonText}>Save List</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  iconButton: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  listItem: {
    fontSize: 18,
    padding: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderRadius: 5,
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
});

export default AccountScreen;

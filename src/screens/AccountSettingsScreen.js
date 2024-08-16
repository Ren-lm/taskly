// Frontend code: AccountSettingsScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, AsyncStorage } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const AccountSettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.navigate('Login');
          return;
        }

        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { 'x-auth-token': token },
        });
        setUser({
          ...user,
          name: response.data.name,
          email: response.data.email,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (user.newPassword !== user.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/auth/update`, user, {
        headers: { 'x-auth-token': token },
      });

      Alert.alert('Success', 'Account details updated successfully');
      navigation.goBack(); // Navigate back to the Account screen
    } catch (error) {
      Alert.alert('Error', 'Failed to update account details');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={user.password}
        onChangeText={(text) => setUser({ ...user, password: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={user.newPassword}
        onChangeText={(text) => setUser({ ...user, newPassword: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={user.confirmPassword}
        onChangeText={(text) => setUser({ ...user, confirmPassword: text })}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
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
  input: {
    borderWidth: 1,
    borderColor: '#222831',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#EEEEEE',
    marginBottom: 10,
    color: '#222831',
  },
  saveButton: {
    backgroundColor: '#22A39F',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default AccountSettingsScreen;

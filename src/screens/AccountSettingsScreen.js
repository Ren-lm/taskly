// Frontend code: AccountSettingsScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Set the base URL for the API requests
const API_URL = "http://localhost:3000";

// Main component for the account settings screen
const AccountSettingsScreen = ({ navigation }) => {
  // State to hold user information like name, email, and passwords
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  // This effect runs once when the component mounts to fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token"); // Get the auth token from local storage
        if (!token) {
          navigation.navigate("Login"); // If no token, navigate to the Login screen
          return;
        }

        // Fetch user data from the server
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { "x-auth-token": token },
        });

        // Set the user state with the fetched data (name and email)
        setUser({
          ...user,
          name: response.data.name,
          email: response.data.email,
        });
      } catch (error) {
        Alert.alert("Error", "Failed to load user data"); // Show an alert if there's an error
      }
    };

    fetchUserData();
  }, []);

  // Function to handle saving the updated account settings
  const handleSave = async () => {
    // Check if the name field is empty
    if (!user.name) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    // Check if the email field is empty
    if (!user.email) {
      Alert.alert("Error", "Email cannot be empty");
      return;
    }

    // Check if the current password is entered
    if (!user.password) {
      Alert.alert(
        "Error",
        "Please Enter your current password to update details"
      );
      return;
    }

    // If no new password is provided, just update the email and name
    if (!user.newPassword && !user.confirmPassword) {
      try {
        const token = await AsyncStorage.getItem("token"); // Get the token again
        const response = await axios.put(
          `${API_URL}/api/auth/update`,
          { ...user, mode: "email" }, // Only update email and name
          {
            headers: { "x-auth-token": token },
          }
        );

        Alert.alert("Success", "Account details updated successfully");
        navigation.goBack(); // Go back to the previous screen
      } catch (error) {
        console.log(error);
        Alert.alert("Error", error?.response?.data?.msg); // Show an error message if something goes wrong
      }
    } 
    // If a new password is provided, update the password
    else {
      // Check if the new password and confirm password fields match
      if (user.newPassword !== user.confirmPassword) {
        Alert.alert("Error", "New Password and Confirm Password do not match");
        return;
      }
      try {
        const token = await AsyncStorage.getItem("token"); // Get the token again
        const response = await axios.put(
          `${API_URL}/api/auth/update`,
          { ...user, mode: "password" }, // Update the password
          {
            headers: { "x-auth-token": token },
          }
        );

        Alert.alert("Success", "Account details updated successfully");
        navigation.goBack(); // Go back to the previous screen
      } catch (error) {
        console.log(error);
        Alert.alert("Error", error?.response?.data?.msg); // Show an error message if something goes wrong
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      {/* Input for the user's name */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })} // Update the name in state
      />
      {/* Input for the user's email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })} // Update the email in state
      />
      {/* Input for the current password */}
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={user.password}
        onChangeText={(text) => setUser({ ...user, password: text })} // Updates the current password in state
      />
      {/* Input for the new password */}
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={user.newPassword}
        onChangeText={(text) => setUser({ ...user, newPassword: text })} // Updates the new password in state
      />
      {/* Input for confirming the new password */}
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={user.confirmPassword}
        onChangeText={(text) => setUser({ ...user, confirmPassword: text })} // Updates the confirm password in state
      />
      {/* Button to save changes */}
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
    backgroundColor: "#31363F",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#222831",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#EEEEEE",
    marginBottom: 10,
    color: "#222831",
  },
  saveButton: {
    backgroundColor: "#22A39F",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default AccountSettingsScreen;

// Frontend code: LoginScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const qc = useQueryClient(); // Initialize query client for data fetching

  const handleLogin = async () => {
    try {
      // Make a POST request to the login API with email and password
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password }
      );
      // Store the received token in AsyncStorage
      await AsyncStorage.setItem("token", response.data?.token);
      // Refetch the user data after login
      qc.refetchQueries(["user"]);
    } catch (error) {
      // Show an alert if the login fails
      Alert.alert("Error", "Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../assets/tasklylogo.png")} // Displays the app logo
      />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail} // Updates the email state on change
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword} // Updates the password state on change
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEEEEE",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#222831",
  },

  input: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#22A39F",
    borderRadius: 5,
    marginTop: 20,
  },

  buttonText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
  },

  linkText: { color: "#22A39F", marginTop: 20 },
  logo: {
    width: 300,
    height: 300,
  },
});

export default LoginScreen;

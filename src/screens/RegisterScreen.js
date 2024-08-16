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

// RegisterScreen component for user registration
const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState(""); // State to store the user's name input
  const [email, setEmail] = useState(""); // State to store the user's email input
  const [password, setPassword] = useState(""); // State to store the user's password input

  // Function to handle user registration
  const handleRegister = async () => {
    try {
      // Makes a POST request to the register API with name, email, and password
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        { name, email, password }
      );
      // Show user a success alert on successful registration
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("LoginScreen"); // Navigate to the login screen
    } catch (error) {
      // This will show user an error alert if registration fails
      Alert.alert("Error", error.response.data);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../assets/tasklylogo.png")}
      />
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName} // Update name state on input change
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail} // Update email state on input change
        keyboardType="email-address" // Use email keyboard type
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword} // Update password state on input change
        secureTextEntry 
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
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
  title: { fontSize: 24, marginBottom: 20, color: "#222831" },
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
  buttonText: 
  { textAlign: "center",
   color: "#FFFFFF", 
   fontSize: 16 },

   logo: {
     width: 300,
     height: 300,
   },
});

export default RegisterScreen;

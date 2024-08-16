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

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        { name, email, password }
      );
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("LoginScreen");
    } catch (error) {
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
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
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

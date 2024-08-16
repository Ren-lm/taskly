// AppNavigator.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TaskView from "./screens/TaskView";
import AccountScreen from "./screens/AccountScreen";
import TaskDetails from "./screens/TaskDetails";
import MyDayScreen from "./screens/MyDayScreen";
import ImportantScreen from "./screens/ImportantScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import AccountSettingsScreen from "./screens/AccountSettingsScreen";
import { useUser } from "./hooks/useUser";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const user = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user.data ? (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="AccountScreen" component={AccountScreen} />
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsScreen}
            />
            <Stack.Screen name="TaskView" component={TaskView} />
            <Stack.Screen
              name="TaskDetails"
              component={TaskDetails}
              options={{ title: "Task Details" }}
            />
            <Stack.Screen
              name="MyDay"
              component={MyDayScreen}
              options={{ title: "My Day" }}
            />
            <Stack.Screen
              name="Important"
              component={ImportantScreen}
              options={{ title: "Important" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

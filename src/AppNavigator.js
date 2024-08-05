// AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TaskView from './screens/TaskView';
import AccountScreen from './screens/AccountScreen';
import TaskDetails from './screens/TaskDetails';
import MyDayScreen from './screens/MyDayScreen'; 
import ImportantScreen from './screens/ImportantScreen'; 

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="AccountScreen" component={AccountScreen} />
        <Stack.Screen name="TaskView" component={TaskView} />
        <Stack.Screen name="TaskDetails" component={TaskDetails} options={{ title: 'Task Details' }} />
        <Stack.Screen name="MyDay" component={MyDayScreen} options={{ title: 'My Day' }} /> 
        <Stack.Screen name="Important" component={ImportantScreen} options={{ title: 'Important' }} />  
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

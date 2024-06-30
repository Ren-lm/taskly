import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TaskView from './screens/TaskView';
import AccountScreen from './screens/AccountScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AccountScreen">
        <Stack.Screen name="AccountScreen" component={AccountScreen} />
        <Stack.Screen name="TaskView" component={TaskView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

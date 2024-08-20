
// // unit tests
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountScreen from '../screens/AccountScreen';
import TaskView from '../screens/TaskView';
import TaskDetails from '../screens/TaskDetails';
import MyDayScreen from '../screens/MyDayScreen';
import ImportantScreen from '../screens/ImportantScreen';
import LoginScreen from '../screens/LoginScreen'; 
import RegisterScreen from '../screens/RegisterScreen'; 
import '@testing-library/jest-native/extend-expect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock useUser hook
jest.mock('../hooks/useUser', () => ({
  useUser: () => ({
    data: { name: 'Test User' },
  }),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    AntDesign: (props) => React.createElement('Icon', props),
    MaterialIcons: (props) => React.createElement('Icon', props),
    FontAwesome: (props) => React.createElement('Icon', props),
  };
});

// Mock axios
jest.mock('axios');

// Mock DocumentPicker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({
    type: 'success',
    name: 'testFile.pdf',
    uri: 'file://testFile.pdf',
  })),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: (props) => <>{props.children}</>,
    Swipeable: (props) => <>{props.children}</>,
    PanGestureHandler: (props) => <>{props.children}</>,
    TapGestureHandler: (props) => <>{props.children}</>,
    RNGestureHandlerModule: {
      attachGestureHandler: jest.fn(),
      createGestureHandler: jest.fn(),
      dropGestureHandler: jest.fn(),
      updateGestureHandler: jest.fn(),
      install: jest.fn(), // Mock the install function
    },
    Directions: {},
    State: {},
  };
});

// Create QueryClient instance
const queryClient = new QueryClient();

  

describe('AccountScreen', () => {
  // Test to check if user name displays correctly
  it('renders correctly and displays user name', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <AccountScreen />
      </QueryClientProvider>
    );
    expect(getByText('Test User')).toBeTruthy();
  });

  // Test to check if Important section renders correctly
  it('renders "Important" section correctly', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <AccountScreen />
      </QueryClientProvider>
    );

    // Check that Important section title is rendered
    expect(getByText('Important')).toBeTruthy();
  });
});

describe('TaskView', () => {
  const route = {
    params: {
      listId: 'testListId',
      listName: 'Test List',
    },
  };

  const navigation = {
    navigate: jest.fn(),
  };

  // Test to check if the component renders the list name correctly
  it('renders the list name correctly', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <TaskView route={route} navigation={navigation} />
      </QueryClientProvider>
    );

    expect(getByText('Test List')).toBeTruthy();
  });

  // Test to check if the "Add Task" button is rendered
  it('renders the "Add Task" button', () => {
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <TaskView route={route} navigation={navigation} />
      </QueryClientProvider>
    );

    expect(getByTestId('add-task-button')).toBeTruthy();
  });
});

describe('TaskDetails', () => {
  const route = {
    params: {
      task: { name: 'Test Task', description: 'Test Description' },
      listId: '1',
      fetchTasks: jest.fn(),
    },
  };

  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  // Test to check if the Task name input field is rendered
  it('renders the "Task name" input field', () => {
    const { getByPlaceholderText } = render(
      <QueryClientProvider client={queryClient}>
        <TaskDetails route={route} navigation={navigation} />
      </QueryClientProvider>
    );

    expect(getByPlaceholderText('Task name')).toBeTruthy();
  });

  // Test to check if the Add to My Day button is rendered
  it('renders the "Add to My Day" button', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <TaskDetails route={route} navigation={navigation} />
      </QueryClientProvider>
    );

    expect(getByText('Add to My Day')).toBeTruthy();
  });

  // Test to check if category selection is rendered
  it('renders category selection correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <QueryClientProvider client={queryClient}>
        <TaskDetails route={route} navigation={navigation} />
      </QueryClientProvider>
    );

    const categoryButton = getByText('Select Category');
    expect(categoryButton).toBeTruthy();

    fireEvent.press(categoryButton);

    const categoryNameInput = getByPlaceholderText('Category Name');
    expect(categoryNameInput).toBeTruthy();
  });

  // Test to check if the description field is rendered and can be updated
  it('renders the description input and handles text input', () => {
    const { getByPlaceholderText } = render(
      <QueryClientProvider client={queryClient}>
        <TaskDetails route={route} navigation={navigation} />
      </QueryClientProvider>
    );

    const descriptionInput = getByPlaceholderText('Add Note');
    expect(descriptionInput).toBeTruthy();

    fireEvent.changeText(descriptionInput, 'Updated Description');
    expect(descriptionInput.props.value).toBe('Updated Description');
  });

});

describe('MyDayScreen', () => {
  // Mock navigation
  const navigation = {
    navigate: jest.fn(),
  };

  // Test to check if My Day title is rendered
  it('renders "My Day" title correctly', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <MyDayScreen navigation={navigation} />
      </QueryClientProvider>
    );

    expect(getByText('My Day')).toBeTruthy();
  });

  // Test to check if tasks due today are rendered correctly
  it('fetches and displays tasks due today', async () => {
    // Mock axios response for tasks
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: '1', name: 'Test Task 1', dueDate: new Date().toISOString(), listId: '1' },
      ],
    });

    const { findByText } = render(
      <QueryClientProvider client={queryClient}>
        <MyDayScreen navigation={navigation} />
      </QueryClientProvider>
    );

    // Wait for the task to appear in the component
    const taskItem = await findByText('Test Task 1');
    expect(taskItem).toBeTruthy();
  });
});

describe('ImportantScreen', () => {
  // Mock navigation
  const navigation = {
    navigate: jest.fn(),
  };

  // Test to check if Important title is rendered
  it('renders "Important" title correctly', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <ImportantScreen navigation={navigation} />
      </QueryClientProvider>
    );

    expect(getByText('Important')).toBeTruthy();
  });

  

  // Test to check if important tasks are rendered correctly
  it('fetches and displays important tasks', async () => {
    // Mock axios response for important tasks
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: '1', name: 'Important Task 1', important: true, listId: '1' },
      ],
    });

    const { findByText } = render(
      <QueryClientProvider client={queryClient}>
        <ImportantScreen navigation={navigation} />
      </QueryClientProvider>
    );

    // Wait for the task to appear in the component
    const taskItem = await findByText('Important Task 1');
    expect(taskItem).toBeTruthy();
  });
});


  describe('RegisterScreen', () => {
    // Mock navigation
    const navigation = {
      navigate: jest.fn(),
    };
  // Test to check if the register screen renders correctly
  it('renders the register screen with name, email, and password inputs', () => {
    const { getByPlaceholderText } = render(
      <RegisterScreen navigation={navigation} />
    );

    expect(getByPlaceholderText('Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

 // Test to check if pressing the "Register" link navigates to the RegisterScreen
 it('navigates to the RegisterScreen when the link is pressed', () => {
  const { getByText } = render(
    <QueryClientProvider client={queryClient}>
      <LoginScreen navigation={navigation} />
    </QueryClientProvider>
  );

  const registerLink = getByText("Don't have an account? Register");
  fireEvent.press(registerLink);

  expect(navigation.navigate).toHaveBeenCalledWith('RegisterScreen');
});




  // Test to check if the name input field is rendered
  it('renders the name input field', () => {
    const { getByPlaceholderText } = render(
      <RegisterScreen navigation={navigation} />
    );

    expect(getByPlaceholderText('Name')).toBeTruthy();
  });

  // Test to check if the email input field is rendered
  it('renders the email input field', () => {
    const { getByPlaceholderText } = render(
      <RegisterScreen navigation={navigation} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  // Test to check if the password input field is rendered
  it('renders the password input field', () => {
    const { getByPlaceholderText } = render(
      <RegisterScreen navigation={navigation} />
    );

    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  });


  describe('LoginScreen', () => {
    // Mock navigation
    const navigation = {
      navigate: jest.fn(),
    };
  
    // Test to check if the email input field is rendered
    it('renders the email input field', () => {
      const { getByPlaceholderText } = render(
        <QueryClientProvider client={queryClient}>
          <LoginScreen navigation={navigation} />
        </QueryClientProvider>
      );
  
      const emailInput = getByPlaceholderText('Email');
      expect(emailInput).toBeTruthy();
    });
  
  
    // Test to check if pressing the "Register" link navigates to the RegisterScreen
    it('navigates to the RegisterScreen when the link is pressed', () => {
      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <LoginScreen navigation={navigation} />
        </QueryClientProvider>
      );
  
      const registerLink = getByText("Don't have an account? Register");
      fireEvent.press(registerLink);
  
      expect(navigation.navigate).toHaveBeenCalledWith('RegisterScreen');
    });
  });



  

  



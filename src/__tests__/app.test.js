
// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import AccountScreen from '../screens/AccountScreen';
// import '@testing-library/jest-native/extend-expect';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // Mock AsyncStorage
// jest.mock('@react-native-async-storage/async-storage', () => ({
//   getItem: jest.fn(() => Promise.resolve(null)),
//   setItem: jest.fn(() => Promise.resolve()),
//   removeItem: jest.fn(() => Promise.resolve()),
//   clear: jest.fn(() => Promise.resolve()),
// }));

// // Mock useUser hook
// jest.mock('../hooks/useUser', () => ({
//   useUser: () => ({
//     data: { name: 'Test User' },
//   }),
// }));

// // Mock @expo/vector-icons
// jest.mock('@expo/vector-icons', () => {
//   const React = require('react');
//   return {
//     AntDesign: (props) => React.createElement('Icon', props),
//     MaterialIcons: (props) => React.createElement('Icon', props),
//     FontAwesome: (props) => React.createElement('Icon', props),
//   };
// });

// // Mock react-native-gesture-handler
// jest.mock('react-native-gesture-handler', () => {
//   const React = require('react');
//   return {
//     GestureHandlerRootView: (props) => <>{props.children}</>,
//     Swipeable: (props) => <>{props.children}</>,
//     PanGestureHandler: (props) => <>{props.children}</>,
//     TapGestureHandler: (props) => <>{props.children}</>,
//     RNGestureHandlerModule: {
//       attachGestureHandler: jest.fn(),
//       createGestureHandler: jest.fn(),
//       dropGestureHandler: jest.fn(),
//       updateGestureHandler: jest.fn(),
//       install: jest.fn(), // Mock the install function
//     },
//     Directions: {},
//     State: {},
//   };
// });

// // Create QueryClient instance
// const queryClient = new QueryClient();

// describe('AccountScreen', () => {
//   // test to check if user name displays correctly
//   it('renders correctly and displays user name', () => {
//     const { getByText } = render(
//       <QueryClientProvider client={queryClient}>
//         <AccountScreen />
//       </QueryClientProvider>
//     );
//     expect(getByText('Test User')).toBeTruthy();
//   });

//   //  test for Important screen
//   it('renders "Important" section correctly', () => {
//     const { getByText } = render(
//       <QueryClientProvider client={queryClient}>
//         <AccountScreen />
//       </QueryClientProvider>
//     );

//     // Check that Important screen  title is rendered
//     expect(getByText('Important')).toBeTruthy();
//   });
// });


import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AccountScreen from '../screens/AccountScreen';
import TaskView from '../screens/TaskView';
import '@testing-library/jest-native/extend-expect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

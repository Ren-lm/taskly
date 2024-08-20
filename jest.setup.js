// jest.setup.js

// Mocking expo-asset, similar to your previous project
jest.mock('expo-asset', () => ({
    downloadAsync: jest.fn(),
    Asset: {
      loadAsync: jest.fn(),
      fromModule: (resource) => ({
        uri: resource,
      }),
    },
  }));
  
  // Additional setup can be added here
  
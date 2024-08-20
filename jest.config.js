module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    setupFiles: ['./jest.setup.js'],
  };
  
  
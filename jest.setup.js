// Learn more: https://jestjs.io/docs/configuration#setupfiles-array

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock Expo constants
jest.mock("expo-constants", () => ({
  Constants: { manifest: { extra: { apiUrl: "https://api.example.com" } } },
}));

// Add any other global mocks or setup here

module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  testEnvironment: "jsdom",
};

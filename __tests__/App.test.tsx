import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Mock any native modules that might cause issues
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('Example Test Suite', () => {
  it('renders correctly', () => {
    const TestComponent = () => (
      <View testID="test-view">
        <Text testID="test-text">Hello, Testing!</Text>
      </View>
    );

    const { getByTestId } = render(<TestComponent />);
    
    expect(getByTestId('test-view')).toBeTruthy();
    expect(getByTestId('test-text')).toBeTruthy();
    expect(getByTestId('test-text').props.children).toBe('Hello, Testing!');
  });
});

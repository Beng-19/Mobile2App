/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));

jest.mock('react-native-nitro-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(() => ({rows: {_array: []}})),
  })),
}));

jest.mock('../src/components/database', () => ({
  initDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/components/AppTabs', () => 'AppTabs');

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});

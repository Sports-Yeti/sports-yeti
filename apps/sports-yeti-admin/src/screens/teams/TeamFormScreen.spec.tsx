import React from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UIThemeProvider } from '@sports-yeti/ui';
import { uiTheme } from '../../theme';
import { ToastProvider } from '../../ui';
import { TeamFormScreen } from './TeamFormScreen';

const Stack = createNativeStackNavigator();

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 1280, height: 800 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <UIThemeProvider value={uiTheme}>
        <ToastProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="TeamForm" component={TeamFormScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </ToastProvider>
      </UIThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('TeamFormScreen', () => {
  it('renders the create-team form with key sections', () => {
    const { getByText } = renderScreen();
    expect(getByText('New team')).toBeTruthy();
    expect(getByText('Identity')).toBeTruthy();
    expect(getByText('League & captain')).toBeTruthy();
    expect(getByText('Roster & dues')).toBeTruthy();
  });
});

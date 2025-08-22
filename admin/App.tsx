import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Admin screens
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LeagueManagementScreen from './src/screens/LeagueManagementScreen';
import PlayerManagementScreen from './src/screens/PlayerManagementScreen';
import FacilityManagementScreen from './src/screens/FacilityManagementScreen';
import BookingManagementScreen from './src/screens/BookingManagementScreen';
import AuditLogScreen from './src/screens/AuditLogScreen';

// Store
import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();

// Sports Yeti Admin theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E40AF',
    secondary: '#3B82F6',
    surface: '#FFFFFF',
    background: '#F8FAFC',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
  },
};

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={AdminLoginScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Sports Yeti Admin' }}
      />
      <Stack.Screen 
        name="LeagueManagement" 
        component={LeagueManagementScreen}
        options={{ title: 'League Management' }}
      />
      <Stack.Screen 
        name="PlayerManagement" 
        component={PlayerManagementScreen}
        options={{ title: 'Player Management' }}
      />
      <Stack.Screen 
        name="FacilityManagement" 
        component={FacilityManagementScreen}
        options={{ title: 'Facility Management' }}
      />
      <Stack.Screen 
        name="BookingManagement" 
        component={BookingManagementScreen}
        options={{ title: 'Booking Calendar' }}
      />
      <Stack.Screen 
        name="AuditLog" 
        component={AuditLogScreen}
        options={{ title: 'Audit Logs' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          {isAuthenticated ? <AppStack /> : <AdminStack />}
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

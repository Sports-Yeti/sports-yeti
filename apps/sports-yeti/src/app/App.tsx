import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import RootNavigator from '../navigation/RootNavigator';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </AuthProvider>
  );
};

export default App;

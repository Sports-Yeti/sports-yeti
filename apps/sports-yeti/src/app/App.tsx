import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import RootNavigator from '../navigation/RootNavigator';
import ErrorBoundary from '../components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;

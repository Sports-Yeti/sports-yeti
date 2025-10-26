import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from './Button';
import { debugLog } from '../../utils/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    debugLog('Error caught by boundary:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // TODO: Send error to error tracking service (Sentry, Bugsnag, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry for the inconvenience. The app encountered an
              unexpected error.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>
                  Error Details (Development Mode):
                </Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <Button
              title="Try Again"
              onPress={this.handleReset}
              variant="primary"
              size="large"
              style={styles.button}
            />

            <Text style={styles.supportText}>
              If the problem persists, please contact support at
              support@sportsyeti.com
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  debugInfo: {
    width: '100%',
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  button: {
    minWidth: 200,
    marginBottom: 16,
  },
  supportText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ErrorBoundary;

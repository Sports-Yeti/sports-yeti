import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Sentry from '@sentry/react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

/**
 * Error boundary component that catches React errors and reports them to Sentry.
 * Provides a user-friendly error screen with a retry path.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const eventId = Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
      tags: {
        type: 'react_error_boundary',
      },
    });

    this.setState({
      errorInfo,
      eventId,
    });

    if (__DEV__) {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleReload = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We've been notified and are working on a fix.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorMessage}>
                  {this.state.error.message}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.stackTrace}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReload}
                accessibilityRole="button"
                accessibilityLabel="Try again"
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>

            {this.state.eventId && (
              <Text style={styles.eventId}>Error ID: {this.state.eventId}</Text>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    maxHeight: 200,
    backgroundColor: '#2d2d44',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#fca5a5',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4b5563',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  eventId: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 16,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;

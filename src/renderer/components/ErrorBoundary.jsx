import { Component } from 'react';
import { Card, Title, Text, Button, Stack, Code } from '@mantine/core';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Note: Error boundaries must be class components as there's no
 * hook equivalent for componentDidCatch/getDerivedStateFromError.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Here you could also send to an error reporting service
    // Example: errorReportingService.log({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error is caught
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
          <Card shadow="md" padding="xl" radius="md" className="max-w-lg w-full">
            <Stack gap="md">
              <Title order={2} c="red">
                ⚠️ Something went wrong
              </Title>

              <Text c="dimmed">
                An unexpected error occurred. Please try again or restart the application.
              </Text>

              {this.state.error && (
                <Card withBorder bg="gray.0" p="sm">
                  <Text size="sm" fw={600} mb="xs">
                    Error Details:
                  </Text>
                  <Code block className="text-xs overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </Code>
                </Card>
              )}

              {this.state.errorInfo && (
                <Card withBorder bg="gray.0" p="sm">
                  <Text size="sm" fw={600} mb="xs">
                    Component Stack:
                  </Text>
                  <Code block className="text-xs overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </Code>
                </Card>
              )}

              <Button onClick={this.handleReset} color="blue" fullWidth>
                Try Again
              </Button>
            </Stack>
          </Card>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: require('prop-types').node,
};

export default ErrorBoundary;

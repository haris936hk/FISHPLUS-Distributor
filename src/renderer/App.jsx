import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import useStore from './store';
import { Dashboard } from './pages';
import { ErrorBoundary } from './components';

/**
 * Root App Component
 * Provides theme context and renders the main Dashboard.
 */
function App() {
  const { theme, loadSettings } = useStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <MantineProvider
      theme={{
        colorScheme: theme,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        primaryColor: 'blue',
      }}
    >
      <Notifications position="top-right" />
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
    </MantineProvider>
  );
}

export default App;


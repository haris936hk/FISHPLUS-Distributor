import { useEffect, useState, useCallback } from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import useStore from './store';
import { Dashboard, Suppliers, Customers } from './pages';
import { ErrorBoundary } from './components';

/**
 * Root App Component
 * Provides theme context and handles page navigation.
 */
function App() {
  const { theme, loadSettings } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Navigation handler
  const navigateTo = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'suppliers':
        return <Suppliers onBack={() => navigateTo('dashboard')} />;
      case 'customers':
        return <Customers onBack={() => navigateTo('dashboard')} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <MantineProvider
      theme={{
        colorScheme: theme,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        primaryColor: 'blue',
      }}
    >
      <ModalsProvider>
        <Notifications position="top-right" />
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;

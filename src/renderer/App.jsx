import { useEffect, useState, useCallback } from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import useStore from './store';
import {
  Dashboard,
  Suppliers,
  Customers,
  SupplierBills,
  Items,
  Sales,
  Purchases,
  Reports,
} from './pages';
import { ErrorBoundary } from './components';

/**
 * Root App Component
 * Provides theme context and handles page navigation.
 */
function App() {
  const { theme, loadSettings } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [reportTab, setReportTab] = useState(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Dynamic window title (FR-NAV-001)
  useEffect(() => {
    const pageTitles = {
      dashboard: 'FISHPLUS - Dashboard',
      suppliers: 'FISHPLUS - Suppliers',
      customers: 'FISHPLUS - Customers',
      'supplier-bills': 'FISHPLUS - Supplier Bills',
      item: 'FISHPLUS - Items',
      sales: 'FISHPLUS - Sales',
      purchases: 'FISHPLUS - Purchases',
      reports: 'FISHPLUS - Reports',
    };
    document.title = pageTitles[currentPage] || 'FISHPLUS Distributor';
  }, [currentPage]);

  // Navigation handler - supports optional data object with tab parameter
  const navigateTo = useCallback((page, data = {}) => {
    setCurrentPage(page);
    if (data.tab) {
      setReportTab(data.tab);
    } else {
      setReportTab(null);
    }
  }, []);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'suppliers':
        return <Suppliers onBack={() => navigateTo('dashboard')} />;
      case 'customers':
        return <Customers onBack={() => navigateTo('dashboard')} />;
      case 'supplier-bills':
        return <SupplierBills onBack={() => navigateTo('dashboard')} />;
      case 'item':
        return <Items onBack={() => navigateTo('dashboard')} />;
      case 'sales':
        return <Sales onBack={() => navigateTo('dashboard')} />;
      case 'purchases':
        return <Purchases onBack={() => navigateTo('dashboard')} />;
      case 'reports':
        return <Reports onBack={() => navigateTo('dashboard')} initialTab={reportTab} />;
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
        <ErrorBoundary>{renderPage()}</ErrorBoundary>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;

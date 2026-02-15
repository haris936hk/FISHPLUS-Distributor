import { useEffect, useState, useCallback } from 'react';
import { MantineProvider, Group, Button, Text, Tooltip } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import {
  IconHome,
  IconCash,
  IconShoppingCart,
  IconUsers,
  IconTruck,
  IconPackage,
  IconFileInvoice,
  IconChartBar,
} from '@tabler/icons-react';
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
 * Menu items configuration for the navigation bar (FR-MENU-001)
 */
const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: IconHome, shortcut: 'Ctrl+1' },
  { key: 'sales', label: 'Sales', icon: IconCash, shortcut: 'Ctrl+2' },
  { key: 'purchases', label: 'Purchases', icon: IconShoppingCart, shortcut: 'Ctrl+3' },
  { key: 'customers', label: 'Customers', icon: IconUsers, shortcut: 'Ctrl+4' },
  { key: 'suppliers', label: 'Suppliers', icon: IconTruck, shortcut: 'Ctrl+5' },
  { key: 'item', label: 'Items', icon: IconPackage, shortcut: 'Ctrl+6' },
  { key: 'supplier-bills', label: 'Bills', icon: IconFileInvoice, shortcut: 'Ctrl+7' },
  { key: 'reports', label: 'Reports', icon: IconChartBar, shortcut: 'Ctrl+8' },
];

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

  // Keyboard shortcuts (FR-NAV-006)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case '1': e.preventDefault(); navigateTo('dashboard'); break;
          case '2': e.preventDefault(); navigateTo('sales'); break;
          case '3': e.preventDefault(); navigateTo('purchases'); break;
          case '4': e.preventDefault(); navigateTo('customers'); break;
          case '5': e.preventDefault(); navigateTo('suppliers'); break;
          case '6': e.preventDefault(); navigateTo('item'); break;
          case '7': e.preventDefault(); navigateTo('supplier-bills'); break;
          case '8': e.preventDefault(); navigateTo('reports'); break;
          default: break;
        }
      }

      if (e.key === 'Escape' && currentPage !== 'dashboard') {
        e.preventDefault();
        navigateTo('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo, currentPage]);

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
        <ErrorBoundary>
          {/* Menu Bar - visible on all pages (FR-MENU-001) */}
          {currentPage !== 'dashboard' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '6px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
              }}
            >
              <Group gap="xs" justify="space-between">
                <Group gap={4}>
                  <Text
                    fw={700}
                    size="sm"
                    style={{
                      color: '#38bdf8',
                      letterSpacing: '0.5px',
                      marginRight: 12,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigateTo('dashboard')}
                  >
                    🐟 FISHPLUS
                  </Text>
                  {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.key;
                    return (
                      <Tooltip
                        key={item.key}
                        label={`${item.label} (${item.shortcut})`}
                        position="bottom"
                        withArrow
                      >
                        <Button
                          size="compact-xs"
                          variant={isActive ? 'filled' : 'subtle'}
                          color={isActive ? 'blue' : 'gray'}
                          leftSection={<Icon size={14} />}
                          onClick={() => navigateTo(item.key)}
                          style={{
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '12px',
                          }}
                        >
                          {item.label}
                        </Button>
                      </Tooltip>
                    );
                  })}
                </Group>
                <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Esc = Home
                </Text>
              </Group>
            </div>
          )}
          {renderPage()}
        </ErrorBoundary>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;

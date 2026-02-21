import { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Title,
  Text,
  Card,
  SimpleGrid,
  Stack,
  Group,
  Loader,
  Center,
  Paper,
  Box,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Button,
} from '@mantine/core';
import { IconWorld } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import useStore from '../store';
import { DashboardButton, SupplierAdvancesList, ItemStockDisplay } from '../components';

// Stats card component
const StatCard = ({ value, label, color }) => (
  <Paper
    p="md"
    radius="lg"
    style={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      minWidth: '100px',
    }}
  >
    <Stack gap={2} align="center">
      <Text c="white" size="xl" fw={700}>
        {value}
      </Text>
      <Text c="white" size="xs" opacity={0.9}>
        {label}
      </Text>
    </Stack>
  </Paper>
);

StatCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

/**
 * Dashboard Page Component
 * Central navigation hub. Implements FR-DASH-001 through FR-DASH-027.
 */
function Dashboard({ onNavigate, onToggleLanguage }) {
  const { supplierAdvances, itemsStock, dashboardSummary, dashboardLoading, loadDashboardData, language } =
    useStore();
  const { t } = useTranslation();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const isUrdu = language === 'ur';

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 60 seconds (FR-DASH-021)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = window.setInterval(() => {
      loadDashboardData();
    }, 60000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, loadDashboardData]);

  const handleNavigation = useCallback((moduleName) => {
    notifications.show({
      title: t('common.noDataFound'),
      message: `${moduleName} module is not yet implemented.`,
      color: 'blue',
      autoClose: 3000,
    });
  }, [t]);

  // Navigation button configuration — translated
  const adminButtons = [
    { label: t('bill.title'), icon: '📄', key: 'supplier-bill', navigate: 'supplier-bills' },
    { label: t('report.vendorSales'), icon: '📋', key: 'supplier-stock-bill', navigate: 'reports', tab: 'vendor-sales' },
    { label: t('nav.items'), icon: '📦', key: 'item', navigate: 'item' },
  ];

  const transactionButtons = [
    { label: t('sale.addNew'), icon: '💵', key: 'sale', navigate: 'sales' },
    { label: `🔍 ${t('nav.sales')}`, icon: '🔍', key: 'search-sale', navigate: 'sales' },
    { label: t('purchase.addNew'), icon: '🛒', key: 'purchase', navigate: 'purchases' },
    { label: `🔎 ${t('nav.purchases')}`, icon: '🔎', key: 'search-purchase', navigate: 'purchases' },
  ];

  const userButtons = [
    { label: t('customer.addNew'), icon: '👤', key: 'customer', navigate: 'customers' },
    { label: `🔍 ${t('nav.customers')}`, icon: '🔍', key: 'search-customers', navigate: 'customers' },
    { label: t('nav.suppliers'), icon: '🏪', key: 'supplier', navigate: 'suppliers' },
  ];

  const reportButtons = [
    { label: t('report.customerLedger'), icon: '📒', key: 'ledger', navigate: 'reports', tab: 'ledger' },
    { label: t('report.vendorSales'), icon: '📊', key: 'item-wise-purchase', navigate: 'reports', tab: 'item-purchase' },
    { label: t('report.stockReport'), icon: '📈', key: 'stock-report', navigate: 'reports', tab: 'stock' },
    { label: isUrdu ? 'گاہک رجسٹر' : 'Customer Register', icon: '📝', key: 'customer-register', navigate: 'reports', tab: 'customer-register' },
    { label: isUrdu ? 'گاہک بکری' : 'Customer Recovery', icon: '📉', key: 'client-sales', navigate: 'reports', tab: 'client-recovery' },
    { label: isUrdu ? 'روزانہ تفصیل' : 'Daily Details', icon: '📅', key: 'daily-sales-details', navigate: 'reports', tab: 'daily-details' },
    { label: isUrdu ? 'روزانہ بکری' : 'Daily Sales', icon: '🗓️', key: 'daily-sales', navigate: 'reports', tab: 'daily-sales' },
    { label: isUrdu ? 'مال بکری' : 'Item Sales', icon: '🐟', key: 'item-sale', navigate: 'reports', tab: 'item-sale' },
    { label: isUrdu ? 'رعایت' : 'Concessions', icon: '💸', key: 'concession', navigate: 'reports', tab: 'concession' },
    { label: t('report.netSummary'), icon: '📊', key: 'net-summary', navigate: 'reports', tab: 'net-summary' },
  ];

  return (
    <Box className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Paper
        shadow="xl"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          borderRadius: 0,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ padding: '20px 32px' }}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Stack gap={4}>
              <Title order={2} c="white" style={{ letterSpacing: '-0.5px' }}>
                🐟 AL-SHEIKH FISH TRADER
              </Title>
              <Text c="dimmed" size="sm">
                Shop No. W-644 Gunj Mandi Rawalpindi | +92-3008501724
              </Text>
              <Group gap="xs" mt={4}>
                <Tooltip label={t('dashboard.autoRefresh')}>
                  <ActionIcon
                    variant="subtle"
                    color="white"
                    size="lg"
                    onClick={() => loadDashboardData()}
                    loading={dashboardLoading}
                  >
                    🔄
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={autoRefresh ? (isUrdu ? 'خود کار تازہ چالو (60 سیکنڈ)' : 'Auto-refresh ON (60s)') : (isUrdu ? 'خود کار تازہ بند' : 'Auto-refresh OFF')}>
                  <ActionIcon
                    variant={autoRefresh ? 'filled' : 'subtle'}
                    color={autoRefresh ? 'teal' : 'gray'}
                    size="lg"
                    onClick={() => setAutoRefresh((prev) => !prev)}
                  >
                    ⏱️
                  </ActionIcon>
                </Tooltip>

                {/* Language Toggle Button */}
                <Tooltip label={isUrdu ? 'Switch to English' : 'اردو میں بدلیں'}>
                  <Button
                    variant="subtle"
                    color="blue"
                    size="compact-sm"
                    leftSection={<IconWorld size={14} />}
                    onClick={onToggleLanguage}
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    {isUrdu ? 'English' : 'اردو'}
                  </Button>
                </Tooltip>
              </Group>
            </Stack>

            {/* Quick Stats */}
            <Group gap="md" wrap="nowrap">
              <StatCard
                value={dashboardSummary?.suppliers?.count || 0}
                label={t('dashboard.totalSuppliers')}
                color="#3b82f6"
              />
              <StatCard
                value={dashboardSummary?.customers?.count || 0}
                label={t('dashboard.totalCustomers')}
                color="#8b5cf6"
              />
              <StatCard value={dashboardSummary?.items?.count || 0} label={t('nav.items')} color="#14b8a6" />
              <StatCard
                value={dashboardSummary?.todaySales?.count || 0}
                label={isUrdu ? 'آج کی بکری' : "Today's Sales"}
                color="#f97316"
              />
            </Group>
          </Group>
        </div>
      </Paper>

      {/* Main Content */}
      <ScrollArea h="calc(100vh - 100px)" offsetScrollbars>
        <div style={{ padding: '24px 32px', display: 'flex', gap: '24px' }}>
          {/* Left Section - Navigation Buttons */}
          <div style={{ flex: '1 1 70%', minWidth: 0 }}>
            <Stack gap="xl">
              {/* Row 1: Administration & Transactions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
                {/* Administration */}
                <Card shadow="md" padding="lg" radius="xl" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                  <Group gap="sm" mb="md">
                    <Box style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '10px', padding: '8px 12px' }}>
                      <Text size="lg" style={{ lineHeight: 1 }}>📁</Text>
                    </Box>
                    <Title order={4} c="dark">{isUrdu ? 'انتظامیہ' : 'Administration'}</Title>
                  </Group>
                  <Stack gap="sm">
                    {adminButtons.map((btn) => (
                      <DashboardButton
                        key={btn.key}
                        label={btn.label}
                        icon={btn.icon}
                        variant="administration"
                        onClick={() => btn.navigate ? onNavigate?.(btn.navigate, { tab: btn.tab }) : handleNavigation(btn.label)}
                      />
                    ))}
                  </Stack>
                </Card>

                {/* Transactions */}
                <Card shadow="md" padding="lg" radius="xl" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                  <Group gap="sm" mb="md">
                    <Box style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', borderRadius: '10px', padding: '8px 12px' }}>
                      <Text size="lg" style={{ lineHeight: 1 }}>💰</Text>
                    </Box>
                    <Title order={4} c="dark">{isUrdu ? 'لین دین' : 'Transactions'}</Title>
                  </Group>
                  <SimpleGrid cols={2} spacing="sm">
                    {transactionButtons.map((btn) => (
                      <DashboardButton
                        key={btn.key}
                        label={btn.label}
                        icon={btn.icon}
                        variant="transaction"
                        onClick={() => btn.navigate ? onNavigate?.(btn.navigate) : handleNavigation(btn.label)}
                      />
                    ))}
                  </SimpleGrid>
                </Card>
              </div>

              {/* Row 2: Contacts */}
              <Card shadow="md" padding="lg" radius="xl" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <Group gap="sm" mb="md">
                  <Box style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '10px', padding: '8px 12px' }}>
                    <Text size="lg" style={{ lineHeight: 1 }}>👥</Text>
                  </Box>
                  <Title order={4} c="dark">{isUrdu ? 'رابطہ کار' : 'Contacts'}</Title>
                </Group>
                <SimpleGrid cols={3} spacing="sm">
                  {userButtons.map((btn) => (
                    <DashboardButton
                      key={btn.key}
                      label={btn.label}
                      icon={btn.icon}
                      variant="user"
                      onClick={() => btn.navigate ? onNavigate?.(btn.navigate) : handleNavigation(btn.label)}
                    />
                  ))}
                </SimpleGrid>
              </Card>

              {/* Row 3: Reports */}
              <Card shadow="md" padding="lg" radius="xl" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <Group gap="sm" mb="md">
                  <Box style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: '10px', padding: '8px 12px' }}>
                    <Text size="lg" style={{ lineHeight: 1 }}>📊</Text>
                  </Box>
                  <Title order={4} c="dark">{t('nav.reports')}</Title>
                </Group>
                <SimpleGrid cols={3} spacing="sm">
                  {reportButtons.map((btn) => (
                    <DashboardButton
                      key={btn.key}
                      label={btn.label}
                      icon={btn.icon}
                      variant="report"
                      onClick={() => btn.navigate ? onNavigate?.(btn.navigate, { tab: btn.tab }) : handleNavigation(btn.label)}
                    />
                  ))}
                </SimpleGrid>
              </Card>
            </Stack>
          </div>

          {/* Right Section - Information Panels */}
          <div style={{ flex: '0 0 320px', minWidth: '280px' }}>
            <Stack gap="lg">
              {dashboardLoading ? (
                <Card shadow="md" padding="xl" radius="xl" h={400} style={{ background: 'rgba(255,255,255,0.95)' }}>
                  <Center h="100%">
                    <Loader size="lg" />
                  </Center>
                </Card>
              ) : (
                <>
                  <SupplierAdvancesList data={supplierAdvances} loading={dashboardLoading} />
                  <ItemStockDisplay data={itemsStock} loading={dashboardLoading} />
                </>
              )}
            </Stack>
          </div>
        </div>
      </ScrollArea>
    </Box>
  );
}

Dashboard.propTypes = {
  onNavigate: PropTypes.func,
  onToggleLanguage: PropTypes.func,
};

export default Dashboard;

import { useEffect, useCallback } from 'react';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import useStore from '../store';
import { DashboardButton, SupplierAdvancesList, ItemStockDisplay } from '../components';

/**
 * Dashboard Page Component
 * Desktop-optimized central navigation hub with quick access buttons.
 * Implements FR-DASH-001 through FR-DASH-027.
 *
 * @param {function} onNavigate - Navigation callback for page switching
 */
function Dashboard({ onNavigate }) {
    const {
        supplierAdvances,
        itemsStock,
        dashboardSummary,
        dashboardLoading,
        loadDashboardData,
    } = useStore();

    // Load dashboard data on mount
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Navigation handler - shows "Coming Soon" for unimplemented modules
    const handleNavigation = useCallback((moduleName) => {
        notifications.show({
            title: 'Coming Soon',
            message: `${moduleName} module is not yet implemented.`,
            color: 'blue',
            autoClose: 3000,
        });
    }, []);

    // Navigation button configuration
    const adminButtons = [
        { label: 'Supplier Bill', icon: '📄', key: 'supplier-bill' },
        { label: 'Supplier Stock Bill', icon: '📋', key: 'supplier-stock-bill' },
        { label: 'Item Management', icon: '📦', key: 'item' },
    ];

    const transactionButtons = [
        { label: 'New Sale', icon: '💵', key: 'sale' },
        { label: 'Search Sale', icon: '🔍', key: 'search-sale' },
        { label: 'New Purchase', icon: '🛒', key: 'purchase' },
        { label: 'Search Purchase', icon: '🔎', key: 'search-purchase' },
    ];

    const userButtons = [
        { label: 'Customer', icon: '👤', key: 'customer', navigate: 'customers' },
        { label: 'Search Customers', icon: '🔍', key: 'search-customers', navigate: 'customers' },
        { label: 'Supplier', icon: '🏪', key: 'supplier', navigate: 'suppliers' },
    ];

    const reportButtons = [
        { label: 'Ledger', icon: '📒', key: 'ledger' },
        { label: 'Item Wise Purchase', icon: '📊', key: 'item-wise-purchase' },
        { label: 'Stock Report', icon: '📈', key: 'stock-report' },
        { label: 'Customer Register', icon: '📝', key: 'customer-register' },
        { label: 'Client Sales Report', icon: '📉', key: 'client-sales' },
        { label: 'Daily Sales Details', icon: '📅', key: 'daily-sales-details' },
        { label: 'Daily Sales Report', icon: '🗓️', key: 'daily-sales' },
        { label: 'Item Sale Report', icon: '🐟', key: 'item-sale' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 dark:from-gray-900 dark:to-slate-800">
            {/* Header - Full Width */}
            <Paper
                shadow="md"
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"
                style={{ borderRadius: 0 }}
            >
                <div className="px-8 py-6">
                    <Group justify="space-between" align="center">
                        <Stack gap={4}>
                            <Title order={1} c="white" className="text-3xl font-bold">
                                🐟 AL - SHEIKH FISH TRADER AND DISTRIBUTER
                            </Title>
                            <Text c="white" opacity={0.9} size="md">
                                Shop No. W-644 Gunj Mandi Rawalpindi | +92-3008501724, 051-5534607
                            </Text>
                        </Stack>
                        {/* Quick Stats in Header */}
                        <Group gap="lg">
                            <Paper p="md" radius="md" className="bg-white/10 backdrop-blur-sm">
                                <Stack gap={2} align="center">
                                    <Text c="white" size="xl" fw={700}>
                                        {dashboardSummary?.suppliers?.count || 0}
                                    </Text>
                                    <Text c="white" size="xs" opacity={0.8}>Suppliers</Text>
                                </Stack>
                            </Paper>
                            <Paper p="md" radius="md" className="bg-white/10 backdrop-blur-sm">
                                <Stack gap={2} align="center">
                                    <Text c="white" size="xl" fw={700}>
                                        {dashboardSummary?.customers?.count || 0}
                                    </Text>
                                    <Text c="white" size="xs" opacity={0.8}>Customers</Text>
                                </Stack>
                            </Paper>
                            <Paper p="md" radius="md" className="bg-white/10 backdrop-blur-sm">
                                <Stack gap={2} align="center">
                                    <Text c="white" size="xl" fw={700}>
                                        {dashboardSummary?.items?.count || 0}
                                    </Text>
                                    <Text c="white" size="xs" opacity={0.8}>Items</Text>
                                </Stack>
                            </Paper>
                            <Paper p="md" radius="md" className="bg-white/10 backdrop-blur-sm">
                                <Stack gap={2} align="center">
                                    <Text c="white" size="xl" fw={700}>
                                        {dashboardSummary?.todaySales?.count || 0}
                                    </Text>
                                    <Text c="white" size="xs" opacity={0.8}>Today&apos;s Sales</Text>
                                </Stack>
                            </Paper>
                        </Group>
                    </Group>
                </div>
            </Paper>

            {/* Main Content Area */}
            <div className="p-8">
                <div className="flex gap-8">
                    {/* Left Section - Navigation Buttons (Takes 70% width) */}
                    <div className="flex-[7]">
                        <Stack gap="xl">
                            {/* Row 1: Administration & Transactions side by side */}
                            <div className="flex gap-6">
                                {/* Administration Section */}
                                <Card shadow="sm" padding="xl" radius="lg" withBorder className="flex-1">
                                    <Group gap="sm" mb="lg">
                                        <Text size="xl">📁</Text>
                                        <Title order={3} className="text-blue-700">Administration</Title>
                                    </Group>
                                    <SimpleGrid cols={3} spacing="md">
                                        {adminButtons.map((btn) => (
                                            <DashboardButton
                                                key={btn.key}
                                                label={btn.label}
                                                icon={btn.icon}
                                                variant="administration"
                                                onClick={() => handleNavigation(btn.label)}
                                            />
                                        ))}
                                    </SimpleGrid>
                                </Card>

                                {/* Transactions Section */}
                                <Card shadow="sm" padding="xl" radius="lg" withBorder className="flex-1">
                                    <Group gap="sm" mb="lg">
                                        <Text size="xl">💰</Text>
                                        <Title order={3} className="text-teal-700">Transactions</Title>
                                    </Group>
                                    <SimpleGrid cols={4} spacing="md">
                                        {transactionButtons.map((btn) => (
                                            <DashboardButton
                                                key={btn.key}
                                                label={btn.label}
                                                icon={btn.icon}
                                                variant="transaction"
                                                onClick={() => handleNavigation(btn.label)}
                                            />
                                        ))}
                                    </SimpleGrid>
                                </Card>
                            </div>

                            {/* Row 2: User Management */}
                            <Card shadow="sm" padding="xl" radius="lg" withBorder>
                                <Group gap="sm" mb="lg">
                                    <Text size="xl">👥</Text>
                                    <Title order={3} className="text-violet-700">User Management</Title>
                                </Group>
                                <SimpleGrid cols={6} spacing="md">
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

                            {/* Row 3: Reports - Full Width */}
                            <Card shadow="sm" padding="xl" radius="lg" withBorder>
                                <Group gap="sm" mb="lg">
                                    <Text size="xl">📊</Text>
                                    <Title order={3} className="text-orange-600">Reports</Title>
                                </Group>
                                <SimpleGrid cols={4} spacing="md">
                                    {reportButtons.map((btn) => (
                                        <DashboardButton
                                            key={btn.key}
                                            label={btn.label}
                                            icon={btn.icon}
                                            variant="report"
                                            onClick={() => handleNavigation(btn.label)}
                                        />
                                    ))}
                                </SimpleGrid>
                            </Card>
                        </Stack>
                    </div>

                    {/* Right Section - Information Panels (Takes 30% width) */}
                    <div className="flex-[3]">
                        <Stack gap="lg">
                            {dashboardLoading ? (
                                <Card shadow="sm" padding="xl" radius="lg" withBorder h={400}>
                                    <Center h="100%">
                                        <Loader size="lg" />
                                    </Center>
                                </Card>
                            ) : (
                                <>
                                    {/* Supplier Advances Panel */}
                                    <SupplierAdvancesList data={supplierAdvances} loading={dashboardLoading} />

                                    {/* Item Stock Panel */}
                                    <ItemStockDisplay data={itemsStock} loading={dashboardLoading} />
                                </>
                            )}
                        </Stack>
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.propTypes = {
    onNavigate: PropTypes.func,
};

export default Dashboard;

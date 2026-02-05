import { useEffect, useCallback } from 'react';
import {
    Title,
    Text,
    Card,
    SimpleGrid,
    Stack,
    Loader,
    Center,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import useStore from '../store';
import { DashboardButton, SupplierAdvancesList, ItemStockDisplay } from '../components';

/**
 * Dashboard Page Component
 * Central navigation hub with quick access buttons and real-time data displays.
 * Implements FR-DASH-001 through FR-DASH-027.
 */
function Dashboard() {
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
        { label: 'Item', icon: '📦', key: 'item' },
    ];

    const transactionButtons = [
        { label: 'Sale', icon: '💵', key: 'sale' },
        { label: 'Search Sale', icon: '🔍', key: 'search-sale' },
        { label: 'Purchase', icon: '✅', key: 'purchase' },
        { label: 'Search Purchase', icon: '🔎', key: 'search-purchase' },
    ];

    const userButtons = [
        { label: 'Customer', icon: '👤', key: 'customer' },
        { label: 'Search Customers', icon: '🔍', key: 'search-customers' },
        { label: 'Supplier', icon: '🏪', key: 'supplier' },
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800 p-4 md:p-6">
            {/* Header */}
            <Card
                shadow="md"
                padding="lg"
                radius="md"
                className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700"
            >
                <Stack gap="xs" align="center">
                    <Title order={1} c="white" className="text-2xl md:text-3xl font-bold">
                        🐟 AL - SHEIKH FISH TRADER AND DISTRIBUTER
                    </Title>
                    <Text c="white" opacity={0.9} size="sm">
                        Shop No. W-644 Gunj Mandi Rawalpindi | +92-3008501724, 051-5534607
                    </Text>
                </Stack>
            </Card>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section - Navigation Buttons */}
                <div className="flex-1 lg:flex-[2]">
                    <Stack gap="lg">
                        {/* Administration Section */}
                        <Card shadow="sm" padding="md" radius="md" withBorder>
                            <Text fw={600} size="lg" mb="sm" className="text-blue-700 dark:text-blue-400">
                                📁 Administration
                            </Text>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
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
                        <Card shadow="sm" padding="md" radius="md" withBorder>
                            <Text fw={600} size="lg" mb="sm" className="text-green-700 dark:text-green-400">
                                💰 Transactions
                            </Text>
                            <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="sm">
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

                        {/* User Management Section */}
                        <Card shadow="sm" padding="md" radius="md" withBorder>
                            <Text fw={600} size="lg" mb="sm" className="text-violet-700 dark:text-violet-400">
                                👥 User Management
                            </Text>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
                                {userButtons.map((btn) => (
                                    <DashboardButton
                                        key={btn.key}
                                        label={btn.label}
                                        icon={btn.icon}
                                        variant="user"
                                        onClick={() => handleNavigation(btn.label)}
                                    />
                                ))}
                            </SimpleGrid>
                        </Card>

                        {/* Reports Section */}
                        <Card shadow="sm" padding="md" radius="md" withBorder>
                            <Text fw={600} size="lg" mb="sm" className="text-orange-600 dark:text-orange-400">
                                📊 Reports
                            </Text>
                            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
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

                {/* Right Section - Information Panels */}
                <div className="flex-1 lg:flex-[1]">
                    <Stack gap="md">
                        {/* Summary Stats */}
                        <Card shadow="sm" padding="md" radius="md" withBorder>
                            <Text fw={600} size="lg" mb="sm" className="text-gray-700 dark:text-gray-200">
                                📈 Quick Summary
                            </Text>
                            {dashboardLoading ? (
                                <Center py="md">
                                    <Loader size="sm" />
                                </Center>
                            ) : (
                                <SimpleGrid cols={2} spacing="xs">
                                    <Card withBorder padding="xs" radius="sm">
                                        <Text size="xs" c="dimmed">
                                            Suppliers
                                        </Text>
                                        <Text fw={700} size="lg">
                                            {dashboardSummary?.suppliers?.count || 0}
                                        </Text>
                                    </Card>
                                    <Card withBorder padding="xs" radius="sm">
                                        <Text size="xs" c="dimmed">
                                            Customers
                                        </Text>
                                        <Text fw={700} size="lg">
                                            {dashboardSummary?.customers?.count || 0}
                                        </Text>
                                    </Card>
                                    <Card withBorder padding="xs" radius="sm">
                                        <Text size="xs" c="dimmed">
                                            Items
                                        </Text>
                                        <Text fw={700} size="lg">
                                            {dashboardSummary?.items?.count || 0}
                                        </Text>
                                    </Card>
                                    <Card withBorder padding="xs" radius="sm">
                                        <Text size="xs" c="dimmed">
                                            Today&apos;s Sales
                                        </Text>
                                        <Text fw={700} size="lg">
                                            {dashboardSummary?.todaySales?.count || 0}
                                        </Text>
                                    </Card>
                                </SimpleGrid>
                            )}
                        </Card>

                        {/* Supplier Advances Panel */}
                        <SupplierAdvancesList data={supplierAdvances} loading={dashboardLoading} />

                        {/* Item Stock Panel */}
                        <ItemStockDisplay data={itemsStock} loading={dashboardLoading} />
                    </Stack>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

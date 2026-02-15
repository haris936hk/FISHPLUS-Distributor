import { useState, useEffect, useCallback } from 'react';
import {
    Paper,
    Stack,
    Group,
    Text,
    Title,
    Select,
    TextInput,
    Button,
    LoadingOverlay,
    Divider,
    Grid,
    Table,
    ActionIcon,
    Checkbox,
    Badge,
    ScrollArea,
    Pagination,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import PropTypes from 'prop-types';
import '@mantine/dates/styles.css';
import { useResizableColumns } from '../hooks/useResizableColumns';

/**
 * PurchaseSearch Component
 * Search and manage existing purchase transactions.
 * Implements FR-PURCHSEARCH-001 through FR-PURCHSEARCH-027.
 *
 * @param {function} onEdit - Callback to edit a purchase
 */
function PurchaseSearch({ onEdit }) {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    // Filters
    const [dateFrom, setDateFrom] = useState(new Date());
    const [dateTo, setDateTo] = useState(new Date());
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [filterByDate, setFilterByDate] = useState(true);
    const [filterBySupplier, setFilterBySupplier] = useState(false);
    const [purchaseNumber, setPurchaseNumber] = useState('');

    // Bulk selection (FR-GRID-006)
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Column resizing (FR-GRID-008)
    const { getResizeProps } = useResizableColumns({
        purchNum: 100, date: 100, supplier: 180,
        vehicle: 100, weight: 100, netAmt: 120, balance: 120, status: 80, actions: 100,
    });

    // Load suppliers on mount
    useEffect(() => {
        const loadSuppliers = async () => {
            try {
                const response = await window.api.suppliers.getAll();
                if (response.success) {
                    setSuppliers(
                        response.data.map((s) => ({
                            value: String(s.id),
                            label: s.name + (s.name_english ? ` (${s.name_english})` : ''),
                        }))
                    );
                }
            } catch (error) {
                console.error('Failed to load suppliers:', error);
            }
        };
        loadSuppliers();
    }, []);

    // Format date for API
    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    // Search purchases
    const handleSearch = useCallback(async () => {
        if (filterByDate && dateFrom > dateTo) {
            notifications.show({
                title: 'Validation Error',
                message: 'Start date cannot be after end date',
                color: 'red',
            });
            return;
        }

        setLoading(true);
        try {
            const filters = {
                dateFrom: formatDate(dateFrom),
                dateTo: formatDate(dateTo),
                filterByDate,
                supplierId: filterBySupplier && selectedSupplier ? parseInt(selectedSupplier) : null,
                filterBySupplier,
                purchaseNumber: purchaseNumber || null,
            };

            const response = await window.api.purchases.search(filters);

            if (response.success) {
                setPurchases(response.data);
                setPage(1);
                if (response.data.length === 0) {
                    notifications.show({
                        title: 'No Results',
                        message: 'No purchases found matching the criteria',
                        color: 'yellow',
                    });
                }
            } else {
                notifications.show({
                    title: 'Error',
                    message: response.error || 'Failed to search purchases',
                    color: 'red',
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to search purchases',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo, filterByDate, selectedSupplier, filterBySupplier, purchaseNumber]);

    // Delete purchase
    const handleDelete = useCallback(
        (purchase) => {
            modals.openConfirmModal({
                title: 'Delete Purchase',
                children: (
                    <Text size="sm">
                        Are you sure you want to delete purchase <strong>{purchase.purchase_number}</strong>?
                        This action cannot be undone. Stock and supplier balance will be restored.
                    </Text>
                ),
                labels: { confirm: 'Delete', cancel: 'Cancel' },
                confirmProps: { color: 'red' },
                onConfirm: async () => {
                    setLoading(true);
                    try {
                        const response = await window.api.purchases.delete(purchase.id);
                        if (response.success) {
                            notifications.show({
                                title: 'Success',
                                message: 'Purchase deleted successfully',
                                color: 'green',
                            });
                            handleSearch();
                        } else {
                            notifications.show({
                                title: 'Error',
                                message: response.error || 'Failed to delete purchase',
                                color: 'red',
                            });
                        }
                    } catch (error) {
                        console.error('Delete error:', error);
                        notifications.show({
                            title: 'Error',
                            message: 'Failed to delete purchase',
                            color: 'red',
                        });
                    } finally {
                        setLoading(false);
                    }
                },
            });
        },
        [handleSearch]
    );

    // Format display date
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <Paper shadow="sm" p="lg" radius="md" withBorder pos="relative">
            <LoadingOverlay visible={loading} />

            <Stack gap="md">
                <Title order={4} className="text-green-700">
                    🔍 Search Purchases (خریداری تلاش)
                </Title>

                <Divider />

                {/* Filters */}
                <Grid align="end">
                    <Grid.Col span={2}>
                        <Checkbox
                            label="Filter by Date"
                            checked={filterByDate}
                            onChange={(e) => setFilterByDate(e.target.checked)}
                        />
                    </Grid.Col>
                    <Grid.Col span={2.5}>
                        <DatePickerInput
                            label="From Date"
                            placeholder="Start date"
                            value={dateFrom}
                            onChange={setDateFrom}
                            maxDate={dateTo || undefined}
                            disabled={!filterByDate}
                        />
                    </Grid.Col>
                    <Grid.Col span={2.5}>
                        <DatePickerInput
                            label="To Date"
                            placeholder="End date"
                            value={dateTo}
                            onChange={setDateTo}
                            minDate={dateFrom || undefined}
                            disabled={!filterByDate}
                        />
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Checkbox
                            label="Filter by Supplier"
                            checked={filterBySupplier}
                            onChange={(e) => setFilterBySupplier(e.target.checked)}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Select
                            label="Supplier"
                            placeholder="Select supplier"
                            data={suppliers}
                            value={selectedSupplier}
                            onChange={setSelectedSupplier}
                            searchable
                            disabled={!filterBySupplier}
                        />
                    </Grid.Col>
                </Grid>

                <Grid align="end">
                    <Grid.Col span={3}>
                        <TextInput
                            label="Purchase #"
                            placeholder="Enter purchase number"
                            value={purchaseNumber}
                            onChange={(e) => setPurchaseNumber(e.target.value)}
                        />
                    </Grid.Col>
                    <Grid.Col span={9}>
                        <Group justify="flex-end">
                            <Button variant="filled" color="green" onClick={handleSearch}>
                                Search
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>

                <Divider />

                {/* Bulk Actions (FR-GRID-006) */}
                {selectedIds.size > 0 && (
                    <Group gap="sm" p="xs" style={{ background: 'var(--mantine-color-green-0)', borderRadius: 8 }}>
                        <Text size="sm" fw={500}>{selectedIds.size} selected</Text>
                        <Button
                            size="xs"
                            variant="light"
                            color="red"
                            onClick={() => {
                                modals.openConfirmModal({
                                    title: 'Delete Selected Purchases',
                                    children: <Text size="sm">Are you sure you want to delete {selectedIds.size} selected purchase(s)?</Text>,
                                    labels: { confirm: 'Delete All', cancel: 'Cancel' },
                                    confirmProps: { color: 'red' },
                                    onConfirm: async () => {
                                        for (const id of selectedIds) {
                                            await window.api.purchases.delete(id);
                                        }
                                        setSelectedIds(new Set());
                                        handleSearch();
                                        notifications.show({ title: 'Deleted', message: `${selectedIds.size} purchase(s) deleted`, color: 'green' });
                                    },
                                });
                            }}
                        >
                            🗑️ Delete Selected
                        </Button>
                        <Button size="xs" variant="subtle" onClick={() => setSelectedIds(new Set())}>
                            Clear Selection
                        </Button>
                    </Group>
                )}

                {/* Results */}
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        Records Found: <strong>{purchases.length}</strong>
                    </Text>
                </Group>

                <ScrollArea h={400}>
                    <Table striped withTableBorder highlightOnHover style={{ tableLayout: 'fixed' }}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: 40 }}>
                                    <Checkbox
                                        checked={purchases.length > 0 && purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).every((p) => selectedIds.has(p.id))}
                                        indeterminate={purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).some((p) => selectedIds.has(p.id)) && !purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).every((p) => selectedIds.has(p.id))}
                                        onChange={(e) => {
                                            const pageIds = purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((p) => p.id);
                                            setSelectedIds((prev) => {
                                                const next = new Set(prev);
                                                pageIds.forEach((id) => e.target.checked ? next.add(id) : next.delete(id));
                                                return next;
                                            });
                                        }}
                                    />
                                </Table.Th>
                                {[['purchNum', 'Purchase #'], ['date', 'Date'], ['supplier', 'Supplier'], ['vehicle', 'Vehicle No'], ['weight', 'Weight (kg)'], ['netAmt', 'Net Amount'], ['balance', 'Balance'], ['status', 'Status'], ['actions', 'Actions']].map(([key, label]) => {
                                    const rp = getResizeProps(key);
                                    return (
                                        <Table.Th key={key} style={{ ...rp.style, textAlign: ['weight', 'netAmt', 'balance'].includes(key) ? 'right' : undefined }}>
                                            {label}
                                            <div {...rp.resizeHandle} />
                                        </Table.Th>
                                    );
                                })}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {purchases.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={9}>
                                        <Text c="dimmed" ta="center" py="xl">
                                            No purchases found. Use the filters above to search.
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((purchase) => (
                                    <Table.Tr key={purchase.id} bg={selectedIds.has(purchase.id) ? 'green.0' : undefined}>
                                        <Table.Td>
                                            <Checkbox
                                                checked={selectedIds.has(purchase.id)}
                                                onChange={(e) => {
                                                    setSelectedIds((prev) => {
                                                        const next = new Set(prev);
                                                        e.target.checked ? next.add(purchase.id) : next.delete(purchase.id);
                                                        return next;
                                                    });
                                                }}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Text fw={500}>{purchase.purchase_number}</Text>
                                        </Table.Td>
                                        <Table.Td>{formatDisplayDate(purchase.purchase_date)}</Table.Td>
                                        <Table.Td>{purchase.supplier_name || '-'}</Table.Td>
                                        <Table.Td>{purchase.vehicle_number || '-'}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            {(purchase.total_weight || 0).toFixed(2)}
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            Rs. {(purchase.net_amount || 0).toFixed(2)}
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Text c={purchase.balance_amount > 0 ? 'red' : 'green'}>
                                                Rs. {(purchase.balance_amount || 0).toFixed(2)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={purchase.status === 'posted' ? 'green' : 'orange'}
                                                variant="light"
                                                size="sm"
                                            >
                                                {purchase.status}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <ActionIcon
                                                    color="blue"
                                                    variant="subtle"
                                                    onClick={() => onEdit?.(purchase)}
                                                    title={purchase.status === 'posted' ? 'Posted purchases cannot be edited' : 'Edit'}
                                                    disabled={purchase.status === 'posted'}
                                                >
                                                    ✏️
                                                </ActionIcon>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => handleDelete(purchase)}
                                                    title={purchase.status === 'posted' ? 'Posted purchases cannot be deleted' : 'Delete'}
                                                    disabled={purchase.status === 'posted'}
                                                >
                                                    🗑️
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                {/* Pagination */}
                {Math.ceil(purchases.length / PAGE_SIZE) > 1 && (
                    <Group justify="center" mt="sm">
                        <Pagination
                            total={Math.ceil(purchases.length / PAGE_SIZE)}
                            value={page}
                            onChange={setPage}
                            size="sm"
                        />
                    </Group>
                )}
            </Stack>
        </Paper>
    );
}

PurchaseSearch.propTypes = {
    onEdit: PropTypes.func,
};

export default PurchaseSearch;

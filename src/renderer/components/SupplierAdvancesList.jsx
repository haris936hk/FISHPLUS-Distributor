import { Card, Table, Text, Stack, ScrollArea, Loader, Center } from '@mantine/core';
import PropTypes from 'prop-types';

/**
 * SupplierAdvancesList Component
 * Displays a list of suppliers with their outstanding advance amounts.
 * Supports Urdu names and RTL text direction.
 *
 * @param {Array} data - Array of supplier objects with name, advance_amount
 * @param {boolean} loading - Loading state
 * @param {function} onRefresh - Optional callback to refresh data
 */
// eslint-disable-next-line no-unused-vars
function SupplierAdvancesList({ data = [], loading = false, onRefresh }) {
    // Format currency with 2 decimal places
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <Card shadow="sm" padding="md" radius="md" withBorder h={300}>
                <Center h="100%">
                    <Loader size="lg" />
                </Center>
            </Card>
        );
    }

    return (
        <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="xs">
                <Text fw={600} size="lg" className="text-gray-700 dark:text-gray-200">
                    📋 Supplier Advances
                </Text>
                <Text size="sm" c="dimmed">
                    Suppliers with outstanding advance amounts
                </Text>

                <ScrollArea h={220} type="auto">
                    {data.length === 0 ? (
                        <Center py="xl">
                            <Text c="dimmed" size="sm">
                                No supplier advances found
                            </Text>
                        </Center>
                    ) : (
                        <Table striped highlightOnHover withTableBorder>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ textAlign: 'right' }}>Supplier Name</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>Advance Amount</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.map((supplier) => (
                                    <Table.Tr key={supplier.id}>
                                        <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>
                                            <Text fw={500}>{supplier.name}</Text>
                                            {supplier.name_english && (
                                                <Text size="xs" c="dimmed" style={{ direction: 'ltr' }}>
                                                    {supplier.name_english}
                                                </Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Text fw={600} c="blue">
                                                Rs. {formatAmount(supplier.advance_amount)}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </ScrollArea>
            </Stack>
        </Card>
    );
}

SupplierAdvancesList.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            name_english: PropTypes.string,
            advance_amount: PropTypes.number.isRequired,
        })
    ),
    loading: PropTypes.bool,
    onRefresh: PropTypes.func,
};

export default SupplierAdvancesList;

import { useState, useEffect, useCallback } from 'react';
import {
    Stack,
    Grid,
    Select,
    Button,
    Table,
    LoadingOverlay,
    Text,
    ScrollArea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { ReportViewer } from '../ReportViewer';

/**
 * Vendor Stock Bill Report (بیوپاری سٹاک بل)
 * Shows stock-sourced items for a supplier on a given date.
 * Matches original system: date picker + supplier dropdown → table with
 * columns: سیریل نمبر, گاہک, قسم, ریٹ (kg), وزن (kg), رقم
 */
export function VendorStockBillReport() {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [date, setDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);

    // Fetch suppliers for dropdown
    useEffect(() => {
        const fetchSuppliers = async () => {
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
                console.error('Error fetching suppliers:', error);
            }
        };
        fetchSuppliers();
    }, []);

    const formatDate = (d) => d.toISOString().split('T')[0];

    const formatNumber = (num) =>
        (num || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formatWeight = (num) =>
        (num || 0).toLocaleString('en-US', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        });

    const handleGenerate = useCallback(async () => {
        if (!selectedSupplier) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please select a vendor',
                color: 'red',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await window.api.reports.getVendorStockBill({
                supplierId: parseInt(selectedSupplier),
                date: formatDate(date),
            });

            if (response.success) {
                setReportData(response.data);
            } else {
                notifications.show({
                    title: 'Error',
                    message: response.error || 'Failed to generate report',
                    color: 'red',
                });
            }
        } catch (error) {
            console.error('Error generating report:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to generate report',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    }, [selectedSupplier, date]);

    return (
        <Stack gap="md" pos="relative">
            <LoadingOverlay visible={loading} />

            {/* Filters */}
            <Grid align="flex-end">
                <Grid.Col span={4}>
                    <DatePickerInput
                        label="تاریخ (Date)"
                        value={date}
                        onChange={setDate}
                        maxDate={new Date()}
                        required
                    />
                </Grid.Col>
                <Grid.Col span={5}>
                    <Select
                        label="بیوپاری (Vendor)"
                        placeholder="Select vendor"
                        data={suppliers}
                        value={selectedSupplier}
                        onChange={setSelectedSupplier}
                        searchable
                        required
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <Button leftSection={<IconSearch size={16} />} onClick={handleGenerate} fullWidth>
                        Go
                    </Button>
                </Grid.Col>
            </Grid>

            {/* Report Display */}
            {reportData && (
                <ReportViewer
                    title="Vendor Stock Bill"
                    titleUrdu="بیوپاری سٹاک بل"
                    dateRange={{ from: formatDate(date), to: formatDate(date) }}
                >
                    <ScrollArea>
                        <Table striped highlightOnHover withTableBorder withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ textAlign: 'center' }}>سیریل نمبر<br />#</Table.Th>
                                    <Table.Th>گاہک<br />Customer</Table.Th>
                                    <Table.Th>قسم<br />Item</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>ریٹ (kg)<br />Rate</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>وزن (kg)<br />Weight</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>رقم<br />Amount</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {reportData.items.map((item, index) => (
                                    <Table.Tr key={item.id}>
                                        <Table.Td style={{ textAlign: 'center' }}>{index + 1}</Table.Td>
                                        <Table.Td>{item.customer_name}</Table.Td>
                                        <Table.Td>{item.item_name}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>{formatNumber(item.rate)}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>{formatWeight(item.weight)}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>{formatNumber(item.amount)}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                            <Table.Tfoot>
                                <Table.Tr style={{ fontWeight: 'bold', backgroundColor: '#d0e0f0' }}>
                                    <Table.Td colSpan={3} style={{ textAlign: 'right' }}>
                                        <strong>ٹوٹل (Total)</strong>
                                    </Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <strong>{formatWeight(reportData.totalWeight)}</strong>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <strong>{formatNumber(reportData.totalAmount)}</strong>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tfoot>
                        </Table>

                        {reportData.items.length === 0 && (
                            <Text c="dimmed" ta="center" py="xl">
                                No stock items found for the selected criteria
                            </Text>
                        )}
                    </ScrollArea>
                </ReportViewer>
            )}
        </Stack>
    );
}

export default VendorStockBillReport;
